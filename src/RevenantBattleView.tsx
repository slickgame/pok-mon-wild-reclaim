import { useEffect, useId, useRef, useState } from "react";
import { Check, ChevronRight, Circle, HeartPulse } from "lucide-react";
import { BattleCommandBar, BattleCommands, BattleIcon, BattleMoves, BattleTile, type BattleMode } from "./BattleCommandBar";
import { PokemonSprite } from "./PokemonSprite";
import type { OutingState } from "./outing";
import { levelOf, species } from "./pokemonData";
import {
  canPlanRevenantCommand, ORAN_BERRY_HEAL, REVENANT_HEAL_MULTIPLIER, REVENANT_NAME,
  revenantActive, revenantBattleReady, revenantBossMoves, revenantItemTargets, revenantMoves,
  revenantReplacements, revenantReserves,
  type RevenantAction, type RevenantBattleState, type RevenantCommand,
} from "./revenantBattle";
import "./revenantBattle.css";

type BattleProps = {
  battle: RevenantBattleState;
  moveOrderById?: OutingState["moveOrderById"];
  onAction: (action: RevenantAction) => void;
  onReturn: () => void;
  onVisitClinic: () => void;
};

function Health({ name, hp, maxHp, boss = false }: {
  name: string;
  hp: number;
  maxHp: number;
  boss?: boolean;
}) {
  return <span className="revenant-health" data-low={hp <= maxHp / 3}>
    <progress aria-label={`${name} HP`} max={maxHp} value={hp} />
    {!boss && <span>{hp}/{maxHp}</span>}
  </span>;
}

function Telegraph({ targets }: { targets: readonly number[] }) {
  const marker = useId();
  const routes = [
    "M 500 17 Q 389 17 262 116",
    "M 500 19 Q 540 62 500 116",
    "M 500 17 Q 611 17 738 116",
  ];
  if (!targets.length) return null;

  return <svg className="revenant-telegraph" aria-hidden="true" viewBox="0 0 1000 135" preserveAspectRatio="none">
    <defs>
      <marker id={marker} viewBox="0 0 8 8" refX="7" refY="4" markerWidth="6" markerHeight="6" orient="auto">
        <path d="M 0 0 L 8 4 L 0 8 L 2 4 Z" fill="currentColor" />
      </marker>
    </defs>
    {targets.map((slot) => <path key={slot} d={routes[slot]} stroke="currentColor" strokeWidth="3" fill="none"
      strokeDasharray="9 5" markerEnd={`url(#${marker})`} vectorEffect="non-scaling-stroke" />)}
  </svg>;
}

function planName(battle: RevenantBattleState, id: number) {
  const plan = battle.plans[id];
  const actor = battle.player.team.find((member) => member.id === id);
  if (!plan || !actor) return "";
  if (plan.type === "move") return revenantMoves(actor.species)[plan.move].name;
  const targetId = plan.type === "switch" ? plan.withId : plan.targetId;
  const target = battle.player.team.find((member) => member.id === targetId);
  const name = target && species[target.species].name;
  return plan.type === "switch" ? `Switch to ${name ?? "reserve"}` : `Oran Berry → ${name ?? "ally"}`;
}

export function RevenantBattleView({ battle, moveOrderById, onAction, onReturn, onVisitClinic }: BattleProps) {
  const [mode, setMode] = useState<BattleMode>("command");
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const focusNext = useRef(false);
  const selectedPreview = useRef<HTMLHeadingElement>(null);
  const active = revenantActive(battle);
  const reserves = revenantReserves(battle);
  const actor = active.find(({ id }) => id === selectedId) ?? active.find(({ id }) => !battle.plans[id]) ?? active[0];
  const actorName = actor && species[actor.species].name;
  const replacements = revenantReplacements(battle);
  const replacing = replacements[0];
  const ready = revenantBattleReady(battle);
  const activeBattle = battle.outcome === "active";
  const move = revenantBossMoves[battle.intent.move];
  const aimedAt = activeBattle ? battle.intent.targetSlots : [];
  const targetNames = aimedAt.flatMap((slot) => {
    const target = battle.player.team.find(({ id }) => id === battle.player.active[slot]);
    return target ? [species[target.species].name] : [];
  });
  const selectedPlan = actor && planName(battle, actor.id);
  const queued = active.filter(({ id }) => !!battle.plans[id]).length;

  useEffect(() => {
    if (!focusNext.current) return;
    focusNext.current = false;
    selectedPreview.current?.focus({ preventScroll: true });
  }, [mode, selectedId, battle.round, battle.outcome, replacing]);

  function showMode(next: BattleMode) {
    focusNext.current = true;
    setMode(next);
  }

  function queue(command: RevenantCommand) {
    if (!actor || !canPlanRevenantCommand(battle, actor.id, command)) return;
    onAction({ type: "plan", actorId: actor.id, command });
    setSelectedId(active.find(({ id }) => id !== actor.id && !battle.plans[id])?.id ?? actor.id);
    showMode("command");
  }

  function resolveRound() {
    if (!ready) return;
    focusNext.current = true;
    setSelectedId(null);
    setMode("command");
    onAction({ type: "resolve" });
  }

  function chooseActor(id: number) {
    focusNext.current = true;
    setSelectedId(id);
    setMode("command");
  }

  const heading = !activeBattle
    ? battle.outcome === "won" ? "Brambleberry Grove reached Stage 1" : "Your team fainted"
    : replacing !== undefined ? "Send in a healthy Pokémon"
      : mode === "command" ? "Choose a command"
        : `${mode[0].toUpperCase() + mode.slice(1)} · ${actorName}`;

  return <main className="revenant-battle" aria-labelledby="grove-name" onKeyDown={(event) => {
    if (event.key === "Escape" && mode !== "command") {
      event.preventDefault();
      showMode("command");
    }
  }}>
    <section className="revenant-stage" aria-label="Brambleberry Grove battlefield" data-outcome={battle.outcome}>
      <header className="revenant-header">
        <h1 id="grove-name" tabIndex={-1}>Strange Spores</h1>
      </header>

      {activeBattle && <span className="revenant-round">Round {battle.round}</span>}
      <details className="revenant-log">
        <summary>Battle log</summary>
        <ol>{battle.log.slice(-8).map((record, index) => <li key={index}>{record}</li>)}</ol>
      </details>

      <div className="revenant-boss">
        <div className="revenant-boss-plaque">
          <h2>{REVENANT_NAME} <span>· Lv. {battle.boss.level}</span></h2>
          <Health name={REVENANT_NAME} hp={battle.boss.hp} maxHp={battle.boss.maxHp} boss />
        </div>
        {activeBattle && <p className="revenant-intent" title={targetNames.length ? `Targets ${targetNames.join(", ")}` : undefined}>
          <BattleIcon icon="spore-sigil" />
          <span>{move.name}</span>
        </p>}
      </div>

      <div className="revenant-boss-field" data-fainted={battle.boss.hp === 0}>
        <div className="revenant-boss-aura" aria-hidden="true" />
        <PokemonSprite speciesId="paras" className="revenant-boss-sprite" />
      </div>
      <Telegraph targets={aimedAt} />

      <ol className="revenant-lineup" aria-label="Active Pokémon">
        {battle.player.active.map((id, slot) => {
          const ally = battle.player.team.find((member) => member.id === id);
          const targeted = aimedAt.some((target) => target === slot);
          const selected = !!ally && ally.id === actor?.id && activeBattle && replacing === undefined;
          const plan = ally && planName(battle, ally.id);
          const name = ally ? species[ally.species].name : "Empty position";
          const disabled = !ally || ally.hp === 0 || !activeBattle || replacing !== undefined;
          return <li key={slot} className="revenant-ally" data-targeted={targeted} data-selected={selected}
            data-vacant={!ally || ally.hp === 0}>
            <div className="revenant-ally-field" aria-hidden="true">
              <div className="revenant-ally-ring" />
              {ally && <PokemonSprite speciesId={ally.species} className="revenant-ally-sprite" />}
            </div>
            <button className="revenant-ally-plaque" type="button" onClick={() => ally && chooseActor(ally.id)}
              disabled={disabled} aria-label={`Choose ${name}`} aria-pressed={selected}
              title={targeted ? `Targeted by ${move.name}` : undefined}>
              <span className="revenant-ally-name">{name}{plan && <Check aria-hidden="true" />}</span>
              {ally ? <Health name={name} hp={ally.hp} maxHp={ally.maxHp} /> : <Circle aria-hidden="true" />}
            </button>
            {(plan || ally?.conditions.paralyzed) && <span className="revenant-queued">
              {[ally?.conditions.paralyzed ? "Paralyzed" : "", plan].filter(Boolean).join(" · ")}
            </span>}
          </li>;
        })}
      </ol>
    </section>

    <BattleCommandBar heading={heading} headingRef={selectedPreview}
      status={activeBattle ? `${queued} / ${active.length} queued` : undefined}
      onBack={mode !== "command" && activeBattle && replacing === undefined ? () => showMode("command") : undefined}>
      {!activeBattle ? <div className="battle-command-options battle-command-options--result">
        <p role="status">{battle.outcome === "won"
          ? "The spores settle. Return to Brookbend and tell Professor Maple."
          : "Recover at the Brookbend Clinic, then return to investigate the spores again."}</p>
        <button type="button" className="battle-command-resolve" onClick={battle.outcome === "won" ? onReturn : onVisitClinic}>
          {battle.outcome === "won" ? <>Return to Grove <ChevronRight aria-hidden="true" /></> : <><HeartPulse aria-hidden="true" /> Visit the Clinic</>}
        </button>
      </div> : replacing !== undefined ? <div className="battle-command-options">
        {reserves.map((reserve) => <BattleTile key={reserve.id} icon="switch" onClick={() => {
          focusNext.current = true;
          onAction({ type: "replace", slot: replacing, withId: reserve.id });
        }}>{species[reserve.species].name} · Lv. {levelOf(reserve)}</BattleTile>)}
      </div> : mode === "command" ? <BattleCommands onChoose={showMode} resolve={{ disabled: !ready, onClick: resolveRound }} />
        : mode === "fight" && actor ? <BattleMoves moves={revenantMoves(actor.species)} order={moveOrderById?.[actor.id]}
          onChoose={(slot) => queue({ type: "move", move: slot })}
          disabled={(slot) => !canPlanRevenantCommand(battle, actor.id, { type: "move", move: slot })} /> : mode === "items" && actor ? <>
        <p className="battle-command-hint">Oran Berry ×{battle.oranBerries} · Heals up to {ORAN_BERRY_HEAL * REVENANT_HEAL_MULTIPLIER} HP here.</p>
        <div className="battle-command-options">
          {revenantItemTargets(battle).map((target) => {
            const command = { type: "item", item: "oranBerry", targetId: target.id } as const;
            return <BattleTile key={target.id} icon="items" onClick={() => queue(command)}
              disabled={!canPlanRevenantCommand(battle, actor.id, command)}>{species[target.species].name}</BattleTile>;
          })}
        </div>
        {battle.oranBerries === 0 && <p className="battle-command-hint">Your Bag has no Oran Berries.</p>}
        {battle.oranBerries > 0 && revenantItemTargets(battle).length === 0 && <p className="battle-command-hint">No conscious active Pokémon needs healing.</p>}
      </> : mode === "switch" && actor ? <div className="battle-command-options">
        {reserves.length ? reserves.map((reserve) => {
          const command = { type: "switch", withId: reserve.id } as const;
          return <BattleTile key={reserve.id} icon="switch" onClick={() => queue(command)}
            disabled={!canPlanRevenantCommand(battle, actor.id, command)}>{species[reserve.species].name}</BattleTile>;
        }) : <p className="battle-command-hint">No healthy reserve Pokémon is available.</p>}
      </div> : <div className="battle-command-inspect">
        <p><strong>{REVENANT_NAME}</strong> · Bug / Grass · {battle.boss.hp}/{battle.boss.maxHp} HP</p>
        <p><strong>{move.name}</strong>{targetNames.length ? ` targets ${targetNames.join(" and ")}.` : " is the next boss move."}</p>
        <p>{battle.frenzy > 0 ? `Frenzy phase ${battle.frenzy} · ` : ""}The spores halve allied healing.</p>
      </div>}

      {activeBattle && replacing === undefined && mode === "command" && selectedPlan && actor && <div className="battle-command-order">
        <span>{actorName} · {selectedPlan}</span>
        <button type="button" onClick={() => onAction({ type: "clear", actorId: actor.id })}>Clear order</button>
      </div>}
    </BattleCommandBar>
  </main>;
}

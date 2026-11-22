import { useEffect, useId, useRef, useState, type ReactNode } from "react";
import { ArrowLeft, Check, ChevronRight, Circle, HeartPulse } from "lucide-react";
import { PokemonSprite } from "./PokemonSprite";
import { levelOf, moveDescription, species, type SpeciesMove } from "./pokemonData";
import {
  canPlanRevenantCommand, ORAN_BERRY_HEAL, REVENANT_HEAL_MULTIPLIER, REVENANT_NAME,
  revenantActive, revenantBattleReady, revenantBossMoves, revenantItemTargets, revenantMoves,
  revenantReplacements, revenantReserves,
  type RevenantAction, type RevenantBattleState, type RevenantCommand,
} from "./revenantBattle";
import "./revenantBattle.css";

type BattleProps = {
  battle: RevenantBattleState;
  onAction: (action: RevenantAction) => void;
  onReturn: () => void;
  onVisitClinic: () => void;
};

type Mode = "command" | "fight" | "items" | "switch" | "inspect";
const commands = [
  { label: "Fight", mode: "fight" },
  { label: "Items", mode: "items" },
  { label: "Switch", mode: "switch" },
  { label: "Inspect", mode: "inspect" },
] as const;

const moveIcons: Record<string, string> = {
  Ember: "ember",
  Scratch: "scratch",
  Smokescreen: "smokescreen",
  Growl: "growl",
};

function ArtIcon({ icon }: { icon: string }) {
  return <img className="revenant-control-icon" src={`/art/strange-spores/${icon}.webp`} alt="" width="64" height="64" />;
}

function Tile({ children, icon, onClick, disabled, title }: {
  children: ReactNode;
  icon?: string;
  onClick: () => void;
  disabled?: boolean;
  title?: string;
}) {
  return <button className="revenant-tile" type="button" onClick={onClick} disabled={disabled} title={title}>
    {icon && <ArtIcon icon={icon} />}
    <span>{children}</span>
  </button>;
}

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

function moveDetail(move: SpeciesMove) {
  return `${move.type} · ${move.category} · ${moveDescription(move)}`;
}

export function RevenantBattleView({ battle, onAction, onReturn, onVisitClinic }: BattleProps) {
  const [mode, setMode] = useState<Mode>("command");
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

  function showMode(next: Mode) {
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
        : `${commands.find((command) => command.mode === mode)?.label} · ${actorName}`;

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
          <ArtIcon icon="spore-sigil" />
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

    <section className="revenant-command-bar" aria-label="Battle commands" data-mode={mode}>
      <header className="revenant-command-heading">
        {mode !== "command" && activeBattle && replacing === undefined && <button
          type="button" className="revenant-back" onClick={() => showMode("command")}><ArrowLeft aria-hidden="true" /> Back</button>}
        <h2 ref={selectedPreview} tabIndex={-1}>{heading}</h2>
        {activeBattle && <span className="revenant-round-progress" aria-live="polite">{queued} / {active.length} queued</span>}
      </header>

      {!activeBattle ? <div className="revenant-command-options revenant-command-options--result">
        <p role="status">{battle.outcome === "won"
          ? "The spores settle. Return to Brookbend and tell Professor Maple."
          : "Recover at the Brookbend Clinic, then return to investigate the spores again."}</p>
        <button type="button" className="revenant-resolve" onClick={battle.outcome === "won" ? onReturn : onVisitClinic}>
          {battle.outcome === "won" ? <>Return to Grove <ChevronRight aria-hidden="true" /></> : <><HeartPulse aria-hidden="true" /> Visit the Clinic</>}
        </button>
      </div> : replacing !== undefined ? <div className="revenant-command-options">
        {reserves.map((reserve) => <Tile key={reserve.id} icon="switch" onClick={() => {
          focusNext.current = true;
          onAction({ type: "replace", slot: replacing, withId: reserve.id });
        }}>{species[reserve.species].name} · Lv. {levelOf(reserve)}</Tile>)}
      </div> : mode === "command" ? <div className="revenant-command-options revenant-command-options--main">
        {commands.map(({ label, mode: destination }) => <Tile key={destination} icon={destination}
          onClick={() => showMode(destination)}>{label}</Tile>)}
        <button type="button" className="revenant-resolve" disabled={!ready} onClick={resolveRound}>Resolve round</button>
      </div> : mode === "fight" && actor ? <div className="revenant-command-options">
        {revenantMoves(actor.species).map((attack, index) => {
          const command = { type: "move", move: index as 0 | 1 | 2 | 3 } as const;
          return <Tile key={attack.name} icon={moveIcons[attack.name] ?? "fight"}
            title={moveDetail(attack)} onClick={() => queue(command)}
            disabled={!canPlanRevenantCommand(battle, actor.id, command)}>{attack.name}</Tile>;
        })}
      </div> : mode === "items" && actor ? <>
        <p className="revenant-hint">Oran Berry ×{battle.oranBerries} · Heals up to {ORAN_BERRY_HEAL * REVENANT_HEAL_MULTIPLIER} HP here.</p>
        <div className="revenant-command-options">
          {revenantItemTargets(battle).map((target) => {
            const command = { type: "item", item: "oranBerry", targetId: target.id } as const;
            return <Tile key={target.id} icon="items" onClick={() => queue(command)}
              disabled={!canPlanRevenantCommand(battle, actor.id, command)}>{species[target.species].name}</Tile>;
          })}
        </div>
        {battle.oranBerries === 0 && <p className="revenant-hint">Your Bag has no Oran Berries.</p>}
        {battle.oranBerries > 0 && revenantItemTargets(battle).length === 0 && <p className="revenant-hint">No conscious active Pokémon needs healing.</p>}
      </> : mode === "switch" && actor ? <div className="revenant-command-options">
        {reserves.length ? reserves.map((reserve) => {
          const command = { type: "switch", withId: reserve.id } as const;
          return <Tile key={reserve.id} icon="switch" onClick={() => queue(command)}
            disabled={!canPlanRevenantCommand(battle, actor.id, command)}>{species[reserve.species].name}</Tile>;
        }) : <p className="revenant-hint">No healthy reserve Pokémon is available.</p>}
      </div> : <div className="revenant-inspect">
        <p><strong>{REVENANT_NAME}</strong> · Bug / Grass · {battle.boss.hp}/{battle.boss.maxHp} HP</p>
        <p><strong>{move.name}</strong>{targetNames.length ? ` targets ${targetNames.join(" and ")}.` : " is the next boss move."}</p>
        <p>{battle.frenzy > 0 ? `Frenzy phase ${battle.frenzy} · ` : ""}The spores halve allied healing.</p>
      </div>}

      {activeBattle && replacing === undefined && mode === "command" && selectedPlan && actor && <div className="revenant-order">
        <span>{actorName} · {selectedPlan}</span>
        <button type="button" onClick={() => onAction({ type: "clear", actorId: actor.id })}>Clear order</button>
      </div>}
    </section>
  </main>;
}

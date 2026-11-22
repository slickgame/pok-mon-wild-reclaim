import { useEffect, useRef, useState, type ReactNode } from "react";
import { Circle } from "lucide-react";
import { BattleCommandBar, BattleCommands, BattleMoves, BattleTile, type BattleMode } from "./BattleCommandBar";
import { moveTargetsSelf, ORAN_BERRY_HEAL, typeMultiplier } from "./battleRules";
import { PokemonSprite } from "./PokemonSprite";
import { battleMoves, moveDescription, species, type BattleMoveSlot, type SpeciesMove } from "./pokemonData";
import {
  battlePositions, canPlanTrainerCommand, trainerBattleReady, trainerItemTargets, trainerMoveTargets, trainerProfiles, trainerReplacements, trainerReserves,
  type BattleMon, type TrainerAction, type TrainerBattleState, type TrainerCommand,
} from "./trainerBattle";
import "./trainerBattle.css";

type TrainerBattleViewProps = {
  battle: TrainerBattleState;
  onAction: (action: TrainerAction) => void;
  onReturn: () => void;
  onVisitClinic?: () => void;
  toolbar?: ReactNode;
};

type ReplacementSlot = ReturnType<typeof trainerReplacements>[number];

type FormationSlotProps = {
  position: string;
  pokemon?: BattleMon;
  enemy?: boolean;
  selected?: boolean;
  annotation?: string;
  action?: { label: string; onClick: () => void; actorId?: number; targetId?: number };
};

function FighterVitals({ pokemon }: { pokemon: BattleMon }) {
  const name = species[pokemon.species].name;
  const { accuracy, defense, attack, speed, paralyzed, seededBy } = pokemon.conditions;
  const effects = [
    accuracy < 0 && `Accuracy ${accuracy}`,
    defense !== 0 && `Defense ${defense > 0 ? "+" : ""}${defense}`,
    !!attack && `Attack ${attack}`,
    !!speed && `Speed ${speed}`,
    paralyzed && "Paralyzed",
    seededBy != null && "Seeded",
  ].filter(Boolean);

  return <>
    <div className="trainer-hp" data-low={pokemon.hp <= pokemon.maxHp / 3}>
      <progress aria-label={`${name} HP`} max={pokemon.maxHp} value={pokemon.hp} />
      <span>{pokemon.hp}/{pokemon.maxHp} HP</span>
    </div>
    {effects.length > 0 && <div className="trainer-effects" aria-label="Active effects">
      {effects.map((effect) => <span key={String(effect)}>{effect}</span>)}
    </div>}
  </>;
}

function FormationSlot({ position, pokemon, enemy, selected, annotation, action }: FormationSlotProps) {
  const details = pokemon && species[pokemon.species];
  const fainted = pokemon?.hp === 0;

  return <li className="trainer-slot" data-enemy={enemy || undefined} data-selected={selected || undefined}
    data-fainted={fainted || undefined} data-actionable={!!action || undefined} data-empty={!pokemon || undefined}>
    <div className="trainer-slot-position"><span>{position}</span></div>
    {pokemon && details ? <>
      <div className="trainer-slot-identity">
        <div className="trainer-slot-portrait">
          <PokemonSprite speciesId={pokemon.species} className="trainer-slot-sprite" />
        </div>
        <div>
          <h3>{details.name}</h3>
          <p>Lv. {pokemon.level} · {details.kind}</p>
        </div>
      </div>
      <FighterVitals pokemon={pokemon} />
      {fainted && <p className="trainer-slot-note trainer-slot-note--fainted">Fainted</p>}
    </> : <div className="trainer-slot-empty"><Circle aria-hidden="true" /><span>Empty slot</span></div>}
    {annotation && <p className="trainer-slot-note">{annotation}</p>}
    {action && <button
      type="button"
      className="trainer-slot-trigger"
      aria-label={action.label}
      aria-pressed={enemy ? undefined : !!selected}
      data-trainer-actor={action.actorId}
      data-trainer-target={action.targetId}
      onClick={action.onClick}
    />}
  </li>;
}

function describeMatchup(move: SpeciesMove, pokemon: BattleMon) {
  if (move.effect === "seed" && species[pokemon.species].types.includes("Grass")) return "Immune to Leech Seed";
  if (move.power === 0) return moveDescription(move);
  const multiplier = typeMultiplier(move.type, species[pokemon.species].types);
  if (multiplier === 0) return "Immune to this move";
  if (multiplier > 1) return `Super effective · ${multiplier}×`;
  if (multiplier < 1) return `Resisted · ${multiplier}×`;
  return "Neutral damage";
}

function describeCommand(battle: TrainerBattleState, pokemon: BattleMon, command: TrainerCommand) {
  if (command.type === "switch") {
    const replacement = battle.player.team.find(({ id }) => id === command.withId);
    return replacement ? `Switch to ${species[replacement.species].name}` : "Switch";
  }
  if (command.type === "item") {
    const target = battle.player.team.find(({ id }) => id === command.targetId);
    return target ? `Oran Berry → ${species[target.species].name}` : "Oran Berry";
  }
  const move = battleMoves(pokemon.species)[command.move];
  const target = battle.enemy.team.find(({ id }) => id === command.targetId);
  const label = move?.name ?? "Move";
  return target ? `${label} → ${species[target.species].name}` : label;
}

export function TrainerBattleView({ battle, onAction, onReturn, onVisitClinic, toolbar }: TrainerBattleViewProps) {
  const trainer = trainerProfiles[battle.trainerId];
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [selectedReplacement, setSelectedReplacement] = useState<ReplacementSlot | null>(null);
  const [mode, setMode] = useState<BattleMode>("command");
  const [pendingMove, setPendingMove] = useState<BattleMoveSlot | null>(null);
  const battlefield = useRef<HTMLElement>(null);
  const controls = useRef<HTMLDivElement>(null);
  const resolution = useRef<HTMLButtonElement>(null);
  const resultHeading = useRef<HTMLHeadingElement>(null);
  const recentLog = useRef<HTMLOListElement>(null);
  const previousLineup = useRef([...battle.player.active]);
  const active = battle.player.active
    .map((id) => battle.player.team.find((pokemon) => pokemon.id === id))
    .filter((pokemon): pokemon is BattleMon => pokemon !== undefined && pokemon.hp > 0);
  const replacementSlots = battle.outcome === "active" ? trainerReplacements(battle) : [];
  const replacementSlot = selectedReplacement !== null && replacementSlots.includes(selectedReplacement)
    ? selectedReplacement : replacementSlots[0];
  const replacing = replacementSlot !== undefined;
  const actor = active.find(({ id }) => id === selectedId) ?? active.find(({ id }) => !battle.plans[id]) ?? active[0];
  const actorName = actor && species[actor.species].name;
  const selectedPlan = actor && battle.plans[actor.id];
  const chosenMove = pendingMove !== null && actor ? battleMoves(actor.species)[pendingMove] : undefined;
  const targetIds = pendingMove !== null && actor ? trainerMoveTargets(battle, actor.id, pendingMove) : [];
  const choosingTarget = !!chosenMove && targetIds.length > 0 && !replacing && battle.outcome === "active";
  const reserves = trainerReserves(battle);
  const queued = active.filter(({ id }) => !!battle.plans[id]).length;
  const ready = battle.outcome === "active" && trainerBattleReady(battle);

  useEffect(() => {
    if (battle.outcome !== "active") resultHeading.current?.focus({ preventScroll: true });
  }, [battle.outcome]);

  useEffect(() => {
    const log = recentLog.current;
    if (log) log.scrollTop = log.scrollHeight;
  }, [battle.log]);

  useEffect(() => {
    battle.player.active.forEach((id, slot) => {
      if (id !== null) previousLineup.current[slot] = id;
    });
  }, [battle.player.active]);

  function focusBattlefield(selector: string) {
    window.requestAnimationFrame(() => {
      const button = battlefield.current?.querySelector<HTMLButtonElement>(selector);
      button?.focus({ preventScroll: true });
      button?.scrollIntoView({ block: "nearest", inline: "nearest" });
    });
  }

  function selectActor(id: number) {
    setSelectedId(id);
    setPendingMove(null);
    setMode("command");
  }

  function queue(command: TrainerCommand) {
    if (!actor || !canPlanTrainerCommand(battle, actor.id, command)) return;
    onAction({ type: "plan", actorId: actor.id, command });
    setPendingMove(null);
    setMode("command");
    const next = active.find(({ id }) => id !== actor.id && !battle.plans[id]);
    if (next) setSelectedId(next.id);
    if (next) {
      focusBattlefield(`[data-trainer-actor="${next.id}"]`);
    } else {
      window.requestAnimationFrame(() => {
        resolution.current?.focus({ preventScroll: true });
        resolution.current?.scrollIntoView({ block: "nearest", inline: "nearest" });
      });
    }
  }

  function selectMove(id: BattleMoveSlot, move: SpeciesMove) {
    if (!actor) return;
    if (moveTargetsSelf(move)) {
      queue({ type: "move", move: id, targetId: null });
      return;
    }
    const targets = trainerMoveTargets(battle, actor.id, id);
    if (!targets.length) return;
    setPendingMove(id);
    focusBattlefield(`[data-trainer-target="${targets[0]}"]`);
  }

  function cancelTarget() {
    const move = pendingMove;
    setPendingMove(null);
    window.requestAnimationFrame(() => {
      const button = controls.current?.querySelector<HTMLButtonElement>(`[data-battle-move="${move}"]`);
      button?.focus({ preventScroll: true });
      button?.scrollIntoView({ block: "nearest", inline: "nearest" });
    });
  }

  function resolve() {
    onAction({ type: "resolve" });
    setSelectedId(null);
    setSelectedReplacement(null);
    setPendingMove(null);
    setMode("command");
  }

  function showMode(next: BattleMode) {
    setMode(next);
    window.requestAnimationFrame(() => {
      controls.current?.querySelector<HTMLHeadingElement>("h2")?.focus({ preventScroll: true });
    });
  }

  const activeBattle = battle.outcome === "active";
  const heading = !activeBattle ? battle.outcome === "won" ? "Battle won" : "Battle lost"
    : replacing ? `Replace ${battlePositions[replacementSlot]} slot`
      : choosingTarget ? `Target for ${chosenMove.name}`
        : mode === "command" ? "Choose a command" : `${mode[0].toUpperCase() + mode.slice(1)} · ${actorName}`;

  return <main className="town trainer-battle" aria-labelledby="grove-name" onKeyDown={(event) => {
    if (event.key === "Escape" && !event.defaultPrevented && !document.querySelector("dialog[open]") && mode !== "command") {
      event.preventDefault();
      if (choosingTarget) cancelTarget();
      else showMode("command");
    }
  }}>
    <img className="trainer-battle-scenery" src="/art/brambleberry-grove.webp" alt="" width="1672" height="941"
      fetchPriority="high" />
    <header className="trainer-battle-header">
      <div className="trainer-battle-heading">
        <p>Brambleberry Grove</p>
        <h1 id="grove-name" tabIndex={-1}>{trainer.name}</h1>
      </div>
      {toolbar}
    </header>

    <div className="trainer-battle-layout">
      <section ref={battlefield} className="trainer-battlefield" aria-label="Battlefield">
        <section className="trainer-formation" aria-labelledby="opposing-formation">
          <header><h2 id="opposing-formation">Opposing team</h2><span aria-label={`Round ${battle.round}`}>Round {battle.round}</span></header>
          <ol className="trainer-formation-slots">
            {battlePositions.map((position, slot) => {
              const opposingPosition = battle.enemy.team[slot];
              const pokemon = battle.enemy.team.find(({ id }) => id === battle.enemy.active[slot]) ??
                (opposingPosition?.hp === 0 ? opposingPosition : undefined);
              const targetable = choosingTarget && pokemon && targetIds.includes(pokemon.id);
              return <FormationSlot
                key={position}
                position={position}
                pokemon={pokemon}
                enemy
                annotation={targetable ? describeMatchup(chosenMove, pokemon) : undefined}
                action={targetable && pendingMove !== null ? {
                  label: `Target ${species[pokemon.species].name}, ${position}`,
                  onClick: () => queue({ type: "move", move: pendingMove, targetId: pokemon.id }),
                  targetId: pokemon.id,
                } : undefined}
              />;
            })}
          </ol>
        </section>

        <section className="trainer-formation" aria-labelledby="player-formation">
          <header><h2 id="player-formation">Your team</h2></header>
          <ol className="trainer-formation-slots">
            {battlePositions.map((position, slot) => {
              const pokemon = battle.player.team.find(({ id }) => id === battle.player.active[slot]) ??
                battle.player.team.find(({ hp, id }) => hp === 0 && id === previousLineup.current[slot]);
              const plan = pokemon && battle.plans[pokemon.id];
              const replacement = replacementSlots.find((candidate) => candidate === slot);
              const selectable = battle.outcome === "active" && !replacing && pokemon && pokemon.hp > 0;
              return <FormationSlot
                key={position}
                position={position}
                pokemon={pokemon}
                selected={replacing ? slot === replacementSlot : pokemon !== undefined && pokemon.id === actor?.id}
                annotation={plan && pokemon ? describeCommand(battle, pokemon, plan) : undefined}
                action={replacement !== undefined ? {
                  label: `Replace ${position} slot`,
                  onClick: () => setSelectedReplacement(replacement),
                } : selectable ? {
                  label: `Command ${species[pokemon.species].name}, ${position}`,
                  onClick: () => selectActor(pokemon.id),
                  actorId: pokemon.id,
                } : undefined}
              />;
            })}
          </ol>
        </section>
      </section>

      <section className="trainer-log" aria-labelledby="trainer-log-title">
        <h2 id="trainer-log-title">Battle log</h2>
        <ol ref={recentLog} aria-live="polite" aria-relevant="additions text" aria-label="Recent battle events" role="log"
          tabIndex={battle.log.length > 5 ? 0 : undefined}>
          {battle.log.slice(-14).map((line, index, lines) =>
            <li key={`${battle.log.length - lines.length + index}-${line}`}>{line}</li>)}
        </ol>
      </section>
    </div>

    <div ref={controls} className="trainer-command-dock">
      <BattleCommandBar heading={heading} headingRef={resultHeading}
        status={activeBattle ? `${queued} / ${active.length} queued` : undefined}
        onBack={activeBattle && !replacing && mode !== "command"
          ? choosingTarget ? cancelTarget : () => showMode("command") : undefined}>
        {!activeBattle ? <>
          {battle.outcome === "won" && battle.trainerId === "theo"
            && <p className="battle-command-hint">Rusk Vale is now available to challenge in the Grove.</p>}
          <div className="battle-command-options">
            <BattleTile icon="switch" onClick={onReturn}>Return to the grove</BattleTile>
            {onVisitClinic && <BattleTile icon="items" onClick={onVisitClinic}>Visit the Clinic</BattleTile>}
          </div>
        </> : replacing ? <div className="battle-command-options">
          {reserves.map((pokemon) => <BattleTile key={pokemon.id} icon="switch"
            label={`Send out ${species[pokemon.species].name}`}
            onClick={() => {
              onAction({ type: "replace", slot: replacementSlot, withId: pokemon.id });
              setSelectedReplacement(null);
            }}>{species[pokemon.species].name} · {pokemon.hp}/{pokemon.maxHp} HP</BattleTile>)}
        </div> : choosingTarget ? <p className="battle-command-hint">Choose a Pokémon on the opposing team.</p>
          : mode === "command" ? <BattleCommands onChoose={showMode}
            resolve={{ onClick: resolve, disabled: !ready, buttonRef: resolution }} />
          : mode === "fight" && actor ? <BattleMoves moves={battleMoves(actor.species)} onChoose={selectMove} />
          : mode === "items" && actor ? <>
            <p className="battle-command-hint">Oran Berry ×{battle.oranBerries} · Restores up to {ORAN_BERRY_HEAL} HP.</p>
            {battle.oranBerries === 0 ? <p className="battle-command-hint">Your Bag has no Oran Berries.</p>
              : trainerItemTargets(battle).length ? <div className="battle-command-options">
                {trainerItemTargets(battle).map(target => {
                  const command = { type: "item", item: "oranBerry", targetId: target.id } as const;
                  return <BattleTile key={target.id} icon="items" label={`Use Oran Berry on ${species[target.species].name}`}
                    disabled={!canPlanTrainerCommand(battle, actor.id, command)}
                    onClick={() => queue(command)}>{species[target.species].name}</BattleTile>;
                })}
              </div> : <p className="battle-command-hint">No conscious active Pokémon needs healing.</p>}
          </> : mode === "switch" && actor ? <div className="battle-command-options">
            {reserves.length ? reserves.map((pokemon) => {
              const command = { type: "switch", withId: pokemon.id } as const;
              return <BattleTile key={pokemon.id} icon="switch" label={`Switch to ${species[pokemon.species].name}`}
                disabled={!canPlanTrainerCommand(battle, actor.id, command)}
                onClick={() => queue(command)}>{species[pokemon.species].name} · {pokemon.hp}/{pokemon.maxHp} HP</BattleTile>;
            }) : <p className="battle-command-hint">No healthy reserve Pokémon are available.</p>}
          </div> : <div className="battle-command-inspect">
            {battle.enemy.team.filter(({ hp, id }) => hp > 0 && battle.enemy.active.includes(id)).map((mon) =>
              <p key={mon.id}><strong>{species[mon.species].name}</strong> · {species[mon.species].kind} · {mon.hp}/{mon.maxHp} HP</p>)}
          </div>}
        {mode === "command" && activeBattle && actor && selectedPlan && <div className="battle-command-order">
          <span>{actorName} · {describeCommand(battle, actor, selectedPlan)}</span>
          <button type="button" onClick={() => onAction({ type: "clear", actorId: actor.id })}>Clear order</button>
        </div>}
      </BattleCommandBar>
    </div>
  </main>;
}

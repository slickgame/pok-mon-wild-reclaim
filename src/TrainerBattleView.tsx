import { useEffect, useId, useRef, useState, type ReactNode } from "react";
import { ArrowLeft, Check, ChevronRight, Circle, Crosshair, HeartPulse, Repeat2, Shield, Swords } from "lucide-react";
import { typeMultiplier } from "./battleRules";
import { PokemonSprite } from "./PokemonSprite";
import { getMove, moveDescription, species, type MoveId, type SpeciesMove } from "./pokemonData";
import {
  battlePositions, trainerBattleReady, trainerMoveTargets, trainerProfiles, trainerReplacements, trainerReserves,
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

const moveIds = ["strike", "guard", "signature"] as const;
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
  const { accuracy, defense, seededBy } = pokemon.conditions;
  const effects = [
    accuracy < 0 && `Accuracy ${accuracy}`,
    defense > 0 && `Defense +${defense}`,
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
  const move = getMove(pokemon.species, command.move);
  const target = battle.enemy.team.find(({ id }) => id === command.targetId);
  const label = move?.name ?? "Move";
  return target ? `${label} → ${species[target.species].name}` : label;
}

export function TrainerBattleView({ battle, onAction, onReturn, onVisitClinic, toolbar }: TrainerBattleViewProps) {
  const trainer = trainerProfiles[battle.trainerId];
  const moveDetailsId = useId();
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [selectedReplacement, setSelectedReplacement] = useState<ReplacementSlot | null>(null);
  const [mode, setMode] = useState<"fight" | "switch">("fight");
  const [pendingMove, setPendingMove] = useState<MoveId | null>(null);
  const battlefield = useRef<HTMLElement>(null);
  const controls = useRef<HTMLElement>(null);
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
  const chosenMove = pendingMove && actor ? getMove(actor.species, pendingMove) : undefined;
  const targetIds = pendingMove && actor ? trainerMoveTargets(battle, actor.id, pendingMove) : [];
  const choosingTarget = !!chosenMove && targetIds.length > 0 && !replacing && battle.outcome === "active";
  const reserves = trainerReserves(battle);
  const remaining = active.filter(({ id }) => !battle.plans[id]).length;
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
    setMode("fight");
  }

  function queue(command: TrainerCommand) {
    if (!actor) return;
    onAction({ type: "plan", actorId: actor.id, command });
    setPendingMove(null);
    setMode("fight");
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

  function selectMove(id: MoveId, move: SpeciesMove) {
    if (!actor) return;
    if (move.effect === "withdraw") {
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
      const button = controls.current?.querySelector<HTMLButtonElement>(`[data-trainer-move="${move}"]`);
      button?.focus({ preventScroll: true });
      button?.scrollIntoView({ block: "nearest", inline: "nearest" });
    });
  }

  function resolve() {
    onAction({ type: "resolve" });
    setSelectedId(null);
    setSelectedReplacement(null);
    setPendingMove(null);
    setMode("fight");
  }

  return <main className="town trainer-battle" aria-labelledby="grove-name" onKeyDown={(event) => {
    if (event.key === "Escape" && choosingTarget) {
      event.preventDefault();
      cancelTarget();
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
                action={targetable && pendingMove ? {
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

      <aside className="trainer-side" aria-label="Battle controls">
        <section ref={controls} className="trainer-controls">
          {battle.outcome !== "active" ? <>
            <h2 ref={resultHeading} tabIndex={-1}>{battle.outcome === "won" ? "Battle won" : "Battle lost"}</h2>
            {battle.outcome === "won" && battle.trainerId === "theo" &&
              <p className="trainer-instruction">Rusk Vale is now available to challenge in the Grove.</p>}
            <div className="trainer-results-actions">
              <button type="button" className="trainer-primary" onClick={onReturn}><ArrowLeft aria-hidden="true" />Return to the grove</button>
              {onVisitClinic && <button type="button" className="trainer-option" onClick={onVisitClinic}><HeartPulse aria-hidden="true" />Visit the Clinic</button>}
            </div>
          </> : replacing ? <>
            <h2>Choose a replacement</h2>
            <p className="trainer-instruction">Send out a reserve to the {battlePositions[replacementSlot]} slot.</p>
            <div className="trainer-options">
              {reserves.map((pokemon) => <button type="button" className="trainer-option" key={pokemon.id}
                aria-label={`Send out ${species[pokemon.species].name}`}
                onClick={() => {
                  onAction({ type: "replace", slot: replacementSlot, withId: pokemon.id });
                  setSelectedReplacement(null);
                }}>
                <PokemonSprite speciesId={pokemon.species} className="trainer-reserve-sprite" />
                <span><strong>{species[pokemon.species].name}</strong><small>{pokemon.hp}/{pokemon.maxHp} HP</small></span>
              </button>)}
            </div>
          </> : <>
            <h2>{choosingTarget ? `Target for ${chosenMove.name}` : actorName ?? "Choose actions"}</h2>
            {choosingTarget ? <>
              <p className="trainer-instruction">Choose a Pokémon on the opposing team.</p>
              <button type="button" className="trainer-option" onClick={cancelTarget}>
                <ArrowLeft aria-hidden="true" />Cancel target
              </button>
            </> : actor && <>
              {battle.trainerId === "theo" && battle.round === 1 &&
                <p className="trainer-instruction">Choose one action for each active Pokémon, then resolve the round.</p>}
              <div className="trainer-command-modes" aria-label="Action type">
                <button type="button" aria-pressed={mode === "fight"} onClick={() => setMode("fight")}><Swords aria-hidden="true" />Fight</button>
                <button type="button" aria-pressed={mode === "switch"} onClick={() => setMode("switch")}><Repeat2 aria-hidden="true" />Switch</button>
              </div>
              {mode === "fight" ? <div className="trainer-options">
                {moveIds.map((moveId) => {
                  const move = getMove(actor.species, moveId);
                  if (!move) return null;
                  const detailId = `${moveDetailsId}-${moveId}`;
                  return <button type="button" key={moveId} className="trainer-option"
                    aria-label={move.name}
                    aria-describedby={detailId}
                    data-trainer-move={moveId}
                    onClick={() => selectMove(moveId, move)}>
                    {move.category === "status" ? <Crosshair aria-hidden="true" /> : moveId === "guard" ? <Shield aria-hidden="true" /> : <Swords aria-hidden="true" />}
                    <span><strong>{move.name}</strong><small id={detailId}>{moveDescription(move)}{moveId === "guard" && " · Guard against later hits."}</small></span>
                    <ChevronRight aria-hidden="true" />
                  </button>;
                })}
              </div> : reserves.length ? <div className="trainer-options">
                {reserves.map((pokemon) => {
                  const used = Object.entries(battle.plans).some(([id, plan]) =>
                    Number(id) !== actor.id && plan?.type === "switch" && plan.withId === pokemon.id);
                  return <button type="button" className="trainer-option" key={pokemon.id} disabled={used}
                    aria-label={`Switch to ${species[pokemon.species].name}`}
                    onClick={() => queue({ type: "switch", withId: pokemon.id })}>
                    <PokemonSprite speciesId={pokemon.species} className="trainer-reserve-sprite" />
                    <span><strong>{species[pokemon.species].name}</strong><small>{used ? "Already queued for another slot" : `${pokemon.hp}/${pokemon.maxHp} HP`}</small></span>
                  </button>;
                })}
              </div> : <p className="trainer-instruction">No healthy reserve Pokémon are available.</p>}
              {selectedPlan && <button type="button" className="trainer-clear-plan"
                onClick={() => onAction({ type: "clear", actorId: actor.id })}>Clear {actorName}’s action</button>}
            </>}
            <footer className="trainer-resolve">
              <button type="button" className="trainer-primary" disabled={!ready || choosingTarget} onClick={resolve} ref={resolution}>
                {ready ? <Check aria-hidden="true" /> : <Swords aria-hidden="true" />}Resolve round
              </button>
              <p aria-live="polite">{choosingTarget ? "Finish choosing a target." : ready ? "All active Pokémon have actions." : `${remaining} ${remaining === 1 ? "action" : "actions"} left to choose.`}</p>
            </footer>
          </>}
        </section>

        <section className="trainer-log" aria-labelledby="trainer-log-title">
          <h2 id="trainer-log-title">Battle log</h2>
          <ol ref={recentLog} aria-live="polite" aria-relevant="additions text" aria-label="Recent battle events" role="log"
            tabIndex={battle.log.length > 5 ? 0 : undefined}>
            {battle.log.slice(-14).map((line, index, lines) =>
              <li key={`${battle.log.length - lines.length + index}-${line}`}>{line}</li>)}
          </ol>
        </section>
      </aside>
    </div>
  </main>;
}

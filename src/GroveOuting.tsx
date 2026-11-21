import { useEffect, useId, useRef, useState, type ReactNode } from "react";
import {
  ArrowLeft, ArrowLeftRight, ChevronRight, Crosshair, Footprints, HeartPulse, Search, Shield, Sparkles, Swords,
  type LucideIcon,
} from "lucide-react";
import {
  canBeginTrainer, captureChance, getLead, levelOf, maxHp, PARTY_LIMIT, species,
  type OutingAction, type OutingState, type SpeciesId,
} from "./outing";
import { typeMultiplier, type BattleConditions } from "./battleRules";
import { moveDescription, type SpeciesMove } from "./pokemonData";
import { PokemonSprite } from "./PokemonSprite";
import "./groveOuting.css";

type GroveOutingProps = {
  outing: OutingState;
  onAction: (action: OutingAction) => void;
  onReturn: () => void;
  onVisitClinic?: () => void;
  toolbar?: ReactNode;
};

const resultTitles = {
  won: "Encounter won",
  captured: "Capture successful",
  fled: "Left the encounter",
  lost: "Pokémon fainted",
};

function Vitals({ name, hp, maximum }: { name: string; hp: number; maximum: number }) {
  return <div className="grove-vitals" data-hp={hp <= maximum / 3 ? "low" : "ready"}>
    <progress aria-label={`${name} HP`} max={maximum} value={hp} />
    <span>{hp}/{maximum} HP</span>
  </div>;
}

function Combatant({ speciesId, hp, maximum, level, conditions, wild = false }: {
  speciesId: SpeciesId;
  hp: number;
  maximum: number;
  level: number;
  conditions?: BattleConditions;
  wild?: boolean;
}) {
  const { name, kind } = species[speciesId];
  const effects = [
    conditions?.seededBy !== undefined ? "Seeded" : null,
    conditions?.accuracy ? `Accuracy ${conditions.accuracy}` : null,
    conditions?.defense ? `Defense +${conditions.defense}` : null,
  ].filter(Boolean);
  return <div className={`grove-combatant${wild ? " grove-combatant--wild" : ""}`}>
    <PokemonSprite className="grove-portrait" speciesId={speciesId} />
    <div className="grove-combatant-card">
      <p className="grove-combatant-detail">{wild ? `Wild · ${kind}` : kind} · Lv. {level}</p>
      <h2>{name}</h2>
      <Vitals name={wild ? `Wild ${name}` : name} hp={hp} maximum={maximum} />
      {effects.length > 0 && <p className="grove-combatant-detail grove-conditions">{effects.join(" · ")}</p>}
    </div>
  </div>;
}

function GroveButton({ icon: Icon, label, detail, onClick, disabled, primary = false }: {
  icon: LucideIcon;
  label: string;
  detail?: string;
  onClick: () => void;
  disabled?: boolean;
  primary?: boolean;
}) {
  const detailId = useId();
  return <button
    className={`grove-button${primary ? " grove-button--primary" : ""}`}
    type="button"
    aria-label={label}
    aria-describedby={detail ? detailId : undefined}
    onClick={onClick}
    disabled={disabled}
  >
    <Icon aria-hidden="true" />
    <span>{label}{detail && <small id={detailId}>{detail}</small>}</span>
    {primary && <ChevronRight className="grove-button-arrow" aria-hidden="true" />}
  </button>;
}

function attackDetail(move: SpeciesMove, target: SpeciesId, guards = false) {
  const multiplier = typeMultiplier(move.type, species[target].types);
  const matchup = multiplier === 0 ? "Immune" : multiplier === 1 ? "" : `${multiplier}× matchup`;
  return [move.type, `Power ${move.power}`, matchup, guards && "Halves retaliation"].filter(Boolean).join(" · ");
}

export function GroveOuting({ outing, onAction, onReturn, onVisitClinic, toolbar }: GroveOutingProps) {
  const { encounter, pokeBalls, party } = outing;
  const lead = getLead(outing);
  const battle = encounter?.outcome === "active" ? encounter : null;
  const [switching, setSwitching] = useState(false);
  const resultOutcome = encounter && encounter.outcome !== "active" ? encounter.outcome : null;
  const result = resultOutcome ? encounter : null;
  const panel = useRef<HTMLElement>(null);
  const logId = useId();
  const phase = battle ? "battle" : result ? "result" : "field";
  const previousPhase = useRef(phase);

  useEffect(() => {
    if (previousPhase.current === phase) return;
    previousPhase.current = phase;
    panel.current?.querySelector<HTMLElement>("[data-phase-heading]")?.focus({ preventScroll: true });
    panel.current?.scrollTo(0, 0);
  }, [phase]);

  const leadReady = lead !== undefined && lead.hp > 0;
  const moves = lead && species[lead.species].moves;
  const reserves = party.filter((member) => member.id !== lead?.id && member.hp > 0);
  const choosingSwitch = !!battle && (switching || !leadReady);
  const theoReady = canBeginTrainer(outing, "theo");
  const ruskReady = canBeginTrainer(outing, "rusk");
  const healthyCount = reserves.length + Number(leadReady);
  const partyFull = party.length >= PARTY_LIMIT;
  const outOfPokeBalls = pokeBalls === 0;

  useEffect(() => {
    if (choosingSwitch) panel.current?.querySelector<HTMLButtonElement>("[aria-label='Choose a healthy Pokémon'] button")?.focus();
  }, [choosingSwitch]);

  return <main className={`town grove-outing${battle ? " grove-outing--battle" : ""}`} aria-labelledby="grove-name">
    <div className="atlas grove-atlas">
      <div className="map-frame">
        <img
          className="town-art"
          src="/art/brambleberry-grove.webp"
          alt="Berry bushes and pines line a creek and woodland trail."
          width="1672"
          height="941"
          fetchPriority="high"
        />
      </div>
      {battle && lead && <section className="grove-combatants" aria-label="Pokémon in battle">
        <Combatant speciesId={lead.species} hp={lead.hp} maximum={maxHp(lead)} level={levelOf(lead)} conditions={battle.conditions?.player[lead.id]} />
        <Combatant speciesId={battle.species} hp={battle.hp} maximum={species[battle.species].baseHp} level={1} conditions={battle.conditions?.wild} wild />
      </section>}
    </div>

    {toolbar}

    <section ref={panel} className="town-card grove-panel bevel" aria-label="Grove actions">
      <header className="grove-heading">
        <p>Verdant Hollow</p>
        <h1 id="grove-name" tabIndex={-1}>Brambleberry Grove</h1>
        <img className="town-divider" src="/art/ui/divider.png" alt="" />
      </header>

      {battle && moves ? <>
        <div className="grove-phase">
          <h2 tabIndex={-1} data-phase-heading aria-describedby={logId}>Wild encounter</h2>
          <div className="grove-battle-log" id={logId} role="status" aria-atomic="true">
            {battle.log.slice(-3).map((line, index) => <p key={`${index}-${line}`}>{line}</p>)}
          </div>
        </div>
        {choosingSwitch ? <div className="grove-actions" role="group" aria-label="Choose a healthy Pokémon">
          {reserves.map((member) => <GroveButton key={member.id} icon={ArrowLeftRight}
            label={`${leadReady ? "Switch to" : "Send out"} ${species[member.species].name}`}
            detail={`${member.hp}/${maxHp(member)} HP`} onClick={() => {
              setSwitching(false);
              onAction({ type: "selectLead", id: member.id });
            }} />)}
          {leadReady && <GroveButton icon={ArrowLeft} label="Back to actions" onClick={() => setSwitching(false)} />}
        </div> : <div className="grove-actions">
          <GroveButton icon={Swords} label={moves.strike.name}
            detail={attackDetail(moves.strike, battle.species)} onClick={() => onAction({ type: "move", move: "strike" })} primary />
          <GroveButton icon={Shield} label={moves.guard.name}
            detail={attackDetail(moves.guard, battle.species, true)} onClick={() => onAction({ type: "move", move: "guard" })} />
          {moves.signature && <GroveButton icon={Sparkles} label={moves.signature.name}
            detail={moveDescription(moves.signature)} onClick={() => onAction({ type: "move", move: "signature" })} />}
          <GroveButton icon={Crosshair} label="Throw Pokéball" disabled={partyFull || outOfPokeBalls}
            detail={partyFull ? "Party is full" : outOfPokeBalls ? "No Pokéballs left" : `${pokeBalls} left · ${Math.round(captureChance(battle) * 100)}% capture chance`}
            onClick={() => onAction({ type: "capture" })} />
          {reserves.length > 0 && <GroveButton icon={ArrowLeftRight} label="Switch Pokémon"
            onClick={() => setSwitching(true)} />}
          <GroveButton icon={Footprints} label="Leave encounter" onClick={() => onAction({ type: "flee" })} />
        </div>}
      </> : result && resultOutcome ? <>
        <div className="grove-phase">
          <h2 tabIndex={-1} data-phase-heading aria-describedby={logId}>{resultTitles[resultOutcome]}</h2>
          <div className="grove-battle-log" id={logId}>
            {result.log.slice(-3).map((line, index) => <p key={`${index}-${line}`}>{line}</p>)}
          </div>
        </div>
        <div className="grove-actions">
          {leadReady && <GroveButton icon={Search} label="Continue exploring" onClick={() => onAction({ type: "closeEncounter" })} primary />}
          {!leadReady && onVisitClinic && <GroveButton icon={HeartPulse} label="Visit the Clinic" onClick={onVisitClinic} primary />}
          <GroveButton icon={ArrowLeft} label="Return to Brookbend" onClick={onReturn} />
        </div>
      </> : <>
        <div className="grove-phase">
          <h2 tabIndex={-1} data-phase-heading>Creekside trail</h2>
          <p>{leadReady ? "Look along the creek for wild Pokémon." : lead ?
            "Your lead Pokémon needs care. Visit the Clinic or switch your lead in Party." :
            "Meet your starter team at Maple’s Lab before searching the trail."}</p>
        </div>
        <div className="grove-field-kit">
          {lead && <div className="grove-field-lead">
            <span>{species[lead.species].name} · Lv. {levelOf(lead)}</span>
            <Vitals name={species[lead.species].name} hp={lead.hp} maximum={maxHp(lead)} />
          </div>}
          <div className="grove-field-balls"><Crosshair aria-hidden="true" /><span>Pokéballs</span><strong>{pokeBalls}</strong></div>
        </div>
        <div className="grove-actions">
          {leadReady && <GroveButton icon={Search} label="Look for wild Pokémon" onClick={() => onAction({ type: "search" })} primary />}
          <GroveButton icon={Swords} label="Train with Youngster Theo" disabled={!theoReady}
            detail={theoReady ? "3v2 training match" : "Bring three healthy Pokémon"}
            onClick={() => onAction({ type: "startTrainer", trainerId: "theo" })} />
          {outing.theoDefeated && <GroveButton icon={Swords} label="Challenge Rusk Vale" disabled={!ruskReady}
            detail={ruskReady ? "3v3 trainer battle" : "Bring three healthy Pokémon"}
            onClick={() => onAction({ type: "startTrainer", trainerId: "rusk" })} />}
          {(!leadReady || healthyCount < 3) && lead && onVisitClinic && <GroveButton icon={HeartPulse} label="Visit the Clinic" onClick={onVisitClinic} />}
          <GroveButton icon={ArrowLeft} label="Return to Brookbend" onClick={onReturn} />
        </div>
      </>}
    </section>
  </main>;
}

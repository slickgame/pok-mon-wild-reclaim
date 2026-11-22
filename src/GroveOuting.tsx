import { useEffect, useId, useRef, useState, type ReactNode } from "react";
import {
  ArrowLeft, ChevronRight, Footprints, HeartPulse, Search, Swords, type LucideIcon,
} from "lucide-react";
import {
  canBeginRevenant, canBeginTrainer, canExploreGrove, canUseWildBerry, captureChance, getGroveQuestPhase, getLead, getMoveOrder, levelOf,
  maxHp, PARTY_LIMIT, species, type Encounter, type GroveDiscovery, type OutingAction, type OutingState, type SpeciesId,
} from "./outing";
import { ORAN_BERRY_HEAL, typeMultiplier, type BattleConditions } from "./battleRules";
import { battleMoves, moveDescription, type Companion } from "./pokemonData";
import { BattleCommandBar, BattleCommands, BattleMoves, BattleTile, type BattleMode } from "./BattleCommandBar";
import { PokemonSprite } from "./PokemonSprite";
import { GroveFieldJournal } from "./GroveFieldJournal";
import { GroveSidebar } from "./GroveSidebar";
import type { GrovePanelId } from "./townPlay";
import "./groveOuting.css";

type GroveOutingProps = {
  outing: OutingState;
  onAction: (action: OutingAction) => void;
  onReturn: () => void;
  onVisitClinic?: () => void;
  onSpeakToLina?: () => void;
  onOpenZonePanel: (panel: GrovePanelId | "settings") => void;
  journalOpen: boolean;
  onCloseJournal: () => void;
  toolbar?: ReactNode;
};

const resultTitles = {
  won: "Encounter won",
  captured: "Capture successful",
  fled: "Left the encounter",
  lost: "Pokémon fainted",
};

function GroveDiscoveryResult({ discovery, outing, onAction, onVisitClinic }: {
  discovery: GroveDiscovery;
  outing: OutingState;
  onAction: (action: OutingAction) => void;
  onVisitClinic?: () => void;
}) {
  if (discovery.kind === "spores") {
    const ready = canBeginRevenant(outing);

    return <>
      <div className="grove-phase">
        <h2 tabIndex={-1} data-phase-heading>Strange Spores</h2>
        <p>Violet spores drift from a clearing beyond the creek. Something moves in the haze.</p>
      </div>
      <div className="grove-actions">
        <GroveButton icon={Search} label="Investigate the spores" detail={ready ? undefined : "Bring three conscious Pokémon"}
          primary disabled={!ready} onClick={() => onAction({ type: "startRevenant" })} />
        {!ready && onVisitClinic && <GroveButton icon={HeartPulse} label="Visit the Clinic" onClick={onVisitClinic} />}
        <GroveButton icon={ArrowLeft} label="Back to Grove" onClick={() => onAction({ type: "closeGroveDiscovery" })} />
      </div>
    </>;
  }

  const trainer = discovery.kind === "trainer" ? discovery.trainerId : null;
  const trainerName = trainer === "rusk" ? "Rusk Vale" : "Youngster Theo";
  const title = discovery.kind === "resource" ? "Oran Berries"
    : trainer ? `You met ${trainerName}` : "A quiet clearing";
  const detail = discovery.kind === "resource"
    ? `You picked up ${discovery.quantity} Oran Berry and put it in your Bag.`
    : trainer
      ? `${trainerName} invites your team to a ${trainer === "rusk" ? "3v3" : "3v2"} battle.`
      : "Birdsong drifts across the creek. Your team pauses in the shade before heading back to the trail.";
  const ready = trainer !== null && canBeginTrainer(outing, trainer);

  return <>
    <div className="grove-phase">
      <h2 tabIndex={-1} data-phase-heading>{title}</h2>
      <p>{detail}</p>
    </div>
    <div className="grove-actions">
      {trainer && <GroveButton icon={Swords} label={`Battle ${trainerName}`} primary disabled={!ready}
        detail={ready ? undefined : "Bring three healthy Pokémon"}
        onClick={() => onAction({ type: "startTrainer", trainerId: trainer })} />}
      <GroveButton icon={ArrowLeft} label="Back to Grove" primary={!trainer}
        onClick={() => onAction({ type: "closeGroveDiscovery" })} />
    </div>
  </>;
}

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
    conditions?.paralyzed ? "Paralyzed" : null,
    conditions?.accuracy ? `Accuracy ${conditions.accuracy}` : null,
    conditions?.defense ? `Defense ${conditions.defense > 0 ? "+" : ""}${conditions.defense}` : null,
    conditions?.attack ? `Attack ${conditions.attack}` : null,
    conditions?.speed ? `Speed ${conditions.speed}` : null,
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

function GroveAtlas({ children }: { children?: ReactNode }) {
  return <div className="atlas grove-atlas">
    <div className="map-frame">
      <img className="town-art" src="/art/brambleberry-grove.webp"
        alt="Berry bushes and pines line a creek and woodland trail." width="1672" height="941" fetchPriority="high" />
    </div>
    {children}
  </div>;
}

function WildBattleView({ battle, lead, outing, onAction, toolbar }: {
  battle: Encounter;
  lead: Companion;
  outing: OutingState;
  onAction: (action: OutingAction) => void;
  toolbar?: ReactNode;
}) {
  const [menu, setMenu] = useState<BattleMode>("command");
  const headingRef = useRef<HTMLHeadingElement>(null);
  const commandRef = useRef<HTMLDivElement>(null);
  const needsReplacement = lead.hp === 0;
  const mode = needsReplacement ? "switch" : menu;
  const reserves = outing.party.filter((member) => member.id !== lead.id && member.hp > 0);
  const actor = species[lead.species];
  const opponent = species[battle.species];
  const canThrow = outing.pokeBalls > 0 && outing.party.length < PARTY_LIMIT;
  const berryReason = !outing.fieldSupplies ? "No Oran Berries left" : "HP is already full";
  const throwReason = outing.party.length >= PARTY_LIMIT ? "Party is full" : "No Pokéballs left";
  const headings: Record<BattleMode, string> = {
    command: "Choose a command",
    fight: `Fight · ${actor.name}`,
    items: "Items",
    switch: needsReplacement ? "Choose a healthy Pokémon" : "Switch Pokémon",
    inspect: "Inspect",
  };

  useEffect(() => {
    if (mode === "switch" && needsReplacement) {
      const first = commandRef.current?.querySelector<HTMLButtonElement>(".battle-command-tile:not(:disabled)");
      if (first) return first.focus({ preventScroll: true });
    }
    headingRef.current?.focus({ preventScroll: true });
  }, [mode, needsReplacement]);

  function choose(action: OutingAction) {
    setMenu("command");
    onAction(action);
  }

  return <main className="town grove-outing grove-outing--battle" aria-label="Wild encounter">
    <GroveAtlas>
      <header className="grove-wild-heading">
        <h1 id="grove-name">Wild encounter</h1>
        <p>Brambleberry Grove</p>
      </header>
      {toolbar}
      <details className="grove-wild-log">
        <summary>Battle log</summary>
        <ol>{battle.log.map((line, index) => <li key={`${index}-${line}`}>{line}</li>)}</ol>
      </details>
      <section className="grove-combatants" aria-label="Pokémon in battle">
        <Combatant speciesId={lead.species} hp={lead.hp} maximum={maxHp(lead)} level={levelOf(lead)} conditions={battle.conditions?.player[lead.id]} />
        <Combatant speciesId={battle.species} hp={battle.hp} maximum={opponent.baseHp} level={1} conditions={battle.conditions?.wild} wild />
      </section>
    </GroveAtlas>
    <div className="grove-wild-controls" ref={commandRef}>
      <BattleCommandBar heading={headings[mode]} headingRef={headingRef}
        onBack={mode !== "command" && !needsReplacement ? () => setMenu("command") : undefined}>
        {mode === "command" && <BattleCommands onChoose={setMenu} />}
        {mode === "fight" && <BattleMoves moves={battleMoves(lead.species)} order={getMoveOrder(outing, lead.id)}
          onChoose={(move) => choose({ type: "move", move })}
          describe={(move) => {
            if (!move.power) return moveDescription(move);
            const matchup = typeMultiplier(move.type, opponent.types);
            return `${moveDescription(move)} · ${matchup === 0 ? "Immune" : `${matchup}× matchup`}`;
          }} />}
        {mode === "items" && <div className="battle-command-options">
          <BattleTile icon="items" label="Throw Pokéball" disabled={!canThrow} title={canThrow ? undefined : throwReason}
            onClick={() => choose({ type: "capture" })}>
            Throw Pokéball <small>{canThrow ? `${outing.pokeBalls} left · ${Math.round(captureChance(battle) * 100)}% capture chance` : throwReason}</small>
          </BattleTile>
          <BattleTile icon="items" label="Use Oran Berry" disabled={!canUseWildBerry(outing)}
            title={canUseWildBerry(outing) ? undefined : berryReason} onClick={() => choose({ type: "useWildBerry" })}>
            Use Oran Berry <small>{canUseWildBerry(outing) ? `${outing.fieldSupplies} left · Restores up to ${ORAN_BERRY_HEAL} HP` : berryReason}</small>
          </BattleTile>
        </div>}
        {mode === "switch" && (reserves.length ? <div className="battle-command-options" aria-label="Choose a healthy Pokémon">
          {reserves.map((member) => <BattleTile key={member.id} icon="switch"
            label={`${needsReplacement ? "Send out" : "Switch to"} ${species[member.species].name}`}
            onClick={() => choose({ type: "selectLead", id: member.id })}>
            {species[member.species].name} <small>{member.hp}/{maxHp(member)} HP</small>
          </BattleTile>)}
        </div> : <p className="battle-command-hint">No healthy reserves.</p>)}
        {mode === "inspect" && <div className="battle-command-inspect grove-wild-inspect">
          <p><strong>{opponent.name}</strong> · Lv. 1 · {opponent.kind}</p>
          <p>{battle.hp}/{opponent.baseHp} HP · {opponent.moves.strike.name}</p>
        </div>}
      </BattleCommandBar>
      <div className="grove-wild-footer">
        <p role="status" aria-live="polite">{battle.log.at(-1)}</p>
        {!needsReplacement && <button type="button" className="grove-wild-run"
          onClick={() => onAction({ type: "flee" })}><Footprints aria-hidden="true" /> Leave encounter</button>}
      </div>
    </div>
  </main>;
}

export function GroveOuting({
  outing, onAction, onReturn, onVisitClinic, onSpeakToLina, onOpenZonePanel, journalOpen, onCloseJournal, toolbar,
}: GroveOutingProps) {
  const { encounter, groveDiscovery } = outing;
  const lead = getLead(outing);
  const battle = encounter?.outcome === "active" ? encounter : null;
  const resultOutcome = encounter && encounter.outcome !== "active" ? encounter.outcome : null;
  const result = resultOutcome ? encounter : null;
  const panel = useRef<HTMLElement>(null);
  const logId = useId();
  const questPhase = getGroveQuestPhase(outing);
  const showJournal = !encounter && !groveDiscovery && questPhase !== "explore" && journalOpen;
  const phase = battle ? "battle" : result ? "result" : groveDiscovery ? "discovery" : showJournal ? "journal" : "field";
  const previousPhase = useRef(phase);

  useEffect(() => {
    if (previousPhase.current === phase) return;
    previousPhase.current = phase;
    panel.current?.querySelector<HTMLElement>("[data-phase-heading]")?.focus({ preventScroll: true });
    panel.current?.scrollTo(0, 0);
  }, [phase]);

  const leadReady = lead !== undefined && lead.hp > 0;

  if (showJournal) {
    const search = leadReady
      ? { label: "Look for wild Pokémon", run: () => onAction({ type: "search" }) }
      : { label: "Visit the Clinic", run: onVisitClinic };
    const actions = {
      explore: search,
      clear: { label: "Clear overgrowth", run: () => onAction({ type: "clearGroveOvergrowth" }) },
      battle: search,
      report: { label: "Speak with Ranger Lina", run: onSpeakToLina },
      complete: { label: "Continue exploring", run: onCloseJournal },
    };
    const action = actions[questPhase];

    return <GroveFieldJournal quest={outing.groveQuest} actionLabel={action.label} onAction={action.run}
      onClose={onCloseJournal} panelRef={panel} />;
  }

  if (battle && lead) return <WildBattleView battle={battle} lead={lead} outing={outing} onAction={onAction} toolbar={toolbar} />;

  const isField = phase === "field";
  return <main className={`town grove-outing grove-outing--${phase}`} aria-label="Brambleberry Grove"
    ref={isField ? panel : undefined}>
    <GroveAtlas />

    {isField ? <GroveSidebar canExplore={canExploreGrove(outing)}
      onExplore={() => onAction({ type: "exploreGrove" })} onOpenPanel={onOpenZonePanel}
      onSettings={() => onOpenZonePanel("settings")} /> : <>
    {toolbar}
    <section ref={panel} className="town-card grove-panel bevel" aria-label="Grove actions">
      <header className="grove-heading">
        <p>Verdant Hollow</p>
        <h1 id="grove-name" tabIndex={-1}>Brambleberry Grove</h1>
        <img className="town-divider" src="/art/ui/divider.png" alt="" />
      </header>

      {result && resultOutcome ? <>
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
      </> : groveDiscovery && <GroveDiscoveryResult discovery={groveDiscovery} outing={outing} onAction={onAction}
        onVisitClinic={onVisitClinic} />}
    </section>
    </>}
  </main>;
}

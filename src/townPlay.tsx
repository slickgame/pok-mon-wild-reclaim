import { useCallback, useEffect, useId, useRef, useState, type ChangeEvent, type ReactNode } from 'react';
import {
  CAMP_HEAL_PERCENT,
  GROVE_WILD_WINS_REQUIRED,
  canBeginTrainer,
  canOpenSporesDiscovery,
  canRestAtCamp,
  clinicAvailable,
  getGroveQuestPhase,
  getLead,
  levelOf,
  maxHp,
  species,
  starterIds,
  updateOuting,
  type OutingAction,
  type OutingState,
} from './outing';
import { hasActiveEncounter, MAX_IMPORT_BYTES, normalizeLocation, readGameSave, type GameSave, type Milestone, type WorldLocation } from './gameSave';
import { PokemonSprite } from './PokemonSprite';
import { useGameSave } from './useGameSave';
import './townPlay.css';

export type GrovePanelId = 'party' | 'bag' | 'grove-camp' | 'grove-talk' | 'grove-quests' | 'grove-habitat' | 'grove-travel';
export type PanelId = GrovePanelId | 'maple' | 'clinic' | 'merra' | 'board' | 'gate' | 'grove-lina' | 'workshop' | 'talent' | 'journal' | 'settings';

const TOUR = [
  { milestone: 'clinicVisited', panel: 'clinic', objective: 'Check in at the Clinic', actionLabel: 'Visit the Clinic' },
  { milestone: 'merraMet', panel: 'merra', objective: 'Meet Merra', actionLabel: 'Visit Merra’s Shop' },
  { milestone: 'boardRead', panel: 'board', objective: 'Read the town notice', actionLabel: 'Visit the Quest Board' },
] as const;

export function useTownPlay(requestedLocation?: WorldLocation) {
  const { save, saveStatus, changeSave, importSave, getSave } = useGameSave(requestedLocation);
  const { progress, outing, location } = save;

  function finish(milestone: Milestone) {
    changeSave(current => current.progress[milestone] ? current : {
      ...current, progress: { ...current.progress, [milestone]: true },
    });
  }

  function dispatchOuting(action: OutingAction) {
    changeSave(current => {
      const next = updateOuting(current.outing, action, Math.random());
      return next === current.outing ? current : { ...current, outing: next };
    });
  }

  const travel = useCallback((destination: WorldLocation) => changeSave(current => {
    const target = normalizeLocation(current, destination);
    if (target === current.location) return current;
    let nextOuting = current.outing;
    if (current.location === 'grove') {
      if (nextOuting.revenantBattle) nextOuting = updateOuting(nextOuting, { type: 'closeRevenant' });
      if (nextOuting.trainerBattle) nextOuting = updateOuting(nextOuting, { type: 'closeTrainer' });
      if (nextOuting.encounter) nextOuting = updateOuting(nextOuting, { type: 'closeEncounter' });
    }
    return { ...current, location: target, outing: nextOuting };
  }).location, [changeSave]);

  const nextTourStop = TOUR.find(({ milestone }) => !progress[milestone]);
  const hasStarter = outing.party.length > 0;
  let openingObjective: { objective: string; actionLabel: string; panel: PanelId } | undefined = nextTourStop;
  if (!progress.mapleMet) {
    openingObjective = { objective: 'Meet Professor Maple', actionLabel: 'Visit Professor Maple', panel: 'maple' };
  } else if (!hasStarter) {
    openingObjective = { objective: 'Meet your starter team', actionLabel: 'Choose your lead', panel: 'maple' };
  }
  const canEnterGrove = progress.gateOpen && hasStarter;
  const resumeBattle = canEnterGrove && hasActiveEncounter(outing);
  if (canEnterGrove && !resumeBattle && outing.sporesQuest.defeated && !outing.sporesQuest.reported) {
    openingObjective = { objective: 'Report to Professor Maple', actionLabel: 'Visit Professor Maple', panel: 'maple' };
  }
  const objective = openingObjective?.objective ?? (resumeBattle ? 'Battle in progress' : canEnterGrove ? 'Explore Brambleberry Grove' : 'Speak to Ranger Lina');
  const actionLabel = openingObjective?.actionLabel ?? (resumeBattle ? 'Resume battle' : canEnterGrove ? 'Go to Brambleberry Grove' : 'Visit the Travel Gate');
  const actionTarget: PanelId = openingObjective?.panel ?? 'gate';

  return {
    objective, actionLabel, actionTarget, canEnterGrove, progress, finish,
    saveStatus, location, travel, importSave, getSave,
    nextTourStop, outing, dispatchOuting, hasStarter,
  };
}

type TownPlay = ReturnType<typeof useTownPlay>;

function Dialogue({ speaker, children }: { speaker: string; children: ReactNode }) {
  return <blockquote className="town-play-dialogue">
    <p className="town-play-speaker">{speaker}</p>
    <p>{children}</p>
  </blockquote>;
}

function PanelAction({ onClick, children, disabled, label }: {
  onClick: () => void;
  children: ReactNode;
  disabled?: boolean;
  label?: string;
}) {
  return <button className="town-play-action" type="button" onClick={onClick} disabled={disabled} aria-label={label}>{children}</button>;
}

const saveStatusCopy = {
  saved: 'Progress saves automatically in this browser. Export a backup to move it to another browser or device.',
  recovered: 'Recovered your last usable progress. Autosave is active again.',
  unavailable: 'Automatic saving is unavailable. Export a backup before leaving to keep this session’s progress.',
  damaged: 'The stored save could not be read. You can restore a backup if you have one.',
  conflict: 'Another tab saved newer progress. Export this session as a backup before reloading.',
};

const backupLocations = { town: 'Brookbend Town', hollow: 'Verdant Hollow', grove: 'Brambleberry Grove' };

function SaveSettings({ play }: { play: TownPlay }) {
  const fileInput = useRef<HTMLInputElement>(null);
  const [pending, setPending] = useState<GameSave | null>(null);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<{ text: string; error: boolean } | null>(null);

  function downloadBackup() {
    try {
      const file = new Blob([JSON.stringify(play.getSave(), null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(file);
      const link = document.createElement('a');
      link.href = url;
      link.download = 'wild-reclaim-save.json';
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.setTimeout(() => URL.revokeObjectURL(url), 1000);
      setMessage({ text: 'Save backup downloaded.', error: false });
    } catch {
      setMessage({ text: 'The save backup could not be downloaded.', error: true });
    }
  }

  async function selectBackup(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (!file) return;
    setPending(null);
    setMessage(null);
    if (file.size > MAX_IMPORT_BYTES) {
      setMessage({ text: 'This backup is too large to be a Wild Reclaim save.', error: true });
      return;
    }
    setBusy(true);
    try {
      const backup = readGameSave(await file.text());
      if (backup) setPending(backup);
      else setMessage({ text: 'Choose a valid Wild Reclaim save backup. Your current progress is unchanged.', error: true });
    } catch {
      setMessage({ text: 'The selected file could not be read.', error: true });
    } finally {
      setBusy(false);
    }
  }

  function restoreBackup() {
    if (!pending) return;
    if (play.importSave(pending)) {
      setPending(null);
      setMessage({ text: 'Save restored.', error: false });
    } else setMessage({ text: 'The backup could not be saved. Your current progress is unchanged.', error: true });
  }

  return <section className="town-play-save">
    <p role="status">{saveStatusCopy[play.saveStatus]}</p>
    <div className="town-play-save-controls">
      <PanelAction onClick={downloadBackup}>Export save</PanelAction>
      <PanelAction onClick={() => fileInput.current?.click()} disabled={busy}>Import save</PanelAction>
    </div>
    <input type="file" accept=".json,application/json" aria-label="Save backup file" ref={fileInput}
      onChange={selectBackup} hidden />
    {pending && <div className="town-play-save-confirmation">
      <p>Restore {backupLocations[pending.location]} with {pending.outing.party.length} Pokémon. This replaces the current save in this browser.</p>
      <div className="town-play-save-controls">
        <PanelAction onClick={restoreBackup}>Replace save</PanelAction>
        <PanelAction onClick={() => { setPending(null); setMessage(null); }}>Cancel</PanelAction>
      </div>
    </div>}
    {message && <p className={message.error ? 'town-play-save-error' : 'town-play-progress'}
      role={message.error ? 'alert' : 'status'}>{message.text}</p>}
  </section>;
}

function StopDialogue({ play, milestone, speaker, children, label, completed }: {
  play: TownPlay;
  milestone: Milestone;
  speaker: string;
  children: ReactNode;
  label: string;
  completed: string;
}) {
  const { progress, finish } = play;
  return <>
    <Dialogue speaker={speaker}>{children}</Dialogue>
    {progress[milestone] ? <p className="town-play-progress" role="status">{completed}</p> : (
      progress.mapleMet ? <PanelAction onClick={() => finish(milestone)}>{label}</PanelAction> :
        <p className="town-play-note">Meet Professor Maple to begin your town introduction.</p>
    )}
  </>;
}

function QuestEntry({ title, steps, children }: {
  title: string;
  steps: { text: string; done: boolean; count?: string }[];
  children?: ReactNode;
}) {
  return <section className="town-play-quest">
    <h3 className="town-play-subheading">{title}</h3>
    <ul className="town-play-list town-play-checklist">
      {steps.map(({ text, done, count }) => <li key={text}>
        <span>{text}</span><span className={done ? 'town-play-done' : ''}>{count ?? (done ? 'Complete' : 'Pending')}</span>
      </li>)}
    </ul>
    {children}
  </section>;
}

function groveQuestSteps({ clearedOvergrowth, wildWins, reported }: OutingState['groveQuest']) {
  return [
    { text: 'Clear overgrowth', done: clearedOvergrowth },
    { text: 'Win two wild battles', done: wildWins >= GROVE_WILD_WINS_REQUIRED, count: `${wildWins} / ${GROVE_WILD_WINS_REQUIRED}` },
    { text: 'Report to Ranger Lina', done: reported },
  ];
}

function sporesQuestSteps({ discovered, investigated, defeated, reported }: OutingState['sporesQuest']) {
  return [
    { text: 'Find the strange spores through Explore', done: discovered },
    { text: 'Investigate the spores', done: investigated },
    { text: 'Defeat Revenant-tainted Paras', done: defeated },
    { text: 'Report to Professor Maple in Brookbend', done: reported },
  ];
}

const PANEL_TITLES: Record<PanelId, string> = {
  maple: 'Maple’s Lab',
  clinic: 'Clinic',
  merra: 'Merra’s Shop',
  board: 'Quest Board',
  gate: 'Travel Gate',
  'grove-lina': 'Report to Ranger Lina',
  'grove-camp': 'Rest / Camp',
  'grove-talk': 'Talk',
  'grove-quests': 'Grove Quests',
  'grove-habitat': 'Brambleberry Grove Habitat',
  'grove-travel': 'Travel',
  workshop: 'Wells’ Workshop',
  talent: 'Talent Lab',
  party: 'Party',
  bag: 'Bag',
  journal: 'Journal',
  settings: 'Save & Settings',
};

type PanelProps = {
  play: TownPlay;
  onClose: () => void;
  onChooseStarter: () => void;
  onEnterGrove: () => void;
  onEnterHollow: () => void;
  onEnterTown: () => void;
  onOpenPanel: (panel: PanelId) => void;
  onOpenJournal: () => void;
};

function PanelContent({ panel, play, onClose, onChooseStarter, onEnterGrove, onEnterHollow, onEnterTown, onOpenPanel, onOpenJournal }: PanelProps & { panel: PanelId }) {
  const { progress, finish, outing, dispatchOuting, hasStarter } = play;
  const lead = getLead(outing);
  const inBattle = outing.encounter?.outcome === 'active' || outing.trainerBattle?.outcome === 'active' ||
    outing.revenantBattle?.outcome === 'active';
  switch (panel) {
    case 'maple': {
      if (!progress.mapleMet) return <>
        <Dialogue speaker="Professor Maple">Welcome to Brookbend. Take this notebook for your field observations. Bulbasaur, Charmander, and Squirtle are ready to join you on your first outing.</Dialogue>
        <PanelAction onClick={() => finish('mapleMet')}>Take the Field Notebook</PanelAction>
      </>;
      if (hasStarter && outing.sporesQuest.defeated) return <>
        <Dialogue speaker="Professor Maple">{outing.sporesQuest.reported
          ? 'Your field notes are on record. Ranger Lina can now keep watch over the restored Grove.'
          : 'Ranger Lina says the spores are clearing. Let me add your findings to the restoration record.'}</Dialogue>
        {outing.sporesQuest.reported
          ? <p className="town-play-progress" role="status">Strange Spores complete · Brambleberry Grove restored to Stage 1.</p>
          : <PanelAction onClick={() => dispatchOuting({ type: 'reportSporesToMaple' })}>Share the Grove report</PanelAction>}
      </>;
      if (hasStarter) return <>
        <Dialogue speaker="Professor Maple">{progress.gateOpen ? 'Bring your Field Notebook whenever you explore Brambleberry Grove.' : 'Check in at the Clinic, Merra’s Shop, and the Quest Board. Then ask Ranger Lina about the trail to Brambleberry Grove.'}</Dialogue>
        {lead && <p className="town-play-progress" role="status">{species[lead.species].name} leads your party.</p>}
      </>;
      return <>
        <Dialogue speaker="Professor Maple">All three will join your party. Pick your lead, then take four Pokéballs for the trail.</Dialogue>
        <ul className="town-play-starters" aria-label="Choose a lead for your starter team">
          {starterIds.map((id) => {
            const starter = species[id];
            const statsId = `town-starter-${id}-stats`;
            const descriptionId = `town-starter-${id}-description`;
            return <li key={id}>
              <button
                className="town-play-starter"
                type="button"
                onClick={() => dispatchOuting({ type: 'chooseStarter', species: id })}
                aria-label={`Choose ${starter.name} as lead`}
                aria-describedby={`${statsId} ${descriptionId}`}
              >
                <PokemonSprite speciesId={id} />
                <span>
                  <strong>{starter.name}</strong>
                  <small id={statsId}>{starter.kind} · {starter.baseHp} HP</small>
                  <small id={descriptionId}>{starter.description}</small>
                </span>
              </button>
            </li>;
          })}
        </ul>
      </>;
    }
    case 'clinic': {
      if (!progress.clinicVisited) return <StopDialogue play={play} milestone="clinicVisited" speaker="Clinic attendant" label="Check in" completed="Clinic stop recorded in your Journal.">
        Bring your party here after a wild encounter. We can treat injured Pokémon and give you a Pokéball if you run out.
      </StopDialogue>;
      if (!hasStarter) return <p className="town-play-note">Come back when you have a partner to care for.</p>;
      if (inBattle) return <p className="town-play-note">Finish your active battle in the Grove before returning for care.</p>;
      return <>
        <Dialogue speaker="Clinic attendant">I can heal your whole party. If you’ve used your last Pokéball, I’ll replace it.{outing.campRestUsed && ' I can also resupply your camp.'}</Dialogue>
        {clinicAvailable(outing) ? <PanelAction onClick={() => dispatchOuting({ type: 'clinic' })}>Heal and resupply</PanelAction>
          : <p className="town-play-progress" role="status">Your party is fully healed and ready for the trail.</p>}
      </>;
    }
    case 'merra':
      return <StopDialogue play={play} milestone="merraMet" speaker="Merra" label="Introduce yourself" completed="Merra’s Shop stop recorded in your Journal.">
        The shelves are a little bare this week. I’ll keep a space for supplies the rangers bring back from the Hollow.
      </StopDialogue>;
    case 'board':
      return <StopDialogue play={play} milestone="boardRead" speaker="Town notice" label="Record the notice" completed="Town notice recorded in your Journal.">
        Field volunteers wanted to scout wild Pokémon in Brambleberry Grove. Check in with Ranger Lina before taking the east trail.
      </StopDialogue>;
    case 'gate':
      if (play.canEnterGrove) return <>
        <Dialogue speaker="Ranger Lina">The east trail leads to Brambleberry Grove. Look for wild Pokémon along the banks and bring your party back to the Clinic when they need care.</Dialogue>
        <p className="town-play-progress" role="status">Trail Pass added to your Bag.</p>
        <PanelAction onClick={onEnterGrove}>Enter Brambleberry Grove</PanelAction>
      </>;
      if (!progress.mapleMet || play.nextTourStop) return <>
        <Dialogue speaker="Ranger Lina">I clear travelers once Maple’s introduction and the town rounds are done. Check your Journal if you’re unsure where to go.</Dialogue>
        <p className="town-play-note">{play.objective}</p>
      </>;
      if (!hasStarter) return <>
        <Dialogue speaker="Ranger Lina">Meet your starter team at Maple’s Lab before you take the east trail.</Dialogue>
        <PanelAction onClick={onChooseStarter}>Visit Maple’s Lab</PanelAction>
      </>;
      return <>
        <Dialogue speaker="Ranger Lina">Take this Trail Pass and keep it with your notes. Follow the east trail to the grove. Youngster Theo can show your team how a trainer battle works.</Dialogue>
        <PanelAction onClick={() => finish('gateOpen')}>Accept the Trail Pass</PanelAction>
      </>;
    case 'grove-lina': {
      const phase = getGroveQuestPhase(outing);
      if (outing.sporesQuest.defeated) return <Dialogue speaker="Ranger Lina">{outing.sporesQuest.reported
        ? 'The Grove can breathe again. I’ll keep an eye on the plants along the creek.'
        : 'The spore cloud is thinning. Take your Field Notebook to Professor Maple in Brookbend.'}</Dialogue>;
      if (outing.sporesQuest.discovered) return <Dialogue speaker="Ranger Lina">That haze belongs to Revenant-tainted Paras. Bring three conscious Pokémon when you follow the spores into the clearing.</Dialogue>;
      if (phase === 'complete') return <Dialogue speaker="Ranger Lina">I’ve finished assessing the grove. I’ll need your help investigating the strange spores next.</Dialogue>;
      if (phase !== 'report' || outing.encounter || outing.trainerBattle) {
        return <Dialogue speaker="Ranger Lina">Clear the overgrowth and win two wild battles before we compare notes.</Dialogue>;
      }
      return <>
        <Dialogue speaker="Ranger Lina">That clears a path to the creek. Show me where you met the wild Pokémon so I can finish my assessment.</Dialogue>
        <PanelAction onClick={() => {
          dispatchOuting({ type: 'reportGroveToLina' });
          onClose();
        }}>Share your field notes</PanelAction>
      </>;
    }
    case 'grove-camp':
      return <div className="town-play-action-stack">
        <p>Once between Clinic resupplies, rest to recover up to {CAMP_HEAL_PERCENT}% of each conscious Pokémon’s maximum HP.</p>
        {outing.campRestUsed
          ? <p className="town-play-progress" role="status">Camp rest used. Heal and resupply at the Brookbend Clinic to rest here again.</p>
          : <PanelAction disabled={!canRestAtCamp(outing)} onClick={() => dispatchOuting({ type: 'restAtCamp' })}>Rest at camp</PanelAction>}
        {!outing.campRestUsed && !canRestAtCamp(outing) && <p>Camp is available when a conscious Pokémon needs healing.</p>}
      </div>;
    case 'grove-talk': {
      const trainers = [
        { id: 'theo', button: 'Train with Youngster Theo', match: '3v2 training match' },
        { id: 'rusk', button: 'Challenge Rusk Vale', match: '3v3 trainer battle' },
      ] as const;
      return <ul className="town-play-list town-play-local-people" aria-label="People in Brambleberry Grove">
        <li>
          <p>Ranger Lina is assessing the Grove.</p>
          <PanelAction onClick={() => onOpenPanel('grove-lina')}>Speak with Ranger Lina</PanelAction>
        </li>
        {trainers.filter(({ id }) => id === 'theo' || outing.theoDefeated).map(({ id, button, match }) => {
          const ready = canBeginTrainer(outing, id);
          return <li key={id}>
            <p>{match}{!ready && ' · Bring three conscious Pokémon'}</p>
            <PanelAction disabled={!ready} onClick={() => {
              dispatchOuting({ type: 'startTrainer', trainerId: id });
              onClose();
            }}>{button}</PanelAction>
          </li>;
        })}
      </ul>;
    }
    case 'grove-quests': {
      const { explored, reported } = outing.groveQuest;
      return <>
        <QuestEntry title="First Steps into Verdant Hollow" steps={[
          { text: 'Explore Brambleberry Grove', done: explored, count: explored ? 'Complete' : 'Available' },
        ]} />
        {explored && <QuestEntry title="A Grove in Need" steps={groveQuestSteps(outing.groveQuest)}>
          <PanelAction onClick={onOpenJournal}>Open Field Journal</PanelAction>
        </QuestEntry>}
        {reported && <QuestEntry title="Strange Spores" steps={sporesQuestSteps(outing.sporesQuest)}>
          {canOpenSporesDiscovery(outing) && <PanelAction onClick={() => {
            dispatchOuting({ type: 'openSporesDiscovery' });
            onClose();
          }}>{outing.sporesQuest.investigated ? 'Return to the spores' : 'Investigate the spores'}</PanelAction>}
        </QuestEntry>}
      </>;
    }
    case 'grove-habitat': {
      const steps = groveQuestSteps(outing.groveQuest);
      const done = steps.filter((step) => step.done).length;
      const restored = outing.sporesQuest.defeated;
      return <section className="town-play-action-stack" aria-label="Restoration progress">
        <h3 className="town-play-subheading">{restored ? 'Stage 1 · Restored' : 'Stage 0 · Unrestored'}</h3>
        <progress className="town-play-survey-meter" aria-label="Grove survey objectives" max={steps.length} value={done} />
        <p>{done} of {steps.length} Grove survey objectives complete.</p>
        <p>{restored ? 'The Revenant spores have cleared from Brambleberry Grove.' : 'Defeat the Revenant in Strange Spores to reach Stage 1.'}</p>
      </section>;
    }
    case 'grove-travel':
      return <nav className="town-play-action-stack" aria-label="Travel destinations">
        <PanelAction onClick={onEnterHollow}>Verdant Hollow</PanelAction>
        <PanelAction onClick={onEnterTown}>Return to Brookbend</PanelAction>
      </nav>;
    case 'workshop':
      return <p className="town-play-note">Wells’ Workshop is closed for repairs. The workbench will reopen after Wells returns.</p>;
    case 'talent':
      return <p className="town-play-note">The Talent Lab is closed. Professor Maple will share more as the town rebuilds.</p>;
    case 'party': {
      if (!hasStarter) return <p className="town-play-note">Meet your starter team at Maple’s Lab.</p>;
      return <>
        {inBattle && <p className="town-play-note town-play-party-note">Use the battle commands to switch Pokémon.</p>}
        <ul className="town-play-list town-play-party" aria-label="Party members">
          {outing.party.map((companion) => {
            const partner = species[companion.species];
            const isLead = companion.id === outing.leadId;
            const hp = maxHp(companion);
            return <li key={companion.id}>
              <PokemonSprite speciesId={companion.species} />
              <span className="town-play-member">
                <strong>{partner.name}</strong>
                <span>{partner.kind} · Lv. {levelOf(companion)}</span>
                <span>{companion.hp}/{hp} HP</span>
              </span>
              {isLead ? <span className="town-play-lead">Lead</span> : <PanelAction
                onClick={() => dispatchOuting({ type: 'selectLead', id: companion.id })}
                disabled={inBattle || companion.hp === 0}
                label={`Lead with ${partner.name}`}
              >Set as lead</PanelAction>}
            </li>;
          })}
        </ul>
      </>;
    }
    case 'bag':
      return progress.mapleMet ? <ul className="town-play-list">
        <li><span>Field Notebook</span><span>1</span></li>
        {progress.gateOpen && <li><span>Trail Pass</span><span>1</span></li>}
        {hasStarter && <li><span>Pokéballs</span><span>{outing.pokeBalls}</span></li>}
        {outing.fieldSupplies > 0 && <li><span>Oran Berries</span><span>{outing.fieldSupplies}</span></li>}
      </ul> : <p className="town-play-note">Your Bag is empty.</p>;
    case 'journal': {
      const { explored, reported } = outing.groveQuest;
      const steps = [
        { text: 'Meet Professor Maple', done: progress.mapleMet },
        { text: 'Meet your starter team', done: hasStarter },
        ...TOUR.map(({ objective, milestone }) => ({ text: objective, done: progress[milestone] })),
        { text: 'Get clearance from Ranger Lina', done: progress.gateOpen },
      ];
      if (progress.gateOpen) steps.push(
        { text: 'Win Youngster Theo’s training match', done: outing.theoDefeated },
        { text: 'Defeat Rusk Vale', done: outing.ruskDefeated },
      );
      return <>
        {reported && <QuestEntry title="Strange Spores" steps={sporesQuestSteps(outing.sporesQuest)} />}
        {explored && <QuestEntry title="A Grove in Need" steps={groveQuestSteps(outing.groveQuest)} />}
        {play.canEnterGrove && <QuestEntry title="First Steps into Verdant Hollow" steps={[
          { text: 'Explore Brambleberry Grove', done: explored },
        ]} />}
        <QuestEntry title="Welcome to Brookbend" steps={steps} />
      </>;
    }
    case 'settings':
      return <SaveSettings play={play} />;
  }
}

export function TownPanel({ panel, ...props }: PanelProps & { panel: PanelId | null }) {
  const { onClose } = props;
  const dialogRef = useRef<HTMLDialogElement>(null);
  const headingRef = useRef<HTMLHeadingElement>(null);
  const titleId = useId();
  const open = panel !== null;

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!open || !dialog) return;
    const previousFocus = document.activeElement;
    dialog.showModal();
    return () => {
      if (dialog.open) dialog.close();
      if (previousFocus instanceof HTMLElement && previousFocus.isConnected) previousFocus.focus({ preventScroll: true });
    };
  }, [open]);

  useEffect(() => {
    if (!panel) return;
    if (dialogRef.current) dialogRef.current.scrollTop = 0;
    headingRef.current?.focus({ preventScroll: true });
  }, [panel]);

  if (!panel) return null;

  return <dialog
    ref={dialogRef}
    className="town-play-dialog"
    aria-labelledby={titleId}
    onCancel={(event) => {
      event.preventDefault();
      onClose();
    }}
    onClick={(event) => {
      if (event.target === event.currentTarget) onClose();
    }}
  >
    <div className="town-play-frame">
      <header className="town-play-header">
        <h2 id={titleId} ref={headingRef} tabIndex={-1}>{PANEL_TITLES[panel]}</h2>
        <button className="town-play-close" type="button" onClick={onClose} aria-label="Close panel">×</button>
      </header>
      <div className="town-play-content" key={panel}>
        <PanelContent panel={panel} {...props} />
      </div>
    </div>
  </dialog>;
}

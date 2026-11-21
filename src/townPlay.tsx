import { useEffect, useId, useRef, useState, type ReactNode } from 'react';
import './townPlay.css';

export type PanelId = 'maple' | 'clinic' | 'merra' | 'board' | 'gate' | 'workshop' | 'talent' | 'party' | 'bag' | 'journal' | 'settings';
export type GroveStage = 'arrival' | 'surveyed' | 'restored';

const SAVE_KEY = 'wild-reclaim.brookbend.opening.v1';
const MILESTONES = [
  'mapleMet', 'clinicVisited', 'merraMet', 'boardRead', 'gateOpen',
  'groveSurveyed', 'groveRestored', 'bridgeRepaired',
] as const;
type Milestone = typeof MILESTONES[number];
type Progress = Record<Milestone, boolean>;

const GROVE_REQUIREMENTS: Partial<Record<Milestone, Milestone>> = {
  groveSurveyed: 'gateOpen',
  groveRestored: 'groveSurveyed',
  bridgeRepaired: 'groveRestored',
};

const FIRST_VISIT: Progress = {
  mapleMet: false,
  clinicVisited: false,
  merraMet: false,
  boardRead: false,
  gateOpen: false,
  groveSurveyed: false,
  groveRestored: false,
  bridgeRepaired: false,
};

const TOUR = [
  { milestone: 'clinicVisited', panel: 'clinic', objective: 'Check in at the Clinic', actionLabel: 'Visit the Clinic' },
  { milestone: 'merraMet', panel: 'merra', objective: 'Meet Merra', actionLabel: 'Visit Merra’s Shop' },
  { milestone: 'boardRead', panel: 'board', objective: 'Read the town notice', actionLabel: 'Visit the Quest Board' },
] as const;

function readProgress(value: string | null): Progress {
  if (!value) return FIRST_VISIT;
  const parsed = JSON.parse(value) as Partial<Progress> | null;
  if (!parsed || typeof parsed !== 'object') return FIRST_VISIT;
  const gateOpen = parsed.gateOpen === true;
  const groveSurveyed = gateOpen && parsed.groveSurveyed === true;
  const groveRestored = groveSurveyed && parsed.groveRestored === true;
  return {
    mapleMet: parsed.mapleMet === true,
    clinicVisited: parsed.clinicVisited === true,
    merraMet: parsed.merraMet === true,
    boardRead: parsed.boardRead === true,
    gateOpen,
    groveSurveyed,
    groveRestored,
    bridgeRepaired: groveRestored && parsed.bridgeRepaired === true,
  };
}

function loadProgress(): Progress {
  try {
    return readProgress(window.localStorage.getItem(SAVE_KEY));
  } catch {
    return FIRST_VISIT;
  }
}

function mergeProgress(current: Progress, incoming: Progress): Progress {
  if (MILESTONES.every((key) => current[key] || !incoming[key])) return current;
  return {
    mapleMet: current.mapleMet || incoming.mapleMet,
    clinicVisited: current.clinicVisited || incoming.clinicVisited,
    merraMet: current.merraMet || incoming.merraMet,
    boardRead: current.boardRead || incoming.boardRead,
    gateOpen: current.gateOpen || incoming.gateOpen,
    groveSurveyed: current.groveSurveyed || incoming.groveSurveyed,
    groveRestored: current.groveRestored || incoming.groveRestored,
    bridgeRepaired: current.bridgeRepaired || incoming.bridgeRepaired,
  };
}

export function useTownPlay() {
  const [progress, setProgress] = useState(loadProgress);
  const [saveStatus, setSaveStatus] = useState<'pending' | 'saved' | 'unavailable'>('pending');

  function finish(milestone: Milestone) {
    const prerequisite = GROVE_REQUIREMENTS[milestone];
    setProgress((current) => {
      if (current[milestone] || (prerequisite && !current[prerequisite])) return current;
      return { ...current, [milestone]: true };
    });
  }

  useEffect(() => {
    try {
      const merged = mergeProgress(progress, loadProgress());
      window.localStorage.setItem(SAVE_KEY, JSON.stringify(merged));
      setProgress(merged);
      setSaveStatus('saved');
    } catch {
      setSaveStatus('unavailable');
    }
  }, [progress]);

  useEffect(() => {
    function catchUp(event: StorageEvent) {
      if (event.key !== SAVE_KEY) return;
      try {
        const incoming = readProgress(event.newValue);
        setProgress((current) => mergeProgress(current, incoming));
      } catch {
        // An invalid save in another tab does not replace current progress.
      }
    }

    window.addEventListener('storage', catchUp);
    return () => window.removeEventListener('storage', catchUp);
  }, []);

  const nextTourStop = TOUR.find(({ milestone }) => !progress[milestone]);
  const openingObjective = progress.mapleMet ? nextTourStop : {
    objective: 'Meet Professor Maple',
    actionLabel: 'Visit Professor Maple',
    panel: 'maple' as const,
  };
  const groveStage: GroveStage = progress.groveRestored ? 'restored' : progress.groveSurveyed ? 'surveyed' : 'arrival';
  const objective = openingObjective?.objective ?? (
    progress.bridgeRepaired ? 'Brookbend’s bridge repaired' :
      progress.groveRestored ? 'Grove crossing cleared' :
        progress.gateOpen ? 'Verdant Hollow route open' : 'Speak to Ranger Lina'
  );
  const actionLabel = openingObjective?.actionLabel ?? (progress.gateOpen ? 'Read the route briefing' : 'Visit the Travel Gate');
  const actionTarget: PanelId = openingObjective?.panel ?? 'gate';

  return {
    objective, actionLabel, actionTarget, gateOpen: progress.gateOpen, progress, finish, saveStatus, nextTourStop,
    groveStage,
    bridgeRepaired: progress.bridgeRepaired,
    surveyGrove: () => finish('groveSurveyed'),
    restoreGrove: () => finish('groveRestored'),
    returnFromGrove: () => finish('bridgeRepaired'),
  };
}

type TownPlay = ReturnType<typeof useTownPlay>;

function Dialogue({ speaker, children }: { speaker: string; children: ReactNode }) {
  return <blockquote className="town-play-dialogue">
    <p className="town-play-speaker">{speaker}</p>
    <p>{children}</p>
  </blockquote>;
}

function PanelAction({ onClick, children }: { onClick: () => void; children: ReactNode }) {
  return <button className="town-play-action" type="button" onClick={onClick}>{children}</button>;
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

const PANEL_TITLES: Record<PanelId, string> = {
  maple: 'Maple’s Lab',
  clinic: 'Clinic',
  merra: 'Merra’s Shop',
  board: 'Quest Board',
  gate: 'Travel Gate',
  workshop: 'Wells’ Workshop',
  talent: 'Talent Lab',
  party: 'Party',
  bag: 'Bag',
  journal: 'Journal',
  settings: 'Save & Settings',
};

function PanelContent({ panel, play, onEnterGrove }: { panel: PanelId; play: TownPlay; onEnterGrove?: () => void }) {
  const { progress, finish } = play;
  switch (panel) {
    case 'maple':
      return progress.mapleMet ? <>
        <Dialogue speaker="Professor Maple">Once you’ve made your rounds, Ranger Lina can clear you for Verdant Hollow. We’re starting with Brambleberry Grove.</Dialogue>
        <p className="town-play-progress" role="status">Field Notebook added to your Bag.</p>
      </> : <>
        <Dialogue speaker="Professor Maple">Welcome to Brookbend. You’ve seen the tarps on our roofs. Out in Brambleberry Grove, we have work to do as well. Take this notebook, then stop at the Clinic, Merra’s Shop, and the Quest Board before you head for the gate.</Dialogue>
        <PanelAction onClick={() => finish('mapleMet')}>Take the Field Notebook</PanelAction>
      </>;
    case 'clinic':
      return <StopDialogue play={play} milestone="clinicVisited" speaker="Clinic attendant" label="Check in" completed="Clinic stop recorded in your Journal.">
        The west room is still under a tarp. Come through this door if you or a partner needs tending.
      </StopDialogue>;
    case 'merra':
      return <StopDialogue play={play} milestone="merraMet" speaker="Merra" label="Introduce yourself" completed="Merra’s Shop stop recorded in your Journal.">
        The shelves are a little bare this week. I’ll keep a space for supplies the rangers bring back from the Hollow.
      </StopDialogue>;
    case 'board':
      return <StopDialogue play={play} milestone="boardRead" speaker="Town notice" label="Record the notice" completed="Town notice recorded in your Journal.">
        Field volunteers wanted for Brambleberry Grove. Check in with Ranger Lina at the Travel Gate before taking the east trail.
      </StopDialogue>;
    case 'gate':
      if (progress.gateOpen) return <>
        <Dialogue speaker="Ranger Lina">{progress.bridgeRepaired ?
          'Water’s running through the grove again, and the crew laid new planks on our footbridge. The east trail stays open if you want another look.' :
          'Follow the east trail into Verdant Hollow. Brambleberry Grove is our first survey site. Bring your Field Notebook and check where the creek has backed up by the crossing.'}</Dialogue>
        {onEnterGrove && <PanelAction onClick={onEnterGrove}>Head to Brambleberry Grove</PanelAction>}
        <p className="town-play-progress" role="status">{progress.bridgeRepaired ? 'Bridge repaired.' : 'Travel cleared. Trail Pass added to your Bag.'}</p>
      </>;
      if (!progress.mapleMet || play.nextTourStop) return <>
        <Dialogue speaker="Ranger Lina">I clear travelers once Maple’s introduction and the town rounds are done. Check your Journal if you’re unsure where to go.</Dialogue>
        <p className="town-play-note">{play.objective}</p>
      </>;
      return <>
        <Dialogue speaker="Ranger Lina">I have your name on the field list. Take this pass and keep it with your notes. We’ll start the grove survey from the east trail.</Dialogue>
        <PanelAction onClick={() => finish('gateOpen')}>Accept the Trail Pass</PanelAction>
      </>;
    case 'workshop':
      return <p className="town-play-note">Wells’ Workshop is closed for repairs. The workbench will reopen after Wells returns.</p>;
    case 'talent':
      return <p className="town-play-note">The Talent Lab is closed. Professor Maple will share more as the town rebuilds.</p>;
    case 'party':
      return <p className="town-play-note">No partners in your party yet.</p>;
    case 'bag':
      return progress.mapleMet ? <ul className="town-play-list">
        <li><span>Field Notebook</span><span>1</span></li>
        {progress.gateOpen && <li><span>Trail Pass</span><span>1</span></li>}
      </ul> : <p className="town-play-note">Your Bag is empty.</p>;
    case 'journal': {
      const steps = [
        { text: 'Meet Professor Maple', done: progress.mapleMet },
        ...TOUR.map(({ objective, milestone }) => ({ text: objective, done: progress[milestone] })),
        { text: 'Get clearance from Ranger Lina', done: progress.gateOpen },
      ];
      return <>
        <h3 className="town-play-subheading">Welcome to Brookbend</h3>
        <ul className="town-play-list town-play-checklist">
          {steps.map(({ text, done }) => <li key={text}>
            <span>{text}</span><span className={done ? 'town-play-done' : ''}>{done ? 'Complete' : 'Pending'}</span>
          </li>)}
        </ul>
        {progress.gateOpen && <>
          <h3 className="town-play-subheading">Brambleberry Grove</h3>
          <ul className="town-play-list town-play-checklist">
            <li><span>Survey the blocked crossing</span><span className={progress.groveSurveyed ? 'town-play-done' : ''}>{progress.groveSurveyed ? 'Complete' : 'Pending'}</span></li>
            <li><span>Restore the creek’s flow</span><span className={progress.groveRestored ? 'town-play-done' : ''}>{progress.groveRestored ? 'Complete' : 'Pending'}</span></li>
            <li><span>Return to Brookbend and see the new bridge planks</span><span className={progress.bridgeRepaired ? 'town-play-done' : ''}>{progress.bridgeRepaired ? 'Complete' : 'Pending'}</span></li>
          </ul>
        </>}
      </>;
    }
    case 'settings':
      return <p className="town-play-note" role="status">{
        play.saveStatus === 'saved' ? 'Progress is saved automatically in this browser.' :
          play.saveStatus === 'unavailable' ? 'Browser storage is unavailable. Progress lasts until you leave or reload.' :
            'Checking browser storage…'
      }</p>;
  }
}

export function TownPanel({ panel, play, onClose, onEnterGrove }: {
  panel: PanelId | null;
  play: TownPlay;
  onClose: () => void;
  onEnterGrove?: () => void;
}) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const titleId = useId();

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!panel || !dialog || dialog.open) return;
    const previousFocus = document.activeElement;
    dialog.showModal();
    return () => {
      if (dialog.open) dialog.close();
      if (previousFocus instanceof HTMLElement && previousFocus.isConnected) previousFocus.focus({ preventScroll: true });
    };
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
        <h2 id={titleId}>{PANEL_TITLES[panel]}</h2>
        <button className="town-play-close" type="button" onClick={onClose} aria-label="Close panel">×</button>
      </header>
      <div className="town-play-content" key={panel}>
        <PanelContent panel={panel} play={play} onEnterGrove={onEnterGrove} />
      </div>
    </div>
  </dialog>;
}

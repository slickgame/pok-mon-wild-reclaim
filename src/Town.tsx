import { useEffect, useState, type CSSProperties } from "react";
import { ChevronDown, ChevronRight, EyeOff } from "lucide-react";
import { GroveOuting } from "./GroveOuting";
import type { WorldLocation } from "./gameSave";
import { RevenantBattleView } from "./RevenantBattleView";
import { TrainerBattleView } from "./TrainerBattleView";
import { TownPanel, useTownPlay, type PanelId } from "./townPlay";

type GlyphName = "party" | "bag" | "journal" | "settings" | "leaf" | "eye" | "lock" | "board" | "clinic" | "gate";

type Place = {
  id: PanelId;
  name: string;
  icon: GlyphName;
  x: number;
  y: number;
};

const places: Place[] = [
  { id: "maple", name: "Maple’s Lab", icon: "leaf", x: 20.45, y: 26.5 },
  { id: "clinic", name: "Clinic", icon: "clinic", x: 18.80, y: 43.1 },
  { id: "merra", name: "Merra’s Shop", icon: "bag", x: 48.0, y: 40.45 },
  { id: "board", name: "Quest Board", icon: "board", x: 32.55, y: 50.4 },
  { id: "gate", name: "Travel Gate", icon: "gate", x: 52.05, y: 15.65 },
  { id: "workshop", name: "Wells’ Workshop", icon: "lock", x: 9.65, y: 77.15 },
  { id: "talent", name: "Talent Lab", icon: "lock", x: 69.3, y: 77.2 },
];

const tools: { id: Extract<PanelId, GlyphName>; label: string }[] = [
  { id: "party", label: "Party" },
  { id: "bag", label: "Bag" },
  { id: "journal", label: "Journal" },
  { id: "settings", label: "Save & Settings" },
];

const destinations = {
  town: { hash: "", title: "Brookbend Town", heading: "town-name" },
  hollow: { hash: "#verdant-hollow", title: "Verdant Hollow", heading: "hollow-name" },
  grove: { hash: "#brambleberry-grove", title: "Brambleberry Grove", heading: "grove-name" },
};
function requestedLocation(): WorldLocation | undefined {
  if (window.location.hash === destinations.grove.hash) return "grove";
  if (window.location.hash === destinations.hollow.hash) return "hollow";
  if (window.location.hash === "#brookbend") return "town";
}

function showLocation(location: WorldLocation, replace = false) {
  const hash = destinations[location].hash;
  if (window.location.hash === hash) return;
  const url = new URL(window.location.href);
  url.hash = hash;
  if (replace) window.history.replaceState(window.history.state, "", url);
  else window.history.pushState(window.history.state, "", url);
}

function Glyph({ name }: { name: GlyphName }) {
  const style = name === "clinic" || name === "gate" ? undefined : {
    "--glyph-image": `url('/art/ui/${name}.png')`,
  } as CSSProperties;
  return <span className={`glyph glyph--${name}`} style={style} aria-hidden="true" />;
}

export function Town() {
  const [panel, setPanel] = useState<PanelId | null>(null);
  const [showPlaces, setShowPlaces] = useState(false);
  const [journalOpen, setJournalOpen] = useState(false);
  const play = useTownPlay(requestedLocation());
  const trainerBattle = play.outing.trainerBattle;
  const revenantBattle = play.outing.revenantBattle;
  const { location, travel: saveTravel } = play;
  const inGrove = location === "grove";
  const isLocked = (id: PanelId) =>
    id === "workshop" || id === "talent" || (id === "gate" && !play.canEnterGrove);

  useEffect(() => {
    function restoreLocation() {
      setPanel(null);
      setJournalOpen(false);
      const destination = saveTravel(requestedLocation() ?? "town");
      showLocation(destination, true);
    }

    window.addEventListener("hashchange", restoreLocation);
    return () => window.removeEventListener("hashchange", restoreLocation);
  }, [saveTravel]);

  useEffect(() => {
    showLocation(location, true);
    const { title, heading } = destinations[location];
    document.title = `${title} · Pokémon Wild Reclaim`;
    if (document.activeElement === document.body) {
      document.getElementById(heading)?.focus({ preventScroll: true });
    }
  }, [location]);

  function travel(destination: WorldLocation, nextPanel: PanelId | null = null) {
    if (saveTravel(destination) !== destination) return;
    showLocation(destination);
    setPanel(nextPanel);
    setJournalOpen(false);
    window.scrollTo(0, 0);
  }

  const toolbar = (
    <nav className="tool-bar bevel" aria-label="Player tools">
      {tools.map(({ id, label }) => (
        <button key={id} className={`tool-button tool-button--${id}`} aria-label={label} onClick={() => setPanel(id)}>
          <Glyph name={id} />
          {id !== "settings" && <span>{label}</span>}
        </button>
      ))}
    </nav>
  );

  return <>
    {inGrove && revenantBattle ? <RevenantBattleView
      battle={revenantBattle}
      onAction={(action) => play.dispatchOuting({ type: "revenantAction", action })}
      onReturn={() => play.dispatchOuting({ type: "closeRevenant" })}
      onVisitClinic={() => travel("town", "clinic")}
    /> : inGrove && trainerBattle ? <TrainerBattleView
      battle={trainerBattle}
      onAction={(action) => play.dispatchOuting({ type: "trainerAction", action })}
      onReturn={() => play.dispatchOuting({ type: "closeTrainer" })}
      onVisitClinic={() => travel("town", "clinic")}
      toolbar={toolbar}
    /> : inGrove ? <GroveOuting
      outing={play.outing}
      onAction={play.dispatchOuting}
      onReturn={() => travel("town")}
      onVisitClinic={() => travel("town", "clinic")}
      onSpeakToLina={() => setPanel("grove-lina")}
      onOpenZonePanel={setPanel}
      journalOpen={journalOpen}
      onCloseJournal={() => setJournalOpen(false)}
      toolbar={toolbar}
    /> : location === "hollow" ? <main className="town" aria-labelledby="hollow-name">
      <div className="atlas">
        <div className="map-frame">
          <img className="town-art" src="/art/brambleberry-grove.webp"
            alt="A woodland trail follows the creek into Brambleberry Grove."
            width="1672" height="941" fetchPriority="high" />
        </div>
      </div>
      {toolbar}
      <section className="town-card bevel" aria-label="Verdant Hollow overview">
        <h1 id="hollow-name" tabIndex={-1}>Verdant Hollow</h1>
        <img className="town-divider" src="/art/ui/divider.png" alt="" />
        <p className="town-objective">Greenwood Frontier</p>
        <nav className="town-play-action-stack" aria-label="Verdant Hollow destinations">
          <button className="town-play-action" type="button" onClick={() => travel("grove")}>Enter Brambleberry Grove</button>
          <button className="town-play-action" type="button" onClick={() => travel("town")}>Return to Brookbend</button>
        </nav>
      </section>
    </main> : <main className="town" aria-labelledby="town-name">
      <div className="atlas">
        <div className="map-frame">
          <img
            className="town-art"
            src="/art/brookbend-town.webp"
            alt="An illustrated riverside town with a boarded greenhouse, patched roofs, and a wooden bridge."
            width="1672"
            height="941"
            fetchPriority="high"
          />
          <nav className="map-places" aria-label="Town map">
            {places.map(({ id, name, icon, x, y }) => {
              const locked = isLocked(id);
              return (
                <button
                  key={id}
                  className={`map-pin${locked ? " map-pin--locked" : ""}`}
                  style={{ "--pin-x": `${x}%`, "--pin-y": `${y}%` } as CSSProperties}
                  aria-label={locked ? `${name} (locked)` : name}
                  onClick={() => setPanel(id)}
                >
                  <span className="pin-point"><Glyph name={locked ? "lock" : icon} /></span>
                  <span className="pin-label">{name}</span>
                </button>
              );
            })}
          </nav>
        </div>
      </div>

      {toolbar}

      <section className="town-card bevel" aria-label="Town objective">
        <h1 id="town-name" tabIndex={-1}>Brookbend Town</h1>
        <img className="town-divider" src="/art/ui/divider.png" alt="" />
        <p className="town-objective" aria-live="polite">{play.objective}</p>
        <button className="objective-button bevel" onClick={() => {
          if (play.actionTarget === "gate" && play.canEnterGrove) travel("grove");
          else setPanel(play.actionTarget);
        }}>
          <Glyph name="leaf" />
          <span>{play.actionLabel}</span>
          <ChevronRight aria-hidden="true" />
        </button>
        <button
          className="places-toggle bevel"
          aria-expanded={showPlaces}
          aria-controls="places-list"
          onClick={() => setShowPlaces((previous) => !previous)}
        >
          {showPlaces ? <EyeOff aria-hidden="true" /> : <Glyph name="eye" />}
          <span>{showPlaces ? "Hide Places" : "Show Places"}</span>
          <ChevronDown className={showPlaces ? "flipped" : undefined} aria-hidden="true" />
        </button>
        <nav className="places-list" id="places-list" aria-label="Town places" tabIndex={0} hidden={!showPlaces}>
          {places.map(({ id, name, icon }) => {
            const locked = isLocked(id);
            return (
              <button
                key={id}
                className="place-row"
                aria-label={locked ? `${name} (locked)` : name}
                onClick={() => setPanel(id)}
              >
                <Glyph name={locked ? "lock" : icon} />
                <span>{name}</span>
                <ChevronRight aria-hidden="true" />
              </button>
            );
          })}
        </nav>
      </section>

    </main>}
    <TownPanel
      panel={panel}
      play={play}
      onClose={() => setPanel(null)}
      onChooseStarter={() => setPanel("maple")}
      onEnterGrove={() => travel("grove")}
      onEnterHollow={() => travel("hollow")}
      onEnterTown={() => travel("town")}
      onOpenPanel={setPanel}
      onOpenJournal={() => {
        setPanel(null);
        setJournalOpen(true);
      }}
    />
  </>;
}

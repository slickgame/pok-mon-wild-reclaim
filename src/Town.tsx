import { useEffect, useState, type CSSProperties } from "react";
import { ChevronDown, ChevronRight, EyeOff } from "lucide-react";
import { GroveOuting } from "./GroveOuting";
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

const GROVE_HASH = "#brambleberry-grove";

function Glyph({ name }: { name: GlyphName }) {
  const style = name === "clinic" || name === "gate" ? undefined : {
    "--glyph-image": `url('/art/ui/${name}.png')`,
  } as CSSProperties;
  return <span className={`glyph glyph--${name}`} style={style} aria-hidden="true" />;
}

export function Town() {
  const [panel, setPanel] = useState<PanelId | null>(null);
  const [showPlaces, setShowPlaces] = useState(false);
  const play = useTownPlay();
  const [inGrove, setInGrove] = useState(() => play.canEnterGrove && window.location.hash === GROVE_HASH);
  const isLocked = (id: PanelId) =>
    id === "workshop" || id === "talent" || (id === "gate" && !play.canEnterGrove);

  useEffect(() => {
    function readLocation() {
      const groveRequested = window.location.hash === GROVE_HASH;
      if (groveRequested && !play.canEnterGrove) {
        const url = new URL(window.location.href);
        url.hash = "";
        window.history.replaceState(window.history.state, "", url);
      }
      setInGrove(groveRequested && play.canEnterGrove);
    }

    function restoreLocation() {
      setPanel(null);
      readLocation();
    }

    readLocation();
    window.addEventListener("hashchange", restoreLocation);
    return () => window.removeEventListener("hashchange", restoreLocation);
  }, [play.canEnterGrove]);

  useEffect(() => {
    document.title = `${inGrove ? "Brambleberry Grove" : "Brookbend Town"} · Pokémon Wild Reclaim`;
    if (document.activeElement === document.body) {
      document.getElementById(inGrove ? "grove-name" : "town-name")?.focus({ preventScroll: true });
    }
  }, [inGrove]);

  function travel(toGrove: boolean, nextPanel: PanelId | null = null) {
    if (toGrove && !play.canEnterGrove) return;
    if (!toGrove && play.outing.encounter) play.dispatchOuting({ type: "closeEncounter" });
    const url = new URL(window.location.href);
    url.hash = toGrove ? GROVE_HASH : "";
    if (url.hash !== window.location.hash) window.history.pushState(window.history.state, "", url);
    setPanel(nextPanel);
    setInGrove(toGrove);
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
    {inGrove ? <GroveOuting
      outing={play.outing}
      onAction={play.dispatchOuting}
      onReturn={() => travel(false)}
      onVisitClinic={() => travel(false, "clinic")}
      toolbar={toolbar}
    /> : <main className="town" aria-labelledby="town-name">
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
          if (play.actionTarget === "gate" && play.canEnterGrove) travel(true);
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
      onEnterGrove={() => travel(true)}
    />
  </>;
}

import { useState, type CSSProperties } from "react";
import { ChevronDown, ChevronRight, EyeOff } from "lucide-react";
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
  const isLocked = (id: PanelId) =>
    id === "workshop" || id === "talent" || (id === "gate" && !play.gateOpen);

  return (
    <main className="town" aria-labelledby="town-name">
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

      <nav className="tool-bar bevel" aria-label="Player tools">
        {tools.map(({ id, label }) => (
          <button key={id} className={`tool-button tool-button--${id}`} aria-label={label} onClick={() => setPanel(id)}>
            <Glyph name={id} />
            {id !== "settings" && <span>{label}</span>}
          </button>
        ))}
      </nav>

      <section className="town-card bevel" aria-label="Town objective">
        <h1 id="town-name">Brookbend Town</h1>
        <img className="town-divider" src="/art/ui/divider.png" alt="" />
        <p className="town-objective" aria-live="polite">{play.objective}</p>
        <button className="objective-button bevel" onClick={() => setPanel(play.actionTarget)}>
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
        <nav className="places-list" id="places-list" aria-label="Town places" hidden={!showPlaces}>
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

      <TownPanel panel={panel} play={play} onClose={() => setPanel(null)} />
    </main>
  );
}

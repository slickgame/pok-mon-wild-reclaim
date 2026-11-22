import { useId, useState } from "react";
import { ChevronLeft, ChevronRight, Settings } from "lucide-react";
import "@fontsource/gelasio/latin-700-italic.css";
import type { GrovePanelId } from "./townPlay";
import "./groveSidebar.css";

const actions = [
  { icon: "explore", label: "Explore", destination: "explore" },
  { icon: "party", label: "Party", destination: "party" },
  { icon: "bag", label: "Bag", destination: "bag" },
  { icon: "camp", label: "Rest / Camp", destination: "grove-camp" },
  { icon: "talk", label: "Talk", destination: "grove-talk" },
  { icon: "quests", label: "Quests", destination: "grove-quests" },
  { icon: "habitat", label: "Habitat", destination: "grove-habitat" },
  { icon: "travel", label: "Travel", destination: "grove-travel" },
] as const satisfies ReadonlyArray<{ icon: string; label: string; destination: GrovePanelId | "explore" }>;

type GroveSidebarProps = {
  canExplore: boolean;
  onExplore: () => void;
  onOpenPanel: (panel: GrovePanelId) => void;
  onSettings: () => void;
};

export function GroveSidebar({ canExplore, onExplore, onOpenPanel, onSettings }: GroveSidebarProps) {
  const [open, setOpen] = useState(true);
  const menuId = useId();

  return <>
    <button type="button" className="grove-sidebar-settings" onClick={onSettings}>
      <Settings aria-hidden="true" />
      Save &amp; Settings
    </button>
    <div className="grove-sidebar-track" data-open={open}>
      <button
        type="button"
        className="grove-sidebar-toggle"
        aria-label={open ? "Minimize Grove menu" : "Open Grove menu"}
        aria-controls={menuId}
        aria-expanded={open}
        onClick={() => setOpen((previous) => !previous)}
      >
        {open ? <ChevronRight aria-hidden="true" /> : <><ChevronLeft aria-hidden="true" /><span>Grove menu</span></>}
      </button>
      <section id={menuId} className="grove-sidebar" aria-label="Grove menu" inert={!open} aria-hidden={!open}>
        <header className="grove-sidebar-heading">
          <h1 id="grove-name" tabIndex={-1} data-phase-heading>Brambleberry Grove</h1>
          <p>Verdant Hollow</p>
        </header>
        <nav className="grove-sidebar-actions" aria-label="Wild Zone actions">
          {actions.map(({ icon, label, destination }) => {
            const explore = destination === "explore";
            return <button
              type="button"
              className={explore ? "grove-sidebar-action grove-sidebar-action--explore" : "grove-sidebar-action"}
              key={destination}
              data-action={icon}
              aria-label={label}
              disabled={explore && !canExplore}
              onClick={explore ? onExplore : () => onOpenPanel(destination)}
            >
              <img alt="" src={`/art/wild-zone/${icon}.webp`} width="96" height="96" />
              <span>{icon === "camp" ? "Rest/Camp" : label}</span>
            </button>;
          })}
        </nav>
        {!canExplore && <p className="grove-sidebar-hint">Choose a healthy lead in Party or visit the Clinic.</p>}
      </section>
    </div>
  </>;
}

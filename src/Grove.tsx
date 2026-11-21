import { useRef, type ReactNode } from "react";
import { ArrowLeft, ChevronRight, Leaf, Search, Waves } from "lucide-react";
import { type GroveStage } from "./townPlay";
import "./grove.css";

type GroveProps = {
  stage: GroveStage;
  onSurvey: () => void;
  onClear: () => void;
  onReturn: () => void;
  toolbar?: ReactNode;
};

const objectives = {
  arrival: {
    title: "A blocked creek crossing",
    description: "Brambles and fallen branches have piled up where the creek passes under the east trail.",
    action: "Inspect the crossing",
    icon: Search,
  },
  surveyed: {
    title: "The blockage is within reach",
    description: "Loose brush is wedged against the crossing. Clearing it will let the creek flow under the trail again.",
    action: "Clear the crossing",
    icon: Leaf,
  },
  restored: {
    title: "The creek is flowing again",
    description: "The creek runs clear. A few sound boards from the crossing are set aside for Brookbend’s bridge crew.",
    action: "Return to Brookbend",
    icon: Waves,
  },
};

export function Grove({ stage, onSurvey, onClear, onReturn, toolbar }: GroveProps) {
  const actionButton = useRef<HTMLButtonElement>(null);
  const creekRestored = stage === "restored";
  const objective = objectives[stage];
  const ObjectiveIcon = objective.icon;
  const handleObjective = stage === "arrival" ? onSurvey : stage === "surveyed" ? onClear : onReturn;

  function interactAtCrossing() {
    handleObjective();
    if (stage === "surveyed") actionButton.current?.focus({ preventScroll: true });
  }

  return (
    <main className="town grove" aria-labelledby="grove-name">
      <div className="atlas">
        <div className="map-frame">
          <img
            className="town-art"
            src={creekRestored ? "/art/brambleberry-grove-cleared.webp" : "/art/brambleberry-grove.webp"}
            alt={creekRestored ? "Water runs freely through the cleared stone crossing in the grove." : "Fallen branches choke the stone creek crossing beside the berry-lined trail."}
            width="1672"
            height="941"
            fetchPriority="high"
          />
          {!creekRestored && (
            <button className="map-pin grove-pin" onClick={interactAtCrossing} aria-label="Creek crossing">
              <span className="pin-point"><Waves aria-hidden="true" /></span>
              <span className="pin-label">Creek crossing</span>
            </button>
          )}
        </div>
      </div>

      {toolbar}

      <section className="town-card grove-card bevel" aria-label="Grove outing">
        <header className="grove-header">
          <p>Verdant Hollow</p>
          <h1 id="grove-name" tabIndex={-1}>Brambleberry Grove</h1>
          <img className="town-divider" src="/art/ui/divider.png" alt="" />
        </header>
        <div className="grove-objective" aria-live="polite" aria-atomic="true">
          <h2>{objective.title}</h2>
          <p>{objective.description}</p>
        </div>
        <div className="grove-actions">
          <button ref={actionButton} className="objective-button grove-start bevel" onClick={handleObjective}>
            <ObjectiveIcon aria-hidden="true" />
            <span>{objective.action}</span>
            <ChevronRight aria-hidden="true" />
          </button>
          {!creekRestored && (
            <button className="grove-return" onClick={onReturn}>
              <ArrowLeft aria-hidden="true" />
              <span>Return to Brookbend</span>
            </button>
          )}
        </div>
      </section>
    </main>
  );
}

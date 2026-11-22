import { useEffect, type Ref } from "react";
import { ArrowLeft, Check } from "lucide-react";
import { GROVE_WILD_WINS_REQUIRED, type OutingState } from "./outing";
import "./groveFieldJournal.css";

type GroveFieldJournalProps = {
  quest: OutingState["groveQuest"];
  actionLabel: string;
  onAction?: () => void;
  onClose: () => void;
  panelRef: Ref<HTMLElement>;
};

export function GroveFieldJournal({ quest, actionLabel, onAction, onClose, panelRef }: GroveFieldJournalProps) {
  const objectives = [
    { label: "Clear overgrowth", complete: quest.clearedOvergrowth },
    {
      label: "Win two wild battles",
      complete: quest.wildWins >= GROVE_WILD_WINS_REQUIRED,
      count: `${quest.wildWins} / ${GROVE_WILD_WINS_REQUIRED}`,
    },
    { label: "Report to Ranger Lina", complete: quest.reported },
  ];

  useEffect(() => {
    function closeOnEscape(event: KeyboardEvent) {
      if (event.key !== "Escape" || event.defaultPrevented || document.querySelector("dialog[open]")) return;
      onClose();
    }
    window.addEventListener("keydown", closeOnEscape);
    return () => window.removeEventListener("keydown", closeOnEscape);
  }, [onClose]);

  return <main className="field-journal" aria-labelledby="grove-name" ref={panelRef}>
    <header className="field-journal__header">
      <p className="field-journal__name">Ranger’s Field Journal</p>
      <p className="field-journal__location">Verdant Hollow / Brambleberry Grove</p>
    </header>

    <article className="field-journal__book">
      <div className="field-journal__left">
        <h1 id="grove-name" data-phase-heading tabIndex={-1}>A Grove in Need</h1>
        <div className="field-journal__rule" aria-hidden="true" />
        <div className="field-journal__mobile-illustration" aria-hidden="true" />
      </div>
      <div className="field-journal__right">
        <ul className="field-journal__objectives" aria-label="Quest objectives" aria-live="polite">
          {objectives.map(({ label, complete, count }) => <li key={label} className="field-journal__objective">
            <span className="field-journal__mark" data-complete={complete} role="img" aria-label={complete ? "Complete" : "Incomplete"}>
              {complete && <Check aria-hidden="true" strokeWidth={3.7} />}
            </span>
            <span>{label}</span>
            {count && <span className="field-journal__count">{count}</span>}
          </li>)}
        </ul>

        <button className="field-journal__action" type="button" onClick={onAction} disabled={!onAction}>
          {actionLabel}
        </button>
        {quest.reported && <p className="field-journal__follow-up" role="status">Strange Spores unlocked</p>}
      </div>
    </article>

    <button className="field-journal__close" type="button" onClick={onClose}>
      <ArrowLeft aria-hidden="true" /> Back to grove actions
    </button>
  </main>;
}

import { ArrowLeft } from "lucide-react";
import type { ReactNode, Ref } from "react";
import { moveDescription, type BattleMoveSlot, type SpeciesMove } from "./pokemonData";
import "./battleCommandBar.css";

const commands = [
  { label: "Fight", mode: "fight" },
  { label: "Items", mode: "items" },
  { label: "Switch", mode: "switch" },
  { label: "Inspect", mode: "inspect" },
] as const;

export type BattleSubmenu = typeof commands[number]["mode"];
export type BattleMode = "command" | BattleSubmenu;

const moveIcons: Partial<Record<string, string>> = {
  Ember: "ember",
  Scratch: "scratch",
  Smokescreen: "smokescreen",
  Growl: "growl",
};

export function BattleIcon({ icon }: { icon: string }) {
  return <img className="battle-command-icon" src={`/art/strange-spores/${icon}.webp`} alt="" width="64" height="64" />;
}

export function BattleTile({ children, icon, onClick, disabled, title, label, moveSlot }: {
  children: ReactNode;
  icon?: string;
  onClick: () => void;
  disabled?: boolean;
  title?: string;
  label?: string;
  moveSlot?: BattleMoveSlot;
}) {
  return <button className="battle-command-tile" type="button" onClick={onClick} disabled={disabled} title={title}
    aria-label={label} data-battle-move={moveSlot}>
    {icon && <BattleIcon icon={icon} />}
    <span>{children}</span>
  </button>;
}

export function BattleCommandBar({ heading, status, onBack, headingRef, children }: {
  heading: string;
  status?: string;
  onBack?: () => void;
  headingRef?: Ref<HTMLHeadingElement>;
  children: ReactNode;
}) {
  return <section className="battle-command-bar" aria-label="Battle commands">
    <header className="battle-command-heading">
      {onBack && <button type="button" className="battle-command-back" onClick={onBack}>
        <ArrowLeft aria-hidden="true" /> Back
      </button>}
      <h2 ref={headingRef} tabIndex={-1}>{heading}</h2>
      {status && <span className="battle-command-progress" aria-live="polite">{status}</span>}
    </header>
    {children}
  </section>;
}

export function BattleCommands({ onChoose, resolve }: {
  onChoose: (mode: BattleSubmenu) => void;
  resolve?: { onClick: () => void; disabled: boolean; buttonRef?: Ref<HTMLButtonElement> };
}) {
  return <div className={`battle-command-options${resolve ? " battle-command-options--main" : ""}`}>
    {commands.map(({ label, mode }) => <BattleTile key={mode} icon={mode} onClick={() => onChoose(mode)}>{label}</BattleTile>)}
    {resolve && <button type="button" className="battle-command-resolve" disabled={resolve.disabled}
      ref={resolve.buttonRef} onClick={resolve.onClick}>Resolve round</button>}
  </div>;
}

export function BattleMoves({ moves, onChoose, disabled, describe = moveDescription }: {
  moves: readonly [SpeciesMove, SpeciesMove, SpeciesMove, SpeciesMove];
  onChoose: (slot: BattleMoveSlot, move: SpeciesMove) => void;
  disabled?: (slot: BattleMoveSlot) => boolean;
  describe?: (move: SpeciesMove) => string;
}) {
  return <div className="battle-command-options">
    {moves.map((move, index) => {
      const slot = index as BattleMoveSlot;
      return <BattleTile key={slot} icon={moveIcons[move.name] ?? "fight"} moveSlot={slot}
        title={describe(move)} onClick={() => onChoose(slot, move)} disabled={disabled?.(slot)}>{move.name}</BattleTile>;
    })}
  </div>;
}

import { useEffect, useId, useRef, useState, type PointerEvent as ReactPointerEvent } from 'react';
import { ChevronDown, ChevronUp, GripVertical, Info, X } from 'lucide-react';
import { moveTargetsSelf } from './battleRules';
import { canReorderMoves, getLead, getMoveOrder, type OutingAction, type OutingState } from './outing';
import { partyMoveDetails } from './partyMoveDetails';
import { battleMoves, levelOf, maxHp, species, type BattleMoveSlot, type PokemonType, type SpeciesMove } from './pokemonData';
import { PokemonSprite } from './PokemonSprite';
import './partyMoves.css';

function TypeBadge({ type }: { type: PokemonType }) {
  return <span className="party-moves-type" data-element={type}>{type}</span>;
}

function MoveInfo({ move, onClose }: { move: SpeciesMove; onClose: () => void }) {
  const dialog = useRef<HTMLDialogElement>(null);
  const titleId = useId();
  const targetsSelf = moveTargetsSelf(move);
  const info = partyMoveDetails(move, targetsSelf);

  useEffect(() => {
    const panel = dialog.current;
    const trigger = document.activeElement;
    panel?.showModal();
    return () => {
      panel?.close();
      if (trigger instanceof HTMLElement && trigger.isConnected) trigger.focus({ preventScroll: true });
    };
  }, []);

  return <dialog
    ref={dialog}
    className="party-moves-info"
    aria-labelledby={titleId}
    onClick={event => {
      if (event.target === event.currentTarget) onClose();
    }}
    onCancel={event => {
      event.preventDefault();
      event.stopPropagation();
      onClose();
    }}
  >
    <article className="party-moves-info-card">
      <header>
        <h3 id={titleId}>{move.name} details</h3>
        <button className="party-moves-control" type="button" aria-label="Close move details" onClick={onClose}><X /></button>
      </header>
      <dl className="party-moves-info-stats">
        <div><dt>Element</dt><dd><TypeBadge type={move.type} /></dd></div>
        <div><dt>Category</dt><dd className="party-moves-category">{move.category}</dd></div>
        <div><dt>Base accuracy</dt><dd>{info.accuracy}</dd></div>
        <div><dt>Base damage power</dt><dd>{move.power > 0 ? move.power : 'None'}</dd></div>
        <div><dt>Base PP (reference)</dt><dd>{info.pp ?? '—'}</dd></div>
        <div><dt>Target</dt><dd>{targetsSelf ? 'Self' : 'One foe'}</dd></div>
      </dl>
      <section className="party-moves-info-effects" aria-label="Effects">
        <h4>{move.category === 'status' ? 'Effect' : 'Additional effects'}</h4>
        {info.effects.length ? <ul>{info.effects.map(effect => <li key={effect}>{effect}</li>)}</ul> : <p>None</p>}
      </section>
      {move.power > 0 && <p className="party-moves-info-note">Actual damage depends on level, type matchup, and battle conditions.</p>}
      <p className="party-moves-info-note">PP is shown for reference. Battles currently use no PP.</p>
    </article>
  </dialog>;
}

type Drag = { pointerId: number; slot: BattleMoveSlot; startX: number; startY: number };

export function PartyMoves({ outing, dispatch }: { outing: OutingState; dispatch: (action: OutingAction) => void }) {
  const lead = getLead(outing);
  const [selectedId, setSelectedId] = useState(lead?.id);
  const selected = outing.party.find(member => member.id === selectedId) ?? lead ?? outing.party[0];
  const [inspectedSlot, setInspectedSlot] = useState<BattleMoveSlot>();
  const [dropIndex, setDropIndex] = useState<number>();
  const [draggingSlot, setDraggingSlot] = useState<BattleMoveSlot>();
  const [announcement, setAnnouncement] = useState('');
  const drag = useRef<Drag | null>(null);
  const list = useRef<HTMLOListElement>(null);
  const headingId = useId();
  const editable = canReorderMoves(outing);

  if (!selected) return <p className="town-play-note">Meet your starter team at Maple’s Lab.</p>;
  const name = species[selected.species].name;
  const moves = battleMoves(selected.species);
  const order = getMoveOrder(outing, selected.id);

  function reorder(slot: BattleMoveSlot, index: number) {
    const from = order.indexOf(slot);
    if (!editable || !selected || from < 0 || index === from || index < 0 || index >= order.length) return;
    const next = [...order];
    next.splice(from, 1);
    next.splice(index, 0, slot);
    dispatch({ type: 'reorderMoves', id: selected.id, order: next });
    setAnnouncement(`${moves[slot].name} moved to slot ${index + 1}.`);
  }

  function rowUnderPointer(event: ReactPointerEvent<HTMLButtonElement>) {
    const row = document.elementFromPoint(event.clientX, event.clientY)?.closest<HTMLElement>('[data-move-index]');
    return row && list.current?.contains(row) ? Number(row.dataset.moveIndex) : undefined;
  }

  function startDrag(event: ReactPointerEvent<HTMLButtonElement>, slot: BattleMoveSlot) {
    if (!editable || !event.isPrimary || event.button !== 0) return;
    drag.current = { pointerId: event.pointerId, slot, startX: event.clientX, startY: event.clientY };
    event.currentTarget.setPointerCapture(event.pointerId);
  }

  function trackDrag(event: ReactPointerEvent<HTMLButtonElement>) {
    const current = drag.current;
    if (!current || event.pointerId !== current.pointerId) return;
    if (Math.hypot(event.clientX - current.startX, event.clientY - current.startY) < 5 && draggingSlot === undefined) return;
    setDraggingSlot(current.slot);
    setDropIndex(rowUnderPointer(event));
  }

  function cancelDrag() {
    drag.current = null;
    setDraggingSlot(undefined);
    setDropIndex(undefined);
  }

  function endDrag(event: ReactPointerEvent<HTMLButtonElement>) {
    const current = drag.current;
    if (!current || event.pointerId !== current.pointerId) return;
    const target = rowUnderPointer(event);
    if (target !== undefined && draggingSlot !== undefined) reorder(current.slot, target);
    cancelDrag();
  }

  return <div className="party-moves-layout">
    <ul className="party-moves-roster" aria-label="Party members">
      {outing.party.map(member => {
        const partner = species[member.species];
        const active = member.id === selected.id;
        const isLead = member.id === lead?.id;
        return <li key={member.id} className={active ? 'party-moves-member is-selected' : 'party-moves-member'}>
          <button type="button" className="party-moves-member-select" aria-pressed={active}
            aria-label={`View ${partner.name}’s moves`} onClick={() => {
              setSelectedId(member.id);
              setInspectedSlot(undefined);
              setAnnouncement('');
            }}>
            <PokemonSprite speciesId={member.species} className="party-moves-sprite" />
            <span className="party-moves-member-copy">
              <strong>{partner.name}</strong>
              <span aria-label={`${partner.kind}, Level ${levelOf(member)}`}>Lv. {levelOf(member)}</span>
              <span>{member.hp}/{maxHp(member)} HP</span>
            </span>
          </button>
          {isLead && <span className="party-moves-lead">Lead</span>}
          {!isLead && active && <button className="party-moves-lead" type="button"
            disabled={!editable || member.hp === 0} aria-label={`Lead with ${partner.name}`}
            onClick={() => dispatch({ type: 'selectLead', id: member.id })}>Set as lead</button>}
        </li>;
      })}
    </ul>
    <section className="party-moves-known" aria-labelledby={headingId}>
      <h3 id={headingId}>{name}’s moves</h3>
      <ol className="party-moves-list" ref={list} aria-labelledby={headingId}>
        {order.map((slot, index) => {
          const move = moves[slot];
          const targetsSelf = moveTargetsSelf(move);
          const detail = partyMoveDetails(move, targetsSelf);
          return <li className="party-moves-row" data-slot={slot} data-move-index={index} key={slot}
            data-dragging={draggingSlot === slot || undefined}
            data-drop-target={dropIndex === index && draggingSlot !== slot || undefined}>
            <button className="party-moves-grip" type="button" tabIndex={-1} disabled={!editable}
              aria-label={`Drag ${move.name} to reorder`}
              title={editable ? 'Drag to reorder' : undefined}
              onPointerDown={event => startDrag(event, slot)} onPointerMove={trackDrag}
              onPointerUp={endDrag} onPointerCancel={cancelDrag} onLostPointerCapture={cancelDrag}>
              <GripVertical aria-hidden="true" /><span>{index + 1}</span>
            </button>
            <strong className="party-moves-name">{move.name}</strong>
            <TypeBadge type={move.type} />
            <span className="party-moves-summary">{detail.summary}</span>
            <div className="party-moves-actions">
              <button className="party-moves-control party-moves-information" type="button" aria-haspopup="dialog"
                aria-label={`${move.name} move info`} title={`About ${move.name}`} onClick={() => setInspectedSlot(slot)}>
                <Info aria-hidden="true" />
              </button>
              <button className="party-moves-control" type="button" aria-label={`Move ${move.name} up`}
                disabled={!editable || index === 0} onClick={() => reorder(slot, index - 1)}><ChevronUp /></button>
              <button className="party-moves-control" type="button" aria-label={`Move ${move.name} down`}
                disabled={!editable || index === order.length - 1} onClick={() => reorder(slot, index + 1)}><ChevronDown /></button>
            </div>
          </li>;
        })}
      </ol>
      {!editable && <p className="party-moves-locked">Finish the battle to reorder moves.</p>}
      <span className="party-moves-announcement" role="status">{announcement}</span>
    </section>
    {inspectedSlot !== undefined && <MoveInfo move={moves[inspectedSlot]} onClose={() => setInspectedSlot(undefined)} />}
  </div>;
}

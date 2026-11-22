import { useEffect, useId, useRef, useState, type PointerEvent as ReactPointerEvent } from 'react';
import { ChevronDown, ChevronUp, GripVertical, Info, X } from 'lucide-react';
import { moveTargetsSelf } from './battleRules';
import { canReorderMoves, getLead, getMoveOrder, type OutingAction, type OutingState } from './outing';
import { partyMoveDetails } from './partyMoveDetails';
import { SMOKESCREEN_GOAL, isSignatureSmokescreen, battleMoves, levelOf, maxHp, species, type BattleMoveSlot, type PokemonType, type SpeciesMove } from './pokemonData';
import { PokemonSprite } from './PokemonSprite';
import './partyMoves.css';

function TypeBadge({ type }: { type: PokemonType }) {
  return <span className="party-moves-type" data-element={type}>{type}</span>;
}

function SignatureProgress({ uses, detailed = false }: { uses: number; detailed?: boolean }) {
  const unlocked = uses >= SMOKESCREEN_GOAL;
  return <div className={`signature-progress${detailed ? ' signature-progress--details' : ''}`}>
    {detailed && <h4>Signature Training</h4>}
    <div className="signature-progress-meter">
      <progress aria-label="Smokescreen training" value={uses} max={SMOKESCREEN_GOAL} />
      <span>{uses} / {SMOKESCREEN_GOAL} uses</span>
    </div>
    <p><strong>{unlocked ? 'Mastered' : 'Upgrade'}</strong> · Lowers accuracy by 2 stages.</p>
  </div>;
}

function MoveInfo({ move, uses, onClose }: { move: SpeciesMove; uses?: number; onClose: () => void }) {
  const dialog = useRef<HTMLDialogElement>(null);
  const titleId = useId();
  const targetsSelf = moveTargetsSelf(move);
  const info = partyMoveDetails(move, targetsSelf);
  const effects = uses !== undefined && uses >= SMOKESCREEN_GOAL ? ['Lowers the target’s accuracy by two stages.'] : info.effects;

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
        {effects.length ? <ul>{effects.map(effect => <li key={effect}>{effect}</li>)}</ul> : <p>None</p>}
      </section>
      {move.power > 0 && <p className="party-moves-info-note">Actual damage depends on level, type matchup, and battle conditions.</p>}
      <p className="party-moves-info-note">PP is shown for reference. Battles currently use no PP.</p>
      {uses !== undefined && <SignatureProgress uses={uses} detailed />}
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
  const [rosterDrop, setRosterDrop] = useState<number>();
  const roster = useRef<HTMLUListElement>(null);
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

  function rosterIndex(event: ReactPointerEvent<HTMLButtonElement>) {
    const row = document.elementFromPoint(event.clientX, event.clientY)?.closest<HTMLElement>('[data-party-index]');
    return row && roster.current?.contains(row) ? Number(row.dataset.partyIndex) : undefined;
  }

  function reorderMember(id: number, index: number) {
    if (!editable || index < 0 || index >= outing.party.length || outing.party[index].id === id) return;
    dispatch({ type: 'reorderParty', id, index });
    const member = outing.party.find(entry => entry.id === id);
    if (member) setAnnouncement(`${species[member.species].name} moved to party position ${index + 1}.`);
  }

  const trainingUses = (move: SpeciesMove) => isSignatureSmokescreen(selected, move)
    ? selected.smokescreenUses ?? 0
    : undefined;
  let readyIndex = 0;
  return <div className="party-moves-layout">
    <ul className="party-moves-roster" ref={roster} aria-label="Party members">
      {outing.party.map((member, index) => {
        const partner = species[member.species];
        const active = member.id === selected.id;
        const position = member.hp > 0 ? ['Front · Lead', 'Middle', 'Rear'][readyIndex++] ?? 'Reserve' : 'Fainted';
        return <li key={member.id} data-party-index={index} data-roster-drop={rosterDrop === index || undefined} className={active ? 'party-moves-member is-selected' : 'party-moves-member'}>
          <button type="button" className="party-moves-grip party-roster-grip" disabled={!editable}
            aria-label={`Reorder ${partner.name}, position ${index + 1}`} title="Drag to reorder or press an arrow key"
            onKeyDown={event => {
              const offset = ['ArrowUp', 'ArrowLeft'].includes(event.key) ? -1
                : ['ArrowDown', 'ArrowRight'].includes(event.key) ? 1 : 0;
              if (!offset) return;
              event.preventDefault();
              reorderMember(member.id, index + offset);
            }}
            onPointerDown={event => {
              if (!event.isPrimary || event.button !== 0) return;
              event.currentTarget.setPointerCapture(event.pointerId);
            }}
            onPointerMove={event => {
              if (event.currentTarget.hasPointerCapture(event.pointerId)) setRosterDrop(rosterIndex(event));
            }}
            onPointerUp={event => {
              if (!event.currentTarget.hasPointerCapture(event.pointerId)) return;
              const target = rosterIndex(event);
              if (target !== undefined) reorderMember(member.id, target);
              setRosterDrop(undefined);
            }}
            onLostPointerCapture={() => setRosterDrop(undefined)}>
            <GripVertical aria-hidden="true" /><span>{index + 1}</span>
          </button>
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
          <span className="party-moves-lead">{position}</span>
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
          const uses = trainingUses(move);
          return <li className={uses === undefined ? 'party-moves-row' : 'party-moves-row party-moves-row--signature'} data-slot={slot} data-move-index={index} key={slot}
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
            {uses !== undefined && <SignatureProgress uses={uses} />}
          </li>;
        })}
      </ol>
      {!editable && <p className="party-moves-locked">Finish the battle to reorder the party or its moves.</p>}
      <span className="party-moves-announcement" role="status">{announcement}</span>
    </section>
    {inspectedSlot !== undefined && <MoveInfo move={moves[inspectedSlot]} uses={trainingUses(moves[inspectedSlot])} onClose={() => setInspectedSlot(undefined)} />}
  </div>;
}

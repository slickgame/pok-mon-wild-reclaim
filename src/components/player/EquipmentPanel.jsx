import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Badge } from '@/components/ui/badge';
import { X } from 'lucide-react';

// Equipment slot definitions
const SLOTS = [
  {
    id: 'head',
    label: 'Head',
    description: 'Goggles & hats — boosts wild encounter odds, shiny rates',
    emoji: '🥽',
    // absolute position on the silhouette
    top: '4%',
    left: '50%',
    translateX: '-50%',
  },
  {
    id: 'chest',
    label: 'Chest',
    description: 'Shirts & jackets — general gameplay bonuses',
    emoji: '🧥',
    top: '28%',
    left: '50%',
    translateX: '-50%',
  },
  {
    id: 'hands',
    label: 'Hands',
    description: 'Gloves — catch rate, berry harvest bonuses',
    emoji: '🧤',
    top: '38%',
    left: '4%',
    translateX: '0%',
  },
  {
    id: 'legs',
    label: 'Legs',
    description: 'Pants — field and stat bonuses',
    emoji: '👖',
    top: '57%',
    left: '50%',
    translateX: '-50%',
  },
  {
    id: 'feet',
    label: 'Feet',
    description: 'Shoes — exploration speed, zone bonuses',
    emoji: '👟',
    top: '80%',
    left: '50%',
    translateX: '-50%',
  },
];

// Which item types can go in which slot
const SLOT_ITEM_TYPES = {
  head: ['head', 'Hat', 'Goggles', 'Gear'],
  chest: ['chest', 'Jacket', 'Shirt', 'Gear'],
  hands: ['hands', 'Gloves', 'Gear'],
  legs: ['legs', 'Pants', 'Gear'],
  feet: ['feet', 'Boots', 'Shoes', 'Gear'],
};

export default function EquipmentPanel({ player }) {
  const queryClient = useQueryClient();
  const [activeSlot, setActiveSlot] = useState(null);
  const [saving, setSaving] = useState(false);

  const { data: inventory = [] } = useQuery({
    queryKey: ['inventory'],
    queryFn: () => base44.entities.Item.list(),
  });

  const equipment = player?.equipment || {};

  // Items eligible for a given slot (type === 'Gear' or matching slot keyword)
  const eligibleItems = (slotId) =>
    inventory.filter((item) => {
      const allowed = SLOT_ITEM_TYPES[slotId] || [];
      return (
        item.type === 'Gear' ||
        allowed.some((k) => item.type?.toLowerCase().includes(k.toLowerCase()) || item.name?.toLowerCase().includes(k.toLowerCase()))
      );
    });

  const equip = async (slotId, itemId) => {
    if (!player?.id) return;
    setSaving(true);
    const newEquipment = { ...equipment, [slotId]: itemId };
    await base44.entities.Player.update(player.id, { equipment: newEquipment });
    queryClient.invalidateQueries({ queryKey: ['player'] });
    setSaving(false);
    setActiveSlot(null);
  };

  const unequip = async (slotId) => {
    if (!player?.id) return;
    setSaving(true);
    const newEquipment = { ...equipment };
    delete newEquipment[slotId];
    await base44.entities.Player.update(player.id, { equipment: newEquipment });
    queryClient.invalidateQueries({ queryKey: ['player'] });
    setSaving(false);
  };

  const getEquippedItem = (slotId) => {
    const itemId = equipment[slotId];
    if (!itemId) return null;
    return inventory.find((i) => i.id === itemId) || { name: itemId };
  };

  const activeSlotDef = SLOTS.find((s) => s.id === activeSlot);

  return (
    <div className="flex flex-col lg:flex-row gap-6">
      {/* Silhouette */}
      <div className="flex-shrink-0 flex flex-col items-center">
        <p className="text-xs uppercase text-slate-400 tracking-wide mb-3">Equipment</p>
        <div
          className="relative w-52 h-[340px] mx-auto select-none"
          style={{ userSelect: 'none' }}
        >
          {/* SVG Silhouette */}
          <svg
            viewBox="0 0 120 280"
            className="absolute inset-0 w-full h-full"
            xmlns="http://www.w3.org/2000/svg"
          >
            {/* Head */}
            <circle cx="60" cy="28" r="18" fill="rgba(99,102,241,0.15)" stroke="rgba(99,102,241,0.4)" strokeWidth="1.5" />
            {/* Neck */}
            <rect x="54" y="44" width="12" height="8" rx="3" fill="rgba(99,102,241,0.12)" stroke="rgba(99,102,241,0.3)" strokeWidth="1" />
            {/* Torso */}
            <rect x="36" y="52" width="48" height="56" rx="8" fill="rgba(99,102,241,0.15)" stroke="rgba(99,102,241,0.4)" strokeWidth="1.5" />
            {/* Left arm */}
            <rect x="12" y="54" width="22" height="46" rx="8" fill="rgba(99,102,241,0.12)" stroke="rgba(99,102,241,0.3)" strokeWidth="1.2" />
            {/* Right arm */}
            <rect x="86" y="54" width="22" height="46" rx="8" fill="rgba(99,102,241,0.12)" stroke="rgba(99,102,241,0.3)" strokeWidth="1.2" />
            {/* Left hand */}
            <ellipse cx="23" cy="106" rx="9" ry="7" fill="rgba(99,102,241,0.12)" stroke="rgba(99,102,241,0.3)" strokeWidth="1" />
            {/* Right hand */}
            <ellipse cx="97" cy="106" rx="9" ry="7" fill="rgba(99,102,241,0.12)" stroke="rgba(99,102,241,0.3)" strokeWidth="1" />
            {/* Left leg */}
            <rect x="38" y="110" width="20" height="70" rx="7" fill="rgba(99,102,241,0.12)" stroke="rgba(99,102,241,0.3)" strokeWidth="1.2" />
            {/* Right leg */}
            <rect x="62" y="110" width="20" height="70" rx="7" fill="rgba(99,102,241,0.12)" stroke="rgba(99,102,241,0.3)" strokeWidth="1.2" />
            {/* Left foot */}
            <ellipse cx="48" cy="185" rx="13" ry="7" fill="rgba(99,102,241,0.12)" stroke="rgba(99,102,241,0.3)" strokeWidth="1" />
            {/* Right foot */}
            <ellipse cx="72" cy="185" rx="13" ry="7" fill="rgba(99,102,241,0.12)" stroke="rgba(99,102,241,0.3)" strokeWidth="1" />
          </svg>

          {/* Slot buttons overlaid on body */}
          {SLOTS.map((slot) => {
            const equipped = getEquippedItem(slot.id);
            const isActive = activeSlot === slot.id;
            return (
              <button
                key={slot.id}
                type="button"
                onClick={() => setActiveSlot(isActive ? null : slot.id)}
                style={{
                  position: 'absolute',
                  top: slot.top,
                  left: slot.left,
                  transform: `translateX(${slot.translateX})`,
                }}
                className={`flex flex-col items-center gap-0.5 group z-10 transition-all ${isActive ? 'scale-110' : 'hover:scale-105'}`}
              >
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center text-lg border-2 transition-all shadow-md ${
                    equipped
                      ? 'bg-indigo-500/40 border-indigo-400 shadow-indigo-500/30'
                      : isActive
                      ? 'bg-slate-700 border-cyan-400'
                      : 'bg-slate-800/70 border-slate-600 hover:border-indigo-400'
                  }`}
                >
                  {equipped ? '✅' : slot.emoji}
                </div>
                <span className="text-[9px] uppercase tracking-wide text-slate-400 group-hover:text-slate-200 font-semibold">
                  {slot.label}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Right panel: slot detail or summary */}
      <div className="flex-1 min-w-0">
        <AnimatePresence mode="wait">
          {activeSlot ? (
            <motion.div
              key={activeSlot}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="glass rounded-xl p-5 border border-indigo-500/30"
            >
              <div className="flex items-center justify-between mb-1">
                <h4 className="text-white font-semibold text-sm">
                  {activeSlotDef?.emoji} {activeSlotDef?.label} Slot
                </h4>
                <button onClick={() => setActiveSlot(null)} className="text-slate-400 hover:text-white">
                  <X className="w-4 h-4" />
                </button>
              </div>
              <p className="text-xs text-slate-400 mb-4">{activeSlotDef?.description}</p>

              {/* Currently equipped */}
              {getEquippedItem(activeSlot) ? (
                <div className="mb-4 bg-indigo-500/10 border border-indigo-500/30 rounded-lg p-3 flex items-center justify-between">
                  <div>
                    <p className="text-xs text-slate-400">Equipped</p>
                    <p className="text-white font-semibold">{getEquippedItem(activeSlot)?.name}</p>
                    {getEquippedItem(activeSlot)?.passiveEffect && (
                      <p className="text-xs text-cyan-300 mt-0.5">{getEquippedItem(activeSlot).passiveEffect}</p>
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={() => unequip(activeSlot)}
                    disabled={saving}
                    className="text-xs text-red-400 hover:text-red-300 border border-red-500/30 rounded px-2 py-1"
                  >
                    Remove
                  </button>
                </div>
              ) : (
                <p className="text-xs text-slate-500 mb-4 italic">Nothing equipped in this slot.</p>
              )}

              {/* Available gear */}
              <p className="text-xs uppercase text-slate-500 tracking-wide mb-2">Available Gear</p>
              <div className="space-y-2 max-h-52 overflow-y-auto pr-1">
                {eligibleItems(activeSlot).length === 0 ? (
                  <p className="text-xs text-slate-500 italic">No gear in your inventory for this slot yet.</p>
                ) : (
                  eligibleItems(activeSlot).map((item) => (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => equip(activeSlot, item.id)}
                      disabled={saving || equipment[activeSlot] === item.id}
                      className={`w-full text-left rounded-lg px-3 py-2 border transition-all text-sm ${
                        equipment[activeSlot] === item.id
                          ? 'bg-indigo-500/20 border-indigo-400/60 text-indigo-200 cursor-default'
                          : 'bg-slate-800/50 border-slate-700 hover:border-indigo-500/50 text-slate-200'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-medium">{item.name}</span>
                        {equipment[activeSlot] === item.id && (
                          <Badge className="bg-indigo-500/30 text-indigo-200 text-[10px]">Equipped</Badge>
                        )}
                      </div>
                      {item.passiveEffect && (
                        <p className="text-xs text-cyan-400 mt-0.5">{item.passiveEffect}</p>
                      )}
                      {item.description && (
                        <p className="text-xs text-slate-500 mt-0.5">{item.description}</p>
                      )}
                    </button>
                  ))
                )}
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="summary"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="space-y-2"
            >
              <p className="text-xs uppercase text-slate-500 tracking-wide mb-3">Equipped Gear</p>
              {SLOTS.map((slot) => {
                const equipped = getEquippedItem(slot.id);
                return (
                  <button
                    key={slot.id}
                    type="button"
                    onClick={() => setActiveSlot(slot.id)}
                    className="w-full glass rounded-lg px-4 py-3 flex items-center gap-3 border border-slate-700/50 hover:border-indigo-500/40 transition-all text-left"
                  >
                    <span className="text-lg w-7 flex-shrink-0">{slot.emoji}</span>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs uppercase text-slate-500 tracking-wide">{slot.label}</p>
                      {equipped ? (
                        <>
                          <p className="text-sm font-semibold text-white truncate">{equipped.name}</p>
                          {equipped.passiveEffect && (
                            <p className="text-xs text-cyan-400 truncate">{equipped.passiveEffect}</p>
                          )}
                        </>
                      ) : (
                        <p className="text-sm text-slate-500 italic">Empty</p>
                      )}
                    </div>
                    <span className="text-xs text-slate-500 flex-shrink-0">
                      {equipped ? '✅' : '—'}
                    </span>
                  </button>
                );
              })}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
/**
 * ActionQueueBar — Step 3
 *
 * Compact read-only display of queued (locked) actions above the confirm button.
 * Shows each player slot's chosen action as a badge row.
 *
 * Props:
 *   playerActive   string[]
 *   pokemonMap     { [id]: Pokemon }
 *   pendingActions { [id]: Action }
 *   onClear        (pokemonId) => void
 */

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Swords, Package, RefreshCw, Trophy } from 'lucide-react';

const iconFor = (type) => {
  if (type === 'move')    return <Swords className="w-3 h-3" />;
  if (type === 'item')    return <Package className="w-3 h-3" />;
  if (type === 'switch')  return <RefreshCw className="w-3 h-3" />;
  if (type === 'capture') return <Trophy className="w-3 h-3" />;
  return null;
};

const labelFor = (action, pokemonMap) => {
  if (!action) return '—';
  if (action.type === 'move')    return action.payload?.name || 'Move';
  if (action.type === 'item')    return action.payload?.itemName || 'Item';
  if (action.type === 'capture') return action.payload?.ball?.name || 'Capture';
  if (action.type === 'switch') {
    const inMon = pokemonMap[action.payload?.inId];
    return `→ ${inMon?.nickname || inMon?.species || '?'}`;
  }
  return action.type;
};

export default function ActionQueueBar({ playerActive = [], pokemonMap = {}, pendingActions = {}, onClear }) {
  const lockedCount = playerActive.filter(id => pendingActions[id]).length;
  if (lockedCount === 0) return null;

  return (
    <div className="flex flex-wrap gap-2 mb-2">
      <AnimatePresence>
        {playerActive.map(id => {
          const action = pendingActions[id];
          if (!action) return null;
          const mon = pokemonMap[id];
          return (
            <motion.div
              key={id}
              initial={{ opacity: 0, scale: 0.85 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.85 }}
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-indigo-500/20 border border-indigo-500/40 text-xs text-indigo-300"
            >
              {iconFor(action.type)}
              <span className="font-medium">{mon?.nickname || mon?.species}</span>
              <span className="text-slate-400">·</span>
              <span>{labelFor(action, pokemonMap)}</span>
              {onClear && (
                <button
                  onClick={() => onClear(id)}
                  className="ml-0.5 text-slate-400 hover:text-red-400 transition-colors"
                >
                  <X className="w-3 h-3" />
                </button>
              )}
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
}
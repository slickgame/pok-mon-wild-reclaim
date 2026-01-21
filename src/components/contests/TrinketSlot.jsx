import React from 'react';
import { motion } from 'framer-motion';
import { Plus, X, Sparkles } from 'lucide-react';

export default function TrinketSlot({ trinket, slotNumber, onEquip, onUnequip, disabled = false }) {
  if (!trinket) {
    return (
      <motion.button
        whileHover={{ scale: disabled ? 1 : 1.05 }}
        whileTap={{ scale: disabled ? 1 : 0.95 }}
        onClick={onEquip}
        disabled={disabled}
        className={`w-full aspect-square rounded-lg border-2 border-dashed ${
          disabled ? 'border-slate-800 bg-slate-900/50 cursor-not-allowed' : 'border-slate-700 bg-slate-800/50 hover:bg-slate-800 cursor-pointer'
        } flex flex-col items-center justify-center`}
      >
        <Plus className={`w-5 h-5 ${disabled ? 'text-slate-700' : 'text-slate-500'}`} />
        <span className={`text-xs mt-1 ${disabled ? 'text-slate-700' : 'text-slate-500'}`}>
          Slot {slotNumber}
        </span>
      </motion.button>
    );
  }

  return (
    <motion.div
      whileHover={{ scale: 1.05, y: -2 }}
      className="relative w-full aspect-square rounded-lg border-2 border-purple-500/30 bg-gradient-to-br from-purple-500/20 to-pink-500/20 overflow-hidden group"
    >
      <div className="relative h-full p-2 flex flex-col">
        <button
          onClick={onUnequip}
          className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity bg-red-500/80 rounded p-1"
        >
          <X className="w-3 h-3 text-white" />
        </button>
        
        <div className="flex-1 flex items-center justify-center">
          <Sparkles className="w-8 h-8 text-purple-300" />
        </div>
        
        <div className="text-center">
          <p className="text-white text-xs font-semibold truncate">{trinket.name}</p>
          <p className="text-[10px] text-purple-300">{trinket.effects}</p>
        </div>
      </div>
    </motion.div>
  );
}
import React from 'react';
import { motion } from 'framer-motion';
import { Plus, X } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

const qualityColors = {
  Normal: 'border-slate-600',
  Fine: 'border-blue-500',
  Superior: 'border-purple-500',
  Masterwork: 'border-yellow-500',
};

const rarityBg = {
  Common: 'from-slate-600 to-slate-700',
  Uncommon: 'from-green-600 to-green-700',
  Rare: 'from-blue-600 to-blue-700',
  Epic: 'from-purple-600 to-purple-700',
  Legendary: 'from-yellow-600 to-orange-600',
  Mythic: 'from-red-600 to-pink-600',
};

export default function HeldItemSlot({ item, slotNumber, onEquip, onUnequip, disabled = false }) {
  if (!item) {
    return (
      <motion.button
        whileHover={{ scale: disabled ? 1 : 1.05 }}
        whileTap={{ scale: disabled ? 1 : 0.95 }}
        onClick={onEquip}
        disabled={disabled}
        className={`w-full aspect-square rounded-xl border-2 border-dashed ${
          disabled ? 'border-slate-800 bg-slate-900/50 cursor-not-allowed' : 'border-slate-700 bg-slate-800/50 hover:bg-slate-800 cursor-pointer'
        } flex flex-col items-center justify-center`}
      >
        <Plus className={`w-6 h-6 ${disabled ? 'text-slate-700' : 'text-slate-500'}`} />
        <span className={`text-xs mt-1 ${disabled ? 'text-slate-700' : 'text-slate-500'}`}>
          Slot {slotNumber}
        </span>
      </motion.button>
    );
  }

  return (
    <motion.div
      whileHover={{ scale: 1.05, y: -2 }}
      className={`relative w-full aspect-square rounded-xl border-2 ${qualityColors[item.quality]} overflow-hidden group`}
    >
      {/* Background gradient */}
      <div className={`absolute inset-0 bg-gradient-to-br ${rarityBg[item.rarity]} opacity-20`} />
      
      {/* Content */}
      <div className="relative h-full p-2 flex flex-col">
        <div className="flex items-start justify-between mb-1">
          <Badge className="text-[10px] bg-black/40 text-white border-white/20">
            {item.quality}
          </Badge>
          <button
            onClick={onUnequip}
            className="opacity-0 group-hover:opacity-100 transition-opacity bg-red-500/80 rounded p-0.5"
          >
            <X className="w-3 h-3 text-white" />
          </button>
        </div>
        
        <div className="flex-1 flex items-center justify-center">
          {item.iconUrl ? (
            <img src={item.iconUrl} alt={item.name} className="w-12 h-12 object-contain" />
          ) : (
            <div className="w-12 h-12 rounded-full bg-slate-700/50 flex items-center justify-center">
              <span className="text-2xl">💎</span>
            </div>
          )}
        </div>
        
        <div className="text-center">
          <p className="text-white text-xs font-semibold truncate">{item.name}</p>
          {item.setKey && (
            <Badge className="text-[10px] bg-cyan-500/20 text-cyan-300 border-cyan-500/50 mt-1">
              Set Item
            </Badge>
          )}
        </div>
      </div>
    </motion.div>
  );
}
import React from 'react';
import { motion } from 'framer-motion';
import { Badge } from '@/components/ui/badge';
import { Sparkles } from 'lucide-react';

const baitRarityColors = {
  Common: 'from-slate-600 to-slate-700',
  Uncommon: 'from-green-600 to-green-700',
  Rare: 'from-blue-600 to-blue-700',
  Epic: 'from-purple-600 to-purple-700',
};

export default function BaitSelector({ baits, selectedBait, onSelect }) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
      {baits.map((bait) => {
        const isSelected = selectedBait?.id === bait.id;
        return (
          <motion.button
            key={bait.id}
            whileHover={{ scale: 1.05, y: -2 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => onSelect(bait)}
            className={`glass rounded-xl p-4 text-left transition-all ${
              isSelected ? 'ring-2 ring-cyan-500 bg-cyan-500/10' : ''
            }`}
          >
            <div className={`w-12 h-12 rounded-lg bg-gradient-to-br ${baitRarityColors[bait.rarity]} mb-3 flex items-center justify-center`}>
              <Sparkles className="w-6 h-6 text-white" />
            </div>
            <h4 className="text-white font-semibold text-sm mb-1">{bait.name}</h4>
            <p className="text-xs text-slate-400 mb-2">{bait.effects}</p>
            <div className="flex items-center justify-between">
              <Badge className="text-[10px] bg-slate-700/50 text-slate-300">
                x{bait.quantity}
              </Badge>
              <Badge className={`text-[10px] ${
                bait.rarity === 'Rare' ? 'bg-blue-500/20 text-blue-300' :
                bait.rarity === 'Epic' ? 'bg-purple-500/20 text-purple-300' :
                'bg-slate-700/50 text-slate-300'
              }`}>
                {bait.rarity}
              </Badge>
            </div>
          </motion.button>
        );
      })}
    </div>
  );
}
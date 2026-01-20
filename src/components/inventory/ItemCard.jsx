import React from 'react';
import { motion } from 'framer-motion';
import { Badge } from '@/components/ui/badge';
import { Package, Beaker, Target, Sparkles, Key, Swords } from 'lucide-react';

const typeIcons = {
  'Potion': Beaker,
  'Bait': Target,
  'Held Item': Sparkles,
  'Material': Package,
  'Key Item': Key,
  'Battle Item': Swords,
};

const rarityColors = {
  'Common': 'border-slate-500/50 bg-slate-800/50',
  'Uncommon': 'border-green-500/50 bg-green-900/30',
  'Rare': 'border-blue-500/50 bg-blue-900/30',
  'Epic': 'border-purple-500/50 bg-purple-900/30',
  'Legendary': 'border-yellow-500/50 bg-yellow-900/30',
};

const rarityTextColors = {
  'Common': 'text-slate-400',
  'Uncommon': 'text-green-400',
  'Rare': 'text-blue-400',
  'Epic': 'text-purple-400',
  'Legendary': 'text-yellow-400',
};

export default function ItemCard({ item, onClick, selected = false }) {
  const Icon = typeIcons[item.type] || Package;
  const borderColor = rarityColors[item.rarity] || rarityColors['Common'];
  const textColor = rarityTextColors[item.rarity] || 'text-slate-400';
  
  return (
    <motion.div
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      onClick={onClick}
      className={`relative rounded-xl p-3 cursor-pointer transition-all ${borderColor} border ${
        selected ? 'ring-2 ring-indigo-500 ring-offset-2 ring-offset-slate-900' : ''
      }`}
    >
      {item.quantity > 1 && (
        <div className="absolute top-1 right-1 w-5 h-5 rounded-full bg-indigo-500 flex items-center justify-center">
          <span className="text-[10px] font-bold text-white">{item.quantity}</span>
        </div>
      )}
      
      <div className="flex flex-col items-center">
        <div className="w-12 h-12 rounded-lg bg-slate-800/80 flex items-center justify-center mb-2">
          {item.iconUrl ? (
            <img src={item.iconUrl} alt={item.name} className="w-8 h-8 object-contain" />
          ) : (
            <Icon className={`w-6 h-6 ${textColor}`} />
          )}
        </div>
        <h4 className="text-xs font-medium text-white text-center truncate w-full">
          {item.name}
        </h4>
        <Badge className={`text-[9px] mt-1 bg-transparent border-0 ${textColor}`}>
          {item.rarity}
        </Badge>
      </div>
    </motion.div>
  );
}
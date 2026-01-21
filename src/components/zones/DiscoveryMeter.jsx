import React from 'react';
import { motion } from 'framer-motion';
import { Eye, TrendingUp } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

export default function DiscoveryMeter({ progress, discoveredPokemon, discoveredPOIs, totalPokemon, totalPOIs }) {
  const getTier = (progress) => {
    if (progress >= 100) return { name: 'Mastered', color: 'text-purple-400', bg: 'bg-purple-500' };
    if (progress >= 61) return { name: 'Known', color: 'text-emerald-400', bg: 'bg-emerald-500' };
    if (progress >= 26) return { name: 'Familiar', color: 'text-blue-400', bg: 'bg-blue-500' };
    return { name: 'Unfamiliar', color: 'text-slate-400', bg: 'bg-slate-500' };
  };

  const tier = getTier(progress);

  return (
    <div className="glass rounded-xl p-6 border border-indigo-500/30">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-500/20 to-cyan-500/20 flex items-center justify-center">
            <Eye className="w-6 h-6 text-indigo-400" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-white">Discovery Progress: {Math.round(progress)}%</h3>
            <p className={`text-sm ${tier.color}`}>{tier.name}</p>
          </div>
        </div>
      </div>

      <div className="relative w-full h-3 bg-slate-800 rounded-full overflow-hidden mb-4">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
          className={`h-full ${tier.bg}`}
        />
        {/* Tier markers */}
        <div className="absolute top-0 left-[26%] w-px h-full bg-white/30" />
        <div className="absolute top-0 left-[61%] w-px h-full bg-white/30" />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="glass rounded-lg p-3">
          <p className="text-xs text-slate-400 mb-1">Pokémon</p>
          <p className="text-white font-semibold">
            {discoveredPokemon}/{totalPokemon}
          </p>
        </div>
        <div className="glass rounded-lg p-3">
          <p className="text-xs text-slate-400 mb-1">Locations</p>
          <p className="text-white font-semibold">
            {discoveredPOIs}/{totalPOIs}
          </p>
        </div>
      </div>
    </div>
  );
}
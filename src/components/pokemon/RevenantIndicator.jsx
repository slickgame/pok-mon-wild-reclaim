import React from 'react';
import { motion } from 'framer-motion';
import { Skull, AlertTriangle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

export default function RevenantIndicator({ pokemon, size = 'md', showEffects = false }) {
  if (!pokemon?.isRevenant) return null;

  const sizes = {
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-6 h-6',
  };

  return (
    <div className="space-y-2">
      {/* Revenant Badge */}
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        className="flex items-center gap-2"
      >
        <Badge className="bg-red-500/20 text-red-300 border-red-500/50 flex items-center gap-1">
          <Skull className={sizes[size]} />
          Revenant
        </Badge>
      </motion.div>

      {/* Effects Display */}
      {showEffects && pokemon.revenantEffects && (
        <div className="space-y-1">
          {pokemon.revenantEffects.xpPenalty > 0 && (
            <div className="flex items-center gap-2 text-xs text-slate-400">
              <AlertTriangle className="w-3 h-3 text-yellow-400" />
              <span>{(pokemon.revenantEffects.xpPenalty * 100)}% XP penalty</span>
            </div>
          )}
          {pokemon.revenantEffects.suppressSynergy && (
            <div className="flex items-center gap-2 text-xs text-slate-400">
              <AlertTriangle className="w-3 h-3 text-yellow-400" />
              <span>Team synergy suppressed</span>
            </div>
          )}
          {pokemon.revenantEffects.disableHeldItems && (
            <div className="flex items-center gap-2 text-xs text-slate-400">
              <AlertTriangle className="w-3 h-3 text-yellow-400" />
              <span>Held items disabled</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
import React from 'react';
import { motion } from 'framer-motion';
import { Heart, Shield, Zap } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import StatBar from '@/components/ui/StatBar';
import RoleIndicator from './RoleIndicator';
import RevenantIndicator from '../pokemon/RevenantIndicator';
import StatusIndicator from './StatusIndicator';

export default function BattleHUD({ pokemon, hp, maxHp, status, isPlayer = false, roles = [] }) {
  const hpPercent = (hp / maxHp) * 100;
  const hpColor = hpPercent > 50 ? 'bg-emerald-500' : hpPercent > 25 ? 'bg-yellow-500' : 'bg-red-500';

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className={`glass rounded-xl p-4 ${isPlayer ? 'border-indigo-500/30' : 'border-red-500/30'}`}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <h3 className="text-white font-bold text-lg">
              {pokemon.nickname || pokemon.species}
            </h3>
            <Badge className="bg-slate-700/50 text-slate-300 text-xs">
              Lv. {pokemon.level}
            </Badge>
          </div>
          {/* Roles */}
          {roles.length > 0 && (
            <div className="flex gap-1 mb-2">
              {roles.map((role, idx) => (
                <RoleIndicator key={idx} role={role} size="sm" />
              ))}
            </div>
          )}
          {/* Revenant indicator */}
          <RevenantIndicator pokemon={pokemon} size="sm" />
        </div>

        {/* Pokemon sprite */}
        {pokemon.spriteUrl && (
          <img 
            src={pokemon.spriteUrl} 
            alt={pokemon.species}
            className={`w-20 h-20 object-contain ${isPlayer ? '' : 'transform scale-x-[-1]'}`}
          />
        )}
      </div>

      {/* HP Bar */}
      <StatBar
        value={hp}
        maxValue={maxHp}
        color={hpColor}
        label="HP"
        showValue
        animated
      />

      {/* Status effects */}
      {status?.conditions?.length > 0 && (
        <div className="mt-2">
          <StatusIndicator statuses={status.conditions} />
        </div>
      )}

      {/* Active buffs */}
      {status?.buffs?.length > 0 && (
        <div className="flex gap-2 mt-2 flex-wrap">
          {status.buffs.map((buff, idx) => (
            <Badge key={idx} className="bg-cyan-500/20 text-cyan-300 border-cyan-500/50 text-xs flex items-center gap-1">
              <Zap className="w-3 h-3" />
              {buff.name} +{buff.value}
            </Badge>
          ))}
        </div>
      )}

      {/* Held items indicator */}
      {pokemon.heldItems?.length > 0 && (
        <div className="mt-2 pt-2 border-t border-slate-700">
          <div className="flex items-center gap-2">
            <Shield className="w-3 h-3 text-slate-400" />
            <span className="text-xs text-slate-400">
              {pokemon.heldItems.length} item(s) equipped
            </span>
          </div>
        </div>
      )}
    </motion.div>
  );
}
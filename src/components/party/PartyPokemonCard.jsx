import React from 'react';
import { motion } from 'framer-motion';
import { Star, Heart, Shield, Zap, GripVertical } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { getPokemonStats } from '../pokemon/usePokemonStats';

const roleIcons = {
  Tank: Shield,
  Striker: Zap,
  Support: Heart,
  Medic: Heart,
  Scout: Zap,
  Juggernaut: Shield
};

export default function PartyPokemonCard({ pokemon, isDragging, position, isDisabled }) {
  const stats = getPokemonStats(pokemon).stats;
  const hpPercent = pokemon.currentHp ? pokemon.currentHp / stats.maxHp * 100 : 100;
  const primaryRole = pokemon.roles?.[0];
  const RoleIcon = roleIcons[primaryRole];

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className={`glass rounded-xl p-3 border-2 relative transition-all cursor-grab active:cursor-grabbing ${
      isDragging ?
      'border-indigo-500 shadow-2xl shadow-indigo-500/50 rotate-2 scale-105' :
      isDisabled ?
      'border-slate-700 opacity-50 cursor-not-allowed' :
      'border-slate-700 hover:border-indigo-500/50'}`
      }>

      {/* Drag Handle */}
      <div className="absolute top-2 right-2 text-slate-600">
        <GripVertical className="w-4 h-4" />
      </div>

      {/* Position Badge (Party Only) */}
      {position &&
      <div className="absolute top-2 left-2">
          <Badge className="bg-indigo-600 text-xs">#{position}</Badge>
        </div>
      }

      {/* Favorite Star */}
      {pokemon.isFavorite &&
      <div className="absolute top-2 left-2">
          <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
        </div>
      }

      {/* Sprite */}
      <div className="flex justify-center mb-2 mt-4">
        {pokemon.spriteUrl ?
        <img
          src={pokemon.spriteUrl}
          alt={pokemon.species}
          className="w-20 h-20 object-contain" /> :


        <div className="w-20 h-20 rounded-full bg-slate-800 flex items-center justify-center">
            <span className="text-2xl">{pokemon.species[0]}</span>
          </div>
        }
      </div>

      {/* Name */}
      <h3 className="font-bold text-white text-sm text-center truncate mb-1">
        {pokemon.nickname || pokemon.species}
      </h3>

      {/* Level */}
      <div className="flex justify-center mb-2">
        <Badge variant="outline" className="text-slate-50 px-2.5 py-0.5 text-xs font-semibold rounded-md inline-flex items-center border transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2">
          Lv. {pokemon.level}
        </Badge>
      </div>

      {/* HP Bar */}
      <div className="mb-2">
        <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
          <span>HP</span>
          <span className="text-white font-semibold">
            {pokemon.currentHp || stats.maxHp}/{stats.maxHp}
          </span>
        </div>
        <Progress
          value={hpPercent}
          className={`h-1.5 ${
          hpPercent > 50 ? 'bg-slate-700' : hpPercent > 20 ? 'bg-yellow-900' : 'bg-red-900'}`
          } />

      </div>

      {/* Role */}
      {primaryRole &&
      <div className="flex items-center justify-center gap-1 text-xs text-slate-400">
          {RoleIcon && <RoleIcon className="w-3 h-3" />}
          <span>{primaryRole}</span>
        </div>
      }

      {/* Dragging Overlay */}
      {isDragging &&
      <div className="absolute inset-0 bg-indigo-500/20 rounded-xl border-2 border-indigo-400 pointer-events-none" />
      }
    </motion.div>);

}
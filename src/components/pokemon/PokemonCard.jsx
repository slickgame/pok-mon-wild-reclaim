import React from 'react';
import { motion } from 'framer-motion';
import { Heart, Swords, Shield, Zap, Star, Sparkles } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import TalentTooltip from '@/components/talents/TalentTooltip';
import RevenantIndicator from './RevenantIndicator';
import { getPokemonStats } from './usePokemonStats';

const typeColors = {
  Normal: 'from-gray-400 to-gray-500',
  Fire: 'from-orange-500 to-red-500',
  Water: 'from-blue-400 to-blue-600',
  Electric: 'from-yellow-400 to-amber-500',
  Grass: 'from-green-400 to-emerald-600',
  Ice: 'from-cyan-300 to-blue-400',
  Fighting: 'from-red-600 to-red-800',
  Poison: 'from-purple-500 to-purple-700',
  Ground: 'from-amber-600 to-amber-800',
  Flying: 'from-indigo-300 to-purple-400',
  Psychic: 'from-pink-500 to-purple-500',
  Bug: 'from-lime-500 to-green-600',
  Rock: 'from-stone-500 to-stone-700',
  Ghost: 'from-purple-600 to-indigo-800',
  Dragon: 'from-indigo-600 to-purple-700',
  Dark: 'from-gray-700 to-gray-900',
  Steel: 'from-slate-400 to-slate-600',
  Fairy: 'from-pink-400 to-pink-500',
};

const gradeColors = {
  Basic: 'bg-amber-700/30 text-amber-400 border-amber-600/50',
  Rare: 'bg-slate-400/30 text-slate-200 border-slate-400/50',
  Epic: 'bg-yellow-500/30 text-yellow-300 border-yellow-500/50',
  Diamond: 'bg-cyan-400/30 text-cyan-200 border-cyan-400/50',
};

export default function PokemonCard({ pokemon, onClick, compact = false }) {
  const pokemonWithStats = getPokemonStats(pokemon);
  const stats = pokemonWithStats.stats;
  const gradientClass = typeColors[pokemon.type1] || 'from-indigo-500 to-purple-600';
  
  if (compact) {
    return (
      <motion.div
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        onClick={onClick}
        className="glass rounded-xl p-3 cursor-pointer group"
      >
        <div className="flex items-center gap-3">
          <div className={`w-12 h-12 rounded-lg bg-gradient-to-br ${gradientClass} p-0.5`}>
            <div className="w-full h-full rounded-lg bg-slate-900/50 flex items-center justify-center overflow-hidden">
              {pokemon.spriteUrl ? (
                <img src={pokemon.spriteUrl} alt={pokemon.species} className="w-10 h-10 object-contain" />
              ) : (
                <Sparkles className="w-5 h-5 text-white/50" />
              )}
            </div>
          </div>
          <div className="flex-1 min-w-0">
            <h4 className="font-semibold text-white truncate">
              {pokemon.nickname || pokemon.species}
            </h4>
            <p className="text-xs text-slate-400">Lv. {pokemon.level}</p>
          </div>
          <div className="text-right">
            <div className="flex items-center gap-1 text-xs text-slate-400">
              <Heart className="w-3 h-3 text-rose-400" />
              {stats.hp}/{stats.maxHp}
            </div>
          </div>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      whileHover={{ scale: 1.02, y: -4 }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className="glass rounded-2xl overflow-hidden cursor-pointer group"
    >
      <div className={`h-32 bg-gradient-to-br ${gradientClass} relative`}>
      <div className={`absolute inset-0 ${pokemon.isRevenant ? 'bg-red-900/40' : 'bg-black/20'}`} />
      <div className="absolute top-3 left-3 flex gap-2">
        <Badge className={`bg-black/30 text-white border-white/20 text-xs`}>
          Lv. {pokemon.level}
        </Badge>
        {pokemon.isStarter && (
          <Badge className="bg-yellow-500/30 text-yellow-300 border-yellow-500/50 text-xs">
            <Star className="w-3 h-3 mr-1" /> Starter
          </Badge>
        )}
      </div>
      <div className="absolute top-3 right-3">
        <RevenantIndicator pokemon={pokemon} size="sm" />
      </div>
        <div className="absolute inset-0 flex items-center justify-center">
          {pokemon.spriteUrl ? (
            <img 
              src={pokemon.spriteUrl} 
              alt={pokemon.species} 
              className="w-24 h-24 object-contain drop-shadow-2xl group-hover:scale-110 transition-transform duration-300"
            />
          ) : (
            <div className="w-20 h-20 rounded-full bg-white/10 flex items-center justify-center">
              <Sparkles className="w-8 h-8 text-white/50" />
            </div>
          )}
        </div>
      </div>
      
      <div className="p-4">
        <div className="flex items-start justify-between mb-3">
          <div>
            <h3 className="font-bold text-white text-lg">
              {pokemon.nickname || pokemon.species}
            </h3>
            {pokemon.nickname && (
              <p className="text-xs text-slate-400">{pokemon.species}</p>
            )}
          </div>
          <div className="flex gap-1">
            {pokemon.type1 && (
              <Badge className={`bg-gradient-to-r ${typeColors[pokemon.type1]} text-white text-xs border-0`}>
                {pokemon.type1}
              </Badge>
            )}
          </div>
        </div>

        {/* Stats Preview */}
        <div className="grid grid-cols-4 gap-2 mb-3">
          <div className="text-center">
            <div className="flex items-center justify-center gap-1 text-rose-400">
              <Heart className="w-3 h-3" />
              <span className="text-xs font-medium">{stats.hp}</span>
            </div>
            <span className="text-[10px] text-slate-500">HP</span>
          </div>
          <div className="text-center">
            <div className="flex items-center justify-center gap-1 text-orange-400">
              <Swords className="w-3 h-3" />
              <span className="text-xs font-medium">{stats.atk}</span>
            </div>
            <span className="text-[10px] text-slate-500">ATK</span>
          </div>
          <div className="text-center">
            <div className="flex items-center justify-center gap-1 text-blue-400">
              <Shield className="w-3 h-3" />
              <span className="text-xs font-medium">{stats.def}</span>
            </div>
            <span className="text-[10px] text-slate-500">DEF</span>
          </div>
          <div className="text-center">
            <div className="flex items-center justify-center gap-1 text-yellow-400">
              <Zap className="w-3 h-3" />
              <span className="text-xs font-medium">{stats.spd}</span>
            </div>
            <span className="text-[10px] text-slate-500">SPD</span>
          </div>
        </div>

        {/* Talents */}
        {pokemon.talents && pokemon.talents.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {pokemon.talents.slice(0, 2).map((talent, idx) => {
              const talentName = typeof talent === 'string' ? talent : talent.name || talent;
              const displayName = typeof talentName === 'string' 
                ? talentName.replace(/([A-Z])/g, ' $1').replace(/^./, c => c.toUpperCase()).trim()
                : talentName;
              const grade = typeof talent === 'object' ? talent.grade : null;
              
              return (
                <TalentTooltip key={idx} talent={talent}>
                  <Badge className={`text-[10px] ${grade ? gradeColors[grade] : 'bg-slate-700'}`}>
                    {displayName}
                  </Badge>
                </TalentTooltip>
              );
            })}
            {pokemon.talents.length > 2 && (
              <Badge className="text-[10px] bg-slate-700/50 text-slate-400">
                +{pokemon.talents.length - 2}
              </Badge>
            )}
          </div>
        )}

        {/* Roles */}
        {pokemon.roles && pokemon.roles.length > 0 && (
          <div className="flex gap-1 mt-2">
            {pokemon.roles.map((role, idx) => (
              <span key={idx} className="text-[10px] text-indigo-400">
                {role}
              </span>
            ))}
          </div>
        )}
      </div>
    </motion.div>
  );
}

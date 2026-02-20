import React from 'react';
import { motion } from 'framer-motion';
import { Badge } from '@/components/ui/badge';
import { Sparkles, Lock } from 'lucide-react';

export default function ZoneBestiary({ zone, discoveredPokemon = [] }) {
  const availablePokemon = zone?.availableWildPokemon || [];

  const getRarityColor = (rarity) => {
    switch (rarity) {
      case 'Legendary':
        return 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30';
      case 'Rare':
        return 'bg-purple-500/20 text-purple-300 border-purple-500/30';
      case 'Uncommon':
        return 'bg-blue-500/20 text-blue-300 border-blue-500/30';
      default:
        return 'bg-slate-700/50 text-slate-300 border-slate-600/30';
    }
  };

  const discoveredCount = availablePokemon.filter((pokemon) =>
    discoveredPokemon.includes(pokemon.species)
  ).length;

  return (
    <div className="glass rounded-xl p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-white flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-emerald-400" />
          Zone Bestiary
        </h3>
        <Badge className="bg-emerald-500/20 text-emerald-300 border-emerald-500/30">
          {discoveredCount}/{availablePokemon.length} Discovered
        </Badge>
      </div>

      {availablePokemon.length === 0 ? (
        <p className="text-slate-400 text-sm text-center py-8">
          No Pokémon data available for this zone yet.
        </p>
      ) : (
        <div className="space-y-3">
          {availablePokemon.map((pokemon, idx) => {
            const isDiscovered = discoveredPokemon.includes(pokemon.species);
            
            return (
              <motion.div
                key={pokemon.species}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.05 }}
                className={`rounded-lg p-4 border transition-all ${
                  isDiscovered
                    ? 'bg-slate-800/50 border-emerald-500/30 hover:border-emerald-500/50'
                    : 'bg-slate-900/30 border-slate-700/30'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                      isDiscovered ? 'bg-emerald-500/20' : 'bg-slate-700/50'
                    }`}>
                      {isDiscovered ? (
                        <Sparkles className="w-5 h-5 text-emerald-400" />
                      ) : (
                        <Lock className="w-4 h-4 text-slate-600" />
                      )}
                    </div>
                    <div>
                      <p className={`font-semibold ${
                        isDiscovered ? 'text-white' : 'text-slate-500'
                      }`}>
                        {isDiscovered ? pokemon.species : '??? Pokémon'}
                      </p>
                      <p className="text-xs text-slate-400 mt-0.5">
                        {isDiscovered
                          ? `Level ${pokemon.minLevel}-${pokemon.maxLevel}`
                          : 'Not yet discovered'}
                      </p>
                    </div>
                  </div>
                  <Badge className={getRarityColor(pokemon.rarity)}>
                    {pokemon.rarity}
                  </Badge>
                </div>

                {isDiscovered && (
                  <div className="mt-3 pt-3 border-t border-slate-700/50">
                    <div className="flex gap-4 text-xs text-slate-400">
                      <span>Min Level: {pokemon.minLevel}</span>
                      <span>Max Level: {pokemon.maxLevel}</span>
                      <span className="ml-auto text-emerald-400">✓ Discovered</span>
                    </div>
                  </div>
                )}
              </motion.div>
            );
          })}
        </div>
      )}

      {discoveredCount === availablePokemon.length && availablePokemon.length > 0 && (
        <div className="mt-4 p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-lg text-center">
          <p className="text-emerald-300 text-sm font-semibold">
            🎉 Bestiary Complete! All Pokémon discovered in this zone.
          </p>
        </div>
      )}
    </div>
  );
}
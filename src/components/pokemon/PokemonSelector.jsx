import React from 'react';
import PokemonCard from '@/components/pokemon/PokemonCard';
import { Skeleton } from '@/components/ui/skeleton';

export default function PokemonSelector({
  pokemon,
  selectedPokemon,
  onSelect,
  isLoading = false,
  title = 'Select a Pokémon'
}) {
  return (
    <div>
      <h3 className="text-lg font-semibold text-white mb-4">{title}</h3>
      {isLoading ? (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[1,2,3,4].map((item) => (
            <Skeleton key={`pokemon-selector-${item}`} className="h-48 bg-slate-800" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {pokemon.map((monster) => (
            <button
              type="button"
              key={monster.id}
              onClick={() => onSelect(monster)}
              className={`text-left rounded-xl transition ring-2 ring-transparent ${
                selectedPokemon?.id === monster.id ? 'ring-indigo-400/60' : 'hover:ring-slate-500/40'
              }`}
            >
              <PokemonCard pokemon={monster} compact />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

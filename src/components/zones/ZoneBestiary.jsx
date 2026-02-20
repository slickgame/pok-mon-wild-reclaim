import React from 'react';

export default function ZoneBestiary({ zone, discoveredPokemon }) {
  const availablePokemon = zone.availableWildPokemon || [];

  return (
    <div className="glass rounded-xl p-4">
      <h3 className="text-sm font-semibold text-white mb-3">Bestiary</h3>
      <p className="text-xs text-slate-400 mb-3">Discovered: {discoveredPokemon.length} / {availablePokemon.length}</p>
      <div className="space-y-2">
        {availablePokemon.map((pokemon, idx) => {
          const isDiscovered = discoveredPokemon.includes(pokemon.species);
          return (
            <div key={idx} className="flex items-center justify-between bg-slate-800/50 rounded-lg p-2">
              <span className="text-sm text-white">{isDiscovered ? pokemon.species : '???'}</span>
              <span className="text-xs text-slate-400">{pokemon.rarity}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
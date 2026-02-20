import React from 'react';

export default function ZonePartyPanel({ player, allPokemon }) {
  const partyPokemon = allPokemon.filter(p => p.isInTeam);

  return (
    <div className="glass rounded-xl p-4">
      <h3 className="text-sm font-semibold text-white mb-3">Party</h3>
      <div className="space-y-2">
        {partyPokemon.map(pokemon => (
          <div key={pokemon.id} className="flex items-center justify-between bg-slate-800/50 rounded-lg p-2">
            <span className="text-sm text-white">{pokemon.nickname || pokemon.species}</span>
            <span className="text-xs text-slate-400">Lv. {pokemon.level}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
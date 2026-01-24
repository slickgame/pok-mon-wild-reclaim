import { useMemo } from 'react';
import { getBaseStats } from './baseStats';
import { calculateAllStats } from './statCalculations';

/**
 * Hook to calculate Pokémon stats dynamically from base stats
 * Ensures stats are always fresh and not relying on stale stored values
 */
export function usePokemonStats(pokemon) {
  return useMemo(() => {
    if (!pokemon) return null;
    
    const baseStats = getBaseStats(pokemon.species);
    const calculatedStats = calculateAllStats(pokemon, baseStats);
    
    return {
      ...pokemon,
      stats: calculatedStats,
      baseStats
    };
  }, [pokemon?.species, pokemon?.level, pokemon?.nature, 
      JSON.stringify(pokemon?.ivs), JSON.stringify(pokemon?.evs)]);
}

/**
 * Calculate stats for a single Pokémon without React hooks
 */
export function getPokemonStats(pokemon) {
  if (!pokemon) return null;
  
  const baseStats = getBaseStats(pokemon.species);
  if (!baseStats) {
    console.error(`No base stats found for species: ${pokemon.species}`);
    return {
      ...pokemon,
      stats: pokemon.stats || { hp: 100, maxHp: 100, atk: 50, def: 50, spAtk: 50, spDef: 50, spd: 50 },
      baseStats: null
    };
  }
  
  const calculatedStats = calculateAllStats(pokemon, baseStats);
  
  return {
    ...pokemon,
    stats: calculatedStats,
    baseStats
  };
}
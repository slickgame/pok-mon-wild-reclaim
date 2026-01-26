import { caterpieData } from './pokemon/caterpie';

/**
 * Central Pokemon Registry
 * All Pokemon species are registered here for universal access
 */
export const PokemonRegistry = {
  caterpie: caterpieData,
  // Add future Pokemon below
};

/**
 * Get Pokemon data by species ID
 */
export function getPokemonData(speciesId) {
  return PokemonRegistry[speciesId.toLowerCase()] || null;
}
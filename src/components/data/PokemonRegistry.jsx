import { caterpieData } from './pokemon/caterpie';
import { pidgeyData } from './pokemon/pidgey';
import { pidgeottoData } from './pokemon/pidgeotto';
import { pidgeotData } from './pokemon/pidgeot';

/**
 * Central Pokemon Registry
 * All Pokemon species are registered here for universal access
 */
export const PokemonRegistry = {
  caterpie: caterpieData,
  pidgey: pidgeyData,
  pidgeotto: pidgeottoData,
  pidgeot: pidgeotData,
  // Add future Pokemon below
};

/**
 * Get Pokemon data by species ID
 */
export function getPokemonData(speciesId) {
  return PokemonRegistry[speciesId.toLowerCase()] || null;
}

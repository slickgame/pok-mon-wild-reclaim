import { caterpieData } from './pokemon/caterpie';
import { metapodData } from './pokemon/metapod';
import { butterfreeData } from './pokemon/butterfree';
import { pidgeyData } from './pokemon/pidgey';
import { pidgeottoData } from './pokemon/pidgeotto';
import { pidgeotData } from './pokemon/pidgeot';
import { oddishData } from './pokemon/oddish';
import { gloomData } from './pokemon/gloom';
import { vileplumeData } from './pokemon/vileplume';
import { bellossomData } from './pokemon/bellossom';

/**
 * Central Pokemon Registry
 * All Pokemon species are registered here for universal access
 */
export const PokemonRegistry = {
  caterpie: caterpieData,
  metapod: metapodData,
  butterfree: butterfreeData,
  pidgey: pidgeyData,
  pidgeotto: pidgeottoData,
  pidgeot: pidgeotData,
  oddish: oddishData,
  gloom: gloomData,
  vileplume: vileplumeData,
  bellossom: bellossomData,
  // Add future Pokemon below
};

/**
 * Get Pokemon data by species ID
 */
export function getPokemonData(speciesId) {
  return PokemonRegistry[speciesId.toLowerCase()] || null;
}

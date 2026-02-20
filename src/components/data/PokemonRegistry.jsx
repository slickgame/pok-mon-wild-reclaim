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
import { pikachuData } from './pokemon/pikachu';
import { raichuData } from './pokemon/raichu';
import { cherubiData } from './pokemon/cherubi';
import { cherrimData } from './pokemon/cherrim';
import { tsareenaData } from './pokemon/tsareena';
import { steeneeData } from './pokemon/steenee';
import { bounsweetData } from './pokemon/bounsweet';

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
  pikachu: pikachuData,
  raichu: raichuData,
  cherubi: cherubiData,
  cherrim: cherrimData,
  bounsweet: bounsweetData,
  steenee: steeneeData,
  tsareena: tsareenaData,
  // Add future Pokemon below
};

function normalizeSpeciesId(speciesId) {
  return typeof speciesId === 'string' ? speciesId.trim().toLowerCase() : '';
}

/**
 * Get Pokemon data by species ID
 */
export function getPokemonData(speciesId) {
  const normalizedSpeciesId = normalizeSpeciesId(speciesId);
  if (!normalizedSpeciesId) return null;
  return PokemonRegistry[normalizedSpeciesId] || null;
}

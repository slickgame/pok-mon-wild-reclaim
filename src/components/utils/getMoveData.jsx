import { MOVE_DATA } from '@/components/pokemon/moveData';
import { wildPokemonData } from '@/components/zones/wildPokemonData';

/**
 * Unified move data resolver
 * Checks pokemon learnset first, then global registry
 * @param {string} moveName - Name of the move to look up
 * @param {Object} pokemon - Pokemon instance (optional, for learnset lookup)
 * @returns {Object} Move data with all properties
 */
export function getMoveData(moveName, pokemon = null) {
  // Check pokemon's learnset first (for species-specific moves)
  if (pokemon?.species) {
    const speciesData = wildPokemonData[pokemon.species];
    if (speciesData?.learnset) {
      // Handle both array and object formats
      if (Array.isArray(speciesData.learnset)) {
        const moveFromLearnset = speciesData.learnset.find(m => m.name === moveName);
        if (moveFromLearnset) {
          return moveFromLearnset;
        }
      } else if (typeof speciesData.learnset === 'object') {
        // Learnset is an object with move names as keys
        const moveFromLearnset = speciesData.learnset[moveName];
        if (moveFromLearnset) {
          return { name: moveName, ...moveFromLearnset };
        }
      }
    }
  }

  // Check global move registry
  const globalMove = MOVE_DATA[moveName];
  if (globalMove) {
    return { name: moveName, ...globalMove };
  }

  // Fallback for unknown moves
  return {
    name: moveName,
    type: "Normal",
    category: "Physical",
    power: 40,
    accuracy: 100,
    pp: 35,
    description: "A basic move."
  };
}
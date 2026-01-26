import { MOVE_DATA } from '@/components/pokemon/moveData';
import { PokemonRegistry } from '@/components/data/PokemonRegistry';

/**
 * Universal move resolver
 * Priority: Pokemon's learnset > Global MoveRegistry
 * @param {string} moveName - Name of the move
 * @param {Object} pokemon - Pokemon instance with species
 * @returns {Object} Complete move data
 */
export function resolveMove(moveName, pokemon) {
  if (!moveName) return null;

  // Check pokemon's species learnset first
  if (pokemon?.species) {
    const speciesData = PokemonRegistry[pokemon.species.toLowerCase()];
    if (speciesData?.learnset && Array.isArray(speciesData.learnset)) {
      const moveFromLearnset = speciesData.learnset.find(m => m.name === moveName);
      if (moveFromLearnset) {
        return moveFromLearnset;
      }
    }
  }

  // Fallback to global move registry
  const globalMove = MOVE_DATA[moveName];
  if (globalMove) {
    return { name: moveName, ...globalMove };
  }

  // Final fallback
  return {
    name: moveName,
    type: '???',
    category: 'Physical',
    power: 0,
    accuracy: 100,
    pp: 35,
    priority: 0,
    description: 'Move data not found.'
  };
}
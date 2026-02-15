import { MOVE_DATA } from '@/components/pokemon/moveData';
import { getPokemonData } from '@/components/data/PokemonRegistry';

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
    const speciesData = getPokemonData(pokemon.species);
    if (speciesData?.learnset && Array.isArray(speciesData.learnset)) {
      const moveFromLearnset = speciesData.learnset.find(
        m => (m.name || m.move) === moveName
      );
      if (moveFromLearnset) {
        if (moveFromLearnset.type) {
          const globalMove = MOVE_DATA[moveName];
          const merged = {
            name: moveName,
            ...(globalMove || {}),
            ...moveFromLearnset,
          };
          if (!moveFromLearnset.tags) {
            merged.tags = globalMove?.tags || [];
          }
          if (!merged.tags) {
            merged.tags = [];
          }
          return merged;
        }
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
    tags: [],
    description: 'Move data not found.'
  };
}

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

  const withDefaults = (move) => {
    if (!move) return null;
    const basePower = move.power ?? 0;
    return {
      name: moveName,
      type: move.type ?? '???',
      category: move.category ?? (basePower > 0 ? 'Physical' : 'Status'),
      power: basePower,
      accuracy: move.accuracy === undefined ? 100 : move.accuracy,
      pp: move.pp ?? 35,
      priority: move.priority ?? 0,
      description: move.description ?? 'Move data not found.',
      ...move
    };
  };

  // Check pokemon's species learnset first
  if (pokemon?.species) {
    const speciesData = PokemonRegistry[pokemon.species.toLowerCase()];
    if (speciesData?.learnset && Array.isArray(speciesData.learnset)) {
      const moveFromLearnset = speciesData.learnset.find(m => m.name === moveName);
      if (moveFromLearnset) {
        const globalMove = MOVE_DATA[moveName];
        return withDefaults({ ...globalMove, ...moveFromLearnset, name: moveName });
      }
    }
  }

  // Fallback to global move registry
  const globalMove = MOVE_DATA[moveName];
  if (globalMove) {
    return withDefaults({ name: moveName, ...globalMove });
  }

  // Final fallback
  return withDefaults({ name: moveName });
}

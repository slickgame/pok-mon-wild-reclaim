import { MOVE_DATA } from '@/components/pokemon/moveData';
import { wildPokemonData } from '@/components/zones/wildPokemonData';
import { caterpieMoves } from '@/components/zones/caterpieMoves';

/**
 * Unified move data resolver
 * Priority: Species custom moves > Global registry > Default fallback
 * @param {string} moveName - Name of the move to look up
 * @param {Object} pokemon - Pokemon instance (optional, for species lookup)
 * @returns {Object} Move data with all properties
 */
export function getMoveData(moveName, pokemon = null) {
  if (!moveName) return null;

  // Check species-specific custom moves first (e.g., Caterpie moves)
  if (pokemon?.species === 'Caterpie' && caterpieMoves[moveName]) {
    return caterpieMoves[moveName];
  }

  // Check global move registry
  const globalMove = MOVE_DATA[moveName];
  if (globalMove) {
    return { name: moveName, ...globalMove };
  }

  // Default fallback with N/A handling
  return {
    name: moveName,
    type: '???',
    category: 'Physical',
    power: 0,
    accuracy: 100,
    pp: 35,
    priority: 0,
    description: 'Move data not available.'
  };
}
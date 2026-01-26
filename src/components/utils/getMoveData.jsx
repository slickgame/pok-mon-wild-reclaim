import { resolveMove } from './resolveMove';

/**
 * Unified move data resolver (uses resolveMove)
 * Priority: Pokemon learnset > Global registry > Default fallback
 * @param {string} moveName - Name of the move to look up
 * @param {Object} pokemon - Pokemon instance (optional, for learnset lookup)
 * @returns {Object} Move data with all properties
 */
export function getMoveData(moveName, pokemon = null) {
  return resolveMove(moveName, pokemon);
}
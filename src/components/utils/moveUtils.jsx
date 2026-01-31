/**
 * Checks if a move has a specific tag.
 * @param {object} move
 * @param {string} tag
 * @returns {boolean}
 */
export function hasTag(move, tag) {
  return move?.tags?.includes(tag) ?? false;
}

/**
 * Checks if a move has any tag from a set.
 * @param {object} move
 * @param {string[]} tags
 * @returns {boolean}
 */
export function hasAnyTag(move, tags = []) {
  if (!move?.tags) return false;
  return tags.some((tag) => move.tags.includes(tag));
}

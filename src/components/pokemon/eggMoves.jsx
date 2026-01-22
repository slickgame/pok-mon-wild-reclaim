// Egg move inheritance rules
// Moves that can be passed from parents to offspring

export const EGG_MOVES = {
  Charmander: ['Dragon Dance', 'Outrage', 'Flare Blitz', 'Counter', 'Belly Drum'],
  Bulbasaur: ['Giga Drain', 'Leaf Storm', 'Power Whip', 'Curse', 'Amnesia'],
  Squirtle: ['Dragon Pulse', 'Aura Sphere', 'Aqua Ring', 'Mirror Coat', 'Yawn'],
  Pikachu: ['Volt Tackle', 'Wish', 'Fake Out', 'Encore', 'Present'],
  Eevee: ['Wish', 'Yawn', 'Curse', 'Tickle', 'Detect'],
  Machop: ['Close Combat', 'Bullet Punch', 'Ice Punch', 'Thunder Punch', 'Fire Punch'],
  Magikarp: ['Bounce', 'Hydro Pump'],
  Dratini: ['Extreme Speed', 'Dragon Dance', 'Dragon Rush', 'Aqua Jet'],
};

/**
 * Get egg moves for a species
 * @param {string} species - Pokémon species name
 * @returns {string[]} Array of move names
 */
export function getEggMoves(species) {
  return EGG_MOVES[species] || [];
}

/**
 * Determine which moves offspring should inherit from parents
 * @param {Object} parent1 - First parent Pokémon
 * @param {Object} parent2 - Second parent Pokémon (optional)
 * @param {string} offspringSpecies - Species of the offspring
 * @returns {string[]} Array of 1-2 inherited moves
 */
export function calculateInheritedMoves(parent1, parent2, offspringSpecies) {
  const inheritedMoves = [];
  const eggMoves = getEggMoves(offspringSpecies);
  
  if (eggMoves.length === 0) return [];
  
  // Get moves from both parents
  const parent1Moves = parent1.abilities || [];
  const parent2Moves = parent2 ? (parent2.abilities || []) : [];
  
  // Check for egg moves that either parent knows
  const availableEggMoves = eggMoves.filter(move => 
    parent1Moves.includes(move) || parent2Moves.includes(move)
  );
  
  // Inherit 1-2 random egg moves from available pool
  if (availableEggMoves.length > 0) {
    // Shuffle and take 1-2
    const shuffled = [...availableEggMoves].sort(() => Math.random() - 0.5);
    const count = Math.min(2, shuffled.length);
    inheritedMoves.push(...shuffled.slice(0, count));
  }
  
  // If no egg moves available, try to inherit one move both parents know
  if (inheritedMoves.length === 0 && parent2) {
    const commonMoves = parent1Moves.filter(move => parent2Moves.includes(move));
    if (commonMoves.length > 0) {
      const randomMove = commonMoves[Math.floor(Math.random() * commonMoves.length)];
      inheritedMoves.push(randomMove);
    }
  }
  
  return inheritedMoves;
}

/**
 * Check if a move can be inherited by a species
 * @param {string} species - Pokémon species name
 * @param {string} moveName - Move name
 * @returns {boolean}
 */
export function canInheritMove(species, moveName) {
  const eggMoves = getEggMoves(species);
  return eggMoves.includes(moveName);
}
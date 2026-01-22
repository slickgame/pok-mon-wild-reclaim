// Comprehensive move data including type, category, power, accuracy, PP, and descriptions
// Used for battle calculations, UI displays, and move compatibility checks

export const MOVE_DATA = {
  // Charmander's moves
  'Scratch': {
    type: 'Normal',
    category: 'Physical',
    power: 40,
    accuracy: 100,
    pp: 35,
    description: 'A basic claw attack.'
  },
  'Growl': {
    type: 'Normal',
    category: 'Status',
    power: 0,
    accuracy: 100,
    pp: 40,
    description: 'Lowers enemy Attack.',
    effect: 'lowerAttack'
  },
  'Ember': {
    type: 'Fire',
    category: 'Special',
    power: 40,
    accuracy: 100,
    pp: 25,
    description: 'May burn target.',
    effect: 'burn',
    effectChance: 10
  },
  'Flame Pulse': {
    type: 'Fire',
    category: 'Special',
    power: 50,
    accuracy: 100,
    pp: 15,
    description: '30% chance to Burn. Deals +30% damage if Role is Powerhouse. Guaranteed Burn if used after Growl.',
    signature: true,
    effect: 'burn',
    effectChance: 30,
    synergy: {
      rolebonus: 'Powerhouse',
      roleDamageMultiplier: 1.3,
      comboMove: 'Growl',
      comboEffect: 'guaranteedBurn'
    }
  },
  'Smokescreen': {
    type: 'Normal',
    category: 'Status',
    power: 0,
    accuracy: 100,
    pp: 20,
    description: 'Lowers enemy Accuracy.',
    effect: 'lowerAccuracy'
  },
  'Dragon Rage': {
    type: 'Dragon',
    category: 'Special',
    power: 0,
    accuracy: 100,
    pp: 10,
    description: 'Always deals 40 damage.',
    fixedDamage: 40
  },
  'Flame Burst': {
    type: 'Fire',
    category: 'Special',
    power: 70,
    accuracy: 100,
    pp: 15,
    description: 'May burn surrounding targets.',
    effect: 'burn',
    effectChance: 10,
    aoe: true
  },
  'Slash': {
    type: 'Normal',
    category: 'Physical',
    power: 70,
    accuracy: 100,
    pp: 20,
    description: 'High critical hit ratio.',
    critRatio: 2
  },
  'Inferno': {
    type: 'Fire',
    category: 'Special',
    power: 100,
    accuracy: 50,
    pp: 5,
    description: 'Guaranteed Burn if it hits.',
    effect: 'burn',
    effectChance: 100
  },
  'Fire Spin': {
    type: 'Fire',
    category: 'Special',
    power: 35,
    accuracy: 85,
    pp: 15,
    description: 'Traps and damages for 4–5 turns.',
    effect: 'trap',
    trapDuration: [4, 5]
  },
  'Fire Fang': {
    type: 'Fire',
    category: 'Physical',
    power: 65,
    accuracy: 95,
    pp: 15,
    description: 'May cause Burn or flinch.',
    effect: 'burnOrFlinch',
    effectChance: 10
  },

  // Common moves
  'Tackle': {
    type: 'Normal',
    category: 'Physical',
    power: 40,
    accuracy: 100,
    pp: 35,
    description: 'A full-body charge attack.'
  },
  'Tail Whip': {
    type: 'Normal',
    category: 'Status',
    power: 0,
    accuracy: 100,
    pp: 30,
    description: 'Lowers enemy Defense.',
    effect: 'lowerDefense'
  },
  'Quick Attack': {
    type: 'Normal',
    category: 'Physical',
    power: 40,
    accuracy: 100,
    pp: 30,
    description: 'Always strikes first.',
    priority: 1
  },

  // Add more moves as needed
};

/**
 * Get move data by name
 * @param {string} moveName - Name of the move
 * @returns {Object|null} Move data or null if not found
 */
export function getMoveData(moveName) {
  return MOVE_DATA[moveName] || null;
}

/**
 * Check if a move is a signature move
 * @param {string} moveName - Name of the move
 * @returns {boolean}
 */
export function isSignatureMove(moveName) {
  const move = MOVE_DATA[moveName];
  return move?.signature === true;
}

/**
 * Get move synergy data
 * @param {string} moveName - Name of the move
 * @returns {Object|null} Synergy data or null
 */
export function getMoveSynergy(moveName) {
  const move = MOVE_DATA[moveName];
  return move?.synergy || null;
}

/**
 * Calculate move damage with synergy bonuses
 * @param {string} moveName - Name of the move
 * @param {Object} pokemon - Pokémon using the move
 * @param {Array} previousMoves - Moves used in previous turns
 * @returns {number} Modified power
 */
export function calculateSynergyDamage(moveName, pokemon, previousMoves = []) {
  const move = MOVE_DATA[moveName];
  if (!move || !move.synergy) return move?.power || 0;

  let power = move.power;
  const synergy = move.synergy;

  // Check role bonus
  if (synergy.rolebonus && pokemon.roles?.includes(synergy.rolebonus)) {
    power *= synergy.roleDamageMultiplier || 1;
  }

  // Check combo move
  if (synergy.comboMove && previousMoves.includes(synergy.comboMove)) {
    // Combo effects are handled separately (e.g., guaranteed burn)
  }

  return Math.floor(power);
}
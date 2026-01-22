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

  // Squirtle's moves
  'Bubble': {
    type: 'Water',
    category: 'Special',
    power: 40,
    accuracy: 100,
    pp: 30,
    description: 'May lower enemy Speed.',
    effect: 'lowerSpeed',
    effectChance: 10
  },
  'Shell Slam': {
    type: 'Water',
    category: 'Physical',
    power: 45,
    accuracy: 100,
    pp: 10,
    description: 'Hits twice if HP > 75%. 20% chance to lower enemy Attack.',
    signature: true,
    effect: 'lowerAttack',
    effectChance: 20,
    synergy: {
      rolebonus: 'Juggernaut',
      hpThreshold: 0.75,
      multiHit: 2,
      description: 'Hits twice when HP is above 75%'
    }
  },
  'Withdraw': {
    type: 'Water',
    category: 'Status',
    power: 0,
    accuracy: null,
    pp: 40,
    description: "Raises user's Defense.",
    effect: 'raiseDefense',
    stages: 1
  },
  'Water Gun': {
    type: 'Water',
    category: 'Special',
    power: 40,
    accuracy: 100,
    pp: 25,
    description: 'Basic ranged STAB.'
  },
  'Protect': {
    type: 'Normal',
    category: 'Status',
    power: 0,
    accuracy: null,
    pp: 10,
    description: 'Prevents all damage that turn.',
    effect: 'protect',
    priority: 4
  },
  'Aqua Ring': {
    type: 'Water',
    category: 'Status',
    power: 0,
    accuracy: null,
    pp: 20,
    description: 'Restores HP each turn.',
    effect: 'healOverTime',
    healAmount: 0.0625
  },
  'Bite': {
    type: 'Dark',
    category: 'Physical',
    power: 60,
    accuracy: 100,
    pp: 25,
    description: 'May cause flinch.',
    effect: 'flinch',
    effectChance: 30
  },
  'Surf': {
    type: 'Water',
    category: 'Special',
    power: 90,
    accuracy: 100,
    pp: 15,
    description: 'Hits all adjacent foes.',
    aoe: true
  },
  'Iron Defense': {
    type: 'Steel',
    category: 'Status',
    power: 0,
    accuracy: null,
    pp: 15,
    description: "Sharply raises user's Defense.",
    effect: 'raiseDefense',
    stages: 2
  },

  // Bulbasaur's moves
  'Leech Seed': {
    type: 'Grass',
    category: 'Status',
    power: 0,
    accuracy: 90,
    pp: 10,
    description: 'Seeds foe to sap HP each turn.',
    effect: 'leechSeed',
    drainPercentage: 0.125
  },
  'Sap Bind': {
    type: 'Grass',
    category: 'Special',
    power: 35,
    accuracy: 100,
    pp: 10,
    description: 'Drains 25% of damage to all allies. Doubled if user is Medic Role.',
    signature: true,
    effect: 'healAllies',
    healPercentage: 0.25,
    synergy: {
      rolebonus: 'Medic',
      roleHealMultiplier: 2,
      description: 'Healing doubled when used by Medic role'
    }
  },
  'Vine Whip': {
    type: 'Grass',
    category: 'Physical',
    power: 45,
    accuracy: 100,
    pp: 25,
    description: 'Whips target with vines.'
  },
  'Sleep Powder': {
    type: 'Grass',
    category: 'Status',
    power: 0,
    accuracy: 75,
    pp: 15,
    description: 'Puts target to sleep.',
    effect: 'sleep'
  },
  'Synthesis': {
    type: 'Grass',
    category: 'Status',
    power: 0,
    accuracy: null,
    pp: 5,
    description: "Heals user's HP.",
    effect: 'healSelf',
    healPercentage: 0.5
  },
  'Poison Powder': {
    type: 'Poison',
    category: 'Status',
    power: 0,
    accuracy: 75,
    pp: 35,
    description: 'Poisons the target.',
    effect: 'poison'
  },
  'Magical Leaf': {
    type: 'Grass',
    category: 'Special',
    power: 60,
    accuracy: null,
    pp: 20,
    description: 'Always hits.',
    neverMiss: true
  },
  'Aromatherapy': {
    type: 'Grass',
    category: 'Status',
    power: 0,
    accuracy: null,
    pp: 5,
    description: 'Heals all allies of status conditions.',
    effect: 'healStatusAllies'
  },
  'Giga Drain': {
    type: 'Grass',
    category: 'Special',
    power: 75,
    accuracy: 100,
    pp: 10,
    description: 'Deals damage and heals for 50% of it.',
    effect: 'drain',
    drainPercentage: 0.5
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
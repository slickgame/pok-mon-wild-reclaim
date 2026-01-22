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
    signatureFor: ['Medic', 'Support'],
    tags: ['signature', 'healing', 'support'],
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

  // Charmeleon's additional moves
  'Dragon Breath': {
    type: 'Dragon',
    category: 'Special',
    power: 60,
    accuracy: 100,
    pp: 20,
    description: '30% chance to paralyze.',
    effect: 'paralyze',
    effectChance: 30
  },
  'Flamethrower': {
    type: 'Fire',
    category: 'Special',
    power: 90,
    accuracy: 100,
    pp: 15,
    description: 'Powerful STAB.',
    effect: 'burn',
    effectChance: 10
  },
  'Scary Face': {
    type: 'Normal',
    category: 'Status',
    power: 0,
    accuracy: 100,
    pp: 10,
    description: 'Sharply lowers Speed.',
    effect: 'lowerSpeed',
    stages: 2
  },
  'Fire Blast': {
    type: 'Fire',
    category: 'Special',
    power: 110,
    accuracy: 85,
    pp: 5,
    description: 'Very strong STAB.',
    effect: 'burn',
    effectChance: 10
  },
  'Flare Blitz': {
    type: 'Fire',
    category: 'Physical',
    power: 120,
    accuracy: 100,
    pp: 15,
    description: 'Recoil damage.',
    effect: 'recoil',
    recoilPercentage: 0.33
  },

  // Wartortle's additional moves
  'Rapid Spin': {
    type: 'Normal',
    category: 'Physical',
    power: 50,
    accuracy: 100,
    pp: 40,
    description: 'Removes hazards.',
    effect: 'removeHazards'
  },
  'Water Pulse': {
    type: 'Water',
    category: 'Special',
    power: 60,
    accuracy: 100,
    pp: 20,
    description: 'May confuse.',
    effect: 'confuse',
    effectChance: 20
  },
  'Aqua Tail': {
    type: 'Water',
    category: 'Physical',
    power: 90,
    accuracy: 90,
    pp: 10,
    description: 'Strong STAB.'
  },
  'Crunch': {
    type: 'Dark',
    category: 'Physical',
    power: 80,
    accuracy: 100,
    pp: 15,
    description: 'May lower Defense.',
    effect: 'lowerDefense',
    effectChance: 20
  },
  'Muddy Water': {
    type: 'Water',
    category: 'Special',
    power: 90,
    accuracy: 85,
    pp: 10,
    description: 'Hits all, may lower accuracy.',
    aoe: true,
    effect: 'lowerAccuracy',
    effectChance: 30
  },
  'Hydro Pump': {
    type: 'Water',
    category: 'Special',
    power: 110,
    accuracy: 80,
    pp: 5,
    description: 'Big damage.'
  },

  // Ivysaur's additional moves
  'Sweet Scent': {
    type: 'Normal',
    category: 'Status',
    power: 0,
    accuracy: 100,
    pp: 20,
    description: 'Lowers enemy evasion.',
    effect: 'lowerEvasion',
    stages: 1
  },
  'Seed Bomb': {
    type: 'Grass',
    category: 'Physical',
    power: 80,
    accuracy: 100,
    pp: 15,
    description: 'Reliable STAB.'
  },
  'Heal Pulse': {
    type: 'Psychic',
    category: 'Status',
    power: 0,
    accuracy: null,
    pp: 10,
    description: 'Heals target for 50% HP.',
    effect: 'healTarget',
    healPercentage: 0.5
  },
  'Energy Ball': {
    type: 'Grass',
    category: 'Special',
    power: 90,
    accuracy: 100,
    pp: 10,
    description: 'Chance to lower Sp. Def.',
    effect: 'lowerSpDef',
    effectChance: 10
  },
  'Toxic': {
    type: 'Poison',
    category: 'Status',
    power: 0,
    accuracy: 90,
    pp: 10,
    description: 'Badly poisons foe.',
    effect: 'badlyPoison'
  },
  'Grassy Terrain': {
    type: 'Grass',
    category: 'Status',
    power: 0,
    accuracy: null,
    pp: 10,
    description: 'Heals grass types & boosts moves.',
    effect: 'setTerrain',
    terrain: 'grassy'
  },
  'Petal Dance': {
    type: 'Grass',
    category: 'Special',
    power: 120,
    accuracy: 100,
    pp: 10,
    description: '2–3 turns; confusion after.',
    effect: 'confuseAfter',
    lockTurns: [2, 3]
  },

  // Additional TM/HM and Tutor Moves
  'Will-O-Wisp': {
    type: 'Fire',
    category: 'Status',
    power: 0,
    accuracy: 85,
    pp: 15,
    description: 'Burns the opponent.',
    effect: 'burn'
  },
  'Sunny Day': {
    type: 'Fire',
    category: 'Status',
    power: 0,
    accuracy: null,
    pp: 5,
    description: 'Boosts fire, weakens water for 5 turns.',
    effect: 'weather',
    weather: 'sun',
    duration: 5
  },
  'Rain Dance': {
    type: 'Water',
    category: 'Status',
    power: 0,
    accuracy: null,
    pp: 5,
    description: 'Boosts water-type moves, activates healing synergy.',
    effect: 'weather',
    weather: 'rain',
    duration: 5
  },
  'Aerial Ace': {
    type: 'Flying',
    category: 'Physical',
    power: 60,
    accuracy: null,
    pp: 20,
    description: 'Never misses.',
    neverMiss: true
  },
  'Shadow Claw': {
    type: 'Ghost',
    category: 'Physical',
    power: 70,
    accuracy: 100,
    pp: 15,
    description: 'High crit chance.',
    critRate: 2
  },
  'Brick Break': {
    type: 'Fighting',
    category: 'Physical',
    power: 75,
    accuracy: 100,
    pp: 15,
    description: 'Breaks barriers like Light Screen, Reflect.',
    effect: 'breakScreens'
  },
  'Sludge Bomb': {
    type: 'Poison',
    category: 'Special',
    power: 90,
    accuracy: 100,
    pp: 10,
    description: 'May poison target.',
    effect: 'poison',
    effectChance: 30
  },
  'Light Screen': {
    type: 'Psychic',
    category: 'Status',
    power: 0,
    accuracy: null,
    pp: 30,
    description: 'Halves special damage for 5 turns.',
    effect: 'setScreen',
    screen: 'lightScreen',
    duration: 5
  },
  'Reflect': {
    type: 'Psychic',
    category: 'Status',
    power: 0,
    accuracy: null,
    pp: 20,
    description: 'Halves physical damage for 5 turns.',
    effect: 'setScreen',
    screen: 'reflect',
    duration: 5
  },
  'Heat Wave': {
    type: 'Fire',
    category: 'Special',
    power: 95,
    accuracy: 90,
    pp: 10,
    description: 'Hits all foes, may burn.',
    aoe: true,
    effect: 'burn',
    effectChance: 10
  },
  'Blast Burn': {
    type: 'Fire',
    category: 'Special',
    power: 150,
    accuracy: 90,
    pp: 5,
    description: 'Very strong fire move. Must recharge next turn.',
    effect: 'recharge'
  },
  'Zen Headbutt': {
    type: 'Psychic',
    category: 'Physical',
    power: 80,
    accuracy: 90,
    pp: 15,
    description: 'May cause flinch.',
    effect: 'flinch',
    effectChance: 20
  },
  'Hydro Cannon': {
    type: 'Water',
    category: 'Special',
    power: 150,
    accuracy: 90,
    pp: 5,
    description: 'Ultimate move. Requires recharge.',
    effect: 'recharge'
  },
  'Grass Pledge': {
    type: 'Grass',
    category: 'Special',
    power: 80,
    accuracy: 100,
    pp: 10,
    description: 'Combo move if used with Fire/Water Pledge.',
    effect: 'pledge'
  },
  'Frenzy Plant': {
    type: 'Grass',
    category: 'Special',
    power: 150,
    accuracy: 90,
    pp: 5,
    description: 'Ultimate move. Requires recharge.',
    tags: ['ultimate', 'recharge'],
    effect: 'recharge'
  },

  // Egg Moves - Charmander line
  'Dragon Dance': {
    type: 'Dragon',
    category: 'Status',
    power: 0,
    accuracy: null,
    pp: 20,
    description: 'Boosts Attack and Speed.',
    tags: ['eggMove', 'statBoost', 'setup'],
    effect: 'multiBoost',
    boosts: {
      attack: 1,
      speed: 1
    }
  },
  'Bite': {
    type: 'Dark',
    category: 'Physical',
    power: 60,
    accuracy: 100,
    pp: 25,
    description: 'May flinch target.',
    tags: ['eggMove', 'flinch'],
    effect: 'flinch',
    effectChance: 30
  },
  'Metal Claw': {
    type: 'Steel',
    category: 'Physical',
    power: 50,
    accuracy: 95,
    pp: 35,
    description: 'May raise Attack.',
    tags: ['eggMove', 'statBoost'],
    effect: 'raiseAttack',
    effectChance: 10
  },

  // Egg Moves - Squirtle line
  'Mirror Coat': {
    type: 'Psychic',
    category: 'Special',
    power: 0,
    accuracy: 100,
    pp: 20,
    description: 'Reflects special attacks back.',
    tags: ['eggMove', 'counterMove', 'priority'],
    effect: 'mirrorCoat',
    priority: -5
  },
  'Mud Sport': {
    type: 'Ground',
    category: 'Status',
    power: 0,
    accuracy: null,
    pp: 15,
    description: 'Reduces Electric-type move power.',
    tags: ['eggMove', 'fieldEffect'],
    effect: 'mudSport',
    duration: 5
  },
  'Aqua Jet': {
    type: 'Water',
    category: 'Physical',
    power: 40,
    accuracy: 100,
    pp: 20,
    description: 'Priority move (goes first).',
    tags: ['eggMove', 'priority'],
    priority: 1
  },

  // Egg Moves - Bulbasaur line
  'Amnesia': {
    type: 'Psychic',
    category: 'Status',
    power: 0,
    accuracy: null,
    pp: 20,
    description: 'Sharply raises Sp. Def.',
    tags: ['eggMove', 'statBoost', 'setup'],
    effect: 'raiseSpDef',
    stages: 2
  },
  'Ingrain': {
    type: 'Grass',
    category: 'Status',
    power: 0,
    accuracy: null,
    pp: 20,
    description: 'Plants roots to recover HP.',
    tags: ['eggMove', 'healing', 'passive'],
    effect: 'ingrain',
    healPercentage: 0.0625
  },
  'Nature Power': {
    type: 'Normal',
    category: 'Varies',
    power: 0,
    accuracy: null,
    pp: 20,
    description: 'Converts to another move depending on terrain.',
    tags: ['eggMove', 'terrainBoosted', 'versatile'],
    effect: 'naturePower'
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
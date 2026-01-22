// Level-up move learnsets for each Pokémon species
// Format: { level: [move names] }

export const LEVEL_UP_LEARNSETS = {
  // Starters
  Charmander: {
    1: ['Scratch', 'Growl'],
    7: ['Ember'],
    10: ['Flame Pulse'], // Signature: 30% Burn, +30% damage if Powerhouse role, Guaranteed Burn after Growl
    13: ['Smokescreen'],
    16: ['Dragon Rage'],
    20: ['Flame Burst'],
    26: ['Slash'],
    30: ['Inferno'],
    34: ['Fire Spin'],
    40: ['Fire Fang'],
  },
  
  Bulbasaur: {
    1: ['Tackle', 'Growl'],
    7: ['Vine Whip'],
    10: ['Leech Seed'],
    13: ['Synthesis'], // Signature
    16: ['Razor Leaf'],
    19: ['Sleep Powder'],
    22: ['Seed Bomb'],
    25: ['Toxic'],
    28: ['Solar Beam'],
    32: ['Petal Dance'],
  },
  
  Squirtle: {
    1: ['Tackle', 'Tail Whip'],
    7: ['Water Gun'],
    10: ['Withdraw'],
    13: ['Aqua Shield'], // Signature
    16: ['Bite'],
    19: ['Rapid Spin'],
    22: ['Protect'],
    25: ['Aqua Tail'],
    28: ['Iron Defense'],
    32: ['Hydro Pump'],
  },

  // Common Wild Pokémon
  Pidgey: {
    1: ['Tackle', 'Sand Attack'],
    5: ['Gust'],
    9: ['Quick Attack'],
    13: ['Whirlwind'],
    17: ['Twister'],
    21: ['Feather Dance'],
    25: ['Agility'],
    29: ['Wing Attack'],
    33: ['Roost'],
    37: ['Tailwind'],
  },

  Rattata: {
    1: ['Tackle', 'Tail Whip'],
    4: ['Quick Attack'],
    7: ['Focus Energy'],
    10: ['Bite'],
    13: ['Pursuit'],
    16: ['Hyper Fang'],
    19: ['Assurance'],
    22: ['Crunch'],
    25: ['Sucker Punch'],
    28: ['Super Fang'],
  },

  Caterpie: {
    1: ['Tackle', 'String Shot'],
    5: ['Bug Bite'],
    9: ['String Shot'],
  },

  // Electric types
  Pikachu: {
    1: ['Thunder Shock', 'Tail Whip'],
    5: ['Quick Attack'],
    10: ['Thunder Wave'],
    13: ['Electro Ball'],
    18: ['Spark'],
    21: ['Agility'],
    26: ['Discharge'],
    29: ['Slam'],
    34: ['Thunderbolt'],
    37: ['Thunder'],
  },

  Luxray: {
    1: ['Tackle', 'Leer'],
    5: ['Charge'],
    8: ['Spark'],
    11: ['Bite'],
    15: ['Roar'],
    20: ['Thunder Fang'],
    25: ['Scary Face'],
    30: ['Crunch'],
    35: ['Thunder'],
    40: ['Wild Charge'],
  },

  // More species can be added here
};

/**
 * Get moves a Pokémon learns at a specific level
 * @param {string} species - Pokémon species name
 * @param {number} level - Level to check
 * @returns {string[]} Array of move names learned at this level
 */
export function getMovesLearnedAtLevel(species, level) {
  const learnset = LEVEL_UP_LEARNSETS[species];
  if (!learnset) return [];
  
  return learnset[level] || [];
}

/**
 * Get all moves a Pokémon should know up to a certain level
 * @param {string} species - Pokémon species name
 * @param {number} maxLevel - Maximum level to check
 * @returns {string[]} Array of all move names learned up to this level
 */
export function getAllMovesUpToLevel(species, maxLevel) {
  const learnset = LEVEL_UP_LEARNSETS[species];
  if (!learnset) return [];
  
  const moves = [];
  for (let level = 1; level <= maxLevel; level++) {
    if (learnset[level]) {
      moves.push(...learnset[level]);
    }
  }
  
  return moves;
}

/**
 * Check if a Pokémon has a learnset defined
 * @param {string} species - Pokémon species name
 * @returns {boolean}
 */
export function hasLearnset(species) {
  return !!LEVEL_UP_LEARNSETS[species];
}
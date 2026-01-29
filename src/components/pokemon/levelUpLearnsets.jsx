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
  
  Charmeleon: {
    1: ['Flame Pulse'],
    16: ['Dragon Breath'],
    22: ['Fire Fang'],
    28: ['Slash'],
    34: ['Flamethrower'],
    40: ['Scary Face'],
    46: ['Fire Blast'],
    52: ['Flare Blitz'],
  },
  
  Charizard: {
    1: ['Infernal Cyclone'],
    36: ['Infernal Cyclone'],
    40: ['Air Slash'],
    44: ['Dragon Claw'],
    48: ['Fire Blast'],
    52: ['Flare Blitz'],
    56: ['Blast Burn'],
    60: ['Dragon Dance'],
  },
  
  Bulbasaur: {
    1: ['Tackle', 'Growl'],
    5: ['Leech Seed'],
    8: ['Sap Bind'], // Signature: Drains 25% of damage to all allies, doubled if Medic role
    12: ['Vine Whip'],
    15: ['Sleep Powder'],
    19: ['Synthesis'],
    23: ['Poison Powder'],
    27: ['Magical Leaf'],
    32: ['Aromatherapy'],
    38: ['Giga Drain'],
  },
  
  Ivysaur: {
    1: ['Sap Bind'],
    16: ['Sweet Scent'],
    22: ['Seed Bomb'],
    28: ['Heal Pulse'],
    34: ['Energy Ball'],
    40: ['Toxic'],
    46: ['Grassy Terrain'],
    52: ['Petal Dance'],
  },
  
  Venusaur: {
    1: ['Verdant Sanctuary'],
    32: ['Verdant Sanctuary'],
    36: ['Petal Blizzard'],
    40: ['Synthesis'],
    44: ['Solar Beam'],
    48: ['Sludge Bomb'],
    52: ['Earthquake'],
    56: ['Frenzy Plant'],
  },
  
  Squirtle: {
    1: ['Tackle', 'Tail Whip'],
    6: ['Bubble'],
    9: ['Shell Slam'], // Signature: Hits twice if HP > 75%, 20% chance to lower Attack
    13: ['Withdraw'],
    16: ['Water Gun'],
    21: ['Protect'],
    25: ['Aqua Ring'],
    28: ['Bite'],
    33: ['Surf'],
    38: ['Iron Defense'],
  },
  
  Wartortle: {
    1: ['Shell Slam'],
    16: ['Rapid Spin'],
    22: ['Water Pulse'],
    28: ['Aqua Tail'],
    34: ['Iron Defense'],
    40: ['Crunch'],
    46: ['Muddy Water'],
    52: ['Hydro Pump'],
  },
  
  Blastoise: {
    1: ['Shell Fortress'],
    36: ['Shell Fortress'],
    40: ['Skull Bash'],
    44: ['Flash Cannon'],
    48: ['Hydro Pump'],
    52: ['Ice Beam'],
    56: ['Hydro Cannon'],
    60: ['Mirror Coat'],
  },

  // Common Wild Pokémon
  Pidgey: {
    1: ['Tackle', 'Gust'],
    3: ['Sand Attack'],
    5: ['Quick Attack'],
    7: ['Feather Guard'],
    9: ['Wing Slap'],
    11: ['Whirlwind'],
    13: ['Air Cutter'],
    15: ['Tailwind Gust'],
    17: ['Aerial Ace'],
    19: ['Agility'],
    21: ['Feather Dance'],
    24: ['Roost'],
    27: ['Air Slash'],
    30: ['Sky Dive'],
  },

  Pidgeotto: {
    1: ['Tackle', 'Growl'],
    5: ['Sand Attack'],
    9: ['Gust'],
    13: ['Quick Attack'],
    17: ['Whirlwind'],
    22: ['Twister'],
    27: ['Feather Dance'],
    32: ['Agility'],
    37: ['Air Slash'],
    42: ['Roost'],
    47: ['Tailwind'],
    52: ['Mirror Move'],
  },

  Pidgeot: {
    1: ['Tackle', 'Growl', 'Sand Attack', 'Gust'],
    5: ['Sand Attack'],
    9: ['Gust'],
    13: ['Quick Attack'],
    17: ['Whirlwind'],
    22: ['Twister'],
    27: ['Feather Dance'],
    32: ['Agility'],
    38: ['Air Slash'],
    44: ['Roost'],
    50: ['Tailwind'],
    56: ['Mirror Move'],
    62: ['Hurricane'],
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

/**
 * Get all moves a Pokémon could have learned up to its current level
 * (for Move Reminder feature)
 * @param {string} species - Pokémon species name
 * @param {number} currentLevel - Current level of the Pokémon
 * @returns {string[]} Array of all move names that can be relearned
 */
export function getMovesLearnableUpToLevel(species, currentLevel) {
  return getAllMovesUpToLevel(species, currentLevel);
}

/**
 * Get the full learnset for a species
 * @param {string} species - Pokémon species name
 * @returns {Object} Learnset object with levels as keys
 */
export function getLevelUpLearnset(species) {
  return LEVEL_UP_LEARNSETS[species] || {};
}

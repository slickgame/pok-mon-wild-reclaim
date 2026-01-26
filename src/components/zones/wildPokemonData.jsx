import caterpieData from '@/components/data/pokemon/caterpie.json';

// Convert new JSON format to old format for compatibility
function convertPokemonData(jsonData) {
  return {
    species: jsonData.species,
    dexId: jsonData.dexId,
    type1: jsonData.types[0],
    type2: jsonData.types[1] || null,
    baseStats: {
      hp: jsonData.baseStats.HP,
      atk: jsonData.baseStats.Attack,
      def: jsonData.baseStats.Defense,
      spAtk: jsonData.baseStats.SpAttack,
      spDef: jsonData.baseStats.SpDefense,
      spd: jsonData.baseStats.Speed
    },
    evYield: {
      hp: jsonData.evYield.HP || 0,
      atk: jsonData.evYield.Attack || 0,
      def: jsonData.evYield.Defense || 0,
      spAtk: jsonData.evYield.SpAttack || 0,
      spDef: jsonData.evYield.SpDefense || 0,
      spd: jsonData.evYield.Speed || 0
    },
    baseXpYield: jsonData.baseExp,
    dropItems: jsonData.dropItems.map(d => ({
      item: d.itemId,
      itemId: d.itemId,
      chance: d.chance
    })),
    talentPool: jsonData.talentPool,
    battleRole: jsonData.battleRole,
    signatureMove: jsonData.signatureMove,
    learnset: jsonData.learnset,
    catchRate: jsonData.catchRate / 255,
    genderRatio: jsonData.genderRatio
  };
}

// Wild Pokémon species data for encounters
export const wildPokemonData = {
  Caterpie: convertPokemonData(caterpieData),

  Pidgey: {
    species: "Pidgey",
    type1: "Normal",
    type2: "Flying",
    baseStats: { hp: 40, atk: 45, def: 40, spAtk: 35, spDef: 35, spd: 56 },
    evYield: { spd: 1 },
    baseXpYield: 50,
    dropItems: [
      { item: "Feather", chance: 0.25 },
      { item: "Sky Shard", chance: 0.10 }
    ],
    talentPool: ["Keen Eye", "Swift Wings"],
    battleRole: "Scout",
    signatureMove: "Gust",
    learnset: {
      1: ["Tackle", "Sand Attack"],
      5: ["Gust"],
      9: ["Quick Attack"]
    },
    catchRate: 0.50
  },

  Oddish: {
    species: "Oddish",
    type1: "Grass",
    type2: "Poison",
    baseStats: { hp: 45, atk: 50, def: 55, spAtk: 75, spDef: 65, spd: 30 },
    evYield: { spAtk: 1 },
    baseXpYield: 64,
    dropItems: [
      { item: "Leaf Fragment", chance: 0.35 },
      { item: "Poison Barb", chance: 0.20 },
      { item: "Moonleaf", chance: 0.08 }
    ],
    talentPool: ["Chlorophyll", "Poison Touch"],
    battleRole: "Support",
    signatureMove: "Absorb",
    learnset: {
      1: ["Absorb", "Growth"],
      7: ["Acid"],
      10: ["Poison Powder"]
    },
    catchRate: 0.40
  },

  Pikachu: {
    species: "Pikachu",
    type1: "Electric",
    type2: null,
    baseStats: { hp: 35, atk: 55, def: 40, spAtk: 50, spDef: 50, spd: 90 },
    evYield: { spd: 2 },
    baseXpYield: 112,
    dropItems: [
      { item: "Electric Shard", chance: 0.30 },
      { item: "Moonleaf", chance: 0.08 },
      { item: "Thunder Stone", chance: 0.03 }
    ],
    talentPool: ["Static Field", "Lightning Reflexes"],
    battleRole: "Striker",
    signatureMove: "Thunder Shock",
    learnset: {
      1: ["Thunder Shock", "Tail Whip"],
      5: ["Thunder Wave"],
      10: ["Quick Attack"],
      13: ["Electro Ball"]
    },
    catchRate: 0.25
  }
};

// Verdant Hollow encounter table
export const verdantHollowEncounters = {
  zoneName: "Verdant Hollow",
  encounterRate: 0.20, // 20% chance per exploration action
  encounters: [
    { species: "Caterpie", levelRange: [3, 7], weight: 40 },
    { species: "Pidgey", levelRange: [4, 8], weight: 35 },
    { species: "Oddish", levelRange: [5, 10], weight: 15 },
    { species: "Pikachu", levelRange: [8, 12], weight: 10 }
  ]
};

// Weighted random selection
export function selectWildEncounter(encounterTable) {
  const totalWeight = encounterTable.encounters.reduce((sum, e) => sum + e.weight, 0);
  let random = Math.random() * totalWeight;
  
  for (const encounter of encounterTable.encounters) {
    random -= encounter.weight;
    if (random <= 0) {
      return encounter;
    }
  }
  
  return encounterTable.encounters[0]; // Fallback
}

// Generate random level within range
export function randomLevel(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

// Generate random IVs (1-31 per stat)
export function generateRandomIVs() {
  return {
    hp: Math.floor(Math.random() * 31) + 1,
    atk: Math.floor(Math.random() * 31) + 1,
    def: Math.floor(Math.random() * 31) + 1,
    spAtk: Math.floor(Math.random() * 31) + 1,
    spDef: Math.floor(Math.random() * 31) + 1,
    spd: Math.floor(Math.random() * 31) + 1
  };
}

// Random nature selection
const natures = [
  "Hardy", "Lonely", "Brave", "Adamant", "Naughty",
  "Bold", "Docile", "Relaxed", "Impish", "Lax",
  "Timid", "Hasty", "Serious", "Jolly", "Naive",
  "Modest", "Mild", "Quiet", "Bashful", "Rash",
  "Calm", "Gentle", "Sassy", "Careful", "Quirky"
];

export function randomNature() {
  return natures[Math.floor(Math.random() * natures.length)];
}

// Random talent from pool
export function randomTalent(talentPool) {
  if (!talentPool || talentPool.length === 0) return null;
  return talentPool[Math.floor(Math.random() * talentPool.length)];
}

// Calculate XP gained from wild Pokémon (scaled by level)
export function calculateWildXP(speciesData, level, isTrainerBattle = false) {
  const multiplier = isTrainerBattle ? 1.5 : 1.0;
  return Math.floor((speciesData.baseXpYield * level) / 7 * multiplier);
}

// Process item drops
export function rollItemDrops(speciesData) {
  const droppedItems = [];
  
  for (const drop of speciesData.dropItems) {
    if (Math.random() < drop.chance) {
      droppedItems.push(drop.item);
    }
  }
  
  return droppedItems;
}

// Create wild Pokémon instance
export function generateWildPokemon(encounterTable) {
  const encounter = selectWildEncounter(encounterTable);
  const speciesData = wildPokemonData[encounter.species];
  
  if (!speciesData) {
    console.error(`No data found for species: ${encounter.species}`);
    return null;
  }
  
  const level = randomLevel(encounter.levelRange[0], encounter.levelRange[1]);
  const ivs = generateRandomIVs();
  const nature = randomNature();
  
  // Select moves based on level
  let moves = [];
  if (Array.isArray(speciesData.learnset)) {
    // New format: learnset is array of move objects
    const learnableMoves = speciesData.learnset
      .filter(m => m.level <= level)
      .sort((a, b) => a.level - b.level);
    moves = learnableMoves.slice(-4).map(m => m.name);
  } else {
    // Old format: learnset is object with level keys
    const availableMoves = [];
    for (const [learnLevel, movesAtLevel] of Object.entries(speciesData.learnset)) {
      if (parseInt(learnLevel) <= level) {
        availableMoves.push(...movesAtLevel);
      }
    }
    moves = availableMoves.slice(-4);
  }
  
  // Select random talent (use id, not name)
  const talentId = randomTalent(speciesData.talentPool);
  const talents = talentId
    ? [{ id: talentId, grade: "Bronze" }]
    : [];
  
  return {
    species: speciesData.species,
    level,
    nature,
    ivs,
    evs: { hp: 0, atk: 0, def: 0, spAtk: 0, spDef: 0, spd: 0 },
    type1: speciesData.type1,
    type2: speciesData.type2,
    currentHp: null, // Will be calculated
    abilities: moves,
    talents,
    roles: [speciesData.battleRole],
    signatureMove: speciesData.signatureMove,
    isWild: true,
    _speciesData: speciesData // Store for rewards calculation
  };
}
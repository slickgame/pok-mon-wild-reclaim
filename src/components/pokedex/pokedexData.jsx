// Master Pokédex Registry - All species data
export const POKEDEX_DATA = {
  1: {
    dexNumber: 1,
    species: "Bulbasaur",
    types: ["Grass", "Poison"],
    role: "Support",
    evolutionStage: "Basic",
    baseStats: { hp: 45, atk: 49, def: 49, spAtk: 65, spDef: 65, spd: 45 },
    evolution: { evolvesTo: "Ivysaur", method: "Level", level: 16 }
  },
  2: {
    dexNumber: 2,
    species: "Ivysaur",
    types: ["Grass", "Poison"],
    role: "Support",
    evolutionStage: "Stage 1",
    baseStats: { hp: 60, atk: 62, def: 63, spAtk: 80, spDef: 80, spd: 60 },
    evolution: { evolvesTo: "Venusaur", method: "Level", level: 32 }
  },
  3: {
    dexNumber: 3,
    species: "Venusaur",
    types: ["Grass", "Poison"],
    role: "Tank",
    evolutionStage: "Final",
    baseStats: { hp: 80, atk: 82, def: 83, spAtk: 100, spDef: 100, spd: 80 },
    evolution: null
  },
  4: {
    dexNumber: 4,
    species: "Charmander",
    types: ["Fire"],
    role: "Striker",
    evolutionStage: "Basic",
    baseStats: { hp: 39, atk: 52, def: 43, spAtk: 60, spDef: 50, spd: 65 },
    evolution: { evolvesTo: "Charmeleon", method: "Level", level: 16 }
  },
  5: {
    dexNumber: 5,
    species: "Charmeleon",
    types: ["Fire"],
    role: "Striker",
    evolutionStage: "Stage 1",
    baseStats: { hp: 58, atk: 64, def: 58, spAtk: 80, spDef: 65, spd: 80 },
    evolution: { evolvesTo: "Charizard", method: "Level", level: 36 }
  },
  6: {
    dexNumber: 6,
    species: "Charizard",
    types: ["Fire", "Flying"],
    role: "Striker",
    evolutionStage: "Final",
    baseStats: { hp: 78, atk: 84, def: 78, spAtk: 109, spDef: 85, spd: 100 },
    evolution: null
  },
  7: {
    dexNumber: 7,
    species: "Squirtle",
    types: ["Water"],
    role: "Tank",
    evolutionStage: "Basic",
    baseStats: { hp: 44, atk: 48, def: 65, spAtk: 50, spDef: 64, spd: 43 },
    evolution: { evolvesTo: "Wartortle", method: "Level", level: 16 }
  },
  8: {
    dexNumber: 8,
    species: "Wartortle",
    types: ["Water"],
    role: "Tank",
    evolutionStage: "Stage 1",
    baseStats: { hp: 59, atk: 63, def: 80, spAtk: 65, spDef: 80, spd: 58 },
    evolution: { evolvesTo: "Blastoise", method: "Level", level: 36 }
  },
  9: {
    dexNumber: 9,
    species: "Blastoise",
    types: ["Water"],
    role: "Juggernaut",
    evolutionStage: "Final",
    baseStats: { hp: 79, atk: 83, def: 100, spAtk: 85, spDef: 105, spd: 78 },
    evolution: null
  },
  10: {
    dexNumber: 10,
    species: "Caterpie",
    types: ["Bug"],
    role: "Scout",
    evolutionStage: "Basic",
    baseStats: { hp: 45, atk: 30, def: 35, spAtk: 20, spDef: 20, spd: 45 },
    evolution: { evolvesTo: "Metapod", method: "Level", level: 7 }
  },
  25: {
    dexNumber: 25,
    species: "Pikachu",
    types: ["Electric"],
    role: "Striker",
    evolutionStage: "Stage 1",
    baseStats: { hp: 35, atk: 55, def: 40, spAtk: 50, spDef: 50, spd: 90 },
    evolution: { evolvesTo: "Raichu", method: "Item", item: "Thunder Stone" }
  },
  26: {
    dexNumber: 26,
    species: "Raichu",
    types: ["Electric"],
    role: "Striker",
    evolutionStage: "Final",
    baseStats: { hp: 60, atk: 90, def: 55, spAtk: 90, spDef: 80, spd: 110 },
    evolution: null
  },
  133: {
    dexNumber: 133,
    species: "Eevee",
    types: ["Normal"],
    role: "Scout",
    evolutionStage: "Basic",
    baseStats: { hp: 55, atk: 55, def: 50, spAtk: 45, spDef: 65, spd: 55 },
    evolution: { evolvesTo: "Multiple", method: "Various" }
  },
  134: {
    dexNumber: 134,
    species: "Vaporeon",
    types: ["Water"],
    role: "Tank",
    evolutionStage: "Final",
    baseStats: { hp: 130, atk: 65, def: 60, spAtk: 110, spDef: 95, spd: 65 },
    evolution: null
  },
  135: {
    dexNumber: 135,
    species: "Jolteon",
    types: ["Electric"],
    role: "Striker",
    evolutionStage: "Final",
    baseStats: { hp: 65, atk: 65, def: 60, spAtk: 110, spDef: 95, spd: 130 },
    evolution: null
  },
  136: {
    dexNumber: 136,
    species: "Flareon",
    types: ["Fire"],
    role: "Striker",
    evolutionStage: "Final",
    baseStats: { hp: 65, atk: 130, def: 60, spAtk: 95, spDef: 110, spd: 65 },
    evolution: null
  },
  403: {
    dexNumber: 403,
    species: "Shinx",
    types: ["Electric"],
    role: "Scout",
    evolutionStage: "Basic",
    baseStats: { hp: 45, atk: 65, def: 34, spAtk: 40, spDef: 34, spd: 45 },
    evolution: { evolvesTo: "Luxio", method: "Level", level: 15 }
  },
  404: {
    dexNumber: 404,
    species: "Luxio",
    types: ["Electric"],
    role: "Striker",
    evolutionStage: "Stage 1",
    baseStats: { hp: 60, atk: 85, def: 49, spAtk: 60, spDef: 49, spd: 60 },
    evolution: { evolvesTo: "Luxray", method: "Level", level: 30 }
  },
  405: {
    dexNumber: 405,
    species: "Luxray",
    types: ["Electric"],
    role: "Striker",
    evolutionStage: "Final",
    baseStats: { hp: 80, atk: 120, def: 79, spAtk: 95, spDef: 79, spd: 70 },
    evolution: null
  }
};

export const getAllSpecies = () => Object.values(POKEDEX_DATA);

export const getSpeciesData = (species) => {
  return Object.values(POKEDEX_DATA).find(p => p.species === species);
};

export const getSpeciesByDexNumber = (dexNumber) => {
  return POKEDEX_DATA[dexNumber];
};
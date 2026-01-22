/**
 * Base Stats Database for Pokémon Species
 */

export const BASE_STATS = {
  // Gen 1 Starters
  Charmander: { hp: 39, atk: 52, def: 43, spAtk: 60, spDef: 50, spd: 65 },
  Charmeleon: { hp: 58, atk: 64, def: 58, spAtk: 80, spDef: 65, spd: 80 },
  Charizard: { hp: 78, atk: 84, def: 78, spAtk: 109, spDef: 85, spd: 100 },
  
  Bulbasaur: { hp: 45, atk: 49, def: 49, spAtk: 65, spDef: 65, spd: 45 },
  Ivysaur: { hp: 60, atk: 62, def: 63, spAtk: 80, spDef: 80, spd: 60 },
  Venusaur: { hp: 80, atk: 82, def: 83, spAtk: 100, spDef: 100, spd: 80 },
  
  Squirtle: { hp: 44, atk: 48, def: 65, spAtk: 50, spDef: 64, spd: 43 },
  Wartortle: { hp: 59, atk: 63, def: 80, spAtk: 65, spDef: 80, spd: 58 },
  Blastoise: { hp: 79, atk: 83, def: 100, spAtk: 85, spDef: 105, spd: 78 },
  
  // Common Wild Pokémon
  Pidgey: { hp: 40, atk: 45, def: 40, spAtk: 35, spDef: 35, spd: 56 },
  Pidgeotto: { hp: 63, atk: 60, def: 55, spAtk: 50, spDef: 50, spd: 71 },
  Pidgeot: { hp: 83, atk: 80, def: 75, spAtk: 70, spDef: 70, spd: 101 },
  
  Rattata: { hp: 30, atk: 56, def: 35, spAtk: 25, spDef: 35, spd: 72 },
  Raticate: { hp: 55, atk: 81, def: 60, spAtk: 50, spDef: 70, spd: 97 },
  
  Caterpie: { hp: 45, atk: 30, def: 35, spAtk: 20, spDef: 20, spd: 45 },
  Metapod: { hp: 50, atk: 20, def: 55, spAtk: 25, spDef: 25, spd: 30 },
  Butterfree: { hp: 60, atk: 45, def: 50, spAtk: 90, spDef: 80, spd: 70 },
  
  Weedle: { hp: 40, atk: 35, def: 30, spAtk: 20, spDef: 20, spd: 50 },
  Kakuna: { hp: 45, atk: 25, def: 50, spAtk: 25, spDef: 25, spd: 35 },
  Beedrill: { hp: 65, atk: 90, def: 40, spAtk: 45, spDef: 80, spd: 75 },
  
  Pikachu: { hp: 35, atk: 55, def: 40, spAtk: 50, spDef: 50, spd: 90 },
  Raichu: { hp: 60, atk: 90, def: 55, spAtk: 90, spDef: 80, spd: 110 },
  
  Geodude: { hp: 40, atk: 80, def: 100, spAtk: 30, spDef: 30, spd: 20 },
  Graveler: { hp: 55, atk: 95, def: 115, spAtk: 45, spDef: 45, spd: 35 },
  Golem: { hp: 80, atk: 120, def: 130, spAtk: 55, spDef: 65, spd: 45 },
  
  Magikarp: { hp: 20, atk: 10, def: 55, spAtk: 15, spDef: 20, spd: 80 },
  Gyarados: { hp: 95, atk: 125, def: 79, spAtk: 60, spDef: 100, spd: 81 },
  
  Eevee: { hp: 55, atk: 55, def: 50, spAtk: 45, spDef: 65, spd: 55 },
  Vaporeon: { hp: 130, atk: 65, def: 60, spAtk: 110, spDef: 95, spd: 65 },
  Jolteon: { hp: 65, atk: 65, def: 60, spAtk: 110, spDef: 95, spd: 130 },
  Flareon: { hp: 65, atk: 130, def: 60, spAtk: 95, spDef: 110, spd: 65 },
  
  Dratini: { hp: 41, atk: 64, def: 45, spAtk: 50, spDef: 50, spd: 50 },
  Dragonair: { hp: 61, atk: 84, def: 65, spAtk: 70, spDef: 70, spd: 70 },
  Dragonite: { hp: 91, atk: 134, def: 95, spAtk: 100, spDef: 100, spd: 80 },
  
  // Legendaries
  Articuno: { hp: 90, atk: 85, def: 100, spAtk: 95, spDef: 125, spd: 85 },
  Zapdos: { hp: 90, atk: 90, def: 85, spAtk: 125, spDef: 90, spd: 100 },
  Moltres: { hp: 90, atk: 100, def: 90, spAtk: 125, spDef: 85, spd: 90 },
  Mewtwo: { hp: 106, atk: 110, def: 90, spAtk: 154, spDef: 90, spd: 130 },
  Mew: { hp: 100, atk: 100, def: 100, spAtk: 100, spDef: 100, spd: 100 },
  
  // Gen 2
  Chikorita: { hp: 45, atk: 49, def: 65, spAtk: 49, spDef: 65, spd: 45 },
  Bayleef: { hp: 60, atk: 62, def: 80, spAtk: 63, spDef: 80, spd: 60 },
  Meganium: { hp: 80, atk: 82, def: 100, spAtk: 83, spDef: 100, spd: 80 },
  
  Cyndaquil: { hp: 39, atk: 52, def: 43, spAtk: 60, spDef: 50, spd: 65 },
  Quilava: { hp: 58, atk: 64, def: 58, spAtk: 80, spDef: 65, spd: 80 },
  Typhlosion: { hp: 78, atk: 84, def: 78, spAtk: 109, spDef: 85, spd: 100 },
  
  Totodile: { hp: 50, atk: 65, def: 64, spAtk: 44, spDef: 48, spd: 43 },
  Croconaw: { hp: 65, atk: 80, def: 80, spAtk: 59, spDef: 63, spd: 58 },
  Feraligatr: { hp: 85, atk: 105, def: 100, spAtk: 79, spDef: 83, spd: 78 },
  
  Togepi: { hp: 35, atk: 20, def: 65, spAtk: 40, spDef: 65, spd: 20 },
  Togetic: { hp: 55, atk: 40, def: 85, spAtk: 80, spDef: 105, spd: 40 },
  
  Ampharos: { hp: 90, atk: 75, def: 85, spAtk: 115, spDef: 90, spd: 55 },
  Umbreon: { hp: 95, atk: 65, def: 110, spAtk: 60, spDef: 130, spd: 65 },
  Espeon: { hp: 65, atk: 65, def: 60, spAtk: 130, spDef: 95, spd: 110 },
  
  Tyranitar: { hp: 100, atk: 134, def: 110, spAtk: 95, spDef: 100, spd: 61 },
  Lugia: { hp: 106, atk: 90, def: 130, spAtk: 90, spDef: 154, spd: 110 },
  HoOh: { hp: 106, atk: 130, def: 90, spAtk: 110, spDef: 154, spd: 90 },
};

export function getBaseStats(species) {
  return BASE_STATS[species] || {
    hp: 50, atk: 50, def: 50, spAtk: 50, spDef: 50, spd: 50
  };
}

/**
 * EV Yields - how many EVs a Pokémon gives when defeated
 */
export const EV_YIELDS = {
  Charmander: { hp: 0, atk: 0, def: 0, spAtk: 0, spDef: 0, spd: 1 },
  Charmeleon: { hp: 0, atk: 0, def: 0, spAtk: 1, spDef: 0, spd: 1 },
  Charizard: { hp: 0, atk: 0, def: 0, spAtk: 3, spDef: 0, spd: 0 },
  
  Bulbasaur: { hp: 0, atk: 0, def: 0, spAtk: 1, spDef: 0, spd: 0 },
  Ivysaur: { hp: 0, atk: 0, def: 0, spAtk: 1, spDef: 1, spd: 0 },
  Venusaur: { hp: 0, atk: 0, def: 0, spAtk: 2, spDef: 1, spd: 0 },
  
  Squirtle: { hp: 0, atk: 0, def: 1, spAtk: 0, spDef: 0, spd: 0 },
  Wartortle: { hp: 0, atk: 0, def: 1, spAtk: 0, spDef: 1, spd: 0 },
  Blastoise: { hp: 0, atk: 0, def: 0, spAtk: 0, spDef: 3, spd: 0 },
  
  Pidgey: { hp: 0, atk: 0, def: 0, spAtk: 0, spDef: 0, spd: 1 },
  Pidgeotto: { hp: 0, atk: 0, def: 0, spAtk: 0, spDef: 0, spd: 2 },
  Pidgeot: { hp: 0, atk: 0, def: 0, spAtk: 0, spDef: 0, spd: 3 },
  
  Rattata: { hp: 0, atk: 0, def: 0, spAtk: 0, spDef: 0, spd: 1 },
  Raticate: { hp: 0, atk: 0, def: 0, spAtk: 0, spDef: 0, spd: 2 },
  
  Caterpie: { hp: 1, atk: 0, def: 0, spAtk: 0, spDef: 0, spd: 0 },
  Metapod: { hp: 0, atk: 0, def: 2, spAtk: 0, spDef: 0, spd: 0 },
  Butterfree: { hp: 0, atk: 0, def: 0, spAtk: 2, spDef: 1, spd: 0 },
  
  Weedle: { hp: 0, atk: 0, def: 0, spAtk: 0, spDef: 0, spd: 1 },
  Kakuna: { hp: 0, atk: 0, def: 2, spAtk: 0, spDef: 0, spd: 0 },
  Beedrill: { hp: 0, atk: 2, def: 0, spAtk: 0, spDef: 0, spd: 1 },
  
  Pikachu: { hp: 0, atk: 0, def: 0, spAtk: 0, spDef: 0, spd: 2 },
  Raichu: { hp: 0, atk: 0, def: 0, spAtk: 0, spDef: 0, spd: 3 },
  
  Geodude: { hp: 0, atk: 0, def: 1, spAtk: 0, spDef: 0, spd: 0 },
  Graveler: { hp: 0, atk: 0, def: 2, spAtk: 0, spDef: 0, spd: 0 },
  Golem: { hp: 0, atk: 0, def: 3, spAtk: 0, spDef: 0, spd: 0 },
  
  Magikarp: { hp: 0, atk: 0, def: 0, spAtk: 0, spDef: 0, spd: 1 },
  Gyarados: { hp: 0, atk: 2, def: 0, spAtk: 0, spDef: 0, spd: 0 },
  
  Eevee: { hp: 0, atk: 0, def: 0, spAtk: 0, spDef: 1, spd: 0 },
  Vaporeon: { hp: 2, atk: 0, def: 0, spAtk: 0, spDef: 0, spd: 0 },
  Jolteon: { hp: 0, atk: 0, def: 0, spAtk: 0, spDef: 0, spd: 2 },
  Flareon: { hp: 0, atk: 2, def: 0, spAtk: 0, spDef: 0, spd: 0 },
  
  Dratini: { hp: 0, atk: 1, def: 0, spAtk: 0, spDef: 0, spd: 0 },
  Dragonair: { hp: 0, atk: 2, def: 0, spAtk: 0, spDef: 0, spd: 0 },
  Dragonite: { hp: 0, atk: 3, def: 0, spAtk: 0, spDef: 0, spd: 0 },
  
  Articuno: { hp: 0, atk: 0, def: 0, spAtk: 0, spDef: 3, spd: 0 },
  Zapdos: { hp: 0, atk: 0, def: 0, spAtk: 3, spDef: 0, spd: 0 },
  Moltres: { hp: 0, atk: 0, def: 0, spAtk: 3, spDef: 0, spd: 0 },
  Mewtwo: { hp: 0, atk: 0, def: 0, spAtk: 3, spDef: 0, spd: 0 },
  Mew: { hp: 3, atk: 0, def: 0, spAtk: 0, spDef: 0, spd: 0 },
  
  Chikorita: { hp: 0, atk: 0, def: 1, spAtk: 0, spDef: 0, spd: 0 },
  Bayleef: { hp: 0, atk: 0, def: 1, spAtk: 0, spDef: 1, spd: 0 },
  Meganium: { hp: 0, atk: 0, def: 1, spAtk: 0, spDef: 2, spd: 0 },
  
  Cyndaquil: { hp: 0, atk: 0, def: 0, spAtk: 0, spDef: 0, spd: 1 },
  Quilava: { hp: 0, atk: 0, def: 0, spAtk: 1, spDef: 0, spd: 1 },
  Typhlosion: { hp: 0, atk: 0, def: 0, spAtk: 3, spDef: 0, spd: 0 },
  
  Totodile: { hp: 0, atk: 1, def: 0, spAtk: 0, spDef: 0, spd: 0 },
  Croconaw: { hp: 0, atk: 1, def: 1, spAtk: 0, spDef: 0, spd: 0 },
  Feraligatr: { hp: 0, atk: 2, def: 1, spAtk: 0, spDef: 0, spd: 0 },
  
  Togepi: { hp: 0, atk: 0, def: 0, spAtk: 0, spDef: 1, spd: 0 },
  Togetic: { hp: 0, atk: 0, def: 0, spAtk: 0, spDef: 2, spd: 0 },
  
  Ampharos: { hp: 0, atk: 0, def: 0, spAtk: 3, spDef: 0, spd: 0 },
  Umbreon: { hp: 0, atk: 0, def: 0, spAtk: 0, spDef: 2, spd: 0 },
  Espeon: { hp: 0, atk: 0, def: 0, spAtk: 2, spDef: 0, spd: 0 },
  
  Tyranitar: { hp: 0, atk: 3, def: 0, spAtk: 0, spDef: 0, spd: 0 },
  Lugia: { hp: 0, atk: 0, def: 0, spAtk: 0, spDef: 3, spd: 0 },
  HoOh: { hp: 0, atk: 0, def: 0, spAtk: 0, spDef: 3, spd: 0 },
};

export function getEVYield(species) {
  return EV_YIELDS[species] || { hp: 0, atk: 1, def: 0, spAtk: 0, spDef: 0, spd: 0 };
}
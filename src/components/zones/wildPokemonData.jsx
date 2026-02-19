import { PokemonRegistry, getPokemonData } from '@/components/data/PokemonRegistry';
import { DropTableRegistry } from '@/components/data/DropTableRegistry';
import { TalentRegistry } from '@/components/data/TalentRegistry';
import { assignRandomTalents } from '@/components/utils/talentAssignment';

// Convert new format to old format for compatibility
function convertPokemonData(jsonData) {
  const dropTable =
    DropTableRegistry[jsonData.species] ||
    jsonData.dropItems ||
    jsonData.drops ||
    [];
  const baseStats = jsonData.baseStats || {};
  const evYield = jsonData.evYield || {};

  const getStat = (primaryKey, fallbackKey) =>
    baseStats[primaryKey] ??
    baseStats[primaryKey.toLowerCase()] ??
    baseStats[fallbackKey] ??
    baseStats[fallbackKey?.toLowerCase()];

  const getEv = (primaryKey, fallbackKey) =>
    evYield[primaryKey] ??
    evYield[primaryKey.toLowerCase()] ??
    evYield[fallbackKey] ??
    evYield[fallbackKey?.toLowerCase()];

  return {
    species: jsonData.species,
    dexId: jsonData.dexId,
    type1: jsonData.types[0],
    type2: jsonData.types[1] || null,
    baseStats: {
      hp: getStat("HP", "hp"),
      atk: getStat("Attack", "atk"),
      def: getStat("Defense", "def"),
      spAtk: getStat("SpAttack", "spa"),
      spDef: getStat("SpDefense", "spd"),
      spd: getStat("Speed", "spe")
    },
    evYield: {
      hp: getEv("HP", "hp") || 0,
      atk: getEv("Attack", "atk") || 0,
      def: getEv("Defense", "def") || 0,
      spAtk: getEv("SpAttack", "spa") || 0,
      spDef: getEv("SpDefense", "spd") || 0,
      spd: getEv("Speed", "spe") || 0
    },
    baseXpYield: jsonData.baseExp ?? jsonData.baseExpYield,
    dropItems: dropTable.map(d => ({
      item: d.itemId ?? d.item,
      itemId: d.itemId ?? d.item,
      chance: d.chance
    })),
    talentPool: jsonData.talentPool,
    battleRole: jsonData.battleRole,
    passiveAbilities: jsonData.passiveAbilities || [],
    hiddenAbility: jsonData.hiddenAbility || null,
    signatureMove: jsonData.signatureMove,
    learnset: jsonData.learnset,
    catchRate: jsonData.catchRate / 255,
    genderRatio: jsonData.genderRatio
  };
}

// Wild Pokémon species data for encounters (uses PokemonRegistry)
export const wildPokemonData = {
  Caterpie: convertPokemonData(PokemonRegistry.caterpie),
  Metapod: convertPokemonData(PokemonRegistry.metapod),
  Butterfree: convertPokemonData(PokemonRegistry.butterfree),
  Pidgey: convertPokemonData(PokemonRegistry.pidgey),
  Pikachu: convertPokemonData(PokemonRegistry.pikachu),
  Cherubi: convertPokemonData(PokemonRegistry.cherubi),
  Cherrim: convertPokemonData(PokemonRegistry.cherrim),
  Bounsweet: convertPokemonData(PokemonRegistry.bounsweet),
  Steenee: convertPokemonData(PokemonRegistry.steenee),
  Tsareena: convertPokemonData(PokemonRegistry.tsareena),

  Oddish: {
    species: "Oddish",
    dexId: 43,
    type1: "Grass",
    type2: "Poison",
    baseStats: { hp: 45, atk: 50, def: 55, spAtk: 75, spDef: 65, spd: 30 },
    evYield: { spAtk: 1 },
    baseXpYield: 78,
    dropItems: [
      { item: "Leaf Fragment", chance: 0.35 },
      { item: "Poison Barb", chance: 0.20 },
      { item: "Moonleaf", chance: 0.08 }
    ],
    talentPool: [
      "nightBlooming",
      "toxicAffinity",
      "sporeSynthesis",
      "symbioticRoot",
      "drowsyAllure",
      "adaptogenic",
      "photosensitiveGrowth",
      "parasiticDrain",
      "resilientWeed",
      "mushroomBond"
    ],
    battleRole: "Status Inflicter / Drain Tank",
    signatureMove: "Paralysis Spore",
    learnset: [
      {
        name: "Absorb",
        level: 1,
        type: "Grass",
        category: "Special",
        power: 20,
        accuracy: 100,
        pp: 25,
        description: "A nutrient-draining attack. Restores HP equal to half the damage dealt.",
        effects: {
          drain: 0.5
        }
      },
      {
        name: "Poison Powder",
        level: 4,
        type: "Poison",
        category: "Status",
        power: null,
        accuracy: 75,
        pp: 35,
        description: "Scatters toxic dust that may poison the target.",
        effects: {
          status: "Poison"
        }
      },
      {
        name: "Stun Spore",
        level: 6,
        type: "Grass",
        category: "Status",
        power: null,
        accuracy: 75,
        pp: 30,
        description: "Scatters powder that paralyzes the target.",
        effects: {
          status: "Paralysis"
        }
      },
      {
        name: "Sleep Powder",
        level: 8,
        type: "Grass",
        category: "Status",
        power: null,
        accuracy: 75,
        pp: 15,
        description: "Scatters powder that puts the target to sleep.",
        effects: {
          status: "Sleep"
        }
      },
      {
        name: "Mega Drain",
        level: 10,
        type: "Grass",
        category: "Special",
        power: 40,
        accuracy: 100,
        pp: 15,
        description: "A stronger drain attack. Restores HP equal to half the damage dealt.",
        effects: {
          drain: 0.5
        }
      },
      {
        name: "Growth",
        level: 12,
        type: "Normal",
        category: "Status",
        power: null,
        accuracy: null,
        pp: 20,
        description: "The user’s Special Attack is raised.",
        effects: {
          statMod: {
            self: { spa: 1 }
          }
        }
      },
      {
        name: "Toxic Spores",
        level: 14,
        type: "Poison",
        category: "Status",
        power: null,
        accuracy: 85,
        pp: 10,
        description: "Laces the field with toxic spores. May badly poison all enemies over time.",
        effects: {
          statusField: "ToxicSpread"
        }
      },
      {
        name: "Acid",
        level: 16,
        type: "Poison",
        category: "Special",
        power: 40,
        accuracy: 100,
        pp: 30,
        description: "Sprays a hide-melting acid. May lower target's Defense.",
        effects: {
          chance: 0.3,
          statMod: {
            target: { def: -1 }
          }
        }
      },
      {
        name: "Giga Drain",
        level: 18,
        type: "Grass",
        category: "Special",
        power: 75,
        accuracy: 100,
        pp: 10,
        description: "A powerful HP-stealing attack.",
        effects: {
          drain: 0.5
        }
      },
      {
        name: "Leech Seed",
        level: 20,
        type: "Grass",
        category: "Status",
        power: null,
        accuracy: 90,
        pp: 10,
        description: "Plants a seed on the target that drains HP every turn.",
        effects: {
          status: "LeechSeed"
        }
      },
      {
        name: "Venoshock",
        level: 22,
        type: "Poison",
        category: "Special",
        power: 65,
        accuracy: 100,
        pp: 10,
        description: "Deals more damage if the target is poisoned.",
        effects: {
          conditionalPower: {
            condition: "targetStatus.Poison",
            multiplier: 2.0
          }
        }
      },
      {
        name: "Aromatherapy",
        level: 24,
        type: "Grass",
        category: "Status",
        power: null,
        accuracy: null,
        pp: 5,
        description: "Heals all status conditions of the party.",
        effects: {
          cleanseStatus: "allAllies"
        }
      },
      {
        name: "Toxic",
        level: 26,
        type: "Poison",
        category: "Status",
        power: null,
        accuracy: 90,
        pp: 10,
        description: "Badly poisons the target. Damage increases each turn.",
        effects: {
          status: "Toxic"
        }
      },
      {
        name: "Moonlight",
        level: 28,
        type: "Fairy",
        category: "Status",
        power: null,
        accuracy: null,
        pp: 5,
        description: "Restores the user’s HP. Healing varies with the weather.",
        effects: {
          heal: {
            amount: 0.5,
            weatherMultiplier: {
              Sunny: 0.66,
              Rain: 0.25
            }
          }
        }
      },
      {
        name: "Petal Dance",
        level: 30,
        type: "Grass",
        category: "Special",
        power: 120,
        accuracy: 100,
        pp: 10,
        description: "The user attacks for 2–3 turns then becomes confused.",
        effects: {
          multiTurn: 3,
          selfConfuse: true
        }
      },
      {
        name: "Grassy Terrain",
        level: 33,
        type: "Grass",
        category: "Status",
        power: null,
        accuracy: null,
        pp: 10,
        description: "Turns the ground into Grassy Terrain for 5 turns. Restores HP each turn.",
        effects: {
          fieldEffect: "GrassyTerrain",
          duration: 5
        }
      },
      {
        name: "Sludge Bomb",
        level: 36,
        type: "Poison",
        category: "Special",
        power: 90,
        accuracy: 100,
        pp: 10,
        description: "Fires a toxic sludge. May poison the target.",
        effects: {
          chance: 0.3,
          status: "Poison"
        }
      },
      {
        name: "Gloom Burst",
        level: 40,
        type: "Poison",
        category: "Special",
        power: 110,
        accuracy: 85,
        pp: 5,
        description: "A violent blast of toxic pollen. Reduces the user’s Special Attack.",
        effects: {
          recoilStat: {
            self: { spa: -1 }
          }
        }
      }
    ],
    catchRate: 1
  },

  
};

// Verdant Hollow encounter table
export const WildEncounterRegistry = {
  "Verdant Hollow": [
    { species: "Pidgey", rarity: "Common", levelRange: [4, 8], weight: 35 },
    { species: "Caterpie", rarity: "Common", levelRange: [3, 7], weight: 30 },
    { species: "Oddish", rarity: "Uncommon", levelRange: [5, 10], weight: 15 }
  ]
};

if (!WildEncounterRegistry["Verdant Hollow"].some((encounter) => encounter.species === "Pikachu")) {
  WildEncounterRegistry["Verdant Hollow"].push({
    species: "Pikachu",
    weight: 5,
    levelRange: [8, 12]
  });
}

export const verdantHollowEncounters = {
  zoneName: "Verdant Hollow",
  encounterRate: 0.20, // 20% chance per exploration action
  encounters: WildEncounterRegistry["Verdant Hollow"]
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
    hp: Math.floor(Math.random() * 32),
    atk: Math.floor(Math.random() * 32),
    def: Math.floor(Math.random() * 32),
    spAtk: Math.floor(Math.random() * 32),
    spDef: Math.floor(Math.random() * 32),
    spd: Math.floor(Math.random() * 32)
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

export function assignWildTalents(species) {
  const speciesData = getPokemonData(species);
  if (!speciesData) return [];
  return assignRandomTalents(speciesData);
}

export function applyFieldTalents(party, context) {
  let updatedContext = { ...context };
  party.forEach((mon) => {
    const talents = mon?.talents || [];
    talents.forEach((talentEntry) => {
      const talentId = talentEntry.id || talentEntry;
      const grade = talentEntry.grade || 'Basic';
      const effect = TalentRegistry[talentId]?.trigger?.onExplore?.[grade];
      if (effect) {
        updatedContext = effect(updatedContext);
      }
    });
  });

  return updatedContext;
}

export function rollEncounter(encounterTable, party, environment) {
  const baseRate = encounterTable.encounterRate ?? 0;
  const context = applyFieldTalents(party, {
    environment,
    encounterRate: baseRate
  });

  if (Math.random() < context.encounterRate) {
    return generateWildPokemon(encounterTable);
  }

  return null;
}


// IV templates for buildOverride
const IV_TEMPLATES = {
  competitive: { hp: 31, atk: 31, def: 31, spAtk: 31, spDef: 31, spd: 31 },
  physical:    { hp: 31, atk: 31, def: 31, spAtk: 0,  spDef: 31, spd: 31 },
  special:     { hp: 31, atk: 0,  def: 31, spAtk: 31, spDef: 31, spd: 31 },
  defensive:   { hp: 31, atk: 0,  def: 31, spAtk: 0,  spDef: 31, spd: 31 },
  average:     { hp: 15, atk: 15, def: 15, spAtk: 15, spDef: 15, spd: 15 },
};

export function createWildPokemonInstance(species, options = {}) {
  const registrySpecies = getPokemonData(species);
  const speciesData = wildPokemonData[species] || (registrySpecies ? convertPokemonData(registrySpecies) : null);
  if (!speciesData?.species) {
    console.error(`Cannot create wild Pokémon instance for unknown species: ${species}`);
    return null;
  }

  const build = options.buildOverride || null;

  const level = typeof options.level === 'number' ? options.level : randomLevel(5, 12);

  // ── IVs ──
  let ivs;
  if (build?.ivs) {
    ivs = build.ivs;
  } else if (build?.ivTemplate) {
    ivs = IV_TEMPLATES[build.ivTemplate] || generateRandomIVs();
  } else {
    ivs = options.ivs || generateRandomIVs();
  }

  // ── Nature ──
  const nature = build?.nature || options.nature || randomNature();

  // ── EVs ──
  const evs = build?.evSpread || { hp: 0, atk: 0, def: 0, spAtk: 0, spDef: 0, spd: 0 };

  // ── Moves ──
  let moves = [];
  if (build?.moves && build.moves.length > 0) {
    moves = build.moves.slice(0, 4);
  } else if (Array.isArray(speciesData.learnset)) {
    const learnableMoves = speciesData.learnset
      .filter((m) => m.level <= level)
      .sort((a, b) => a.level - b.level);
    moves = learnableMoves.slice(-4).map((m) => m.move || m.name).filter(Boolean);
  } else if (speciesData.learnset && typeof speciesData.learnset === 'object') {
    const availableMoves = [];
    for (const [learnLevel, movesAtLevel] of Object.entries(speciesData.learnset)) {
      if (parseInt(learnLevel, 10) <= level) {
        availableMoves.push(...movesAtLevel);
      }
    }
    moves = availableMoves.slice(-4);
  }
  if (moves.length === 0) moves = ['Tackle', 'Growl'];

  // ── Passive ability ──
  let passiveAbilities;
  if (build?.ability) {
    passiveAbilities = [build.ability];
  } else {
    const allAbilities = [
      ...(speciesData.passiveAbilities || []),
      ...(speciesData.hiddenAbility ? [speciesData.hiddenAbility] : [])
    ];
    const assigned = allAbilities.length > 0
      ? allAbilities[Math.floor(Math.random() * allAbilities.length)]
      : null;
    passiveAbilities = assigned ? [assigned] : [];
  }

  // ── Talents ──
  const talents = build?.talents || options.talents || assignWildTalents(speciesData.species);

  // ── Held item ──
  const heldItems = build?.heldItem ? [build.heldItem] : [];

  return {
    species: speciesData.species,
    level,
    nature,
    ivs,
    evs,
    type1: speciesData.type1,
    type2: speciesData.type2,
    currentHp: null,
    abilities: moves,
    passiveAbilities,
    hiddenAbility: null,
    talents,
    heldItems,
    roles: [speciesData.battleRole],
    signatureMove: speciesData.signatureMove,
    isWild: !build, // trainer-built mons aren't "wild"
    _speciesData: speciesData
  };
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

  let speciesData = wildPokemonData[encounter.species];
  if (!speciesData) {
    const fallbackEncounter = encounterTable.encounters.find((candidate) => wildPokemonData[candidate.species]);
    if (fallbackEncounter) {
      const fallbackSpecies = fallbackEncounter.species;
      speciesData = wildPokemonData[fallbackSpecies];
      console.warn(`No data found for species: ${encounter.species}. Falling back to ${fallbackSpecies}.`);
    } else {
      const fallbackSpecies = 'Pidgey';
      speciesData = wildPokemonData[fallbackSpecies] || null;
      console.warn(`No valid species in encounter table. Falling back to ${fallbackSpecies}.`);
    }
  }

  if (!speciesData) {
    console.error('No valid Pokémon species data found for wild encounter generation.');
    return null;
  }

  const level = randomLevel(encounter.levelRange[0], encounter.levelRange[1]);
  const ivs = generateRandomIVs();
  const nature = randomNature();

  return createWildPokemonInstance(speciesData.species, {
    level,
    ivs,
    nature,
    talents: assignWildTalents(speciesData.species)
  });
}
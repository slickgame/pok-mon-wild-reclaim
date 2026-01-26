// Caterpie species data
export const caterpieData = {
  dexId: 10,
  species: "Caterpie",
  displayName: "Caterpie",
  rarity: "Common",
  zone: "Verdant Hollow",
  types: ["Bug"],
  levelRange: [3, 7],
  baseStats: {
    HP: 45,
    Attack: 30,
    Defense: 35,
    SpAttack: 20,
    SpDefense: 20,
    Speed: 45
  },
  evYield: {
    HP: 1
  },
  baseExp: 39,
  catchRate: 255,
  nature: "random",
  ivs: "random",
  genderRatio: {
    male: 0.5,
    female: 0.5
  },
  battleRole: "Status Inflictor",
  signatureMove: "Sticky Thread",
  talentPool: [
    "silkenGrip",
    "moltingDefense",
    "instinctiveSurvival",
    "threadAmbush",
    "scavengerInstinct",
    "naturesCloak",
    "photosensitiveGrowth",
    "earlyInstinct",
    "tangleReflexes",
    "adaptiveShell"
  ],
  learnset: [
    {
      level: 1,
      name: "Tackle",
      type: "Normal",
      category: "Physical",
      power: 40,
      accuracy: 100,
      pp: 35,
      priority: 0,
      description: "A full-body charge attack."
    },
    {
      level: 1,
      name: "String Shot",
      type: "Bug",
      category: "Status",
      power: 0,
      accuracy: 95,
      pp: 40,
      priority: 0,
      description: "The opposing Pokémon are bound with silk blown from the user's mouth that harshly lowers their Speed.",
      effect: {
        targetStatChange: {
          Speed: -2
        }
      }
    },
    {
      level: 5,
      name: "Bug Bite",
      type: "Bug",
      category: "Physical",
      power: 60,
      accuracy: 100,
      pp: 25,
      priority: 0,
      description: "The user bites the target. If the target is holding a Berry, the user eats it and gains its effect.",
      effect: {
        stealBerry: true
      }
    },
    {
      level: 7,
      name: "Sticky Thread",
      type: "Bug",
      category: "Status",
      power: 0,
      accuracy: 90,
      pp: 15,
      priority: 0,
      description: "The user releases an extremely adhesive thread. It harshly lowers the target's Speed and slightly lowers their Accuracy.",
      effect: {
        targetStatChange: {
          Speed: -2,
          Accuracy: -1
        }
      },
      isSignature: true
    },
    {
      level: 10,
      name: "Infestation",
      type: "Bug",
      category: "Special",
      power: 20,
      accuracy: 100,
      pp: 20,
      priority: 0,
      description: "The target is infested and trapped for 4–5 turns. It takes damage over time and cannot switch out.",
      effect: {
        trap: true,
        duration: "4-5"
      }
    },
    {
      level: 13,
      name: "Camouflage",
      type: "Normal",
      category: "Status",
      power: 0,
      accuracy: 0,
      pp: 20,
      priority: 0,
      description: "The user's type changes depending on the terrain.",
      effect: {
        changeTypeByTerrain: true
      }
    },
    {
      level: 16,
      name: "Skitter Smack",
      type: "Bug",
      category: "Physical",
      power: 70,
      accuracy: 90,
      pp: 10,
      priority: 0,
      description: "The user skitters behind the target to attack. This also lowers the target's Sp. Atk stat.",
      effect: {
        targetStatChange: {
          SpAttack: -1
        }
      }
    },
    {
      level: 20,
      name: "Safeguard",
      type: "Normal",
      category: "Status",
      power: 0,
      accuracy: 0,
      pp: 25,
      priority: 0,
      description: "The user creates a protective field that prevents status conditions for five turns.",
      effect: {
        teamWide: true,
        blocksStatus: true,
        duration: 5
      }
    },
    {
      level: 24,
      name: "Silk Bomb",
      type: "Bug",
      category: "Special",
      power: 60,
      accuracy: 95,
      pp: 15,
      priority: 0,
      description: "The user fires a compressed silk projectile. May paralyze the target.",
      effect: {
        statusChance: {
          type: "paralyze",
          chance: 0.2
        }
      }
    },
    {
      level: 28,
      name: "Echo Thread",
      type: "Bug",
      category: "Status",
      power: 0,
      accuracy: 0,
      pp: 5,
      priority: 0,
      description: "The user repeats the target's stat changes from the previous turn.",
      effect: {
        copyLastStatChanges: true
      },
      isHidden: true
    },
    {
      level: 30,
      name: "Cocoon Shield",
      type: "Bug",
      category: "Status",
      power: 0,
      accuracy: 0,
      pp: 10,
      priority: 0,
      description: "The user hardens its shell to boost its Defense and Special Defense. Can stack up to 3 times.",
      effect: {
        selfStatChange: {
          Defense: 1,
          SpDefense: 1
        },
        maxStacks: 3
      },
      isHidden: true
    }
  ],
  dropItems: [
    {
      itemId: "bug-husk",
      chance: 0.4
    },
    {
      itemId: "sticky-silk",
      chance: 0.15
    },
    {
      itemId: "chitin-shard",
      chance: 0.05
    }
  ]
};
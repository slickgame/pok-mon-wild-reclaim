// Pidgeotto species data
export const pidgeottoData = {
  name: "Pidgeotto",
  dexId: 17,
  species: "Pidgeotto",
  displayName: "Pidgeotto",
  rarity: "Uncommon",
  zone: "Verdant Hollow",
  wildEligible: false,
  types: ["Normal", "Flying"],
  levelRange: [18, 35],
  baseStats: {
    HP: 63,
    Attack: 60,
    Defense: 55,
    SpAttack: 50,
    SpDefense: 50,
    Speed: 71
  },
  evYield: {
    Speed: 2
  },
  baseExp: 122,
  experienceYield: 122,
  catchRate: 120,
  nature: "random",
  ivs: "random",
  genderRatio: {
    male: 0.5,
    female: 0.5
  },
  battleRole: "Speedster / Field Disruptor",
  signatureMove: "Tailwind Gust",
  evolvesFrom: "Pidgey",
  evolution: {
    to: "Pidgeot",
    level: 36
  },
  talentPool: [
    "tailwindMomentum",
    "aerialGrace",
    "gustResonance",
    "windcaller",
    "skyPredator",
    "slipstream",
    "skyDominion",
    "fleetfoot",
    "eyeOfTheStorm",
    "evasiveFeatherstep"
  ],
  typeEffectiveness: {
    Electric: 2,
    Ice: 2,
    Rock: 2,
    Grass: 0.5,
    Bug: 0.5,
    Ground: 0,
    Ghost: 0
  },
  description:
    "Pidgeotto is a swift avian Pokémon that dominates the skies with gusting wingbeats and precise strikes, disrupting foes with commanding wind control.",
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
      name: "Gust",
      type: "Flying",
      category: "Special",
      power: 40,
      accuracy: 100,
      pp: 35,
      priority: 0,
      description: "Whips up a strong gust of wind to strike the target."
    },
    {
      level: 3,
      name: "Sand Attack",
      type: "Ground",
      category: "Status",
      power: 0,
      accuracy: 100,
      pp: 15,
      priority: 0,
      description: "Reduces the target’s Accuracy by throwing sand."
    },
    {
      level: 5,
      name: "Quick Attack",
      type: "Normal",
      category: "Physical",
      power: 40,
      accuracy: 100,
      pp: 30,
      priority: 1,
      description: "An extremely fast attack that always strikes first."
    },
    {
      level: 7,
      name: "Feather Guard",
      type: "Flying",
      category: "Status",
      power: 0,
      accuracy: 100,
      pp: 20,
      priority: 0,
      description: "Fluffs feathers to raise Defense by one stage.",
      effect: {
        selfStatChange: {
          Defense: 1
        }
      }
    },
    {
      level: 9,
      name: "Wing Slap",
      type: "Flying",
      category: "Physical",
      power: 50,
      accuracy: 95,
      pp: 25,
      priority: 0,
      description: "Strikes the target with wide-spread wings."
    },
    {
      level: 11,
      name: "Whirlwind",
      type: "Normal",
      category: "Status",
      power: 0,
      accuracy: 0,
      pp: 20,
      priority: -6,
      description: "Blows the target away, forcing a switch."
    },
    {
      level: 13,
      name: "Air Cutter",
      type: "Flying",
      category: "Special",
      power: 60,
      accuracy: 95,
      pp: 25,
      priority: 0,
      description: "Launches razor-like wind blades. High critical-hit ratio."
    },
    {
      level: 15,
      name: "Tailwind Gust",
      type: "Flying",
      category: "Status",
      power: 0,
      accuracy: 100,
      pp: 15,
      priority: 0,
      isSignature: true,
      description: "Whips up a tailwind that boosts the Speed of all allies for 4 turns.",
      effect: {
        teamSpeedBoost: true,
        duration: 4
      }
    },
    {
      level: 17,
      name: "Aerial Ace",
      type: "Flying",
      category: "Physical",
      power: 60,
      accuracy: 999,
      pp: 20,
      priority: 0,
      description: "An extremely fast attack that never misses."
    },
    {
      level: 19,
      name: "Peck Flurry",
      type: "Flying",
      category: "Physical",
      power: 20,
      accuracy: 100,
      pp: 30,
      priority: 0,
      description: "Rapid pecking that hits 2–5 times.",
      multiHit: [2, 5]
    },
    {
      level: 22,
      name: "Wide Gust",
      type: "Flying",
      category: "Special",
      power: 55,
      accuracy: 95,
      pp: 20,
      priority: 0,
      description: "Blasts all adjacent foes with wind.",
      targets: "all-opponents"
    },
    {
      level: 26,
      name: "Keen Eye",
      type: "Normal",
      category: "Status",
      power: 0,
      accuracy: 0,
      pp: 20,
      priority: 0,
      description: "Boosts critical-hit ratio for 5 turns.",
      effect: {
        critBoost: true,
        duration: 5
      }
    },
    {
      level: 30,
      name: "Wind Cage",
      type: "Flying",
      category: "Status",
      power: 0,
      accuracy: 85,
      pp: 15,
      priority: 0,
      description: "Traps the target for 4–5 turns and deals passive Flying damage.",
      effect: {
        trapTurns: [4, 5],
        passiveDamage: {
          type: "Flying",
          percentPerTurn: 0.06
        }
      }
    }
  ],
  dropItems: [
    {
      itemId: "featherSoft",
      chance: 0.7
    },
    {
      itemId: "windDust",
      chance: 0.3
    },
    {
      itemId: "ancientShard",
      chance: 0.1
    }
  ]
};

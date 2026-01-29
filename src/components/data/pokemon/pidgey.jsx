// Pidgey species data
export const pidgeyData = {
  dexId: 16,
  species: "Pidgey",
  displayName: "Pidgey",
  rarity: "Common",
  zone: "Verdant Hollow",
  types: ["Normal", "Flying"],
  levelRange: [4, 8],
  baseStats: {
    HP: 40,
    Attack: 45,
    Defense: 40,
    SpAttack: 35,
    SpDefense: 35,
    Speed: 56
  },
  evYield: {
    Speed: 1
  },
  baseExp: 50,
  catchRate: 128,
  nature: "random",
  ivs: "random",
  genderRatio: {
    male: 0.5,
    female: 0.5
  },
  battleRole: "Speedster / Support Disruptor",
  signatureMove: "Tailwind Gust",
  evolution: {
    to: "Pidgeotto",
    level: 18
  },
  talentPool: [
    "tailwindMomentum",
    "aerialGrace",
    "gustResonance",
    "eyeOfTheStorm",
    "evasiveFeatherstep",
    "fleetfoot",
    "windcaller",
    "skyPredator",
    "slipstream",
    "skyDominion"
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
    "Pidgey is a docile, low-level bird Pokémon that uses bursts of wind and quick attacks to disorient opponents. It often travels in flocks and prefers aerial skirmishes to direct confrontation.",
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
      name: "Agility",
      type: "Psychic",
      category: "Status",
      power: 0,
      accuracy: 100,
      pp: 30,
      priority: 0,
      description: "Relaxes the body to sharply raise Speed.",
      effect: {
        selfStatChange: {
          Speed: 2
        }
      }
    },
    {
      level: 21,
      name: "Feather Dance",
      type: "Flying",
      category: "Status",
      power: 0,
      accuracy: 100,
      pp: 15,
      priority: 0,
      description: "Covers the foe in feathers, sharply lowering Attack.",
      effect: {
        targetStatChange: {
          Attack: -2
        }
      }
    },
    {
      level: 24,
      name: "Roost",
      type: "Flying",
      category: "Status",
      power: 0,
      accuracy: 0,
      pp: 10,
      priority: 0,
      description: "The user lands and restores 50% of its max HP.",
      effect: {
        selfHealPercent: 0.5
      }
    },
    {
      level: 27,
      name: "Air Slash",
      type: "Flying",
      category: "Special",
      power: 75,
      accuracy: 95,
      pp: 15,
      priority: 0,
      description: "Attacks with sharp air that may cause flinching.",
      effect: {
        flinchChance: 0.3
      }
    },
    {
      level: 30,
      name: "Sky Dive",
      type: "Flying",
      category: "Physical",
      power: 90,
      accuracy: 95,
      pp: 10,
      priority: 0,
      description: "The user flies up and strikes the target on the next turn.",
      isTwoTurn: true
    }
  ],
  dropItems: [
    {
      itemId: "featherSoft",
      chance: 0.5
    },
    {
      itemId: "windDust",
      chance: 0.2
    },
    {
      itemId: "ancientShard",
      chance: 0.05
    }
  ]
};

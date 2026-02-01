// Raichu species data
export const raichuData = {
  name: "Raichu",
  species: "Raichu",
  displayName: "Raichu",
  dexId: 26,
  types: ["Electric"],
  evolvesFrom: "Pikachu",
  evolution: null,
  trigger: "Thunder Stone",
  baseStats: {
    hp: 60,
    atk: 90,
    def: 55,
    spa: 90,
    spd: 80,
    spe: 110
  },
  evYield: {
    spe: 3
  },
  baseExp: 218,
  baseExpYield: 218,
  levelRange: [null, null],
  growthRate: "MediumFast",
  genderRatio: {
    male: 50,
    female: 50
  },
  abilities: ["Static"],
  wild: null,
  drops: [
    { item: "Charged Tail Fur", chance: 0.15 },
    { item: "Thunder Core", chance: 0.03 }
  ],
  talentPool: [
    "voltageStorage",
    "shockAffinity",
    "quickstep",
    "stormAttractor",
    "burstFocus",
    "batteryPack",
    "overchargeWave",
    "supercell",
    "surgeRedirect",
    "ionAmplifier"
  ],
  notes: "Evolves from Pikachu using Thunder Stone. Cannot evolve further.",
  learnset: [
    {
      name: "Thunder Punch",
      level: 1,
      type: "Electric",
      category: "Physical",
      power: 75,
      accuracy: 100,
      pp: 15,
      description: "The target is punched with an electrified fist. May paralyze the target.",
      tags: ["Paralyze", "Electric", "Punch"]
    },
    {
      name: "Quick Attack",
      level: 1,
      type: "Normal",
      category: "Physical",
      power: 40,
      accuracy: 100,
      pp: 30,
      priority: 1,
      description: "An almost invisible attack that is certain to strike first.",
      tags: ["Priority", "Speed"]
    },
    {
      name: "Agility",
      level: 1,
      type: "Psychic",
      category: "Status",
      power: null,
      accuracy: null,
      pp: 30,
      description: "The user relaxes and lightens its body to sharply boost its Speed stat.",
      tags: ["Buff", "Speed"]
    },
    {
      name: "Slam",
      level: 1,
      type: "Normal",
      category: "Physical",
      power: 80,
      accuracy: 75,
      pp: 20,
      description: "The target is slammed with a long tail, vines, or tentacle.",
      tags: ["Physical"]
    },
    {
      name: "Feint",
      level: 1,
      type: "Normal",
      category: "Physical",
      power: 30,
      accuracy: 100,
      pp: 10,
      description: "An attack that hits a target using Protect or Detect. It also lifts the effects of those moves.",
      tags: ["Bypass", "Priority"]
    },
    {
      name: "Spark",
      level: 1,
      type: "Electric",
      category: "Physical",
      power: 65,
      accuracy: 100,
      pp: 20,
      description: "A jolt of electricity is hurled at the target to inflict damage. It may also leave the target with paralysis.",
      tags: ["Electric", "Paralyze"]
    },
    {
      name: "Volt Tackle",
      level: 1,
      type: "Electric",
      category: "Physical",
      power: 120,
      accuracy: 100,
      pp: 15,
      recoil: 0.33,
      description: "A life-risking tackle that also hurts the user. May cause paralysis.",
      tags: ["Electric", "Paralyze", "Recoil", "Signature"]
    },
    {
      name: "Thunder Wave",
      level: 1,
      type: "Electric",
      category: "Status",
      power: null,
      accuracy: 90,
      pp: 20,
      description: "A weak electric charge is launched at the target. It causes paralysis if it hits.",
      tags: ["Paralyze", "Status"]
    },
    {
      name: "Electro Ball",
      level: 1,
      type: "Electric",
      category: "Special",
      power: 0,
      accuracy: 100,
      pp: 10,
      description: "The faster the user is than the target, the greater the damage.",
      tags: ["Electric", "SpeedBased", "Special"]
    },
    {
      name: "Discharge",
      level: 1,
      type: "Electric",
      category: "Special",
      power: 80,
      accuracy: 100,
      pp: 15,
      description: "The user strikes everything around it by letting loose a flare of electricity. May cause paralysis.",
      tags: ["Area", "Paralyze", "Electric"]
    }
  ]
};

// Pikachu species data
export const pikachuData = {
  name: "Pikachu",
  species: "Pikachu",
  displayName: "Pikachu",
  dexId: 25,
  types: ["Electric"],
  baseStats: {
    hp: 35,
    atk: 55,
    def: 40,
    spa: 50,
    spd: 50,
    spe: 90
  },
  evYield: {
    spe: 2
  },
  baseExp: 112,
  baseExpYield: 112,
  levelRange: [8, 12],
  growthRate: "MediumFast",
  genderRatio: {
    male: 50,
    female: 50
  },
  abilities: ["Static"],
  wild: {
    encounterRate: 5,
    map: "Verdant Hollow"
  },
  drops: [
    { item: "Tiny Spark Shard", chance: 0.15 },
    { item: "Chewed Wire", chance: 0.05 }
  ],
  rarity: "Rare",
  zone: "Verdant Hollow",
  battleRole: "Speedy Striker",
  signatureMove: "Volt Pounce",
  catchRate: 190,
  nature: "random",
  ivs: "random",
  talentPool: [
    "staticField",
    "shockAffinity",
    "voltageStorage",
    "quickstep",
    "hyperReflex",
    "stormAttractor",
    "burstFocus",
    "batteryPack",
    "circuitSync",
    "voltaicCoat"
  ],
  evolution: {
    evolvesTo: "Raichu",
    trigger: "Thunder Stone"
  },
  learnset: [
    { level: 1, move: "Thunder Shock" },
    { level: 1, move: "Tail Whip" },
    { level: 5, move: "Thunder Wave" },
    { level: 10, move: "Quick Attack" },
    { level: 13, move: "Electro Ball" },
    { level: 15, move: "Volt Pounce" },
    {
      level: 29,
      name: "Nuzzle",
      description: "The user nuzzles its electrified cheeks against the target. Always causes paralysis.",
      type: "Electric",
      category: "Physical",
      power: 20,
      accuracy: 100,
      pp: 20,
      tags: ["Paralyze"]
    },
    {
      level: 34,
      name: "Discharge",
      description:
        "Releases a burst of electricity that hits all nearby Pokémon. May cause paralysis.",
      type: "Electric",
      category: "Special",
      power: 80,
      accuracy: 100,
      pp: 15,
      tags: ["Paralyze", "AOE"]
    },
    {
      level: 37,
      name: "Slam",
      description: "The target is slammed with a long tail, vines, or the like.",
      type: "Normal",
      category: "Physical",
      power: 80,
      accuracy: 75,
      pp: 20,
      tags: []
    },
    {
      level: 42,
      name: "Thunderbolt",
      description: "A strong electric blast crashes down on the target. May cause paralysis.",
      type: "Electric",
      category: "Special",
      power: 90,
      accuracy: 100,
      pp: 15,
      tags: ["Paralyze"]
    },
    {
      level: 47,
      name: "Agility",
      description: "The user relaxes and lightens its body to sharply raise Speed.",
      type: "Psychic",
      category: "Status",
      power: null,
      accuracy: null,
      pp: 30,
      tags: ["Buff"]
    },
    {
      level: 50,
      name: "Thunder",
      description:
        "A wicked thunderbolt is dropped on the target. May cause paralysis. Accuracy drops in sun, raised in rain.",
      type: "Electric",
      category: "Special",
      power: 110,
      accuracy: 70,
      pp: 10,
      tags: ["Paralyze", "Weather"]
    }
  ]
};

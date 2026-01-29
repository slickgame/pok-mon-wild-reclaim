// Metapod species data
export const metapodData = {
  name: "Metapod",
  dexId: 11,
  species: "Metapod",
  displayName: "Metapod",
  rarity: "Uncommon",
  zone: "Verdant Hollow",
  wildEligible: false,
  types: ["Bug"],
  levelRange: [7, 9],
  baseStats: {
    HP: 50,
    Attack: 20,
    Defense: 55,
    SpAttack: 25,
    SpDefense: 25,
    Speed: 30
  },
  evYield: {
    Defense: 2
  },
  baseExp: 72,
  experienceYield: 72,
  catchRate: 120,
  nature: "random",
  ivs: "random",
  genderRatio: {
    male: 0.5,
    female: 0.5
  },
  battleRole: "Tank",
  signatureMove: "Harden",
  evolvesFrom: "Caterpie",
  evolvesTo: "Butterfree",
  evolutionLevel: 10,
  evolution: {
    to: "Butterfree",
    level: 10
  },
  talentPool: [
    "reinforcedCarapace",
    "ironShell"
  ],
  learnset: [
    { level: 1, move: "Harden" },
    { level: 7, move: "Harden" }
  ],
  dropTable: "Metapod",
  dropItems: [
    {
      itemId: "hardenedShell",
      chance: 0.4
    },
    {
      itemId: "ancientShard",
      chance: 0.05
    }
  ]
};

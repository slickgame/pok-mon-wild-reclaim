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
    { level: 1, move: "Tackle" },
    { level: 1, move: "String Shot" },
    { level: 5, move: "Bug Bite" },
    { level: 7, move: "Sticky Thread" },
    { level: 10, move: "Infestation" },
    { level: 13, move: "Camouflage" },
    { level: 16, move: "Skitter Smack" },
    { level: 20, move: "Safeguard" },
    { level: 24, move: "Silk Bomb" },
    { level: 28, move: "Echo Thread" },
    { level: 30, move: "Cocoon Shield" }
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

// Oddish species data
export const oddishData = {
  dexId: 43,
  species: "Oddish",
  displayName: "Oddish",
  types: ["Grass", "Poison"],
  levelRange: [5, 10],
  baseStats: {
    HP: 45,
    Attack: 50,
    Defense: 55,
    SpAttack: 75,
    SpDefense: 65,
    Speed: 30
  },
  evYield: {
    SpAttack: 1
  },
  baseExp: 64,
  evolvesTo: ["Gloom"],
  evolution: {
    evolvesTo: [
      { species: "Gloom", level: 21 }
    ]
  },
  learnset: [
    { level: 1, move: "Absorb" },
    { level: 4, move: "Poison Powder" },
    { level: 6, move: "Stun Spore" },
    { level: 8, move: "Sleep Powder" },
    { level: 10, move: "Mega Drain" },
    { level: 12, move: "Growth" },
    { level: 14, move: "Toxic Spores" },
    { level: 16, move: "Acid" },
    { level: 18, move: "Giga Drain" },
    { level: 20, move: "Leech Seed" },
    { level: 22, move: "Venoshock" },
    { level: 24, move: "Aromatherapy" },
    { level: 26, move: "Toxic" },
    { level: 28, move: "Moonlight" },
    { level: 30, move: "Petal Dance" },
    { level: 33, move: "Grassy Terrain" },
    { level: 36, move: "Sludge Bomb" },
    { level: 40, move: "Gloom Burst" },
    { level: 44, move: "Paralysis Spore" }
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
  talentSlots: {
    min: 0,
    max: 3,
    odds: {
      0: 0.15,
      1: 0.5,
      2: 0.25,
      3: 0.1
    },
    gradeOdds: {
      Basic: 0.7,
      Rare: 0.25,
      Epic: 0.05
    }
  },
  battleRole: "Status Inflicter",
  description:
    "Oddish absorbs nutrients from soil and spreads disruptive spores to disable foes. A master of status control and healing.",
  signatureMove: "Paralysis Spore",
  codex: {
    tags: ["Spore", "Terrain", "Healer"],
    showTalentSummary: true,
    showSignatureMove: true,
    showRole: true
  }
};

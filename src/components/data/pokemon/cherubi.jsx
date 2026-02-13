// Cherubi species data
export const cherubiData = {
  dexId: 420,
  species: "Cherubi",
  displayName: "Cherubi",
  rarity: "Uncommon",
  zone: "Verdant Hollow",
  types: ["Grass"],
  levelRange: [6, 10],
  baseStats: {
    HP: 45,
    Attack: 35,
    Defense: 45,
    SpAttack: 62,
    SpDefense: 53,
    Speed: 35
  },
  evYield: {
    SpAttack: 1
  },
  baseExp: 55,
  baseExpYield: 55,
  catchRate: 190,
  growthRate: "MediumSlow",
  genderRatio: {
    male: 50,
    female: 50
  },
  passiveAbilities: ["Chlorophyll"],
  hiddenAbility: "Flower Gift",
  battleRole: "Medic",
  signatureMove: "Berry Burst",
  description:
    "Cherubi stores nutrients in its small orb and thrives in sunny weather, supporting allies with restorative floral energy.",
  evolution: {
    evolvesTo: "Cherrim",
    level: 25
  },
  learnset: [
    { level: 1, move: "Tackle" },
    { level: 1, move: "Growth" },
    { level: 5, move: "Leech Seed" },
    { level: 8, move: "Magical Leaf" },
    {
      level: 12,
      name: "Berry Burst",
      type: "Grass",
      category: "Special",
      power: 55,
      accuracy: 100,
      pp: 15,
      tags: ["Healing", "Drain", "Signature", "Grass"],
      description: "Hurls nutrient-rich fruit energy at the target. Restores some of the user's HP.",
      effect: "drain",
      drainPercentage: 0.3,
      isSignature: true
    },
    { level: 16, move: "Sunny Day" },
    { level: 20, move: "Synthesis" },
    { level: 24, move: "Energy Ball" },
    { level: 29, move: "Petal Dance" },
    { level: 33, move: "Solar Beam" },
    { level: 38, move: "Sweet Scent" },
    { level: 42, move: "Aromatherapy" },
    { level: 47, move: "Giga Drain" },
    { level: 52, move: "Grassy Terrain" },
    { level: 58, move: "Safeguard" },
    { level: 64, move: "Toxic" },
    { level: 70, move: "Petal Dance" },
    { level: 78, move: "Energy Ball" },
    { level: 86, move: "Solar Beam" },
    { level: 94, move: "Synthesis" }
  ],
  talentPool: [
    "berryAroma",
    "sunSip",
    "seedReserve",
    "petalGuard",
    "orchardRhythm",
    "sweetCanopy",
    "fruitfulBloom",
    "solarNectar",
    "harvestPulse",
    "verdantGift"
  ],
  dropItems: [
    { item: "Oran Berry", chance: 0.35 },
    { item: "Cheri Berry", chance: 0.22 },
    { item: "Pecha Berry", chance: 0.2 },
    { item: "Sitrus Berry", chance: 0.08 }
  ]
};

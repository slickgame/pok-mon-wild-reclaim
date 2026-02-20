// Cherrim species data
export const cherrimData = {
  dexId: 421,
  species: "Cherrim",
  displayName: "Cherrim",
  types: ["Grass"],
  baseStats: {
    HP: 70,
    Attack: 60,
    Defense: 70,
    SpAttack: 87,
    SpDefense: 78,
    Speed: 85
  },
  evYield: {
    SpAttack: 2
  },
  baseExp: 158,
  baseExpYield: 158,
  evolvesFrom: "Cherubi",
  passiveAbilities: ["Flower Gift"],
  hiddenAbility: "Flower Gift",
  battleRole: "Support",
  signatureMove: "Sunlit Flourish",
  description:
    "When sunshine pours down, Cherrim blooms brightly and bolsters allies with floral power.",
  learnset: [
    { level: 1, move: "Magical Leaf" },
    { level: 1, move: "Growth" },
    { level: 1, move: "Sunny Day" },
    { level: 1, move: "Synthesis" },
    { level: 1, move: "Energy Ball" },
    {
      level: 28,
      name: "Sunlit Flourish",
      type: "Grass",
      category: "Status",
      power: 0,
      accuracy: 100,
      pp: 10,
      tags: ["Signature", "Support", "Buff", "Grass"],
      description: "Sun-charged petals boost the user's Sp. Atk and Sp. Def.",
      effect: "selfBoost",
      statBoosts: {
        spAtk: 1,
        spDef: 1
      },
      isSignature: true
    },
    { level: 33, move: "Solar Beam" },
    { level: 37, move: "Aromatherapy" },
    { level: 41, move: "Sweet Scent" },
    { level: 46, move: "Giga Drain" },
    { level: 51, move: "Grassy Terrain" },
    { level: 57, move: "Safeguard" },
    { level: 63, move: "Energy Ball" },
    { level: 69, move: "Petal Dance" },
    { level: 75, move: "Toxic" },
    { level: 82, move: "Solar Beam" },
    { level: 90, move: "Sunlit Flourish" },
    { level: 98, move: "Synthesis" }
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
    { item: "Oran Berry", chance: 0.25 },
    { item: "Sitrus Berry", chance: 0.2 },
    { item: "Lum Berry", chance: 0.1 }
  ]
};

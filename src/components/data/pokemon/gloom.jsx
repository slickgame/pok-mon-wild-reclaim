// Gloom species data
export const gloomData = {
  dexId: 44,
  species: "Gloom",
  displayName: "Gloom",
  types: ["Grass", "Poison"],
  baseStats: {
    HP: 60,
    Attack: 65,
    Defense: 70,
    SpAttack: 85,
    SpDefense: 75,
    Speed: 40
  },
  evolvesFrom: "Oddish",
  evolvesTo: ["Vileplume", "Bellossom"],
  evolutionMethods: {
    Vileplume: { method: "useItem", item: "Leaf Stone" },
    Bellossom: { method: "useItem", item: "Sun Stone" }
  },
  talentPool: [
    "chlorophyllBoost",
    "toxicPollen",
    "sporeSynthesis",
    "gloomAura",
    "resilientStink",
    "rotPollinate",
    "grudgeBloom",
    "twilightToxin",
    "noxiousSpreader",
    "overgrowthInstinct"
  ],
  learnset: []
};

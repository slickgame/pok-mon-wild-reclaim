// Butterfree species data
export const butterfreeData = {
  name: "Butterfree",
  dexId: 12,
  species: "Butterfree",
  displayName: "Butterfree",
  rarity: "Rare",
  zone: "Verdant Hollow",
  wildEligible: false,
  types: ["Bug", "Flying"],
  levelRange: [10, 30],
  baseStats: {
    HP: 60,
    Attack: 45,
    Defense: 50,
    SpAttack: 90,
    SpDefense: 80,
    Speed: 70
  },
  evYield: {
    SpAttack: 2
  },
  baseExp: 178,
  experienceYield: 178,
  catchRate: 45,
  nature: "random",
  ivs: "random",
  genderRatio: {
    male: 0.5,
    female: 0.5
  },
  battleRole: "Status / Support",
  signatureMove: "Quiver Dance",
  evolvesFrom: "Metapod",
  evolvesTo: null,
  evolutionLevel: null,
  talentPool: {
    options: [
      "compoundEyes",
      "statusMaster",
      "dreamTouch",
      "powderExpert",
      "aerialSupport",
      "pollenSurge",
      "tailwindInstinct",
      "powderTrail",
      "mindBloom",
      "etherealPresence"
    ],
    max: 3
  },
  learnset: [
    { level: 1, move: "Harden" },
    { level: 1, move: "Tackle" },
    { level: 1, move: "String Shot" },
    { level: 1, move: "Bug Bite" },
    { level: 4, move: "Gust" },
    { level: 8, move: "Confusion" },
    { level: 12, move: "Poison Powder" },
    { level: 12, move: "Stun Spore" },
    { level: 12, move: "Sleep Powder" },
    { level: 16, move: "Psybeam" },
    { level: 20, move: "Whirlwind" },
    { level: 24, move: "Air Cutter" },
    { level: 28, move: "Silver Wind" },
    { level: 32, move: "Safeguard" },
    { level: 36, move: "Tailwind" },
    { level: 40, move: "Bug Buzz" },
    { level: 44, move: "Rage Powder" },
    { level: 48, move: "Quiver Dance" },
    { level: 52, move: "Hurricane" },
    { level: 56, move: "Pollen Puff" },
    { level: 60, move: "Dream Eater" }
  ],
  dropTable: [
    { item: "silverPowder", chance: 0.5 },
    { item: "healingPollen", chance: 0.25 },
    { item: "butterflyScale", chance: 0.1 }
  ],
  dropItems: [
    {
      itemId: "silverPowder",
      chance: 0.5
    },
    {
      itemId: "healingPollen",
      chance: 0.25
    },
    {
      itemId: "butterflyScale",
      chance: 0.1
    }
  ]
};

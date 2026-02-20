// Central item registry
export const ItemRegistry = {
  featherSoft: {
    id: "featherSoft",
    name: "Soft Feather",
    description: "A downy feather often shed by Flying-types.",
    sellPrice: 10,
  },
  windDust: {
    id: "windDust",
    name: "Wind Dust",
    description: "Grit left behind by aerial skirmishes. Used in crafting.",
    sellPrice: 25,
  },
  featherRare: {
    id: "featherRare",
    name: "Rare Feather",
    description: "A shimmering feather from a powerful flier. Valued by collectors.",
    sellPrice: 100,
  },
  ancientShard: {
    id: "ancientShard",
    name: "Ancient Shard",
    description: "A fragment of mysterious origin. Often found after battles.",
    sellPrice: 50,
  },
  hardenedShell: {
    id: "hardenedShell",
    name: "Hardened Shell",
    description: "A dense shell fragment prized for defensive crafting.",
    sellPrice: 35
  },
  flutterWing: {
    id: "flutterWing",
    name: "Flutter Wing",
    description: "A delicate wing scale that shimmers with powder.",
    sellPrice: 40
  },
  powderSpore: {
    id: "powderSpore",
    name: "Powder Spore",
    description: "A fine spore used in status concoctions.",
    sellPrice: 30
  },
  silverPowder: {
    id: "silverPowder",
    name: "Silver Powder",
    description: "Boosts Bug-type moves by 20%.",
    type: "held",
    effect: {
      type: "BoostMoveType",
      moveType: "Bug",
      multiplier: 1.2
    },
    sellPrice: 120
  },
  healingPollen: {
    id: "healingPollen",
    name: "Healing Pollen",
    description: "Used in advanced healing item crafting.",
    type: "material",
    sellPrice: 45
  },
  butterflyScale: {
    id: "butterflyScale",
    name: "Butterfly Scale",
    description: "A rare and beautiful scale used for special gear.",
    type: "material",
    sellPrice: 150
  },
  oranBerry: {
    id: "oranBerry",
    name: "Oran Berry",
    description: "A held berry that restores HP when its holder is low.",
    type: "berry",
    berryTrigger: "low_hp",
    triggerHpPercent: 0.5,
    healPercent: 0.125,
    sellPrice: 80
  },
  pechaBerry: {
    id: "pechaBerry",
    name: "Pecha Berry",
    description: "A held berry that cures poison.",
    type: "berry",
    berryTrigger: "status",
    curesStatus: ["poison"],
    sellPrice: 80
  },
  cheriBerry: {
    id: "cheriBerry",
    name: "Cheri Berry",
    description: "A held berry that cures paralysis.",
    type: "berry",
    berryTrigger: "status",
    curesStatus: ["paralyze", "paralysis"],
    sellPrice: 80
  },
  sitrusBerry: {
    id: "sitrusBerry",
    name: "Sitrus Berry",
    description: "A held berry that restores a larger amount of HP when low.",
    type: "berry",
    berryTrigger: "low_hp",
    triggerHpPercent: 0.5,
    healPercent: 0.25,
    sellPrice: 150
  },
  lumBerry: {
    id: "lumBerry",
    name: "Lum Berry",
    description: "A held berry that cures any status condition.",
    type: "berry",
    berryTrigger: "status",
    curesStatus: ["any"],
    sellPrice: 180
  },
  talentCrystal: {
    id: "talentCrystal",
    name: "Talent Crystal",
    type: "Key",
    icon: "icon_talent_crystal",
    description: "A crystalline shard that can reset a Pokémon's innate talents.",
    rarity: "Uncommon",
    sellValue: 250,
    usable: false,
    category: "upgrade",
  },
  trainingScroll: {
    id: "trainingScroll",
    name: "Training Scroll",
    type: "Consumable",
    icon: "icon_training_scroll",
    description: "A scroll used to focus a Pokémon's potential. May increase or decrease talent grade.",
    rarity: "Rare",
    sellValue: 400,
    usable: false,
    category: "upgrade",
  },
  leafStone: {
    id: "Leaf Stone",
    name: "Leaf Stone",
    description: "A mysterious green stone that causes certain Pokémon to evolve.",
    rarity: "rare",
    type: "evolution",
    value: 3000
  },
  sunStone: {
    id: "Sun Stone",
    name: "Sun Stone",
    description: "A brilliant stone that radiates warmth. Used to evolve some Pokémon.",
    rarity: "rare",
    type: "evolution",
    value: 3500
  },
};

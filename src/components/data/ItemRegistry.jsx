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
};

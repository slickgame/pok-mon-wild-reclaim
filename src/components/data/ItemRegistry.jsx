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

  // Research reward item mappings (quest pool integration)
  poke_ball: {
    id: 'poke_ball',
    name: 'Pokéball',
    type: 'Capture Gear',
    rarity: 'Common',
    description: 'A standard ball for catching wild Pokémon.'
  },
  great_ball: {
    id: 'great_ball',
    name: 'Great Ball',
    type: 'Capture Gear',
    rarity: 'Uncommon',
    description: 'A high-performance ball with a better catch rate than a Pokéball.'
  },
  ultra_ball: {
    id: 'ultra_ball',
    name: 'Ultra Ball',
    type: 'Capture Gear',
    rarity: 'Rare',
    description: 'An ultra-performance ball with a higher catch rate than Great Ball.'
  },
  master_ball: {
    id: 'master_ball',
    name: 'Master Ball',
    type: 'Capture Gear',
    rarity: 'Legendary',
    description: 'The best ball with an almost guaranteed catch rate.'
  },
  dusk_ball: {
    id: 'dusk_ball',
    name: 'Dusk Ball',
    type: 'Capture Gear',
    rarity: 'Rare',
    description: 'A Poké Ball that performs best in dark places.'
  },
  quick_ball: {
    id: 'quick_ball',
    name: 'Quick Ball',
    type: 'Capture Gear',
    rarity: 'Rare',
    description: 'A Poké Ball that works especially well on the first turn.'
  },

  potion: {
    id: 'potion',
    name: 'Potion',
    type: 'Potion',
    rarity: 'Common',
    description: 'Restores 50 HP.'
  },
  super_potion: {
    id: 'super_potion',
    name: 'Super Potion',
    type: 'Potion',
    rarity: 'Uncommon',
    description: 'Restores 100 HP.'
  },
  hyper_potion: {
    id: 'hyper_potion',
    name: 'Hyper Potion',
    type: 'Potion',
    rarity: 'Rare',
    description: 'Restores 200 HP.'
  },
  max_potion: {
    id: 'max_potion',
    name: 'Max Potion',
    type: 'Potion',
    rarity: 'Epic',
    description: 'Fully restores HP.'
  },
  antidote: {
    id: 'antidote',
    name: 'Antidote',
    type: 'Battle Item',
    rarity: 'Common',
    description: 'Cures poison.'
  },
  revive: {
    id: 'revive',
    name: 'Revive',
    type: 'Battle Item',
    rarity: 'Uncommon',
    description: 'Revives a fainted Pokémon with partial HP.'
  },
  max_revive: {
    id: 'max_revive',
    name: 'Max Revive',
    type: 'Battle Item',
    rarity: 'Epic',
    description: 'Fully revives a fainted Pokémon.'
  },

  hp_up: {
    id: 'hp_up',
    name: 'HP Up',
    type: 'Consumable',
    rarity: 'Uncommon',
    description: 'Boosts HP training values.'
  },
  protein: {
    id: 'protein',
    name: 'Protein',
    type: 'Consumable',
    rarity: 'Uncommon',
    description: 'Boosts Attack training values.'
  },
  iron: {
    id: 'iron',
    name: 'Iron',
    type: 'Consumable',
    rarity: 'Uncommon',
    description: 'Boosts Defense training values.'
  },
  calcium: {
    id: 'calcium',
    name: 'Calcium',
    type: 'Consumable',
    rarity: 'Uncommon',
    description: 'Boosts Sp. Atk training values.'
  },
  zinc: {
    id: 'zinc',
    name: 'Zinc',
    type: 'Consumable',
    rarity: 'Uncommon',
    description: 'Boosts Sp. Def training values.'
  },
  carbos: {
    id: 'carbos',
    name: 'Carbos',
    type: 'Consumable',
    rarity: 'Uncommon',
    description: 'Boosts Speed training values.'
  },
  pp_up: {
    id: 'pp_up',
    name: 'PP Up',
    type: 'Consumable',
    rarity: 'Rare',
    description: 'Increases the maximum PP of a move.'
  },
  pp_max: {
    id: 'pp_max',
    name: 'PP Max',
    type: 'Consumable',
    rarity: 'Epic',
    description: 'Greatly increases the maximum PP of a move.'
  },
  rare_candy: {
    id: 'rare_candy',
    name: 'Rare Candy',
    type: 'Consumable',
    rarity: 'Rare',
    description: 'Raises a Pokémon by one level.'
  },
  exp_candy_s: {
    id: 'exp_candy_s',
    name: 'EXP Candy S',
    type: 'Consumable',
    rarity: 'Common',
    description: 'Grants a small amount of experience.'
  },
  exp_candy_m: {
    id: 'exp_candy_m',
    name: 'EXP Candy M',
    type: 'Consumable',
    rarity: 'Uncommon',
    description: 'Grants a moderate amount of experience.'
  },
  exp_candy_l: {
    id: 'exp_candy_l',
    name: 'EXP Candy L',
    type: 'Consumable',
    rarity: 'Rare',
    description: 'Grants a large amount of experience.'
  },
  exp_candy_xl: {
    id: 'exp_candy_xl',
    name: 'EXP Candy XL',
    type: 'Consumable',
    rarity: 'Epic',
    description: 'Grants a huge amount of experience.'
  },
  mint_modest: {
    id: 'mint_modest',
    name: 'Modest Mint',
    type: 'Consumable',
    rarity: 'Rare',
    description: "Changes a Pokémon's stat growth style to Modest."
  },

  bottle_cap: {
    id: 'bottle_cap',
    name: 'Bottle Cap',
    type: 'Battle Item',
    rarity: 'Rare',
    description: 'A valuable cap used for advanced stat training.'
  },
  gold_bottle_cap: {
    id: 'gold_bottle_cap',
    name: 'Gold Bottle Cap',
    type: 'Battle Item',
    rarity: 'Legendary',
    description: 'A rare cap used for elite stat training.'
  },
  ability_capsule: {
    id: 'ability_capsule',
    name: 'Ability Capsule',
    type: 'Battle Item',
    rarity: 'Epic',
    description: 'Switches between compatible abilities.'
  },
  ability_patch: {
    id: 'ability_patch',
    name: 'Ability Patch',
    type: 'Battle Item',
    rarity: 'Legendary',
    description: 'Can unlock a hidden ability.'
  },

  choice_band: {
    id: 'choice_band',
    name: 'Choice Band',
    type: 'Held Item',
    rarity: 'Epic',
    description: 'Boosts Attack, but locks move selection.'
  },
  choice_specs: {
    id: 'choice_specs',
    name: 'Choice Specs',
    type: 'Held Item',
    rarity: 'Epic',
    description: 'Boosts Sp. Atk, but locks move selection.'
  },
  choice_scarf: {
    id: 'choice_scarf',
    name: 'Choice Scarf',
    type: 'Held Item',
    rarity: 'Epic',
    description: 'Boosts Speed, but locks move selection.'
  },
  leftovers: {
    id: 'leftovers',
    name: 'Leftovers',
    type: 'Held Item',
    rarity: 'Epic',
    description: 'Gradually restores HP every turn.'
  },

  fire_stone: {
    id: 'fire_stone',
    name: 'Fire Stone',
    type: 'evolution',
    rarity: 'Rare',
    description: 'A peculiar stone that can make certain species evolve.'
  },
  water_stone: {
    id: 'water_stone',
    name: 'Water Stone',
    type: 'evolution',
    rarity: 'Rare',
    description: 'A peculiar stone that can make certain species evolve.'
  },
  thunder_stone: {
    id: 'thunder_stone',
    name: 'Thunder Stone',
    type: 'evolution',
    rarity: 'Rare',
    description: 'A peculiar stone that can make certain species evolve.'
  },
  moon_stone: {
    id: 'moon_stone',
    name: 'Moon Stone',
    type: 'evolution',
    rarity: 'Rare',
    description: 'A peculiar stone that can make certain species evolve.'
  },
  dawn_stone: {
    id: 'dawn_stone',
    name: 'Dawn Stone',
    type: 'evolution',
    rarity: 'Rare',
    description: 'A peculiar stone that can make certain species evolve.'
  },
  dusk_stone: {
    id: 'dusk_stone',
    name: 'Dusk Stone',
    type: 'evolution',
    rarity: 'Rare',
    description: 'A peculiar stone that can make certain species evolve.'
  },
  shiny_stone: {
    id: 'shiny_stone',
    name: 'Shiny Stone',
    type: 'evolution',
    rarity: 'Rare',
    description: 'A peculiar stone that can make certain species evolve.'
  },

  tm_magical_leaf: {
    id: 'tm_magical_leaf',
    name: 'TM: Magical Leaf',
    type: 'TM',
    rarity: 'Uncommon',
    description: 'Teaches Magical Leaf to compatible Pokémon.'
  },
  tm_swift: {
    id: 'tm_swift',
    name: 'TM: Swift',
    type: 'TM',
    rarity: 'Uncommon',
    description: 'Teaches Swift to compatible Pokémon.'
  },
  tm_shadow_ball: {
    id: 'tm_shadow_ball',
    name: 'TM: Shadow Ball',
    type: 'TM',
    rarity: 'Rare',
    description: 'Teaches Shadow Ball to compatible Pokémon.'
  },
  tm_thunderbolt: {
    id: 'tm_thunderbolt',
    name: 'TM: Thunderbolt',
    type: 'TM',
    rarity: 'Rare',
    description: 'Teaches Thunderbolt to compatible Pokémon.'
  },
  tm_flamethrower: {
    id: 'tm_flamethrower',
    name: 'TM: Flamethrower',
    type: 'TM',
    rarity: 'Rare',
    description: 'Teaches Flamethrower to compatible Pokémon.'
  },
  tm_ice_beam: {
    id: 'tm_ice_beam',
    name: 'TM: Ice Beam',
    type: 'TM',
    rarity: 'Rare',
    description: 'Teaches Ice Beam to compatible Pokémon.'
  },
  tm_earthquake: {
    id: 'tm_earthquake',
    name: 'TM: Earthquake',
    type: 'TM',
    rarity: 'Epic',
    description: 'Teaches Earthquake to compatible Pokémon.'
  },
  tm_psychic: {
    id: 'tm_psychic',
    name: 'TM: Psychic',
    type: 'TM',
    rarity: 'Epic',
    description: 'Teaches Psychic to compatible Pokémon.'
  },
  tm_draco_meteor: {
    id: 'tm_draco_meteor',
    name: 'TM: Draco Meteor',
    type: 'TM',
    rarity: 'Legendary',
    description: 'Teaches Draco Meteor to compatible Pokémon.'
  },
  hm_surf: {
    id: 'hm_surf',
    name: 'HM: Surf',
    type: 'TM',
    rarity: 'Epic',
    description: 'Teaches Surf to compatible Pokémon.'
  },
  hm_fly: {
    id: 'hm_fly',
    name: 'HM: Fly',
    type: 'TM',
    rarity: 'Epic',
    description: 'Teaches Fly to compatible Pokémon.'
  },
  hm_strength: {
    id: 'hm_strength',
    name: 'HM: Strength',
    type: 'TM',
    rarity: 'Epic',
    description: 'Teaches Strength to compatible Pokémon.'
  },
};

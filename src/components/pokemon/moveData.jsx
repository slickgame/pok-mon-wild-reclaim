// Comprehensive move data including type, category, power, accuracy, PP, and descriptions
// Used for battle calculations, UI displays, and move compatibility checks
//
// ⚙️ CENTRAL MOVE REGISTRY - Single source of truth for all move data
// 
// Structure:
// {
//   name: string,
//   type: string,
//   category: 'Physical' | 'Special' | 'Status',
//   power: number (0 for status),
//   accuracy: number | null (null = never misses),
//   pp: number,
//   description: string,
//   effect?: string,
//   effectChance?: number,
//   signature?: boolean,
//   signatureFor?: string[] (roles that benefit),
//   tags?: string[] (eggMove, priority, multiHit, statusCure, terrainBoosted, etc),
//   synergy?: object
// }

import { caterpieMoves } from '@/components/zones/caterpieMoves';

const BASE_MOVE_DATA = {
  // Charmander's moves
  'Scratch': {
    type: 'Normal',
    category: 'Physical',
    power: 40,
    accuracy: 100,
    pp: 35,
    description: 'A basic claw attack.'
  },
  'Growl': {
    type: 'Normal',
    category: 'Status',
    power: 0,
    accuracy: 100,
    pp: 40,
    description: 'Lowers enemy Attack.',
    tags: ['Status', 'Debuff'],
    effect: 'lowerAttack'
  },
  'Ember': {
    type: 'Fire',
    category: 'Special',
    power: 40,
    accuracy: 100,
    pp: 25,
    description: 'May burn target.',
    effect: 'burn',
    effectChance: 10
  },
  'Flame Pulse': {
    type: 'Fire',
    category: 'Special',
    power: 50,
    accuracy: 100,
    pp: 15,
    description: '30% chance to Burn. Deals +30% damage if Role is Powerhouse. Guaranteed Burn if used after Growl.',
    signature: true,
    signatureFor: ['Powerhouse'],
    tags: ['signature', 'combo', 'burn'],
    effect: 'burn',
    effectChance: 30,
    synergy: {
      rolebonus: 'Powerhouse',
      roleDamageMultiplier: 1.3,
      comboMove: 'Growl',
      comboEffect: 'guaranteedBurn'
    }
  },
  'Smokescreen': {
    type: 'Normal',
    category: 'Status',
    power: 0,
    accuracy: 100,
    pp: 20,
    description: 'Lowers enemy Accuracy.',
    effect: 'lowerAccuracy'
  },
  'Dragon Rage': {
    type: 'Dragon',
    category: 'Special',
    power: 0,
    accuracy: 100,
    pp: 10,
    description: 'Always deals 40 damage.',
    fixedDamage: 40
  },
  'Flame Burst': {
    type: 'Fire',
    category: 'Special',
    power: 70,
    accuracy: 100,
    pp: 15,
    description: 'May burn surrounding targets.',
    effect: 'burn',
    effectChance: 10,
    aoe: true
  },
  'Slash': {
    type: 'Normal',
    category: 'Physical',
    power: 70,
    accuracy: 100,
    pp: 20,
    description: 'High critical hit ratio.',
    critRatio: 2
  },
  'Inferno': {
    type: 'Fire',
    category: 'Special',
    power: 100,
    accuracy: 50,
    pp: 5,
    description: 'Guaranteed Burn if it hits.',
    effect: 'burn',
    effectChance: 100
  },
  'Fire Spin': {
    type: 'Fire',
    category: 'Special',
    power: 35,
    accuracy: 85,
    pp: 15,
    description: 'Traps and damages for 4–5 turns.',
    effect: 'trap',
    trapDuration: [4, 5]
  },
  'Fire Fang': {
    type: 'Fire',
    category: 'Physical',
    power: 65,
    accuracy: 95,
    pp: 15,
    description: 'May cause Burn or flinch.',
    effect: 'burnOrFlinch',
    effectChance: 10
  },

  // Squirtle's moves
  'Bubble': {
    type: 'Water',
    category: 'Special',
    power: 40,
    accuracy: 100,
    pp: 30,
    description: 'May lower enemy Speed.',
    effect: 'lowerSpeed',
    effectChance: 10
  },
  'Shell Slam': {
    type: 'Water',
    category: 'Physical',
    power: 45,
    accuracy: 100,
    pp: 10,
    description: 'Hits twice if HP > 75%. 20% chance to lower enemy Attack.',
    signature: true,
    signatureFor: ['Juggernaut', 'Tank'],
    tags: ['signature', 'multiHit', 'statLower'],
    effect: 'lowerAttack',
    effectChance: 20,
    synergy: {
      rolebonus: 'Juggernaut',
      hpThreshold: 0.75,
      multiHit: 2,
      description: 'Hits twice when HP is above 75%'
    }
  },
  'Withdraw': {
    type: 'Water',
    category: 'Status',
    power: 0,
    accuracy: null,
    pp: 40,
    description: "Raises user's Defense.",
    effect: 'raiseDefense',
    stages: 1
  },
  'Water Gun': {
    type: 'Water',
    category: 'Special',
    power: 40,
    accuracy: 100,
    pp: 25,
    description: 'Basic ranged STAB.'
  },
  'Protect': {
    type: 'Normal',
    category: 'Status',
    power: 0,
    accuracy: null,
    pp: 10,
    description: 'Prevents all damage that turn.',
    tags: ['priority', 'protect'],
    effect: 'protect',
    priority: 4
  },
  'Paralysis Spore': {
    type: 'Grass',
    category: 'Status',
    power: 0,
    accuracy: 85,
    pp: 15,
    description: 'A specialized spore that paralyzes the target and lingers, slowing them for several turns.',
    signature: true,
    signatureFor: ['Status Inflicter / Drain Tank'],
    tags: ['Spore', 'Powder', 'Status', 'Debuff', 'Poison'],
    effects: {
      status: 'Paralysis',
      lingerEffect: {
        type: 'SpeedDropOverTime',
        amount: -1,
        duration: 3
      }
    }
  },
  'Aqua Ring': {
    type: 'Water',
    category: 'Status',
    power: 0,
    accuracy: null,
    pp: 20,
    description: 'Restores HP each turn.',
    tags: ['Healing', 'Passive'],
    effect: 'healOverTime',
    healAmount: 0.0625
  },
  'Bite': {
    type: 'Dark',
    category: 'Physical',
    power: 60,
    accuracy: 100,
    pp: 25,
    description: 'May cause flinch.',
    tags: ['flinch'],
    effect: 'flinch',
    effectChance: 30
  },
  'Surf': {
    type: 'Water',
    category: 'Special',
    power: 90,
    accuracy: 100,
    pp: 15,
    description: 'Hits all adjacent foes.',
    aoe: true
  },
  'Iron Defense': {
    type: 'Steel',
    category: 'Status',
    power: 0,
    accuracy: null,
    pp: 15,
    description: "Sharply raises user's Defense.",
    effect: 'raiseDefense',
    stages: 2
  },

  // Bulbasaur's moves
  'Leech Seed': {
    type: 'Grass',
    category: 'Status',
    power: 0,
    accuracy: 90,
    pp: 10,
    description: 'Seeds foe to sap HP each turn.',
    tags: ['Drain', 'Passive', 'Multi-Turn', 'Grass'],
    effect: 'leechSeed',
    drainPercentage: 0.125
  },
  'Absorb': {
    type: 'Grass',
    category: 'Special',
    power: 20,
    accuracy: 100,
    pp: 25,
    description: 'A nutrient-draining attack.',
    tags: ['Drain', 'Healing', 'Grass'],
    effect: 'drain',
    drainPercentage: 0.5
  },
  'Mega Drain': {
    type: 'Grass',
    category: 'Special',
    power: 40,
    accuracy: 100,
    pp: 15,
    description: 'A stronger drain attack.',
    tags: ['Drain', 'Healing', 'Grass'],
    effect: 'drain',
    drainPercentage: 0.5
  },
  'Growth': {
    type: 'Normal',
    category: 'Status',
    power: 0,
    accuracy: null,
    pp: 20,
    description: 'The user’s Special Attack is raised.',
    tags: ['Buff', 'Status']
  },
  'Moonlight': {
    type: 'Fairy',
    category: 'Status',
    power: 0,
    accuracy: null,
    pp: 5,
    description: 'Restores the user’s HP. Healing varies with the weather.',
    tags: ['Healing'],
    effect: 'healSelf',
    healPercentage: 0.5,
    weatherMultipliers: {
      Sunny: 0.66,
      Rain: 0.25
    }
  },
  'Venoshock': {
    type: 'Poison',
    category: 'Special',
    power: 65,
    accuracy: 100,
    pp: 10,
    description: 'Deals more damage if the target is poisoned.',
    tags: ['Debuff', 'Poison']
  },
  'Toxic Spores': {
    type: 'Poison',
    category: 'Status',
    power: 0,
    accuracy: 85,
    pp: 10,
    description: 'Laces the field with toxic spores.',
    tags: ['Spore', 'Powder', 'Status', 'Debuff', 'Multi-Turn', 'Poison'],
    effect: 'statusField',
    statusField: 'ToxicSpread'
  },
  'Acid': {
    type: 'Poison',
    category: 'Special',
    power: 40,
    accuracy: 100,
    pp: 30,
    description: 'Sprays a hide-melting acid. May lower target’s Defense.',
    tags: ['Poison', 'Debuff'],
    effect: 'lowerDefense',
    effectChance: 30
  },
  'Sap Bind': {
    type: 'Grass',
    category: 'Special',
    power: 35,
    accuracy: 100,
    pp: 10,
    description: 'Drains 25% of damage to all allies. Doubled if user is Medic Role.',
    signature: true,
    signatureFor: ['Medic', 'Support'],
    tags: ['signature', 'healing', 'support'],
    effect: 'healAllies',
    healPercentage: 0.25,
    synergy: {
      rolebonus: 'Medic',
      roleHealMultiplier: 2,
      description: 'Healing doubled when used by Medic role'
    }
  },
  'Vine Whip': {
    type: 'Grass',
    category: 'Physical',
    power: 45,
    accuracy: 100,
    pp: 25,
    description: 'Whips target with vines.'
  },
  'Sleep Powder': {
    type: 'Grass',
    category: 'Status',
    power: 0,
    accuracy: 75,
    pp: 15,
    description: 'Scatters a cloud of sleep-inducing dust around the target.',
    tags: ['Spore', 'Powder', 'Status', 'Debuff', 'Poison'],
    effect: 'sleep',
    effectDetails: {
      type: 'ApplyStatus',
      status: 'Sleep',
      chance: 100
    }
  },
  'Synthesis': {
    type: 'Grass',
    category: 'Status',
    power: 0,
    accuracy: null,
    pp: 5,
    description: "Heals user's HP.",
    effect: 'healSelf',
    healPercentage: 0.5
  },
  'Poison Powder': {
    type: 'Poison',
    category: 'Status',
    power: 0,
    accuracy: 75,
    pp: 35,
    description: 'A cloud of toxic dust is scattered around the target.',
    tags: ['Spore', 'Powder', 'Status', 'Debuff', 'Grass'],
    effect: 'poison',
    effectDetails: {
      type: 'ApplyStatus',
      status: 'Poison',
      chance: 100
    }
  },
  'Harden': {
    type: 'Normal',
    category: 'Status',
    power: 0,
    accuracy: null,
    pp: 30,
    description: "The user stiffens its muscles to boost its Defense stat.",
    tags: ['Buff', 'Status'],
    effect: 'raiseDefense',
    stages: 1,
    effectDetails: {
      type: 'StatBoost',
      target: 'Self',
      stat: 'Defense',
      stages: 1
    }
  },
  'Confusion': {
    type: 'Psychic',
    category: 'Special',
    power: 50,
    accuracy: 100,
    pp: 25,
    description: 'A telekinetic attack that may also leave the target confused.',
    tags: ['Debuff'],
    effect: 'confuse',
    effectChance: 10,
    effectDetails: {
      type: 'ChanceStatus',
      status: 'Confused',
      chance: 10
    }
  },
  'Psybeam': {
    type: 'Psychic',
    category: 'Special',
    power: 65,
    accuracy: 100,
    pp: 20,
    description: 'A peculiar ray that may confuse the target.',
    tags: ['Debuff'],
    effect: 'confuse',
    effectChance: 10
  },
  'Stun Spore': {
    type: 'Grass',
    category: 'Status',
    power: 0,
    accuracy: 75,
    pp: 30,
    description: 'Scatters a powder that may paralyze the target.',
    tags: ['Spore', 'Powder', 'Status', 'Debuff', 'Grass'],
    effect: 'paralyze',
    effectChance: 100,
    effectDetails: {
      type: 'ApplyStatus',
      status: 'Paralysis',
      chance: 100
    }
  },
  'Bug Buzz': {
    type: 'Bug',
    category: 'Special',
    power: 90,
    accuracy: 100,
    pp: 10,
    description: 'Generates a damaging sound wave that may reduce Sp. Def.',
    tags: ['Debuff'],
    effect: 'lowerSpDef',
    effectChance: 10,
    effectDetails: {
      type: 'ChanceStatDrop',
      target: 'Target',
      stat: 'Sp. Def',
      stages: 1,
      chance: 10
    }
  },
  'Quiver Dance': {
    type: 'Bug',
    category: 'Status',
    power: 0,
    accuracy: null,
    pp: 20,
    description: 'A mystical dance that boosts Sp. Atk, Sp. Def, and Speed.',
    tags: ['Buff', 'Status'],
    effect: 'boostMultiple',
    effectDetails: {
      type: 'StatBoostMulti',
      target: 'Self',
      stats: {
        'Sp. Atk': 1,
        'Sp. Def': 1,
        Speed: 1
      }
    }
  },
  'Pollen Puff': {
    type: 'Bug',
    category: 'Special',
    power: 90,
    accuracy: 100,
    pp: 10,
    description: 'May damage a foe or heal an ally based on target.',
    tags: ['Healing', 'Support'],
    effect: 'conditional',
    effectDetails: {
      type: 'ConditionalEffect',
      conditions: [
        {
          condition: 'TargetIsAlly',
          result: {
            type: 'Heal',
            amount: 0.5
          }
        },
        {
          condition: 'TargetIsEnemy',
          result: {
            type: 'Damage'
          }
        }
      ]
    }
  },
  'Hurricane': {
    type: 'Flying',
    category: 'Special',
    power: 110,
    accuracy: 70,
    pp: 10,
    description: 'A powerful storm that may confuse the target.',
    tags: ['Debuff', 'Status', 'Flying'],
    effect: 'confuse',
    effectChance: 30,
    effectDetails: {
      type: 'ChanceStatus',
      status: 'Confused',
      chance: 30
    }
  },
  'Magical Leaf': {
    type: 'Grass',
    category: 'Special',
    power: 60,
    accuracy: null,
    pp: 20,
    description: 'Always hits.',
    neverMiss: true
  },
  'Aromatherapy': {
    type: 'Grass',
    category: 'Status',
    power: 0,
    accuracy: null,
    pp: 5,
    description: 'Heals all status problems for the user\'s party.',
    tags: ['Healing', 'Cleanse', 'Support', 'Grass'],
    effect: 'cureAllStatuses',
    effectDetails: {
      type: 'CureAllStatuses',
      target: 'Team'
    }
  },
  'Heal Bell': {
    type: 'Normal',
    category: 'Status',
    power: 0,
    accuracy: null,
    pp: 5,
    description: 'The user makes a soothing bell chime to heal all allies\' status problems.',
    tags: ['Healing', 'Cleanse', 'Support'],
    effect: 'cureAllStatuses',
    effectDetails: {
      type: 'CureAllStatuses',
      target: 'Team'
    }
  },
  'Giga Drain': {
    type: 'Grass',
    category: 'Special',
    power: 75,
    accuracy: 100,
    pp: 10,
    description: 'Deals damage and heals for 50% of it.',
    tags: ['Drain', 'Healing', 'Grass'],
    effect: 'drain',
    drainPercentage: 0.5
  },

  // Charmeleon's additional moves
  'Dragon Breath': {
    type: 'Dragon',
    category: 'Special',
    power: 60,
    accuracy: 100,
    pp: 20,
    description: '30% chance to paralyze.',
    effect: 'paralyze',
    effectChance: 30
  },
  'Flamethrower': {
    type: 'Fire',
    category: 'Special',
    power: 90,
    accuracy: 100,
    pp: 15,
    description: 'Powerful STAB.',
    effect: 'burn',
    effectChance: 10
  },
  'Scary Face': {
    type: 'Normal',
    category: 'Status',
    power: 0,
    accuracy: 100,
    pp: 10,
    description: 'Sharply lowers Speed.',
    effect: 'lowerSpeed',
    stages: 2
  },
  'Fire Blast': {
    type: 'Fire',
    category: 'Special',
    power: 110,
    accuracy: 85,
    pp: 5,
    description: 'Very strong STAB.',
    effect: 'burn',
    effectChance: 10
  },
  'Flare Blitz': {
    type: 'Fire',
    category: 'Physical',
    power: 120,
    accuracy: 100,
    pp: 15,
    description: 'Recoil damage.',
    effect: 'recoil',
    recoilPercentage: 0.33
  },
  
  // Charizard's signature move
  'Infernal Cyclone': {
    type: 'Fire',
    category: 'Special',
    power: 90,
    accuracy: 95,
    pp: 10,
    description: 'Hits all enemies. 30% Burn. If Sunny, +25% damage. Bonus turn if KO achieved.',
    signature: true,
    signatureFor: ['Striker', 'Scout'],
    tags: ['signature', 'aoe', 'weather'],
    effect: 'burn',
    effectChance: 30,
    aoe: true,
    synergy: {
      rolebonus: 'Striker',
      damageMultiplier: 1.25,
      weatherBonus: 'sunny',
      additionalEffect: 'bonusTurnOnKO'
    }
  },

  // Wartortle's additional moves
  'Rapid Spin': {
    type: 'Normal',
    category: 'Physical',
    power: 50,
    accuracy: 100,
    pp: 40,
    description: 'Removes hazards.',
    effect: 'removeHazards'
  },
  'Water Pulse': {
    type: 'Water',
    category: 'Special',
    power: 60,
    accuracy: 100,
    pp: 20,
    description: 'May confuse.',
    effect: 'confuse',
    effectChance: 20
  },
  'Aqua Tail': {
    type: 'Water',
    category: 'Physical',
    power: 90,
    accuracy: 90,
    pp: 10,
    description: 'Strong STAB.'
  },
  'Crunch': {
    type: 'Dark',
    category: 'Physical',
    power: 80,
    accuracy: 100,
    pp: 15,
    description: 'May lower Defense.',
    effect: 'lowerDefense',
    effectChance: 20
  },
  'Muddy Water': {
    type: 'Water',
    category: 'Special',
    power: 90,
    accuracy: 85,
    pp: 10,
    description: 'Hits all, may lower accuracy.',
    aoe: true,
    effect: 'lowerAccuracy',
    effectChance: 30
  },
  'Hydro Pump': {
    type: 'Water',
    category: 'Special',
    power: 110,
    accuracy: 80,
    pp: 5,
    description: 'Big damage.'
  },
  
  // Blastoise's signature move
  'Shell Fortress': {
    type: 'Water',
    category: 'Physical',
    power: 60,
    accuracy: 100,
    pp: 10,
    description: 'Reflects 50% of damage back next turn. Raises Defense +1. Enhanced defense vs critical hits.',
    signature: true,
    signatureFor: ['Tank', 'Juggernaut'],
    tags: ['signature', 'reflect', 'defensive'],
    effect: 'raiseDefense',
    effectChance: 100,
    stages: 1,
    synergy: {
      rolebonus: 'Tank',
      damageMultiplier: 1.3,
      additionalEffect: 'reflect50Percent',
      critResistance: true
    }
  },

  // Ivysaur's additional moves
  'Sweet Scent': {
    type: 'Normal',
    category: 'Status',
    power: 0,
    accuracy: 100,
    pp: 20,
    description: 'Lowers enemy evasion.',
    effect: 'lowerEvasion',
    stages: 1
  },
  'Seed Bomb': {
    type: 'Grass',
    category: 'Physical',
    power: 80,
    accuracy: 100,
    pp: 15,
    description: 'Reliable STAB.'
  },
  'Heal Pulse': {
    type: 'Psychic',
    category: 'Status',
    power: 0,
    accuracy: null,
    pp: 10,
    description: 'Heals target for 50% HP.',
    tags: ['Healing', 'Support'],
    effect: 'healTarget',
    healPercentage: 0.5
  },
  'Energy Ball': {
    type: 'Grass',
    category: 'Special',
    power: 90,
    accuracy: 100,
    pp: 10,
    description: 'Chance to lower Sp. Def.',
    effect: 'lowerSpDef',
    effectChance: 10
  },
  'Toxic': {
    type: 'Poison',
    category: 'Status',
    power: 0,
    accuracy: 90,
    pp: 10,
    description: 'Badly poisons foe.',
    tags: ['Debuff', 'Status', 'Flying'],
    effect: 'badlyPoison'
  },
  'Grassy Terrain': {
    type: 'Grass',
    category: 'Status',
    power: 0,
    accuracy: null,
    pp: 10,
    description: 'Heals grass types & boosts moves.',
    tags: ['Terrain', 'Support', 'Healing', 'Grass'],
    effect: 'setTerrain',
    terrain: 'grassy'
  },
  'Petal Dance': {
    type: 'Grass',
    category: 'Special',
    power: 120,
    accuracy: 100,
    pp: 10,
    description: '2–3 turns; confusion after.',
    tags: ['Multi-Turn', 'Grass'],
    effect: 'confuseAfter',
    lockTurns: [2, 3]
  },
  
  // Venusaur's signature move
  'Verdant Sanctuary': {
    type: 'Grass',
    category: 'Status',
    power: 0,
    accuracy: 100,
    pp: 5,
    description: 'Creates field that heals all allies 10% HP/turn for 3 turns. Status cleared. Allies get +1 SPDEF.',
    signature: true,
    signatureFor: ['Medic', 'Support'],
    tags: ['signature', 'terrain', 'healing', 'support'],
    effect: 'setTerrain',
    terrain: 'verdant',
    duration: 3,
    synergy: {
      rolebonus: 'Medic',
      healingMultiplier: 1.5,
      additionalEffect: 'clearStatus',
      statBoost: {
        spDef: 1
      }
    }
  },

  // Additional TM/HM and Tutor Moves
  'Will-O-Wisp': {
    type: 'Fire',
    category: 'Status',
    power: 0,
    accuracy: 85,
    pp: 15,
    description: 'Burns the opponent.',
    effect: 'burn'
  },
  'Sunny Day': {
    type: 'Fire',
    category: 'Status',
    power: 0,
    accuracy: null,
    pp: 5,
    description: 'Boosts fire, weakens water for 5 turns.',
    effect: 'weather',
    weather: 'sun',
    duration: 5
  },
  'Rain Dance': {
    type: 'Water',
    category: 'Status',
    power: 0,
    accuracy: null,
    pp: 5,
    description: 'Boosts water-type moves, activates healing synergy.',
    effect: 'weather',
    weather: 'rain',
    duration: 5
  },
  'Aerial Ace': {
    type: 'Flying',
    category: 'Physical',
    power: 60,
    accuracy: null,
    pp: 20,
    description: 'Never misses.',
    tags: ['Flying', 'Physical'],
    neverMiss: true
  },
  'Shadow Claw': {
    type: 'Ghost',
    category: 'Physical',
    power: 70,
    accuracy: 100,
    pp: 15,
    description: 'High crit chance.',
    critRate: 2
  },
  'Brick Break': {
    type: 'Fighting',
    category: 'Physical',
    power: 75,
    accuracy: 100,
    pp: 15,
    description: 'Breaks barriers like Light Screen, Reflect.',
    effect: 'breakScreens'
  },
  'Sludge Bomb': {
    type: 'Poison',
    category: 'Special',
    power: 90,
    accuracy: 100,
    pp: 10,
    description: 'May poison target.',
    tags: ['Debuff', 'Poison'],
    effect: 'poison',
    effectChance: 30
  },
  'Gloom Burst': {
    type: 'Poison',
    category: 'Special',
    power: 110,
    accuracy: 85,
    pp: 5,
    description: 'A violent blast of toxic pollen. Lowers the user’s Sp. Atk.',
    tags: ['Poison', 'Debuff'],
    effect: 'lowerSelfSpAtk',
    effectChance: 100
  },
  'Light Screen': {
    type: 'Psychic',
    category: 'Status',
    power: 0,
    accuracy: null,
    pp: 30,
    description: 'Halves special damage for 5 turns.',
    effect: 'setScreen',
    screen: 'lightScreen',
    duration: 5
  },
  'Reflect': {
    type: 'Psychic',
    category: 'Status',
    power: 0,
    accuracy: null,
    pp: 20,
    description: 'Halves physical damage for 5 turns.',
    effect: 'setScreen',
    screen: 'reflect',
    duration: 5
  },
  'Heat Wave': {
    type: 'Fire',
    category: 'Special',
    power: 95,
    accuracy: 90,
    pp: 10,
    description: 'Hits all foes, may burn.',
    aoe: true,
    effect: 'burn',
    effectChance: 10
  },
  'Blast Burn': {
    type: 'Fire',
    category: 'Special',
    power: 150,
    accuracy: 90,
    pp: 5,
    description: 'Very strong fire move. Must recharge next turn.',
    tags: ['ultimate', 'recharge'],
    effect: 'recharge'
  },
  'Air Slash': {
    type: 'Flying',
    category: 'Special',
    power: 75,
    accuracy: 95,
    pp: 15,
    description: 'May cause flinch.',
    tags: ['Flying', 'Debuff'],
    effect: 'flinch',
    effectChance: 30
  },
  'Hurricane': {
    type: 'Flying',
    category: 'Special',
    power: 110,
    accuracy: 70,
    pp: 10,
    description: 'A fierce wind buffets the target. May cause confusion.',
    tags: ['Status', 'Debuff', 'Poison'],
    effect: 'confuse',
    effectChance: 30
  },
  'Dragon Claw': {
    type: 'Dragon',
    category: 'Physical',
    power: 80,
    accuracy: 100,
    pp: 15,
    description: 'Powerful dragon attack.'
  },
  'Zen Headbutt': {
    type: 'Psychic',
    category: 'Physical',
    power: 80,
    accuracy: 90,
    pp: 15,
    description: 'May cause flinch.',
    effect: 'flinch',
    effectChance: 20
  },
  'Hydro Cannon': {
    type: 'Water',
    category: 'Special',
    power: 150,
    accuracy: 90,
    pp: 5,
    description: 'Ultimate move. Requires recharge.',
    tags: ['ultimate', 'recharge'],
    effect: 'recharge'
  },
  'Skull Bash': {
    type: 'Normal',
    category: 'Physical',
    power: 130,
    accuracy: 100,
    pp: 10,
    description: 'Raises Defense, then attacks next turn.',
    effect: 'raiseDefenseAndCharge'
  },
  'Flash Cannon': {
    type: 'Steel',
    category: 'Special',
    power: 80,
    accuracy: 100,
    pp: 10,
    description: 'May lower Sp. Def.',
    effect: 'lowerSpDef',
    effectChance: 10
  },
  'Ice Beam': {
    type: 'Ice',
    category: 'Special',
    power: 90,
    accuracy: 100,
    pp: 10,
    description: 'May freeze target.',
    effect: 'freeze',
    effectChance: 10
  },
  'Grass Pledge': {
    type: 'Grass',
    category: 'Special',
    power: 80,
    accuracy: 100,
    pp: 10,
    description: 'Combo move if used with Fire/Water Pledge.',
    effect: 'pledge'
  },
  'Frenzy Plant': {
    type: 'Grass',
    category: 'Special',
    power: 150,
    accuracy: 90,
    pp: 5,
    description: 'Ultimate move. Requires recharge.',
    tags: ['ultimate', 'recharge'],
    effect: 'recharge'
  },
  'Petal Blizzard': {
    type: 'Grass',
    category: 'Physical',
    power: 90,
    accuracy: 100,
    pp: 15,
    description: 'Hits all adjacent targets.',
    aoe: true
  },
  'Solar Beam': {
    type: 'Grass',
    category: 'Special',
    power: 120,
    accuracy: 100,
    pp: 10,
    description: 'Charges one turn, attacks next.',
    effect: 'charge'
  },
  'Earthquake': {
    type: 'Ground',
    category: 'Physical',
    power: 100,
    accuracy: 100,
    pp: 10,
    description: 'Powerful ground attack.',
    aoe: true
  },

  // Egg Moves - Charmander line
  'Dragon Dance': {
    type: 'Dragon',
    category: 'Status',
    power: 0,
    accuracy: null,
    pp: 20,
    description: 'Boosts Attack and Speed.',
    tags: ['eggMove', 'statBoost', 'setup'],
    effect: 'multiBoost',
    boosts: {
      attack: 1,
      speed: 1
    }
  },
  'Bite': {
    type: 'Dark',
    category: 'Physical',
    power: 60,
    accuracy: 100,
    pp: 25,
    description: 'May flinch target.',
    tags: ['eggMove', 'flinch'],
    effect: 'flinch',
    effectChance: 30
  },
  'Metal Claw': {
    type: 'Steel',
    category: 'Physical',
    power: 50,
    accuracy: 95,
    pp: 35,
    description: 'May raise Attack.',
    tags: ['eggMove', 'statBoost'],
    effect: 'raiseAttack',
    effectChance: 10
  },

  // Egg Moves - Squirtle line
  'Mirror Coat': {
    type: 'Psychic',
    category: 'Special',
    power: 0,
    accuracy: 100,
    pp: 20,
    description: 'Reflects special attacks back.',
    tags: ['eggMove', 'counterMove', 'priority'],
    effect: 'mirrorCoat',
    priority: -5
  },
  'Mud Sport': {
    type: 'Ground',
    category: 'Status',
    power: 0,
    accuracy: null,
    pp: 15,
    description: 'Reduces Electric-type move power.',
    tags: ['eggMove', 'fieldEffect'],
    effect: 'mudSport',
    duration: 5
  },
  'Aqua Jet': {
    type: 'Water',
    category: 'Physical',
    power: 40,
    accuracy: 100,
    pp: 20,
    description: 'Priority move (goes first).',
    tags: ['eggMove', 'priority'],
    priority: 1
  },

  // Egg Moves - Bulbasaur line
  'Amnesia': {
    type: 'Psychic',
    category: 'Status',
    power: 0,
    accuracy: null,
    pp: 20,
    description: 'Sharply raises Sp. Def.',
    tags: ['eggMove', 'statBoost', 'setup'],
    effect: 'raiseSpDef',
    stages: 2
  },
  'Ingrain': {
    type: 'Grass',
    category: 'Status',
    power: 0,
    accuracy: null,
    pp: 20,
    description: 'Plants roots to recover HP.',
    tags: ['eggMove', 'healing', 'passive'],
    effect: 'ingrain',
    healPercentage: 0.0625
  },
  'Nature Power': {
    type: 'Normal',
    category: 'Varies',
    power: 0,
    accuracy: null,
    pp: 20,
    description: 'Converts to another move depending on terrain.',
    tags: ['eggMove', 'terrainBoosted', 'versatile'],
    effect: 'naturePower'
  },

  // Common moves
  'Tackle': {
    type: 'Normal',
    category: 'Physical',
    power: 40,
    accuracy: 100,
    pp: 35,
    description: 'A full-body charge attack.',
    tags: []
  },
  'Sand Attack': {
    type: 'Ground',
    category: 'Status',
    power: 0,
    accuracy: 100,
    pp: 15,
    description: 'Reduces the target’s Accuracy by throwing sand.',
    tags: ['Status', 'Debuff']
  },
  'Feather Guard': {
    type: 'Flying',
    category: 'Status',
    power: 0,
    accuracy: 100,
    pp: 20,
    description: 'Fluffs feathers to raise Defense by one stage.',
    tags: ['Buff', 'Status', 'Flying'],
    effect: {
      selfStatChange: {
        Defense: 1
      }
    }
  },
  'Wing Slap': {
    type: 'Flying',
    category: 'Physical',
    power: 50,
    accuracy: 95,
    pp: 25,
    description: 'Strikes the target with wide-spread wings.',
    tags: ['Flying', 'Physical']
  },
  'Tailwind Gust': {
    type: 'Flying',
    category: 'Status',
    power: 0,
    accuracy: 100,
    pp: 15,
    description: 'Whips up a tailwind that boosts the Speed of all allies for 4 turns.',
    tags: ['Support', 'Buff', 'Flying'],
    effect: {
      teamSpeedBoost: true,
      duration: 4
    }
  },
  'Sky Dive': {
    type: 'Flying',
    category: 'Physical',
    power: 90,
    accuracy: 95,
    pp: 10,
    description: 'The user flies up and strikes the target on the next turn.',
    tags: ['Flying', 'Physical', 'Multi-Turn'],
    effect: 'chargeAttack',
    chargeTurns: 1
  },
  'Twister': {
    type: 'Dragon',
    category: 'Special',
    power: 40,
    accuracy: 100,
    pp: 20,
    description: 'Whips up a vicious twister. May cause flinching.',
    tags: ['Debuff'],
    effect: 'flinch',
    effectChance: 20
  },
  'String Shot': {
    type: 'Bug',
    category: 'Status',
    power: 0,
    accuracy: 95,
    pp: 40,
    description: 'The opposing Pokémon are bound with silk blown from the user\'s mouth that harshly lowers their Speed.',
    tags: ['Status', 'Debuff'],
    effect: {
      targetStatChange: {
        Speed: -2
      }
    }
  },
  'Bug Bite': {
    type: 'Bug',
    category: 'Physical',
    power: 60,
    accuracy: 100,
    pp: 25,
    description: 'The user bites the target. If the target is holding a Berry, the user eats it and gains its effect.',
    tags: ['Consume', 'Berry'],
    effect: {
      stealBerry: true
    }
  },
  'Sticky Thread': {
    type: 'Bug',
    category: 'Status',
    power: 0,
    accuracy: 90,
    pp: 15,
    description: 'The user releases an extremely adhesive thread. It harshly lowers the target\'s Speed and slightly lowers their Accuracy.',
    tags: ['Status', 'Debuff'],
    effect: {
      targetStatChange: {
        Speed: -2,
        Accuracy: -1
      }
    },
    signature: true,
    signatureFor: ['Status Inflictor']
  },
  'Infestation': {
    type: 'Bug',
    category: 'Special',
    power: 20,
    accuracy: 100,
    pp: 20,
    description: 'The target is infested and trapped for 4 turns. It takes damage over time and cannot switch out.',
    tags: ['Passive', 'Multi-Turn', 'Debuff'],
    effect: {
      trap: true,
      duration: 4
    }
  },
  'Camouflage': {
    type: 'Normal',
    category: 'Status',
    power: 0,
    accuracy: null,
    pp: 20,
    description: 'The user\'s type changes depending on the terrain.',
    tags: ['Status'],
    effect: {
      changeTypeByTerrain: true
    }
  },
  'Skitter Smack': {
    type: 'Bug',
    category: 'Physical',
    power: 70,
    accuracy: 90,
    pp: 10,
    description: 'The user skitters behind the target to attack. This also lowers the target\'s Sp. Atk stat.',
    tags: ['Debuff', 'Physical'],
    effect: {
      targetStatChange: {
        SpAttack: -1
      }
    }
  },
  'Whirlwind': {
    type: 'Normal',
    category: 'Status',
    power: 0,
    accuracy: null,
    pp: 20,
    priority: -6,
    description: 'The user blows away the target, ending wild battles or switching out.',
    tags: ['Status', 'Debuff'],
    effect: 'forceSwitch',
    effectDetails: {
      type: 'ForceSwitch',
      condition: 'TargetIsEnemy'
    }
  },
  'Gust': {
    type: 'Flying',
    category: 'Special',
    power: 40,
    accuracy: 100,
    pp: 35,
    description: 'Whips up a gust of wind to strike the target.',
    tags: ['Flying']
  },
  'Air Cutter': {
    type: 'Flying',
    category: 'Special',
    power: 60,
    accuracy: 95,
    pp: 25,
    description: 'Hurls a blade of air. High critical-hit ratio.',
    tags: ['Flying'],
    effect: 'criticalBoost',
    effectDetails: {
      type: 'CriticalBoost',
      multiplier: 2
    }
  },
  'Silver Wind': {
    type: 'Bug',
    category: 'Special',
    power: 60,
    accuracy: 100,
    pp: 5,
    description: 'A powdery wind that may raise all stats.',
    tags: ['Buff'],
    effect: 'raiseAllStats',
    effectChance: 10,
    effectDetails: {
      type: 'ChanceStatBoostMulti',
      chance: 10,
      stats: {
        Attack: 1,
        Defense: 1,
        'Sp. Atk': 1,
        'Sp. Def': 1,
        Speed: 1
      }
    }
  },
  'Safeguard': {
    type: 'Normal',
    category: 'Status',
    power: 0,
    accuracy: null,
    pp: 25,
    description: 'Creates a barrier that prevents status conditions for 5 turns.',
    tags: ['Cleanse', 'Support'],
    effect: 'safeguard',
    effectDetails: {
      type: 'ApplyFieldStatus',
      status: 'Safeguard',
      duration: 5,
      team: 'Ally'
    }
  },
  'Tailwind': {
    type: 'Flying',
    category: 'Status',
    power: 0,
    accuracy: null,
    pp: 15,
    description: 'Boosts the Speed of allies for 4 turns.',
    tags: ['Terrain', 'Support', 'Flying'],
    effect: 'tailwind',
    effectDetails: {
      type: 'ApplyFieldBuff',
      stat: 'Speed',
      multiplier: 2.0,
      duration: 4,
      team: 'Ally'
    }
  },
  'Feather Dance': {
    type: 'Flying',
    category: 'Status',
    power: 0,
    accuracy: 100,
    pp: 15,
    description: 'Lowers the target\'s Attack by two stages.',
    tags: ['Status', 'Debuff', 'Flying'],
    effect: 'lowerAttack',
    stages: 2
  },
  'Roost': {
    type: 'Flying',
    category: 'Status',
    power: 0,
    accuracy: null,
    pp: 10,
    description: 'Restores the user\'s HP.',
    tags: ['Healing', 'Flying'],
    effect: 'healSelf',
    healPercentage: 0.5
  },
  'Sky Attack': {
    type: 'Flying',
    category: 'Physical',
    power: 140,
    accuracy: 90,
    pp: 5,
    description: 'Charges on the first turn, then strikes on the next.',
    tags: [],
    effect: 'chargeAttack',
    chargeTurns: 1
  },
  'Rage Powder': {
    type: 'Bug',
    category: 'Status',
    power: 0,
    accuracy: null,
    pp: 20,
    priority: 2,
    description: 'Draws attention to itself, redirecting single-target moves.',
    tags: ['Support', 'Status'],
    effect: 'redirect',
    effectDetails: {
      type: 'ApplyStatus',
      status: 'TauntTargeting',
      duration: 1,
      target: 'Self'
    }
  },
  'Mirror Move': {
    type: 'Flying',
    category: 'Status',
    power: 0,
    accuracy: null,
    pp: 20,
    description: 'Counters the target with the move it last used.',
    tags: ['Status'],
    effect: 'copyLastMove',
    effectDetails: {
      type: 'CopyLastMove',
      target: 'LastEnemy'
    }
  },
  'Dream Eater': {
    type: 'Psychic',
    category: 'Special',
    power: 100,
    accuracy: 100,
    pp: 15,
    description: 'Steals HP from a sleeping target.',
    tags: ['Drain', 'Healing'],
    effect: 'conditionalDrain',
    effectDetails: {
      type: 'ConditionalEffect',
      condition: 'TargetStatus == Sleep',
      result: {
        type: 'DrainHP',
        percentage: 0.5
      }
    }
  },
  'Silk Bomb': {
    type: 'Bug',
    category: 'Special',
    power: 60,
    accuracy: 95,
    pp: 15,
    description: 'The user fires a compressed silk projectile. May paralyze the target.',
    effect: {
      statusChance: {
        type: 'paralyze',
        chance: 0.2
      }
    }
  },
  'Echo Thread': {
    type: 'Bug',
    category: 'Status',
    power: 0,
    accuracy: null,
    pp: 5,
    description: 'The user repeats the target\'s stat changes from the previous turn.',
    tags: ['Status'],
    effect: {
      copyLastStatChanges: true
    }
  },
  'Cocoon Shield': {
    type: 'Bug',
    category: 'Status',
    power: 0,
    accuracy: null,
    pp: 10,
    description: 'The user hardens its shell to boost its Defense and Special Defense. Can stack up to 3 times.',
    effect: {
      selfStatChange: {
        Defense: 1,
        SpDefense: 1
      },
      maxStacks: 3
    }
  },
  'Tail Whip': {
    type: 'Normal',
    category: 'Status',
    power: 0,
    accuracy: 100,
    pp: 30,
    description: 'Lowers enemy Defense.',
    effect: 'lowerDefense'
  },
  'Quick Attack': {
    type: 'Normal',
    category: 'Physical',
    power: 40,
    accuracy: 100,
    pp: 30,
    description: 'Always strikes first.',
    tags: ['Priority', 'Physical'],
    priority: 1
  },
  'Agility': {
    type: 'Psychic',
    category: 'Status',
    power: 0,
    accuracy: null,
    pp: 30,
    description: 'Relaxes the body to sharply raise Speed.',
    tags: ['Buff', 'Status'],
    effect: 'raiseSpeed',
    stages: 2
  },

  // Add more moves as needed
};

const MOVE_TAGS = {
  // 🌿 Grass
  Absorb: ['Healing', 'Drain', 'Special'],
  'Stun Spore': ['Spore', 'Debuff', 'Status'],
  'Sleep Powder': ['Spore', 'Status', 'Sleep'],
  'Poison Powder': ['Spore', 'Status', 'Poison'],
  'Leech Seed': ['Passive', 'Drain', 'Field'],
  Aromatherapy: ['Healing', 'StatusCure'],
  'Giga Drain': ['Healing', 'Drain', 'Special'],
  'Petal Dance': ['Multi-Turn', 'Special'],
  'Razor Leaf': ['Crit', 'Physical'],
  'Solar Beam': ['Charge', 'Special'],
  'Grassy Terrain': ['Terrain', 'Healing', 'Status'],

  // 🐛 Bug
  'Bug Bite': ['Consume', 'Berry', 'Physical'],
  Infestation: ['Passive', 'Multi-Turn', 'Trap'],
  'Sticky Web': ['Field', 'Debuff', 'Speed'],
  'String Shot': ['Debuff', 'Speed', 'Status'],
  'Struggle Bug': ['Debuff', 'SpecialAtk'],
  'Silver Wind': ['Buff', 'Multi-Hit', 'Special'],

  // ⚡ Electric
  'Thunder Wave': ['Status', 'Paralyze'],
  Thunderbolt: ['Special', 'Paralyze'],
  Spark: ['Physical', 'Paralyze'],
  'Charge Beam': ['Special', 'Buff'],

  // 🕊️ Flying
  Gust: ['Special'],
  'Wing Attack': ['Physical'],
  'Air Cutter': ['Special', 'Crit'],
  'Aerial Ace': ['NeverMiss', 'Physical'],

  // 🧠 Psychic / Status
  'Calm Mind': ['Buff', 'SpecialAtk', 'SpecialDef'],
  Confusion: ['Special', 'Confuse'],
  Psychic: ['Special', 'Debuff', 'SpecialDef'],
  Reflect: ['Field', 'Defense', 'Status'],
  'Light Screen': ['Field', 'SpecialDef', 'Status'],

  // ❤️‍🩹 Support / Healing
  'Heal Bell': ['Healing', 'StatusCure', 'Team'],
  Wish: ['Delayed', 'Healing'],
  Protect: ['Block', 'Status'],
  Substitute: ['Shield', 'HP', 'Setup'],

  // 🔥 Fire
  Ember: ['Burn', 'Special'],
  Flamethrower: ['Burn', 'Special'],
  'Will-O-Wisp': ['Burn', 'Status'],
  'Fire Spin': ['Trap', 'Passive', 'Special'],

  // 🧊 Ice
  'Powder Snow': ['Freeze', 'Special'],
  Hail: ['Weather', 'Passive'],

  // 💧 Water
  'Water Gun': ['Special'],
  Bubble: ['Debuff', 'Speed', 'Special'],
  'Rain Dance': ['Weather', 'Buff', 'Status'],

  // 🥊 Fighting
  'Mach Punch': ['Priority', 'Physical'],
  'Bulk Up': ['Buff', 'Attack', 'Defense'],

  // 🔮 Ghost
  'Night Shade': ['FixedDamage', 'Special'],

  // 🔄 Utility
  Roar: ['Swap', 'Field', 'Status'],
  Whirlwind: ['Swap', 'Field', 'Status'],
  Teleport: ['Escape', 'Field', 'Status'],

  // 🧪 Other
  Toxic: ['Poison', 'Status', 'Passive'],
  Harden: ['Buff', 'Defense'],
  'Tail Whip': ['Debuff', 'Defense', 'Status'],
  Growl: ['Debuff', 'Attack', 'Status'],
  Encore: ['Lock', 'Status'],
  Disable: ['Lock', 'Status'],
  Snore: ['SleepCondition', 'Bonus'],
};

const ensureTags = (move) => ({
  ...move,
  tags: Array.isArray(move.tags) ? move.tags : [],
});

const normalizeMoveRegistry = (registry) => Object.fromEntries(
  Object.entries(registry).map(([name, data]) => [name, ensureTags(data)])
);

const applyMoveTags = (registry) => {
  const updatedRegistry = { ...registry };
  Object.entries(MOVE_TAGS).forEach(([moveName, tags]) => {
    if (updatedRegistry[moveName]) {
      updatedRegistry[moveName] = {
        ...updatedRegistry[moveName],
        tags,
      };
    }
  });
  return updatedRegistry;
};

const mergedRegistry = {
  ...normalizeMoveRegistry(caterpieMoves),
  ...normalizeMoveRegistry(BASE_MOVE_DATA),
};

export const MOVE_DATA = applyMoveTags(mergedRegistry);

// Alias for backward compatibility
export const MOVES = MOVE_DATA;

/**
 * Get move data by name
 * @param {string} moveName - Name of the move
 * @returns {Object|null} Move data or null if not found
 */
export function getMoveData(moveName) {
  return MOVE_DATA[moveName] || null;
}

/**
 * Check if a move is a signature move
 * @param {string} moveName - Name of the move
 * @returns {boolean}
 */
export function isSignatureMove(moveName) {
  const move = MOVE_DATA[moveName];
  return move?.signature === true;
}

/**
 * Get move synergy data
 * @param {string} moveName - Name of the move
 * @returns {Object|null} Synergy data or null
 */
export function getMoveSynergy(moveName) {
  const move = MOVE_DATA[moveName];
  return move?.synergy || null;
}

/**
 * Calculate move damage with synergy bonuses
 * @param {string} moveName - Name of the move
 * @param {Object} pokemon - Pokémon using the move
 * @param {Array} previousMoves - Moves used in previous turns
 * @returns {number} Modified power
 */
export function calculateSynergyDamage(moveName, pokemon, previousMoves = []) {
  const move = MOVE_DATA[moveName];
  if (!move || !move.synergy) return move?.power || 0;

  let power = move.power;
  const synergy = move.synergy;

  // Check role bonus
  if (synergy.rolebonus && pokemon.roles?.includes(synergy.rolebonus)) {
    power *= synergy.roleDamageMultiplier || 1;
  }

  // Check combo move
  if (synergy.comboMove && previousMoves.includes(synergy.comboMove)) {
    // Combo effects are handled separately (e.g., guaranteed burn)
  }

  return Math.floor(power);
}

/**
 * Get all moves with a specific tag
 * @param {string} tag - Tag to filter by
 * @returns {Array} Array of move objects with names
 */
export function getMovesByTag(tag) {
  const moves = [];
  for (const [name, data] of Object.entries(MOVE_DATA)) {
    if (data.tags && data.tags.includes(tag)) {
      moves.push({ name, ...data });
    }
  }
  return moves;
}

/**
 * Check if a move is an egg move
 * @param {string} moveName - Move name
 * @returns {boolean}
 */
export function isEggMove(moveName) {
  const move = MOVE_DATA[moveName];
  return move?.tags?.includes('eggMove') || false;
}

/**
 * Check if a move is a signature move for a specific role
 * @param {string} moveName - Move name
 * @param {string} role - Role name
 * @returns {boolean}
 */
export function isSignatureForRole(moveName, role) {
  const move = MOVE_DATA[moveName];
  return move?.signatureFor?.includes(role) || false;
}

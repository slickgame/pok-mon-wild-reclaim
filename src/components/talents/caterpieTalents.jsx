// Caterpie Talent Pool with trigger logic

const CaterpieTalents = {
  silkenGrip: {
    id: "silkenGrip",
    name: "Silken Grip",
    description: "Contact moves have a chance to lower target's Speed",
    trigger: "onContact",
    grades: {
      Bronze: { chance: 0.2, speedDrop: 1 },
      Silver: { chance: 0.3, speedDrop: 1, evasionDrop: 0 },
      Gold: { chance: 0.4, speedDrop: 1, evasionDrop: 1 }
    }
  },

  moltingDefense: {
    id: "moltingDefense",
    name: "Molting Defense",
    description: "Taking damage has a chance to boost Defense",
    trigger: "onHit",
    grades: {
      Bronze: { chance: 0.3, defBoost: 1 },
      Silver: { chance: 0.5, defBoost: 1 },
      Gold: { chance: 1.0, defBoost: 2 }
    }
  },

  instinctiveSurvival: {
    id: "instinctiveSurvival",
    name: "Instinctive Survival",
    description: "At full HP, may survive a fatal hit with 1 HP",
    trigger: "onFatalHit",
    grades: {
      Bronze: { chance: 0.1 },
      Silver: { chance: 0.3 },
      Gold: { chance: 1.0 }
    }
  },

  threadAmbush: {
    id: "threadAmbush",
    name: "Thread Ambush",
    description: "When opponent's Speed drops, gain priority on next move",
    trigger: "onOpponentSpeedDrop",
    grades: {
      Bronze: { priorityBoost: 1 },
      Silver: { priorityBoost: 1, flinchChance: 0.1 },
      Gold: { priorityBoost: 1, flinchChance: 1.0 }
    }
  },

  scavengerInstinct: {
    id: "scavengerInstinct",
    name: "Scavenger's Instinct",
    description: "Defeating opponents grants bonus XP and items",
    trigger: "onDefeat",
    grades: {
      Bronze: { xpBonus: 0.1 },
      Silver: { xpBonus: 0.2 },
      Gold: { xpBonus: 0.2, guaranteedDrop: true }
    }
  },

  naturesCloak: {
    id: "naturesCloak",
    name: "Nature's Cloak",
    description: "Boosted evasion in forest zones",
    trigger: "onEnterBattle",
    grades: {
      Bronze: { evasionBoost: 0.05 },
      Silver: { evasionBoost: 0.10 },
      Gold: { evasionBoost: 0.15, nullifyFirstHit: true }
    }
  },

  photosensitiveGrowth: {
    id: "photosensitiveGrowth",
    name: "Photosensitive Growth",
    description: "Regenerates HP in daylight or sunny weather",
    trigger: "onStartTurn",
    grades: {
      Bronze: { hpRegen: 0 },
      Silver: { hpRegen: 0.05, spDefBoost: 0 },
      Gold: { hpRegen: 0.05, spDefBoost: 1 }
    }
  },

  earlyInstinct: {
    id: "earlyInstinct",
    name: "Early Instinct",
    description: "Learns moves 1-2 levels earlier",
    trigger: "onLevelUp",
    grades: {
      Bronze: { levelsEarly: 1 },
      Silver: { levelsEarly: 1, bonusMove: "Harden" },
      Gold: { levelsEarly: 2, bonusMove: "Harden" }
    }
  },

  tangleReflexes: {
    id: "tangleReflexes",
    name: "Tangle Reflexes",
    description: "Using String Shot boosts own Speed",
    trigger: "onMoveUsed",
    grades: {
      Bronze: { speedBoost: 1 },
      Silver: { speedBoost: 1, evasionBoost: 1 },
      Gold: { speedBoost: 1, evasionBoost: 1, hpRegen: 0.05 }
    }
  },

  adaptiveShell: {
    id: "adaptiveShell",
    name: "Adaptive Shell",
    description: "After 3 turns, gain defense boosts",
    trigger: "onTurn",
    grades: {
      Bronze: { defBoost: 1, spDefBoost: 0 },
      Silver: { defBoost: 1, spDefBoost: 1 },
      Gold: { defBoost: 2, spDefBoost: 2, critImmune: true }
    }
  }
};

export default CaterpieTalents;
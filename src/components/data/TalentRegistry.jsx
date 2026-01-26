// Central talent registry with all talent definitions
export const TalentRegistry = {
  photosensitiveGrowth: {
    id: "photosensitiveGrowth",
    name: "Photosensitive Growth",
    trigger: "onWeatherChange",
    grades: {
      Bronze: {
        description: "Gain +10% Sp. Atk in sunny weather.",
        spAtkBoost: 0.1
      },
      Silver: {
        description: "Gain +10% Sp. Atk and restore 5% HP per turn in sun.",
        spAtkBoost: 0.1,
        hpRegen: 0.05
      },
      Gold: {
        description: "Gain +15% Sp. Atk and 10% HP regen in sun.",
        spAtkBoost: 0.15,
        hpRegen: 0.1
      }
    }
  },

  instinctiveSurvival: {
    id: "instinctiveSurvival",
    name: "Instinctive Survival",
    trigger: "onFaintCheck",
    grades: {
      Bronze: {
        description: "10% chance to survive a KO at 1 HP.",
        survivalChance: 0.1
      },
      Silver: {
        description: "20% chance to survive a KO and gain +1 Speed.",
        survivalChance: 0.2,
        speedBoost: 1
      },
      Gold: {
        description: "30% chance to survive a KO and gain +2 Speed.",
        survivalChance: 0.3,
        speedBoost: 2
      }
    }
  },

  threadedReflex: {
    id: "threadedReflex",
    name: "Threaded Reflex",
    trigger: "onContactReceived",
    grades: {
      Bronze: {
        description: "10% chance to reduce attacker's Speed by 1.",
        activationChance: 0.1,
        speedReduction: -1
      },
      Silver: {
        description: "20% chance to lower Speed and Accuracy by 1.",
        activationChance: 0.2,
        speedReduction: -1,
        accuracyReduction: -1
      },
      Gold: {
        description: "30% chance to reduce Speed by 2 and Accuracy by 1.",
        activationChance: 0.3,
        speedReduction: -2,
        accuracyReduction: -1
      }
    }
  },

  silkenGrip: {
    id: "silkenGrip",
    name: "Silken Grip",
    trigger: "onHit",
    grades: {
      Bronze: {
        description: "5% chance to immobilize the opponent for 1 turn.",
        activationChance: 0.05,
        duration: 1
      },
      Silver: {
        description: "10% chance to immobilize for 1 turn.",
        activationChance: 0.1,
        duration: 1
      },
      Gold: {
        description: "15% chance to immobilize for 2 turns.",
        activationChance: 0.15,
        duration: 2
      }
    }
  },

  moltingDefense: {
    id: "moltingDefense",
    name: "Molting Defense",
    trigger: "onStatusInflicted",
    grades: {
      Bronze: {
        description: "30% chance to cure a status ailment at end of turn.",
        cureChance: 0.3
      },
      Silver: {
        description: "Cure 1 status every 3 turns.",
        turnsInterval: 3
      },
      Gold: {
        description: "Cure 1 status every 2 turns and gain +1 Defense.",
        turnsInterval: 2,
        defenseBoost: 1
      }
    }
  },

  threadAmbush: {
    id: "threadAmbush",
    name: "Thread Ambush",
    trigger: "onEnemySwitchIn",
    grades: {
      Bronze: {
        description: "Lowers the Speed of a new opponent by 1 stage.",
        speedReduction: -1
      },
      Silver: {
        description: "Lowers Speed and traps the new opponent for 1 turn.",
        speedReduction: -1,
        trapDuration: 1
      },
      Gold: {
        description: "Lowers Speed by 2 and traps for 2 turns.",
        speedReduction: -2,
        trapDuration: 2
      }
    }
  },

  scavengerInstinct: {
    id: "scavengerInstinct",
    name: "Scavenger Instinct",
    trigger: "onKill",
    grades: {
      Bronze: {
        description: "Restore 5% HP when you defeat a Pokémon.",
        hpRestore: 0.05
      },
      Silver: {
        description: "Restore 10% HP on kill and +1 Speed.",
        hpRestore: 0.1,
        speedBoost: 1
      },
      Gold: {
        description: "Restore 15% HP and +1 Atk & Speed on kill.",
        hpRestore: 0.15,
        attackBoost: 1,
        speedBoost: 1
      }
    }
  },

  naturesCloak: {
    id: "naturesCloak",
    name: "Nature's Cloak",
    trigger: "onTerrainEffect",
    grades: {
      Bronze: {
        description: "5% Evasion bonus in grass terrain.",
        evasionBonus: 0.05
      },
      Silver: {
        description: "10% Evasion and chance to dodge status effects.",
        evasionBonus: 0.1,
        statusDodgeChance: 0.3
      },
      Gold: {
        description: "15% Evasion and immune to status effects in grass.",
        evasionBonus: 0.15,
        statusImmune: true
      }
    }
  },

  earlyInstinct: {
    id: "earlyInstinct",
    name: "Early Instinct",
    trigger: "onFirstTurn",
    grades: {
      Bronze: {
        description: "+1 Priority on first move used in battle.",
        priorityBoost: 1
      },
      Silver: {
        description: "+1 Priority and +10% crit chance on first move.",
        priorityBoost: 1,
        critBoost: 0.1
      },
      Gold: {
        description: "+2 Priority and +20% crit chance on first move.",
        priorityBoost: 2,
        critBoost: 0.2
      }
    }
  },

  adaptiveShell: {
    id: "adaptiveShell",
    name: "Adaptive Shell",
    trigger: "onElementHit",
    grades: {
      Bronze: {
        description: "Reduce Super Effective damage by 10%.",
        damageReduction: 0.1
      },
      Silver: {
        description: "Reduce by 20% and gain +1 Defense when triggered.",
        damageReduction: 0.2,
        defenseBoost: 1
      },
      Gold: {
        description: "Reduce by 30% and gain +1 Def & SpDef.",
        damageReduction: 0.3,
        defenseBoost: 1,
        spDefenseBoost: 1
      }
    }
  },

  tangleReflexes: {
    id: "tangleReflexes",
    name: "Tangle Reflexes",
    trigger: "onDodge",
    grades: {
      Bronze: {
        description: "5% chance to dodge and counter with -1 Speed to attacker.",
        dodgeChance: 0.05,
        speedReduction: -1
      },
      Silver: {
        description: "10% dodge chance and counter with -1 Speed.",
        dodgeChance: 0.1,
        speedReduction: -1
      },
      Gold: {
        description: "15% dodge chance and counter with -2 Speed.",
        dodgeChance: 0.15,
        speedReduction: -2
      }
    }
  }
};
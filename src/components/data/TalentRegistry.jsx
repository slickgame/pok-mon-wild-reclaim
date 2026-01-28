// Central talent registry with all talent definitions
export const TalentRegistry = {
  photosensitiveGrowth: {
    id: "photosensitiveGrowth",
    name: "Photosensitive Growth",
    trigger: "onTurnStart",
    grades: {
      Basic: { description: "Gain +1 Speed when fighting in daylight." },
      Rare: { description: "Gain +1 Speed and restore 5% HP in daylight." },
      Epic: { description: "Gain +1 Speed, +1 Sp. Atk, and restore 10% HP in daylight." }
    }
  },

  instinctiveSurvival: {
    id: "instinctiveSurvival",
    name: "Instinctive Survival",
    trigger: "onFaintCheck",
    grades: {
      Basic: { description: "10% chance to survive a KO at 1 HP." },
      Rare: { description: "20% chance to survive a KO and gain +1 Speed." },
      Epic: { description: "30% chance to survive a KO and gain +2 Speed." }
    }
  },

  threadedReflex: {
    id: "threadedReflex",
    name: "Threaded Reflex",
    trigger: "onContactReceived",
    grades: {
      Basic: { description: "10% chance to lower attacker's Speed by 1 when hit by contact move." },
      Rare: { description: "20% chance to lower attacker's Speed & Accuracy by 1." },
      Epic: { description: "30% chance to lower attacker's Speed by 2 & Accuracy by 1." }
    }
  },

  silkenGrip: {
    id: "silkenGrip",
    name: "Silken Grip",
    trigger: "onMoveUse",
    grades: {
      Basic: { description: "5% chance to immobilize target for 1 turn when using String Shot." },
      Rare: { description: "10% chance to immobilize for 1 turn." },
      Epic: { description: "15% chance to immobilize for 2 turns." }
    }
  },

  moltingDefense: {
    id: "moltingDefense",
    name: "Molting Defense",
    trigger: "onTurnStart",
    grades: {
      Basic: { description: "30% chance to cure status condition at end of turn." },
      Rare: { description: "Cure status condition every 3 turns." },
      Epic: { description: "Cure status every 2 turns and gain +1 Defense." }
    }
  },

  threadAmbush: {
    id: "threadAmbush",
    name: "Thread Ambush",
    trigger: "onTurnStart",
    grades: {
      Basic: { description: "Lower opponent's Speed by 1 when entering battle." },
      Rare: { description: "Lower Speed by 1 and trap opponent for 1 turn." },
      Epic: { description: "Lower Speed by 2 and trap opponent for 2 turns." }
    }
  },

  scavengerInstinct: {
    id: "scavengerInstinct",
    name: "Scavenger Instinct",
    trigger: "onKill",
    grades: {
      Basic: { description: "Restore 5% HP when defeating an enemy." },
      Rare: { description: "Restore 10% HP and gain +1 Speed." },
      Epic: { description: "Restore 15% HP and gain +1 Atk & +1 Speed." }
    }
  },

  naturesCloak: {
    id: "naturesCloak",
    name: "Nature's Cloak",
    trigger: "onTurnStart",
    grades: {
      Basic: { description: "Gain +5% evasion in grassy terrain." },
      Rare: { description: "+10% evasion and 30% chance to dodge status moves in grass." },
      Epic: { description: "+15% evasion and immunity to status moves in grass." }
    }
  },

  earlyInstinct: {
    id: "earlyInstinct",
    name: "Early Instinct",
    trigger: "onTurnStart",
    grades: {
      Basic: { description: "Gain +1 priority on first turn." },
      Rare: { description: "+1 priority and +10% crit chance on first turn." },
      Epic: { description: "+2 priority and +20% crit chance on first turn." }
    }
  },

  adaptiveShell: {
    id: "adaptiveShell",
    name: "Adaptive Shell",
    trigger: "onElementHit",
    grades: {
      Basic: { description: "Reduce super-effective damage by 10%." },
      Rare: { description: "Reduce by 20% and gain +1 Defense." },
      Epic: { description: "Reduce by 30% and gain +1 Defense & Sp. Defense." }
    }
  },

  tangleReflexes: {
    id: "tangleReflexes",
    name: "Tangle Reflexes",
    trigger: "onHit",
    grades: {
      Basic: { description: "5% chance to completely dodge an attack and counter with -1 Speed." },
      Rare: { description: "10% chance to dodge and counter." },
      Epic: { description: "15% chance to dodge and counter with -2 Speed." }
    }
  },

  verdantInstinct: {
    id: "verdantInstinct",
    name: "Verdant Instinct",
    grade: "Rare",
    description: "Boosts Speed and restores HP in Grassy Terrain.",
    fieldTrigger: "grassy",
    onEnterField: ({ pokemon, log }) => {
      log(`${pokemon.name || pokemon.nickname || pokemon.species}'s Verdant Instinct activates!`);
      if (pokemon.statStages) {
        pokemon.statStages.Speed += 1;
      }

      const maxHp = pokemon.stats?.hp ?? pokemon.maxHP ?? pokemon.maxHp ?? 0;
      const currentHp = pokemon.currentHp ?? pokemon.hp ?? maxHp;
      const heal = Math.floor(maxHp / 16);
      const nextHp = Math.min(maxHp, currentHp + heal);
      if (pokemon.currentHp !== undefined) {
        pokemon.currentHp = nextHp;
      } else {
        pokemon.hp = nextHp;
      }
      log(`${pokemon.name || pokemon.nickname || pokemon.species} recovered ${heal} HP!`);
    }
  },

  sporeAffinity: {
    id: "sporeAffinity",
    name: "Spore Affinity",
    grade: "Basic",
    description: "Heals status conditions in Grassy Terrain.",
    fieldTrigger: "grassy",
    onEnterField: ({ pokemon, log }) => {
      if (pokemon.status) {
        log(`${pokemon.name || pokemon.nickname || pokemon.species}'s Spore Affinity cured its ${pokemon.status}!`);
        pokemon.status = null;
      }
    }
  },

  solarInstinct: {
    id: "solarInstinct",
    name: "Solar Instinct",
    grade: "Rare",
    description: "Boosts Sp. Atk in sunny weather.",
    weatherTrigger: "sunny",
    onEnterWeather: ({ pokemon, log }) => {
      if (pokemon.statStages) {
        pokemon.statStages["Sp. Atk"] += 2;
      }
      log(`${pokemon.name || pokemon.nickname || pokemon.species}'s Solar Instinct sharply boosted its Sp. Atk!`);
    }
  }
};

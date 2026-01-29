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

  featherScout: {
    id: "featherScout",
    name: "Feather Scout",
    grades: {
      Basic: {
        description: "Slightly increases encounter rate in grassy areas.",
        trigger: {
          onExplore: {
            Basic: ({ environment, encounterRate }) => {
              if (environment === "grass") {
                return { environment, encounterRate: encounterRate * 1.1 };
              }
              return { environment, encounterRate };
            }
          }
        }
      },
      Rare: {
        description: "Moderately increases encounter rate in grassy areas.",
        trigger: {
          onExplore: {
            Rare: ({ environment, encounterRate }) => {
              if (environment === "grass") {
                return { environment, encounterRate: encounterRate * 1.25 };
              }
              return { environment, encounterRate };
            }
          }
        }
      }
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
  },

  tailwindMomentum: {
    id: "tailwindMomentum",
    name: "Tailwind Momentum",
    grades: {
      Basic: {
        description: "Speed increases by 1 stage when using a Flying move.",
        trigger: {
          onMoveUsed: {
            Basic: ({ pokemon, move, modifyStatStage, showTalentEffect }) => {
              if (move.type === "Flying") {
                modifyStatStage(pokemon, "Speed", 1);
                showTalentEffect("Tailwind Momentum activated!");
              }
            }
          }
        }
      },
      Rare: {
        description: "Speed and Evasion +1 on Flying move use.",
        trigger: {
          onMoveUsed: {
            Rare: ({ pokemon, move, modifyStatStage, showTalentEffect }) => {
              if (move.type === "Flying") {
                modifyStatStage(pokemon, "Speed", 1);
                modifyStatStage(pokemon, "Evasion", 1);
                showTalentEffect("Tailwind Momentum (Rare) activated!");
              }
            }
          }
        }
      },
      Epic: {
        description: "Grants +2 Speed, +1 Evasion on Flying move use.",
        trigger: {
          onMoveUsed: {
            Epic: ({ pokemon, move, modifyStatStage, showTalentEffect }) => {
              if (move.type === "Flying") {
                modifyStatStage(pokemon, "Speed", 2);
                modifyStatStage(pokemon, "Evasion", 1);
                showTalentEffect("Tailwind Momentum (Epic) activated!");
              }
            }
          }
        }
      }
    }
  },

  aerialGrace: {
    id: "aerialGrace",
    name: "Aerial Grace",
    grades: {
      Basic: {
        description: "Flying-type moves gain +5 accuracy.",
        modifyMove: ({ move }) => {
          if (move.type === "Flying") {
            move.accuracy += 5;
          }
        }
      },
      Rare: {
        description: "Flying-type moves gain +10 accuracy.",
        modifyMove: ({ move }) => {
          if (move.type === "Flying") {
            move.accuracy += 10;
          }
        }
      },
      Epic: {
        description: "Flying-type moves never miss.",
        modifyMove: ({ move }) => {
          if (move.type === "Flying") {
            move.accuracy = 999;
          }
        }
      }
    }
  },

  gustResonance: {
    id: "gustResonance",
    name: "Gust Resonance",
    grades: {
      Basic: {
        description: "Flying-type moves gain +10% power.",
        trigger: {
          onMoveUsed: {
            Basic: ({ move }) => {
              if (move.type === "Flying") {
                move.power = Math.floor(move.power * 1.1);
              }
            }
          }
        }
      },
      Rare: {
        description: "Flying-type moves gain +15% power.",
        trigger: {
          onMoveUsed: {
            Rare: ({ move }) => {
              if (move.type === "Flying") {
                move.power = Math.floor(move.power * 1.15);
              }
            }
          }
        }
      },
      Epic: {
        description: "Flying-type moves gain +20% power.",
        trigger: {
          onMoveUsed: {
            Epic: ({ move }) => {
              if (move.type === "Flying") {
                move.power = Math.floor(move.power * 1.2);
              }
            }
          }
        }
      }
    }
  },

  eyeOfTheStorm: {
    id: "eyeOfTheStorm",
    name: "Eye of the Storm",
    grades: {
      Basic: {
        description: "Reduces damage taken in wind-based weather.",
        onBeforeDamage: ({ target, move, battle, reduceDamage }) => {
          if (battle.battlefield.weather === "windy") {
            reduceDamage(0.9);
          }
        }
      },
      Rare: {
        description: "Further reduces damage and raises Sp. Def in windy weather.",
        onBeforeDamage: ({ target, move, battle, reduceDamage }) => {
          if (battle.battlefield.weather === "windy") {
            reduceDamage(0.8);
            target.statStages["Sp. Def"] += 1;
          }
        }
      },
      Epic: {
        description: "Immune to Flying moves in windy weather.",
        onBeforeDamage: ({ move, battle, cancelDamage }) => {
          if (battle.battlefield.weather === "windy" && move.type === "Flying") {
            cancelDamage();
          }
        }
      }
    }
  },

  evasiveFeatherstep: {
    id: "evasiveFeatherstep",
    name: "Evasive Featherstep",
    grades: {
      Basic: {
        description: "5% evasion increase if Speed is higher than target.",
        modifyEvasion: ({ user, target, bonusEvasion }) => {
          if (user.speed > target.speed) {
            bonusEvasion(0.05);
          }
        }
      },
      Rare: {
        description: "10% evasion increase if Speed is higher than target.",
        modifyEvasion: ({ user, target, bonusEvasion }) => {
          if (user.speed > target.speed) {
            bonusEvasion(0.1);
          }
        }
      },
      Epic: {
        description: "20% evasion increase and +1 Speed stage if faster.",
        onBattleStart: ({ pokemon, battle }) => {
          const opponent = battle.getOpponent(pokemon);
          if (pokemon.speed > opponent.speed) {
            pokemon.statStages.Speed += 1;
          }
        },
        modifyEvasion: ({ user, target, bonusEvasion }) => {
          if (user.speed > target.speed) {
            bonusEvasion(0.2);
          }
        }
      }
    }
  },

  fleetfoot: {
    id: "fleetfoot",
    name: "Fleetfoot",
    grades: {
      Basic: {
        description: "Gain +1 Speed after using a damaging move.",
        onAfterMove: ({ pokemon, move }) => {
          if (move.power > 0) pokemon.modifyStat("Speed", 1);
        }
      },
      Rare: {
        description: "Gain +1 Speed and recover 5% HP after attacking.",
        onAfterMove: ({ pokemon, move }) => {
          if (move.power > 0) {
            pokemon.modifyStat("Speed", 1);
            pokemon.restoreHPPercent(0.05);
          }
        }
      },
      Epic: {
        description: "Gain +2 Speed after attacking.",
        onAfterMove: ({ pokemon, move }) => {
          if (move.power > 0) pokemon.modifyStat("Speed", 2);
        }
      }
    }
  },

  windcaller: {
    id: "windcaller",
    name: "Windcaller",
    grades: {
      Basic: {
        description: "10% chance to create Tailwind on entry.",
        onBattleStart: ({ battle }) => {
          if (Math.random() < 0.1) battle.setTerrain("tailwind", 4);
        }
      },
      Rare: {
        description: "25% chance to create Tailwind on entry.",
        onBattleStart: ({ battle }) => {
          if (Math.random() < 0.25) battle.setTerrain("tailwind", 4);
        }
      },
      Epic: {
        description: "Always creates Tailwind on entry.",
        onBattleStart: ({ battle }) => {
          battle.setTerrain("tailwind", 4);
        }
      }
    }
  },

  skyPredator: {
    id: "skyPredator",
    name: "Sky Predator",
    grades: {
      Basic: {
        description: "Deal 10% more damage to slower targets.",
        modifyDamage: ({ user, target, damage }) => {
          if (user.speed > target.speed) return damage * 1.1;
        }
      },
      Rare: {
        description: "Deal 20% more damage to slower targets.",
        modifyDamage: ({ user, target, damage }) => {
          if (user.speed > target.speed) return damage * 1.2;
        }
      },
      Epic: {
        description: "Deal 30% more damage and gain +1 Speed when hitting slower targets.",
        modifyDamage: ({ user, target, damage }) => {
          if (user.speed > target.speed) {
            user.modifyStat("Speed", 1);
            return damage * 1.3;
          }
        }
      }
    }
  },

  slipstream: {
    id: "slipstream",
    name: "Slipstream",
    grades: {
      Basic: {
        description: "Reduce damage by 10% if Speed is higher than attacker.",
        onBeforeDamage: ({ user, attacker, reduceDamage }) => {
          if (user.speed > attacker.speed) reduceDamage(0.9);
        }
      },
      Rare: {
        description: "Reduce damage by 20% if faster.",
        onBeforeDamage: ({ user, attacker, reduceDamage }) => {
          if (user.speed > attacker.speed) reduceDamage(0.8);
        }
      },
      Epic: {
        description: "Reduce damage by 30% and gain +1 Speed when hit while faster.",
        onBeforeDamage: ({ user, attacker, reduceDamage }) => {
          if (user.speed > attacker.speed) {
            reduceDamage(0.7);
            user.modifyStat("Speed", 1);
          }
        }
      }
    }
  },

  skyDominion: {
    id: "skyDominion",
    name: "Sky Dominion",
    grades: {
      Basic: {
        description: "Gain +1 Attack when HP drops below 50%.",
        onHPThreshold: ({ pokemon }) => {
          pokemon.modifyStat("Attack", 1);
        }
      },
      Rare: {
        description: "Gain +1 Attack and +1 Speed below 50% HP.",
        onHPThreshold: ({ pokemon }) => {
          pokemon.modifyStat("Attack", 1);
          pokemon.modifyStat("Speed", 1);
        }
      },
      Epic: {
        description: "Gain +2 Attack and +1 Speed below 50% HP.",
        onHPThreshold: ({ pokemon }) => {
          pokemon.modifyStat("Attack", 2);
          pokemon.modifyStat("Speed", 1);
        }
      }
    }
  },

  clearSkyAlpha: {
    id: "clearSkyAlpha",
    name: "Clear Sky Alpha",
    grades: {
      Basic: {
        description: "Boosts Accuracy and Flying move power in clear weather.",
        modifyMove: ({ move, battle }) => {
          if (battle?.battlefield?.weather === "clear" && move.type === "Flying") {
            move.accuracy += 10;
            move.power = Math.floor(move.power * 1.1);
          }
        }
      },
      Rare: {
        description: "Flying moves deal 20% more in clear weather.",
        modifyMove: ({ move, battle }) => {
          if (battle?.battlefield?.weather === "clear" && move.type === "Flying") {
            move.power = Math.floor(move.power * 1.2);
          }
        }
      },
      Epic: {
        description: "Flying moves always crit in clear weather.",
        modifyMove: ({ move, battle }) => {
          if (battle?.battlefield?.weather === "clear" && move.type === "Flying") {
            move.critRate = 999;
          }
        }
      }
    }
  },

  stormfrontPulse: {
    id: "stormfrontPulse",
    name: "Stormfront Pulse",
    grades: {
      Basic: {
        description: "Hurricane gains +20 Accuracy.",
        modifyMove: ({ move }) => {
          if (move.name === "Hurricane") move.accuracy += 20;
        }
      },
      Rare: {
        description: "Hurricane gains 100% Accuracy in storm weather.",
        modifyMove: ({ move, battle }) => {
          if (move.name === "Hurricane" && battle?.battlefield?.weather === "storm") {
            move.accuracy = 999;
          }
        }
      },
      Epic: {
        description: "Hurricane becomes priority +1 and causes Confusion.",
        modifyMove: ({ move }) => {
          if (move.name === "Hurricane") {
            move.priority = 1;
            move.effect = { status: "Confused", chance: 1.0 };
          }
        }
      }
    }
  },

  hurricaneProwess: {
    id: "hurricaneProwess",
    name: "Hurricane Prowess",
    grades: {
      Basic: {
        description: "Hurricane deals 10% more damage.",
        modifyMove: ({ move }) => {
          if (move.name === "Hurricane") {
            move.power = Math.floor(move.power * 1.1);
          }
        }
      },
      Rare: {
        description: "Hurricane deals 20% more and may hit all enemies.",
        modifyMove: ({ move }) => {
          if (move.name === "Hurricane") {
            move.power = Math.floor(move.power * 1.2);
            move.targets = "all-opponents";
          }
        }
      },
      Epic: {
        description: "Hurricane is now guaranteed to confuse.",
        modifyMove: ({ move }) => {
          if (move.name === "Hurricane") {
            move.effect = { status: "Confused", chance: 1.0 };
          }
        }
      }
    }
  }
};

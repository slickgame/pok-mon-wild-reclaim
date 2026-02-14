// Central talent registry with all talent definitions
import { hasAnyTag } from '@/components/utils/moveUtils';

export const TalentRegistry = {
  nightBlooming: {
    id: "nightBlooming",
    name: "Night Blooming",
    description: "Restores HP each turn at night or in shaded terrain.",
    tagsAffected: ["Healing"],
    grades: {
      Basic: { description: "Restore 3% HP per turn in night/shade." },
      Rare: { description: "Restore 6% HP per turn in night/shade." },
      Epic: { description: "Restore 10% HP per turn in night/shade." }
    },
    trigger: {
      onTurnEnd: ({ user, battle }) => {
        if (battle.time === "Night" || battle.terrain === "Shade") {
          const grade = user.getTalentGrade("nightBlooming");
          const heal = grade === "Epic" ? 0.1 : grade === "Rare" ? 0.06 : 0.03;
          user.healPercent(heal);
        }
      }
    }
  },

  toxicAffinity: {
    id: "toxicAffinity",
    name: "Toxic Affinity",
    description: "Poison moves deal extra damage. Bonus against poisoned targets.",
    grades: {
      Basic: { description: "Poison moves deal 10% more damage." },
      Rare: { description: "Poison moves deal 20% more damage." },
      Epic: { description: "Poison moves deal 30% more damage and gain bonus vs poisoned." }
    },
    trigger: {
      onMoveUse: ({ user, move, target }) => {
        if (move.type !== "Poison") return;
        const grade = user.getTalentGrade("toxicAffinity");
        move.power *= grade === "Epic" ? 1.3 : grade === "Rare" ? 1.2 : 1.1;
        if (grade === "Epic" && target.hasStatus("Poison")) {
          move.power *= 1.1;
        }
      }
    }
  },

  sporeSynthesis: {
    id: "sporeSynthesis",
    name: "Spore Synthesis",
    description: "Using spore moves restores HP.",
    tagsAffected: ["Spore", "Powder"],
    grades: {
      Basic: { description: "Restore 3% HP when using spore moves." },
      Rare: { description: "Restore 6% HP when using spore moves." },
      Epic: { description: "Restore 10% HP when using spore moves." }
    },
    trigger: {
      onMoveHit: ({ user, move }) => {
        if (!hasAnyTag(move, ["Spore"])) return;
        const grade = user.getTalentGrade("sporeSynthesis");
        const heal = grade === "Epic" ? 0.1 : grade === "Rare" ? 0.06 : 0.03;
        user.healPercent(heal);
      }
    }
  },

  echoWeaver: {
    id: "echoWeaver",
    name: "Echo Weaver",
    description: "Applies additional stackable damage over time on thread-based status moves.",
    tagsAffected: ["Status"],
    trigger: "onMoveHit",
    grades: {
      Basic: { description: "Status thread effects gain a light damage-over-time stack." },
      Rare: { description: "Status thread effects gain a stronger damage-over-time stack." },
      Epic: { description: "Status thread effects gain a heavy damage-over-time stack." }
    }
  },

  symbioticRoot: {
    id: "symbioticRoot",
    name: "Symbiotic Root",
    description: "Healing effects restore more HP.",
    tagsAffected: ["Healing"],
    grades: {
      Basic: { description: "Healing restores 10% more HP." },
      Rare: { description: "Healing restores 20% more HP." },
      Epic: { description: "Healing restores 30% more HP." }
    },
    trigger: {
      onHealCalc: ({ user, heal }) => {
        const grade = user.getTalentGrade("symbioticRoot");
        return heal * (grade === "Epic" ? 1.3 : grade === "Rare" ? 1.2 : 1.1);
      }
    }
  },

  drowsyAllure: {
    id: "drowsyAllure",
    name: "Drowsy Allure",
    description: "Attackers may become slowed.",
    grades: {
      Basic: { description: "5% chance to slow attackers." },
      Rare: { description: "10% chance to slow attackers." },
      Epic: { description: "20% chance to slow attackers." }
    },
    trigger: {
      onDamaged: ({ user, attacker }) => {
        const grade = user.getTalentGrade("drowsyAllure");
        const chance = grade === "Epic" ? 0.2 : grade === "Rare" ? 0.1 : 0.05;
        if (Math.random() < chance) {
          attacker.addStatDebuff("Speed", 1);
        }
      }
    }
  },

  adaptogenic: {
    id: "adaptogenic",
    name: "Adaptogenic",
    description: "Chance to resist status effects.",
    grades: {
      Basic: { description: "10% chance to resist status effects." },
      Rare: { description: "20% chance to resist status effects." },
      Epic: { description: "30% chance to resist status effects." }
    },
    trigger: {
      onStatusAttempt: ({ user }) => {
        const grade = user.getTalentGrade("adaptogenic");
        const resist = grade === "Epic" ? 0.3 : grade === "Rare" ? 0.2 : 0.1;
        return Math.random() < resist ? "RESIST" : null;
      }
    }
  },

  photosensitiveGrowth: {
    id: "photosensitiveGrowth",
    name: "Photosensitive Growth",
    description: "Sunny weather boosts stats once per battle.",
    grades: {
      Basic: { description: "In sun, gain +1 Speed once per battle." },
      Rare: { description: "In sun, gain +1 Speed and +1 Sp. Atk once per battle." },
      Epic: { description: "In sun, gain +2 Speed and +1 Sp. Atk once per battle." }
    },
    trigger: {
      onTurnStart: ({ user, battle }) => {
        if (user._photoUsed) return;
        if (battle.weather !== "Sunny") return;
        const grade = user.getTalentGrade("photosensitiveGrowth");
        user.addStatBuff("Speed", 1);
        if (grade !== "Basic") user.addStatBuff("Sp. Atk", 1);
        if (grade === "Epic") user.addStatBuff("Speed", 1);
        user._photoUsed = true;
      }
    }
  },

  parasiticDrain: {
    id: "parasiticDrain",
    name: "Parasitic Drain",
    description: "Drain moves restore more HP.",
    tagsAffected: ["Drain", "Healing"],
    grades: {
      Basic: { description: "Drain restores 10% more HP." },
      Rare: { description: "Drain restores 20% more HP." },
      Epic: { description: "Drain restores 30% more HP." }
    },
    trigger: {
      onDrainCalc: ({ user, amount }) => {
        const grade = user.getTalentGrade("parasiticDrain");
        return amount * (grade === "Epic" ? 1.3 : grade === "Rare" ? 1.2 : 1.1);
      }
    }
  },

  resilientWeed: {
    id: "resilientWeed",
    name: "Resilient Weed",
    description: "Survives a fatal hit once per battle.",
    grades: {
      Basic: { description: "Survive a fatal hit once per battle." },
      Rare: { description: "Survive a fatal hit once per battle." },
      Epic: { description: "Survive a fatal hit and heal 10% afterward." }
    },
    trigger: {
      onFatalDamage: ({ user }) => {
        if (user._weedUsed) return false;
        user.hp = 1;
        user._weedUsed = true;
        if (user.getTalentGrade("resilientWeed") === "Epic") {
          user.healPercent(0.1);
        }
        return true;
      }
    }
  },

  mushroomBond: {
    id: "mushroomBond",
    name: "Mushroom Bond",
    description: "Healing or status moves may trigger twice.",
    tagsAffected: ["Healing", "Spore", "Status"],
    grades: {
      Basic: { description: "10% chance to repeat healing/status moves." },
      Rare: { description: "20% chance to repeat healing/status moves." },
      Epic: { description: "30% chance to repeat healing/status moves." }
    },
    trigger: {
      onMoveResolve: ({ user, move, battle }) => {
        if (!hasAnyTag(move, ["Healing", "Spore", "Status"])) return;
        const grade = user.getTalentGrade("mushroomBond");
        const chance = grade === "Epic" ? 0.3 : grade === "Rare" ? 0.2 : 0.1;
        if (Math.random() < chance) {
          battle.queueExtraMove(user, move);
        }
      }
    }
  },

  chlorophyllBoost: {
    id: "chlorophyllBoost",
    name: "Chlorophyll Boost",
    description: "Gains Speed when affected by any status condition.",
    tagsAffected: ["Status"],
    trigger: {
      onStatusApply: ({ user }) => {
        const grade = user.getTalentGrade("chlorophyllBoost");
        const stages = grade === "Epic" ? 2 : 1;
        user.addStatBuff("Speed", stages);
      }
    }
  },

  toxicPollen: {
    id: "toxicPollen",
    name: "Toxic Pollen",
    description: "Powder moves may badly poison the target.",
    tagsAffected: ["Powder"],
    trigger: {
      onMoveHit: ({ move, target, user }) => {
        if (!hasAnyTag(move, ["Powder"])) return;
        const grade = user.getTalentGrade("toxicPollen");
        const chance = grade === "Epic" ? 0.3 : grade === "Rare" ? 0.2 : 0.1;
        if (Math.random() < chance) {
          target.applyStatus("Toxic");
        }
      }
    }
  },

  gloomAura: {
    id: "gloomAura",
    name: "Gloom Aura",
    description: "Increases chance to apply negative status effects.",
    tagsAffected: ["Status"],
    trigger: {
      onStatusChanceCalc: ({ user, chance }) => {
        const grade = user.getTalentGrade("gloomAura");
        return chance * (grade === "Epic" ? 1.5 : grade === "Rare" ? 1.3 : 1.15);
      }
    }
  },

  resilientStink: {
    id: "resilientStink",
    name: "Resilient Stink",
    description: "Reduces chance of being hit by status moves.",
    tagsAffected: ["Status"],
    trigger: {
      onStatusAttempt: ({ user }) => {
        const grade = user.getTalentGrade("resilientStink");
        const resist = grade === "Epic" ? 0.35 : grade === "Rare" ? 0.2 : 0.1;
        return Math.random() < resist ? "RESIST" : null;
      }
    }
  },

  rotPollinate: {
    id: "rotPollinate",
    name: "Rot Pollinate",
    description: "Poison moves heal allies.",
    tagsAffected: ["Poison", "Healing"],
    trigger: {
      onMoveHit: ({ move, user, team }) => {
        if (move.type !== "Poison") return;
        const grade = user.getTalentGrade("rotPollinate");
        const heal = grade === "Epic" ? 0.07 : grade === "Rare" ? 0.05 : 0.03;
        team.forEach((ally) => {
          if (ally !== user) ally.healPercent(heal);
        });
      }
    }
  },

  grudgeBloom: {
    id: "grudgeBloom",
    name: "Grudge Bloom",
    description: "Drain moves heal more when below 50% HP.",
    tagsAffected: ["Drain"],
    trigger: {
      onDrainCalc: ({ user, amount }) => {
        if (user.hp / user.maxHP > 0.5) return amount;
        const grade = user.getTalentGrade("grudgeBloom");
        return amount * (grade === "Epic" ? 1.5 : grade === "Rare" ? 1.3 : 1.15);
      }
    }
  },

  twilightToxin: {
    id: "twilightToxin",
    name: "Twilight Toxin",
    description: "Status moves apply stronger stat drops.",
    tagsAffected: ["Status", "Poison"],
    trigger: {
      onStatDropApply: ({ user, stages }) => {
        const grade = user.getTalentGrade("twilightToxin");
        if (grade === "Epic") return stages + 1;
        if (grade === "Rare") return stages + 0.5;
        return stages;
      }
    }
  },

  noxiousSpreader: {
    id: "noxiousSpreader",
    name: "Noxious Spreader",
    description: "Statuses may spread to adjacent enemies.",
    tagsAffected: ["Status"],
    trigger: {
      onStatusApply: ({ target, battle, user }) => {
        const grade = user.getTalentGrade("noxiousSpreader");
        const chance = grade === "Epic" ? 0.4 : grade === "Rare" ? 0.3 : 0.2;
        if (Math.random() < chance) {
          battle.getAdjacentEnemies(target).forEach((enemy) => {
            enemy.applyStatus(target.lastStatusApplied);
          });
        }
      }
    }
  },

  overgrowthInstinct: {
    id: "overgrowthInstinct",
    name: "Overgrowth Instinct",
    description: "Grass moves increase Defense.",
    tagsAffected: ["Grass"],
    trigger: {
      onMoveUse: ({ move, user }) => {
        if (move.type !== "Grass") return;
        const grade = user.getTalentGrade("overgrowthInstinct");
        user.addStatBuff("Defense", grade === "Epic" ? 2 : 1);
      }
    }
  },

  volatileBloom: {
    id: "volatileBloom",
    name: "Volatile Bloom",
    description: "Powder moves explode on contact for bonus damage.",
    tagsAffected: ["Powder"],
    trigger: {
      onMoveHit: ({ move, target, user }) => {
        if (!hasAnyTag(move, ["Powder"])) return;
        const grade = user.getTalentGrade("volatileBloom");
        const bonus = grade === "Epic" ? 0.25 : grade === "Rare" ? 0.15 : 0.08;
        target.takeDamage(user.getStat("SpAtk") * bonus, "Special", "Poison");
      }
    }
  },

  acidicResonance: {
    id: "acidicResonance",
    name: "Acidic Resonance",
    description: "Poison moves may confuse the target.",
    tagsAffected: ["Poison"],
    trigger: {
      onMoveHit: ({ move, target, user }) => {
        if (move.type !== "Poison") return;
        const grade = user.getTalentGrade("acidicResonance");
        const chance = grade === "Epic" ? 0.4 : grade === "Rare" ? 0.25 : 0.1;
        if (Math.random() < chance) {
          target.applyStatus("Confused");
        }
      }
    }
  },

  deepRoot: {
    id: "deepRoot",
    name: "Deep Root",
    description: "Increases healing in terrain.",
    tagsAffected: ["Grass", "Healing"],
    trigger: {
      onHeal: ({ user, amount }) => {
        if (!user.battle?.terrain?.includes("Grass")) return amount;
        const grade = user.getTalentGrade("deepRoot");
        return amount * (grade === "Epic" ? 1.4 : grade === "Rare" ? 1.25 : 1.1);
      }
    }
  },

  bloomSurge: {
    id: "bloomSurge",
    name: "Bloom Surge",
    description: "Status moves gain +1 priority in Grass Terrain.",
    tagsAffected: ["Terrain", "Status"],
    trigger: {
      onMoveQueue: ({ move, user }) => {
        if (user.battle?.terrain === "Grass" && move.category === "Status") {
          move.priority += 1;
        }
      }
    }
  },

  stenchField: {
    id: "stenchField",
    name: "Stench Field",
    description: "Enemies lose Accuracy in terrain each turn.",
    tagsAffected: ["Terrain", "Status"],
    trigger: {
      onTurnStart: ({ battle, user }) => {
        if (battle?.terrain !== "Grass") return;
        const grade = user.getTalentGrade("stenchField");
        const amount = grade === "Epic" ? -2 : grade === "Rare" ? -1 : -0.5;
        battle.getOpposingTeam(user).forEach((enemy) => {
          enemy.addStatBuff("Accuracy", amount);
        });
      }
    }
  },

  petalImpact: {
    id: "petalImpact",
    name: "Petal Impact",
    description: "Physical Grass moves deal extra damage.",
    tagsAffected: ["Physical", "Grass"],
    trigger: {
      onDamageCalc: ({ move, amount, user }) => {
        if (move.type !== "Grass" || move.category !== "Physical") return amount;
        const grade = user.getTalentGrade("petalImpact");
        return amount * (grade === "Epic" ? 1.25 : grade === "Rare" ? 1.15 : 1.08);
      }
    }
  },

  plagueSpreader: {
    id: "plagueSpreader",
    name: "Plague Spreader",
    description: "AoE poison/status moves affect all enemies.",
    tagsAffected: ["Poison", "Status"],
    trigger: {
      onMoveHit: ({ move, user, battle }) => {
        if (move.type !== "Poison" || !move.isAoE) return;
        const grade = user.getTalentGrade("plagueSpreader");
        const chance = grade === "Epic" ? 0.3 : grade === "Rare" ? 0.2 : 0.1;
        battle.getOpposingTeam(user).forEach((enemy) => {
          if (enemy !== move.target && Math.random() < chance) {
            enemy.applyStatus("Poison");
          }
        });
      }
    }
  },

  pollenArmor: {
    id: "pollenArmor",
    name: "Pollen Armor",
    description: "Sp. Def increases when hit by Powder moves.",
    tagsAffected: ["Powder"],
    trigger: {
      onTargetedByMove: ({ move, user }) => {
        if (!hasAnyTag(move, ["Powder"])) return;
        const grade = user.getTalentGrade("pollenArmor");
        user.addStatBuff("SpDef", grade === "Epic" ? 2 : 1);
      }
    }
  },

  sunlightGrace: {
    id: "sunlightGrace",
    name: "Sunlight Grace",
    description: "Healing moves restore more HP in sunny weather.",
    tagsAffected: ["Healing"],
    trigger: {
      onHeal: ({ user, amount }) => {
        const isSunny = user.battle?.weather === "Sunny";
        if (!isSunny) return amount;
        const grade = user.getTalentGrade("sunlightGrace");
        const boost = grade === "Epic" ? 1.3 : grade === "Rare" ? 1.2 : 1.1;
        return amount * boost;
      }
    }
  },

  petalVeil: {
    id: "petalVeil",
    name: "Petal Veil",
    description: "Chance to cleanse an ally when hit.",
    tagsAffected: ["Status", "Cleanse"],
    trigger: {
      onHit: ({ user }) => {
        const grade = user.getTalentGrade("petalVeil");
        const chance = grade === "Epic" ? 0.5 : grade === "Rare" ? 0.4 : 0.3;
        if (Math.random() < chance) {
          const ally = user.team.find((pokemon) => pokemon !== user && pokemon.hasStatus());
          if (ally) ally.cureStatus();
        }
      }
    }
  },

  terrainFlow: {
    id: "terrainFlow",
    name: "Terrain Flow",
    description: "Extends duration of terrain effects when applied by this Pokémon.",
    tagsAffected: ["Terrain"],
    trigger: {
      onTerrainSet: ({ user, terrain }) => {
        const grade = user.getTalentGrade("terrainFlow");
        terrain.duration += grade === "Epic" ? 3 : grade === "Rare" ? 2 : 1;
      }
    }
  },

  blossomSync: {
    id: "blossomSync",
    name: "Blossom Sync",
    description: "When healing, nearby allies gain 25% of the effect.",
    tagsAffected: ["Healing", "Grass"],
    trigger: {
      onHeal: ({ user, amount }) => {
        const grade = user.getTalentGrade("blossomSync");
        const ratio = grade === "Epic" ? 0.5 : grade === "Rare" ? 0.4 : 0.25;
        user.team.forEach((ally) => {
          if (ally !== user) ally.healFlat(Math.floor(amount * ratio));
        });
      }
    }
  },

  pollinationBoon: {
    id: "pollinationBoon",
    name: "Pollination Boon",
    description: "Powder moves slightly heal nearby allies.",
    tagsAffected: ["Powder", "Healing"],
    trigger: {
      onMoveHit: ({ move, user }) => {
        if (!hasAnyTag(move, ["Powder"])) return;
        const grade = user.getTalentGrade("pollinationBoon");
        const healAmount = grade === "Epic" ? 0.07 : grade === "Rare" ? 0.05 : 0.03;
        user.team.forEach((ally) => {
          if (ally !== user) ally.healPercent(healAmount);
        });
      }
    }
  },

  healingFragrance: {
    id: "healingFragrance",
    name: "Healing Fragrance",
    description: "Auto-cleanses minor statuses while in terrain.",
    tagsAffected: ["Terrain", "Cleanse"],
    trigger: {
      onTurnStart: ({ user }) => {
        const grade = user.getTalentGrade("healingFragrance");
        const chance = grade === "Epic" ? 1.0 : grade === "Rare" ? 0.5 : 0.25;
        if (user.battle?.terrain && Math.random() < chance) {
          user.cureMinorStatuses();
        }
      }
    }
  },

  bondedRoot: {
    id: "bondedRoot",
    name: "Bonded Root",
    description: "Heals an ally when healing yourself.",
    tagsAffected: ["Healing", "Grass"],
    trigger: {
      onHeal: ({ user, amount }) => {
        const grade = user.getTalentGrade("bondedRoot");
        const heal = grade === "Epic" ? 0.5 : grade === "Rare" ? 0.35 : 0.2;
        const ally = user.team.find((pokemon) => pokemon !== user && pokemon.hp < pokemon.maxHP);
        if (ally) ally.healFlat(Math.floor(amount * heal));
      }
    }
  },

  calmingBloom: {
    id: "calmingBloom",
    name: "Calming Bloom",
    description: "Lowers target's crit chance after status move.",
    tagsAffected: ["Status"],
    trigger: {
      onMoveHit: ({ move, target, user }) => {
        if (move.category !== "Status") return;
        const grade = user.getTalentGrade("calmingBloom");
        const stages = grade === "Epic" ? -2 : grade === "Rare" ? -1 : 0;
        target.addStatBuff("CritRate", stages);
      }
    }
  },

  petalHarmony: {
    id: "petalHarmony",
    name: "Petal Harmony",
    description: "Reduces ally move cooldowns during terrain.",
    tagsAffected: ["Terrain"],
    trigger: {
      onTurnEnd: ({ user }) => {
        if (user.battle?.terrain !== "Grass") return;
        const grade = user.getTalentGrade("petalHarmony");
        const ticks = grade === "Epic" ? 2 : grade === "Rare" ? 1 : 0;
        user.team.forEach((pokemon) => {
          pokemon.reduceAllCooldowns(ticks);
        });
      }
    }
  },

  resilientGrowth: {
    id: "resilientGrowth",
    name: "Resilient Growth",
    description: "Prevents stat debuffs when below 25% HP.",
    tagsAffected: ["Status"],
    trigger: {
      onStatDropAttempt: ({ user }) => {
        if (user.hp / user.maxHP >= 0.25) return;
        return "BLOCK";
      }
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
    tagsAffected: ["Flying"],
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

  gustSurge: {
    id: "gustSurge",
    name: "Gust Surge",
    description: "Flying-type moves gain power if used consecutively.",
    tagsAffected: ["Flying"],
    trigger: "onMoveUse",
    grades: {
      Basic: { description: "Consecutive Flying moves deal slightly more damage." },
      Rare: { description: "Consecutive Flying moves deal more damage." },
      Epic: { description: "Consecutive Flying moves deal significantly more damage." }
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
    tagsAffected: ["Terrain"],
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

  windDance: {
    id: "windDance",
    name: "Wind Dance",
    description: "Gains speed or evasion while Tailwind-like effects are active.",
    tagsAffected: ["Terrain"],
    trigger: "onWeatherSet",
    grades: {
      Basic: { description: "Gain Speed while Tailwind is active." },
      Rare: { description: "Gain Speed and evasion while Tailwind is active." },
      Epic: { description: "Gain extra Speed and evasion while Tailwind is active." }
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
  },
  reinforcedCarapace: {
    id: "reinforcedCarapace",
    name: "Reinforced Carapace",
    trigger: "onDamageTaken",
    grades: {
      Basic: { description: "Reduces damage from critical hits by 10%." },
      Rare: { description: "Reduces damage from critical hits by 20%." },
      Epic: { description: "Reduces damage from critical hits by 30%." }
    }
  },
  ironShell: {
    id: "ironShell",
    name: "Iron Shell",
    trigger: "onContactReceived",
    grades: {
      Basic: { description: "5% chance to reflect 10% of physical damage taken." },
      Rare: { description: "10% chance to reflect 15% of physical damage taken." },
      Epic: { description: "15% chance to reflect 20% of physical damage taken." }
    }
  },
  compoundEyes: {
    id: "compoundEyes",
    name: "Compound Eyes",
    description: "Increases accuracy of all moves by 10%–30%.",
    gradeScaling: { basic: 1.1, rare: 1.2, epic: 1.3 },
    trigger: "onMoveUse",
    grades: {
      Basic: { description: "Moves gain 10% accuracy." },
      Rare: { description: "Moves gain 20% accuracy." },
      Epic: { description: "Moves gain 30% accuracy." }
    }
  },
  pollenSurge: {
    id: "pollenSurge",
    name: "Pollen Surge",
    description: "Bug-type moves may heal allies for 5% HP.",
    gradeScaling: { basic: 0.1, rare: 0.15, epic: 0.2 },
    trigger: "onMoveHit",
    grades: {
      Basic: { description: "10% chance to heal allies for 5% max HP." },
      Rare: { description: "15% chance to heal allies for 5% max HP." },
      Epic: { description: "20% chance to heal allies for 5% max HP." }
    }
  },
  dreamTouch: {
    id: "dreamTouch",
    name: "Dream Touch",
    description: "Inflicts -1 Sp. Def when putting a target to Sleep.",
    trigger: "onStatusApply",
    grades: {
      Basic: { description: "Sleep lowers Sp. Def by 1 stage for 3 turns." },
      Rare: { description: "Sleep lowers Sp. Def by 1 stage for 3 turns." },
      Epic: { description: "Sleep lowers Sp. Def by 1 stage for 3 turns." }
    }
  },
  powderExpert: {
    id: "powderExpert",
    name: "Powder Expert",
    description: "Increases powder move accuracy by 20%.",
    trigger: "onMoveUse",
    grades: {
      Basic: { description: "Powder moves gain +20 accuracy." },
      Rare: { description: "Powder moves gain +20 accuracy." },
      Epic: { description: "Powder moves gain +20 accuracy." }
    }
  },
  statusMaster: {
    id: "statusMaster",
    name: "Status Master",
    description: "Status moves have +1 priority.",
    trigger: "onMoveInit",
    grades: {
      Basic: { description: "Status moves gain +1 priority." },
      Rare: { description: "Status moves gain +1 priority." },
      Epic: { description: "Status moves gain +1 priority." }
    }
  },
  aerialSupport: {
    id: "aerialSupport",
    name: "Aerial Support",
    description: "Flying-type moves boost allies' Speed by 1 for 1 turn.",
    trigger: "onMoveHit",
    grades: {
      Basic: { description: "Support moves grant allies +1 Speed for 1 turn." },
      Rare: { description: "Support moves grant allies +1 Speed for 2 turns." },
      Epic: { description: "Support moves grant allies +1 Speed for 3 turns." }
    }
  },
  tailwindInstinct: {
    id: "tailwindInstinct",
    name: "Tailwind Instinct",
    description: "Tailwind lasts +1 turn and restores 5 PP to last move.",
    trigger: "onMoveUse",
    grades: {
      Basic: { description: "Tailwind lasts +1 turn and restores 5 PP." },
      Rare: { description: "Tailwind lasts +1 turn and restores 5 PP." },
      Epic: { description: "Tailwind lasts +1 turn and restores 5 PP." }
    }
  },
  powderTrail: {
    id: "powderTrail",
    name: "Powder Trail",
    description: "Applies powder move again 10% of the time next turn.",
    trigger: "onMoveHit",
    grades: {
      Basic: { description: "10% chance to reapply powder next turn." },
      Rare: { description: "10% chance to reapply powder next turn." },
      Epic: { description: "10% chance to reapply powder next turn." }
    }
  },
  mindBloom: {
    id: "mindBloom",
    name: "Mind Bloom",
    description: "Psychic moves may lower Sp. Atk by 1.",
    trigger: "onMoveHit",
    grades: {
      Basic: { description: "20% chance to lower Sp. Atk by 1." },
      Rare: { description: "20% chance to lower Sp. Atk by 1." },
      Epic: { description: "20% chance to lower Sp. Atk by 1." }
    }
  },
  etherealPresence: {
    id: "etherealPresence",
    name: "Ethereal Presence",
    description: "30% chance to ignore all status after being hit by one.",
    trigger: "onStatusApply",
    grades: {
      Basic: { description: "30% chance to gain 2 turns of status immunity." },
      Rare: { description: "30% chance to gain 2 turns of status immunity." },
      Epic: { description: "30% chance to gain 2 turns of status immunity." }
    }
  },
  staticField: {
    id: "staticField",
    name: "Static Field",
    description: "Contact hits may paralyze the attacker.",
    tags: ["Electric", "Paralyze"],
    tagsAffected: ["Paralyze", "Electric"],
    trigger: "onContactReceived",
    grades: {
      Basic: { description: "30% chance to paralyze contact attackers." },
      Rare: { description: "50% chance to paralyze contact attackers." },
      Epic: { description: "Contact attackers are always paralyzed." }
    }
  },
  shockAffinity: {
    id: "shockAffinity",
    name: "Shock Affinity",
    description: "Boosts Electric-type move damage.",
    tags: ["Electric", "DamageBoost"],
    tagsAffected: ["Electric", "DamageBoost"],
    trigger: "onMoveUse",
    grades: {
      Basic: { description: "Electric moves deal 10% more damage." },
      Rare: { description: "Electric moves deal 20% more damage." },
      Epic: { description: "Electric moves deal 30% more damage." }
    }
  },
  quickstep: {
    id: "quickstep",
    name: "Quickstep",
    description: "Gains Speed on the first turn in battle.",
    tags: ["Speed", "Buff"],
    tagsAffected: ["Speed", "Buff"],
    trigger: "onTurnStart",
    grades: {
      Basic: { description: "First turn: +1 Speed." },
      Rare: { description: "First turn: +2 Speed." },
      Epic: { description: "First turn: +3 Speed." }
    }
  },
  voltageStorage: {
    id: "voltageStorage",
    name: "Voltage Storage",
    description: "Stores charge when targeted to boost the next Electric move.",
    tags: ["Electric", "Burst"],
    tagsAffected: ["Electric", "Burst"],
    trigger: "onMoveUse",
    grades: {
      Basic: { description: "Next Electric move deals 20% more damage." },
      Rare: { description: "Next Electric move deals 50% more damage." },
      Epic: { description: "Next Electric move deals double damage." }
    }
  },
  burstFocus: {
    id: "burstFocus",
    name: "Burst Focus",
    description: "Priority moves boost Attack.",
    tags: ["Priority", "Attack", "Buff"],
    tagsAffected: ["Priority", "Attack", "Buff"],
    trigger: "onMoveUse",
    grades: {
      Basic: { description: "Priority moves grant +1 Attack." },
      Rare: { description: "Priority moves grant +2 Attack." },
      Epic: { description: "Priority moves grant +2 Attack." }
    }
  },
  stormAttractor: {
    id: "stormAttractor",
    name: "Storm Attractor",
    description: "Draws in Electric moves, nullifying them and boosting Speed.",
    tags: ["Electric", "Redirect", "Speed"],
    tagsAffected: ["Electric", "Redirect", "Speed"],
    trigger: "onMoveInit",
    grades: {
      Basic: { description: "Electric moves grant +1 Speed and are nullified." },
      Rare: { description: "Electric moves grant +2 Speed and are nullified." },
      Epic: { description: "Electric moves grant +2 Speed and are nullified." }
    }
  },
  circuitSync: {
    id: "circuitSync",
    name: "Circuit Sync",
    description: "Gains Speed each turn if another Pokémon is paralyzed.",
    tags: ["Paralyze", "Speed", "Synergy"],
    tagsAffected: ["Paralyze", "Speed", "Synergy"],
    trigger: "onTurnStart",
    grades: {
      Basic: { description: "If any Pokémon is paralyzed, gain +1 Speed." },
      Rare: { description: "If any Pokémon is paralyzed, gain +2 Speed." },
      Epic: { description: "If any Pokémon is paralyzed, gain +2 Speed." }
    }
  },
  voltaicCoat: {
    id: "voltaicCoat",
    name: "Voltaic Coat",
    description: "Reduces damage from physical hits and may paralyze the attacker.",
    tags: ["Electric", "Paralyze", "Defense"],
    tagsAffected: ["Defense", "Paralyze", "Electric"],
    trigger: "onHit",
    grades: {
      Basic: { description: "Reduce physical damage by 20% and 10% paralyze chance." },
      Rare: { description: "Reduce physical damage by 30% and 20% paralyze chance." },
      Epic: { description: "Reduce physical damage by 40% and 30% paralyze chance." }
    }
  },
  hyperReflex: {
    id: "hyperReflex",
    name: "Hyper Reflex",
    description: "Immune to priority moves.",
    tags: ["Priority", "Immunity"],
    tagsAffected: ["Priority", "Immunity"],
    trigger: "onMoveInit",
    grades: {
      Basic: { description: "Blocks incoming priority moves." },
      Rare: { description: "Blocks incoming priority moves." },
      Epic: { description: "Blocks incoming priority moves." }
    }
  },
  batteryPack: {
    id: "batteryPack",
    name: "Battery Pack",
    description: "Restores PP for Electric moves each turn.",
    tags: ["Electric", "Recovery", "Utility"],
    tagsAffected: ["Electric", "Recovery", "Utility"],
    trigger: "onTurnStart",
    grades: {
      Basic: { description: "Restore 1 PP to Electric moves each turn." },
      Rare: { description: "Restore 2 PP to Electric moves each turn." },
      Epic: { description: "Restore 2 PP to Electric moves each turn." }
    }
  },
  overchargeWave: {
    id: "overchargeWave",
    name: "Overcharge Wave",
    description: "Every few Electric-type moves cause splash damage to adjacent enemies.",
    tags: ["Electric", "AOE"],
    tagsAffected: ["Electric", "AOE"],
    trigger: "onMoveHit",
    grades: {
      Basic: { description: "Every 4th Electric move splashes 20% damage." },
      Rare: { description: "Every 3rd Electric move splashes 25% damage." },
      Epic: { description: "Every 3rd Electric move splashes 40% damage." }
    }
  },
  supercell: {
    id: "supercell",
    name: "Supercell",
    description: "In rain, Electric moves deal more damage and may never miss.",
    tags: ["Weather", "Electric"],
    tagsAffected: ["Weather", "Electric"],
    trigger: "onMoveUse",
    grades: {
      Basic: { description: "In rain, Electric moves deal 15% more damage." },
      Rare: { description: "In rain, Electric moves deal 25% more damage." },
      Epic: { description: "In rain, Electric moves deal 25% more damage and cannot miss." }
    }
  },
  surgeRedirect: {
    id: "surgeRedirect",
    name: "Surge Redirect",
    description: "Redirects Electric moves targeting allies and boosts Speed.",
    tags: ["Electric", "Support"],
    tagsAffected: ["Electric", "Support"],
    trigger: "onMoveInit",
    grades: {
      Basic: { description: "Redirect Electric moves and gain +1 Speed." },
      Rare: { description: "Redirect Electric moves and gain +2 Speed." },
      Epic: { description: "Redirect Electric moves and gain +2 Speed with resistance." }
    }
  },
  ionAmplifier: {
    id: "ionAmplifier",
    name: "Ion Amplifier",
    description: "Electric moves bypass buffs and barriers.",
    tags: ["Electric", "Bypass"],
    tagsAffected: ["Electric", "Bypass"],
    trigger: "onMoveHit",
    grades: {
      Basic: { description: "Electric moves bypass buffs." },
      Rare: { description: "Electric moves bypass buffs and partially pierce shields." },
      Epic: { description: "Electric moves fully bypass buffs and barriers." }
    }
  },

  berryAroma: {
    id: "berryAroma",
    name: "Berry Aroma",
    description: "Berry-based healing effects restore additional HP.",
    tags: ["Healing", "Berry"],
    tagsAffected: ["Healing", "Berry"],
    trigger: "onTurnStart",
    grades: {
      Basic: { description: "Healing from berries and drain moves +10%." },
      Rare: { description: "Healing from berries and drain moves +15%." },
      Epic: { description: "Healing from berries and drain moves +25%." }
    }
  },
  sunSip: {
    id: "sunSip",
    name: "Sun Sip",
    description: "Recovers a little HP each turn in sunny weather.",
    tags: ["Weather", "Healing"],
    tagsAffected: ["Weather", "Healing"],
    trigger: "onTurnStart",
    grades: {
      Basic: { description: "Recover 3% max HP in sun." },
      Rare: { description: "Recover 5% max HP in sun." },
      Epic: { description: "Recover 8% max HP in sun." }
    }
  },
  seedReserve: {
    id: "seedReserve",
    name: "Seed Reserve",
    description: "Boosts survivability when below half HP.",
    tags: ["Defense", "Survival"],
    tagsAffected: ["Defense", "Survival"],
    trigger: "onDamaged",
    grades: {
      Basic: { description: "When below 50% HP, gain +1 Def once per battle." },
      Rare: { description: "When below 50% HP, gain +1 Def/+1 Sp. Def once per battle." },
      Epic: { description: "When below 50% HP, gain +2 Def/+1 Sp. Def once per battle." }
    }
  },
  petalGuard: {
    id: "petalGuard",
    name: "Petal Guard",
    description: "Grants resistance to status moves.",
    tags: ["Status", "Defense"],
    tagsAffected: ["Status", "Defense"],
    trigger: "onMoveInit",
    grades: {
      Basic: { description: "10% chance to ignore status moves." },
      Rare: { description: "18% chance to ignore status moves." },
      Epic: { description: "28% chance to ignore status moves." }
    }
  },
  orchardRhythm: {
    id: "orchardRhythm",
    name: "Orchard Rhythm",
    description: "Using a support move grants minor Speed momentum.",
    tags: ["Support", "Speed"],
    tagsAffected: ["Support", "Speed"],
    trigger: "onMoveUse",
    grades: {
      Basic: { description: "After support move, 20% chance for +1 Speed." },
      Rare: { description: "After support move, 35% chance for +1 Speed." },
      Epic: { description: "After support move, 50% chance for +1 Speed." }
    }
  },
  sweetCanopy: {
    id: "sweetCanopy",
    name: "Sweet Canopy",
    description: "Reduces incoming special damage.",
    tags: ["Defense", "Special"],
    tagsAffected: ["Defense", "Special"],
    trigger: "onDamaged",
    grades: {
      Basic: { description: "Reduce incoming special damage by 5%." },
      Rare: { description: "Reduce incoming special damage by 8%." },
      Epic: { description: "Reduce incoming special damage by 12%." }
    }
  },
  fruitfulBloom: {
    id: "fruitfulBloom",
    name: "Fruitful Bloom",
    description: "Healing moves are more effective at low HP.",
    tags: ["Healing", "Support"],
    tagsAffected: ["Healing", "Support"],
    trigger: "onTurnStart",
    grades: {
      Basic: { description: "Healing moves gain +10% potency under 50% HP." },
      Rare: { description: "Healing moves gain +18% potency under 50% HP." },
      Epic: { description: "Healing moves gain +25% potency under 50% HP." }
    }
  },
  solarNectar: {
    id: "solarNectar",
    name: "Solar Nectar",
    description: "Sunlight boosts Grass move pressure.",
    tags: ["Weather", "Grass"],
    tagsAffected: ["Weather", "Grass"],
    trigger: "onMoveUse",
    grades: {
      Basic: { description: "In sun, Grass move power +8%." },
      Rare: { description: "In sun, Grass move power +12%." },
      Epic: { description: "In sun, Grass move power +18%." }
    }
  },
  harvestPulse: {
    id: "harvestPulse",
    name: "Harvest Pulse",
    description: "Occasionally restores a spent berry effect during battle.",
    tags: ["Berry", "Utility"],
    tagsAffected: ["Berry", "Utility"],
    trigger: "onTurnStart",
    grades: {
      Basic: { description: "10% chance to refresh berry state once." },
      Rare: { description: "15% chance to refresh berry state once." },
      Epic: { description: "25% chance to refresh berry state once." }
    }
  },
  verdantGift: {
    id: "verdantGift",
    name: "Verdant Gift",
    description: "Provides ally-friendly stat support in sunny weather.",
    tags: ["Support", "Weather"],
    tagsAffected: ["Support", "Weather"],
    trigger: "onTurnStart",
    grades: {
      Basic: { description: "In sun, grants a small support buff once per battle." },
      Rare: { description: "In sun, grants a medium support buff once per battle." },
      Epic: { description: "In sun, grants a strong support buff once per battle." }
    }
  },
  sweetRush: {
    id: 'sweetRush',
    name: 'Sweet Rush',
    description: 'Gains momentum while healthy.',
    tags: ['Speed', 'Tempo'],
    tagsAffected: ['Speed', 'Tempo'],
    trigger: 'onTurnStart',
    grades: {
      Basic: { description: 'At high HP, 10% chance to gain +1 Speed.' },
      Rare: { description: 'At high HP, 18% chance to gain +1 Speed.' },
      Epic: { description: 'At high HP, 28% chance to gain +1 Speed.' }
    }
  },
  queenlyPoise: {
    id: 'queenlyPoise',
    name: 'Queenly Poise',
    description: 'Counters aggression after taking damage.',
    tags: ['Defense', 'Debuff'],
    tagsAffected: ['Defense', 'Debuff'],
    trigger: 'onDamaged',
    grades: {
      Basic: { description: '20% chance to lower attacker Attack by 1.' },
      Rare: { description: '30% chance to lower attacker Attack by 1.' },
      Epic: { description: '40% chance to lower attacker Attack by 1 and Speed by 1.' }
    }
  },
  tropicGuard: {
    id: 'tropicGuard',
    name: 'Tropic Guard',
    description: 'Softens incoming special attacks.',
    tags: ['Defense', 'Special'],
    tagsAffected: ['Defense', 'Special'],
    trigger: 'onDamaged',
    grades: {
      Basic: { description: 'Reduce incoming special damage by 5%.' },
      Rare: { description: 'Reduce incoming special damage by 10%.' },
      Epic: { description: 'Reduce incoming special damage by 15%.' }
    }
  },
  velvetAroma: {
    id: 'velvetAroma',
    name: 'Velvet Aroma',
    description: 'Improves healing and support moves.',
    tags: ['Support', 'Healing'],
    tagsAffected: ['Support', 'Healing'],
    trigger: 'onMoveUse',
    grades: {
      Basic: { description: 'Healing/support moves gain +8% potency.' },
      Rare: { description: 'Healing/support moves gain +14% potency.' },
      Epic: { description: 'Healing/support moves gain +20% potency.' }
    }
  },
  stompTempo: {
    id: 'stompTempo',
    name: 'Stomp Tempo',
    description: 'Physical footwork ramps pressure.',
    tags: ['Physical', 'Tempo'],
    tagsAffected: ['Physical', 'Tempo'],
    trigger: 'onMoveUse',
    grades: {
      Basic: { description: 'Physical moves gain +6% power.' },
      Rare: { description: 'Physical moves gain +10% power.' },
      Epic: { description: 'Physical moves gain +15% power.' }
    }
  },
  crownStep: {
    id: 'crownStep',
    name: 'Crown Step',
    description: 'Signature kicks apply extra pressure.',
    tags: ['Signature', 'Debuff'],
    tagsAffected: ['Signature', 'Debuff'],
    trigger: 'onMoveUse',
    grades: {
      Basic: { description: 'Trop Kick has 15% chance to also lower Speed.' },
      Rare: { description: 'Trop Kick has 25% chance to also lower Speed.' },
      Epic: { description: 'Trop Kick has 40% chance to also lower Speed.' }
    }
  },
  petalWard: {
    id: 'petalWard',
    name: 'Petal Ward',
    description: 'Can cleanse status at turn start.',
    tags: ['Status', 'Recovery'],
    tagsAffected: ['Status', 'Recovery'],
    trigger: 'onTurnStart',
    grades: {
      Basic: { description: '10% chance to clear own status.' },
      Rare: { description: '18% chance to clear own status.' },
      Epic: { description: '28% chance to clear own status.' }
    }
  },
  sunlitStride: {
    id: 'sunlitStride',
    name: 'Sunlit Stride',
    description: 'Sunlight enhances mobility and offense.',
    tags: ['Weather', 'Speed'],
    tagsAffected: ['Weather', 'Speed'],
    trigger: 'onTurnStart',
    grades: {
      Basic: { description: 'In sun, 15% chance for +1 Speed.' },
      Rare: { description: 'In sun, 25% chance for +1 Speed.' },
      Epic: { description: 'In sun, 35% chance for +1 Speed and +1 Atk.' }
    }
  },
  royalHarvest: {
    id: 'royalHarvest',
    name: 'Royal Harvest',
    description: 'Regrows berry utility in long fights.',
    tags: ['Berry', 'Utility'],
    tagsAffected: ['Berry', 'Utility'],
    trigger: 'onTurnStart',
    grades: {
      Basic: { description: '8% chance to refresh a consumed berry.' },
      Rare: { description: '14% chance to refresh a consumed berry.' },
      Epic: { description: '22% chance to refresh a consumed berry.' }
    }
  },
  majesticFlourish: {
    id: 'majesticFlourish',
    name: 'Majestic Flourish',
    description: 'One-time royal stat surge.',
    tags: ['Support', 'Buff'],
    tagsAffected: ['Support', 'Buff'],
    trigger: 'onTurnStart',
    grades: {
      Basic: { description: 'Once per battle, gain +1 Attack.' },
      Rare: { description: 'Once per battle, gain +1 Attack and +1 Defense.' },
      Epic: { description: 'Once per battle, gain +1 Attack, +1 Defense, and +1 Speed.' }
    }
  }
};

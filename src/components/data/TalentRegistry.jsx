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
  }
};

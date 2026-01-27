/**
 * Central Move Effect Registry
 * Defines custom logic for moves beyond base damage
 * Each effect receives a battle context and applies its logic
 */

export const MoveEffectRegistry = {
  stringShot: {
    apply: (ctx) => {
      ctx.addBattleLog(`${ctx.target.nickname || ctx.target.species}'s Speed fell sharply!`);
      ctx.target.modifyStat("speed", -2);
    }
  },

  stickyThread: {
    apply: (ctx) => {
      ctx.addBattleLog(`${ctx.target.nickname || ctx.target.species} was caught in sticky threads!`);
      ctx.target.modifyStat("speed", -2);
      ctx.target.modifyStat("accuracy", -1);
    }
  },

  bugBite: {
    apply: (ctx) => {
      const item = ctx.target.heldItem;
      if (item && item.type === "berry") {
        ctx.addBattleLog(`${ctx.user.nickname || ctx.user.species} stole and ate ${ctx.target.nickname || ctx.target.species}'s ${item.name}!`);
        ctx.target.heldItem = null;
        ctx.user.consumeItemEffect(item);
      }
    }
  },

  infestation: {
    apply: (ctx) => {
      const trapDuration = 4;
      ctx.addBattleLog(`${ctx.target.nickname || ctx.target.species} was infested!`);
      
      // Initialize passive effects array if needed
      if (!ctx.target.passiveEffects) {
        ctx.target.passiveEffects = [];
      }

      // Add passive DOT effect
      ctx.target.passiveEffects.push({
        id: "infestation",
        source: ctx.user.nickname || ctx.user.species,
        duration: trapDuration,
        trap: true,
        onTurnStart: (effectCtx) => {
          const maxHp = effectCtx.target.stats?.maxHp ?? 0;
          const damage = Math.floor(maxHp / 8);
          effectCtx.addBattleLog(`Infestation hurts ${effectCtx.target.nickname || effectCtx.target.species} for ${damage} HP!`);
          effectCtx.applyDamage(damage);
        }
      });
    }
  },

  echoThread: {
    apply: (ctx) => {
      ctx.addBattleLog(`${ctx.target.nickname || ctx.target.species} is caught in an echo thread!`);
      
      // Initialize passive effects array if needed
      if (!ctx.target.passiveEffects) {
        ctx.target.passiveEffects = [];
      }

      // Add passive effect that echoes stat changes for 3 turns
      ctx.target.passiveEffects.push({
        id: "echoThread",
        source: ctx.user.nickname || ctx.user.species,
        duration: 3,
        onTurnStart: (effectCtx) => {
          const lastChanges = effectCtx.target.lastStatChanges || [];
          if (lastChanges.length > 0) {
            effectCtx.addBattleLog(`Echo Thread echoes stat changes!`);
            lastChanges.forEach(change => {
              effectCtx.modifyStat(change.stat, change.stages);
            });
          }
        }
      });
    }
  },

  camouflage: {
    apply: (ctx) => {
      const terrain = ctx.battle.getTerrainType() || "normal";
      const newType = {
        grass: "Grass",
        cave: "Rock",
        water: "Water",
        sand: "Ground",
        snow: "Ice"
      }[terrain] || "Normal";

      ctx.addBattleLog(`${ctx.user.nickname || ctx.user.species} transformed into ${newType} type!`);
      ctx.user.changeType(newType);
    }
  },

  skitterSmack: {
    apply: (ctx) => {
      ctx.addBattleLog(`${ctx.target.nickname || ctx.target.species}'s Sp. Atk fell!`);
      ctx.target.modifyStat("spAtk", -1);
    }
  },

  safeguard: {
    apply: (ctx) => {
      ctx.addBattleLog(`${ctx.user.nickname || ctx.user.species}'s team is protected by Safeguard!`);
      ctx.userTeam.addAura("safeguard", { duration: 5 });
    }
  },

  silkBomb: {
    apply: (ctx) => {
      if (Math.random() < 0.2) {
        ctx.addBattleLog(`${ctx.target.nickname || ctx.target.species} was paralyzed!`);
        ctx.target.inflictStatus("paralyze");
      }
    }
  },

  cocoonShield: {
    apply: (ctx) => {
      ctx.addBattleLog(`${ctx.user.nickname || ctx.user.species} hardened its defenses!`);
      ctx.user.modifyStat("defense", 1);
      ctx.user.modifyStat("spDefense", 1);
    }
  },

  tackle: {
    apply: (ctx) => {
      // Standard damage move, no additional effects
    }
  }
};

/**
 * Apply move effect if registered
 * @param {string} moveName - Name of the move
 * @param {Object} ctx - Battle context
 */
export function applyMoveEffect(moveName, ctx) {
  if (!moveName) return;
  
  const effectKey = moveName.toLowerCase().replace(/\s+/g, '');
  const effect = MoveEffectRegistry[effectKey];
  
  if (effect && effect.apply) {
    try {
      effect.apply(ctx);
    } catch (error) {
      console.error(`Error applying effect for ${moveName}:`, error);
    }
  }
}

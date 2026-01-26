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
      const trapDuration = 4 + Math.floor(Math.random() * 2); // 4-5 turns
      ctx.addBattleLog(`${ctx.target.nickname || ctx.target.species} was infested!`);
      ctx.target.inflictEffect("trapped", { turns: trapDuration });
      ctx.target.inflictDOT("infestation", { 
        damage: Math.floor(ctx.target.stats.hp * 0.0625), // 1/16 max HP per turn
        duration: trapDuration 
      });
    }
  },

  echoThread: {
    apply: (ctx) => {
      const lastChanges = ctx.target.lastStatChanges || {};
      if (Object.keys(lastChanges).length === 0) {
        ctx.addBattleLog("But it failed!");
        return;
      }
      ctx.addBattleLog(`The stat changes were echoed back!`);
      for (const [stat, change] of Object.entries(lastChanges)) {
        ctx.target.modifyStat(stat, change);
      }
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
/**
 * Status Condition Registry
 * Defines standard status effects and their behaviors
 */

export const StatusRegistry = {
  burn: {
    id: "burn",
    name: "Burn",
    icon: "🔥",
    description: "Loses HP each turn. Halves physical damage dealt.",
    onTurnStart: (ctx) => {
      const dmg = Math.floor(ctx.user.stats.hp * 0.0625);
      const newHp = Math.max(0, ctx.user.currentHp - dmg);
      ctx.user.currentHp = newHp;
      ctx.addBattleLog(`${ctx.user.nickname || ctx.user.species} is hurt by its burn! (${dmg} damage)`);
    },
    modifyDamage: (ctx) => {
      if (ctx.move.category === "Physical") {
        ctx.damage = Math.floor(ctx.damage * 0.5);
      }
    }
  },

  poison: {
    id: "poison",
    name: "Poison",
    icon: "☠️",
    description: "Loses HP each turn.",
    onTurnStart: (ctx) => {
      const dmg = Math.floor(ctx.user.stats.hp * 0.0625);
      const newHp = Math.max(0, ctx.user.currentHp - dmg);
      ctx.user.currentHp = newHp;
      ctx.addBattleLog(`${ctx.user.nickname || ctx.user.species} is hurt by poison! (${dmg} damage)`);
    }
  },

  sleep: {
    id: "sleep",
    name: "Sleep",
    icon: "💤",
    description: "Cannot act for 1-3 turns.",
    onTurnStart: (ctx) => {
      if (!ctx.status.duration) {
        ctx.status.duration = Math.floor(Math.random() * 3) + 1;
      }
      
      ctx.status.duration--;
      if (ctx.status.duration <= 0) {
        ctx.user.status = null;
        ctx.addBattleLog(`${ctx.user.nickname || ctx.user.species} woke up!`);
      } else {
        ctx.addBattleLog(`${ctx.user.nickname || ctx.user.species} is fast asleep...`);
      }
    },
    preventsAction: (ctx) => {
      return ctx.status.duration > 0;
    }
  },

  paralyze: {
    id: "paralyze",
    name: "Paralyze",
    icon: "⚡",
    description: "May fail to act. Speed is halved.",
    onActionAttempt: (ctx) => {
      if (Math.random() < 0.25) {
        ctx.addBattleLog(`${ctx.user.nickname || ctx.user.species} is paralyzed! It can't move!`);
        return false; // Action prevented
      }
      return true; // Action allowed
    },
    modifySpeed: (ctx) => {
      return 0.5; // Halve speed
    }
  },

  freeze: {
    id: "freeze",
    name: "Freeze",
    icon: "❄️",
    description: "Cannot act. 20% chance to thaw each turn.",
    onTurnStart: (ctx) => {
      if (Math.random() < 0.2) {
        ctx.user.status = null;
        ctx.addBattleLog(`${ctx.user.nickname || ctx.user.species} thawed out!`);
      } else {
        ctx.addBattleLog(`${ctx.user.nickname || ctx.user.species} is frozen solid!`);
      }
    },
    preventsAction: (ctx) => {
      return true; // Always prevents action unless thawed
    }
  }
};

/**
 * Apply status condition to a Pokemon
 */
export function inflictStatus(pokemon, statusId, battleState, addBattleLog = () => {}) {
  if (pokemon.statusImmunities?.includes(statusId)) {
    addBattleLog(`${pokemon.nickname || pokemon.species} is immune to ${statusId}!`);
    return false;
  }

  if (pokemon.status) {
    addBattleLog(`${pokemon.nickname || pokemon.species} is already affected by ${pokemon.status.id}!`);
    return false;
  }
  
  const status = StatusRegistry[statusId];
  if (!status) {
    console.error(`Unknown status: ${statusId}`);
    return false;
  }
  
  pokemon.status = { 
    id: statusId, 
    duration: null 
  };
  
  addBattleLog(`${pokemon.nickname || pokemon.species} is now ${status.name}!`);
  return true;
}

/**
 * Clear status condition from Pokemon
 */
export function clearStatus(pokemon) {
  pokemon.status = null;
}

/**
 * Process status effects at turn start
 */
export function processStatusEffects(pokemon, battleState, addBattleLog) {
  if (!pokemon.status?.id) return;
  
  const status = StatusRegistry[pokemon.status.id];
  if (status?.onTurnStart) {
    status.onTurnStart({
      user: pokemon,
      status: pokemon.status,
      addBattleLog,
      battleState
    });
  }
}

/**
 * Check if status prevents action
 */
export function checkStatusPreventsAction(pokemon, addBattleLog) {
  if (!pokemon.status?.id) return false;
  
  const status = StatusRegistry[pokemon.status.id];
  
  // Check if action is prevented
  if (status?.preventsAction) {
    return status.preventsAction({ user: pokemon, status: pokemon.status, addBattleLog });
  }
  
  // Check on action attempt (paralysis)
  if (status?.onActionAttempt) {
    return !status.onActionAttempt({ user: pokemon, addBattleLog });
  }
  
  return false;
}

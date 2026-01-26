const getCurrentHp = (user) => {
  if (typeof user?.currentHp === 'number') return user.currentHp;
  if (typeof user?.hp === 'number') return user.hp;
  return 0;
};

const setCurrentHp = (user, value) => {
  if (typeof user?.currentHp === 'number' || user?.currentHp === undefined) {
    user.currentHp = value;
  }
  if (typeof user?.hp === 'number' || user?.hp === undefined) {
    user.hp = value;
  }
};

const getMaxHp = (user) => {
  if (typeof user?.stats?.hp === 'number') return user.stats.hp;
  if (typeof user?.stats?.maxHp === 'number') return user.stats.maxHp;
  if (typeof user?.maxHp === 'number') return user.maxHp;
  return 0;
};

const restoreHpPercent = (user, percent) => {
  const maxHp = getMaxHp(user);
  if (!maxHp) return;
  const currentHp = getCurrentHp(user);
  const healAmount = Math.max(1, Math.floor(maxHp * percent));
  setCurrentHp(user, Math.min(maxHp, currentHp + healAmount));
};

const modifyStat = (context, target, stat, stages) => {
  if (typeof context?.modifyStat === 'function') {
    context.modifyStat(target, stat, stages);
    return;
  }
  if (typeof target?.modifyStat === 'function') {
    target.modifyStat(stat, stages);
  }
};

const isDaylight = (context) => {
  const terrain = context?.battleState?.terrain || context?.terrain || context?.battle?.terrain;
  const weather = context?.battleState?.weather || context?.weather || context?.battle?.weather;
  return terrain === 'daylight' || weather === 'sun';
};

export const TalentEffectHandlers = {
  photosensitiveGrowth: {
    Basic: (context) => {
      if (isDaylight(context)) {
        modifyStat(context, context.user, 'speed', 1);
      }
    },
    Rare: (context) => {
      if (isDaylight(context)) {
        modifyStat(context, context.user, 'speed', 1);
        restoreHpPercent(context.user, 0.05);
      }
    },
    Epic: (context) => {
      if (isDaylight(context)) {
        modifyStat(context, context.user, 'speed', 1);
        modifyStat(context, context.user, 'spAtk', 1);
        restoreHpPercent(context.user, 0.1);
      }
    }
  },

  instinctiveSurvival: {
    Basic: (context) => {
      const currentHp = getCurrentHp(context.user);
      if (currentHp <= 0 && Math.random() < 0.1) {
        setCurrentHp(context.user, 1);
      }
    },
    Rare: (context) => {
      const currentHp = getCurrentHp(context.user);
      if (currentHp <= 0 && Math.random() < 0.2) {
        setCurrentHp(context.user, 1);
        modifyStat(context, context.user, 'speed', 1);
      }
    },
    Epic: (context) => {
      const currentHp = getCurrentHp(context.user);
      if (currentHp <= 0 && Math.random() < 0.3) {
        setCurrentHp(context.user, 1);
        modifyStat(context, context.user, 'speed', 2);
      }
    }
  },

  threadedReflex: {
    Basic: (context) => {
      if (Math.random() < 0.1) {
        modifyStat(context, context.attacker, 'speed', -1);
      }
    },
    Rare: (context) => {
      if (Math.random() < 0.2) {
        modifyStat(context, context.attacker, 'speed', -1);
        modifyStat(context, context.attacker, 'accuracy', -1);
      }
    },
    Epic: (context) => {
      if (Math.random() < 0.3) {
        modifyStat(context, context.attacker, 'speed', -2);
        modifyStat(context, context.attacker, 'accuracy', -1);
      }
    }
  },

  silkenGrip: {
    Basic: (context) => {
      if (Math.random() < 0.05) {
        return { immobilized: true, duration: 1 };
      }
      return null;
    },
    Rare: (context) => {
      if (Math.random() < 0.1) {
        return { immobilized: true, duration: 1 };
      }
      return null;
    },
    Epic: (context) => {
      if (Math.random() < 0.15) {
        return { immobilized: true, duration: 2 };
      }
      return null;
    }
  },

  moltingDefense: {
    Basic: (context) => {
      if (Math.random() < 0.3) {
        context.user.status = null;
      }
    },
    Rare: (context) => {
      if (context.turnCount % 3 === 0) {
        context.user.status = null;
      }
    },
    Epic: (context) => {
      if (context.turnCount % 2 === 0) {
        context.user.status = null;
        modifyStat(context, context.user, 'def', 1);
      }
    }
  },

  threadAmbush: {
    Basic: (context) => {
      modifyStat(context, context.target, 'speed', -1);
    },
    Rare: (context) => {
      modifyStat(context, context.target, 'speed', -1);
      return { trapped: true, duration: 1 };
    },
    Epic: (context) => {
      modifyStat(context, context.target, 'speed', -2);
      return { trapped: true, duration: 2 };
    }
  },

  scavengerInstinct: {
    Basic: (context) => {
      restoreHpPercent(context.user, 0.05);
    },
    Rare: (context) => {
      restoreHpPercent(context.user, 0.1);
      modifyStat(context, context.user, 'speed', 1);
    },
    Epic: (context) => {
      restoreHpPercent(context.user, 0.15);
      modifyStat(context, context.user, 'atk', 1);
      modifyStat(context, context.user, 'speed', 1);
    }
  },

  naturesCloak: {
    Basic: (context) => {
      if ((context?.battleState?.terrain || context?.terrain) === 'grass') {
        return { evasionBonus: 0.05 };
      }
      return null;
    },
    Rare: (context) => {
      if ((context?.battleState?.terrain || context?.terrain) === 'grass') {
        return { evasionBonus: 0.1, statusDodgeChance: 0.3 };
      }
      return null;
    },
    Epic: (context) => {
      if ((context?.battleState?.terrain || context?.terrain) === 'grass') {
        return { evasionBonus: 0.15, statusImmune: true };
      }
      return null;
    }
  },

  earlyInstinct: {
    Basic: (context) => {
      if (context.isFirstTurn) {
        return { priorityBoost: 1 };
      }
      return null;
    },
    Rare: (context) => {
      if (context.isFirstTurn) {
        return { priorityBoost: 1, critBoost: 0.1 };
      }
      return null;
    },
    Epic: (context) => {
      if (context.isFirstTurn) {
        return { priorityBoost: 2, critBoost: 0.2 };
      }
      return null;
    }
  },

  adaptiveShell: {
    Basic: (context) => {
      if (context.typeEffectiveness > 1) {
        return { damageReduction: 0.1 };
      }
      return null;
    },
    Rare: (context) => {
      if (context.typeEffectiveness > 1) {
        modifyStat(context, context.user, 'def', 1);
        return { damageReduction: 0.2 };
      }
      return null;
    },
    Epic: (context) => {
      if (context.typeEffectiveness > 1) {
        modifyStat(context, context.user, 'def', 1);
        modifyStat(context, context.user, 'spDef', 1);
        return { damageReduction: 0.3 };
      }
      return null;
    }
  },

  tangleReflexes: {
    Basic: (context) => {
      if (Math.random() < 0.05) {
        modifyStat(context, context.attacker, 'speed', -1);
      }
    },
    Rare: (context) => {
      if (Math.random() < 0.1) {
        modifyStat(context, context.attacker, 'speed', -1);
      }
    },
    Epic: (context) => {
      if (Math.random() < 0.15) {
        modifyStat(context, context.attacker, 'speed', -2);
      }
    }
  }
};

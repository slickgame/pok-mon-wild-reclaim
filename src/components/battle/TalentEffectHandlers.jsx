/**
 * Talent Effect Handlers
 * Implements the actual logic for each talent at each grade
 */

export const TalentEffectHandlers = {
  instinctiveSurvival: {
    Bronze: ({ user, addBattleLog }) => {
      if (user.currentHp <= 0 && Math.random() < 0.1) {
        user.currentHp = 1;
        addBattleLog(`${user.nickname || user.species} instinctively avoided fainting!`);
        return { survived: true };
      }
      return { survived: false };
    },
    Silver: ({ user, addBattleLog, modifyStat }) => {
      if (user.currentHp <= 0 && Math.random() < 0.2) {
        user.currentHp = 1;
        modifyStat(user, "speed", 1);
        addBattleLog(`${user.nickname || user.species} clung to life and sped up!`);
        return { survived: true };
      }
      return { survived: false };
    },
    Gold: ({ user, addBattleLog, modifyStat }) => {
      if (user.currentHp <= 0 && Math.random() < 0.3) {
        user.currentHp = 1;
        modifyStat(user, "speed", 2);
        addBattleLog(`${user.nickname || user.species}'s survival instinct activated!`);
        return { survived: true };
      }
      return { survived: false };
    }
  },

  scavengerInstinct: {
    Bronze: ({ user, addBattleLog }) => {
      const healAmount = Math.floor(user.stats.hp * 0.05);
      user.currentHp = Math.min(user.stats.hp, user.currentHp + healAmount);
      addBattleLog(`${user.nickname || user.species} restored ${healAmount} HP from scavenging!`);
    },
    Silver: ({ user, addBattleLog, modifyStat }) => {
      const healAmount = Math.floor(user.stats.hp * 0.10);
      user.currentHp = Math.min(user.stats.hp, user.currentHp + healAmount);
      modifyStat(user, "speed", 1);
      addBattleLog(`${user.nickname || user.species} scavenged HP and gained Speed!`);
    },
    Gold: ({ user, addBattleLog, modifyStat }) => {
      const healAmount = Math.floor(user.stats.hp * 0.15);
      user.currentHp = Math.min(user.stats.hp, user.currentHp + healAmount);
      modifyStat(user, "atk", 1);
      modifyStat(user, "speed", 1);
      addBattleLog(`${user.nickname || user.species} scavenged and powered up!`);
    }
  },

  threadedReflex: {
    Bronze: ({ user, attacker, addBattleLog, modifyStat }) => {
      if (Math.random() < 0.1) {
        modifyStat(attacker, "speed", -1);
        addBattleLog(`${user.nickname || user.species}'s threads slowed ${attacker.nickname || attacker.species}!`);
      }
    },
    Silver: ({ user, attacker, addBattleLog, modifyStat }) => {
      if (Math.random() < 0.2) {
        modifyStat(attacker, "speed", -1);
        modifyStat(attacker, "accuracy", -1);
        addBattleLog(`${user.nickname || user.species}'s threads hindered ${attacker.nickname || attacker.species}!`);
      }
    },
    Gold: ({ user, attacker, addBattleLog, modifyStat }) => {
      if (Math.random() < 0.3) {
        modifyStat(attacker, "speed", -2);
        modifyStat(attacker, "accuracy", -1);
        addBattleLog(`${user.nickname || user.species}'s threads severely hindered ${attacker.nickname || attacker.species}!`);
      }
    }
  },

  silkenGrip: {
    Bronze: ({ user, target, addBattleLog }) => {
      if (Math.random() < 0.05) {
        addBattleLog(`${target.nickname || target.species} was immobilized by silk!`);
        return { immobilized: true, duration: 1 };
      }
    },
    Silver: ({ user, target, addBattleLog }) => {
      if (Math.random() < 0.1) {
        addBattleLog(`${target.nickname || target.species} was caught in silk!`);
        return { immobilized: true, duration: 1 };
      }
    },
    Gold: ({ user, target, addBattleLog }) => {
      if (Math.random() < 0.15) {
        addBattleLog(`${target.nickname || target.species} was tightly bound!`);
        return { immobilized: true, duration: 2 };
      }
    }
  },

  moltingDefense: {
    Bronze: ({ user, addBattleLog }) => {
      if (Math.random() < 0.3) {
        addBattleLog(`${user.nickname || user.species} shed its status condition!`);
        return { cured: true };
      }
    },
    Silver: ({ user, addBattleLog, turnCount }) => {
      if (turnCount % 3 === 0) {
        addBattleLog(`${user.nickname || user.species} molted and cured itself!`);
        return { cured: true };
      }
    },
    Gold: ({ user, addBattleLog, modifyStat, turnCount }) => {
      if (turnCount % 2 === 0) {
        modifyStat(user, "defense", 1);
        addBattleLog(`${user.nickname || user.species} molted and hardened!`);
        return { cured: true };
      }
    }
  },

  threadAmbush: {
    Bronze: ({ user, target, addBattleLog, modifyStat }) => {
      modifyStat(target, "speed", -1);
      addBattleLog(`${user.nickname || user.species} ambushed with threads!`);
    },
    Silver: ({ user, target, addBattleLog, modifyStat }) => {
      modifyStat(target, "speed", -1);
      addBattleLog(`${target.nickname || target.species} was trapped by threads!`);
      return { trapped: true, duration: 1 };
    },
    Gold: ({ user, target, addBattleLog, modifyStat }) => {
      modifyStat(target, "speed", -2);
      addBattleLog(`${target.nickname || target.species} was severely trapped!`);
      return { trapped: true, duration: 2 };
    }
  },

  photosensitiveGrowth: {
    Bronze: ({ user, weather, addBattleLog }) => {
      if (weather === 'sun') {
        addBattleLog(`${user.nickname || user.species} thrives in sunlight!`);
        return { spAtkBoost: 0.1 };
      }
    },
    Silver: ({ user, weather, addBattleLog }) => {
      if (weather === 'sun') {
        const healAmount = Math.floor(user.stats.hp * 0.05);
        user.currentHp = Math.min(user.stats.hp, user.currentHp + healAmount);
        addBattleLog(`${user.nickname || user.species} absorbs sunlight!`);
        return { spAtkBoost: 0.1 };
      }
    },
    Gold: ({ user, weather, addBattleLog }) => {
      if (weather === 'sun') {
        const healAmount = Math.floor(user.stats.hp * 0.1);
        user.currentHp = Math.min(user.stats.hp, user.currentHp + healAmount);
        addBattleLog(`${user.nickname || user.species} flourishes in sunlight!`);
        return { spAtkBoost: 0.15 };
      }
    }
  },

  naturesCloak: {
    Bronze: ({ user, terrain, addBattleLog }) => {
      if (terrain === 'grass') {
        return { evasionBonus: 0.05 };
      }
    },
    Silver: ({ user, terrain, addBattleLog }) => {
      if (terrain === 'grass') {
        return { evasionBonus: 0.1, statusDodgeChance: 0.3 };
      }
    },
    Gold: ({ user, terrain, addBattleLog }) => {
      if (terrain === 'grass') {
        return { evasionBonus: 0.15, statusImmune: true };
      }
    }
  },

  earlyInstinct: {
    Bronze: ({ user, isFirstTurn, addBattleLog }) => {
      if (isFirstTurn) {
        addBattleLog(`${user.nickname || user.species} moves with heightened instinct!`);
        return { priorityBoost: 1 };
      }
    },
    Silver: ({ user, isFirstTurn, addBattleLog }) => {
      if (isFirstTurn) {
        addBattleLog(`${user.nickname || user.species}'s instincts sharpen!`);
        return { priorityBoost: 1, critBoost: 0.1 };
      }
    },
    Gold: ({ user, isFirstTurn, addBattleLog }) => {
      if (isFirstTurn) {
        addBattleLog(`${user.nickname || user.species} strikes with perfect timing!`);
        return { priorityBoost: 2, critBoost: 0.2 };
      }
    }
  },

  adaptiveShell: {
    Bronze: ({ user, typeEffectiveness, addBattleLog }) => {
      if (typeEffectiveness > 1) {
        addBattleLog(`${user.nickname || user.species}'s shell adapted!`);
        return { damageReduction: 0.1 };
      }
    },
    Silver: ({ user, typeEffectiveness, addBattleLog, modifyStat }) => {
      if (typeEffectiveness > 1) {
        modifyStat(user, "defense", 1);
        addBattleLog(`${user.nickname || user.species}'s shell hardened!`);
        return { damageReduction: 0.2 };
      }
    },
    Gold: ({ user, typeEffectiveness, addBattleLog, modifyStat }) => {
      if (typeEffectiveness > 1) {
        modifyStat(user, "defense", 1);
        modifyStat(user, "spDefense", 1);
        addBattleLog(`${user.nickname || user.species}'s shell fortified!`);
        return { damageReduction: 0.3 };
      }
    }
  },

  tangleReflexes: {
    Bronze: ({ user, addBattleLog, modifyStat, attacker }) => {
      if (Math.random() < 0.05) {
        modifyStat(attacker, "speed", -1);
        addBattleLog(`${user.nickname || user.species} dodged and tangled!`);
        return { dodged: true };
      }
    },
    Silver: ({ user, addBattleLog, modifyStat, attacker }) => {
      if (Math.random() < 0.1) {
        modifyStat(attacker, "speed", -1);
        addBattleLog(`${user.nickname || user.species} evaded and countered!`);
        return { dodged: true };
      }
    },
    Gold: ({ user, addBattleLog, modifyStat, attacker }) => {
      if (Math.random() < 0.15) {
        modifyStat(attacker, "speed", -2);
        addBattleLog(`${user.nickname || user.species} expertly dodged and tangled!`);
        return { dodged: true };
      }
    }
  }
};
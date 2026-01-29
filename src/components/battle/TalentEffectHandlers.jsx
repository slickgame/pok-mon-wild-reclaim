/**
 * Talent Effect Handlers
 * Implements the actual logic for each talent at each grade
 */

export const TalentEffectHandlers = {
  compoundEyes: {
    Basic: ({ move, addBattleLog }) => {
      if (move?.accuracy) {
        move.accuracy = Math.floor(move.accuracy * 1.1);
        addBattleLog?.('Compound Eyes sharpened accuracy.');
      }
    },
    Rare: ({ move, addBattleLog }) => {
      if (move?.accuracy) {
        move.accuracy = Math.floor(move.accuracy * 1.2);
        addBattleLog?.('Compound Eyes sharpened accuracy.');
      }
    },
    Epic: ({ move, addBattleLog }) => {
      if (move?.accuracy) {
        move.accuracy = Math.floor(move.accuracy * 1.3);
        addBattleLog?.('Compound Eyes sharpened accuracy.');
      }
    }
  },
  pollenSurge: {
    Basic: ({ attacker, move, playerTeam, enemyTeam, addBattleLog }) => {
      if (move?.type !== 'Bug' || Math.random() > 0.1) return;
      const allies = attacker === playerTeam?.[0] ? playerTeam : enemyTeam;
      healAllies(allies, attacker, addBattleLog);
    },
    Rare: ({ attacker, move, playerTeam, enemyTeam, addBattleLog }) => {
      if (move?.type !== 'Bug' || Math.random() > 0.15) return;
      const allies = attacker === playerTeam?.[0] ? playerTeam : enemyTeam;
      healAllies(allies, attacker, addBattleLog);
    },
    Epic: ({ attacker, move, playerTeam, enemyTeam, addBattleLog }) => {
      if (move?.type !== 'Bug' || Math.random() > 0.2) return;
      const allies = attacker === playerTeam?.[0] ? playerTeam : enemyTeam;
      healAllies(allies, attacker, addBattleLog);
    }
  },
  dreamTouch: {
    Basic: ({ target, status, modifyStat, addBattleLog }) => {
      applyDreamTouch(target, status, modifyStat, addBattleLog);
    },
    Rare: ({ target, status, modifyStat, addBattleLog }) => {
      applyDreamTouch(target, status, modifyStat, addBattleLog);
    },
    Epic: ({ target, status, modifyStat, addBattleLog }) => {
      applyDreamTouch(target, status, modifyStat, addBattleLog);
    }
  },
  powderExpert: {
    Basic: ({ move, addBattleLog }) => {
      if (!isPowderMove(move) || !move.accuracy) return;
      move.accuracy = Math.min(100, move.accuracy + 20);
      addBattleLog?.('Powder Expert increased powder accuracy.');
    },
    Rare: ({ move, addBattleLog }) => {
      if (!isPowderMove(move) || !move.accuracy) return;
      move.accuracy = Math.min(100, move.accuracy + 20);
      addBattleLog?.('Powder Expert increased powder accuracy.');
    },
    Epic: ({ move, addBattleLog }) => {
      if (!isPowderMove(move) || !move.accuracy) return;
      move.accuracy = Math.min(100, move.accuracy + 20);
      addBattleLog?.('Powder Expert increased powder accuracy.');
    }
  },
  statusMaster: {
    Basic: ({ move, addBattleLog }) => {
      if (move?.category !== 'Status') return;
      move.priority = (move.priority ?? 0) + 1;
      addBattleLog?.('Status Master quickened the move.');
    },
    Rare: ({ move, addBattleLog }) => {
      if (move?.category !== 'Status') return;
      move.priority = (move.priority ?? 0) + 1;
      addBattleLog?.('Status Master quickened the move.');
    },
    Epic: ({ move, addBattleLog }) => {
      if (move?.category !== 'Status') return;
      move.priority = (move.priority ?? 0) + 1;
      addBattleLog?.('Status Master quickened the move.');
    }
  },
  aerialSupport: {
    Basic: ({ attacker, move, playerTeam, enemyTeam, modifyStat, addBattleLog }) => {
      applyAerialSupport(attacker, move, playerTeam, enemyTeam, modifyStat, 1, addBattleLog);
    },
    Rare: ({ attacker, move, playerTeam, enemyTeam, modifyStat, addBattleLog }) => {
      applyAerialSupport(attacker, move, playerTeam, enemyTeam, modifyStat, 2, addBattleLog);
    },
    Epic: ({ attacker, move, playerTeam, enemyTeam, modifyStat, addBattleLog }) => {
      applyAerialSupport(attacker, move, playerTeam, enemyTeam, modifyStat, 3, addBattleLog);
    }
  },
  tailwindInstinct: {
    Basic: ({ attacker, move, battleState, addBattleLog }) => {
      applyTailwindInstinct(attacker, move, battleState, addBattleLog);
    },
    Rare: ({ attacker, move, battleState, addBattleLog }) => {
      applyTailwindInstinct(attacker, move, battleState, addBattleLog);
    },
    Epic: ({ attacker, move, battleState, addBattleLog }) => {
      applyTailwindInstinct(attacker, move, battleState, addBattleLog);
    }
  },
  powderTrail: {
    Basic: ({ target, move, addBattleLog }) => {
      applyPowderTrail(target, move, addBattleLog);
    },
    Rare: ({ target, move, addBattleLog }) => {
      applyPowderTrail(target, move, addBattleLog);
    },
    Epic: ({ target, move, addBattleLog }) => {
      applyPowderTrail(target, move, addBattleLog);
    }
  },
  mindBloom: {
    Basic: ({ move, target, modifyStat, addBattleLog }) => {
      applyMindBloom(move, target, modifyStat, addBattleLog);
    },
    Rare: ({ move, target, modifyStat, addBattleLog }) => {
      applyMindBloom(move, target, modifyStat, addBattleLog);
    },
    Epic: ({ move, target, modifyStat, addBattleLog }) => {
      applyMindBloom(move, target, modifyStat, addBattleLog);
    }
  },
  etherealPresence: {
    Basic: ({ target, addBattleLog }) => {
      applyEtherealPresence(target, addBattleLog);
    },
    Rare: ({ target, addBattleLog }) => {
      applyEtherealPresence(target, addBattleLog);
    },
    Epic: ({ target, addBattleLog }) => {
      applyEtherealPresence(target, addBattleLog);
    }
  },
  instinctiveSurvival: {
    Basic: ({ user, addBattleLog }) => {
      if (user.currentHp <= 0 && Math.random() < 0.1) {
        user.currentHp = 1;
        addBattleLog(`${user.nickname || user.species} instinctively avoided fainting!`);
        return { survived: true };
      }
      return { survived: false };
    },
    Bronze: ({ user, addBattleLog }) => {
      if (user.currentHp <= 0 && Math.random() < 0.1) {
        user.currentHp = 1;
        addBattleLog(`${user.nickname || user.species} instinctively avoided fainting!`);
        return { survived: true };
      }
      return { survived: false };
    },
    Rare: ({ user, addBattleLog, modifyStat }) => {
      if (user.currentHp <= 0 && Math.random() < 0.2) {
        user.currentHp = 1;
        modifyStat(user, "speed", 1);
        addBattleLog(`${user.nickname || user.species} clung to life and sped up!`);
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
    Epic: ({ user, addBattleLog, modifyStat }) => {
      if (user.currentHp <= 0 && Math.random() < 0.3) {
        user.currentHp = 1;
        modifyStat(user, "speed", 2);
        addBattleLog(`${user.nickname || user.species}'s survival instinct activated!`);
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
    Basic: ({ user, addBattleLog }) => {
      const healAmount = Math.floor(user.stats.hp * 0.05);
      user.currentHp = Math.min(user.stats.hp, user.currentHp + healAmount);
      addBattleLog(`${user.nickname || user.species} restored ${healAmount} HP from scavenging!`);
    },
    Bronze: ({ user, addBattleLog }) => {
      const healAmount = Math.floor(user.stats.hp * 0.05);
      user.currentHp = Math.min(user.stats.hp, user.currentHp + healAmount);
      addBattleLog(`${user.nickname || user.species} restored ${healAmount} HP from scavenging!`);
    },
    Rare: ({ user, addBattleLog, modifyStat }) => {
      const healAmount = Math.floor(user.stats.hp * 0.10);
      user.currentHp = Math.min(user.stats.hp, user.currentHp + healAmount);
      modifyStat(user, "speed", 1);
      addBattleLog(`${user.nickname || user.species} scavenged HP and gained Speed!`);
    },
    Silver: ({ user, addBattleLog, modifyStat }) => {
      const healAmount = Math.floor(user.stats.hp * 0.10);
      user.currentHp = Math.min(user.stats.hp, user.currentHp + healAmount);
      modifyStat(user, "speed", 1);
      addBattleLog(`${user.nickname || user.species} scavenged HP and gained Speed!`);
    },
    Epic: ({ user, addBattleLog, modifyStat }) => {
      const healAmount = Math.floor(user.stats.hp * 0.15);
      user.currentHp = Math.min(user.stats.hp, user.currentHp + healAmount);
      modifyStat(user, "atk", 1);
      modifyStat(user, "speed", 1);
      addBattleLog(`${user.nickname || user.species} scavenged and powered up!`);
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
    Basic: ({ user, attacker, addBattleLog, modifyStat }) => {
      if (Math.random() < 0.1) {
        modifyStat(attacker, "speed", -1);
        addBattleLog(`${user.nickname || user.species}'s threads slowed ${attacker.nickname || attacker.species}!`);
      }
    },
    Bronze: ({ user, attacker, addBattleLog, modifyStat }) => {
      if (Math.random() < 0.1) {
        modifyStat(attacker, "speed", -1);
        addBattleLog(`${user.nickname || user.species}'s threads slowed ${attacker.nickname || attacker.species}!`);
      }
    },
    Rare: ({ user, attacker, addBattleLog, modifyStat }) => {
      if (Math.random() < 0.2) {
        modifyStat(attacker, "speed", -1);
        modifyStat(attacker, "accuracy", -1);
        addBattleLog(`${user.nickname || user.species}'s threads hindered ${attacker.nickname || attacker.species}!`);
      }
    },
    Silver: ({ user, attacker, addBattleLog, modifyStat }) => {
      if (Math.random() < 0.2) {
        modifyStat(attacker, "speed", -1);
        modifyStat(attacker, "accuracy", -1);
        addBattleLog(`${user.nickname || user.species}'s threads hindered ${attacker.nickname || attacker.species}!`);
      }
    },
    Epic: ({ user, attacker, addBattleLog, modifyStat }) => {
      if (Math.random() < 0.3) {
        modifyStat(attacker, "speed", -2);
        modifyStat(attacker, "accuracy", -1);
        addBattleLog(`${user.nickname || user.species}'s threads severely hindered ${attacker.nickname || attacker.species}!`);
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
    Basic: ({ user, target, addBattleLog }) => {
      if (Math.random() < 0.05) {
        addBattleLog(`${target.nickname || target.species} was immobilized by silk!`);
        return { immobilized: true, duration: 1 };
      }
    },
    Bronze: ({ user, target, addBattleLog }) => {
      if (Math.random() < 0.05) {
        addBattleLog(`${target.nickname || target.species} was immobilized by silk!`);
        return { immobilized: true, duration: 1 };
      }
    },
    Rare: ({ user, target, addBattleLog }) => {
      if (Math.random() < 0.1) {
        addBattleLog(`${target.nickname || target.species} was caught in silk!`);
        return { immobilized: true, duration: 1 };
      }
    },
    Silver: ({ user, target, addBattleLog }) => {
      if (Math.random() < 0.1) {
        addBattleLog(`${target.nickname || target.species} was caught in silk!`);
        return { immobilized: true, duration: 1 };
      }
    },
    Epic: ({ user, target, addBattleLog }) => {
      if (Math.random() < 0.15) {
        addBattleLog(`${target.nickname || target.species} was tightly bound!`);
        return { immobilized: true, duration: 2 };
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
    Basic: ({ user, addBattleLog }) => {
      if (Math.random() < 0.3) {
        addBattleLog(`${user.nickname || user.species} shed its status condition!`);
        return { cured: true };
      }
    },
    Bronze: ({ user, addBattleLog }) => {
      if (Math.random() < 0.3) {
        addBattleLog(`${user.nickname || user.species} shed its status condition!`);
        return { cured: true };
      }
    },
    Rare: ({ user, addBattleLog, turnCount }) => {
      if (turnCount % 3 === 0) {
        addBattleLog(`${user.nickname || user.species} molted and cured itself!`);
        return { cured: true };
      }
    },
    Silver: ({ user, addBattleLog, turnCount }) => {
      if (turnCount % 3 === 0) {
        addBattleLog(`${user.nickname || user.species} molted and cured itself!`);
        return { cured: true };
      }
    },
    Epic: ({ user, addBattleLog, modifyStat, turnCount }) => {
      if (turnCount % 2 === 0) {
        modifyStat(user, "defense", 1);
        addBattleLog(`${user.nickname || user.species} molted and hardened!`);
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
    Basic: ({ user, target, addBattleLog, modifyStat, isFirstTurn }) => {
      if (!isFirstTurn) return;
      modifyStat(target, "speed", -1);
      addBattleLog(`${user.nickname || user.species} ambushed with threads!`);
    },
    Bronze: ({ user, target, addBattleLog, modifyStat, isFirstTurn }) => {
      if (!isFirstTurn) return;
      modifyStat(target, "speed", -1);
      addBattleLog(`${user.nickname || user.species} ambushed with threads!`);
    },
    Rare: ({ user, target, addBattleLog, modifyStat, isFirstTurn }) => {
      if (!isFirstTurn) return;
      modifyStat(target, "speed", -1);
      addBattleLog(`${target.nickname || target.species} was trapped by threads!`);
      return { trapped: true, duration: 1 };
    },
    Silver: ({ user, target, addBattleLog, modifyStat, isFirstTurn }) => {
      if (!isFirstTurn) return;
      modifyStat(target, "speed", -1);
      addBattleLog(`${target.nickname || target.species} was trapped by threads!`);
      return { trapped: true, duration: 1 };
    },
    Epic: ({ user, target, addBattleLog, modifyStat, isFirstTurn }) => {
      if (!isFirstTurn) return;
      modifyStat(target, "speed", -2);
      addBattleLog(`${target.nickname || target.species} was severely trapped!`);
      return { trapped: true, duration: 2 };
    },
    Gold: ({ user, target, addBattleLog, modifyStat, isFirstTurn }) => {
      if (!isFirstTurn) return;
      modifyStat(target, "speed", -2);
      addBattleLog(`${target.nickname || target.species} was severely trapped!`);
      return { trapped: true, duration: 2 };
    }
  },

  photosensitiveGrowth: {
    Basic: ({ user, weather, addBattleLog }) => {
      if (weather === 'sun') {
        addBattleLog(`${user.nickname || user.species} thrives in sunlight!`);
        return { spAtkBoost: 0.1 };
      }
    },
    Bronze: ({ user, weather, addBattleLog }) => {
      if (weather === 'sun') {
        addBattleLog(`${user.nickname || user.species} thrives in sunlight!`);
        return { spAtkBoost: 0.1 };
      }
    },
    Rare: ({ user, weather, addBattleLog }) => {
      if (weather === 'sun') {
        const healAmount = Math.floor(user.stats.hp * 0.05);
        user.currentHp = Math.min(user.stats.hp, user.currentHp + healAmount);
        addBattleLog(`${user.nickname || user.species} absorbs sunlight!`);
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
    Epic: ({ user, weather, addBattleLog }) => {
      if (weather === 'sun') {
        const healAmount = Math.floor(user.stats.hp * 0.1);
        user.currentHp = Math.min(user.stats.hp, user.currentHp + healAmount);
        addBattleLog(`${user.nickname || user.species} flourishes in sunlight!`);
        return { spAtkBoost: 0.15 };
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
    Basic: ({ user, terrain, addBattleLog }) => {
      if (terrain === 'grass') {
        return { evasionBonus: 0.05 };
      }
    },
    Bronze: ({ user, terrain, addBattleLog }) => {
      if (terrain === 'grass') {
        return { evasionBonus: 0.05 };
      }
    },
    Rare: ({ user, terrain, addBattleLog }) => {
      if (terrain === 'grass') {
        return { evasionBonus: 0.1, statusDodgeChance: 0.3 };
      }
    },
    Silver: ({ user, terrain, addBattleLog }) => {
      if (terrain === 'grass') {
        return { evasionBonus: 0.1, statusDodgeChance: 0.3 };
      }
    },
    Epic: ({ user, terrain, addBattleLog }) => {
      if (terrain === 'grass') {
        return { evasionBonus: 0.15, statusImmune: true };
      }
    },
    Gold: ({ user, terrain, addBattleLog }) => {
      if (terrain === 'grass') {
        return { evasionBonus: 0.15, statusImmune: true };
      }
    }
  },

  earlyInstinct: {
    Basic: ({ user, isFirstTurn, addBattleLog }) => {
      if (isFirstTurn) {
        addBattleLog(`${user.nickname || user.species} moves with heightened instinct!`);
        return { priorityBoost: 1 };
      }
    },
    Bronze: ({ user, isFirstTurn, addBattleLog }) => {
      if (isFirstTurn) {
        addBattleLog(`${user.nickname || user.species} moves with heightened instinct!`);
        return { priorityBoost: 1 };
      }
    },
    Rare: ({ user, isFirstTurn, addBattleLog }) => {
      if (isFirstTurn) {
        addBattleLog(`${user.nickname || user.species}'s instincts sharpen!`);
        return { priorityBoost: 1, critBoost: 0.1 };
      }
    },
    Silver: ({ user, isFirstTurn, addBattleLog }) => {
      if (isFirstTurn) {
        addBattleLog(`${user.nickname || user.species}'s instincts sharpen!`);
        return { priorityBoost: 1, critBoost: 0.1 };
      }
    },
    Epic: ({ user, isFirstTurn, addBattleLog }) => {
      if (isFirstTurn) {
        addBattleLog(`${user.nickname || user.species} strikes with perfect timing!`);
        return { priorityBoost: 2, critBoost: 0.2 };
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
    Basic: ({ user, typeEffectiveness, addBattleLog }) => {
      if (typeEffectiveness > 1) {
        addBattleLog(`${user.nickname || user.species}'s shell adapted!`);
        return { damageReduction: 0.1 };
      }
    },
    Bronze: ({ user, typeEffectiveness, addBattleLog }) => {
      if (typeEffectiveness > 1) {
        addBattleLog(`${user.nickname || user.species}'s shell adapted!`);
        return { damageReduction: 0.1 };
      }
    },
    Rare: ({ user, typeEffectiveness, addBattleLog, modifyStat }) => {
      if (typeEffectiveness > 1) {
        modifyStat(user, "defense", 1);
        addBattleLog(`${user.nickname || user.species}'s shell hardened!`);
        return { damageReduction: 0.2 };
      }
    },
    Silver: ({ user, typeEffectiveness, addBattleLog, modifyStat }) => {
      if (typeEffectiveness > 1) {
        modifyStat(user, "defense", 1);
        addBattleLog(`${user.nickname || user.species}'s shell hardened!`);
        return { damageReduction: 0.2 };
      }
    },
    Epic: ({ user, typeEffectiveness, addBattleLog, modifyStat }) => {
      if (typeEffectiveness > 1) {
        modifyStat(user, "defense", 1);
        modifyStat(user, "spDefense", 1);
        addBattleLog(`${user.nickname || user.species}'s shell fortified!`);
        return { damageReduction: 0.3 };
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
    Basic: ({ user, addBattleLog, modifyStat, attacker }) => {
      if (Math.random() < 0.05) {
        modifyStat(attacker, "speed", -1);
        addBattleLog(`${user.nickname || user.species} dodged and tangled!`);
        return { dodged: true };
      }
    },
    Bronze: ({ user, addBattleLog, modifyStat, attacker }) => {
      if (Math.random() < 0.05) {
        modifyStat(attacker, "speed", -1);
        addBattleLog(`${user.nickname || user.species} dodged and tangled!`);
        return { dodged: true };
      }
    },
    Rare: ({ user, addBattleLog, modifyStat, attacker }) => {
      if (Math.random() < 0.1) {
        modifyStat(attacker, "speed", -1);
        addBattleLog(`${user.nickname || user.species} evaded and countered!`);
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
    Epic: ({ user, addBattleLog, modifyStat, attacker }) => {
      if (Math.random() < 0.15) {
        modifyStat(attacker, "speed", -2);
        addBattleLog(`${user.nickname || user.species} expertly dodged and tangled!`);
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

function healAllies(allies, user, addBattleLog) {
  if (!allies || allies.length === 0) return;
  allies.forEach((ally) => {
    if (ally === user) return;
    const maxHp = ally.stats?.maxHp || ally.stats?.hp || ally.maxHP || ally.maxHp || 0;
    const healAmount = Math.floor(maxHp * 0.05);
    if (healAmount <= 0) return;
    ally.currentHp = Math.min(maxHp, (ally.currentHp ?? maxHp) + healAmount);
  });
  addBattleLog?.('Pollen Surge restored a bit of ally HP.');
}

function applyDreamTouch(target, status, modifyStat, addBattleLog) {
  if (status !== 'Sleep' || !target) return;
  if (target.passiveEffects?.some((effect) => effect.id === 'dreamTouchSpDef')) return;
  modifyStat?.(target, 'Sp. Def', -1);
  if (!target.passiveEffects) target.passiveEffects = [];
  target.passiveEffects.push({
    id: 'dreamTouchSpDef',
    displayName: 'Dream Touch',
    duration: 3,
    onExpire: ({ target: expireTarget }) => {
      modifyStat?.(expireTarget, 'Sp. Def', 1);
    }
  });
  addBattleLog?.('Dream Touch lowered Sp. Def while asleep.');
}

function isPowderMove(move) {
  if (!move?.name) return false;
  return move.name.toLowerCase().includes('powder') || move.name.toLowerCase().includes('spore');
}

function applyAerialSupport(attacker, move, playerTeam, enemyTeam, modifyStat, turns, addBattleLog) {
  if (!move || move.type !== 'Flying') return;
  const allies = attacker === playerTeam?.[0] ? playerTeam : enemyTeam;
  if (!allies) return;
  allies.forEach((ally) => {
    if (ally === attacker) return;
    modifyStat?.(ally, 'Speed', 1);
    if (!ally.passiveEffects) ally.passiveEffects = [];
    ally.passiveEffects.push({
      id: 'aerialSupportSpeed',
      displayName: 'Aerial Support',
      duration: turns,
      onExpire: ({ target }) => {
        modifyStat?.(target, 'Speed', -1);
      }
    });
  });
  addBattleLog?.('Aerial Support lifted ally speed.');
}

function applyTailwindInstinct(attacker, move, battleState, addBattleLog) {
  if (move?.name !== 'Tailwind') return;
  if (battleState?.battlefield?.terrainDuration !== undefined) {
    battleState.battlefield.terrainDuration += 1;
  }
  if (attacker?.lastMoveUsed) {
    addBattleLog?.('Tailwind Instinct restored 5 PP.');
  } else {
    addBattleLog?.('Tailwind Instinct extended Tailwind.');
  }
}

function applyPowderTrail(target, move, addBattleLog) {
  if (!target || !isPowderMove(move)) return;
  if (Math.random() > 0.1) return;
  if (!target.passiveEffects) target.passiveEffects = [];
  target.passiveEffects.push({
    id: 'powderTrail',
    displayName: 'Powder Trail',
    duration: 1
  });
  addBattleLog?.('Powder Trail lingers on the target.');
}

function applyMindBloom(move, target, modifyStat, addBattleLog) {
  if (move?.type !== 'Psychic' || Math.random() > 0.2) return;
  modifyStat?.(target, 'Sp. Atk', -1);
  addBattleLog?.('Mind Bloom weakened Sp. Atk.');
}

function applyEtherealPresence(target, addBattleLog) {
  if (!target || Math.random() > 0.3) return;
  const immunities = target.statusImmunities || [];
  const statuses = ['sleep', 'poison', 'paralyze', 'burn', 'confused'];
  target.statusImmunities = Array.from(new Set([...immunities, ...statuses]));
  if (!target.passiveEffects) target.passiveEffects = [];
  target.passiveEffects.push({
    id: 'etherealPresence',
    displayName: 'Ethereal Presence',
    duration: 2,
    onExpire: ({ target: expireTarget }) => {
      expireTarget.statusImmunities = (expireTarget.statusImmunities || []).filter(
        (status) => !statuses.includes(status)
      );
    }
  });
  addBattleLog?.('Ethereal Presence warded off status effects.');
}

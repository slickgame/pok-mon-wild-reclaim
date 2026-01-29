// Central status effect registry and hooks
export const StatusEffectRegistry = {
  Sleep: {
    name: 'Sleep',
    icon: '💤',
    description: 'Cannot act for 1-3 turns.',
    duration: () => Math.floor(Math.random() * 3) + 1,
    onTurnStart: ({ target, status }) => {
      status.turnsRemaining -= 1;
      if (status.turnsRemaining <= 0) {
        clearStatus(target);
        return { log: `${getPokemonName(target)} woke up!` };
      }
      return { skipTurn: true, log: `${getPokemonName(target)} is fast asleep...` };
    }
  },
  Poison: {
    name: 'Poison',
    icon: '☠️',
    description: 'Loses HP each turn.',
    duration: 'Infinite',
    onTurnEnd: ({ target }) => {
      const maxHp = getMaxHp(target);
      const damage = Math.floor(maxHp * 0.1);
      target.currentHp = Math.max((target.currentHp ?? maxHp) - damage, 0);
      return { log: `${getPokemonName(target)} is hurt by poison! (-${damage} HP)` };
    }
  },
  Paralysis: {
    name: 'Paralysis',
    icon: '⚡',
    description: 'May fail to act. Speed is reduced.',
    duration: 'Infinite',
    onMoveAttempt: ({ target }) => {
      if (Math.random() < 0.25) {
        return { cancel: true, log: `${getPokemonName(target)} is paralyzed and can't move!` };
      }
      return null;
    },
    applyEffect: ({ target }) => {
      if (target.modifyStat) {
        target.modifyStat('Speed', 0.5);
      }
    },
    removeEffect: ({ target }) => {
      if (target.restoreStat) {
        target.restoreStat('Speed');
      }
    }
  },
  Burn: {
    name: 'Burn',
    icon: '🔥',
    description: 'Loses HP each turn. Attack is reduced.',
    duration: 'Infinite',
    onTurnEnd: ({ target }) => {
      const maxHp = getMaxHp(target);
      const damage = Math.floor(maxHp * 0.0625);
      target.currentHp = Math.max((target.currentHp ?? maxHp) - damage, 0);
      return { log: `${getPokemonName(target)} is hurt by its burn! (-${damage} HP)` };
    },
    applyEffect: ({ target }) => {
      if (target.modifyStat) {
        target.modifyStat('Attack', 0.5);
      }
    },
    removeEffect: ({ target }) => {
      if (target.restoreStat) {
        target.restoreStat('Attack');
      }
    }
  },
  Confused: {
    name: 'Confused',
    icon: '❓',
    description: 'May hurt itself instead of acting.',
    duration: () => Math.floor(Math.random() * 4) + 2,
    onMoveAttempt: ({ target, status }) => {
      status.turnsRemaining -= 1;
      if (status.turnsRemaining <= 0) {
        clearStatus(target, 'Confused');
        return { log: `${getPokemonName(target)} snapped out of confusion!` };
      }
      if (Math.random() < 0.5) {
        const attackStat = target.attack || target.stats?.atk || 30;
        const damage = Math.floor(attackStat / 2);
        target.currentHp = Math.max((target.currentHp ?? getMaxHp(target)) - damage, 0);
        return {
          cancel: true,
          log: `${getPokemonName(target)} hurt itself in its confusion! (-${damage} HP)`
        };
      }
      return null;
    }
  }
};

export function handleTurnStart(pokemon) {
  const status = getActiveStatus(pokemon);
  if (!status) return null;
  const definition = getStatusDefinition(status.type);
  if (!definition?.onTurnStart) return null;
  return definition.onTurnStart({ target: pokemon, status });
}

export function handleMoveAttempt(pokemon) {
  const status = getActiveStatus(pokemon);
  if (!status) return null;
  const definition = getStatusDefinition(status.type);
  if (!definition?.onMoveAttempt) return null;
  return definition.onMoveAttempt({ target: pokemon, status });
}

export function handleTurnEnd(pokemon) {
  const status = getActiveStatus(pokemon);
  if (!status) return null;
  const definition = getStatusDefinition(status.type);
  if (!definition?.onTurnEnd) return null;
  return definition.onTurnEnd({ target: pokemon, status });
}

export function getStatusDisplay(status) {
  const definition = getStatusDefinition(status?.type || status?.id || status);
  return definition ? `${definition.icon} ${definition.name}` : '';
}

function getActiveStatus(pokemon) {
  if (pokemon?.activeStatus) {
    return normalizeStatus(pokemon.activeStatus);
  }
  if (pokemon?.status?.id) {
    return normalizeStatus({ type: pokemon.status.id, turnsRemaining: pokemon.status.duration });
  }
  if (pokemon?.status) {
    return normalizeStatus(pokemon.status);
  }
  return null;
}

function normalizeStatus(status) {
  const type = status.type || status.id || status;
  const definition = getStatusDefinition(type);
  if (!definition) return null;
  let turnsRemaining = status.turnsRemaining;
  if (turnsRemaining === undefined) {
    const duration = definition.duration;
    if (typeof duration === 'function') {
      turnsRemaining = duration();
    } else if (typeof duration === 'number') {
      turnsRemaining = duration;
    } else {
      turnsRemaining = null;
    }
  }
  return { type: definition.name, turnsRemaining };
}

function getStatusDefinition(type) {
  if (!type) return null;
  const key = typeof type === 'string' ? type : '';
  return (
    StatusEffectRegistry[key] ||
    StatusEffectRegistry[capitalize(key)] ||
    StatusEffectRegistry[normalizeStatusKey(key)]
  );
}

function normalizeStatusKey(key) {
  const normalized = key.toLowerCase();
  if (normalized === 'paralyze' || normalized === 'paralysis') return 'Paralysis';
  if (normalized === 'burn') return 'Burn';
  if (normalized === 'sleep') return 'Sleep';
  if (normalized === 'poison') return 'Poison';
  if (normalized === 'confused' || normalized === 'confusion') return 'Confused';
  return capitalize(normalized);
}

function clearStatus(pokemon, type) {
  if (pokemon?.removeStatus) {
    pokemon.removeStatus(type);
    return;
  }
  if (pokemon?.status?.id && (!type || normalizeStatusKey(pokemon.status.id) === type)) {
    pokemon.status = null;
  }
  if (pokemon?.activeStatus && (!type || pokemon.activeStatus.type === type)) {
    pokemon.activeStatus = null;
  }
}

function getPokemonName(pokemon) {
  return pokemon.nickname || pokemon.name || pokemon.species || 'Pokemon';
}

function getMaxHp(pokemon) {
  return pokemon.stats?.maxHp || pokemon.stats?.hp || pokemon.maxHP || pokemon.maxHp || 0;
}

function capitalize(value) {
  if (!value) return value;
  return value.charAt(0).toUpperCase() + value.slice(1);
}

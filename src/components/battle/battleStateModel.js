const hashSeed = (str = '') => {
  let h = 0;
  for (let i = 0; i < str.length; i += 1) {
    h = ((h << 5) - h) + str.charCodeAt(i);
    h |= 0;
  }
  return Math.abs(h);
};

export const createBattleState = ({ playerParty = [], enemyParty = [], activeSlots = 1, isWildBattle = true, openingLog = 'Battle started!' }) => {
  const toIds = (arr) => arr.map((m) => m?.id).filter(Boolean);
  const playerIds = toIds(playerParty);
  const enemyIds = toIds(enemyParty);
  const playerActive = playerIds.slice(0, activeSlots);
  const enemyActive = enemyIds.slice(0, activeSlots);
  const playerBench = playerIds.slice(activeSlots);
  const enemyBench = enemyIds.slice(activeSlots);

  const hpMap = {};
  [...playerParty, ...enemyParty].forEach((mon) => {
    if (!mon?.id) return;
    const maxHp = mon?.stats?.maxHp ?? mon?.stats?.hp ?? mon?.currentHp ?? 100;
    hpMap[mon.id] = mon?.currentHp ?? maxHp;
  });

  return {
    playerActive,
    enemyActive,
    playerBench,
    enemyBench,
    activeSlots,
    hpMap,
    actionQueue: [],
    turnNumber: 1,
    currentTurn: 'player',
    battleLog: [{ turn: 1, actor: 'System', action: openingLog, result: '', synergyTriggered: false }],
    isWildBattle,
    status: null,
    battlefield: {
      terrain: null,
      terrainDuration: 0,
      weather: null,
      weatherDuration: 0,
      hazards: { playerSide: [], enemySide: [] },
      screens: { playerSide: [], enemySide: [] }
    }
  };
};

export const syncLegacyFields = (state) => {
  if (!state) return state;
  const playerActiveId = state.playerActive?.[0];
  const enemyActiveId = state.enemyActive?.[0];

  if (state.pokemonMap) {
    if (playerActiveId) state.playerPokemon = state.pokemonMap[playerActiveId] || state.playerPokemon;
    if (enemyActiveId) state.enemyPokemon = state.pokemonMap[enemyActiveId] || state.enemyPokemon;
  }

  if (playerActiveId && state.hpMap) state.playerHP = state.hpMap[playerActiveId] ?? state.playerHP;
  if (enemyActiveId && state.hpMap) state.enemyHP = state.hpMap[enemyActiveId] ?? state.enemyHP;
  return state;
};

export const isSideDefeated = (state, side) => {
  const active = side === 'player' ? (state.playerActive || []) : (state.enemyActive || []);
  const bench = side === 'player' ? (state.playerBench || []) : (state.enemyBench || []);
  const ids = [...active, ...bench];
  if (ids.length === 0) return true;
  return !ids.some((id) => (state.hpMap?.[id] ?? 0) > 0);
};

export const removeFainted = (state, id, side) => {
  if (side === 'player') {
    state.playerActive = (state.playerActive || []).filter((v) => v !== id);
    state.playerBench = (state.playerBench || []).filter((v) => v !== id);
  } else {
    state.enemyActive = (state.enemyActive || []).filter((v) => v !== id);
    state.enemyBench = (state.enemyBench || []).filter((v) => v !== id);
  }
};

export const sendNextFromBench = (state, side) => {
  const benchKey = side === 'player' ? 'playerBench' : 'enemyBench';
  const activeKey = side === 'player' ? 'playerActive' : 'enemyActive';
  const idx = (state[benchKey] || []).findIndex((id) => (state.hpMap?.[id] ?? 0) > 0);
  if (idx < 0) return null;
  const [sent] = state[benchKey].splice(idx, 1);
  state[activeKey] = [...(state[activeKey] || []), sent];
  return sent;
};

export const switchIn = (state, side, outId, inId) => {
  const activeKey = side === 'player' ? 'playerActive' : 'enemyActive';
  const benchKey = side === 'player' ? 'playerBench' : 'enemyBench';
  state[activeKey] = (state[activeKey] || []).map((id) => (id === outId ? inId : id));
  state[benchKey] = [
    ...(state[benchKey] || []).filter((id) => id !== inId),
    outId
  ];
};

export const sortActionQueue = (queue = [], pokemonMap = {}, seedKey = '') => {
  const priorityFor = (action) => action?.payload?.priority || 0;
  const speedFor = (action) => {
    const mon = pokemonMap[action?.pokemonId];
    return mon?.stats?.spd || mon?.stats?.speed || 0;
  };

  return [...queue].sort((a, b) => {
    const pa = priorityFor(a);
    const pb = priorityFor(b);
    if (pa !== pb) return pb - pa;

    const sa = speedFor(a);
    const sb = speedFor(b);
    if (sa !== sb) return sb - sa;

    const ha = hashSeed(`${seedKey}|${a?.pokemonId}|${a?.type}|${a?.side}`);
    const hb = hashSeed(`${seedKey}|${b?.pokemonId}|${b?.type}|${b?.side}`);
    return ha - hb;
  });
};

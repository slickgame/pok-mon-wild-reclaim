/**
 * Battle State Model — Multi-Active (3v3+) Architecture
 *
 * Replaces the single playerHP/enemyHP pair with a per-slot hp/status/statStage map.
 * The old playerHP/enemyHP surface still works as computed getters via helpers below,
 * so existing UI components don't break during migration.
 */

// ─── Constants ────────────────────────────────────────────────────────────────

export const MAX_ACTIVE_SLOTS = 3;

// ─── Factory ──────────────────────────────────────────────────────────────────

/**
 * Create a fresh multi-active battle state.
 *
 * @param {object} opts
 * @param {object[]} opts.playerParty   — full player party array (Pokémon objects with id, stats, etc.)
 * @param {object[]} opts.enemyParty    — full enemy party array
 * @param {number}   [opts.activeSlots] — how many slots are active simultaneously (1–3, default 1)
 * @param {boolean}  [opts.isWildBattle]
 * @param {string}   [opts.openingLog]
 * @returns {object} battleState
 */
export function createBattleState({
  playerParty,
  enemyParty,
  activeSlots = 1,
  isWildBattle = true,
  openingLog = ''
}) {
  const slots = Math.max(1, Math.min(MAX_ACTIVE_SLOTS, activeSlots));

  // Active slot IDs (first N from each party)
  const playerActive = playerParty.slice(0, slots).map(p => p.id);
  const enemyActive  = enemyParty.slice(0, slots).map(p => p.id);

  // Bench = the rest
  const playerBench = playerParty.slice(slots).map(p => p.id);
  const enemyBench  = enemyParty.slice(slots).map(p => p.id);

  // Build per-id lookup maps
  const allPokemon = [...playerParty, ...enemyParty];
  const hpMap = {};
  const maxHpMap = {};
  const statusMap = {};      // { id: { conditions: [], buffs: [] } }
  const statStageMap = {};   // { id: StatStages }
  const passiveEffectsMap = {}; // { id: PassiveEffect[] }

  for (const mon of allPokemon) {
    const maxHp = mon.stats?.maxHp || mon.stats?.hp || 100;
    const startHp = (mon.currentHp !== undefined && mon.currentHp !== null && mon.currentHp > 0)
      ? mon.currentHp
      : maxHp;
    hpMap[mon.id] = startHp;
    maxHpMap[mon.id] = maxHp;
    statusMap[mon.id] = { conditions: [], buffs: [] };
    statStageMap[mon.id] = createDefaultStatStages();
    passiveEffectsMap[mon.id] = [];
  }

  return {
    // ── Multi-active fields (new architecture) ──
    playerActive,       // string[] — active player slot IDs
    enemyActive,        // string[] — active enemy slot IDs
    playerBench,        // string[] — benched player IDs
    enemyBench,         // string[] — benched enemy IDs
    activeSlots: slots, // number — simultaneous active count
    hpMap,              // { [id]: number }
    maxHpMap,           // { [id]: number }
    statusMap,          // { [id]: { conditions, buffs } }
    statStageMap,       // { [id]: StatStages }
    passiveEffectsMap,  // { [id]: PassiveEffect[] }
    faintedIds: [],     // string[] — all fainted Pokémon this battle
    faintedEnemyIds: [],// string[] — enemy fainted IDs

    // ── Legacy 1v1 surface (aliases — kept for backward compat) ──
    // These are set via syncLegacyFields() below; UI reads them.
    playerPokemon: playerParty[0] || null,
    enemyPokemon:  enemyParty[0]  || null,
    enemyTeam:     enemyParty,
    playerHP: hpMap[playerParty[0]?.id] ?? 0,
    enemyHP:  hpMap[enemyParty[0]?.id]  ?? 0,
    playerStatus: statusMap[playerParty[0]?.id] || { conditions: [], buffs: [] },
    enemyStatus:  statusMap[enemyParty[0]?.id]  || { conditions: [], buffs: [] },

    // ── Shared battle fields ──
    turnNumber: 1,
    currentTurn: 'player',
    status: 'active', // 'active' | 'won' | 'lost' | 'fled' | 'captured'
    isWildBattle,
    synergyChains: 0,
    battlefield: createDefaultBattlefield(),
    battleLog: openingLog
      ? [{ turn: 1, actor: 'System', action: openingLog, result: '', synergyTriggered: false }]
      : [],
    lastTurnStatChanges: { player: [], enemy: [] },
    currentTurnStatChanges: { player: [], enemy: [] },
    rewards: null,
  };
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

/**
 * After any mutation to hpMap/statusMap/statStageMap, call this to keep
 * the legacy playerHP / enemyHP / playerStatus / enemyStatus aliases in sync.
 * This means all existing UI components continue to work untouched.
 */
export function syncLegacyFields(state) {
  const leadPlayerId = state.playerActive?.[0];
  const leadEnemyId  = state.enemyActive?.[0];

  if (leadPlayerId !== undefined) {
    state.playerHP     = state.hpMap[leadPlayerId]     ?? state.playerHP;
    state.playerStatus = state.statusMap[leadPlayerId] ?? state.playerStatus;
  }
  if (leadEnemyId !== undefined) {
    state.enemyHP     = state.hpMap[leadEnemyId]     ?? state.enemyHP;
    state.enemyStatus = state.statusMap[leadEnemyId] ?? state.enemyStatus;
  }
  return state;
}

/**
 * Get the HP for a specific Pokémon by id.
 */
export function getHP(state, pokemonId) {
  return state.hpMap?.[pokemonId] ?? 0;
}

/**
 * Set the HP for a specific Pokémon by id, then sync legacy fields.
 */
export function setHP(state, pokemonId, value) {
  if (!state.hpMap) state.hpMap = {};
  state.hpMap[pokemonId] = Math.max(0, value);
  syncLegacyFields(state);
}

/**
 * Returns whether a Pokémon (by id) is currently active on the field.
 */
export function isActive(state, pokemonId) {
  return state.playerActive?.includes(pokemonId) || state.enemyActive?.includes(pokemonId);
}

/**
 * Returns which side ('player' | 'enemy' | null) a Pokémon belongs to.
 */
export function getPokemonSide(state, pokemonId) {
  if (state.playerActive?.includes(pokemonId) || state.playerBench?.includes(pokemonId)) return 'player';
  if (state.enemyActive?.includes(pokemonId)  || state.enemyBench?.includes(pokemonId))  return 'enemy';
  return null;
}

/**
 * Get all active Pokémon objects for a side.
 * Requires a pokemonMap: { [id]: pokemonObject }.
 */
export function getActiveForSide(state, side, pokemonMap) {
  const ids = side === 'player' ? state.playerActive : state.enemyActive;
  return (ids || []).map(id => pokemonMap[id]).filter(Boolean);
}

/**
 * Replace an active slot with a bench Pokémon (switch).
 * Returns true if successful.
 */
export function switchIn(state, side, outId, inId) {
  const activeArr = side === 'player' ? state.playerActive : state.enemyActive;
  const benchArr  = side === 'player' ? state.playerBench  : state.enemyBench;

  const activeIdx = activeArr.indexOf(outId);
  const benchIdx  = benchArr.indexOf(inId);

  if (activeIdx === -1 || benchIdx === -1) return false;

  activeArr[activeIdx] = inId;
  benchArr[benchIdx]   = outId;

  syncLegacyFields(state);
  return true;
}

/**
 * Remove a fainted Pokémon from active and move it to faintedIds.
 * Does NOT auto-send replacement — caller handles that.
 */
export function removeFainted(state, pokemonId, side) {
  const activeArr = side === 'player' ? state.playerActive : state.enemyActive;
  const idx = activeArr.indexOf(pokemonId);
  if (idx !== -1) activeArr.splice(idx, 1);

  if (side === 'enemy') {
    state.faintedEnemyIds = [...(state.faintedEnemyIds || []), pokemonId];
  }
  state.faintedIds = [...(state.faintedIds || []), pokemonId];
  syncLegacyFields(state);
}

/**
 * Send the next available bench Pokémon into an empty active slot.
 * Returns the pokemonId sent in, or null if bench is empty.
 */
export function sendNextFromBench(state, side) {
  const activeArr = side === 'player' ? state.playerActive : state.enemyActive;
  const benchArr  = side === 'player' ? state.playerBench  : state.enemyBench;

  if (benchArr.length === 0) return null;

  const nextId = benchArr.shift();
  activeArr.push(nextId);
  syncLegacyFields(state);
  return nextId;
}

/**
 * Check if a side has lost (all Pokémon fainted).
 */
export function isSideDefeated(state, side) {
  const activeArr = side === 'player' ? state.playerActive : state.enemyActive;
  const benchArr  = side === 'player' ? state.playerBench  : state.enemyBench;
  const allIds    = [...activeArr, ...benchArr];
  return allIds.every(id => (state.hpMap[id] ?? 0) <= 0);
}

// ─── Action Queue (Step 2 foundation) ─────────────────────────────────────────

/**
 * Create an action for the queue.
 * @param {'move'|'switch'|'item'|'capture'|'flee'} type
 * @param {string} pokemonId — the Pokémon performing the action
 * @param {object} payload   — move object, target id, item object, etc.
 */
export function createAction(type, pokemonId, payload = {}) {
  return { type, pokemonId, payload };
}

/**
 * Sort an action queue by initiative (priority → speed → tiebreak).
 * Requires pokemonMap: { [id]: pokemonObj with stats.spd }.
 */
export function sortActionQueue(actions, pokemonMap) {
  return [...actions].sort((a, b) => {
    const monA = pokemonMap[a.pokemonId];
    const monB = pokemonMap[b.pokemonId];

    const prioA = (a.type === 'switch' || a.type === 'item') ? 10 : (a.payload?.priority || 0);
    const prioB = (b.type === 'switch' || b.type === 'item') ? 10 : (b.payload?.priority || 0);

    if (prioA !== prioB) return prioB - prioA; // higher priority first

    const spdA = monA?.stats?.spd ?? 0;
    const spdB = monB?.stats?.spd ?? 0;
    if (spdA !== spdB) return spdB - spdA; // higher speed first

    return Math.random() < 0.5 ? -1 : 1; // random tiebreak
  });
}

// ─── Internals ────────────────────────────────────────────────────────────────

function createDefaultBattlefield() {
  return {
    terrain: null, terrainDuration: 0,
    weather: null, weatherDuration: 0,
    hazards: { playerSide: [], enemySide: [] },
    screens: { playerSide: [], enemySide: [] }
  };
}

function createDefaultStatStages() {
  return {
    Attack: 0, Defense: 0, 'Sp. Atk': 0, 'Sp. Def': 0,
    Speed: 0, Accuracy: 0, Evasion: 0
  };
}
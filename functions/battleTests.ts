/**
 * battleTests — Step 5: Deterministic Battle Engine Test Harness
 *
 * Runs headless scenarios entirely in Deno (no DB, no frontend imports).
 * All engine logic is re-implemented as minimal stubs so tests are fast,
 * isolated, and repeatable.
 *
 * Scenarios:
 *   1. Turn order with 6 active mons (3v3)
 *   2. AoE hit-set correctness (all-opponents, all-allies, self)
 *   3. Faint + replacement sequencing
 *   4. Trainer buildOverride application
 *
 * GET/POST  → runs all suites, returns JSON report
 */

import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

// ─── Minimal engine stubs (no React / frontend imports) ───────────────────────

/** IV templates (mirrors TrainerRegistry) */
const IV_TEMPLATES = {
  competitive: { hp: 31, atk: 31, def: 31, spAtk: 31, spDef: 31, spd: 31 },
  mixed:       { hp: 31, atk: 31, def: 20, spAtk: 15, spDef: 20, spd: 31 },
  bulk:        { hp: 31, atk: 15, def: 31, spAtk: 10, spDef: 31, spd: 15 },
  speed_sweep: { hp: 25, atk: 31, def: 20, spAtk: 25, spDef: 20, spd: 31 },
  random:      null,
};

function generateRandomIVs() {
  return {
    hp:    Math.floor(Math.random() * 32),
    atk:   Math.floor(Math.random() * 32),
    def:   Math.floor(Math.random() * 32),
    spAtk: Math.floor(Math.random() * 32),
    spDef: Math.floor(Math.random() * 32),
    spd:   Math.floor(Math.random() * 32),
  };
}

function randomNature() {
  const natures = ['Hardy','Lonely','Brave','Adamant','Naughty','Bold','Docile',
    'Relaxed','Impish','Lax','Timid','Hasty','Serious','Jolly','Naive',
    'Modest','Mild','Quiet','Bashful','Rash','Calm','Gentle','Sassy','Careful','Quirky'];
  return natures[Math.floor(Math.random() * natures.length)];
}

/**
 * Stub of createWildPokemonInstance that respects buildOverride.
 * Returns a plain object — no stats calculated, just verifiable fields.
 */
function createTestPokemon(species, options = {}) {
  const bo = options.buildOverride || null;

  const level  = options.level || 10;
  const nature = bo?.nature || options.nature || randomNature();

  let ivs;
  if (bo?.ivTemplate && bo.ivTemplate !== 'random') {
    ivs = IV_TEMPLATES[bo.ivTemplate] || generateRandomIVs();
  } else {
    ivs = options.ivs || generateRandomIVs();
  }

  const evs = bo?.evSpread
    ? { hp: 0, atk: 0, def: 0, spAtk: 0, spDef: 0, spd: 0, ...bo.evSpread }
    : { hp: 0, atk: 0, def: 0, spAtk: 0, spDef: 0, spd: 0 };

  const moves = bo?.moves?.length ? bo.moves : ['Tackle', 'Growl'];
  const ability = bo?.ability || null;
  const heldItems = bo?.heldItem ? [bo.heldItem] : [];
  const talents = bo?.talents?.length ? bo.talents : [];

  // Derive a crude speed stat so turn-order tests are deterministic
  const baseSpd = options.baseSpd || 50;
  const spdIV   = ivs.spd ?? 15;
  const spdEV   = evs.spd ?? 0;
  const spd = Math.floor(((2 * baseSpd + spdIV + Math.floor(spdEV / 4)) * level / 100) + 5);

  const maxHp = 100 + level;
  return {
    id:       options.id || `${species}-${Math.random().toString(36).slice(2, 7)}`,
    species,
    level,
    nature,
    ivs,
    evs,
    moves,
    ability,
    heldItems,
    talents,
    isWild:   !bo,
    currentHp: maxHp,
    stats:    { spd, maxHp, hp: maxHp, atk: 50, def: 50, spAtk: 50, spDef: 50 },
    type1:    options.type1 || 'Normal',
    type2:    options.type2 || null,
  };
}

/** Minimal multi-active state matching battleStateModel shape */
function createTestBattleState(playerParty, enemyParty, activeSlots = 3) {
  const slots = Math.max(1, Math.min(3, activeSlots));
  const playerActive = playerParty.slice(0, slots).map(p => p.id);
  const enemyActive  = enemyParty.slice(0, slots).map(p => p.id);
  const playerBench  = playerParty.slice(slots).map(p => p.id);
  const enemyBench   = enemyParty.slice(slots).map(p => p.id);

  const hpMap = {};
  const maxHpMap = {};
  const all = [...playerParty, ...enemyParty];
  for (const mon of all) {
    hpMap[mon.id]    = mon.currentHp;
    maxHpMap[mon.id] = mon.stats.maxHp;
  }

  return { playerActive, enemyActive, playerBench, enemyBench, hpMap, maxHpMap, turnNumber: 1 };
}

/**
 * Minimal sortActionQueue — mirrors battleStateModel.sortActionQueue
 * Priority: switch/item = 10, else move.priority (default 0).
 * Tie-break: speed descending, then random.
 */
function sortActionQueue(actions, pokemonMap) {
  return [...actions].sort((a, b) => {
    const monA = pokemonMap[a.pokemonId];
    const monB = pokemonMap[b.pokemonId];
    const prioA = (a.type === 'switch' || a.type === 'item') ? 10 : (a.payload?.priority || 0);
    const prioB = (b.type === 'switch' || b.type === 'item') ? 10 : (b.payload?.priority || 0);
    if (prioA !== prioB) return prioB - prioA;
    const spdA = monA?.stats?.spd ?? 0;
    const spdB = monB?.stats?.spd ?? 0;
    if (spdA !== spdB) return spdB - spdA;
    return Math.random() < 0.5 ? -1 : 1;
  });
}

/**
 * Minimal AoE target resolver — mirrors executeTurnQueue
 */
function resolveTargets(action, battleState) {
  const targetClass = action.payload?.target || 'single-opponent';
  const side = action.side;

  if (targetClass === 'all-opponents') {
    return side === 'player' ? [...battleState.enemyActive] : [...battleState.playerActive];
  }
  if (targetClass === 'all-allies') {
    return side === 'player'
      ? battleState.playerActive.filter(id => id !== action.pokemonId)
      : battleState.enemyActive.filter(id => id !== action.pokemonId);
  }
  if (targetClass === 'self') return [action.pokemonId];
  // single-opponent — first alive enemy
  const opp = side === 'player' ? battleState.enemyActive : battleState.playerActive;
  const alive = opp.filter(id => (battleState.hpMap[id] ?? 0) > 0);
  return action.defenderIds?.length ? action.defenderIds : alive.slice(0, 1);
}

/**
 * Apply damage to a target in the state
 */
function applyDamage(targetId, amount, state) {
  state.hpMap[targetId] = Math.max(0, (state.hpMap[targetId] ?? 0) - amount);
}

/**
 * removeFainted — mirrors battleStateModel.removeFainted
 */
function removeFainted(state, pokemonId, side) {
  const activeArr = side === 'player' ? state.playerActive : state.enemyActive;
  const idx = activeArr.indexOf(pokemonId);
  if (idx !== -1) activeArr.splice(idx, 1);
  state.faintedIds = [...(state.faintedIds || []), pokemonId];
}

/**
 * sendNextFromBench — mirrors battleStateModel.sendNextFromBench
 */
function sendNextFromBench(state, side) {
  const activeArr = side === 'player' ? state.playerActive : state.enemyActive;
  const benchArr  = side === 'player' ? state.playerBench  : state.enemyBench;
  if (benchArr.length === 0) return null;
  const nextId = benchArr.shift();
  activeArr.push(nextId);
  return nextId;
}

// ─── Test utilities ──────────────────────────────────────────────────────────

function assert(condition, message) {
  if (!condition) throw new Error(`FAIL: ${message}`);
}

function runSuite(name, fn) {
  try {
    fn();
    return { suite: name, status: 'PASS', error: null };
  } catch (e) {
    return { suite: name, status: 'FAIL', error: e.message };
  }
}

// ─── Suite 1: Turn order with 6 active mons ─────────────────────────────────

function suitesTurnOrder() {
  // Build 3 player mons (low speed) and 3 enemy mons (high speed)
  const p1 = createTestPokemon('Caterpie',  { id: 'p1', level: 10, baseSpd: 45 });
  const p2 = createTestPokemon('Oddish',    { id: 'p2', level: 10, baseSpd: 30 });
  const p3 = createTestPokemon('Bounsweet', { id: 'p3', level: 10, baseSpd: 40 });

  const e1 = createTestPokemon('Pidgey',  { id: 'e1', level: 10, baseSpd: 56 });
  const e2 = createTestPokemon('Pikachu', { id: 'e2', level: 10, baseSpd: 90 });
  const e3 = createTestPokemon('Cherubi', { id: 'e3', level: 10, baseSpd: 35 });

  const pokemonMap = { p1, p2, p3, e1, e2, e3 };
  const state = createTestBattleState([p1, p2, p3], [e1, e2, e3], 3);

  const tackle = { name: 'Tackle', power: 40, category: 'Physical', priority: 0, target: 'single-opponent' };
  const quick  = { name: 'Quick Attack', power: 40, category: 'Physical', priority: 1, target: 'single-opponent' };

  const rawQueue = [
    { type: 'move', pokemonId: 'p1', side: 'player', payload: tackle, defenderIds: ['e1'] },
    { type: 'move', pokemonId: 'p2', side: 'player', payload: tackle, defenderIds: ['e2'] },
    { type: 'move', pokemonId: 'p3', side: 'player', payload: quick,  defenderIds: ['e3'] }, // priority 1
    { type: 'move', pokemonId: 'e1', side: 'enemy',  payload: tackle, defenderIds: ['p1'] },
    { type: 'move', pokemonId: 'e2', side: 'enemy',  payload: tackle, defenderIds: ['p2'] },
    { type: 'move', pokemonId: 'e3', side: 'enemy',  payload: tackle, defenderIds: ['p3'] },
  ];

  const sorted = sortActionQueue(rawQueue, pokemonMap);

  // p3 used Quick Attack (priority 1) — must be first
  assert(sorted[0].pokemonId === 'p3', 'Priority move (p3 Quick Attack) should be first');

  // Among normal-priority moves, Pikachu (e2, highest spd) should come before others
  const normalMoves = sorted.slice(1);
  const e2Index = normalMoves.findIndex(a => a.pokemonId === 'e2');
  const p1Index = normalMoves.findIndex(a => a.pokemonId === 'p1');
  assert(e2Index < p1Index, 'e2 (Pikachu, highest speed) should act before p1 (Caterpie)');

  // All 6 mons present
  assert(sorted.length === 6, 'All 6 actions should be in queue');
}

// ─── Suite 2: AoE hit-set correctness ───────────────────────────────────────

function suitesAoE() {
  const p1 = createTestPokemon('Oddish',   { id: 'p1', level: 10, baseSpd: 30 });
  const p2 = createTestPokemon('Caterpie', { id: 'p2', level: 10, baseSpd: 45 });
  const p3 = createTestPokemon('Pidgey',   { id: 'p3', level: 10, baseSpd: 56 });

  const e1 = createTestPokemon('Bounsweet', { id: 'e1', level: 10, baseSpd: 40 });
  const e2 = createTestPokemon('Cherubi',   { id: 'e2', level: 10, baseSpd: 35 });
  const e3 = createTestPokemon('Pikachu',   { id: 'e3', level: 10, baseSpd: 90 });

  const state = createTestBattleState([p1, p2, p3], [e1, e2, e3], 3);

  // all-opponents: player attacker hits all 3 enemies
  const aoeMoveAllOpp = { name: 'Gust', power: 40, target: 'all-opponents' };
  const actionAllOpp = { type: 'move', pokemonId: 'p3', side: 'player', payload: aoeMoveAllOpp };
  const targetsAllOpp = resolveTargets(actionAllOpp, state);
  assert(targetsAllOpp.length === 3, 'all-opponents should target 3 enemies');
  assert(
    ['e1','e2','e3'].every(id => targetsAllOpp.includes(id)),
    'all-opponents should include e1, e2, e3'
  );

  // all-allies: player attacker hits other 2 allies (not self)
  const aoeMoveAllies = { name: 'Heal Bell', power: 0, target: 'all-allies' };
  const actionAllies = { type: 'move', pokemonId: 'p1', side: 'player', payload: aoeMoveAllies };
  const targetsAllies = resolveTargets(actionAllies, state);
  assert(targetsAllies.length === 2, 'all-allies should target 2 allies (excluding self)');
  assert(!targetsAllies.includes('p1'), 'all-allies should not include the user (p1)');
  assert(targetsAllies.includes('p2') && targetsAllies.includes('p3'), 'all-allies includes p2 and p3');

  // self: only the user
  const selfMove = { name: 'Growth', power: 0, target: 'self' };
  const actionSelf = { type: 'move', pokemonId: 'e3', side: 'enemy', payload: selfMove };
  const targetsSelf = resolveTargets(actionSelf, state);
  assert(targetsSelf.length === 1 && targetsSelf[0] === 'e3', 'self target should be only e3');

  // single-opponent default: picks first alive enemy
  // make e1 fainted first to ensure fallback skips fainted
  state.hpMap['e1'] = 0;
  const singleMove = { name: 'Tackle', power: 40, target: 'single-opponent' };
  const actionSingle = { type: 'move', pokemonId: 'p1', side: 'player', payload: singleMove };
  const targetsSingle = resolveTargets(actionSingle, state);
  assert(!targetsSingle.includes('e1'), 'single-opponent should not target fainted e1');
  assert(targetsSingle.length === 1, 'single-opponent should pick exactly one target');
}

// ─── Suite 3: Faint + replacement sequencing ────────────────────────────────

function suitesFaintReplacement() {
  const p1 = createTestPokemon('Caterpie',  { id: 'p1', level: 10, baseSpd: 45 });
  const p2 = createTestPokemon('Oddish',    { id: 'p2', level: 10, baseSpd: 30 });
  const bench1 = createTestPokemon('Pidgey',   { id: 'pb1', level: 10, baseSpd: 56 });
  const bench2 = createTestPokemon('Pikachu',  { id: 'pb2', level: 10, baseSpd: 90 });

  const e1 = createTestPokemon('Bounsweet', { id: 'e1', level: 10, baseSpd: 40 });

  const state = createTestBattleState([p1, p2, bench1, bench2], [e1], 2);

  // Verify initial active/bench state
  assert(state.playerActive.includes('p1'), 'p1 should start active');
  assert(state.playerActive.includes('p2'), 'p2 should start active');
  assert(state.playerBench.includes('pb1'), 'pb1 should start benched');
  assert(state.playerBench.includes('pb2'), 'pb2 should start benched');

  // Simulate p1 fainting
  applyDamage('p1', 9999, state);
  assert(state.hpMap['p1'] === 0, 'p1 HP should be 0 after overkill damage');

  removeFainted(state, 'p1', 'player');
  assert(!state.playerActive.includes('p1'), 'p1 should be removed from active after faint');
  assert((state.faintedIds || []).includes('p1'), 'p1 should be in faintedIds');

  // Send in next bench mon
  const sentIn = sendNextFromBench(state, 'player');
  assert(sentIn === 'pb1', 'First bench mon (pb1) should be sent in');
  assert(state.playerActive.includes('pb1'), 'pb1 should now be active');
  assert(!state.playerBench.includes('pb1'), 'pb1 should be removed from bench');

  // Simulate p2 fainting too
  applyDamage('p2', 9999, state);
  removeFainted(state, 'p2', 'player');
  const sentIn2 = sendNextFromBench(state, 'player');
  assert(sentIn2 === 'pb2', 'Second bench mon (pb2) should be sent in');
  assert(state.playerActive.includes('pb2'), 'pb2 should now be active');

  // Bench should now be empty
  assert(state.playerBench.length === 0, 'Bench should be empty after all replacements');

  // Attempt to send from empty bench → null
  const sentIn3 = sendNextFromBench(state, 'player');
  assert(sentIn3 === null, 'sendNextFromBench on empty bench should return null');
}

// ─── Suite 4: Trainer buildOverride application ──────────────────────────────

function suitesTrainerBuildOverride() {
  // Mirrors the Kade & Nix Pidgey slot from TrainerRegistry
  const pidgeySlot = {
    species: 'Pidgey',
    level: 12,
    buildOverride: {
      nature: 'Jolly',
      ivTemplate: 'speed_sweep',
      evSpread: { spd: 152, atk: 100, hp: 20 },
      moves: ['Gust', 'Quick Attack', 'Sand Attack', 'Roost'],
      ability: 'Keen Eye',
    }
  };

  const mon = createTestPokemon(pidgeySlot.species, {
    level: pidgeySlot.level,
    buildOverride: pidgeySlot.buildOverride,
    id: 'pidgey-test',
  });

  // Nature override
  assert(mon.nature === 'Jolly', `Nature should be Jolly, got ${mon.nature}`);

  // IV template: speed_sweep
  assert(mon.ivs.atk === 31 && mon.ivs.spd === 31,
    `speed_sweep IVs should have 31 atk and 31 spd, got atk=${mon.ivs.atk} spd=${mon.ivs.spd}`);

  // EV spread
  assert(mon.evs.spd === 152 && mon.evs.atk === 100 && mon.evs.hp === 20,
    `EV spread mismatch: spd=${mon.evs.spd}, atk=${mon.evs.atk}, hp=${mon.evs.hp}`);

  // Move override
  assert(
    JSON.stringify(mon.moves) === JSON.stringify(['Gust','Quick Attack','Sand Attack','Roost']),
    `Move set mismatch: ${JSON.stringify(mon.moves)}`
  );

  // Ability override
  assert(mon.ability === 'Keen Eye', `Ability should be Keen Eye, got ${mon.ability}`);

  // isWild should be false (has buildOverride)
  assert(mon.isWild === false, 'Trainer mon with buildOverride should not be isWild');

  // --- Boss test: Bramblejack Pikachu (held item + talents) ---
  const pikachuSlot = {
    species: 'Pikachu',
    level: 18,
    buildOverride: {
      nature: 'Timid',
      ivTemplate: 'competitive',
      evSpread: { spd: 252, spAtk: 200, hp: 8 },
      moves: ['Thunderbolt','Quick Attack','Nuzzle','Iron Tail'],
      ability: 'Lightning Rod',
      heldItem: 'Sitrus Berry',
      talents: [{ name: 'Static Surge', grade: 'Gold' }],
    }
  };

  const pika = createTestPokemon(pikachuSlot.species, {
    level: pikachuSlot.level,
    buildOverride: pikachuSlot.buildOverride,
    id: 'pika-test',
  });

  assert(pika.heldItems[0] === 'Sitrus Berry', `Held item should be Sitrus Berry, got ${pika.heldItems[0]}`);
  assert(pika.talents[0]?.name === 'Static Surge', `Talent name mismatch: ${pika.talents[0]?.name}`);
  assert(pika.talents[0]?.grade === 'Gold', `Talent grade should be Gold, got ${pika.talents[0]?.grade}`);
  assert(
    Object.entries(IV_TEMPLATES.competitive).every(([k, v]) => pika.ivs[k] === v),
    'competitive IVs should all be 31'
  );

  // Wild fallback (no buildOverride) — IVs should be random (not all 31)
  const wildMon = createTestPokemon('Caterpie', { id: 'wild-test', level: 5 });
  assert(wildMon.isWild === true, 'Wild mon should have isWild=true');
  // Verify moves fall back to defaults
  assert(wildMon.moves.includes('Tackle'), 'Wild mon should have Tackle as default move');
}

// ─── Runner ──────────────────────────────────────────────────────────────────

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const results = [
      runSuite('Turn Order (6 active mons)',         suitesTurnOrder),
      runSuite('AoE Hit-Set Correctness',            suitesAoE),
      runSuite('Faint + Replacement Sequencing',     suitesFaintReplacement),
      runSuite('Trainer BuildOverride Application',  suitesTrainerBuildOverride),
    ];

    const passed = results.filter(r => r.status === 'PASS').length;
    const failed = results.filter(r => r.status === 'FAIL').length;

    return Response.json({
      summary: { total: results.length, passed, failed },
      results,
      timestamp: new Date().toISOString(),
    }, { status: failed > 0 ? 207 : 200 });

  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});
import { readSmokescreenUses } from './pokemonData';
import {
  battleSpeed, drainSeed, emptyConditions, moveTargetsSelf, ORAN_BERRY_HEAL, paralysisStopsMove, readBattleConditions,
  resolveBattleMove, type BattleTarget,
} from './battleRules';
import {
  gainXp, isSpeciesId, levelOf, MAX_XP, maxHp, revenantMoves, species, type BattleMoveSlot, type Companion, type SpeciesMove,
} from './pokemonData';
import type { BattleMon, TrainerSide } from './trainerBattle';

export { revenantMoves } from './pokemonData';
export { ORAN_BERRY_HEAL } from './battleRules';
export const REVENANT_NAME = 'Revenant-tainted Paras';
export const REVENANT_HEAL_MULTIPLIER = 0.5;

export const revenantBossMoves = {
  scratch: { name: 'Scratch', type: 'Normal', category: 'physical', power: 6, accuracy: 1, priority: 0 },
  absorb: { name: 'Absorb', type: 'Grass', category: 'special', power: 5, accuracy: 1, priority: 0, effect: 'absorb' },
  stunSpore: { name: 'Stun Spore', type: 'Grass', category: 'status', power: 0, accuracy: 0.75, priority: 0, effect: 'paralyze' },
  revenantSpore: { name: 'Revenant Spore', type: 'Bug', category: 'special', power: 8, accuracy: 1, priority: 0 },
} satisfies Record<string, SpeciesMove>;

const slots = [0, 1, 2] as const;
type Slot = typeof slots[number];
type BossMove = keyof typeof revenantBossMoves;
type Frenzy = 0 | 1 | 2;
export type RevenantIntent = { move: BossMove; targetSlots: Slot[] };
export type RevenantCommand =
  | { type: 'move'; move: BattleMoveSlot }
  | { type: 'switch'; withId: number }
  | { type: 'item'; item: 'oranBerry'; targetId: number };
export type RevenantAction =
  | { type: 'plan'; actorId: number; command: RevenantCommand }
  | { type: 'clear'; actorId: number }
  | { type: 'resolve' }
  | { type: 'replace'; slot: number; withId: number };

export type RevenantBattleState = {
  round: number;
  outcome: 'active' | 'won' | 'lost';
  player: TrainerSide;
  boss: BattleTarget;
  intent: RevenantIntent;
  plans: Partial<Record<number, RevenantCommand>>;
  participants: number[];
  oranBerries: number;
  frenzy: Frenzy;
  log: string[];
};

const LOG_LIMIT = 48;
const BERRY_LIMIT = 99;
const bossAtStart: BattleTarget = {
  id: -1, species: 'paras', name: REVENANT_NAME, level: 5, hp: 136, maxHp: 136, conditions: emptyConditions,
};

function playerMon(member: Companion): BattleMon {
  return { ...member, level: levelOf(member), maxHp: maxHp(member), conditions: emptyConditions };
}

export function revenantActive(battle: RevenantBattleState) {
  return battle.player.active.flatMap(id => {
    const mon = battle.player.team.find(member => member.id === id && member.hp > 0);
    return mon ? [mon] : [];
  });
}

export function revenantParty(battle: RevenantBattleState): Companion[] {
  return battle.player.team.map(({ id, species, hp, xp, smokescreenUses }) => ({ id, species, hp, xp, smokescreenUses }));
}

export function revenantReserves(battle: RevenantBattleState) {
  return battle.player.team.filter(mon => mon.hp > 0 && !battle.player.active.includes(mon.id));
}

export function revenantReplacements(battle: RevenantBattleState) {
  return battle.outcome === 'active' && revenantReserves(battle).length > 0
    ? slots.filter(slot => battle.player.active[slot] === null) : [];
}

export function revenantItemTargets(battle: RevenantBattleState) {
  return revenantActive(battle).filter(mon => mon.hp < mon.maxHp);
}

function frenzyFor(boss: BattleTarget, previous: Frenzy): Frenzy {
  if (previous === 2 || boss.hp <= boss.maxHp / 4) return 2;
  return previous === 1 || boss.hp <= boss.maxHp / 2 ? 1 : 0;
}

function nextIntent(battle: Pick<RevenantBattleState, 'round' | 'player' | 'frenzy'>): RevenantIntent {
  const { round, player, frenzy } = battle;
  const normalSequence = ['revenantSpore', 'scratch', 'stunSpore', 'absorb'] as const;
  const move = frenzy === 2 ? (round % 2 === 0 ? 'absorb' : 'revenantSpore')
    : normalSequence[(round - 1) % normalSequence.length];
  const side = round % 2 === 1 ? 0 : 2;
  if (move === 'revenantSpore') {
    return { move, targetSlots: frenzy ? [...slots] : [side, side === 0 ? 2 : 0] };
  }
  const preferred = move === 'scratch' ? 1 : side;
  const target = player.active[preferred] !== null ? preferred : slots.find(slot => player.active[slot] !== null);
  return { move, targetSlots: target === undefined ? [] : [target] };
}

export function startRevenantBattle(party: Companion[], leadId: number | null, oranBerries = 0): RevenantBattleState | null {
  const ready = party.filter(member => member.hp > 0);
  if (ready.length < 3) return null;
  const lead = ready.find(member => member.id === leadId);
  const initial = ready.slice(0, 3);
  if (lead && !initial.includes(lead)) initial[1] = lead;
  const active: TrainerSide['active'] = [initial[0].id, initial[1].id, initial[2].id];
  const player = { team: party.map(playerMon), active };
  const opening = { round: 1, player, frenzy: 0 as const };
  return {
    ...opening, outcome: 'active', boss: bossAtStart, intent: nextIntent(opening),
    plans: {}, participants: initial.map(member => member.id),
    oranBerries: Math.min(BERRY_LIMIT, Math.max(0, Math.floor(Number.isFinite(oranBerries) ? oranBerries : 0))),
    log: [`${REVENANT_NAME} blocks the clearing.`, 'The spore field weakens your team’s healing.'],
  };
}

export function canPlanRevenantCommand(battle: RevenantBattleState, actorId: number, command: RevenantCommand) {
  if (battle.outcome !== 'active' || revenantReplacements(battle).length) return false;
  const actor = revenantActive(battle).find(mon => mon.id === actorId);
  if (!actor) return false;
  if (command.type === 'move') return !!revenantMoves(actor.species)[command.move] && Number.isInteger(command.move);

  const otherPlans = Object.entries(battle.plans).filter(([id]) => Number(id) !== actorId).map(([, plan]) => plan);
  if (command.type === 'switch') {
    return revenantReserves(battle).some(mon => mon.id === command.withId) &&
      !otherPlans.some(plan => plan?.type === 'switch' && plan.withId === command.withId);
  }
  return command.item === 'oranBerry' && revenantItemTargets(battle).some(mon => mon.id === command.targetId) &&
    otherPlans.filter(plan => plan?.type === 'item').length < battle.oranBerries;
}

export function revenantBattleReady(battle: RevenantBattleState) {
  const active = revenantActive(battle);
  return battle.outcome === 'active' && active.length > 0 && active.every(mon => {
    const plan = battle.plans[mon.id];
    return plan !== undefined && canPlanRevenantCommand(battle, mon.id, plan);
  });
}

function updateAlly(battle: RevenantBattleState, mon: BattleTarget) {
  const index = battle.player.team.findIndex(member => member.id === mon.id);
  if (index < 0) return;
  const saved = battle.player.team[index];
  battle.player.team[index] = { ...saved, hp: mon.hp, conditions: mon.conditions, smokescreenUses: mon.smokescreenUses };
  if (saved.hp > 0 && mon.hp === 0) battle.log.push(`${species[mon.species].name} fainted.`);
}

function fillSlot(battle: RevenantBattleState, slot: Slot, member: BattleMon) {
  battle.player.active[slot] = member.id;
  if (!battle.participants.includes(member.id)) battle.participants.push(member.id);
}

function resolveAlly(battle: RevenantBattleState, actor: BattleMon, command: RevenantCommand, random: () => number) {
  if (command.type === 'switch') {
    const slot = slots.find(position => battle.player.active[position] === actor.id);
    const next = revenantReserves(battle).find(mon => mon.id === command.withId);
    if (slot === undefined || !next) return;
    fillSlot(battle, slot, next);
    battle.log.push(`${species[next.species].name} switched in for ${species[actor.species].name}.`);
    return;
  }
  if (command.type === 'item') {
    const target = revenantItemTargets(battle).find(mon => mon.id === command.targetId);
    if (battle.oranBerries === 0 || !target) {
      battle.log.push('The Oran Berry was kept for later.');
      return;
    }
    const heal = Math.min(target.maxHp - target.hp, ORAN_BERRY_HEAL * REVENANT_HEAL_MULTIPLIER);
    battle.oranBerries -= 1;
    updateAlly(battle, { ...target, hp: target.hp + heal });
    battle.log.push(`${species[target.species].name} recovered ${heal} HP from an Oran Berry.`);
    return;
  }
  if (paralysisStopsMove(actor, random, battle.log)) return;
  const move = revenantMoves(actor.species)[command.move];
  const self = moveTargetsSelf(move);
  const result = resolveBattleMove(actor, self ? actor : battle.boss, move, random(), false, REVENANT_HEAL_MULTIPLIER);
  updateAlly(battle, result.actor);
  if (!self) battle.boss = result.target;
  battle.log.push(...result.log);
}

function resolveBoss(battle: RevenantBattleState, random: () => number) {
  if (paralysisStopsMove(battle.boss, random, battle.log)) return;
  const intent = battle.intent;
  const baseMove = revenantBossMoves[intent.move];
  const attack = intent.move === 'revenantSpore' ? { ...baseMove, power: baseMove.power + 2 * battle.frenzy } : baseMove;
  let hadTarget = false;
  for (const slot of intent.targetSlots) {
    const target = battle.player.team.find(mon => mon.id === battle.player.active[slot] && mon.hp > 0);
    if (!target) continue;
    hadTarget = true;
    const result = resolveBattleMove(battle.boss, target, attack, random());
    battle.boss = result.actor;
    battle.log.push(...result.log);
    updateAlly(battle, result.target);
  }
  if (!hadTarget) battle.log.push(`${REVENANT_NAME}’s ${attack.name} found no target in the marked positions.`);
}

function outcomeFor(battle: RevenantBattleState): RevenantBattleState['outcome'] {
  if (battle.boss.hp === 0) return 'won';
  return battle.player.team.some(mon => mon.hp > 0) ? 'active' : 'lost';
}

function randomForRound(roll: number, round: number) {
  const seed = Number.isFinite(roll) ? Math.min(0xFFFFFFFF, Math.max(0, Math.floor(roll * 0x100000000))) : 0x80000000;
  let state = (seed ^ Math.imul(round, 0x9E3779B9)) >>> 0;
  return () => {
    state = (Math.imul(state, 1664525) + 1013904223) >>> 0;
    return state / 0x100000000;
  };
}

function resolveRound(battle: RevenantBattleState, roll: number): RevenantBattleState {
  const next: RevenantBattleState = {
    ...battle,
    player: { team: [...battle.player.team], active: [...battle.player.active] },
    plans: {}, participants: [...battle.participants], log: [...battle.log, `Round ${battle.round}`],
  };
  const random = randomForRound(roll, battle.round);
  const pending = revenantActive(battle).map(mon => {
    const plan = battle.plans[mon.id]!;
    const priority = plan.type === 'move' ? revenantMoves(mon.species)[plan.move].priority : plan.type === 'switch' ? 10 : 9;
    return { id: mon.id, priority, speed: battleSpeed(mon), tie: random() };
  });
  pending.push({ id: battle.boss.id, priority: revenantBossMoves[battle.intent.move].priority,
    speed: battleSpeed(battle.boss), tie: random() });
  pending.sort((a, b) => b.priority - a.priority || b.speed - a.speed || b.tie - a.tie);
  for (const action of pending) {
    if (action.id === next.boss.id) resolveBoss(next, random);
    else {
      const actor = revenantActive(next).find(mon => mon.id === action.id);
      const plan = battle.plans[action.id];
      if (actor && plan) resolveAlly(next, actor, plan, random);
    }
    if (outcomeFor(next) !== 'active') break;
  }

  if (outcomeFor(next) === 'active' && next.boss.conditions.seededBy !== undefined) {
    const owner = revenantActive(next).find(mon => mon.id === next.boss.conditions.seededBy);
    const seeded = drainSeed(next.boss, owner, REVENANT_HEAL_MULTIPLIER);
    next.boss = seeded.target;
    if (seeded.owner) updateAlly(next, seeded.owner);
    next.log.push(...seeded.log);
  }
  for (const slot of slots) {
    if (next.player.team.find(mon => mon.id === next.player.active[slot])?.hp === 0) next.player.active[slot] = null;
  }
  next.outcome = outcomeFor(next);
  if (next.outcome === 'won') {
    next.log.push(`${REVENANT_NAME} was defeated. The spores begin to clear.`);
    next.player.team = next.player.team.map(mon => {
      if (mon.hp === 0 || !next.participants.includes(mon.id)) return mon;
      const trained = gainXp(mon, 12);
      if (trained.xp !== mon.xp) next.log.push(`${species[mon.species].name} gained ${trained.xp - mon.xp} XP.`);
      return { ...playerMon(trained), conditions: mon.conditions };
    });
  } else if (next.outcome === 'lost') {
    next.log.push('Your team fainted. Return to the Clinic to recover before trying again.');
  } else {
    next.round += 1;
    next.frenzy = frenzyFor(next.boss, battle.frenzy);
    if (next.frenzy > battle.frenzy) next.log.push(`${REVENANT_NAME} entered Frenzy ${next.frenzy}.`);
    next.intent = nextIntent(next);
    if (revenantReplacements(next).length) next.log.push('Choose a reserve for an open position.');
  }
  next.log = next.log.slice(-LOG_LIMIT);
  return next;
}

export function updateRevenantBattle(battle: RevenantBattleState, action: RevenantAction, roll = 0.5): RevenantBattleState {
  if (battle.outcome !== 'active') return battle;
  switch (action.type) {
    case 'plan':
      return canPlanRevenantCommand(battle, action.actorId, action.command)
        ? { ...battle, plans: { ...battle.plans, [action.actorId]: action.command } } : battle;
    case 'clear': {
      if (!battle.plans[action.actorId]) return battle;
      const plans = { ...battle.plans };
      delete plans[action.actorId];
      return { ...battle, plans };
    }
    case 'resolve':
      return revenantBattleReady(battle) ? resolveRound(battle, roll) : battle;
    case 'replace': {
      const slot = revenantReplacements(battle).find(position => position === action.slot);
      const replacement = revenantReserves(battle).find(member => member.id === action.withId);
      if (slot === undefined || !replacement) return battle;
      const next: RevenantBattleState = {
        ...battle, player: { ...battle.player, active: [...battle.player.active] }, participants: [...battle.participants],
        log: [...battle.log, `${species[replacement.species].name} filled the open position.`].slice(-LOG_LIMIT),
      };
      fillSlot(next, slot, replacement);
      return next;
    }
  }
}

function record(value: unknown): Record<string, unknown> | undefined {
  return value && typeof value === 'object' && !Array.isArray(value) ? value as Record<string, unknown> : undefined;
}

function integer(value: unknown, min: number, max: number) {
  return typeof value === 'number' && Number.isSafeInteger(value) && value >= min && value <= max ? value : undefined;
}

function readPlayer(value: unknown): TrainerSide | null {
  const raw = record(value);
  if (!raw || !Array.isArray(raw.team) || raw.team.length < 3 || raw.team.length > 6 ||
      !Array.isArray(raw.active) || raw.active.length !== 3) return null;
  const team: BattleMon[] = [];
  for (const entry of raw.team) {
    const saved = record(entry);
    if (!saved || !isSpeciesId(saved.species)) return null;
    const id = integer(saved.id, 1, Number.MAX_SAFE_INTEGER);
    const xp = integer(saved.xp, 0, MAX_XP);
    if (id === undefined || xp === undefined || team.some(mon => mon.id === id)) return null;
    const mon = playerMon({ id, xp, hp: 0, species: saved.species, smokescreenUses: readSmokescreenUses(saved.smokescreenUses) });
    const hp = integer(saved.hp, 0, mon.maxHp);
    if (hp === undefined) return null;
    team.push({ ...mon, hp, conditions: readBattleConditions(saved.conditions) });
  }
  const active: TrainerSide['active'] = [null, null, null];
  for (const slot of slots) {
    const id = raw.active[slot];
    if (!active.includes(id) && team.some(mon => mon.id === id && mon.hp > 0)) active[slot] = id;
  }
  return { team, active };
}

function readPlan(value: unknown): RevenantCommand | undefined {
  const raw = record(value);
  if (raw?.type === 'move' && (raw.move === 0 || raw.move === 1 || raw.move === 2 || raw.move === 3)) {
    return { type: 'move', move: raw.move };
  }
  if (raw?.type === 'switch' && typeof raw.withId === 'number') return { type: 'switch', withId: raw.withId };
  if (raw?.type === 'item' && raw.item === 'oranBerry' && typeof raw.targetId === 'number') {
    return { type: 'item', item: 'oranBerry', targetId: raw.targetId };
  }
}

function readIntent(value: unknown, battle: RevenantBattleState): RevenantIntent {
  const intent = record(value);
  const move = intent?.move;
  const targetSlots = intent?.targetSlots;
  if (typeof move !== 'string' || !Object.hasOwn(revenantBossMoves, move) || !Array.isArray(targetSlots) ||
      targetSlots.length > 3 || new Set(targetSlots).size !== targetSlots.length ||
      !targetSlots.every(slot => slot === 0 || slot === 1 || slot === 2) ||
      (move !== 'revenantSpore' && targetSlots.length > 1)) return nextIntent(battle);
  return { move: move as BossMove, targetSlots };
}

export function loadRevenantBattle(value: unknown): RevenantBattleState | null {
  const raw = record(value);
  const savedBoss = record(raw?.boss);
  const player = readPlayer(raw?.player);
  const hp = integer(savedBoss?.hp, 0, bossAtStart.maxHp);
  const round = integer(raw?.round, 1, Number.MAX_SAFE_INTEGER - 1);
  const oranBerries = integer(raw?.oranBerries, 0, BERRY_LIMIT);
  if (!raw || !player || hp === undefined || round === undefined || oranBerries === undefined) return null;
  const boss: BattleTarget = { ...bossAtStart, hp, conditions: readBattleConditions(savedBoss?.conditions) };
  const participants = Array.isArray(raw.participants) ? raw.participants : [];
  const savedFrenzy = raw.frenzy === 1 || raw.frenzy === 2 ? raw.frenzy : 0;
  const battle: RevenantBattleState = {
    round, player, boss, outcome: 'active', intent: { move: 'revenantSpore', targetSlots: [] }, plans: {},
    frenzy: savedFrenzy, oranBerries,
    participants: [...new Set([...participants, ...player.active])].filter((id): id is number =>
      typeof id === 'number' && player.team.some(mon => mon.id === id)),
    log: Array.isArray(raw.log) ? raw.log.filter((entry): entry is string => typeof entry === 'string')
      .slice(-LOG_LIMIT).map(line => line.slice(0, 300)) : [],
  };
  const outcome = outcomeFor(battle);
  if (raw.outcome !== outcome) return null;
  battle.outcome = outcome;
  if (outcome === 'active') battle.frenzy = frenzyFor(boss, savedFrenzy);
  battle.intent = readIntent(raw.intent, battle);
  if (outcome !== 'active') return battle;

  const plans = record(raw.plans);
  for (const actor of revenantActive(battle)) {
    const command = readPlan(plans?.[actor.id]);
    if (command && canPlanRevenantCommand(battle, actor.id, command)) battle.plans[actor.id] = command;
  }
  return battle;
}

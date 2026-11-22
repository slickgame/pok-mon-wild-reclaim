import { readSmokescreenUses } from './pokemonData';
import {
  battleSpeed, damagePreview, drainSeed, emptyConditions, moveTargetsSelf, ORAN_BERRY_HEAL, paralysisStopsMove,
  readBattleConditions, resolveBattleMove,
  type BattleTarget,
} from './battleRules';
import {
  battleMoves, battleMoveSlots, gainXp, getMove, isSpeciesId, levelOf, maxHp, MAX_XP, species,
  type BattleMoveSlot, type Companion, type MoveId, type SpeciesId,
} from './pokemonData';

export const battlePositions = ['Front', 'Mid', 'Rear'] as const;
const slots = [0, 1, 2] as const;
type Slot = typeof slots[number];
type Lineup = [number | null, number | null, number | null];
type SideId = 'player' | 'enemy';

export type TrainerId = 'theo' | 'rusk';
type TrainerProfile = { name: string; team: { species: SpeciesId; level: number }[]; xp: number };

export const trainerProfiles: Record<TrainerId, TrainerProfile> = {
  theo: {
    name: 'Youngster Theo', xp: 6,
    team: [{ species: 'rattata', level: 3 }, { species: 'pidgey', level: 3 }],
  },
  rusk: {
    name: 'Rusk “Pruner” Vale', xp: 8,
    team: [{ species: 'pidgey', level: 8 }, { species: 'oddish', level: 7 }, { species: 'caterpie', level: 6 }],
  },
};

export type BattleMon = Companion & BattleTarget;
export type TrainerSide = { team: BattleMon[]; active: Lineup };
export type TrainerCommand =
  | { type: 'move'; move: BattleMoveSlot; targetId: number | null }
  | { type: 'switch'; withId: number }
  | { type: 'item'; item: 'oranBerry'; targetId: number };
export type TrainerAction =
  | { type: 'plan'; actorId: number; command: TrainerCommand }
  | { type: 'clear'; actorId: number }
  | { type: 'resolve' }
  | { type: 'replace'; slot: number; withId: number };

export type TrainerBattleState = {
  trainerId: TrainerId;
  round: number;
  outcome: 'active' | 'won' | 'lost';
  player: TrainerSide;
  enemy: TrainerSide;
  plans: Partial<Record<number, TrainerCommand>>;
  participants: number[];
  oranBerries: number;
  log: string[];
};

const LOG_LIMIT = 48;
const BERRY_LIMIT = 99;

function activeParty(side: TrainerSide) {
  return side.active.flatMap(id => {
    const member = side.team.find(mon => mon.id === id && mon.hp > 0);
    return member ? [member] : [];
  });
}

function reserves(side: TrainerSide) {
  return side.team.filter(mon => mon.hp > 0 && !side.active.includes(mon.id));
}

export function trainerReserves(battle: TrainerBattleState) {
  return reserves(battle.player);
}

export function trainerItemTargets(battle: TrainerBattleState) {
  return activeParty(battle.player).filter(mon => mon.hp < mon.maxHp);
}

export function trainerReplacements(battle: TrainerBattleState): number[] {
  return battle.outcome === 'active' && trainerReserves(battle).length
    ? slots.filter(slot => battle.player.active[slot] === null)
    : [];
}

export function trainerMoveTargets(battle: TrainerBattleState, actorId: number, moveId: BattleMoveSlot) {
  const actor = activeParty(battle.player).find(mon => mon.id === actorId);
  const move = actor && battleMoves(actor.species)[moveId];
  return move && !moveTargetsSelf(move) ? activeParty(battle.enemy).map(mon => mon.id) : [];
}

function playerMon(member: Companion): BattleMon {
  return { ...member, level: levelOf(member), maxHp: maxHp(member), conditions: emptyConditions };
}

function openingEnemy(trainerId: TrainerId): TrainerSide {
  const team = trainerProfiles[trainerId].team.map((entry, index) => {
    const hp = species[entry.species].baseHp + Math.floor(entry.level / 2);
    return { id: -index - 1, ...entry, hp, maxHp: hp, xp: 0, conditions: emptyConditions };
  });
  const active: Lineup = [team[0]?.id ?? null, team[1]?.id ?? null, team[2]?.id ?? null];
  return { team, active };
}

export function startTrainerBattle(
  trainerId: TrainerId, party: Companion[], leadId: number | null, oranBerries = 0,
): TrainerBattleState | null {
  if (trainerId !== 'theo' && trainerId !== 'rusk') return null;
  const ready = party.filter(member => member.hp > 0);
  if (ready.length < 3) return null;
  const selected = ready.find(member => member.id === leadId) ?? ready[0];
  const front = [selected, ...ready.filter(member => member.id !== selected.id)];
  const active: Lineup = [front[0].id, front[1].id, front[2].id];
  return {
    trainerId, round: 1, outcome: 'active',
    player: { team: party.map(playerMon), active },
    enemy: openingEnemy(trainerId), plans: {}, participants: active.filter(id => id !== null),
    oranBerries: integer(oranBerries, 0, BERRY_LIMIT) ?? 0,
    log: [`${trainerProfiles[trainerId].name} challenges your team.`],
  };
}

export function trainerParty(battle: TrainerBattleState): Companion[] {
  return battle.player.team.map(({ id, species, hp, xp, smokescreenUses }) => ({ id, species, hp, xp, smokescreenUses }));
}

export function canPlanTrainerCommand(battle: TrainerBattleState, actorId: number, command: TrainerCommand) {
  const actor = activeParty(battle.player).find(mon => mon.id === actorId);
  if (battle.outcome !== 'active' || !actor || trainerReplacements(battle).length) return false;
  if (command.type === 'move') {
    const move = battleMoves(actor.species)[command.move];
    if (!move) return false;
    if (moveTargetsSelf(move)) return command.targetId === null;
    return command.targetId !== null && trainerMoveTargets(battle, actorId, command.move).includes(command.targetId);
  }
  const otherPlans = Object.entries(battle.plans).filter(([id]) => Number(id) !== actorId).map(([, plan]) => plan);
  if (command.type === 'item') {
    return command.item === 'oranBerry' && trainerItemTargets(battle).some(mon => mon.id === command.targetId) &&
      otherPlans.filter(plan => plan?.type === 'item').length < battle.oranBerries;
  }
  return trainerReserves(battle).some(mon => mon.id === command.withId) &&
    !otherPlans.some(plan => plan?.type === 'switch' && plan.withId === command.withId);
}

export function trainerBattleReady(battle: TrainerBattleState) {
  const acting = activeParty(battle.player);
  return battle.outcome === 'active' && acting.length > 0 && activeParty(battle.enemy).length > 0 && acting.every(mon => {
    const plan = battle.plans[mon.id];
    return plan !== undefined && canPlanTrainerCommand(battle, mon.id, plan);
  });
}

function sideOpposite(side: SideId): SideId {
  return side === 'player' ? 'enemy' : 'player';
}

function randomForRound(roll: number, round: number) {
  const seed = Number.isFinite(roll) ? Math.min(0xFFFFFFFF, Math.max(0, Math.floor(roll * 0x100000000))) : 0x80000000;
  let state = (seed ^ Math.imul(round, 0x9E3779B9)) >>> 0;
  return () => {
    state = (Math.imul(state, 1664525) + 1013904223) >>> 0;
    return state / 0x100000000;
  };
}

function adjustedAttacker(actor: BattleMon) {
  // Trainer levels identify the roster. PvE damage scales more gradually than team HP in this early route.
  return actor.id < 0 ? { ...actor, level: 1 + Math.floor(actor.level / 3) } : actor;
}

type EnemyCommand = { type: 'move'; move: MoveId; targetId: number | null };

function enemyPlan(enemy: BattleMon, player: TrainerSide): EnemyCommand {
  const attacker = adjustedAttacker(enemy);
  const lowHp = enemy.hp <= enemy.maxHp / 3;
  const best = activeParty(player).flatMap(mon => (['strike', 'guard'] as const).map(move => {
    const attack = species[enemy.species].moves[move];
    const damage = damagePreview(attacker, mon, attack);
    const position = player.active.indexOf(mon.id);
    const defense = lowHp && move === 'guard' ? 2 : 0;
    return { move, targetId: mon.id, score: damage + (damage >= mon.hp ? 4 : 0) + defense - position * 0.25 };
  })).sort((a, b) => b.score - a.score)[0];
  return { type: 'move', move: best?.move ?? 'strike', targetId: best?.targetId ?? null };
}

type Queued = {
  side: SideId;
  actorId: number;
  command: TrainerCommand | EnemyCommand;
  targetSlot: number;
  priority: number;
  speed: number;
  tie: number;
};

function commandMove(actor: BattleMon, move: MoveId | BattleMoveSlot) {
  return typeof move === 'number' ? battleMoves(actor.species)[move] : getMove(actor.species, move);
}

function roundQueue(battle: TrainerBattleState, random: () => number) {
  const queue: Queued[] = [];
  for (const side of ['player', 'enemy'] as const) {
    for (const actor of activeParty(battle[side])) {
      const command = side === 'player' ? battle.plans[actor.id] : enemyPlan(actor, battle.player);
      if (!command) continue;
      const priority = command.type === 'move' ? commandMove(actor, command.move)?.priority ?? 0
        : command.type === 'switch' ? 10 : 9;
      const slot = battle[side].active.indexOf(actor.id);
      const targetId = command.type === 'move' ? command.targetId : null;
      queue.push({ side, actorId: actor.id, command, priority,
        targetSlot: targetId === null ? -1 : battle[sideOpposite(side)].active.indexOf(targetId),
        speed: battleSpeed(actor),
        tie: random() + (2 - slot) * 0.075,
      });
    }
  }
  return queue.sort((a, b) => b.priority - a.priority || b.speed - a.speed || b.tie - a.tie);
}

function updateMon(side: TrainerSide, next: BattleTarget) {
  const index = side.team.findIndex(mon => mon.id === next.id);
  if (index >= 0) side.team[index] = { ...side.team[index], hp: next.hp, conditions: next.conditions, smokescreenUses: next.smokescreenUses };
}

function noteFaint(battle: TrainerBattleState, before: BattleMon, after: BattleTarget) {
  if (before.hp > 0 && after.hp === 0) battle.log.push(`${species[before.species].name} fainted.`);
}

function resolveAction(battle: TrainerBattleState, pending: Queued, guarded: Set<number>, random: () => number) {
  const acting = battle[pending.side];
  const defending = battle[sideOpposite(pending.side)];
  const actor = activeParty(acting).find(mon => mon.id === pending.actorId);
  if (!actor) return;
  const command = pending.command;
  if (command.type === 'switch') {
    const next = reserves(acting).find(mon => mon.id === command.withId);
    if (!next) return;
    const slot = acting.active.indexOf(actor.id);
    acting.active[slot] = next.id;
    if (!battle.participants.includes(next.id)) battle.participants.push(next.id);
    battle.log.push(`${species[next.species].name} switched in for ${species[actor.species].name}.`);
    return;
  }

  if (command.type === 'item') {
    const target = trainerItemTargets(battle).find(mon => mon.id === command.targetId);
    if (battle.oranBerries === 0 || !target) {
      battle.log.push('The Oran Berry was kept for later.');
      return;
    }
    const heal = Math.min(target.maxHp - target.hp, ORAN_BERRY_HEAL);
    battle.oranBerries -= 1;
    updateMon(acting, { ...target, hp: target.hp + heal });
    battle.log.push(`${species[target.species].name} recovered ${heal} HP from an Oran Berry.`);
    return;
  }

  if (paralysisStopsMove(actor, random, battle.log)) return;
  const move = commandMove(actor, command.move);
  if (!move) return;
  const self = moveTargetsSelf(move);
  const opponents = activeParty(defending);
  const target = self ? actor : opponents.find(mon => mon.id === defending.active[pending.targetSlot]) ?? opponents[0];
  if (!target) return;
  if (!self && target.id !== command.targetId && defending.active[pending.targetSlot] !== target.id) {
    battle.log.push(`${species[actor.species].name} redirected to ${species[target.species].name}.`);
  }
  const resolution = resolveBattleMove(adjustedAttacker(actor), target, move, random(), guarded.has(target.id));
  battle.log.push(...resolution.log);
  updateMon(acting, resolution.actor);
  if (!self) {
    updateMon(defending, resolution.target);
    noteFaint(battle, target, resolution.target);
  }
  if (command.move === 'guard') guarded.add(actor.id);
}

function tickSeeds(battle: TrainerBattleState) {
  for (const side of ['player', 'enemy'] as const) {
    const affected = battle[side];
    const opposite = battle[sideOpposite(side)];
    for (const id of affected.active) {
      const target = affected.team.find(mon => mon.id === id);
      if (!target || target.hp === 0 || target.conditions.seededBy === undefined) continue;
      const owner = opposite.team.find(mon => mon.id === target.conditions.seededBy && mon.hp > 0 && opposite.active.includes(mon.id));
      const tick = drainSeed(target, owner);
      updateMon(affected, tick.target);
      if (tick.owner) updateMon(opposite, tick.owner);
      battle.log.push(...tick.log);
      noteFaint(battle, target, tick.target);
    }
  }
}

function outcomeFor(battle: TrainerBattleState): TrainerBattleState['outcome'] {
  if (battle.player.team.every(mon => mon.hp === 0)) return 'lost';
  if (battle.enemy.team.every(mon => mon.hp === 0)) return 'won';
  return 'active';
}

function trainerXp(battle: TrainerBattleState) {
  for (const [index, member] of battle.player.team.entries()) {
    if (member.hp === 0 || !battle.participants.includes(member.id)) continue;
    const updated = gainXp(member, trainerProfiles[battle.trainerId].xp);
    if (updated.xp === member.xp) continue;
    battle.player.team[index] = { ...playerMon(updated), conditions: member.conditions };
    battle.log.push(`${species[member.species].name} gained ${updated.xp - member.xp} XP.`);
  }
}

function resolveRound(battle: TrainerBattleState, roll: number): TrainerBattleState {
  const next: TrainerBattleState = {
    ...battle,
    player: { team: [...battle.player.team], active: [...battle.player.active] },
    enemy: { team: [...battle.enemy.team], active: [...battle.enemy.active] },
    plans: {}, participants: [...battle.participants], log: [...battle.log, `Round ${battle.round}`],
  };
  const random = randomForRound(roll, battle.round);
  const guarded = new Set<number>();
  for (const action of roundQueue(battle, random)) {
    resolveAction(next, action, guarded, random);
    if (outcomeFor(next) !== 'active') break;
  }
  if (outcomeFor(next) === 'active') tickSeeds(next);
  for (const side of [next.player, next.enemy]) {
    for (const slot of slots) {
      if (side.team.find(mon => mon.id === side.active[slot])?.hp === 0) side.active[slot] = null;
    }
  }
  next.outcome = outcomeFor(next);
  if (next.outcome === 'won') {
    next.log.push(`You defeated ${trainerProfiles[next.trainerId].name}.`);
    trainerXp(next);
  } else if (next.outcome === 'lost') {
    next.log.push('Your team fainted. The Clinic can help your team recover.');
  } else {
    next.round += 1;
    if (trainerReplacements(next).length) next.log.push('Choose a reserve for the open position.');
  }
  next.log = next.log.slice(-LOG_LIMIT);
  return next;
}

export function updateTrainerBattle(battle: TrainerBattleState, action: TrainerAction, roll = 0.5): TrainerBattleState {
  if (battle.outcome !== 'active') return battle;
  switch (action.type) {
    case 'plan':
      return canPlanTrainerCommand(battle, action.actorId, action.command)
        ? { ...battle, plans: { ...battle.plans, [action.actorId]: action.command } }
        : battle;
    case 'clear': {
      if (!battle.plans[action.actorId]) return battle;
      const plans = { ...battle.plans };
      delete plans[action.actorId];
      return { ...battle, plans };
    }
    case 'resolve':
      return trainerBattleReady(battle) ? resolveRound(battle, roll) : battle;
    case 'replace': {
      const slot = trainerReplacements(battle).find(position => position === action.slot);
      const replacement = trainerReserves(battle).find(member => member.id === action.withId);
      if (slot === undefined || !replacement) return battle;
      const active: Lineup = [...battle.player.active];
      active[slot] = replacement.id;
      return {
        ...battle, player: { ...battle.player, active },
        participants: [...new Set([...battle.participants, replacement.id])],
        log: [...battle.log, `${species[replacement.species].name} filled the ${battlePositions[slot].toLowerCase()} position.`].slice(-LOG_LIMIT),
      };
    }
  }
}

function record(value: unknown): Record<string, unknown> | undefined {
  return value && typeof value === 'object' && !Array.isArray(value) ? value as Record<string, unknown> : undefined;
}

function integer(value: unknown, min: number, max: number) {
  return typeof value === 'number' && Number.isSafeInteger(value) && value >= min && value <= max ? value : undefined;
}

function readTrainerPlayer(value: unknown): TrainerSide | null {
  const raw = record(value);
  if (!raw || !Array.isArray(raw.team) || raw.team.length < 3 || raw.team.length > 6) return null;
  const team: BattleMon[] = [];
  for (const entry of raw.team) {
    const saved = record(entry);
    if (!saved || !isSpeciesId(saved.species)) return null;
    const id = integer(saved.id, 1, Number.MAX_SAFE_INTEGER);
    const xp = integer(saved.xp, 0, MAX_XP);
    if (id === undefined || xp === undefined || team.some(member => member.id === id)) return null;
    const member = playerMon({ id, xp, hp: 0, species: saved.species, smokescreenUses: readSmokescreenUses(saved.smokescreenUses) });
    const hp = integer(saved.hp, 0, member.maxHp);
    if (hp === undefined) return null;
    team.push({ ...member, hp, conditions: readBattleConditions(saved.conditions) });
  }

  const savedActive = raw.active;
  if (!Array.isArray(savedActive) || savedActive.length !== 3) return null;
  const active: Lineup = [null, null, null];
  for (const slot of slots) {
    const member = team.find(mon => mon.id === savedActive[slot] && mon.hp > 0);
    if (member && !active.includes(member.id)) active[slot] = member.id;
  }
  return { team, active };
}

function readTrainerEnemy(trainerId: TrainerId, value: unknown): TrainerSide | null {
  const { team } = openingEnemy(trainerId);
  const saved = record(value)?.team;
  if (!Array.isArray(saved) || saved.length !== team.length) return null;
  const active: Lineup = [null, null, null];
  for (const [index, member] of team.entries()) {
    const entry = record(saved[index]);
    if (entry?.id !== member.id || entry.species !== member.species) return null;
    const hp = integer(entry.hp, 0, member.maxHp);
    if (hp === undefined) return null;
    team[index] = { ...member, hp, conditions: readBattleConditions(entry.conditions) };
    if (hp > 0) active[index] = member.id;
  }
  return { team, active };
}

function readTrainerCommand(value: unknown, speciesId: SpeciesId): TrainerCommand | undefined {
  const command = record(value);
  if (!command) return undefined;
  if (command.type === 'switch' && typeof command.withId === 'number') {
    return { type: 'switch', withId: command.withId };
  }
  if (command.type === 'item' && command.item === 'oranBerry' && typeof command.targetId === 'number') {
    return { type: 'item', item: 'oranBerry', targetId: command.targetId };
  }
  if (command.type === 'move' && (command.targetId === null || typeof command.targetId === 'number')) {
    const savedMove = command.move;
    const legacyMove = savedMove === 'strike' || savedMove === 'guard' || savedMove === 'signature'
      ? getMove(speciesId, savedMove)?.name.replace(/ and guard$/, '') : undefined;
    const moves = battleMoves(speciesId);
    // Carry the same learned move forward whenever the old guarded variant lost its special behavior.
    const move = battleMoveSlots.find(slot => slot === savedMove || moves[slot].name === legacyMove);
    if (move !== undefined) return { type: 'move', move, targetId: command.targetId };
  }
  return undefined;
}

export function loadTrainerBattle(value: unknown, oranBerryFallback = 0): TrainerBattleState | null {
  const raw = record(value);
  if (raw?.trainerId !== 'theo' && raw?.trainerId !== 'rusk') return null;
  const player = readTrainerPlayer(raw.player);
  const enemy = readTrainerEnemy(raw.trainerId, raw.enemy);
  const round = integer(raw.round, 1, Number.MAX_SAFE_INTEGER - 1);
  if (!player || !enemy || round === undefined) return null;

  for (const [affected, opposing] of [[player, enemy], [enemy, player]]) {
    for (const [index, member] of affected.team.entries()) {
      const { seededBy, ...conditions } = member.conditions;
      if (seededBy !== undefined && !opposing.team.some(mon => mon.id === seededBy)) {
        affected.team[index] = { ...member, conditions };
      }
    }
  }

  const participants = Array.isArray(raw.participants) ? raw.participants : [];
  const battle: TrainerBattleState = {
    trainerId: raw.trainerId, round, outcome: 'active', player, enemy, plans: {},
    oranBerries: integer(raw.oranBerries, 0, BERRY_LIMIT) ?? integer(oranBerryFallback, 0, BERRY_LIMIT) ?? 0,
    participants: [...new Set([...participants, ...player.active])].filter((id): id is number =>
      typeof id === 'number' && player.team.some(member => member.id === id)),
    log: Array.isArray(raw.log) ? raw.log.filter((entry): entry is string => typeof entry === 'string')
      .slice(-LOG_LIMIT).map(line => line.slice(0, 300)) : [],
  };
  const outcome = outcomeFor(battle);
  if (raw.outcome !== outcome) return null;
  battle.outcome = outcome;
  if (outcome !== 'active') return battle;

  const plans = record(raw.plans);
  let droppedPlan = false;
  for (const actor of activeParty(player)) {
    const saved = plans?.[actor.id];
    const command = readTrainerCommand(saved, actor.species);
    if (command && canPlanTrainerCommand(battle, actor.id, command)) battle.plans[actor.id] = command;
    else if (saved !== undefined) droppedPlan = true;
  }
  if (droppedPlan) battle.log = [...battle.log, 'Choose a new action for each Pokémon with an open order.'].slice(-LOG_LIMIT);
  return battle;
}

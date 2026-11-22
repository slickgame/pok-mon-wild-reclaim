import {
  drainSeed, emptyConditions, readBattleConditions, resolveBattleMove,
  type BattleConditions, type BattleTarget,
} from './battleRules';
import {
  gainXp, getMove, isSpeciesId, levelOf, MAX_XP, maxHp, species, starterIds, wildIds,
  type Companion, type MoveId, type SpeciesId,
} from './pokemonData';
import {
  loadTrainerBattle, startTrainerBattle, trainerParty, updateTrainerBattle,
  type TrainerAction, type TrainerBattleState, type TrainerId,
} from './trainerBattle';

export { getMove, levelOf, maxHp, moveDescription, pokemonSpriteUrl, species, starterIds } from './pokemonData';
export type { Companion, MoveId, SpeciesId } from './pokemonData';

const previousRoster: Record<string, { replacement: SpeciesId; baseHp: number } | undefined> = {
  mosskip: { replacement: 'bulbasaur', baseHp: 32 },
  cinderkit: { replacement: 'charmander', baseHp: 26 },
  rillfin: { replacement: 'squirtle', baseHp: 29 },
  thistlepip: { replacement: 'caterpie', baseHp: 21 },
  shalehorn: { replacement: 'paras', baseHp: 27 },
  gloamwing: { replacement: 'oddish', baseHp: 23 },
};

type Outcome = 'active' | 'won' | 'captured' | 'fled' | 'lost';
type EncounterConditions = { player: Record<number, BattleConditions>; wild: BattleConditions };
export type Encounter = {
  species: SpeciesId;
  hp: number;
  outcome: Outcome;
  log: string[];
  conditions?: EncounterConditions;
};
type GroveQuestProgress = {
  explored: boolean;
  clearedOvergrowth: boolean;
  wildWins: number;
  reported: boolean;
};
export type OutingState = {
  party: Companion[];
  leadId: number | null;
  pokeBalls: number;
  encounter: Encounter | null;
  trainerBattle: TrainerBattleState | null;
  theoDefeated: boolean;
  ruskDefeated: boolean;
  groveQuest: GroveQuestProgress;
};

export type OutingAction =
  | { type: 'chooseStarter'; species: SpeciesId }
  | { type: 'selectLead'; id: number }
  | { type: 'search' }
  | { type: 'clearGroveOvergrowth' }
  | { type: 'reportGroveToLina' }
  | { type: 'move'; move: MoveId }
  | { type: 'capture' }
  | { type: 'flee' }
  | { type: 'closeEncounter' }
  | { type: 'startTrainer'; trainerId: TrainerId }
  | { type: 'trainerAction'; action: TrainerAction }
  | { type: 'closeTrainer' }
  | { type: 'clinic' };

export const PARTY_LIMIT = 6;
export const OUTING_SAVE_KEY = 'wild-reclaim.outing.v1';
export const GROVE_WILD_WINS_REQUIRED = 2;
const STARTER_POKE_BALLS = 4;
const CLINIC_POKE_BALLS = 1;
const LOG_LIMIT = 8;

export const initialOuting: OutingState = {
  party: [], leadId: null, pokeBalls: 0, encounter: null, trainerBattle: null, theoDefeated: false, ruskDefeated: false,
  groveQuest: { explored: false, clearedOvergrowth: false, wildWins: 0, reported: false },
};

export function getGroveQuestPhase({ groveQuest }: OutingState) {
  if (!groveQuest.explored) return 'explore';
  if (!groveQuest.clearedOvergrowth) return 'clear';
  if (groveQuest.wildWins < GROVE_WILD_WINS_REQUIRED) return 'battle';
  return groveQuest.reported ? 'complete' : 'report';
}

export function getLead(state: OutingState) {
  return state.party.find(({ id }) => id === state.leadId);
}

export function captureChance(encounter: Encounter) {
  const damageRatio = 1 - encounter.hp / species[encounter.species].baseHp;
  return Math.min(0.92, 0.24 + damageRatio * 0.68);
}

export function clinicAvailable(state: OutingState) {
  return state.party.length > 0 && state.encounter?.outcome !== 'active' &&
    !state.trainerBattle &&
    (state.pokeBalls < CLINIC_POKE_BALLS || state.party.some((companion) => companion.hp < maxHp(companion)));
}

export function canBeginTrainer(state: OutingState, trainerId: TrainerId) {
  const available = trainerId === 'theo' || (trainerId === 'rusk' && state.theoDefeated);
  return available && !state.encounter && !state.trainerBattle &&
    state.party.filter((companion) => companion.hp > 0).length >= 3;
}

function newCompanion(party: Companion[], pokemon: SpeciesId, hp = species[pokemon].baseHp): Companion {
  let id = 1;
  while (party.some((member) => member.id === id)) id += 1;
  return { id, species: pokemon, hp, xp: 0 };
}

function addMissingStarters(party: Companion[]) {
  const additions = starterIds.filter((starter) => !party.some((member) => member.species === starter));
  return additions.reduce(
    (team, starter) => team.length < PARTY_LIMIT ? [...team, newCompanion(team, starter)] : team,
    party,
  );
}

function beginEncounter(state: OutingState, roll: number): OutingState {
  const lead = getLead(state);
  if (!lead || lead.hp === 0 || state.encounter) return state;
  const picked = wildIds[Math.min(wildIds.length - 1, Math.floor(roll * wildIds.length))];
  return {
    ...state,
    groveQuest: { ...state.groveQuest, explored: true },
    encounter: {
      species: picked, hp: species[picked].baseHp, outcome: 'active',
      log: [`A wild ${species[picked].name} appeared.`],
    },
  };
}

function recordTurn(encounter: Encounter, outcome: Outcome, ...messages: string[]): Encounter {
  return { ...encounter, outcome, log: [...encounter.log, ...messages].slice(-LOG_LIMIT) };
}

function xpMessage(before: Companion, after: Companion) {
  return before.xp < after.xp
    ? `${species[before.species].name} gained ${after.xp - before.xp} XP.`
    : `${species[before.species].name} is at the highest level.`;
}

function saveLead(state: OutingState, lead: Companion, encounter: Encounter): OutingState {
  return { ...state, encounter, party: state.party.map((member) => member.id === lead.id ? lead : member) };
}

function battleTargets(lead: Companion, encounter: Encounter): { player: BattleTarget; wild: BattleTarget } {
  return {
    player: {
      ...lead, maxHp: maxHp(lead), level: levelOf(lead),
      conditions: encounter.conditions?.player[lead.id] ?? emptyConditions,
    },
    wild: {
      id: 0, species: encounter.species, hp: encounter.hp, maxHp: species[encounter.species].baseHp,
      level: 1, conditions: encounter.conditions?.wild ?? emptyConditions,
    },
  };
}

function resolveWildTurn(
  state: OutingState,
  lead: Companion,
  encounter: Encounter,
  player: BattleTarget,
  wild: BattleTarget,
  log: string[],
  roll: number,
  guarded = false,
) {
  if (wild.hp > 0 && player.hp > 0) {
    const retaliation = resolveBattleMove(wild, player, species[wild.species].moves.strike, roll, guarded);
    player = retaliation.target;
    wild = retaliation.actor;
    log.push(...retaliation.log);
  }

  const drained = drainSeed(wild, player);
  wild = drained.target;
  player = drained.owner ?? player;
  log.push(...drained.log);

  const updated: Encounter = {
    ...encounter, hp: wild.hp,
    conditions: {
      player: { ...encounter.conditions?.player, [lead.id]: player.conditions },
      wild: wild.conditions,
    },
  };
  const companion = { ...lead, hp: player.hp };
  const healthyReserve = state.party.some((member) => member.id !== lead.id && member.hp > 0);

  if (player.hp === 0) {
    log.push(`${species[player.species].name} fainted.`);
    if (!healthyReserve) return saveLead(state, companion, recordTurn(updated, 'lost', ...log));
  }
  if (wild.hp === 0) {
    const trained = companion.hp > 0 ? gainXp(companion, 6) : companion;
    const reward = companion.hp > 0 ? [xpMessage(companion, trained)] : [];
    const won = saveLead(state, trained, recordTurn(updated, 'won', ...log, `${species[wild.species].name} retreated.`, ...reward));
    const wildWins = Math.min(GROVE_WILD_WINS_REQUIRED, won.groveQuest.wildWins + 1);
    return { ...won, groveQuest: { ...won.groveQuest, wildWins } };
  }
  if (player.hp === 0) log.push('Choose a healthy Pokémon to continue.');
  return saveLead(state, companion, recordTurn(updated, 'active', ...log));
}

export function updateOuting(state: OutingState, action: OutingAction, roll = 0.5): OutingState {
  const random = Number.isFinite(roll) ? Math.max(0, Math.min(1, roll)) : 0.5;
  const encounter = state.encounter;
  const lead = getLead(state);
  const battle = state.trainerBattle;

  if (action.type === 'startTrainer') {
    if (!canBeginTrainer(state, action.trainerId)) return state;
    const trainerBattle = startTrainerBattle(action.trainerId, state.party, state.leadId);
    return trainerBattle ? { ...state, trainerBattle } : state;
  }
  if (action.type === 'trainerAction') {
    if (battle?.outcome !== 'active') return state;
    const trainerBattle = updateTrainerBattle(battle, action.action, random);
    if (trainerBattle === battle) return state;
    const party = trainerParty(trainerBattle);
    const nextLead = party.find((member) => member.id === state.leadId && member.hp > 0)
      ?? party.find((member) => member.hp > 0) ?? party[0];
    return {
      ...state, trainerBattle, party, leadId: nextLead?.id ?? null,
      theoDefeated: state.theoDefeated || (trainerBattle.outcome === 'won' && trainerBattle.trainerId === 'theo'),
      ruskDefeated: state.ruskDefeated || (trainerBattle.outcome === 'won' && trainerBattle.trainerId === 'rusk'),
    };
  }
  if (action.type === 'closeTrainer') {
    return battle && battle.outcome !== 'active' ? { ...state, trainerBattle: null } : state;
  }
  if (battle) return state;

  switch (action.type) {
    case 'chooseStarter': {
      if (state.party.length || !starterIds.some((id) => id === action.species)) return state;
      const starter = newCompanion([], action.species);
      return { ...state, leadId: starter.id, party: addMissingStarters([starter]), pokeBalls: STARTER_POKE_BALLS };
    }
    case 'selectLead': {
      const selected = state.party.find(({ id, hp }) => id === action.id && hp > 0);
      if (!selected || selected.id === state.leadId) return state;
      const next = { ...state, leadId: selected.id };
      if (encounter?.outcome !== 'active') return next;
      const message = `Go, ${species[selected.species].name}!`;
      if (!lead || lead.hp === 0) return { ...next, encounter: recordTurn(encounter, 'active', message) };
      const { player, wild } = battleTargets(selected, encounter);
      return resolveWildTurn(next, selected, encounter, player, wild, [message], random);
    }
    case 'search':
      return beginEncounter(state, random);
    case 'clearGroveOvergrowth':
      if (encounter || getGroveQuestPhase(state) !== 'clear') return state;
      return { ...state, groveQuest: { ...state.groveQuest, clearedOvergrowth: true } };
    case 'reportGroveToLina':
      if (encounter || getGroveQuestPhase(state) !== 'report') return state;
      return { ...state, groveQuest: { ...state.groveQuest, reported: true } };
    case 'clinic':
      if (!clinicAvailable(state)) return state;
      return {
        ...state,
        pokeBalls: Math.max(state.pokeBalls, CLINIC_POKE_BALLS),
        party: state.party.map((companion) => ({ ...companion, hp: maxHp(companion) })),
      };
    case 'closeEncounter':
      return encounter && encounter.outcome !== 'active' ? { ...state, encounter: null } : state;
    case 'flee':
      return encounter?.outcome === 'active'
        ? { ...state, encounter: recordTurn(encounter, 'fled', 'You left the encounter safely.') }
        : state;
  }

  if (!lead || lead.hp === 0 || encounter?.outcome !== 'active') return state;
  const { player, wild } = battleTargets(lead, encounter);
  const retaliationRoll = (random + 0.38196601125) % 1;

  if (action.type === 'capture') {
    if (!state.pokeBalls || state.party.length >= PARTY_LIMIT) return state;
    const usedBall = { ...state, pokeBalls: state.pokeBalls - 1 };
    if (random >= captureChance(encounter)) {
      const message = `${species[wild.species].name} slipped free of the Pokéball.`;
      return resolveWildTurn(usedBall, lead, encounter, player, wild, [message], retaliationRoll);
    }

    const newPartner = newCompanion(state.party, encounter.species, encounter.hp);
    const trained = gainXp(lead, 4);
    const result = recordTurn(encounter, 'captured', `${species[wild.species].name} joined your party.`, xpMessage(lead, trained));
    const earned = saveLead(usedBall, trained, result);
    return { ...earned, party: [...earned.party, newPartner] };
  }

  const move = getMove(lead.species, action.move);
  if (!move) return state;
  const result = resolveBattleMove(player, wild, move, random);
  return resolveWildTurn(
    state, lead, encounter, result.actor, result.target, result.log, retaliationRoll, action.move === 'guard',
  );
}

function record(value: unknown): Record<string, unknown> | undefined {
  return typeof value === 'object' && value !== null && !Array.isArray(value) ? value as Record<string, unknown> : undefined;
}

function integer(value: unknown, fallback: number, lower: number, upper: number) {
  return typeof value === 'number' && Number.isSafeInteger(value) ? Math.max(lower, Math.min(upper, value)) : fallback;
}

function readGroveQuest(value: unknown, encounter: Encounter | null): GroveQuestProgress {
  const saved = record(value);
  const clearedOvergrowth = saved?.clearedOvergrowth === true;
  const wildWins = integer(saved?.wildWins, encounter?.outcome === 'won' ? 1 : 0, 0, GROVE_WILD_WINS_REQUIRED);
  return {
    explored: saved?.explored === true || clearedOvergrowth || wildWins > 0 || encounter !== null,
    clearedOvergrowth,
    wildWins,
    reported: saved?.reported === true && clearedOvergrowth && wildWins === GROVE_WILD_WINS_REQUIRED,
  };
}

function previousSpecies(value: unknown) {
  return typeof value === 'string' && Object.hasOwn(previousRoster, value) ? previousRoster[value] : undefined;
}

function readParty(value: unknown): Companion[] {
  if (!Array.isArray(value)) return [];
  const party: Companion[] = [];
  for (const candidate of value) {
    const member = record(candidate);
    if (!member) continue;
    const previous = previousSpecies(member.species);
    const speciesId = previous?.replacement ?? member.species;
    if (!isSpeciesId(speciesId)) continue;
    const id = integer(member.id, 0, 0, Number.MAX_SAFE_INTEGER - 1);
    if (!id || party.some((entry) => entry.id === id)) continue;
    const companion = { id, species: speciesId, hp: 0, xp: integer(member.xp, 0, 0, MAX_XP) };
    const max = maxHp(companion);
    const previousMax = previous ? previous.baseHp + (levelOf(companion) - 1) * 3 : max;
    const savedHp = integer(member.hp, previousMax, 0, previousMax);
    companion.hp = savedHp === 0 ? 0 : Math.max(1, Math.round(savedHp * max / previousMax));
    party.push(companion);
    if (party.length === PARTY_LIMIT) break;
  }
  return party.length ? addMissingStarters(party) : party;
}

function readEncounter(value: unknown, lead: Companion, party: Companion[]): Encounter | null {
  const encounter = record(value);
  if (!encounter) return null;
  const previous = previousSpecies(encounter.species);
  const speciesId = previous?.replacement ?? encounter.species;
  if (!isSpeciesId(speciesId) || !wildIds.some((id) => id === speciesId)) return null;
  const { outcome } = encounter;
  if (outcome !== 'active' && outcome !== 'won' && outcome !== 'captured' && outcome !== 'fled' && outcome !== 'lost') return null;
  const fullHp = species[speciesId].baseHp;
  const hp = integer(encounter.hp, fullHp, 0, fullHp);
  if (outcome === 'active' && (hp === 0 || !party.some((member) => member.hp > 0))) return null;
  const name = species[speciesId].name;
  const migratedLog = {
    active: `Your encounter with wild ${name} resumed.`,
    won: `Wild ${name} retreated.`,
    captured: `${name} joined your party.`,
    fled: 'You left the encounter safely.',
    lost: `${species[lead.species].name} fainted.`,
  };
  const log = previous ? [migratedLog[outcome]] : Array.isArray(encounter.log)
    ? encounter.log.filter((line): line is string => typeof line === 'string').slice(-LOG_LIMIT)
    : [];
  const savedConditions = record(encounter.conditions);
  if (!savedConditions) return { species: speciesId, hp, outcome, log };
  const savedPlayerConditions = record(savedConditions.player);
  const conditions = {
    player: Object.fromEntries(party.flatMap(({ id }) => {
      const saved = savedPlayerConditions?.[id];
      return saved ? [[id, readBattleConditions(saved)]] : [];
    })),
    wild: readBattleConditions(savedConditions.wild),
  };
  return { species: speciesId, hp, outcome, log, conditions };
}

export function loadOuting(value: string | null): OutingState {
  if (!value) return initialOuting;
  try {
    const parsed = record(JSON.parse(value));
    if (!parsed) return initialOuting;
    const party = readParty(parsed.party);
    if (!party.length) return initialOuting;
    const lead = party.find(({ id }) => id === parsed.leadId) ?? party.find(({ hp }) => hp > 0) ?? party[0];
    const encounter = readEncounter(parsed.encounter, lead, party);
    const candidate = encounter ? null : loadTrainerBattle(parsed.trainerBattle);
    const savedTrainerParty = candidate && trainerParty(candidate);
    const trainerBattle = candidate && savedTrainerParty && savedTrainerParty.length === party.length &&
      party.every((member) => savedTrainerParty.some(({ id, species }) => id === member.id && species === member.species))
      ? candidate : null;
    const completedTheo = trainerBattle?.trainerId === 'theo' && trainerBattle.outcome === 'won';
    const theoDefeated = parsed.theoDefeated === true || completedTheo;
    return {
      party: trainerBattle ? trainerParty(trainerBattle) : party, leadId: lead.id, encounter, trainerBattle,
      pokeBalls: integer(parsed.pokeBalls ?? parsed.snares, 0, 0, STARTER_POKE_BALLS),
      theoDefeated, ruskDefeated: theoDefeated &&
        (parsed.ruskDefeated === true || (trainerBattle?.trainerId === 'rusk' && trainerBattle.outcome === 'won')),
      groveQuest: readGroveQuest(parsed.groveQuest, encounter),
    };
  } catch {
    return initialOuting;
  }
}

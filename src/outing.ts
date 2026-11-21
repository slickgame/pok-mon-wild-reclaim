export const starterIds = ['bulbasaur', 'charmander', 'squirtle'] as const;
const wildIds = ['caterpie', 'weedle', 'pidgey', 'rattata', 'oddish', 'bellsprout', 'paras'] as const;

export type SpeciesId = typeof starterIds[number] | typeof wildIds[number];
export type MoveId = 'strike' | 'guard';

type Move = { name: string; power: number };
type Species = {
  name: string;
  dexNumber: number;
  kind: string;
  description?: string;
  baseHp: number;
  moves: Record<MoveId, Move>;
};

function guard(name: string, power: number): Move {
  return { name: `${name} and guard`, power };
}

export const species: Record<SpeciesId, Species> = {
  bulbasaur: {
    name: 'Bulbasaur', dexNumber: 1, kind: 'Grass / Poison', baseHp: 45,
    description: 'A durable starter with a strong guarded attack.',
    moves: { strike: { name: 'Vine Whip', power: 7 }, guard: guard('Tackle', 5) },
  },
  charmander: {
    name: 'Charmander', dexNumber: 4, kind: 'Fire', baseHp: 39,
    description: 'The strongest attack of the three starters, with the lowest HP.',
    moves: { strike: { name: 'Ember', power: 9 }, guard: guard('Scratch', 3) },
  },
  squirtle: {
    name: 'Squirtle', dexNumber: 7, kind: 'Water', baseHp: 44,
    description: 'A sturdy starter with a balance of attack power and HP.',
    moves: { strike: { name: 'Water Gun', power: 8 }, guard: guard('Tackle', 4) },
  },
  caterpie: {
    name: 'Caterpie', dexNumber: 10, kind: 'Bug', baseHp: 21,
    moves: { strike: { name: 'Tackle', power: 5 }, guard: guard('Tackle', 3) },
  },
  weedle: {
    name: 'Weedle', dexNumber: 13, kind: 'Bug / Poison', baseHp: 20,
    moves: { strike: { name: 'Poison Sting', power: 5 }, guard: guard('Poison Sting', 3) },
  },
  pidgey: {
    name: 'Pidgey', dexNumber: 16, kind: 'Normal / Flying', baseHp: 23,
    moves: { strike: { name: 'Gust', power: 5 }, guard: guard('Tackle', 3) },
  },
  rattata: {
    name: 'Rattata', dexNumber: 19, kind: 'Normal', baseHp: 19,
    moves: { strike: { name: 'Quick Attack', power: 6 }, guard: guard('Tackle', 3) },
  },
  oddish: {
    name: 'Oddish', dexNumber: 43, kind: 'Grass / Poison', baseHp: 23,
    moves: { strike: { name: 'Absorb', power: 5 }, guard: guard('Absorb', 3) },
  },
  bellsprout: {
    name: 'Bellsprout', dexNumber: 69, kind: 'Grass / Poison', baseHp: 24,
    moves: { strike: { name: 'Vine Whip', power: 5 }, guard: guard('Vine Whip', 4) },
  },
  paras: {
    name: 'Paras', dexNumber: 46, kind: 'Bug / Grass', baseHp: 27,
    moves: { strike: { name: 'Scratch', power: 6 }, guard: guard('Scratch', 4) },
  },
};

export function pokemonSpriteUrl(id: SpeciesId) {
  return `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${species[id].dexNumber}.png`;
}

const previousRoster: Record<string, { replacement: SpeciesId; baseHp: number } | undefined> = {
  mosskip: { replacement: 'bulbasaur', baseHp: 32 },
  cinderkit: { replacement: 'charmander', baseHp: 26 },
  rillfin: { replacement: 'squirtle', baseHp: 29 },
  thistlepip: { replacement: 'caterpie', baseHp: 21 },
  shalehorn: { replacement: 'paras', baseHp: 27 },
  gloamwing: { replacement: 'oddish', baseHp: 23 },
};

export type Companion = { id: number; species: SpeciesId; hp: number; xp: number };
type Outcome = 'active' | 'won' | 'captured' | 'fled' | 'lost';
export type Encounter = { species: SpeciesId; hp: number; outcome: Outcome; log: string[] };
export type OutingState = {
  party: Companion[];
  leadId: number | null;
  pokeBalls: number;
  encounter: Encounter | null;
};

export type OutingAction =
  | { type: 'chooseStarter'; species: SpeciesId }
  | { type: 'selectLead'; id: number }
  | { type: 'search' }
  | { type: 'move'; move: MoveId }
  | { type: 'capture' }
  | { type: 'flee' }
  | { type: 'closeEncounter' }
  | { type: 'clinic' };

export const PARTY_LIMIT = 6;
export const OUTING_SAVE_KEY = 'wild-reclaim.outing.v1';
const STARTER_POKE_BALLS = 4;
const CLINIC_POKE_BALLS = 1;
const MAX_XP = 90;
const LOG_LIMIT = 8;

export const initialOuting: OutingState = {
  party: [], leadId: null, pokeBalls: 0, encounter: null,
};

export function getLead(state: OutingState) {
  return state.party.find(({ id }) => id === state.leadId);
}

export function levelOf(companion: Companion) {
  return 1 + Math.floor(companion.xp / 10);
}

export function maxHp(companion: Companion) {
  return species[companion.species].baseHp + (levelOf(companion) - 1) * 3;
}

export function captureChance(encounter: Encounter) {
  const damageRatio = 1 - encounter.hp / species[encounter.species].baseHp;
  return Math.min(0.92, 0.24 + damageRatio * 0.68);
}

export function clinicAvailable(state: OutingState) {
  return state.party.length > 0 && state.encounter?.outcome !== 'active' &&
    (state.pokeBalls < CLINIC_POKE_BALLS || state.party.some((companion) => companion.hp < maxHp(companion)));
}

function beginEncounter(state: OutingState, roll: number): OutingState {
  const lead = getLead(state);
  if (!lead || lead.hp === 0 || state.encounter) return state;
  const picked = wildIds[Math.min(wildIds.length - 1, Math.floor(roll * wildIds.length))];
  return {
    ...state,
    encounter: {
      species: picked, hp: species[picked].baseHp, outcome: 'active',
      log: [`A wild ${species[picked].name} appeared.`],
    },
  };
}

function recordTurn(encounter: Encounter, outcome: Outcome, ...messages: string[]): Encounter {
  return { ...encounter, outcome, log: [...encounter.log, ...messages].slice(-LOG_LIMIT) };
}

function gainXp(companion: Companion, reward: number) {
  const trained = { ...companion, xp: Math.min(MAX_XP, companion.xp + reward) };
  trained.hp += maxHp(trained) - maxHp(companion);
  return trained;
}

function xpMessage(before: Companion, after: Companion) {
  return before.xp < after.xp
    ? `${species[before.species].name} gained ${after.xp - before.xp} XP.`
    : `${species[before.species].name} is at the highest level.`;
}

function saveLead(state: OutingState, lead: Companion, encounter: Encounter): OutingState {
  return { ...state, encounter, party: state.party.map((member) => member.id === lead.id ? lead : member) };
}

function counterattack(state: OutingState, lead: Companion, encounter: Encounter, guarded: boolean, message: string) {
  const wild = species[encounter.species];
  const attack = wild.moves.strike;
  const hit = Math.min(lead.hp, guarded ? Math.ceil(attack.power / 2) : attack.power);
  const hurt = { ...lead, hp: lead.hp - hit };
  const retaliation = `${wild.name} used ${attack.name} for ${hit} damage${guarded ? ' through your guard' : ''}.`;
  if (hurt.hp === 0) {
    const result = recordTurn(encounter, 'lost', message, retaliation, `${species[lead.species].name} fainted.`);
    return saveLead(state, hurt, result);
  }
  return saveLead(state, hurt, recordTurn(encounter, 'active', message, retaliation));
}

export function updateOuting(state: OutingState, action: OutingAction, roll = 0.5): OutingState {
  const random = Number.isFinite(roll) ? Math.max(0, Math.min(1, roll)) : 0.5;
  const encounter = state.encounter;

  switch (action.type) {
    case 'chooseStarter': {
      if (state.party.length || !starterIds.some((id) => id === action.species)) return state;
      const starter = { id: 1, species: action.species, hp: species[action.species].baseHp, xp: 0 };
      return { ...state, leadId: starter.id, party: [starter], pokeBalls: STARTER_POKE_BALLS };
    }
    case 'selectLead': {
      if (action.id === state.leadId || encounter?.outcome === 'active' || !state.party.some(({ id, hp }) => id === action.id && hp > 0)) return state;
      return { ...state, leadId: action.id };
    }
    case 'search':
      return beginEncounter(state, random);
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

  const lead = getLead(state);
  if (!lead || lead.hp === 0 || encounter?.outcome !== 'active') return state;
  const partner = species[lead.species];
  const wild = species[encounter.species];

  if (action.type === 'capture') {
    if (!state.pokeBalls || state.party.length >= PARTY_LIMIT) return state;
    const usedBall = { ...state, pokeBalls: state.pokeBalls - 1 };
    if (random >= captureChance(encounter)) {
      return counterattack(usedBall, lead, encounter, false, `${wild.name} slipped free of the Pokéball.`);
    }

    let id = 1;
    while (state.party.some((member) => member.id === id)) id += 1;
    const newPartner = { id, species: encounter.species, hp: encounter.hp, xp: 0 };
    const trained = gainXp(lead, 4);
    const result = recordTurn(encounter, 'captured', `${wild.name} joined your party.`, xpMessage(lead, trained));
    const earned = saveLead(usedBall, trained, result);
    return { ...earned, party: [...earned.party, newPartner] };
  }

  const move = partner.moves[action.move];
  const damage = Math.min(encounter.hp, move.power + levelOf(lead) - 1);
  const target = { ...encounter, hp: encounter.hp - damage };
  const message = `${partner.name} used ${move.name} for ${damage} damage.`;
  if (target.hp === 0) {
    const trained = gainXp(lead, 6);
    const result = recordTurn(target, 'won', message, `${wild.name} retreated.`, xpMessage(lead, trained));
    return saveLead(state, trained, result);
  }

  return counterattack(state, lead, target, action.move === 'guard', message);
}

function record(value: unknown): Record<string, unknown> | undefined {
  return typeof value === 'object' && value !== null && !Array.isArray(value) ? value as Record<string, unknown> : undefined;
}

function integer(value: unknown, fallback: number, lower: number, upper: number) {
  return typeof value === 'number' && Number.isSafeInteger(value) ? Math.max(lower, Math.min(upper, value)) : fallback;
}

function isSpeciesId(value: unknown): value is SpeciesId {
  return typeof value === 'string' && Object.prototype.hasOwnProperty.call(species, value);
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
  return party;
}

function readEncounter(value: unknown, lead: Companion): Encounter | null {
  const encounter = record(value);
  if (!encounter) return null;
  const previous = previousSpecies(encounter.species);
  const speciesId = previous?.replacement ?? encounter.species;
  if (!isSpeciesId(speciesId) || !wildIds.some((id) => id === speciesId)) return null;
  const { outcome } = encounter;
  if (outcome !== 'active' && outcome !== 'won' && outcome !== 'captured' && outcome !== 'fled' && outcome !== 'lost') return null;
  const fullHp = species[speciesId].baseHp;
  const hp = integer(encounter.hp, fullHp, 0, fullHp);
  if (outcome === 'active' && (hp === 0 || lead.hp === 0)) return null;
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
  return { species: speciesId, hp, outcome, log };
}

export function loadOuting(value: string | null): OutingState {
  if (!value) return initialOuting;
  try {
    const parsed = record(JSON.parse(value));
    if (!parsed) return initialOuting;
    const party = readParty(parsed.party);
    if (!party.length) return initialOuting;
    const lead = party.find(({ id }) => id === parsed.leadId) ?? party.find(({ hp }) => hp > 0) ?? party[0];
    return {
      party, leadId: lead.id,
      pokeBalls: integer(parsed.pokeBalls ?? parsed.snares, 0, 0, STARTER_POKE_BALLS),
      encounter: readEncounter(parsed.encounter, lead),
    };
  } catch {
    return initialOuting;
  }
}

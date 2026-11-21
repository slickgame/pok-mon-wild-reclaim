export type SpeciesId = 'mosskip' | 'cinderkit' | 'rillfin' | 'thistlepip' | 'shalehorn' | 'gloamwing';
export type MoveId = 'strike' | 'guard';

type Move = { name: string; description: string; power: number };
type Species = { name: string; kind: string; description: string; baseHp: number; moves: Record<MoveId, Move> };

export const species: Record<SpeciesId, Species> = {
  mosskip: {
    name: 'Mosskip', kind: 'Meadow', baseHp: 32,
    description: 'A moss-backed hare that balances heavy kicks with a sturdy guard.',
    moves: {
      strike: { name: 'Clover Kick', description: 'A strong kick from Mosskip’s springy hind legs.', power: 7 },
      guard: { name: 'Root Brace', description: 'Strike lightly and halve the damage of the next counterattack.', power: 5 },
    },
  },
  cinderkit: {
    name: 'Cinderkit', kind: 'Ember', baseHp: 26,
    description: 'A coal-pawed fox with the strongest opening strike and the least health.',
    moves: {
      strike: { name: 'Coal Pounce', description: 'A full-force pounce from cover.', power: 9 },
      guard: { name: 'Ash Veil', description: 'Strike lightly and halve the damage of the next counterattack.', power: 3 },
    },
  },
  rillfin: {
    name: 'Rillfin', kind: 'Brook', baseHp: 29,
    description: 'A fin-tailed otter with a quick strike and a reliable guard.',
    moves: {
      strike: { name: 'Rill Snap', description: 'A sharp lash from Rillfin’s paddle tail.', power: 8 },
      guard: { name: 'Slipstream', description: 'Strike lightly and halve the damage of the next counterattack.', power: 4 },
    },
  },
  thistlepip: {
    name: 'Thistlepip', kind: 'Meadow', baseHp: 21,
    description: 'A little hedgehog with burrs that cling to its coat.',
    moves: {
      strike: { name: 'Briar Bump', description: 'A short charge with its prickles raised.', power: 5 },
      guard: { name: 'Curl Guard', description: 'Strike lightly and halve the damage of the next counterattack.', power: 3 },
    },
  },
  shalehorn: {
    name: 'Shalehorn', kind: 'Stone', baseHp: 27,
    description: 'A burrowing badger with a ridge of pebbles across its brow.',
    moves: {
      strike: { name: 'Crag Charge', description: 'A headlong charge with its stony brow.', power: 6 },
      guard: { name: 'Slate Guard', description: 'Strike lightly and halve the damage of the next counterattack.', power: 4 },
    },
  },
  gloamwing: {
    name: 'Gloamwing', kind: 'Dusk', baseHp: 23,
    description: 'A twilight moth with feathered antennae and powdery wings.',
    moves: {
      strike: { name: 'Wing Gust', description: 'A sharp gust from a beat of both wings.', power: 5 },
      guard: { name: 'Duskscreen', description: 'Strike lightly and halve the damage of the next counterattack.', power: 3 },
    },
  },
};

export const starterIds: readonly SpeciesId[] = ['mosskip', 'cinderkit', 'rillfin'];
const wildIds: readonly SpeciesId[] = ['thistlepip', 'shalehorn', 'gloamwing'];

export type Companion = { id: number; species: SpeciesId; hp: number; xp: number };
type Outcome = 'active' | 'won' | 'captured' | 'fled' | 'lost';
export type Encounter = { species: SpeciesId; hp: number; outcome: Outcome; log: string[] };
export type OutingState = {
  party: Companion[];
  leadId: number | null;
  snares: number;
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
const STARTER_SNARES = 4;
const CLINIC_SNARES = 1;
const MAX_XP = 90;
const LOG_LIMIT = 8;

export const initialOuting: OutingState = {
  party: [], leadId: null, snares: 0, encounter: null,
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
    (state.snares < CLINIC_SNARES || state.party.some((companion) => companion.hp < maxHp(companion)));
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
      if (state.party.length || !starterIds.includes(action.species)) return state;
      const starter = { id: 1, species: action.species, hp: species[action.species].baseHp, xp: 0 };
      return { ...state, leadId: starter.id, party: [starter], snares: STARTER_SNARES };
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
        snares: Math.max(state.snares, CLINIC_SNARES),
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
    if (!state.snares || state.party.length >= PARTY_LIMIT) return state;
    const usedSnare = { ...state, snares: state.snares - 1 };
    if (random >= captureChance(encounter)) {
      return counterattack(usedSnare, lead, encounter, false, `${wild.name} slipped free of the Field Snare.`);
    }

    let id = 1;
    while (state.party.some((member) => member.id === id)) id += 1;
    const newPartner = { id, species: encounter.species, hp: encounter.hp, xp: 0 };
    const trained = gainXp(lead, 4);
    const result = recordTurn(encounter, 'captured', `${wild.name} joined your party.`, xpMessage(lead, trained));
    const earned = saveLead(usedSnare, trained, result);
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

function readParty(value: unknown): Companion[] {
  if (!Array.isArray(value)) return [];
  const party: Companion[] = [];
  for (const candidate of value) {
    const member = record(candidate);
    if (!member || !isSpeciesId(member.species)) continue;
    const id = integer(member.id, 0, 0, Number.MAX_SAFE_INTEGER - 1);
    if (!id || party.some((entry) => entry.id === id)) continue;
    const companion = { id, species: member.species, hp: 0, xp: integer(member.xp, 0, 0, MAX_XP) };
    companion.hp = integer(member.hp, maxHp(companion), 0, maxHp(companion));
    party.push(companion);
    if (party.length === PARTY_LIMIT) break;
  }
  return party;
}

function readEncounter(value: unknown, lead: Companion): Encounter | null {
  const encounter = record(value);
  if (!encounter || !isSpeciesId(encounter.species) || !wildIds.includes(encounter.species)) return null;
  const { outcome } = encounter;
  if (outcome !== 'active' && outcome !== 'won' && outcome !== 'captured' && outcome !== 'fled' && outcome !== 'lost') return null;
  const fullHp = species[encounter.species].baseHp;
  const hp = integer(encounter.hp, fullHp, 0, fullHp);
  if (outcome === 'active' && (hp === 0 || lead.hp === 0)) return null;
  const log = Array.isArray(encounter.log) ? encounter.log.filter((line): line is string => typeof line === 'string').slice(-LOG_LIMIT) : [];
  return { species: encounter.species, hp, outcome, log };
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
      snares: integer(parsed.snares, 0, 0, STARTER_SNARES),
      encounter: readEncounter(parsed.encounter, lead),
    };
  } catch {
    return initialOuting;
  }
}

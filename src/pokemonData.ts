export const starterIds = ['bulbasaur', 'charmander', 'squirtle'] as const;
export const wildIds = ['caterpie', 'weedle', 'pidgey', 'rattata', 'oddish', 'bellsprout', 'paras'] as const;

export type SpeciesId = typeof starterIds[number] | typeof wildIds[number];
export type MoveId = 'strike' | 'guard' | 'signature';
export const battleMoveSlots = [0, 1, 2, 3] as const;
export type BattleMoveSlot = typeof battleMoveSlots[number];
export type BattleMoveOrder = readonly [BattleMoveSlot, BattleMoveSlot, BattleMoveSlot, BattleMoveSlot];
export type PokemonType =
  | 'Normal' | 'Fire' | 'Water' | 'Electric' | 'Grass' | 'Ice'
  | 'Fighting' | 'Poison' | 'Ground' | 'Flying' | 'Psychic' | 'Bug'
  | 'Rock' | 'Ghost' | 'Dragon' | 'Dark' | 'Steel' | 'Fairy';

export type SpeciesMove = {
  name: string;
  type: PokemonType;
  category: 'physical' | 'special' | 'status';
  power: number;
  accuracy: number;
  priority: number;
  effect?: 'seed' | 'smokescreen' | 'withdraw' | 'absorb' | 'attackDown' | 'defenseDown' | 'speedDown' | 'paralyze';
};

type Species = {
  name: string;
  dexNumber: number;
  kind: string;
  types: PokemonType[];
  description?: string;
  baseHp: number;
  speed: number;
  moves: Record<'strike' | 'guard', SpeciesMove> & { signature?: SpeciesMove };
};

const strike = (
  name: string,
  power: number,
  type: PokemonType = 'Normal',
  category: SpeciesMove['category'] = 'physical',
  extras?: Partial<Pick<SpeciesMove, 'accuracy' | 'priority' | 'effect'>>,
): SpeciesMove => ({ name, type, category, power, accuracy: 1, priority: 0, ...extras });

function guard(name: string, power: number, type: PokemonType = 'Normal', category: SpeciesMove['category'] = 'physical'): SpeciesMove {
  return strike(`${name} and guard`, power, type, category);
}

export const species: Record<SpeciesId, Species> = {
  bulbasaur: {
    name: 'Bulbasaur', dexNumber: 1, kind: 'Grass / Poison', types: ['Grass', 'Poison'], baseHp: 45, speed: 45,
    description: 'A durable starter that can drain a foe’s HP and recover its own.',
    moves: {
      strike: strike('Vine Whip', 7, 'Grass'),
      guard: guard('Tackle', 5),
      signature: { name: 'Leech Seed', type: 'Grass', category: 'status', power: 0, accuracy: 0.9, priority: 0, effect: 'seed' },
    },
  },
  charmander: {
    name: 'Charmander', dexNumber: 4, kind: 'Fire', types: ['Fire'], baseHp: 39, speed: 65,
    description: 'A fast attacker that disrupts an opponent’s aim with Smokescreen.',
    moves: {
      strike: strike('Ember', 9, 'Fire', 'special'),
      guard: guard('Scratch', 3),
      signature: { name: 'Smokescreen', type: 'Normal', category: 'status', power: 0, accuracy: 1, priority: 0, effect: 'smokescreen' },
    },
  },
  squirtle: {
    name: 'Squirtle', dexNumber: 7, kind: 'Water', types: ['Water'], baseHp: 44, speed: 43,
    description: 'A sturdy starter that raises its own Defense with Withdraw.',
    moves: {
      strike: strike('Water Gun', 8, 'Water', 'special'),
      guard: guard('Tackle', 4),
      signature: { name: 'Withdraw', type: 'Water', category: 'status', power: 0, accuracy: 1, priority: 0, effect: 'withdraw' },
    },
  },
  caterpie: {
    name: 'Caterpie', dexNumber: 10, kind: 'Bug', types: ['Bug'], baseHp: 21, speed: 45,
    moves: { strike: strike('Tackle', 5), guard: guard('Tackle', 3) },
  },
  weedle: {
    name: 'Weedle', dexNumber: 13, kind: 'Bug / Poison', types: ['Bug', 'Poison'], baseHp: 20, speed: 50,
    moves: { strike: strike('Poison Sting', 5, 'Poison'), guard: guard('Poison Sting', 3, 'Poison') },
  },
  pidgey: {
    name: 'Pidgey', dexNumber: 16, kind: 'Normal / Flying', types: ['Normal', 'Flying'], baseHp: 23, speed: 56,
    moves: { strike: strike('Gust', 5, 'Flying', 'special'), guard: guard('Tackle', 3) },
  },
  rattata: {
    name: 'Rattata', dexNumber: 19, kind: 'Normal', types: ['Normal'], baseHp: 19, speed: 72,
    moves: { strike: strike('Quick Attack', 6, 'Normal', 'physical', { priority: 1 }), guard: guard('Tackle', 3) },
  },
  oddish: {
    name: 'Oddish', dexNumber: 43, kind: 'Grass / Poison', types: ['Grass', 'Poison'], baseHp: 23, speed: 30,
    moves: { strike: strike('Absorb', 5, 'Grass', 'special', { effect: 'absorb' }), guard: guard('Absorb', 3, 'Grass', 'special') },
  },
  bellsprout: {
    name: 'Bellsprout', dexNumber: 69, kind: 'Grass / Poison', types: ['Grass', 'Poison'], baseHp: 24, speed: 40,
    moves: { strike: strike('Vine Whip', 5, 'Grass'), guard: guard('Vine Whip', 4, 'Grass') },
  },
  paras: {
    name: 'Paras', dexNumber: 46, kind: 'Bug / Grass', types: ['Bug', 'Grass'], baseHp: 27, speed: 25,
    moves: { strike: strike('Scratch', 6), guard: guard('Scratch', 4) },
  },
};

export type Companion = { id: number; species: SpeciesId; hp: number; xp: number; smokescreenUses?: number };

export const SMOKESCREEN_GOAL = 10;
export function readSmokescreenUses(value: unknown) {
  return typeof value === 'number' && Number.isInteger(value) ? Math.max(0, Math.min(SMOKESCREEN_GOAL, value)) : 0;
}

export function isSignatureSmokescreen(member: Pick<Companion, 'species' | 'id'>, move: SpeciesMove) {
  return member.id > 0 && member.species === 'charmander' && move.name === 'Smokescreen';
}

export function isSpeciesId(value: unknown): value is SpeciesId {
  return typeof value === 'string' && Object.hasOwn(species, value);
}

export function getMove(id: SpeciesId, moveId: MoveId) {
  return species[id].moves[moveId];
}

type FourMoves = readonly [SpeciesMove, SpeciesMove, SpeciesMove, SpeciesMove];
const statusMove = (name: string, effect: NonNullable<SpeciesMove['effect']>, type: PokemonType = 'Normal', accuracy = 1) =>
  strike(name, 0, type, 'status', { effect, accuracy });

// Learnable battle moves shared by all encounter menus.
const growl = statusMove('Growl', 'attackDown');
const tailWhip = statusMove('Tail Whip', 'defenseDown');
const stringShot = statusMove('String Shot', 'speedDown', 'Bug', 0.95);
const stunSpore = statusMove('Stun Spore', 'paralyze', 'Grass', 0.75);
const tackle = strike('Tackle', 5);
const scratch = species.paras.moves.strike;
const battleMoveSets = {
  bulbasaur: [species.bulbasaur.moves.strike, tackle, species.bulbasaur.moves.signature!, growl],
  charmander: [species.charmander.moves.strike, scratch, species.charmander.moves.signature!, growl],
  squirtle: [species.squirtle.moves.strike, tackle, species.squirtle.moves.signature!, tailWhip],
  caterpie: [tackle, stringShot, strike('Bug Bite', 6, 'Bug'), strike('Electroweb', 5, 'Electric', 'special', { accuracy: 0.95, effect: 'speedDown' })],
  weedle: [species.weedle.moves.strike, stringShot, strike('Bug Bite', 6, 'Bug'), strike('Electroweb', 5, 'Electric', 'special', { accuracy: 0.95, effect: 'speedDown' })],
  pidgey: [species.pidgey.moves.strike, tackle, strike('Quick Attack', 6, 'Normal', 'physical', { priority: 1 }), statusMove('Sand Attack', 'smokescreen', 'Ground')],
  rattata: [species.rattata.moves.strike, tackle, strike('Bite', 6, 'Dark'), tailWhip],
  oddish: [species.oddish.moves.strike, strike('Acid', 6, 'Poison', 'special'), stunSpore, strike('Mega Drain', 7, 'Grass', 'special', { effect: 'absorb' })],
  bellsprout: [species.bellsprout.moves.strike, strike('Acid', 6, 'Poison', 'special'), stunSpore, strike('Razor Leaf', 6, 'Grass', 'physical', { accuracy: 0.95 })],
  paras: [scratch, strike('Absorb', 5, 'Grass', 'special', { effect: 'absorb' }), stunSpore, strike('Bug Bite', 6, 'Bug')],
} satisfies Record<SpeciesId, FourMoves>;

export function battleMoves(id: SpeciesId): FourMoves {
  return battleMoveSets[id];
}

export const revenantMoves = battleMoves;

export function pokemonSpriteUrl(id: SpeciesId) {
  return `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${species[id].dexNumber}.png`;
}

export function levelOf(companion: Companion) {
  return 1 + Math.floor(companion.xp / 10);
}

export function maxHp(companion: Companion) {
  return species[companion.species].baseHp + (levelOf(companion) - 1) * 3;
}

export const MAX_XP = 90;

export function gainXp(companion: Companion, reward: number): Companion {
  const trained = { ...companion, xp: Math.min(MAX_XP, companion.xp + reward) };
  return { ...trained, hp: trained.hp + maxHp(trained) - maxHp(companion) };
}

export function moveDescription(move: SpeciesMove) {
  switch (move.effect) {
    case 'seed': return 'Drains ⅛ of the foe’s max HP each round and heals the user.';
    case 'smokescreen': return 'Lowers the target’s accuracy by one stage.';
    case 'attackDown': return 'Lowers the target’s Attack by one stage.';
    case 'defenseDown': return 'Lowers the target’s Defense by one stage.';
    case 'speedDown': return 'Lowers the target’s Speed by two stages.';
    case 'paralyze': return 'Paralyzes the target.';
    case 'withdraw': return 'Raises the user’s Defense by one stage.';
    case 'absorb': return 'Restores half the damage dealt.';
    default: return `${move.type} · Power ${move.power}`;
  }
}

import { species, type PokemonType, type SpeciesId, type SpeciesMove } from './pokemonData';

type Matchup = { weak?: PokemonType[]; resist?: PokemonType[]; immune?: PokemonType[] };

// Move type to defending types, using the same chart as the earlier Wild Reclaim engine.
const typeChart: Record<PokemonType, Matchup> = {
  Normal: { resist: ['Rock', 'Steel'], immune: ['Ghost'] },
  Fire: { weak: ['Grass', 'Ice', 'Bug', 'Steel'], resist: ['Fire', 'Water', 'Rock', 'Dragon'] },
  Water: { weak: ['Fire', 'Ground', 'Rock'], resist: ['Water', 'Grass', 'Dragon'] },
  Electric: { weak: ['Water', 'Flying'], resist: ['Electric', 'Grass', 'Dragon'], immune: ['Ground'] },
  Grass: { weak: ['Water', 'Ground', 'Rock'], resist: ['Fire', 'Grass', 'Poison', 'Flying', 'Bug', 'Dragon', 'Steel'] },
  Ice: { weak: ['Grass', 'Ground', 'Flying', 'Dragon'], resist: ['Fire', 'Water', 'Ice', 'Steel'] },
  Fighting: { weak: ['Normal', 'Ice', 'Rock', 'Dark', 'Steel'], resist: ['Poison', 'Flying', 'Psychic', 'Bug', 'Fairy'], immune: ['Ghost'] },
  Poison: { weak: ['Grass', 'Fairy'], resist: ['Poison', 'Ground', 'Rock', 'Ghost'], immune: ['Steel'] },
  Ground: { weak: ['Fire', 'Electric', 'Poison', 'Rock', 'Steel'], resist: ['Grass', 'Bug'], immune: ['Flying'] },
  Flying: { weak: ['Grass', 'Fighting', 'Bug'], resist: ['Electric', 'Rock', 'Steel'] },
  Psychic: { weak: ['Fighting', 'Poison'], resist: ['Psychic', 'Steel'], immune: ['Dark'] },
  Bug: { weak: ['Grass', 'Psychic', 'Dark'], resist: ['Fire', 'Fighting', 'Poison', 'Flying', 'Ghost', 'Steel', 'Fairy'] },
  Rock: { weak: ['Fire', 'Ice', 'Flying', 'Bug'], resist: ['Fighting', 'Ground', 'Steel'] },
  Ghost: { weak: ['Psychic', 'Ghost'], resist: ['Dark'], immune: ['Normal'] },
  Dragon: { weak: ['Dragon'], resist: ['Steel'], immune: ['Fairy'] },
  Dark: { weak: ['Psychic', 'Ghost'], resist: ['Fighting', 'Dark', 'Fairy'] },
  Steel: { weak: ['Ice', 'Rock', 'Fairy'], resist: ['Fire', 'Water', 'Electric', 'Steel'] },
  Fairy: { weak: ['Fighting', 'Dragon', 'Dark'], resist: ['Fire', 'Poison', 'Steel'] },
};

export type BattleConditions = { accuracy: number; defense: number; seededBy?: number };
export const emptyConditions: BattleConditions = { accuracy: 0, defense: 0 };

export type BattleTarget = {
  id: number;
  species: SpeciesId;
  hp: number;
  maxHp: number;
  level: number;
  conditions: BattleConditions;
};

export function typeMultiplier(moveType: PokemonType, defenderTypes: readonly PokemonType[]): number {
  const matchup = typeChart[moveType];
  return defenderTypes.reduce((value, type) => {
    if (matchup.immune?.includes(type)) return 0;
    if (matchup.weak?.includes(type)) return value * 2;
    return matchup.resist?.includes(type) ? value * 0.5 : value;
  }, 1);
}

function stageMultiplier(stage: number, base: number) {
  return stage >= 0 ? (base + stage) / base : base / (base - stage);
}

export function damagePreview(actor: BattleTarget, target: BattleTarget, move: SpeciesMove, guarded = false) {
  if (move.category === 'status') return 0;
  const effectiveness = typeMultiplier(move.type, species[target.species].types);
  if (effectiveness === 0) return 0;
  const stab = species[actor.species].types.includes(move.type) ? 1.5 : 1;
  const defense = move.category === 'physical' ? stageMultiplier(target.conditions.defense, 2) : 1;
  const damage = (move.power + actor.level - 1) * stab * effectiveness / defense * (guarded ? 0.5 : 1);
  return Math.max(1, Math.floor(damage));
}

export function readBattleConditions(value: unknown): BattleConditions {
  if (!value || typeof value !== 'object') return emptyConditions;
  const { accuracy, defense, seededBy } = value as Partial<BattleConditions>;
  return {
    accuracy: typeof accuracy === 'number' && Number.isSafeInteger(accuracy) ? Math.max(-6, Math.min(6, accuracy)) : 0,
    defense: typeof defense === 'number' && Number.isSafeInteger(defense) ? Math.max(-6, Math.min(6, defense)) : 0,
    ...(typeof seededBy === 'number' && Number.isSafeInteger(seededBy) ? { seededBy } : {}),
  };
}

export function resolveBattleMove(actor: BattleTarget, target: BattleTarget, move: SpeciesMove, roll: number, guarded = false) {
  const actorName = species[actor.species].name;
  const targetName = species[target.species].name;
  const log = [`${actorName} used ${move.name}.`];
  if (move.effect === 'withdraw') {
    if (actor.conditions.defense >= 6) return { actor, target, log: [...log, `${actorName}’s Defense cannot go higher.`] };
    const defended = { ...actor, conditions: { ...actor.conditions, defense: actor.conditions.defense + 1 } };
    return { actor: defended, target, log: [...log, `${actorName}’s Defense rose.`] };
  }

  const accuracy = Math.min(1, move.accuracy * stageMultiplier(actor.conditions.accuracy, 3));
  if (roll >= accuracy && accuracy < 1) return { actor, target, log: [...log, 'The move missed.'] };

  if (move.effect === 'smokescreen') {
    if (target.conditions.accuracy <= -6) return { actor, target, log: [...log, `${targetName}’s accuracy cannot go lower.`] };
    const obscured = { ...target, conditions: { ...target.conditions, accuracy: target.conditions.accuracy - 1 } };
    return { actor, target: obscured, log: [...log, `${targetName}’s accuracy fell.`] };
  }
  if (move.effect === 'seed') {
    if (species[target.species].types.includes('Grass')) {
      return { actor, target, log: [...log, `Leech Seed does not affect ${targetName}.`] };
    }
    if (target.conditions.seededBy !== undefined) {
      return { actor, target, log: [...log, `${targetName} is already seeded.`] };
    }
    const seeded = { ...target, conditions: { ...target.conditions, seededBy: actor.id } };
    return { actor, target: seeded, log: [...log, `${targetName} was seeded.`] };
  }

  const damage = Math.min(target.hp, damagePreview(actor, target, move, guarded));
  if (damage === 0) return { actor, target, log: [...log, `It did not affect ${targetName}.`] };
  const effectiveness = typeMultiplier(move.type, species[target.species].types);
  const matchup = effectiveness > 1 ? ' Super effective!' : effectiveness < 1 ? ' Not very effective.' : '';
  log[0] = `${actorName} used ${move.name} for ${damage} damage.${matchup}`;
  let acting = actor;
  if (move.effect === 'absorb') {
    const heal = Math.min(actor.maxHp - actor.hp, Math.ceil(damage / 2));
    if (heal > 0) {
      acting = { ...actor, hp: actor.hp + heal };
      log.push(`${actorName} recovered ${heal} HP.`);
    }
  }
  return { actor: acting, target: { ...target, hp: target.hp - damage }, log };
}

export function drainSeed(target: BattleTarget, owner?: BattleTarget) {
  if (target.conditions.seededBy === undefined || target.hp === 0) return { target, owner, log: [] as string[] };
  const loss = Math.min(target.hp, Math.max(1, Math.floor(target.maxHp / 8)));
  const heal = owner && owner.hp > 0 && owner.id === target.conditions.seededBy ? Math.min(loss, owner.maxHp - owner.hp) : 0;
  const log = [`Leech Seed drained ${loss} HP from ${species[target.species].name}.`];
  if (owner && heal) log.push(`${species[owner.species].name} recovered ${heal} HP.`);
  return {
    target: { ...target, hp: target.hp - loss },
    owner: owner && heal ? { ...owner, hp: owner.hp + heal } : owner,
    log,
  };
}

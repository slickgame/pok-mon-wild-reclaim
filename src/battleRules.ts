import { species, SMOKESCREEN_GOAL, signatureTraining, type PokemonType, type SpeciesId, type SpeciesMove } from './pokemonData';

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

export type BattleConditions = { accuracy: number; defense: number; attack?: number; speed?: number; paralyzed?: boolean; seededBy?: number; masteredSeed?: boolean };
export const emptyConditions: BattleConditions = { accuracy: 0, defense: 0 };
export const ORAN_BERRY_HEAL = 10;

export type BattleTarget = {
  id: number;
  name?: string;
  species: SpeciesId;
  hp: number;
  maxHp: number;
  level: number;
  conditions: BattleConditions;
  smokescreenUses?: number;
  withdrawUses?: number;
  leechSeedUses?: number;
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
  const attack = move.category === 'physical' ? stageMultiplier(actor.conditions.attack ?? 0, 2) : 1;
  const damage = (move.power + actor.level - 1) * stab * effectiveness * attack / defense * (guarded ? 0.5 : 1);
  return Math.max(1, Math.floor(damage));
}

export function battleSpeed(actor: BattleTarget) {
  return (species[actor.species].speed + actor.level) * stageMultiplier(actor.conditions.speed ?? 0, 2) *
    (actor.conditions.paralyzed ? 0.5 : 1);
}

function readStage(value: unknown) {
  return typeof value === 'number' && Number.isSafeInteger(value) ? Math.max(-6, Math.min(6, value)) : 0;
}

export function readBattleConditions(value: unknown): BattleConditions {
  if (!value || typeof value !== 'object') return emptyConditions;
  const { accuracy, defense, attack, speed, paralyzed, seededBy, masteredSeed } = value as Partial<BattleConditions>;
  return {
    accuracy: readStage(accuracy),
    defense: readStage(defense),
    ...(readStage(attack) ? { attack: readStage(attack) } : {}),
    ...(readStage(speed) ? { speed: readStage(speed) } : {}),
    ...(paralyzed === true ? { paralyzed } : {}),
    ...(typeof seededBy === 'number' && Number.isSafeInteger(seededBy) ? { seededBy, ...(masteredSeed === true ? { masteredSeed } : {}) } : {}),
  };
}

function battleName(mon: BattleTarget) {
  return mon.name ?? species[mon.species].name;
}

export function moveTargetsSelf(move: SpeciesMove) {
  return move.effect === 'withdraw';
}

export function paralysisStopsMove(actor: BattleTarget, random: () => number, log: string[]) {
  if (!actor.conditions.paralyzed || random() >= 0.25) return false;
  log.push(`${battleName(actor)} is paralyzed and couldn’t move.`);
  return true;
}

const loweredStats = {
  smokescreen: { stat: 'accuracy', label: 'accuracy', amount: 1 },
  attackDown: { stat: 'attack', label: 'Attack', amount: 1 },
  defenseDown: { stat: 'defense', label: 'Defense', amount: 1 },
  speedDown: { stat: 'speed', label: 'Speed', amount: 2 },
} as const;

function lowerStat(target: BattleTarget, effect: keyof typeof loweredStats, override?: number) {
  const { stat, label, amount } = loweredStats[effect];
  const stage = target.conditions[stat] ?? 0;
  const name = battleName(target);
  if (stage <= -6) return { target, log: `${name}’s ${label} cannot go lower.` };
  return {
    target: { ...target, conditions: { ...target.conditions, [stat]: Math.max(-6, stage - (override ?? amount)) } },
    log: `${name}’s ${label} fell.`,
  };
}

export function resolveBattleMove(actor: BattleTarget, target: BattleTarget, move: SpeciesMove, roll: number, guarded = false, healingMultiplier = 1) {
  const actorName = battleName(actor);
  const targetName = battleName(target);
  const log = [`${actorName} used ${move.name}.`];
  const training = signatureTraining(actor, move);
  const mastered = !!training && training.uses >= SMOKESCREEN_GOAL;
  if (training && !mastered) {
    const uses = training.uses + 1;
    actor = { ...actor, [training.key]: uses };
    if (uses === SMOKESCREEN_GOAL) log.push(`${actorName} mastered ${move.name}!`);
  }
  if (move.effect === 'withdraw') {
    const defense = Math.min(6, actor.conditions.defense + (mastered ? 2 : 1));
    const heal = mastered ? Math.min(actor.maxHp - actor.hp, Math.floor(Math.max(1, Math.floor(actor.maxHp / 8)) * healingMultiplier)) : 0;
    if (heal > 0) log.push(`${actorName} recovered ${heal} HP.`);
    log.push(defense === actor.conditions.defense ? `${actorName}’s Defense cannot go higher.` : `${actorName}’s Defense rose.`);
    return { actor: { ...actor, hp: actor.hp + heal, conditions: { ...actor.conditions, defense } }, target, log };
  }

  const accuracy = Math.min(1, move.accuracy * stageMultiplier(actor.conditions.accuracy, 3));
  if (roll >= accuracy && accuracy < 1) return { actor, target, log: [...log, 'The move missed.'] };

  if (move.effect === 'smokescreen' || move.effect === 'attackDown' || move.effect === 'defenseDown' ||
      (move.effect === 'speedDown' && move.category === 'status')) {
    const lowered = lowerStat(target, move.effect, mastered && move.effect === 'smokescreen' ? 2 : undefined);
    return { actor, target: lowered.target, log: [...log, lowered.log] };
  }
  if (move.effect === 'paralyze') {
    if (species[target.species].types.includes('Grass') || species[target.species].types.includes('Electric')) {
      return { actor, target, log: [...log, `It did not affect ${targetName}.`] };
    }
    if (target.conditions.paralyzed) return { actor, target, log: [...log, `${targetName} is already paralyzed.`] };
    return {
      actor, target: { ...target, conditions: { ...target.conditions, paralyzed: true } },
      log: [...log, `${targetName} was paralyzed.`],
    };
  }
  if (move.effect === 'seed') {
    if (species[target.species].types.includes('Grass')) {
      return { actor, target, log: [...log, `Leech Seed does not affect ${targetName}.`] };
    }
    if (target.conditions.seededBy !== undefined) {
      return { actor, target, log: [...log, `${targetName} is already seeded.`] };
    }
    const seeded = { ...target, conditions: { ...target.conditions, seededBy: actor.id, masteredSeed: mastered } };
    return { actor, target: seeded, log: [...log, `${targetName} was seeded.`] };
  }

  const damage = Math.min(target.hp, damagePreview(actor, target, move, guarded));
  if (damage === 0) return { actor, target, log: [...log, `It did not affect ${targetName}.`] };
  const effectiveness = typeMultiplier(move.type, species[target.species].types);
  const matchup = effectiveness > 1 ? ' Super effective!' : effectiveness < 1 ? ' Not very effective.' : '';
  log[0] = `${actorName} used ${move.name} for ${damage} damage.${matchup}`;
  let acting = actor;
  if (move.effect === 'absorb') {
    const heal = Math.min(actor.maxHp - actor.hp, Math.floor(Math.ceil(damage / 2) * healingMultiplier));
    if (heal > 0) {
      acting = { ...actor, hp: actor.hp + heal };
      log.push(`${actorName} recovered ${heal} HP.`);
    }
  }
  const damaged = { ...target, hp: target.hp - damage };
  if (damaged.hp > 0 && move.effect === 'speedDown') {
    const lowered = lowerStat(damaged, move.effect);
    return { actor: acting, target: lowered.target, log: [...log, lowered.log] };
  }
  return { actor: acting, target: damaged, log };
}

export function drainSeed(target: BattleTarget, owner?: BattleTarget, healingMultiplier = 1) {
  if (target.conditions.seededBy === undefined || target.hp === 0) return { target, owner, log: [] as string[] };
  const loss = Math.min(target.hp, Math.max(1, Math.floor(target.maxHp / (target.conditions.masteredSeed ? 6 : 8))));
  const heal = owner && owner.hp > 0 && owner.id === target.conditions.seededBy
    ? Math.min(Math.floor(loss * healingMultiplier), owner.maxHp - owner.hp) : 0;
  const log = [`Leech Seed drained ${loss} HP from ${battleName(target)}.`];
  if (owner && heal) log.push(`${battleName(owner)} recovered ${heal} HP.`);
  return {
    target: { ...target, hp: target.hp - loss },
    owner: owner && heal ? { ...owner, hp: owner.hp + heal } : owner,
    log,
  };
}

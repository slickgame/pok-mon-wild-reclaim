import { moveDescription, type SpeciesMove } from './pokemonData';

// Base PP from the main-series move catalog. Wild Reclaim does not spend PP yet.
const referencePp: Readonly<Partial<Record<string, number>>> = {
  Absorb: 25,
  Acid: 30,
  Bite: 25,
  'Bug Bite': 20,
  Electroweb: 15,
  Ember: 25,
  Growl: 40,
  Gust: 35,
  'Leech Seed': 10,
  'Mega Drain': 15,
  'Poison Sting': 35,
  'Quick Attack': 30,
  'Razor Leaf': 25,
  'Sand Attack': 15,
  Scratch: 35,
  Smokescreen: 20,
  'String Shot': 40,
  'Stun Spore': 30,
  Tackle: 35,
  'Tail Whip': 30,
  'Vine Whip': 25,
  'Water Gun': 25,
  Withdraw: 40,
};

const effectSummaries: Record<NonNullable<SpeciesMove['effect']>, string> = {
  seed: 'Drains HP',
  smokescreen: 'Lowers accuracy',
  withdraw: 'Raises Defense',
  absorb: 'Recovers HP',
  attackDown: 'Lowers Attack',
  defenseDown: 'Lowers Defense',
  speedDown: 'Lowers Speed',
  paralyze: 'Paralyzes',
};

export function partyMoveDetails(move: SpeciesMove, targetsSelf: boolean) {
  const effects = move.effect ? [moveDescription(move)] : [];
  if (move.effect === 'seed') effects.push('Grass-type targets are immune.');
  if (move.effect === 'paralyze') effects.push('Grass- and Electric-type targets are immune.');
  if (move.priority > 0) effects.push('Acts before moves with lower priority.');
  return {
    effects,
    summary: move.effect ? effectSummaries[move.effect] : move.priority > 0 ? 'Priority attack' : 'Deals damage',
    pp: referencePp[move.name],
    accuracy: targetsSelf ? 'Always hits' : `${Math.round(move.accuracy * 100)}%`,
  };
}

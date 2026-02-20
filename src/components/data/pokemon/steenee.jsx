export const steeneeData = {
  dexId: 762,
  species: 'Steenee',
  displayName: 'Steenee',
  types: ['Grass'],
  baseStats: {
    HP: 52,
    Attack: 40,
    Defense: 48,
    SpAttack: 40,
    SpDefense: 48,
    Speed: 62
  },
  evYield: {
    Speed: 2
  },
  baseExp: 102,
  baseExpYield: 102,
  evolvesFrom: 'Bounsweet',
  passiveAbilities: ['Leaf Guard', 'Oblivious'],
  hiddenAbility: 'Sweet Veil',
  battleRole: 'Scout',
  signatureMove: 'Rapid Spin',
  description:
    'Steenee dances around opponents to control tempo and maintain team momentum.',
  learnset: [
    { level: 1, move: 'Rapid Spin' },
    { level: 1, move: 'Sweet Scent' },
    { level: 1, move: 'Razor Leaf' },
    { level: 1, move: 'Magical Leaf' },
    { level: 20, move: 'Aromatherapy' },
    { level: 24, move: 'Synthesis' },
    { level: 28, move: 'Energy Ball' },
    { level: 34, move: 'Grassy Terrain' },
    { level: 40, move: 'Petal Dance' },
    { level: 48, move: 'Solar Beam' },
    { level: 58, move: 'Aromatherapy' },
    { level: 72, move: 'Synthesis' },
    { level: 88, move: 'Petal Dance' }
  ],
  talentPool: [
    'sweetRush',
    'queenlyPoise',
    'tropicGuard',
    'velvetAroma',
    'stompTempo',
    'crownStep',
    'petalWard',
    'sunlitStride',
    'royalHarvest',
    'majesticFlourish'
  ],
  dropItems: [
    { item: 'Oran Berry', chance: 0.24 },
    { item: 'Sitrus Berry', chance: 0.16 },
    { item: 'Lum Berry', chance: 0.08 }
  ]
};

export const tsareenaData = {
  dexId: 763,
  species: 'Tsareena',
  displayName: 'Tsareena',
  types: ['Grass'],
  baseStats: {
    HP: 72,
    Attack: 120,
    Defense: 98,
    SpAttack: 50,
    SpDefense: 98,
    Speed: 72
  },
  evYield: {
    Attack: 3
  },
  baseExp: 230,
  baseExpYield: 230,
  evolvesFrom: 'Steenee',
  passiveAbilities: ['Leaf Guard', 'Queenly Majesty'],
  hiddenAbility: 'Sweet Veil',
  battleRole: 'Striker',
  signatureMove: 'Trop Kick',
  description:
    'Tsareena dominates fights with commanding pressure, crippling foes while maintaining frontline durability.',
  learnset: [
    { level: 1, move: 'Rapid Spin' },
    { level: 1, move: 'Sweet Scent' },
    { level: 1, move: 'Razor Leaf' },
    { level: 1, move: 'Magical Leaf' },
    {
      level: 30,
      move: 'Trop Kick'
    },
    { level: 34, move: 'Synthesis' },
    { level: 38, move: 'Energy Ball' },
    { level: 44, move: 'Grassy Terrain' },
    { level: 50, move: 'Petal Dance' },
    { level: 58, move: 'Solar Beam' },
    { level: 66, move: 'Aromatherapy' },
    { level: 76, move: 'Toxic' },
    { level: 86, move: 'Trop Kick' },
    { level: 98, move: 'Solar Beam' }
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
    { item: 'Sitrus Berry', chance: 0.2 },
    { item: 'Lum Berry', chance: 0.12 },
    { item: 'Oran Berry', chance: 0.18 }
  ]
};

export const VERDANT_HOLLOW_NODELETS = [
  {
    id: 'vh-brambleberry-thicket',
    name: 'Brambleberry Thicket',
    type: 'Resource',
    description:
      'A sun-dappled patch dense with berry brambles where gatherers learn to harvest, sort, and plant medicinal fruit.',
    gameplayFeatures: [
      'Berry gathering route with repeatable harvest nodes',
      'Healing economy starter loop (harvest, keep, or sell)',
      'Optional planting objective for bonus yields',
      'Tiered berry contracts for Iris and Merra',
      'Poacher ambush risk during high-yield actions'
    ],
    npcs: ['Iris the Forager', 'Merra (seasonal buyer)'],
    items: ['Oran Berry', 'Pecha Berry', 'Cheri Berry', 'Soft Mulch', "Forager's Gloves"],
    wildPokemon: ['Oddish', 'Caterpie', 'Cherubi', 'Bounsweet', 'Pidgey', 'Pikachu'],
    enemyNPCs: ['Berry Poacher Duo'],
    actions: ['Harvest', 'Plant', 'Deliver Berries'],
    encounterTables: {
      ExploreDay: [
        { species: 'Oddish', weight: 38, levelRange: [6, 9] },
        { species: 'Caterpie', weight: 34, levelRange: [5, 8] },
        { species: 'Pidgey', weight: 16, levelRange: [6, 10] },
        { species: 'Pikachu', weight: 7, levelRange: [8, 12] },
        { species: 'Cherubi', weight: 3, levelRange: [6, 9] },
        { species: 'Bounsweet', weight: 2, levelRange: [6, 9] }
      ],
      ExploreNight: [
        { species: 'Oddish', weight: 44, levelRange: [6, 9] },
        { species: 'Caterpie', weight: 24, levelRange: [5, 8] },
        { species: 'Pidgey', weight: 10, levelRange: [6, 10] },
        { species: 'Pikachu', weight: 8, levelRange: [8, 12] },
        { species: 'Cherubi', weight: 8, levelRange: [6, 9] },
        { species: 'Bounsweet', weight: 6, levelRange: [6, 9] }
      ],
      Harvest: [
        { species: 'Cherubi', weight: 34, levelRange: [6, 9] },
        { species: 'Bounsweet', weight: 30, levelRange: [6, 9] },
        { species: 'Oddish', weight: 18, levelRange: [6, 9] },
        { species: 'Caterpie', weight: 10, levelRange: [5, 8] },
        { species: 'Pidgey', weight: 4, levelRange: [6, 10] },
        { species: 'Pikachu', weight: 2, levelRange: [8, 12] }
      ],
      HarvestStreak: [
        { species: 'Bounsweet', weight: 36, levelRange: [7, 10] },
        { species: 'Cherubi', weight: 30, levelRange: [7, 10] },
        { species: 'Oddish', weight: 18, levelRange: [7, 10] },
        { species: 'Pikachu', weight: 6, levelRange: [9, 12] },
        { species: 'Pidgey', weight: 5, levelRange: [7, 11] },
        { species: 'Caterpie', weight: 5, levelRange: [6, 9] }
      ]
    },
    objectives: [
      { id: 'harvest-run', label: 'Harvest 3 berry patches', action: 'Harvest', goal: 3, reward: { items: [{ name: 'Soft Mulch', quantity: 1 }] }, repeatMinutes: 120 },
      { id: 'berry-delivery', label: 'Deliver a berry bundle', action: 'Deliver Berries', goal: 1, reward: { gold: 150 }, repeatMinutes: 180 },
      { id: 'merra-contract-tier1', label: 'Merra Contract I: Deliver 2 bundles', action: 'Deliver Berries', goal: 2, reward: { gold: 280, items: [{ name: 'Pecha Berry', quantity: 2 }] }, repeatMinutes: 240 },
      { id: 'merra-contract-tier2', label: 'Merra Contract II: Keep a 3x harvest streak', action: 'Harvest', goal: 3, reward: { gold: 420, items: [{ name: "Forager's Gloves", quantity: 1 }] }, repeatMinutes: 360 }
    ],
    npcHooks: ['Iris Affinity +1 on contract completion', 'Merra Affinity +1 on delivery streaks'],
    unlockDiscoveryProgress: 0,
    isCompleted: false,
    eclipseControlled: false
  },
  {
    id: 'vh-mosswater-bog',
    name: 'Mosswater Bog',
    type: 'Quest',
    description:
      'A shallow, reed-choked wetland where still pools hide fish Pokémon and thick mud turns every outing into a survival lesson.',
    gameplayFeatures: [
      'Introduces fishing with bait quality choices',
      'Hazardous mud tiles reduce retreat success',
      'Day and dusk pool rotations for encounter variety'
    ],
    npcs: ['Reed the Angler', 'Wells (material requests)'],
    items: ['Basic Bait', 'Quality Bait', 'Bog Reed', 'River Stone'],
    wildPokemon: ['Poliwag', 'Wooper', 'Magikarp', 'Lotad', 'Tympole'],
    enemyNPCs: ['Bog Raider'],
    actions: ['Fish', 'Survey Pool', 'Collect Reeds'],
    encounterTables: {
      Explore: [
        { species: 'Poliwag', weight: 35, levelRange: [7, 11] },
        { species: 'Wooper', weight: 30, levelRange: [7, 11] },
        { species: 'Lotad', weight: 20, levelRange: [8, 12] },
        { species: 'Magikarp', weight: 15, levelRange: [6, 10] }
      ],
      Fish: [
        { species: 'Poliwag', weight: 28, levelRange: [7, 11] },
        { species: 'Wooper', weight: 24, levelRange: [7, 11] },
        { species: 'Lotad', weight: 22, levelRange: [8, 12] },
        { species: 'Magikarp', weight: 16, levelRange: [6, 10] },
        { species: 'Tympole', weight: 10, levelRange: [8, 12] }
      ]
    },
    objectives: [
      { id: 'bog-angler', label: 'Fish twice in the bog', action: 'Fish', goal: 2, reward: { items: [{ name: 'River Stone', quantity: 1 }] }, repeatMinutes: 120 },
      { id: 'reed-run', label: 'Collect reeds for Wells', action: 'Collect Reeds', goal: 2, reward: { items: [{ name: 'Bog Reed', quantity: 2 }] }, repeatMinutes: 90 }
    ],
    unlockDiscoveryProgress: 10,
    isCompleted: false,
    eclipseControlled: false
  },
  {
    id: 'vh-eclipse-tainted-spring',
    name: 'Eclipse-Tainted Spring',
    type: 'Eclipse',
    description:
      'A once-clear spring now clouded by corruption. Cleansing it reveals how Team Eclipse manipulates local habitats.',
    gameplayFeatures: [
      'Narrative combat loop tied to zone liberation',
      'Cleansing objective chain (scan, battle, purify)',
      'Unlocks safer spring gathering once liberated'
    ],
    npcs: ['Professor Maple', 'Nurse Jenny'],
    items: ['Corrupted Fragment', 'Purified Water', 'Cleanse Bloom'],
    wildPokemon: ['Oddish', 'Psyduck'],
    enemyNPCs: ['Eclipse Acolyte'],
    actions: ['Inspect Corruption', 'Challenge Revenant', 'Purify Spring'],
    encounterTables: {
      Explore: [
        { species: 'Oddish', weight: 60, levelRange: [8, 12] },
        { species: 'Psyduck', weight: 40, levelRange: [8, 12] }
      ]
    },
    objectives: [
      { id: 'scan-spring', label: 'Inspect the corruption', action: 'Inspect Corruption', goal: 1, reward: { items: [{ name: 'Corrupted Fragment', quantity: 1 }] }, repeatMinutes: 180 },
      { id: 'purify-cycle', label: 'Purify the spring', action: 'Purify Spring', goal: 1, reward: { items: [{ name: 'Purified Water', quantity: 1 }, { name: 'Cleanse Bloom', quantity: 1 }] }, repeatMinutes: 240 }
    ],
    unlockDiscoveryProgress: 20,
    isCompleted: false,
    eclipseControlled: true,
    revenantEncounter: {
      species: 'Oddish',
      level: 12,
      isBoss: false
    },
    liberationRewards: {
      unlockRecipes: ['Purified Tonic'],
      unlockMaterials: ['Purified Water'],
      bonusXp: 120
    }
  },
  {
    id: 'vh-whispering-apiary-ruins',
    name: 'Whispering Apiary Ruins',
    type: 'Secret',
    description:
      'Collapsed stone hives hum with wild swarms. Set honey lures and return later to trigger ambush encounters with richer rewards.',
    gameplayFeatures: [
      'Honey lure placement and delayed swarm encounters',
      'Risk-reward scaling with lure quality',
      'Trade loop support through rare nectar sales'
    ],
    npcs: ['Beekeeper Sol', 'Merra (rare nectar buyer)'],
    items: ['Wild Honey', 'Royal Jelly', 'Wax Comb'],
    wildPokemon: ['Combee', 'Burmy', 'Cutiefly', 'Beedrill'],
    enemyNPCs: ['Honey Thief Crew', 'Bug Specialist'],
    actions: ['Set Lure', 'Harvest Hive', 'Defend Apiary'],
    encounterTables: {
      Explore: [
        { species: 'Combee', weight: 40, levelRange: [10, 13] },
        { species: 'Burmy', weight: 30, levelRange: [9, 12] },
        { species: 'Cutiefly', weight: 20, levelRange: [10, 13] },
        { species: 'Beedrill', weight: 10, levelRange: [12, 14] }
      ],
      DefendApiary: [
        { species: 'Combee', weight: 35, levelRange: [10, 13] },
        { species: 'Burmy', weight: 30, levelRange: [9, 12] },
        { species: 'Cutiefly', weight: 20, levelRange: [10, 13] },
        { species: 'Beedrill', weight: 15, levelRange: [12, 14] }
      ]
    },
    objectives: [
      { id: 'set-lure', label: 'Set an apiary lure', action: 'Set Lure', goal: 1, reward: { items: [{ name: 'Wild Honey', quantity: 1 }] }, repeatMinutes: 120 },
      { id: 'apiary-defense', label: 'Defend the hive once', action: 'Defend Apiary', goal: 1, reward: { items: [{ name: 'Royal Jelly', quantity: 1 }] }, repeatMinutes: 180 }
    ],
    unlockDiscoveryProgress: 45,
    isCompleted: false,
    eclipseControlled: false
  }
];

const LEGACY_PLACE_NAMES = new Set(['Old Shrine', 'Herb Garden', 'Hidden Grotto']);

export function shouldSeedVerdantNodelets(zone) {
  if (!zone || zone.name !== 'Verdant Hollow') return false;
  const current = Array.isArray(zone.nodelets) ? zone.nodelets : [];
  if (current.length === 0) return true;

  const currentIds = new Set(current.map((nodelet) => nodelet?.id).filter(Boolean));
  const hasAnyModernId = VERDANT_HOLLOW_NODELETS.some((nodelet) => currentIds.has(nodelet.id));

  const hasOnlyLegacyNames =
    current.length > 0 &&
    current.every((nodelet) => LEGACY_PLACE_NAMES.has(nodelet?.name));

  // Force update if any nodelet has "Replant" in actions (legacy fix)
  const hasReplantAction = current.some((nodelet) => 
    Array.isArray(nodelet?.actions) && nodelet.actions.includes('Replant')
  );

  // Force update if actions array is stale (missing Plant, has old wording)
  const hasStaleActions = current.some((nodelet) =>
    Array.isArray(nodelet?.actions) && nodelet.actions.includes('Replant')
  );

  return (!hasAnyModernId && hasOnlyLegacyNames) || hasReplantAction || hasStaleActions;
}
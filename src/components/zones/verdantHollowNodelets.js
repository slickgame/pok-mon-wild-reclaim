export const VERDANT_HOLLOW_NODELETS = [
  {
    id: 'vh-brambleberry-thicket',
    name: 'Brambleberry Thicket',
    type: 'Resource',
    description:
      'A sun-dappled patch dense with berry brambles where gatherers learn to harvest, sort, and replant medicinal fruit.',
    gameplayFeatures: [
      'Berry gathering route with repeatable harvest nodes',
      'Healing economy starter loop (harvest, keep, or sell)',
      'Optional replanting objective for bonus yields'
    ],
    npcs: ['Iris the Forager', 'Merra (seasonal buyer)'],
    items: ['Oran Berry', 'Pecha Berry', 'Cheri Berry', 'Soft Mulch'],
    wildPokemon: ['Oddish', 'Caterpie', 'Pidgey'],
    enemyNPCs: ['Berry Poacher Duo'],
    actions: ['Harvest', 'Replant', 'Deliver Berries'],
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
    wildPokemon: ['Poliwag', 'Wooper', 'Magikarp', 'Lotad'],
    enemyNPCs: ['Bog Raider'],
    actions: ['Fish', 'Survey Pool', 'Collect Reeds'],
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
    unlockDiscoveryProgress: 45,
    isCompleted: false,
    eclipseControlled: false,
    isComingSoon: true
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

  return !hasAnyModernId && hasOnlyLegacyNames;
}

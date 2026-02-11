import { MOVE_DATA } from '@/components/pokemon/moveData';
import { TalentRegistry } from '@/components/data/TalentRegistry';
import { TagRegistry } from '@/components/data/TagRegistry';
import { PokemonRegistry } from '@/components/data/PokemonRegistry';
import { LEVEL_UP_LEARNSETS } from '@/components/pokemon/levelUpLearnsets';
import { MoveEffectRegistry } from '@/components/data/MoveEffectRegistry';

const SUPPORTED_STATUS_EFFECTS = new Set(['burn', 'poison', 'paralysis']);
const SUPPORTED_LEGACY_EFFECTS = new Set([
  'badlyPoison',
  'boostMultiple',
  'breakScreens',
  'burnOrFlinch',
  'charge',
  'chargeAttack',
  'conditional',
  'conditionalDrain',
  'confuse',
  'confuseAfter',
  'copyLastMove',
  'criticalBoost',
  'cureAllStatuses',
  'drain',
  'flinch',
  'forceSwitch',
  'freeze',
  'healAllies',
  'healOverTime',
  'healSelf',
  'healTarget',
  'ingrain',
  'leechSeed',
  'lowerAccuracy',
  'lowerAttack',
  'lowerDefense',
  'lowerEvasion',
  'lowerSelfSpAtk',
  'lowerSpDef',
  'lowerSpeed',
  'mirrorCoat',
  'mudSport',
  'multiBoost',
  'naturePower',
  'paralyze',
  'pledge',
  'protect',
  'raiseAccuracy',
  'raiseAllStats',
  'raiseAttack',
  'raiseDefense',
  'raiseDefenseAndCharge',
  'raiseSpDef',
  'raiseSpeed',
  'recharge',
  'recoil',
  'redirect',
  'removeHazards',
  'safeguard',
  'setScreen',
  'setTerrain',
  'sleep',
  'statusField',
  'tailwind',
  'trap',
  'weather',
]);

const knownTagKeys = Object.keys(TagRegistry);

function moveEffectRegistryHasMove(moveName) {
  const effectKey = `${moveName || ''}`.toLowerCase().replace(/\s+/g, '');
  return Boolean(MoveEffectRegistry[effectKey]);
}

function getSpeciesLearnsetMoveNames(speciesData = {}) {
  const learnset = Array.isArray(speciesData.learnset) ? speciesData.learnset : [];
  return learnset
    .map((entry) => entry?.move || entry?.name)
    .filter(Boolean);
}

function validateMoveTags(moveName, moveData, warnings) {
  if (!Array.isArray(moveData.tags)) {
    warnings.push(`Move "${moveName}" is missing tags array.`);
    return;
  }

  for (const tag of moveData.tags) {
    const normalized = `${tag || ''}`.trim().toLowerCase();
    const isKnown = knownTagKeys.some((key) => key.toLowerCase() === normalized);
    if (!isKnown) {
      warnings.push(`Move "${moveName}" uses unknown tag "${tag}".`);
    }
  }
}

function validateMoveEffect(moveName, moveData, warnings) {
  const effect = moveData?.effect;
  if (!effect) return;

  if (typeof effect === 'object') {
    return;
  }

  if (SUPPORTED_STATUS_EFFECTS.has(effect) || SUPPORTED_LEGACY_EFFECTS.has(effect)) {
    return;
  }

  if (moveEffectRegistryHasMove(moveName)) {
    return;
  }

  warnings.push(`Move "${moveName}" uses effect "${effect}" with no known battle handler.`);
}

function validatePokemonLearnsets(warnings) {
  const speciesEntries = Object.values(PokemonRegistry);

  for (const speciesData of speciesEntries) {
    const speciesName = speciesData?.species;
    if (!speciesName) continue;

    const hasLevelUpLearnset = Boolean(LEVEL_UP_LEARNSETS[speciesName]);
    if (!hasLevelUpLearnset) {
      warnings.push(`Species "${speciesName}" is missing LEVEL_UP_LEARNSETS entry.`);
    }

    const moves = getSpeciesLearnsetMoveNames(speciesData);
    for (const moveName of moves) {
      if (!MOVE_DATA[moveName]) {
        warnings.push(`Species "${speciesName}" learnset move "${moveName}" is missing from MOVE_DATA.`);
      }
    }
  }
}

function validateTalentTags(warnings) {
  for (const talent of Object.values(TalentRegistry)) {
    if (!talent?.tagsAffected) continue;

    for (const tag of talent.tagsAffected) {
      const normalized = `${tag || ''}`.trim().toLowerCase();
      const isKnown = knownTagKeys.some((key) => key.toLowerCase() === normalized);
      if (!isKnown) {
        warnings.push(`Talent "${talent.name || talent.id || 'Unknown'}" has unknown tag "${tag}".`);
      }
    }
  }
}

export function validateTagsAndTriggers() {
  const warnings = [];

  for (const [moveName, moveData] of Object.entries(MOVE_DATA)) {
    validateMoveTags(moveName, moveData, warnings);
    validateMoveEffect(moveName, moveData, warnings);
  }

  validateTalentTags(warnings);
  validatePokemonLearnsets(warnings);

  if (warnings.length === 0) {
    console.info('[validation] Pokémon/move/tag audit passed with no issues.');
    return;
  }

  console.groupCollapsed(`[validation] Found ${warnings.length} data issue(s)`);
  warnings.forEach((warning) => console.warn(warning));
  console.groupEnd();
}

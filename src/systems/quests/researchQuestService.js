import { PokemonRegistry } from '@/components/data/PokemonRegistry';
import { TalentRegistry } from '@/components/data/TalentRegistry';
import { TIME_CONSTANTS, getAbsoluteDayIndex, getTimeLeftLabel, normalizeGameTime, toTotalMinutes } from '@/systems/time/gameTimeSystem';
import { calculateQuestValue, QUEST_VALUE_VERSION } from '@/systems/quests/researchQuestTuning';
import { buildRewardPackage } from '@/systems/quests/researchQuestRewards';
import {
  chooseTierByStrictController,
  getProgressionFactor,
  saveGlobalResearchAnalytics,
  updateAnalyticsForGenerated,
  updateAnalyticsForOutcome
} from '@/systems/quests/researchQuestAnalytics';

const VERDANT_SPECIES = [
  { name: 'Caterpie', weight: 3, rarity: 'common' },
  { name: 'Pidgey', weight: 3, rarity: 'common' },
  { name: 'Oddish', weight: 2, rarity: 'uncommon' },
  { name: 'Pikachu', weight: 1, rarity: 'rare' }
];

const REGION_SPECIES_POOLS = {
  'Verdant Hollow': VERDANT_SPECIES,
  default: VERDANT_SPECIES
};

const NATURES = [
  'Hardy', 'Lonely', 'Brave', 'Adamant', 'Naughty',
  'Bold', 'Docile', 'Relaxed', 'Impish', 'Lax',
  'Timid', 'Hasty', 'Serious', 'Jolly', 'Naive',
  'Modest', 'Mild', 'Quiet', 'Bashful', 'Rash',
  'Calm', 'Gentle', 'Sassy', 'Careful', 'Quirky'
];

const IV_STATS = ['HP', 'Atk', 'Def', 'SpAtk', 'SpDef', 'Speed'];

export const QUEST_CONFIG = {
  maxFreeRerolls: 3,
  rerollCost: 150,
  cooldownReset: 'daily',
  expiryBatchSize: 25
};

const REWARD_BASE = {
  common: 100,
  uncommon: 250,
  rare: 500
};

const DIFFICULTY_TIERS = [
  { name: 'Easy', min: 1, max: 2, difficultyMod: 1.0, trustGain: 2, notesGain: 1 },
  { name: 'Normal', min: 3, max: 4, difficultyMod: 1.2, trustGain: 4, notesGain: 1 },
  { name: 'Hard', min: 5, max: 6, difficultyMod: 1.5, trustGain: 6, notesGain: 2 },
  { name: 'Very Hard', min: 7, max: 8, difficultyMod: 2.0, trustGain: 8, notesGain: 3 },
  { name: 'Elite', min: 9, max: 10, difficultyMod: 3.0, trustGain: 10, notesGain: 4 },
  { name: 'Legendary', min: 11, max: Infinity, difficultyMod: 6.0, trustGain: 14, notesGain: 6 }
];

const DIFFICULTY_TIER_ORDER = DIFFICULTY_TIERS.map((tier) => tier.name);

const CONDITION_POOL = [
  { type: 'nature', weight: 2 },
  { type: 'iv', weight: 4 },
  { type: 'talent', weight: 3 },
  { type: 'level', weight: 3 },
  { type: 'special', weight: 2 }
];

const IV_THRESHOLD_BUCKETS = [
  { min: 12, max: 16, weight: 4 },
  { min: 17, max: 20, weight: 3 },
  { min: 21, max: 25, weight: 2 }
];

const TALENT_GRADES = [
  { grade: 'Basic', weight: 5 },
  { grade: 'Rare', weight: 3 },
  { grade: 'Epic', weight: 1 }
];

function weightedRoll(options) {
  const totalWeight = options.reduce((sum, option) => sum + option.weight, 0);
  let roll = Math.random() * totalWeight;
  for (const option of options) {
    if (roll < option.weight) return option;
    roll -= option.weight;
  }
  return options[options.length - 1];
}

function pickRandom(items) {
  return items[Math.floor(Math.random() * items.length)];
}


function hasMeaningfulRequirement(quest = {}) {
  const requirementsFromJson = (() => {
    if (!quest?.requirementsJson) return {};
    try {
      const parsed = JSON.parse(quest.requirementsJson);
      return parsed && typeof parsed === 'object' ? parsed : {};
    } catch {
      return {};
    }
  })();


  const requirements = {
    ...(requirementsFromJson || {}),
    ...(quest.requirements || {})
  };

  return Boolean(
    quest?.level
    || (quest?.quantityRequired || quest?.requiredCount || 1) > 1
    || (quest?.ivConditions?.length || 0) > 0
    || (quest?.talentConditions?.length || 0) > 0
    || quest?.shinyRequired
    || quest?.alphaRequired
    || quest?.bondedRequired
    || quest?.hiddenAbilityRequired
    || requirements?.level
    || (requirements?.quantityRequired || 1) > 1
    || (requirements?.ivConditions?.length || 0) > 0
    || (requirements?.talentConditions?.length || 0) > 0
    || requirements?.shinyRequired
    || requirements?.alphaRequired
    || requirements?.bondedRequired
    || requirements?.hiddenAbilityRequired
  );
}


function ensureQuestHasPersistableVariety(quest, seed = 0) {
  const normalized = normalizeQuestRequirements(quest || {});
  const hasComplex = hasMeaningfulRequirement(normalized);
  const hasOnlyNature = hasComplex && Boolean(normalized?.nature) && !(
    normalized?.level
    || (normalized?.quantityRequired || 1) > 1
    || (normalized?.ivConditions?.length || 0) > 0
    || normalized?.ivStat
    || (normalized?.talentConditions?.length || 0) > 0
    || normalized?.shinyRequired
    || normalized?.alphaRequired
    || normalized?.bondedRequired
    || normalized?.hiddenAbilityRequired
  );

  if (!hasOnlyNature) return quest;

  const mode = seed % 3;
  if (mode === 0) {
    const stat = pickRandom(IV_STATS);
    const min = 14 + Math.floor(Math.random() * 8);
    const ivConditions = [{ stat, min }];
    return {
      ...normalized,
      requirementType: normalized.requirementType === 'nature' ? 'mixed' : (normalized.requirementType || 'mixed'),
      ivConditions,
      ivStat: stat,
      ivThreshold: min,
      requirements: { ...(normalized.requirements || {}), ivConditions }
    };
  }

  if (mode === 1) {
    const level = Math.max(12, normalized?.level || (12 + Math.floor(Math.random() * 18)));
    return {
      ...normalized,
      requirementType: normalized.requirementType === 'nature' ? 'mixed' : (normalized.requirementType || 'mixed'),
      level,
      requirements: { ...(normalized.requirements || {}), level }
    };
  }

  const specialFlags = ['shinyRequired', 'alphaRequired', 'bondedRequired', 'hiddenAbilityRequired'];
  const chosen = specialFlags[Math.floor(Math.random() * specialFlags.length)];
  return {
    ...normalized,
    requirementType: normalized.requirementType === 'nature' ? 'mixed' : (normalized.requirementType || 'mixed'),
    [chosen]: true,
    requirements: { ...(normalized.requirements || {}), [chosen]: true }
  };
}

function serializeQuestForStorage(quest) {
  return {
    ...quest,
    requirementsJson: JSON.stringify(quest?.requirements || {})
  };
}

async function createQuestWithPersistenceGuard(base44, quest, contextLabel = 'research_create') {
  const payload = serializeQuestForStorage(quest);
  const created = await base44.entities.ResearchQuest.create(payload);

  const createdId = created?.id;
  if (!createdId || !base44.entities.ResearchQuest.get) {
    return created;
  }

  const persisted = await base44.entities.ResearchQuest.get(createdId).catch(() => null);
  if (!persisted) return created;

  const sourceHasMeaningful = hasMeaningfulRequirement(quest);
  const persistedHasMeaningful = hasMeaningfulRequirement(persisted);
  if (!sourceHasMeaningful || persistedHasMeaningful) return created;

  console.warn(`[${contextLabel}] Persisted quest lost requirement fields, restoring canonical payload for quest ${createdId}.`);
  await base44.entities.ResearchQuest.update(createdId, {
    requirements: quest.requirements || {},
    requirementsJson: JSON.stringify(quest.requirements || {}),
    nature: quest.nature || null,
    level: quest.level || null,
    quantityRequired: quest.quantityRequired || 1,
    ivConditions: quest.ivConditions || [],
    talentConditions: quest.talentConditions || [],
    shinyRequired: Boolean(quest.shinyRequired),
    alphaRequired: Boolean(quest.alphaRequired),
    bondedRequired: Boolean(quest.bondedRequired),
    hiddenAbilityRequired: Boolean(quest.hiddenAbilityRequired),
    requirementType: quest.requirementType || 'mixed'
  }).catch(() => {});

  return created;
}

function getTalentPool(speciesName) {
  const speciesData = PokemonRegistry[speciesName.toLowerCase()];
  const pool = speciesData?.talentPool;
  if (Array.isArray(pool)) return pool;
  if (pool?.options && Array.isArray(pool.options)) return pool.options;
  return [];
}

function getSpeciesPool(player) {
  const regionKey = player?.currentRegion || player?.region || player?.currentZone || 'default';
  return REGION_SPECIES_POOLS[regionKey] || REGION_SPECIES_POOLS.default;
}

function getDifficultyTier(weight) {
  return DIFFICULTY_TIERS.find((tier) => weight >= tier.min && weight <= tier.max) || DIFFICULTY_TIERS[0];
}

function getDifficultyTierByName(name) {
  return DIFFICULTY_TIERS.find((tier) => tier.name === name) || DIFFICULTY_TIERS[0];
}

function chooseFinalDifficultyTier({ baselineTier, controllerTierName }) {
  const controllerTier = getDifficultyTierByName(controllerTierName || baselineTier?.name);
  const baselineIdx = DIFFICULTY_TIER_ORDER.indexOf(baselineTier?.name || 'Easy');
  const controllerIdx = DIFFICULTY_TIER_ORDER.indexOf(controllerTier?.name || 'Easy');
  return DIFFICULTY_TIERS[Math.max(baselineIdx, controllerIdx, 0)] || baselineTier || controllerTier || DIFFICULTY_TIERS[0];
}


function appendTransitionLog(entity = {}, toStatus, reason, fromStatus = null) {
  const previousStatus = fromStatus || entity.status || (entity.active ? 'generated' : 'unknown');
  const existing = Array.isArray(entity.transitionLog) ? entity.transitionLog : [];
  return [
    ...existing,
    {
      from: previousStatus,
      to: toStatus,
      at: new Date().toISOString(),
      reason,
      source: 'researchQuestService'
    }
  ];
}

function getRewardForQuest({ avgTargetLevel, difficultyTier, requirementType, requirementKinds = [], questValue, progressionFactor }) {
  const baseReward = buildRewardPackage({
    difficultyTier,
    requirementType,
    requirementKinds,
    questValue,
    progressionFactor
  });

  return {
    ...baseReward,
    levelFactor: (avgTargetLevel || 10) * 0.2,
    difficultyMod: difficultyTier.difficultyMod
  };
}

export function getQuestDurationMinutes({ rarity, difficultyTier }) {
  const tierName = difficultyTier?.name || difficultyTier || 'Normal';
  const isEasyLike = rarity === 'common' || tierName === 'Easy' || tierName === 'Normal';
  const isHardLike = rarity === 'rare' || ['Hard', 'Very Hard', 'Elite', 'Legendary'].includes(tierName);

  if (isEasyLike) return TIME_CONSTANTS.DAYS_PER_MONTH * TIME_CONSTANTS.MINUTES_PER_DAY;
  if (isHardLike) return 7 * TIME_CONSTANTS.MINUTES_PER_DAY;
  return 14 * TIME_CONSTANTS.MINUTES_PER_DAY;
}

export function getQuestDurationLabel(quest) {
  const minutes = getQuestDurationMinutes({ rarity: quest?.rarity, difficultyTier: quest?.difficulty || 'Normal' });
  const days = Math.floor(minutes / TIME_CONSTANTS.MINUTES_PER_DAY);
  const hours = Math.floor((minutes % TIME_CONSTANTS.MINUTES_PER_DAY) / TIME_CONSTANTS.MINUTES_PER_HOUR);
  if (hours > 0) return `${days}d ${hours}h`;
  return `${days}d`;
}

export function getQuestExpiryMinutes(quest, currentTime) {
  if (Number.isFinite(quest?.expiresAtMinutes)) return quest.expiresAtMinutes;

  if (quest?.expiresAt) {
    const parsed = Date.parse(quest.expiresAt);
    if (Number.isFinite(parsed)) {
      const deltaMinutes = Math.max(0, Math.floor((parsed - Date.now()) / (1000 * 60)));
      return toTotalMinutes(normalizeGameTime(currentTime)) + deltaMinutes;
    }
  }

  const currentTotal = toTotalMinutes(normalizeGameTime(currentTime));
  const createdAtMinutes = Number.isFinite(quest?.createdAtMinutes) ? quest.createdAtMinutes : currentTotal;
  const durationMinutes = getQuestDurationMinutes({ rarity: quest?.rarity, difficultyTier: quest?.difficulty || 'Normal' });
  return createdAtMinutes + durationMinutes;
}

export function getTimeLeft(expiresAtMinutes, currentTime) {
  if (!Number.isFinite(expiresAtMinutes)) return 'No expiry';
  const currentTotal = toTotalMinutes(normalizeGameTime(currentTime));
  return getTimeLeftLabel(currentTotal, expiresAtMinutes);
}

export function getNextResetLabel(gameTime) {
  const normalized = normalizeGameTime(gameTime);
  const currentTotal = toTotalMinutes(normalized);
  const minuteOfDay = (normalized.currentHour * TIME_CONSTANTS.MINUTES_PER_HOUR) + normalized.currentMinute;
  const targetTotal = currentTotal + (TIME_CONSTANTS.MINUTES_PER_DAY - minuteOfDay);
  return getTimeLeftLabel(currentTotal, targetTotal).replace(' left', '');
}

export function normalizeQuestRequirements(quest) {
  const requirementsFromJson = (() => {
    if (!quest?.requirementsJson) return {};
    try {
      const parsed = JSON.parse(quest.requirementsJson);
      return parsed && typeof parsed === 'object' ? parsed : {};
    } catch {
      return {};
    }
  })();

  const normalizedQuest = {
    ...quest,
    requirements: {
      ...(requirementsFromJson || {}),
      ...(quest?.requirements || {})
    }
  };

  const projected = {
    ...normalizedQuest,
    nature: normalizedQuest.nature ?? normalizedQuest.requirements?.nature ?? null,
    level: normalizedQuest.level ?? normalizedQuest.requirements?.level ?? null,
    quantityRequired: normalizedQuest.quantityRequired ?? normalizedQuest.requiredCount ?? normalizedQuest.requirements?.quantityRequired ?? 1,
    ivConditions: normalizedQuest.ivConditions?.length
      ? normalizedQuest.ivConditions
      : (normalizedQuest.requirements?.ivConditions?.length
        ? normalizedQuest.requirements.ivConditions
        : (normalizedQuest.ivStat && normalizedQuest.ivThreshold != null
          ? [{ stat: normalizedQuest.ivStat, min: normalizedQuest.ivThreshold }]
          : [])),
    ivStat: normalizedQuest.ivStat ?? normalizedQuest.requirements?.ivStat ?? null,
    ivThreshold: normalizedQuest.ivThreshold ?? normalizedQuest.requirements?.ivThreshold ?? null,
    talentConditions: normalizedQuest.talentConditions?.length ? normalizedQuest.talentConditions : (normalizedQuest.requirements?.talentConditions || []),
    shinyRequired: Boolean(normalizedQuest.shinyRequired || normalizedQuest.requirements?.shinyRequired),
    alphaRequired: Boolean(normalizedQuest.alphaRequired || normalizedQuest.requirements?.alphaRequired),
    bondedRequired: Boolean(normalizedQuest.bondedRequired || normalizedQuest.requirements?.bondedRequired),
    hiddenAbilityRequired: Boolean(normalizedQuest.hiddenAbilityRequired || normalizedQuest.requirements?.hiddenAbilityRequired)
  };

  const hasRequirement = Boolean(
    projected?.nature
    || projected?.level
    || (projected?.quantityRequired || 1) > 1
    || (projected?.ivConditions?.length || 0) > 0
    || (projected?.ivStat && projected?.ivThreshold != null)
    || (projected?.talentConditions?.length || 0) > 0
    || projected?.shinyRequired
    || projected?.alphaRequired
    || projected?.bondedRequired
    || projected?.hiddenAbilityRequired
    || projected?.requirements?.nature
    || projected?.requirements?.level
    || (projected?.requirements?.quantityRequired || 1) > 1
    || (projected?.requirements?.ivConditions?.length || 0) > 0
    || (projected?.requirements?.talentConditions?.length || 0) > 0
    || projected?.requirements?.shinyRequired
    || projected?.requirements?.alphaRequired
    || projected?.requirements?.bondedRequired
    || projected?.requirements?.hiddenAbilityRequired
  );

  if (hasRequirement) return projected;

  const fallbackNature = pickRandom(NATURES);
  const nowMinutes = toTotalMinutes(normalizeGameTime(null));
  const createdAtMinutes = Number.isFinite(projected?.createdAtMinutes) ? projected.createdAtMinutes : nowMinutes;
  const durationMinutes = getQuestDurationMinutes({ rarity: projected?.rarity, difficultyTier: projected?.difficulty || 'Normal' });
  const expiresAtMinutes = Number.isFinite(projected?.expiresAtMinutes) ? projected.expiresAtMinutes : (createdAtMinutes + durationMinutes);

  return {
    ...projected,
    nature: fallbackNature,
    requirementType: projected.requirementType || 'nature',
    requirements: { ...(projected.requirements || {}), nature: fallbackNature },
    createdAtMinutes,
    expiresAtMinutes,
    questValue: projected.questValue || projected.difficultyScore || 1,
    questValueVersion: projected.questValueVersion || QUEST_VALUE_VERSION,
    difficultyScore: projected.difficultyScore || projected.questValue || 1
  };
}

export function buildProgressionContext(player, teamPokemon = []) {
  const storyChapter = player?.storyChapter ?? player?.storyProgress ?? 0;
  const mapleTrust = player?.trustLevels?.maple || 0;
  const avgPartyLevel = teamPokemon.length
    ? teamPokemon.reduce((sum, mon) => sum + (mon.level || 1), 0) / teamPokemon.length
    : 1;
  return { storyChapter, mapleTrust, avgPartyLevel };
}

export function generateQuest(player, gameTime, controllerContext = {}) {
  const speciesEntry = weightedRoll(getSpeciesPool(player));
  const species = speciesEntry.name;
  const rarity = speciesEntry.rarity;
  let nature = null;
  let level = null;
  let quantityRequired = 1;
  const ivConditions = [];
  const talentConditions = [];
  const specialFlags = { shinyRequired: false, alphaRequired: false, bondedRequired: false, hiddenAbilityRequired: false };

  const desiredConditionCount = weightedRoll([{ count: 1, weight: 3 }, { count: 2, weight: 4 }, { count: 3, weight: 3 }]).count;
  const hasTalentPool = getTalentPool(species).length > 0;
  const conditionPool = CONDITION_POOL.filter((entry) => entry.type !== 'talent' || hasTalentPool);

  const pickedConditions = new Set();
  while (pickedConditions.size < Math.min(desiredConditionCount, conditionPool.length)) {
    pickedConditions.add(weightedRoll(conditionPool).type);
  }

  if (pickedConditions.has('nature')) nature = pickRandom(NATURES);
  if (pickedConditions.has('level')) level = Math.floor(Math.random() * 21) + 10;

  if (Math.random() < 0.28) {
    quantityRequired = rarity === 'rare'
      ? 2
      : (Math.random() < 0.35 ? 3 : 2);
  }

  if (pickedConditions.has('iv')) {
    const ivConditionCount = Math.random() < 0.25 ? 2 : 1;
    const availableStats = [...IV_STATS];
    for (let i = 0; i < ivConditionCount; i++) {
      const stat = availableStats.splice(Math.floor(Math.random() * availableStats.length), 1)[0];
      const bucket = weightedRoll(IV_THRESHOLD_BUCKETS);
      const min = Math.floor(Math.random() * (bucket.max - bucket.min + 1)) + bucket.min;
      ivConditions.push({ stat, min });
    }
  }

  if (pickedConditions.has('talent')) {
    const talentPool = getTalentPool(species);
    if (talentPool.length) {
      const count = Math.random() < 0.5 ? 2 : 3;
      const grades = Array.from({ length: count }, () => weightedRoll(TALENT_GRADES).grade);
      const talentTags = talentPool.map((talentId) => TalentRegistry[talentId]?.tagsAffected || []).flat();
      const useTag = Math.random() < 0.2 && talentTags.length;
      talentConditions.push({ count, grades, requiredTags: useTag ? [pickRandom(talentTags)] : [] });
    }
  }

  if (pickedConditions.has('special')) {
    const specialKeys = Object.keys(specialFlags);
    specialFlags[pickRandom(specialKeys)] = true;
  }

  const hasNonNatureRequirement = () => Boolean(
    level
    || (quantityRequired || 1) > 1
    || ivConditions.length
    || talentConditions.length
    || Object.values(specialFlags).some(Boolean)
  );

  const hasRequirement = Boolean(nature || level || ivConditions.length || talentConditions.length || Object.values(specialFlags).some(Boolean));
  if (!hasRequirement) {
    const fallbackType = weightedRoll([{ type: 'iv', weight: 3 }, { type: 'level', weight: 2 }, { type: 'nature', weight: 2 }, { type: 'special', weight: 1 }]).type;
    if (fallbackType === 'iv') ivConditions.push({ stat: pickRandom(IV_STATS), min: 12 + Math.floor(Math.random() * 7) });
    else if (fallbackType === 'level') level = Math.floor(Math.random() * 21) + 10;
    else if (fallbackType === 'special') specialFlags[pickRandom(Object.keys(specialFlags))] = true;
    else nature = pickRandom(NATURES);
  }

  if (!hasNonNatureRequirement()) {
    ivConditions.push({ stat: pickRandom(IV_STATS), min: 12 + Math.floor(Math.random() * 7) });
  }

  const primaryIv = ivConditions[0] || null;

  const questValue = calculateQuestValue({
    nature,
    level,
    quantityRequired,
    ivConditions,
    talentConditions,
    specialFlags
  });
  const baselineTier = getDifficultyTier(questValue);
  const targetTierName = chooseTierByStrictController({ analytics: controllerContext.analytics, progression: controllerContext.progression });
  const difficultyTier = chooseFinalDifficultyTier({ baselineTier, controllerTierName: targetTierName });
  const requirementKinds = [
    nature ? 'nature' : null,
    level ? 'level' : null,
    ivConditions.length ? 'iv' : null,
    talentConditions.length ? 'talent' : null,
    Object.values(specialFlags).some(Boolean) ? 'special' : null,
    quantityRequired > 1 ? 'quantity' : null
  ].filter(Boolean);
  const requirementType = requirementKinds.length > 1
    ? 'mixed'
    : (requirementKinds[0] || 'mixed');


  const requirements = {
    ...(nature ? { nature } : {}),
    ...(level ? { level } : {}),
    ...(quantityRequired > 1 ? { quantityRequired } : {}),
    ...(ivConditions.length ? { ivConditions, ivStat: primaryIv?.stat, ivThreshold: primaryIv?.min } : {}),
    ...(talentConditions.length ? { talentConditions } : {}),
    ...Object.fromEntries(Object.entries(specialFlags).filter(([, enabled]) => enabled))
  };

  const progressionFactor = getProgressionFactor(controllerContext.progression || {});
  const reward = getRewardForQuest({
    avgTargetLevel: level || 10,
    difficultyTier,
    requirementType,
    requirementKinds,
    questValue,
    progressionFactor
  });

  const createdAtMinutes = toTotalMinutes(normalizeGameTime(gameTime));
  const expiresAtMinutes = createdAtMinutes + getQuestDurationMinutes({ rarity, difficultyTier });

  return {
    requirements,
    species,
    rarity,
    rewardBase: REWARD_BASE[rarity] || 100,
    requirementType,
    nature,
    level,
    quantityRequired,
    ivConditions,
    ivStat: primaryIv?.stat || null,
    ivThreshold: primaryIv?.min ?? null,
    talentConditions,
    ...specialFlags,
    questValue,
    questValueVersion: QUEST_VALUE_VERSION,
    difficultyScore: questValue,
    difficulty: difficultyTier.name,
    reward,
    createdAt: new Date().toISOString(),
    createdAtMinutes,
    expiresAtMinutes,
    active: true,
    status: 'generated',
    transitionLog: appendTransitionLog({}, 'generated', 'quest_generated', 'none'),
    isLegendary: difficultyTier.name === 'Legendary'
  };
}

export async function createGeneratedQuests({ base44, count, player, gameTime, analytics, progression }) {
  const questsToCreate = Array.from({ length: count }, (_, index) => ensureQuestHasPersistableVariety(generateQuest(player, gameTime, { analytics, progression }), index));
  await Promise.all(questsToCreate.map((quest) => createQuestWithPersistenceGuard(base44, quest, 'initial_generation')));

  if (questsToCreate.length) {
    const nextAnalytics = updateAnalyticsForGenerated(analytics, questsToCreate.map((q) => q.difficulty));
    void saveGlobalResearchAnalytics(base44, nextAnalytics);
  }

  return questsToCreate;
}

export async function rerollQuestAction({ base44, quest, gameTime, analytics, progression }) {
  const players = await base44.entities.Player.list();
  const latestPlayer = players[0] || null;
  if (!latestPlayer) return null;

  const isAccepted = (latestPlayer.activeQuests || []).some((entry) => (entry.questId || entry.id) === quest.id);
  if (isAccepted) throw new Error('Accepted quests cannot be rerolled.');

  const todayIndex = getAbsoluteDayIndex(gameTime);
  const shouldReset = (latestPlayer.researchQuestRerollResetDay ?? -1) !== todayIndex;
  const rerollCount = shouldReset ? 0 : (latestPlayer.researchQuestRerolls || 0);
  const isFree = rerollCount < QUEST_CONFIG.maxFreeRerolls;
  const cost = isFree ? 0 : QUEST_CONFIG.rerollCost;

  if ((latestPlayer.gold || 0) < cost) throw new Error('Not enough gold to reroll.');

  await base44.entities.Player.update(latestPlayer.id, {
    gold: (latestPlayer.gold || 0) - cost,
    researchQuestRerolls: rerollCount + 1,
    researchQuestRerollResetDay: todayIndex
  });

  await base44.entities.ResearchQuest.update(quest.id, {
    active: false,
    rerolledAt: new Date().toISOString(),
    status: 'rerolled',
    transitionLog: appendTransitionLog(quest, 'rerolled', 'quest_rerolled')
  });

  const replacement = ensureQuestHasPersistableVariety(generateQuest(latestPlayer, gameTime, { analytics, progression }), 0);
  await createQuestWithPersistenceGuard(base44, replacement, 'single_reroll');

  let nextAnalytics = updateAnalyticsForOutcome(analytics, quest.difficulty, 'rerolled');
  nextAnalytics = updateAnalyticsForGenerated(nextAnalytics, [replacement.difficulty]);
  void saveGlobalResearchAnalytics(base44, nextAnalytics);

  return { cost, replacementTier: replacement.difficulty };
}

export async function rerollAllQuestsAction({ base44, quests, gameTime, analytics, progression }) {
  const players = await base44.entities.Player.list();
  const latestPlayer = players[0] || null;
  if (!latestPlayer) return null;

  const acceptedIds = new Set((latestPlayer.activeQuests || []).map((entry) => entry.questId || entry.id));
  const rerollableQuests = quests.filter((quest) => !acceptedIds.has(quest.id));
  if (!rerollableQuests.length) throw new Error('No rerollable quests. Accepted quests cannot be rerolled.');

  const todayIndex = getAbsoluteDayIndex(gameTime);
  const shouldReset = (latestPlayer.researchQuestRerollResetDay ?? -1) !== todayIndex;
  const rerollCount = shouldReset ? 0 : (latestPlayer.researchQuestRerolls || 0);
  const isFree = rerollCount < QUEST_CONFIG.maxFreeRerolls;
  const cost = isFree ? 0 : QUEST_CONFIG.rerollCost;

  if ((latestPlayer.gold || 0) < cost) throw new Error('Not enough gold to reroll.');

  await base44.entities.Player.update(latestPlayer.id, {
    gold: (latestPlayer.gold || 0) - cost,
    researchQuestRerolls: rerollCount + 1,
    researchQuestRerollResetDay: todayIndex
  });

  await Promise.all(rerollableQuests.map((quest) => base44.entities.ResearchQuest.update(quest.id, {
    active: false,
    rerolledAt: new Date().toISOString(),
    status: 'rerolled',
    transitionLog: appendTransitionLog(quest, 'rerolled', 'quest_rerolled')
  })));

  const replacements = Array.from({ length: rerollableQuests.length }, (_, index) => ensureQuestHasPersistableVariety(generateQuest(latestPlayer, gameTime, { analytics, progression }), index));
  await Promise.all(replacements.map((quest) => createQuestWithPersistenceGuard(base44, quest, 'reroll_all')));

  let nextAnalytics = analytics;
  rerollableQuests.forEach((quest) => {
    nextAnalytics = updateAnalyticsForOutcome(nextAnalytics, quest.difficulty, 'rerolled');
  });
  nextAnalytics = updateAnalyticsForGenerated(nextAnalytics, replacements.map((q) => q.difficulty));
  void saveGlobalResearchAnalytics(base44, nextAnalytics);

  return { cost, replacedCount: rerollableQuests.length };
}

export async function acceptQuestAction({ base44, player, quest, gameTime, getSubmissionCount }) {
  if (!player) return { accepted: false };

  const updatedQuests = [...(player.activeQuests || [])];
  if (updatedQuests.length >= 10 && !updatedQuests.some((entry) => (entry.questId || entry.id) === quest.id)) {
    throw new Error('Quest log is full (10/10). Complete or remove quests before accepting more.');
  }

  if (updatedQuests.some((entry) => (entry.questId || entry.id) === quest.id)) {
    return { accepted: false };
  }

  const requiredCount = quest.quantityRequired || quest.requiredCount || 1;
  const rewardGold = quest.reward?.gold ?? quest.rewardBase ?? 0;
  const nowMinutes = toTotalMinutes(normalizeGameTime(gameTime));

  updatedQuests.push({
    id: quest.id,
    questId: quest.id,
    type: 'research',
    name: `Research: ${quest.species}`,
    description: `Submit ${requiredCount} ${quest.species} for research.`,
    progress: getSubmissionCount(quest.id),
    goal: requiredCount,
    reward: rewardGold ? `${rewardGold} gold` : 'Research rewards',
    species: quest.species,
    requirements: quest.requirements || {},
    nature: quest.nature,
    level: quest.level,
    ivConditions: quest.ivConditions || [],
    acceptedAtMinutes: nowMinutes,
    expiresAtMinutes: nowMinutes + getQuestDurationMinutes({ rarity: quest?.rarity, difficultyTier: quest?.difficulty || 'Normal' })
  });

  await base44.entities.Player.update(player.id, { activeQuests: updatedQuests });
  await base44.entities.ResearchQuest.update(quest.id, {
    status: 'accepted',
    acceptedAtMinutes: nowMinutes,
    transitionLog: appendTransitionLog(quest, 'accepted', 'quest_accepted')
  }).catch(() => {});
  return { accepted: true };
}

export async function completeQuestAction({ base44, player, selectedQuest, analytics }) {
  if (!player || !selectedQuest) return;

  const updatedQuests = (player.activeQuests || []).filter((quest) => (quest.questId || quest.id) !== selectedQuest.id);
  if (updatedQuests.length !== (player.activeQuests || []).length) {
    await base44.entities.Player.update(player.id, { activeQuests: updatedQuests });
  }

  await base44.entities.ResearchQuest.update(selectedQuest.id, {
    active: false,
    status: 'completed',
    completedAt: new Date().toISOString(),
    transitionLog: appendTransitionLog(selectedQuest, 'completed', 'quest_completed')
  }).catch(() => {});

  if (selectedQuest?.difficulty) {
    const nextAnalytics = updateAnalyticsForOutcome(analytics, selectedQuest.difficulty, 'completed');
    void saveGlobalResearchAnalytics(base44, nextAnalytics);
  }
}

export async function syncExpiredQuestsChunked({ base44, quests, player, gameTime, analytics, batchSize = QUEST_CONFIG.expiryBatchSize }) {
  const currentTotal = toTotalMinutes(normalizeGameTime(gameTime));
  const candidates = quests.filter((quest) => {
    const expiry = getQuestExpiryMinutes(quest, gameTime);
    return Number.isFinite(expiry) && expiry <= currentTotal;
  }).slice(0, batchSize);

  if (!candidates.length) return { expiredCount: 0 };

  const questIds = new Set(candidates.map((q) => q.id));

  for (const quest of candidates) {
    const latest = await base44.entities.ResearchQuest.get?.(quest.id).catch(() => null);
    // Completed wins over expired in conflict windows
    if (latest?.status === 'completed' || latest?.active === false && latest?.status === 'completed') {
      continue;
    }

    await base44.entities.ResearchQuest.update(quest.id, {
      active: false,
      expiredAt: new Date().toISOString(),
      status: 'expired',
      legendaryLog: quest.isLegendary || quest.difficulty === 'Legendary',
      transitionLog: appendTransitionLog(latest || quest, 'expired', 'quest_expired')
    });
  }

  if (player?.id && Array.isArray(player.activeQuests) && player.activeQuests.length) {
    const filtered = player.activeQuests.filter((entry) => !questIds.has(entry.questId || entry.id));
    if (filtered.length !== player.activeQuests.length) {
      await base44.entities.Player.update(player.id, { activeQuests: filtered });
    }
  }

  let nextAnalytics = analytics;
  candidates.forEach((quest) => {
    nextAnalytics = updateAnalyticsForOutcome(nextAnalytics, quest.difficulty, 'expired');
  });
  void saveGlobalResearchAnalytics(base44, nextAnalytics);

  return { expiredCount: candidates.length };
}

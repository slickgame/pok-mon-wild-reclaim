import React, { useState, useEffect, useMemo } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, CheckCircle, RefreshCcw } from 'lucide-react';
import { getPokemonData } from '@/components/data/PokemonRegistry';
import { TalentRegistry } from '@/components/data/TalentRegistry';
import ResearchQuestCard from './ResearchQuestCard';
import ResearchSubmitModal from './ResearchSubmitModal';
import { getSubmissionCount } from '@/systems/quests/questProgressTracker';
import { TIME_CONSTANTS, getAbsoluteDayIndex, getTimeLeftLabel, normalizeGameTime, toTotalMinutes } from '@/systems/time/gameTimeSystem';

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
  "Hardy", "Lonely", "Brave", "Adamant", "Naughty",
  "Bold", "Docile", "Relaxed", "Impish", "Lax",
  "Timid", "Hasty", "Serious", "Jolly", "Naive",
  "Modest", "Mild", "Quiet", "Bashful", "Rash",
  "Calm", "Gentle", "Sassy", "Careful", "Quirky"
];

const IV_STATS = ['HP', 'Atk', 'Def', 'SpAtk', 'SpDef', 'Speed'];

const QUEST_CONFIG = {
  maxFreeRerolls: 3,
  rerollCost: 150,
  cooldownReset: 'daily'
};

const REWARD_BASE = {
  common: 100,
  uncommon: 250,
  rare: 500
};

const DIFFICULTY_TIERS = [
  {
    name: 'Easy',
    min: 1,
    max: 2,
    expiryHours: 24,
    difficultyMod: 1.0,
    items: ['1–2 basic mats'],
    itemRewards: [{ id: 'featherSoft', quantity: 2 }],
    trustGain: 2,
    notesGain: 1
  },
  {
    name: 'Normal',
    min: 3,
    max: 4,
    expiryHours: 48,
    difficultyMod: 1.2,
    items: ['Chance for Pokéball or Potion (10–20%)'],
    itemRewards: [{ id: 'windDust', quantity: 2 }],
    trustGain: 4,
    notesGain: 1
  },
  {
    name: 'Hard',
    min: 5,
    max: 6,
    expiryHours: 72,
    difficultyMod: 1.5,
    items: ['Uncommon mats', 'Higher drop rates'],
    itemRewards: [{ id: 'powderSpore', quantity: 2 }],
    trustGain: 6,
    notesGain: 2
  },
  {
    name: 'Very Hard',
    min: 7,
    max: 8,
    expiryHours: 96,
    difficultyMod: 2.0,
    items: ['Rare mat', '2–4 quality items'],
    itemRewards: [{ id: 'ancientShard', quantity: 1 }],
    trustGain: 8,
    notesGain: 3
  },
  {
    name: 'Elite',
    min: 9,
    max: 10,
    expiryHours: 120,
    difficultyMod: 3.0,
    items: ['Evolution stones', 'Rare ingredients'],
    itemRewards: [{ id: 'trainingScroll', quantity: 1 }],
    trustGain: 10,
    notesGain: 4
  },
  {
    name: 'Legendary',
    min: 11,
    max: Infinity,
    expiryHours: 168,
    difficultyMod: 6.0,
    items: ['1-of-a-kind items', 'Exclusive crafting'],
    itemRewards: [{ id: 'leafStone', quantity: 1 }],
    trustGain: 14,
    notesGain: 6
  }
];

const GRADE_WEIGHTS = {
  Basic: 1,
  Rare: 2,
  Epic: 3,
  Diamond: 4
};

const CONDITION_POOL = [
  { type: 'nature', weight: 3 },
  { type: 'iv', weight: 3 },
  { type: 'talent', weight: 2 },
  { type: 'level', weight: 2 },
  { type: 'special', weight: 1 }
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

function getTalentPool(speciesName) {
  const speciesData = getPokemonData(speciesName);
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

function getRewardForQuest({ avgTargetLevel, difficultyTier }) {
  const baseMoney = 100;
  const levelFactor = (avgTargetLevel || 10) * 0.2;
  const totalReward = Math.floor(baseMoney * levelFactor * difficultyTier.difficultyMod);
  return {
    baseMoney,
    levelFactor,
    difficultyMod: difficultyTier.difficultyMod,
    gold: totalReward,
    items: difficultyTier.items,
    itemRewards: difficultyTier.itemRewards || [],
    trustGain: difficultyTier.trustGain || 0,
    notesGain: difficultyTier.notesGain || 0
  };
}


function getQuestDurationMinutes({ rarity, difficultyTier }) {
  const tierName = difficultyTier?.name || difficultyTier || 'Normal';
  const isEasyLike = rarity === 'common' || tierName === 'Easy' || tierName === 'Normal';
  const isHardLike = rarity === 'rare' || ['Hard', 'Very Hard', 'Elite', 'Legendary'].includes(tierName);

  if (isEasyLike) {
    return TIME_CONSTANTS.DAYS_PER_MONTH * TIME_CONSTANTS.MINUTES_PER_DAY; // 1 month
  }

  if (isHardLike) {
    return 7 * TIME_CONSTANTS.MINUTES_PER_DAY; // 1 week
  }

  return 14 * TIME_CONSTANTS.MINUTES_PER_DAY; // midpoint for uncommon/medium
}

function calculateDifficultyScore({ nature, level, ivConditions, talentConditions }) {
  let score = 1;
  if (nature) score += 1;
  if (level && level >= 20) score += 1;
  if (ivConditions?.length) {
    ivConditions.forEach((iv) => {
      score += iv.min > 20 ? 2 : 1;
    });
  }
  if (talentConditions?.length) {
    talentConditions.forEach((condition) => {
      const grades = condition.grades || [];
      grades.forEach((grade) => {
        score += GRADE_WEIGHTS[grade] || 1;
      });
      if (condition.count >= 2) {
        score += condition.count >= 4 ? 4 : condition.count >= 3 ? 3 : 2;
      }
    });
  }
  if (arguments[0]?.specialFlags) {
    const specialCount = Object.values(arguments[0].specialFlags).filter(Boolean).length;
    score += specialCount * 2;
  }
  return score;
}

function generateQuest(player, gameTime) {
  const speciesEntry = weightedRoll(getSpeciesPool(player));
  const species = speciesEntry.name;
  const rarity = speciesEntry.rarity;
  const requirements = [];
  let nature = null;
  let level = null;
  const ivConditions = [];
  const talentConditions = [];
  const specialFlags = {
    shinyRequired: false,
    alphaRequired: false,
    bondedRequired: false,
    hiddenAbilityRequired: false
  };

  const desiredConditionCount = weightedRoll([
    { count: 1, weight: 4 },
    { count: 2, weight: 3 },
    { count: 3, weight: 2 }
  ]).count;

  const pickedConditions = new Set();
  while (pickedConditions.size < desiredConditionCount) {
    const { type } = weightedRoll(CONDITION_POOL);
    pickedConditions.add(type);
  }

  if (pickedConditions.has('nature')) {
    nature = pickRandom(NATURES);
  }

  if (pickedConditions.has('level')) {
    level = Math.floor(Math.random() * 21) + 10;
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
      const talentTags = talentPool
        .map((talentId) => TalentRegistry[talentId]?.tagsAffected || [])
        .flat();
      const useTag = Math.random() < 0.2 && talentTags.length;
      talentConditions.push({
        count,
        grades,
        requiredTags: useTag ? [pickRandom(talentTags)] : []
      });
    }
  }

  if (pickedConditions.has('special')) {
    const specialKeys = Object.keys(specialFlags);
    const chosen = pickRandom(specialKeys);
    specialFlags[chosen] = true;
  }

  const hasRequirement = Boolean(
    nature
    || level
    || ivConditions.length
    || talentConditions.length
    || Object.values(specialFlags).some(Boolean)
  );

  if (!hasRequirement) {
    if (Math.random() < 0.5) {
      nature = pickRandom(NATURES);
    } else {
      const stat = pickRandom(IV_STATS);
      ivConditions.push({ stat, min: 12 + Math.floor(Math.random() * 7) });
    }
  }

  const difficultyScore = calculateDifficultyScore({
    nature,
    level,
    ivConditions,
    talentConditions,
    specialFlags
  });
  const difficultyTier = getDifficultyTier(difficultyScore);
  const avgTargetLevel = level || 10;
  const reward = getRewardForQuest({ avgTargetLevel, difficultyTier });
  const normalizedTime = normalizeGameTime(gameTime);
  const createdAtMinutes = toTotalMinutes(normalizedTime);
  const expiresAtMinutes = createdAtMinutes + getQuestDurationMinutes({ rarity, difficultyTier });

  if (ivConditions.length === 0 && !nature) {
    nature = pickRandom(NATURES);
  }
  const requirementType = ivConditions.length ? 'iv' : 'nature';
  const rewardBase = REWARD_BASE[rarity] || 100;

  return {
    requirements,
    species,
    rarity,
    rewardBase,
    requirementType,
    nature,
    level,
    ivConditions,
    talentConditions,
    ...specialFlags,
    difficultyScore,
    difficulty: difficultyTier.name,
    reward,
    createdAt: new Date().toISOString(),
    createdAtMinutes,
    expiresAtMinutes,
    active: true,
    isLegendary: difficultyTier.name === 'Legendary'
  };
}


function getQuestExpiryMinutes(quest, currentTime) {
  if (Number.isFinite(quest?.expiresAtMinutes)) {
    return quest.expiresAtMinutes;
  }

  if (quest?.expiresAt) {
    const parsed = Date.parse(quest.expiresAt);
    if (Number.isFinite(parsed)) {
      const deltaMinutes = Math.max(0, Math.floor((parsed - Date.now()) / (1000 * 60)));
      return toTotalMinutes(normalizeGameTime(currentTime)) + deltaMinutes;
    }
  }

  const currentTotal = toTotalMinutes(normalizeGameTime(currentTime));
  const createdAtMinutes = Number.isFinite(quest?.createdAtMinutes)
    ? quest.createdAtMinutes
    : currentTotal;
  const durationMinutes = getQuestDurationMinutes({
    rarity: quest?.rarity,
    difficultyTier: quest?.difficulty || 'Normal'
  });

  return createdAtMinutes + durationMinutes;
}

function getTimeLeft(expiresAtMinutes, currentTime) {
  if (!Number.isFinite(expiresAtMinutes)) return 'No expiry';
  const currentTotal = toTotalMinutes(normalizeGameTime(currentTime));
  return getTimeLeftLabel(currentTotal, expiresAtMinutes);
}

function getQuestDurationLabel(quest) {
  const durationMinutes = getQuestDurationMinutes({
    rarity: quest?.rarity,
    difficultyTier: quest?.difficulty || 'Normal'
  });
  
  const days = Math.floor(durationMinutes / TIME_CONSTANTS.MINUTES_PER_DAY);
  if (days >= TIME_CONSTANTS.DAYS_PER_MONTH) {
    return '1 month';
  } else if (days >= 7) {
    const weeks = Math.floor(days / 7);
    return `${weeks} week${weeks > 1 ? 's' : ''}`;
  } else if (days > 0) {
    return `${days} day${days > 1 ? 's' : ''}`;
  } else {
    const hours = Math.floor(durationMinutes / 60);
    return `${hours} hour${hours > 1 ? 's' : ''}`;
  }
}

function getNextResetLabel(gameTime) {
  const normalized = normalizeGameTime(gameTime);
  const currentTotal = toTotalMinutes(normalized);
  const minuteOfDay = (normalized.currentHour * TIME_CONSTANTS.MINUTES_PER_HOUR) + normalized.currentMinute;
  const minutesUntilReset = TIME_CONSTANTS.MINUTES_PER_DAY - minuteOfDay;
  const targetTotal = currentTotal + minutesUntilReset;
  return getTimeLeftLabel(currentTotal, targetTotal).replace(' left', '');
}

async function syncExpiredQuestsChunked({ base44, quests, player, gameTime, analytics }) {
  const currentTotal = toTotalMinutes(normalizeGameTime(gameTime));
  const expiredQuests = quests.filter((quest) => {
    const expiry = getQuestExpiryMinutes(quest, gameTime);
    return Number.isFinite(expiry) && expiry <= currentTotal && quest.active;
  });

  if (expiredQuests.length === 0) {
    return { expiredCount: 0 };
  }

  await Promise.all(
    expiredQuests.map((quest) =>
      base44.entities.ResearchQuest.update(quest.id, {
        active: false,
        status: 'expired',
        expiredAt: new Date().toISOString(),
        transitionLog: [
          ...(Array.isArray(quest.transitionLog) ? quest.transitionLog : []),
          {
            from: quest.status || 'generated',
            to: 'expired',
            at: new Date().toISOString(),
            reason: 'time_expired',
            source: 'syncExpiredQuestsChunked'
          }
        ]
      })
    )
  );

  if (player?.activeQuests?.length) {
    const expiredIds = new Set(expiredQuests.map((q) => q.id));
    const updatedActiveQuests = player.activeQuests.filter(
      (activeQuest) => !expiredIds.has(activeQuest.questId || activeQuest.id)
    );
    if (updatedActiveQuests.length !== player.activeQuests.length) {
      await base44.entities.Player.update(player.id, {
        activeQuests: updatedActiveQuests
      });
    }
  }

  return { expiredCount: expiredQuests.length };
}

async function createGeneratedQuests({ base44, count, player, gameTime, analytics, progression }) {
  const quests = Array.from({ length: count }, () => generateQuest(player, gameTime));
  return Promise.all(quests.map((quest) => base44.entities.ResearchQuest.create(quest)));
}

async function rerollQuestAction({ base44, quest, gameTime, analytics, progression }) {
  const players = await base44.entities.Player.list();
  const player = players[0];
  if (!player) throw new Error('Player not found');

  const todayIndex = getAbsoluteDayIndex(gameTime);
  const shouldReset = (player.researchQuestRerollResetDay ?? -1) !== todayIndex;
  const rerollCount = shouldReset ? 0 : (player.researchQuestRerolls || 0);
  const freeLeft = Math.max(QUEST_CONFIG.maxFreeRerolls - rerollCount, 0);
  const cost = freeLeft > 0 ? 0 : QUEST_CONFIG.rerollCost;

  if (cost > 0 && (player.gold || 0) < cost) {
    throw new Error(`Not enough gold! Need ${cost} gold to reroll.`);
  }

  const newQuest = generateQuest(player, gameTime);
  await base44.entities.ResearchQuest.update(quest.id, {
    active: false,
    status: 'rerolled',
    rerolledAt: new Date().toISOString()
  });
  await base44.entities.ResearchQuest.create(newQuest);

  await base44.entities.Player.update(player.id, {
    gold: (player.gold || 0) - cost,
    researchQuestRerolls: rerollCount + 1,
    researchQuestRerollResetDay: todayIndex
  });

  return { cost, replacementTier: newQuest.difficulty };
}

async function rerollAllQuestsAction({ base44, quests, gameTime, analytics, progression }) {
  const players = await base44.entities.Player.list();
  const player = players[0];
  if (!player) throw new Error('Player not found');

  const todayIndex = getAbsoluteDayIndex(gameTime);
  const shouldReset = (player.researchQuestRerollResetDay ?? -1) !== todayIndex;
  const rerollCount = shouldReset ? 0 : (player.researchQuestRerolls || 0);
  const freeLeft = Math.max(QUEST_CONFIG.maxFreeRerolls - rerollCount, 0);
  const costPerQuest = freeLeft > 0 ? 0 : QUEST_CONFIG.rerollCost;
  const totalCost = costPerQuest * quests.length;

  if (totalCost > 0 && (player.gold || 0) < totalCost) {
    throw new Error(`Not enough gold! Need ${totalCost} gold to reroll all quests.`);
  }

  const newQuests = quests.map(() => generateQuest(player, gameTime));
  
  await Promise.all(
    quests.map((quest) =>
      base44.entities.ResearchQuest.update(quest.id, {
        active: false,
        status: 'rerolled',
        rerolledAt: new Date().toISOString()
      })
    )
  );

  await Promise.all(newQuests.map((quest) => base44.entities.ResearchQuest.create(quest)));

  await base44.entities.Player.update(player.id, {
    gold: (player.gold || 0) - totalCost,
    researchQuestRerolls: rerollCount + quests.length,
    researchQuestRerollResetDay: todayIndex
  });

  return { cost: totalCost, replacedCount: quests.length };
}

async function acceptQuestAction({ base44, player, quest, gameTime, getSubmissionCount }) {
  const activeQuests = player?.activeQuests || [];
  
  if (activeQuests.some((aq) => (aq.questId || aq.id) === quest.id)) {
    throw new Error('Quest already accepted');
  }

  const normalizedTime = normalizeGameTime(gameTime);
  const acceptedAtMinutes = toTotalMinutes(normalizedTime);
  const durationMinutes = getQuestDurationMinutes({ rarity: quest.rarity, difficultyTier: quest.difficulty });
  const expiresAtMinutes = acceptedAtMinutes + durationMinutes;

  const activeQuest = {
    questId: quest.id,
    acceptedAt: new Date().toISOString(),
    acceptedAtMinutes,
    expiresAtMinutes,
    submissionCount: 0
  };

  await base44.entities.Player.update(player.id, {
    activeQuests: [...activeQuests, activeQuest]
  });
}

async function completeQuestAction({ base44, player, selectedQuest, analytics }) {
  if (!player?.activeQuests?.length) return;

  const updatedActiveQuests = player.activeQuests.filter(
    (aq) => (aq.questId || aq.id) !== selectedQuest.id
  );

  await base44.entities.Player.update(player.id, {
    activeQuests: updatedActiveQuests
  });

  await base44.entities.ResearchQuest.update(selectedQuest.id, {
    active: false,
    status: 'completed',
    completedAt: new Date().toISOString()
  });
}

async function getGlobalResearchAnalytics(base44) {
  return { totalCompleted: 0, totalExpired: 0, averageDifficulty: 5 };
}

const normalizeQuestRequirements = (quest) => {
  const hasRequirement = Boolean(
    quest?.nature
    || quest?.level
    || (quest?.ivConditions?.length || 0) > 0
    || (quest?.talentConditions?.length || 0) > 0
    || quest?.shinyRequired
    || quest?.alphaRequired
    || quest?.bondedRequired
    || quest?.hiddenAbilityRequired
    || quest?.requirements?.nature
    || quest?.requirements?.level
    || (quest?.requirements?.ivConditions?.length || 0) > 0
    || (quest?.requirements?.talentConditions?.length || 0) > 0
  );

  if (hasRequirement) {
    return quest;
  }

  const fallbackNature = pickRandom(NATURES);
  const normalizedNow = normalizeGameTime(null);
  const nowMinutes = toTotalMinutes(normalizedNow);
  const createdAtMinutes = Number.isFinite(quest?.createdAtMinutes) ? quest.createdAtMinutes : nowMinutes;
  const inferredTier = quest?.difficulty || 'Normal';
  const durationMinutes = getQuestDurationMinutes({ rarity: quest?.rarity, difficultyTier: inferredTier });
  const expiresAtMinutes = Number.isFinite(quest?.expiresAtMinutes) ? quest.expiresAtMinutes : (createdAtMinutes + durationMinutes);

  return {
    ...quest,
    nature: fallbackNature,
    requirements: {
      ...(quest.requirements || {}),
      nature: fallbackNature,
    },
    createdAtMinutes,
    expiresAtMinutes,
    difficultyScore: quest.difficultyScore || 1,
  };
};

export default function ResearchQuestManager() {
  const [selectedQuest, setSelectedQuest] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);
  const [rerollMessage, setRerollMessage] = useState(null);
  const [acceptingQuestId, setAcceptingQuestId] = useState(null);
  const [statusFilter, setStatusFilter] = useState('all');
  const [difficultyFilter, setDifficultyFilter] = useState('all');
  const [speciesFilter, setSpeciesFilter] = useState('all');
  const [sortBy, setSortBy] = useState('created');
  const [sortOrder, setSortOrder] = useState('desc');
  const queryClient = useQueryClient();

  const { data: activeQuests = [], isLoading } = useQuery({
    queryKey: ['researchQuests'],
    queryFn: async () => {
      const list = await base44.entities.ResearchQuest.filter({ active: true });
      return list.map(normalizeQuestRequirements);
    }
  });

  const { data: questHistory = [] } = useQuery({
    queryKey: ['researchQuestHistory'],
    queryFn: () => base44.entities.ResearchQuest.filter({ active: false })
  });

  const allQuests = useMemo(() => [...activeQuests, ...questHistory], [activeQuests, questHistory]);

  const { data: player } = useQuery({
    queryKey: ['player'],
    queryFn: async () => {
      const players = await base44.entities.Player.list();
      return players[0] || null;
    }
  });

  const { data: gameTime } = useQuery({
    queryKey: ['gameTime'],
    queryFn: async () => {
      const times = await base44.entities.GameTime.list();
      return times[0] || null;
    }
  });

  const { data: teamPokemon = [] } = useQuery({
    queryKey: ['playerPokemonTeamForResearch'],
    queryFn: async () => base44.entities.Pokemon.filter({ isInTeam: true })
  });

  const { data: researchAnalytics } = useQuery({
    queryKey: ['researchQuestAnalyticsGlobal'],
    queryFn: async () => getGlobalResearchAnalytics(base44)
  });

  const progressionContext = useMemo(() => {
    const storyChapter = player?.storyChapter ?? player?.storyProgress ?? 0;
    const mapleTrust = player?.trustLevels?.maple || 0;
    const avgPartyLevel = teamPokemon.length
      ? teamPokemon.reduce((sum, mon) => sum + (mon.level || 1), 0) / teamPokemon.length
      : 1;
    return { storyChapter, mapleTrust, avgPartyLevel };
  }, [player, teamPokemon]);

  const availableSpecies = useMemo(() => {
    const species = new Set(allQuests.map(q => q.species).filter(Boolean));
    return Array.from(species).sort();
  }, [allQuests]);

  const availableDifficulties = useMemo(() => {
    const difficulties = new Set(allQuests.map(q => q.difficulty).filter(Boolean));
    return Array.from(difficulties).sort();
  }, [allQuests]);

  const filteredAndSortedQuests = useMemo(() => {
    let filtered = [...allQuests];

    // Status filter
    if (statusFilter === 'active') {
      filtered = filtered.filter(q => q.active);
    } else if (statusFilter === 'completed') {
      filtered = filtered.filter(q => q.status === 'completed');
    } else if (statusFilter === 'expired') {
      filtered = filtered.filter(q => q.status === 'expired');
    }

    // Difficulty filter
    if (difficultyFilter !== 'all') {
      filtered = filtered.filter(q => q.difficulty === difficultyFilter);
    }

    // Species filter
    if (speciesFilter !== 'all') {
      filtered = filtered.filter(q => q.species === speciesFilter);
    }

    // Sorting
    filtered.sort((a, b) => {
      let compareValue = 0;
      
      if (sortBy === 'created') {
        const aTime = a.createdAtMinutes || 0;
        const bTime = b.createdAtMinutes || 0;
        compareValue = aTime - bTime;
      } else if (sortBy === 'expiry') {
        const aExpiry = getQuestExpiryMinutes(a, gameTime);
        const bExpiry = getQuestExpiryMinutes(b, gameTime);
        compareValue = (aExpiry || 0) - (bExpiry || 0);
      } else if (sortBy === 'difficulty') {
        const aScore = a.difficultyScore || 0;
        const bScore = b.difficultyScore || 0;
        compareValue = aScore - bScore;
      }

      return sortOrder === 'asc' ? compareValue : -compareValue;
    });

    return filtered;
  }, [allQuests, statusFilter, difficultyFilter, speciesFilter, sortBy, sortOrder, gameTime]);

  const generateQuestsMutation = useMutation({
    mutationFn: async (count) => createGeneratedQuests({
      base44,
      count,
      player,
      gameTime,
      analytics: researchAnalytics,
      progression: progressionContext
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['researchQuests'] });
    }
  });

  const rerollQuestMutation = useMutation({
    mutationFn: async (quest) => rerollQuestAction({
      base44,
      quest,
      gameTime,
      analytics: researchAnalytics,
      progression: progressionContext
    }),
    onSuccess: (result) => {
      if (!result) return;
      queryClient.invalidateQueries({ queryKey: ['researchQuests'] });
      queryClient.invalidateQueries({ queryKey: ['player'] });
      setRerollMessage(
        `Quest rerolled${result.cost ? ` for ${result.cost} gold` : ''}. New request: ${result.replacementTier} tier.`
      );
      setTimeout(() => setRerollMessage(null), 3000);
    },
    onError: (error) => {
      setRerollMessage(error.message || 'Unable to reroll quest.');
      setTimeout(() => setRerollMessage(null), 3000);
    }
  });

  const rerollAllMutation = useMutation({
    mutationFn: async () => rerollAllQuestsAction({
      base44,
      quests: currentActiveQuests,
      gameTime,
      analytics: researchAnalytics,
      progression: progressionContext
    }),
    onSuccess: (result) => {
      if (!result) return;
      queryClient.invalidateQueries({ queryKey: ['researchQuests'] });
      queryClient.invalidateQueries({ queryKey: ['player'] });
      setRerollMessage(
        `${result.replacedCount} quest${result.replacedCount === 1 ? '' : 's'} rerolled${result.cost ? ` for ${result.cost} gold` : ''}.`
      );
      setTimeout(() => setRerollMessage(null), 3000);
    },
    onError: (error) => {
      setRerollMessage(error.message || 'Unable to reroll quests.');
      setTimeout(() => setRerollMessage(null), 3000);
    }
  });

  // Initialize quests if none exist
  useEffect(() => {
    if (!isLoading && activeQuests.length < 3) {
      const neededQuests = 3 - activeQuests.length;
      generateQuestsMutation.mutate(neededQuests);
    }
  }, [activeQuests.length, isLoading]);

  useEffect(() => {
    if (isLoading || activeQuests.length === 0) return;
    const missing = activeQuests.filter((quest) => !(
      quest?.nature
      || quest?.level
      || (quest?.quantityRequired || quest?.requiredCount || 1) > 1
      || (quest?.ivConditions?.length || 0) > 0
      || (quest?.talentConditions?.length || 0) > 0
      || quest?.shinyRequired
      || quest?.alphaRequired
      || quest?.bondedRequired
      || quest?.hiddenAbilityRequired
      || quest?.requirements?.nature
      || quest?.requirements?.level
      || (quest?.requirements?.quantityRequired || 1) > 1
      || (quest?.requirements?.ivConditions?.length || 0) > 0
      || (quest?.requirements?.talentConditions?.length || 0) > 0
      || quest?.requirements?.shinyRequired
      || quest?.requirements?.alphaRequired
      || quest?.requirements?.bondedRequired
      || quest?.requirements?.hiddenAbilityRequired
    ));
    if (!missing.length) return;

    Promise.all(missing.map((quest) => {
      const fixed = normalizeQuestRequirements(quest);
      return base44.entities.ResearchQuest.update(quest.id, {
        nature: fixed.nature,
        quantityRequired: fixed.quantityRequired || quest.quantityRequired || quest.requiredCount || 1,
        requirementType: fixed.requirementType || quest.requirementType || 'nature',
        requirements: fixed.requirements,
        createdAtMinutes: fixed.createdAtMinutes,
        expiresAtMinutes: fixed.expiresAtMinutes,
        questValue: fixed.questValue || fixed.difficultyScore || quest.questValue || quest.difficultyScore || 1,
        questValueVersion: fixed.questValueVersion || quest.questValueVersion || 1,
        difficultyScore: fixed.difficultyScore || fixed.questValue || quest.difficultyScore || quest.questValue || 1
      });
    })).then(() => {
      queryClient.invalidateQueries({ queryKey: ['researchQuests'] });
    });
  }, [activeQuests, isLoading, queryClient]);


  useEffect(() => {
    if (isLoading || !player?.id || activeQuests.length === 0) return;

    const migrationKey = 'researchQuestLegacyResetV1';
    if (localStorage.getItem(migrationKey) === 'done') return;

    const looksLegacyOnly = activeQuests.every((quest) => {
      const hasComplex = Boolean(
        quest?.level
        || (quest?.quantityRequired || quest?.requiredCount || 1) > 1
        || (quest?.ivConditions?.length || 0) > 0
        || (quest?.talentConditions?.length || 0) > 0
        || quest?.shinyRequired
        || quest?.alphaRequired
        || quest?.bondedRequired
        || quest?.hiddenAbilityRequired
        || quest?.requirements?.level
        || (quest?.requirements?.quantityRequired || 1) > 1
        || (quest?.requirements?.ivConditions?.length || 0) > 0
        || (quest?.requirements?.talentConditions?.length || 0) > 0
        || quest?.requirements?.shinyRequired
        || quest?.requirements?.alphaRequired
        || quest?.requirements?.bondedRequired
        || quest?.requirements?.hiddenAbilityRequired
      );
      return !hasComplex;
    });

    if (!looksLegacyOnly) {
      localStorage.setItem(migrationKey, 'done');
      return;
    }

    localStorage.setItem(migrationKey, 'running');

    Promise.all(activeQuests.map((quest) => base44.entities.ResearchQuest.update(quest.id, {
      active: false,
      status: 'expired',
      expiredAt: new Date().toISOString(),
      transitionLog: Array.isArray(quest.transitionLog)
        ? [...quest.transitionLog, {
          from: quest.status || 'generated',
          to: 'expired',
          at: new Date().toISOString(),
          reason: 'legacy_reset',
          source: 'ResearchQuestManager'
        }]
        : [{
          from: quest.status || 'generated',
          to: 'expired',
          at: new Date().toISOString(),
          reason: 'legacy_reset',
          source: 'ResearchQuestManager'
        }]
    }))).then(async () => {
      await base44.entities.Player.update(player.id, { activeQuests: [] }).catch(() => {});
      localStorage.setItem(migrationKey, 'done');
      await createGeneratedQuests({
        base44,
        count: 3,
        player,
        gameTime,
        analytics: researchAnalytics,
        progression: progressionContext
      });
      queryClient.invalidateQueries({ queryKey: ['researchQuests'] });
      queryClient.invalidateQueries({ queryKey: ['player'] });
      setRerollMessage('Legacy research quests were refreshed to enable full requirement variety.');
      setTimeout(() => setRerollMessage(null), 4000);
    }).catch(() => {
      localStorage.removeItem(migrationKey);
    });
  }, [isLoading, activeQuests, player, gameTime, researchAnalytics, progressionContext, queryClient]);

  useEffect(() => {
    if (isLoading || activeQuests.length === 0) return;
    syncExpiredQuestsChunked({
      base44,
      quests: activeQuests,
      player,
      gameTime,
      analytics: researchAnalytics
    }).then(({ expiredCount }) => {
      if (expiredCount > 0) {
        queryClient.invalidateQueries({ queryKey: ['researchQuests'] });
        queryClient.invalidateQueries({ queryKey: ['player'] });
      }
    });
  }, [activeQuests, isLoading, queryClient, gameTime, player, researchAnalytics]);

  const handleSuccess = (reward) => {
    setSelectedQuest(null);
    if (player?.activeQuests?.length && selectedQuest) {
      completeQuestAction({ base44, player, selectedQuest, analytics: researchAnalytics })
        .then(() => queryClient.invalidateQueries({ queryKey: ['player'] }));
    }
    if (typeof reward === 'object') {
      const itemText = reward.items?.length ? ` Items: ${reward.items.join(', ')}.` : '';
      const trustText = reward.trustGain ? ` Trust +${reward.trustGain}.` : '';
      const notesText = reward.notesGain ? ` Notes +${reward.notesGain}.` : '';
      const bonusText = reward.bonusGold ? ` Bonus +${reward.bonusGold} gold.` : '';
      setSuccessMessage(`Thank you! You received ${reward.gold} gold.${bonusText}${trustText}${notesText}${itemText}`);
    } else {
      setSuccessMessage(`Thank you! Your Pokémon has greatly advanced our research. You received ${reward} gold!`);
    }
    
    setTimeout(() => {
      setSuccessMessage(null);
      // Generate replacement quest
      generateQuestsMutation.mutate(1);
    }, 3000);
  };

  const rerollState = useMemo(() => {
    if (!player) return null;
    const todayIndex = getAbsoluteDayIndex(gameTime);
    const shouldReset = (player.researchQuestRerollResetDay ?? -1) !== todayIndex;
    const rerollCount = shouldReset ? 0 : (player.researchQuestRerolls || 0);
    const freeLeft = Math.max(QUEST_CONFIG.maxFreeRerolls - rerollCount, 0);
    return { rerollCount, freeLeft, resetsIn: getNextResetLabel(gameTime) };
  }, [player, gameTime]);

  const currentActiveQuests = useMemo(
    () => {
      const currentTotal = toTotalMinutes(normalizeGameTime(gameTime));
      return activeQuests.filter((quest) => {
        const expiry = getQuestExpiryMinutes(quest, gameTime);
        return !Number.isFinite(expiry) || expiry > currentTotal;
      });
    },
    [activeQuests, gameTime]
  );

  const acceptedQuestIds = useMemo(() => {
    const active = player?.activeQuests || [];
    return new Set(active.map((quest) => quest.questId || quest.id));
  }, [player]);

  const acceptedQuestMap = useMemo(() => {
    const active = player?.activeQuests || [];
    return new Map(active.map((quest) => [quest.questId || quest.id, quest]));
  }, [player]);

  const handleAcceptQuest = async (quest) => {
    if (!player || acceptingQuestId) return;
    setAcceptingQuestId(quest.id);
    try {
      await acceptQuestAction({ base44, player, quest, gameTime, getSubmissionCount });
      queryClient.invalidateQueries({ queryKey: ['player'] });
    } catch (error) {
      setRerollMessage(error.message || 'Unable to accept quest.');
      setTimeout(() => setRerollMessage(null), 3000);
    } finally {
      setAcceptingQuestId(null);
    }
  };

  const recentHistory = useMemo(
    () => questHistory
      .filter((quest) => quest.status === 'completed' || quest.legendaryLog)
      .sort((a, b) => new Date(b.completedAt || b.expiredAt || b.rerolledAt || 0) - new Date(a.completedAt || a.expiredAt || a.rerolledAt || 0))
      .slice(0, 5),
    [questHistory]
  );

  if (isLoading) {
    return (
      <div className="text-center py-12">
        <Sparkles className="w-12 h-12 mx-auto mb-4 text-indigo-400 animate-pulse" />
        <p className="text-slate-400">Loading research quests...</p>
      </div>
    );
  }

  return (
    <div>
      {successMessage && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          className="mb-6 bg-green-500/20 border border-green-500/50 rounded-lg p-4"
        >
          <div className="flex items-center gap-3">
            <CheckCircle className="w-6 h-6 text-green-400" />
            <p className="text-green-300 font-semibold">{successMessage}</p>
          </div>
        </motion.div>
      )}

      {rerollMessage && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          className="mb-6 bg-indigo-500/20 border border-indigo-500/50 rounded-lg p-4"
        >
          <div className="flex items-center gap-3">
            <RefreshCcw className="w-5 h-5 text-indigo-300" />
            <p className="text-indigo-200 font-semibold">{rerollMessage}</p>
          </div>
        </motion.div>
      )}

      <div className="mb-6">
        <h3 className="text-lg font-semibold text-white mb-2">Active Research Requests</h3>
        <p className="text-sm text-slate-400">
          Submit Pokémon matching the listed species, nature, IVs, levels, and talents to advance Professor Maple's research. 
          Submitted Pokémon are released and cannot be recovered.
        </p>
        {rerollState && (
          <div className="mt-3 text-xs text-slate-400">
            <span className="font-semibold text-slate-200">Rerolls:</span> {rerollState.freeLeft} free today, then {QUEST_CONFIG.rerollCost} gold each.
            <span className="ml-2 text-slate-500">Resets in {rerollState.resetsIn}.</span>
          </div>
        )}
        <div className="mt-4">
          <button
            type="button"
            onClick={() => {
              if (!window.confirm('Reroll all active research quests? This will replace every quest.')) return;
              rerollAllMutation.mutate();
            }}
            className="text-xs font-semibold text-indigo-200 hover:text-indigo-100"
            disabled={rerollAllMutation.isPending || !currentActiveQuests.length || currentActiveQuests.every((quest) => acceptedQuestIds.has(quest.id))}
          >
            Reroll All Research Quests
          </button>
        </div>
      </div>

      <div className="mb-6 p-4 bg-slate-800/40 rounded-lg border border-slate-700/50">
        <h3 className="text-sm font-semibold text-white mb-4">Filter & Sort</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-3">
          <div>
            <label className="block text-xs text-slate-400 mb-1">Status</label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full px-3 py-2 bg-slate-900/50 border border-slate-700 rounded-lg text-sm text-white focus:outline-none focus:border-indigo-500"
            >
              <option value="all">All</option>
              <option value="active">Active</option>
              <option value="completed">Completed</option>
              <option value="expired">Expired</option>
            </select>
          </div>

          <div>
            <label className="block text-xs text-slate-400 mb-1">Difficulty</label>
            <select
              value={difficultyFilter}
              onChange={(e) => setDifficultyFilter(e.target.value)}
              className="w-full px-3 py-2 bg-slate-900/50 border border-slate-700 rounded-lg text-sm text-white focus:outline-none focus:border-indigo-500"
            >
              <option value="all">All</option>
              {availableDifficulties.map(diff => (
                <option key={diff} value={diff}>{diff}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs text-slate-400 mb-1">Species</label>
            <select
              value={speciesFilter}
              onChange={(e) => setSpeciesFilter(e.target.value)}
              className="w-full px-3 py-2 bg-slate-900/50 border border-slate-700 rounded-lg text-sm text-white focus:outline-none focus:border-indigo-500"
            >
              <option value="all">All</option>
              {availableSpecies.map(species => (
                <option key={species} value={species}>{species}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs text-slate-400 mb-1">Sort By</label>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="w-full px-3 py-2 bg-slate-900/50 border border-slate-700 rounded-lg text-sm text-white focus:outline-none focus:border-indigo-500"
            >
              <option value="created">Created Date</option>
              <option value="expiry">Expiry Date</option>
              <option value="difficulty">Difficulty</option>
            </select>
          </div>

          <div>
            <label className="block text-xs text-slate-400 mb-1">Order</label>
            <select
              value={sortOrder}
              onChange={(e) => setSortOrder(e.target.value)}
              className="w-full px-3 py-2 bg-slate-900/50 border border-slate-700 rounded-lg text-sm text-white focus:outline-none focus:border-indigo-500"
            >
              <option value="desc">Newest First</option>
              <option value="asc">Oldest First</option>
            </select>
          </div>
        </div>
        <div className="mt-3 text-xs text-slate-400">
          Showing {filteredAndSortedQuests.length} quest{filteredAndSortedQuests.length !== 1 ? 's' : ''}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredAndSortedQuests.filter(q => q.active).map(quest => (
          <ResearchQuestCard
            key={quest.id}
            quest={quest}
            onSubmit={setSelectedQuest}
            onAccept={handleAcceptQuest}
            isAccepted={acceptedQuestIds.has(quest.id)}
            isAccepting={acceptingQuestId === quest.id}
            onReroll={() => rerollQuestMutation.mutate(quest)}
            timeLeft={acceptedQuestIds.has(quest.id)
              ? getTimeLeft(getQuestExpiryMinutes(acceptedQuestMap.get(quest.id) || quest, gameTime), gameTime)
              : `${getQuestDurationLabel(quest)} once accepted`}
            rerollState={rerollState}
            rerollCost={QUEST_CONFIG.rerollCost}
            isRerolling={rerollQuestMutation.isPending}
            canAffordReroll={(player?.gold || 0) >= QUEST_CONFIG.rerollCost}
            isRerollDisabled={acceptedQuestIds.has(quest.id)}
          />
        ))}

        {filteredAndSortedQuests.filter(q => !q.active).map(quest => (
          <div key={quest.id} className="p-4 rounded-lg bg-slate-800/30 border border-slate-700/50">
            <div className="flex items-start justify-between mb-3">
              <div>
                <h4 className="text-lg font-semibold text-slate-200">{quest.species}</h4>
                <p className="text-xs text-slate-500 uppercase tracking-wide">{quest.difficulty} Tier</p>
              </div>
              <span className={`px-2 py-1 text-xs font-semibold rounded ${
                quest.status === 'completed' ? 'bg-green-500/20 text-green-300' : 'bg-slate-500/20 text-slate-400'
              }`}>
                {quest.status || 'Archived'}
              </span>
            </div>
            {quest.completedAt && (
              <p className="text-xs text-slate-500">
                Completed: {new Date(quest.completedAt).toLocaleDateString()}
              </p>
            )}
          </div>
        ))}
      </div>

      {recentHistory.length > 0 && statusFilter === 'all' && (
        <div className="mt-8">
          <h4 className="text-sm font-semibold text-slate-200 mb-2">Legendary Log & Recent Completions</h4>
          <div className="space-y-2">
            {recentHistory.map((quest) => (
              <div key={quest.id} className="flex items-center justify-between rounded-md bg-slate-800/40 px-3 py-2 text-xs text-slate-300">
                <div>
                  <span className="font-semibold text-slate-100">{quest.species}</span> — {quest.difficulty} tier
                </div>
                <span className="text-slate-500">{quest.status || 'logged'}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      <AnimatePresence>
        {selectedQuest && (
          <ResearchSubmitModal
            quest={selectedQuest}
            onClose={() => setSelectedQuest(null)}
            onSuccess={handleSuccess}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
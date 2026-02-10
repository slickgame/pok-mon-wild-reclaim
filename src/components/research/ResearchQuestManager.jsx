import React, { useState, useEffect, useMemo } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, CheckCircle, RefreshCcw } from 'lucide-react';
import { PokemonRegistry } from '@/components/data/PokemonRegistry';
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
  const expiresAtMinutes = createdAtMinutes + (difficultyTier.expiryHours * TIME_CONSTANTS.MINUTES_PER_HOUR);

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
  if (Number.isFinite(quest?.expiresAtMinutes)) return quest.expiresAtMinutes;
  if (quest?.expiresAt) {
    const parsed = Date.parse(quest.expiresAt);
    if (Number.isFinite(parsed)) {
      const deltaMinutes = Math.max(0, Math.floor((parsed - Date.now()) / (1000 * 60)));
      return toTotalMinutes(normalizeGameTime(currentTime)) + deltaMinutes;
    }
  }
  return null;
}

function getTimeLeft(expiresAtMinutes, currentTime) {
  if (!Number.isFinite(expiresAtMinutes)) return 'No expiry';
  const currentTotal = toTotalMinutes(normalizeGameTime(currentTime));
  return getTimeLeftLabel(currentTotal, expiresAtMinutes);
}

function getNextResetLabel(gameTime) {
  const normalized = normalizeGameTime(gameTime);
  const currentTotal = toTotalMinutes(normalized);
  const minuteOfDay = (normalized.currentHour * TIME_CONSTANTS.MINUTES_PER_HOUR) + normalized.currentMinute;
  const minutesUntilReset = TIME_CONSTANTS.MINUTES_PER_DAY - minuteOfDay;
  const targetTotal = currentTotal + minutesUntilReset;
  return getTimeLeftLabel(currentTotal, targetTotal).replace(' left', '');
}


function normalizeQuestRequirements(quest) {
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
  return {
    ...quest,
    nature: fallbackNature,
    requirements: {
      ...(quest.requirements || {}),
      nature: fallbackNature
    },
    difficultyScore: quest.difficultyScore || 1
  };
}

export default function ResearchQuestManager() {
  const [selectedQuest, setSelectedQuest] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);
  const [rerollMessage, setRerollMessage] = useState(null);
  const [acceptingQuestId, setAcceptingQuestId] = useState(null);
  const queryClient = useQueryClient();

  const { data: quests = [], isLoading } = useQuery({
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

  const generateQuestsMutation = useMutation({
    mutationFn: async (count) => {
      const questsToCreate = [];
      for (let i = 0; i < count; i++) {
        questsToCreate.push(generateQuest(player, gameTime));
      }
      await Promise.all(questsToCreate.map(q => base44.entities.ResearchQuest.create(q)));
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['researchQuests'] });
    }
  });

  const rerollQuestMutation = useMutation({
    mutationFn: async (quest) => {
      if (!player) return null;
      const todayIndex = getAbsoluteDayIndex(gameTime);
      const shouldReset = (player.researchQuestRerollResetDay ?? -1) !== todayIndex;
      const rerollCount = shouldReset ? 0 : (player.researchQuestRerolls || 0);
      const isFree = rerollCount < QUEST_CONFIG.maxFreeRerolls;
      const cost = isFree ? 0 : QUEST_CONFIG.rerollCost;

      if ((player.gold || 0) < cost) {
        throw new Error('Not enough gold to reroll.');
      }

      await base44.entities.Player.update(player.id, {
        gold: (player.gold || 0) - cost,
        researchQuestRerolls: rerollCount + 1,
        researchQuestRerollResetDay: todayIndex
      });

      const rerolledAt = new Date().toISOString();
      await base44.entities.ResearchQuest.update(quest.id, {
        active: false,
        rerolledAt,
        status: 'rerolled'
      });

      const replacement = generateQuest(player, gameTime);
      await base44.entities.ResearchQuest.create(replacement);
      return { cost, replacementTier: replacement.difficulty };
    },
    onSuccess: (data) => {
      if (!data) return;
      queryClient.invalidateQueries({ queryKey: ['researchQuests'] });
      queryClient.invalidateQueries({ queryKey: ['player'] });
      setRerollMessage(
        `Quest rerolled${data.cost ? ` for ${data.cost} gold` : ''}. New request: ${data.replacementTier} tier.`
      );
      setTimeout(() => setRerollMessage(null), 3000);
    },
    onError: (error) => {
      setRerollMessage(error.message || 'Unable to reroll quest.');
      setTimeout(() => setRerollMessage(null), 3000);
    }
  });

  const rerollAllMutation = useMutation({
    mutationFn: async () => {
      if (!player) return null;
      const todayIndex = getAbsoluteDayIndex(gameTime);
      const shouldReset = (player.researchQuestRerollResetDay ?? -1) !== todayIndex;
      const rerollCount = shouldReset ? 0 : (player.researchQuestRerolls || 0);
      const isFree = rerollCount < QUEST_CONFIG.maxFreeRerolls;
      const cost = isFree ? 0 : QUEST_CONFIG.rerollCost;

      if ((player.gold || 0) < cost) {
        throw new Error('Not enough gold to reroll.');
      }

      await base44.entities.Player.update(player.id, {
        gold: (player.gold || 0) - cost,
        researchQuestRerolls: rerollCount + 1,
        researchQuestRerollResetDay: todayIndex
      });

      const rerolledAt = new Date().toISOString();
      await Promise.all(quests.map((quest) => base44.entities.ResearchQuest.update(quest.id, {
        active: false,
        rerolledAt,
        status: 'rerolled'
      })));

      const replacements = Array.from({ length: quests.length }, () => generateQuest(player, gameTime));
      await Promise.all(replacements.map((quest) => base44.entities.ResearchQuest.create(quest)));

      return { cost };
    },
    onSuccess: (data) => {
      if (!data) return;
      queryClient.invalidateQueries({ queryKey: ['researchQuests'] });
      queryClient.invalidateQueries({ queryKey: ['player'] });
      setRerollMessage(
        `All quests rerolled${data.cost ? ` for ${data.cost} gold` : ''}.`
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
    if (!isLoading && quests.length < 3) {
      const neededQuests = 3 - quests.length;
      generateQuestsMutation.mutate(neededQuests);
    }
  }, [quests.length, isLoading]);

  useEffect(() => {
    if (isLoading || quests.length === 0) return;
    const missing = quests.filter((quest) => !(
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
    ));
    if (!missing.length) return;

    Promise.all(missing.map((quest) => {
      const fixed = normalizeQuestRequirements(quest);
      return base44.entities.ResearchQuest.update(quest.id, {
        nature: fixed.nature,
        requirements: fixed.requirements,
        difficultyScore: fixed.difficultyScore || quest.difficultyScore || 1
      });
    })).then(() => {
      queryClient.invalidateQueries({ queryKey: ['researchQuests'] });
    });
  }, [quests, isLoading, queryClient]);

  useEffect(() => {
    if (isLoading || quests.length === 0) return;
    const currentTotal = toTotalMinutes(normalizeGameTime(gameTime));
    const expired = quests.filter((quest) => {
      const expiry = getQuestExpiryMinutes(quest, gameTime);
      return Number.isFinite(expiry) && expiry <= currentTotal;
    });
    if (expired.length) {
      expired.forEach((quest) => {
        base44.entities.ResearchQuest.update(quest.id, {
          active: false,
          expiredAt: new Date().toISOString(),
          status: 'expired',
          legendaryLog: quest.isLegendary || quest.difficulty === 'Legendary'
        });
      });
      queryClient.invalidateQueries({ queryKey: ['researchQuests'] });
    }
  }, [quests, isLoading, queryClient, gameTime]);

  const handleSuccess = (reward) => {
    setSelectedQuest(null);
    if (player?.activeQuests?.length && selectedQuest) {
      const updatedQuests = player.activeQuests.filter(
        (quest) => (quest.questId || quest.id) !== selectedQuest.id
      );
      if (updatedQuests.length !== player.activeQuests.length) {
        base44.entities.Player.update(player.id, { activeQuests: updatedQuests });
        queryClient.invalidateQueries({ queryKey: ['player'] });
      }
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

  const activeQuests = useMemo(
    () => {
      const currentTotal = toTotalMinutes(normalizeGameTime(gameTime));
      return quests.filter((quest) => {
        const expiry = getQuestExpiryMinutes(quest, gameTime);
        return !Number.isFinite(expiry) || expiry > currentTotal;
      });
    },
    [quests, gameTime]
  );

  const acceptedQuestIds = useMemo(() => {
    const active = player?.activeQuests || [];
    return new Set(active.map((quest) => quest.questId || quest.id));
  }, [player]);

  const handleAcceptQuest = async (quest) => {
    if (!player || acceptingQuestId) return;
    setAcceptingQuestId(quest.id);
    try {
      const requiredCount = quest.quantityRequired || quest.requiredCount || 1;
      const rewardGold = quest.reward?.gold ?? quest.rewardBase ?? 0;
      const description = `Submit ${requiredCount} ${quest.species} for research.`;
      const newQuest = {
        id: quest.id,
        questId: quest.id,
        type: 'research',
        name: `Research: ${quest.species}`,
        description,
        progress: getSubmissionCount(quest.id),
        goal: requiredCount,
        reward: rewardGold ? `${rewardGold} gold` : 'Research rewards'
      };
      const updatedQuests = [...(player.activeQuests || [])];
      if (!updatedQuests.some((entry) => (entry.questId || entry.id) === quest.id)) {
        updatedQuests.push(newQuest);
        await base44.entities.Player.update(player.id, { activeQuests: updatedQuests });
        queryClient.invalidateQueries({ queryKey: ['player'] });
      }
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
            disabled={rerollAllMutation.isPending || !activeQuests.length}
          >
            Reroll All Research Quests
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {activeQuests.map(quest => (
          <ResearchQuestCard
            key={quest.id}
            quest={quest}
            onSubmit={setSelectedQuest}
            onAccept={handleAcceptQuest}
            isAccepted={acceptedQuestIds.has(quest.id)}
            isAccepting={acceptingQuestId === quest.id}
            onReroll={() => rerollQuestMutation.mutate(quest)}
            timeLeft={getTimeLeft(getQuestExpiryMinutes(quest, gameTime), gameTime)}
            rerollState={rerollState}
            rerollCost={QUEST_CONFIG.rerollCost}
            isRerolling={rerollQuestMutation.isPending}
            canAffordReroll={(player?.gold || 0) >= QUEST_CONFIG.rerollCost}
          />
        ))}
      </div>

      {recentHistory.length > 0 && (
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
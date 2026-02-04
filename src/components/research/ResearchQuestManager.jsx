import React, { useState, useEffect, useMemo } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, CheckCircle, RefreshCcw } from 'lucide-react';
import { PokemonRegistry } from '@/components/data/PokemonRegistry';
import { TalentRegistry } from '@/components/data/TalentRegistry';
import ResearchQuestCard from './ResearchQuestCard';
import ResearchSubmitModal from './ResearchSubmitModal';

const VERDANT_SPECIES = [
  { name: 'Caterpie', weight: 3 },
  { name: 'Pidgey', weight: 3 },
  { name: 'Oddish', weight: 2 },
  { name: 'Pikachu', weight: 1 }
];

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

const DIFFICULTY_TIERS = [
  { name: 'Easy', min: 1, max: 2, expiryHours: 24, difficultyMod: 1.0, items: ['1–2 basic mats'] },
  { name: 'Normal', min: 3, max: 4, expiryHours: 48, difficultyMod: 1.2, items: ['Chance for Pokéball or Potion (10–20%)'] },
  { name: 'Hard', min: 5, max: 6, expiryHours: 72, difficultyMod: 1.5, items: ['Uncommon mats', 'Higher drop rates'] },
  { name: 'Very Hard', min: 7, max: 8, expiryHours: 96, difficultyMod: 2.0, items: ['Rare mat', '2–4 quality items'] },
  { name: 'Elite', min: 9, max: 10, expiryHours: 120, difficultyMod: 3.0, items: ['Evolution stones', 'Rare ingredients'] },
  { name: 'Legendary', min: 11, max: Infinity, expiryHours: 168, difficultyMod: 6.0, items: ['1-of-a-kind items', 'Exclusive crafting'] }
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
  { type: 'level', weight: 2 }
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
    items: difficultyTier.items
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
  return score;
}

function generateQuest() {
  const species = weightedRoll(VERDANT_SPECIES).name;
  const requirements = [];
  let nature = null;
  let level = null;
  const ivConditions = [];
  const talentConditions = [];

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

  const difficultyScore = calculateDifficultyScore({
    nature,
    level,
    ivConditions,
    talentConditions
  });
  const difficultyTier = getDifficultyTier(difficultyScore);
  const avgTargetLevel = level || 10;
  const reward = getRewardForQuest({ avgTargetLevel, difficultyTier });
  const now = new Date();
  const expiresAt = new Date(now.getTime() + difficultyTier.expiryHours * 60 * 60 * 1000);

  return {
    requirements,
    species,
    nature,
    level,
    ivConditions,
    talentConditions,
    difficultyScore,
    difficulty: difficultyTier.name,
    reward,
    createdAt: now.toISOString(),
    expiresAt: expiresAt.toISOString(),
    active: true,
    isLegendary: difficultyTier.name === 'Legendary'
  };
}

function getTimeLeft(expiresAt) {
  if (!expiresAt) return 'No expiry';
  const now = new Date();
  const end = new Date(expiresAt);
  const diff = end - now;
  if (diff <= 0) return 'Expired';
  const hours = Math.floor(diff / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
  if (hours >= 24) {
    const days = Math.floor(hours / 24);
    return `${days}d ${hours % 24}h left`;
  }
  if (hours > 0) {
    return `${hours}h ${minutes}m left`;
  }
  return `${minutes}m left`;
}

function isSameDay(dateA, dateB) {
  return dateA.getFullYear() === dateB.getFullYear()
    && dateA.getMonth() === dateB.getMonth()
    && dateA.getDate() === dateB.getDate();
}

export default function ResearchQuestManager() {
  const [selectedQuest, setSelectedQuest] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);
  const [rerollMessage, setRerollMessage] = useState(null);
  const queryClient = useQueryClient();

  const { data: quests = [], isLoading } = useQuery({
    queryKey: ['researchQuests'],
    queryFn: () => base44.entities.ResearchQuest.filter({ active: true })
  });

  const { data: player } = useQuery({
    queryKey: ['player'],
    queryFn: async () => {
      const players = await base44.entities.Player.list();
      return players[0] || null;
    }
  });

  const generateQuestsMutation = useMutation({
    mutationFn: async (count) => {
      const questsToCreate = [];
      for (let i = 0; i < count; i++) {
        questsToCreate.push(generateQuest());
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
      const now = new Date();
      const lastReset = player.researchQuestRerollReset ? new Date(player.researchQuestRerollReset) : null;
      const shouldReset = !lastReset || !isSameDay(lastReset, now);
      const rerollCount = shouldReset ? 0 : (player.researchQuestRerolls || 0);
      const isFree = rerollCount < QUEST_CONFIG.maxFreeRerolls;
      const cost = isFree ? 0 : QUEST_CONFIG.rerollCost;

      if ((player.gold || 0) < cost) {
        throw new Error('Not enough gold to reroll.');
      }

      await base44.entities.Player.update(player.id, {
        gold: (player.gold || 0) - cost,
        researchQuestRerolls: rerollCount + 1,
        researchQuestRerollReset: now.toISOString()
      });

      await base44.entities.ResearchQuest.update(quest.id, {
        active: false,
        rerolledAt: now.toISOString(),
        status: 'rerolled'
      });

      const replacement = generateQuest();
      await base44.entities.ResearchQuest.create(replacement);
      return { cost, replacementTier: replacement.difficulty };
    },
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

  // Initialize quests if none exist
  useEffect(() => {
    if (!isLoading && quests.length < 3) {
      const neededQuests = 3 - quests.length;
      generateQuestsMutation.mutate(neededQuests);
    }
  }, [quests.length, isLoading]);

  useEffect(() => {
    if (isLoading || quests.length === 0) return;
    const now = new Date();
    const expired = quests.filter((quest) => quest.expiresAt && new Date(quest.expiresAt) < now);
    if (expired.length) {
      expired.forEach((quest) => {
        base44.entities.ResearchQuest.update(quest.id, {
          active: false,
          expiredAt: now.toISOString(),
          status: 'expired',
          legendaryLog: quest.isLegendary || quest.difficulty === 'Legendary'
        });
      });
      queryClient.invalidateQueries({ queryKey: ['researchQuests'] });
    }
  }, [quests, isLoading, queryClient]);

  const handleSuccess = (reward) => {
    setSelectedQuest(null);
    setSuccessMessage(`Thank you! Your Pokémon has greatly advanced our research. You received ${reward} gold!`);
    
    setTimeout(() => {
      setSuccessMessage(null);
      // Generate replacement quest
      generateQuestsMutation.mutate(1);
    }, 3000);
  };

  const rerollState = useMemo(() => {
    if (!player) return null;
    const now = new Date();
    const lastReset = player.researchQuestRerollReset ? new Date(player.researchQuestRerollReset) : null;
    const shouldReset = !lastReset || !isSameDay(lastReset, now);
    const rerollCount = shouldReset ? 0 : (player.researchQuestRerolls || 0);
    const freeLeft = Math.max(QUEST_CONFIG.maxFreeRerolls - rerollCount, 0);
    return { rerollCount, freeLeft };
  }, [player]);

  const activeQuests = useMemo(
    () => quests.filter((quest) => !quest.expiresAt || new Date(quest.expiresAt) > new Date()),
    [quests]
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
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {activeQuests.map(quest => (
          <ResearchQuestCard
            key={quest.id}
            quest={quest}
            onSubmit={setSelectedQuest}
            onReroll={() => rerollQuestMutation.mutate(quest)}
            timeLeft={getTimeLeft(quest.expiresAt)}
            rerollState={rerollState}
            rerollCost={QUEST_CONFIG.rerollCost}
            isRerolling={rerollQuestMutation.isPending}
            canAffordReroll={(player?.gold || 0) >= QUEST_CONFIG.rerollCost}
          />
        ))}
      </div>

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

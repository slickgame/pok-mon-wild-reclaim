import React, { useState, useEffect, useMemo } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, CheckCircle, RefreshCcw } from 'lucide-react';
import ResearchQuestCard from './ResearchQuestCard';
import ResearchSubmitModal from './ResearchSubmitModal';
import { getSubmissionCount } from '@/systems/quests/questProgressTracker';
import { getAbsoluteDayIndex, normalizeGameTime, toTotalMinutes } from '@/systems/time/gameTimeSystem';
import { getGlobalResearchAnalytics } from '@/systems/quests/researchQuestAnalytics';
import {
  QUEST_CONFIG as QUEST_SERVICE_CONFIG,
  acceptQuestAction,
  completeQuestAction,
  createGeneratedQuests,
  rerollAllQuestsAction,
  rerollQuestAction,
  syncExpiredQuestsChunked,
  normalizeQuestRequirements,
  getNextResetLabel,
  getQuestExpiryMinutes,
  getTimeLeft,
  getQuestDurationLabel
} from '@/systems/quests/researchQuestService';

const QUEST_CONFIG = QUEST_SERVICE_CONFIG;

function getNextResetLabel(gameTime) {
  const normalized = normalizeGameTime(gameTime);
  const currentTotal = toTotalMinutes(normalized);
  const minuteOfDay = (normalized.currentHour * TIME_CONSTANTS.MINUTES_PER_HOUR) + normalized.currentMinute;
  const minutesUntilReset = TIME_CONSTANTS.MINUTES_PER_DAY - minuteOfDay;
  const targetTotal = currentTotal + minutesUntilReset;
  return getTimeLeftLabel(currentTotal, targetTotal).replace(' left', '');
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
      quests,
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
        createdAtMinutes: fixed.createdAtMinutes,
        expiresAtMinutes: fixed.expiresAtMinutes,
        questValue: fixed.questValue || fixed.difficultyScore || quest.questValue || quest.difficultyScore || 1,
        questValueVersion: fixed.questValueVersion || quest.questValueVersion || 1,
        difficultyScore: fixed.difficultyScore || fixed.questValue || quest.difficultyScore || quest.questValue || 1
      });
    })).then(() => {
      queryClient.invalidateQueries({ queryKey: ['researchQuests'] });
    });
  }, [quests, isLoading, queryClient]);

  useEffect(() => {
    if (isLoading || quests.length === 0) return;
    syncExpiredQuestsChunked({
      base44,
      quests,
      player,
      gameTime,
      analytics: researchAnalytics
    }).then(({ expiredCount }) => {
      if (expiredCount > 0) {
        queryClient.invalidateQueries({ queryKey: ['researchQuests'] });
        queryClient.invalidateQueries({ queryKey: ['player'] });
      }
    });
  }, [quests, isLoading, queryClient, gameTime, player, researchAnalytics]);

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
            disabled={rerollAllMutation.isPending || !activeQuests.length || activeQuests.every((quest) => acceptedQuestIds.has(quest.id))}
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

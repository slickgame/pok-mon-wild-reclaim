import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { X, AlertCircle, Zap, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { TalentRegistry } from '@/components/data/TalentRegistry';
import { formatTalentName } from '@/components/utils/talentUtils';
import { formatPokemonCard, getEligiblePokemon } from '@/components/research/questUtils';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { ItemRegistry } from '@/data/ItemRegistry';
import {
  getSubmissionCount,
  isPokemonAlreadySubmitted,
  isQuestCompleted,
  hasQuestBonusClaimed,
  markQuestComplete,
  markQuestBonusClaimed,
  submitPokemonToQuest
} from '@/systems/quests/questProgressTracker';
import { handleSubmitAllEligible } from '@/systems/quests/submitAllEligible';
import { getStatStageChangeText } from '@/components/utils/statusHelpers';

const statNames = {
  HP: 'HP',
  Atk: 'Attack',
  Def: 'Defense',
  SpAtk: 'Sp. Atk',
  SpDef: 'Sp. Def',
  Speed: 'Speed',
  hp: 'HP',
  atk: 'Attack',
  def: 'Defense',
  spAtk: 'Sp. Atk',
  spDef: 'Sp. Def',
  spd: 'Speed'
};

export default function ResearchSubmitModal({ quest, onClose, onSuccess }) {
  const [selectedPokemon, setSelectedPokemon] = useState(null);
  const [submissionCount, setSubmissionCount] = useState(() => getSubmissionCount(quest.id));
  const [questCompleted, setQuestCompleted] = useState(() => isQuestCompleted(quest.id));
  const queryClient = useQueryClient();
  const requirements = quest.requirements || {};
  const questNature = quest.nature || requirements.nature;
  const questLevel = quest.level || requirements.level;
  const questIvConditions = quest.ivConditions?.length ? quest.ivConditions : (requirements.ivConditions || []);
  const questTalentConditions = quest.talentConditions?.length ? quest.talentConditions : (requirements.talentConditions || []);
  const shinyRequired = quest.shinyRequired;
  const alphaRequired = quest.alphaRequired;
  const bondedRequired = quest.bondedRequired;
  const hiddenAbilityRequired = quest.hiddenAbilityRequired;
  const requiredCount = quest.quantityRequired || quest.requiredCount || 1;
  const remainingCount = Math.max(requiredCount - submissionCount, 0);
  const questAlreadyCompleted = questCompleted;

  const { data: player } = useQuery({
    queryKey: ['player'],
    queryFn: async () => {
      const players = await base44.entities.Player.list();
      return players[0] || null;
    }
  });

  const { data: allPokemon = [] } = useQuery({
    queryKey: ['allPokemon'],
    queryFn: () => base44.entities.Pokemon.list()
  });

  const { data: inventory = [] } = useQuery({
    queryKey: ['inventory'],
    queryFn: () => base44.entities.Item.list()
  });

  const trustPreview = quest.reward?.trustGain
    ? getStatStageChangeText('Trust', quest.reward.trustGain)
    : '';
  const notesPreview = quest.reward?.notesGain
    ? getStatStageChangeText('Notes', quest.reward.notesGain)
    : '';

  // Filter eligible Pokémon
  const eligiblePokemon = getEligiblePokemon(allPokemon, quest);

  const awardItems = async (itemRewards = []) => {
    if (!itemRewards.length) return [];
    const awarded = [];
    for (const reward of itemRewards) {
      const itemDef = ItemRegistry[reward.id];
      if (!itemDef) continue;
      const existing = inventory.find((item) => item.name === itemDef.name && item.type === itemDef.type);
      if (existing) {
        await base44.entities.Item.update(existing.id, {
          quantity: (existing.quantity || 1) + (reward.quantity || 1)
        });
      } else {
        await base44.entities.Item.create({
          name: itemDef.name,
          type: itemDef.type || 'Item',
          quantity: reward.quantity || 1
        });
      }
      awarded.push(itemDef.name);
    }
    return awarded;
  };

  const applyQuestRewards = async () => {
    const baseGold = quest.reward?.gold ?? quest.rewardBase ?? 0;
    const trustGain = quest.reward?.trustGain || 0;
    const notesGain = quest.reward?.notesGain || 0;
    const itemRewards = quest.reward?.itemRewards || [];
    const bonusEligible = !hasQuestBonusClaimed(quest.id);
    const bonusGold = bonusEligible ? Math.floor(baseGold * 0.2) : 0;
    const totalGold = baseGold + bonusGold;

    const updatedTrust = {
      ...(player?.trustLevels || {}),
      maple: Math.min((player?.trustLevels?.maple || 0) + trustGain, 100)
    };

    await base44.entities.Player.update(player.id, {
      gold: (player.gold || 0) + totalGold,
      trustLevels: updatedTrust,
      researchNotes: (player.researchNotes || 0) + notesGain
    });

    const awardedItems = await awardItems(itemRewards);
    if (bonusEligible) {
      markQuestBonusClaimed(quest.id);
    }

    return {
      gold: totalGold,
      baseGold,
      bonusGold,
      trustGain,
      notesGain,
      items: awardedItems
    };
  };

  const submitMutation = useMutation({
    mutationFn: async ({ pokemon, shouldComplete }) => {
      const now = new Date().toISOString();

      if (isPokemonAlreadySubmitted(quest.id, pokemon.id)) {
        return { reward: 0, completed: false };
      }

      submitPokemonToQuest(quest.id, pokemon.id);
      setSubmissionCount(getSubmissionCount(quest.id));

      // Release Pokémon
      await base44.entities.Pokemon.delete(pokemon.id);

      if (!shouldComplete) {
        return { reward: 0, completed: false };
      }
      const rewardSummary = await applyQuestRewards();

      // Mark quest as complete
      await base44.entities.ResearchQuest.update(quest.id, {
        active: false,
        completedAt: now,
        status: 'completed',
        legendaryLog: quest.isLegendary || quest.difficulty === 'Legendary'
      });

      markQuestComplete(quest.id);
      setQuestCompleted(true);
      return { reward: rewardSummary, completed: true };
    },
    onSuccess: ({ reward, completed }) => {
      queryClient.invalidateQueries({ queryKey: ['player'] });
      queryClient.invalidateQueries({ queryKey: ['allPokemon'] });
      queryClient.invalidateQueries({ queryKey: ['playerPokemon'] });
      queryClient.invalidateQueries({ queryKey: ['researchQuests'] });
      if (completed) {
        onSuccess(reward);
      }
    }
  });

  const handleSubmitAll = async () => {
    const message = `Submit ${eligiblePokemon.length} eligible Pokémon? This will permanently release them.`;
    if (!window.confirm(message)) return;

    const submitResult = handleSubmitAllEligible({
      quest,
      eligiblePokemon,
      requiredCount,
      onComplete: () => {}
    });

    if (submitResult.submitted?.length) {
      await Promise.all(submitResult.submitted.map((pokemon) => base44.entities.Pokemon.delete(pokemon.id)));
      setSubmissionCount(getSubmissionCount(quest.id));
    }

    if (submitResult.status === 'completed') {
      const reward = await applyQuestRewards();
      await base44.entities.ResearchQuest.update(quest.id, {
        active: false,
        completedAt: new Date().toISOString(),
        status: 'completed',
        legendaryLog: quest.isLegendary || quest.difficulty === 'Legendary'
      });
      markQuestComplete(quest.id);
      setQuestCompleted(true);
      onSuccess(reward);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        className="glass rounded-xl max-w-2xl w-full max-h-[80vh] overflow-y-auto"
      >
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-white flex items-center gap-2">
              <Sparkles className="w-6 h-6 text-indigo-400" />
              Submit Research Pokémon
            </h2>
            <button
              onClick={onClose}
              className="text-slate-400 hover:text-white transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          <div className="bg-slate-800/50 rounded-lg p-4 mb-6">
            <p className="text-sm text-slate-400 mb-2">Quest Requirements:</p>
            <p className="text-lg font-bold text-white mb-2">{quest.species}</p>
            <p className="text-xs text-slate-400">
              Progress: {submissionCount}/{requiredCount} submitted {questAlreadyCompleted ? '(Completed)' : ''}
            </p>
            {quest.requirementType === 'nature' && quest.nature && !questNature && (
              <p className="text-indigo-300">Nature: {quest.nature}</p>
            )}
            {quest.requirementType === 'iv' && quest.ivStat && quest.ivThreshold != null && !questIvConditions.length && (
              <p className="text-purple-300">
                {statNames[quest.ivStat]} ≥ {quest.ivThreshold}
              </p>
            )}
            {shinyRequired && (
              <p className="text-purple-300">Shiny: Required</p>
            )}
            {alphaRequired && (
              <p className="text-purple-300">Alpha: Required</p>
            )}
            {hiddenAbilityRequired && (
              <p className="text-purple-300">Hidden Ability: Required</p>
            )}
            {bondedRequired && (
              <p className="text-purple-300">Bonded: Required</p>
            )}
            {questNature && (
              <p className="text-indigo-300">Nature: {questNature}</p>
            )}
            {questLevel && (
              <p className="text-indigo-300">Level: ≥ {questLevel}</p>
            )}
            {questIvConditions.map((iv) => (
              <p key={`${quest.id}-iv-${iv.stat}`} className="text-purple-300">
                {statNames[iv.stat] || iv.stat} ≥ {iv.min}
              </p>
            ))}
            {questTalentConditions.map((condition, index) => {
              if (condition.talentId) {
                const talentData = TalentRegistry[condition.talentId];
                const displayName = talentData?.name || formatTalentName(condition.talentId);
                const tagText = condition.requiredTags?.length ? ` (${condition.requiredTags.join(', ')})` : '';
                return (
                  <p key={`${quest.id}-talent-${index}`} className="text-purple-300">
                    Talent: {displayName} {condition.grade}+{tagText}
                  </p>
                );
              }
              const gradeList = condition.grades?.length ? condition.grades.join(', ') : 'Basic+';
              const tagText = condition.requiredTags?.length ? ` (${condition.requiredTags.join(', ')})` : '';
              return (
                <p key={`${quest.id}-talent-${index}`} className="text-purple-300">
                  Talents: Any {condition.count} ({gradeList}){tagText}
                </p>
              );
            })}
            {quest.reward?.items?.length ? (
              <div className="mt-4 text-xs text-slate-400">
                <p className="uppercase tracking-wide text-[10px] text-slate-500">Item Reward Preview</p>
                <ul className="mt-1 space-y-1 text-slate-300">
                  {quest.reward.items.map((item) => (
                    <li key={`${quest.id}-reward-${item}`}>{item}</li>
                  ))}
                </ul>
              </div>
            ) : null}
            {(trustPreview || notesPreview) && (
              <div className="mt-3 text-xs text-slate-400 space-y-1">
                {trustPreview && (
                  <div dangerouslySetInnerHTML={{ __html: trustPreview }} />
                )}
                {notesPreview && (
                  <div dangerouslySetInnerHTML={{ __html: notesPreview }} />
                )}
              </div>
            )}
          </div>

          {eligiblePokemon.length === 0 ? (
            <div className="text-center py-12">
              <AlertCircle className="w-16 h-16 mx-auto mb-4 text-slate-600" />
              <h3 className="text-lg font-semibold text-white mb-2">
                No Eligible Pokémon
              </h3>
              <p className="text-slate-400 text-sm">
                None of your Pokémon meet the research requirements.
              </p>
            </div>
          ) : (
            <div className="space-y-3 mb-6">
              <p className="text-sm text-slate-400">
                Select a Pokémon to submit ({eligiblePokemon.length} eligible):
              </p>
              <Button
                onClick={handleSubmitAll}
                variant="outline"
                className="w-full border-indigo-500/50 text-indigo-200 hover:bg-indigo-500/10"
                disabled={questAlreadyCompleted || remainingCount === 0}
              >
                Submit All Eligible ({eligiblePokemon.length})
              </Button>
              {eligiblePokemon.map(pokemon => {
                const reward = quest.reward?.gold ?? quest.rewardBase ?? 0;
                const alreadySubmitted = isPokemonAlreadySubmitted(quest.id, pokemon.id);
                return (
                  <motion.button
                    key={pokemon.id}
                    onClick={() => setSelectedPokemon(pokemon)}
                    whileHover={{ scale: 1.02 }}
                    disabled={alreadySubmitted}
                    className={`w-full glass rounded-lg p-4 text-left transition-all ${
                      selectedPokemon?.id === pokemon.id
                        ? 'ring-2 ring-indigo-500 bg-indigo-500/10'
                        : 'hover:bg-slate-800/50'
                    } ${alreadySubmitted ? 'opacity-60 cursor-not-allowed' : ''}`}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="font-bold text-white">
                            {pokemon.nickname || pokemon.species}
                          </p>
                          <TooltipProvider delayDuration={200}>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <button
                                  type="button"
                                  className="text-xs text-slate-400 hover:text-slate-200"
                                  onClick={(event) => event.stopPropagation()}
                                >
                                  🛈
                                </button>
                              </TooltipTrigger>
                              <TooltipContent className="max-w-xs whitespace-pre-line border border-white/10 bg-slate-900/95 p-3 text-xs text-slate-100 shadow-lg">
                                {formatPokemonCard(pokemon)}
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        </div>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge className="bg-slate-700">Lv. {pokemon.level}</Badge>
                          {pokemon.nature && (
                            <Badge className="bg-indigo-700">{pokemon.nature}</Badge>
                          )}
                          {alreadySubmitted && (
                            <Badge className="bg-emerald-700">Submitted</Badge>
                          )}
                        </div>
                        {pokemon.ivs && (
                          <div className="text-xs text-slate-400 mt-2 space-y-1">
                            <div>IVs: HP {pokemon.ivs.hp} / Atk {pokemon.ivs.atk} / Def {pokemon.ivs.def} / SpA {pokemon.ivs.spAtk} / SpD {pokemon.ivs.spDef} / Spd {pokemon.ivs.spd}</div>
                          </div>
                        )}
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-slate-400">Reward:</p>
                        <p className="text-yellow-400 font-bold flex items-center gap-1">
                          <Zap className="w-4 h-4" />
                          {reward}
                        </p>
                      </div>
                    </div>
                  </motion.button>
                );
              })}
            </div>
          )}

          {selectedPokemon && (
            <div className="border-t border-slate-700 pt-6 space-y-4">
              <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4">
                <p className="text-red-400 text-sm font-semibold mb-1">
                  ⚠️ Warning: This Pokémon will be RELEASED
                </p>
                <p className="text-red-300/70 text-xs">
                  Submitted Pokémon are permanently released to advance research. This cannot be undone.
                </p>
              </div>

              <div className="flex gap-3">
                <Button
                  onClick={onClose}
                  variant="outline"
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button
                  onClick={() => {
                    const willComplete = submissionCount + 1 >= requiredCount;
                    submitMutation.mutate({ pokemon: selectedPokemon, shouldComplete: willComplete });
                  }}
                  disabled={submitMutation.isPending || questAlreadyCompleted}
                  className="flex-1 bg-gradient-to-r from-red-500 to-orange-500 hover:from-red-600 hover:to-orange-600"
                >
                  {submitMutation.isPending ? 'Submitting...' : 'Submit & Release'}
                </Button>
              </div>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
}
import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Sparkles, Zap, Trophy, Clock } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { TalentRegistry } from '@/components/data/TalentRegistry';
import { ItemRegistry } from '@/components/data/ItemRegistry';
import { formatTalentName } from '@/components/utils/talentUtils';
import talentTagIcons from '@/components/research/talentTagIcons.json';

const tierColors = {
  Easy: 'bg-slate-500/20 text-slate-300 border-slate-500/50',
  Normal: 'bg-green-500/20 text-green-300 border-green-500/50',
  Hard: 'bg-purple-500/20 text-purple-300 border-purple-500/50',
  'Very Hard': 'bg-orange-500/20 text-orange-300 border-orange-500/50',
  Elite: 'bg-red-500/20 text-red-300 border-red-500/50',
  Legendary: 'bg-yellow-500/20 text-yellow-300 border-yellow-500/50'
};

const statNames = {
  HP: 'HP', Atk: 'Attack', Def: 'Defense', SpAtk: 'Sp. Atk', SpDef: 'Sp. Def', Speed: 'Speed',
  hp: 'HP', atk: 'Attack', def: 'Defense', spAtk: 'Sp. Atk', spDef: 'Sp. Def', spd: 'Speed'
};

function renderTagIcon(tag) {
  const normalized = tag?.toString?.().toLowerCase?.();
  const icon = talentTagIcons[normalized];
  return icon ? `${icon} ${tag}` : tag;
}

function formatItemLabel(itemId) {
  if (!itemId) return 'Unknown item';
  const item = ItemRegistry[itemId];
  if (item?.name) return item.name;
  return itemId.toString().replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
}

function renderTalentRequirement(condition) {
  if (!condition) return 'Talent requirement';
  if (condition.talentId) {
    const talentData = TalentRegistry[condition.talentId];
    const displayName = talentData?.name || formatTalentName(condition.talentId);
    const gradeLabel = condition.grade ? ` ${condition.grade}+` : '';
    const tagText = condition.requiredTags?.length
      ? ` (${condition.requiredTags.map(renderTagIcon).join(', ')})`
      : '';
    return `${displayName}${gradeLabel}${tagText}`;
  }
  const gradeList = condition.grades?.length ? condition.grades.join(', ') : 'Basic+';
  const tagText = condition.requiredTags?.length
    ? ` (${condition.requiredTags.map(renderTagIcon).join(', ')})`
    : '';
  return `Any ${condition.count} talents (${gradeList})${tagText}`;
}

export default function QuestDetailsModal({ quest, onClose, timeLeft, onSubmit }) {
  if (!quest) return null;

  const requirements = quest.requirements || {};
  const difficultyTier = quest.difficulty || 'Normal';
  const rewardGold = quest.reward?.gold ?? quest.rewardBase;
  const primaryNature = quest.nature || requirements.nature;
  const primaryLevel = quest.level || requirements.level;
  const ivRules = (quest.ivConditions?.length ? quest.ivConditions : requirements.ivConditions) || [];
  const talentRules = (quest.talentConditions?.length ? quest.talentConditions : requirements.talentConditions) || [];
  const requiredCount = quest.quantityRequired || quest.requiredCount || 1;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          className="bg-slate-900 rounded-2xl border border-slate-700 shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="sticky top-0 bg-slate-900/95 backdrop-blur-sm border-b border-slate-700 p-6 flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <Sparkles className="w-6 h-6 text-indigo-400" />
                <h2 className="text-2xl font-bold text-white">Research Quest Details</h2>
              </div>
              <Badge className={`${tierColors[difficultyTier] || tierColors.Normal}`}>
                {difficultyTier}
              </Badge>
            </div>
            <button
              onClick={onClose}
              className="text-slate-400 hover:text-white transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          <div className="p-6 space-y-6">
            <div className="bg-gradient-to-br from-indigo-500/10 to-purple-500/10 rounded-xl p-6 border border-indigo-500/30">
              <div className="flex items-center gap-2 mb-3">
                <Trophy className="w-5 h-5 text-indigo-400" />
                <h3 className="text-lg font-semibold text-white">Required Pokémon</h3>
              </div>
              <p className="text-3xl font-bold text-white mb-2">{quest.species}</p>
              {requiredCount > 1 && (
                <p className="text-sm text-slate-400">Submit {requiredCount} Pokémon to complete</p>
              )}
            </div>

            <div className="grid gap-4">
              <div className="bg-slate-800/50 rounded-lg p-4">
                <h4 className="text-sm font-semibold text-slate-300 mb-3">Requirements</h4>
                <div className="space-y-2 text-sm">
                  {primaryNature && (
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400">Nature:</span>
                      <span className="text-white font-medium">{primaryNature}</span>
                    </div>
                  )}
                  {primaryLevel && (
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400">Minimum Level:</span>
                      <span className="text-white font-medium">{primaryLevel}</span>
                    </div>
                  )}
                  {ivRules.map((iv, idx) => (
                    <div key={idx} className="flex items-center justify-between">
                      <span className="text-slate-400">{statNames[iv.stat] || iv.stat} IV:</span>
                      <span className="text-white font-medium">≥ {iv.min}</span>
                    </div>
                  ))}
                  {talentRules.map((condition, idx) => (
                    <div key={idx} className="flex items-start justify-between gap-2">
                      <span className="text-slate-400">Talent:</span>
                      <span className="text-white font-medium text-right">{renderTalentRequirement(condition)}</span>
                    </div>
                  ))}
                  {quest.shinyRequired && (
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400">Special:</span>
                      <span className="text-yellow-300 font-medium">✨ Shiny Required</span>
                    </div>
                  )}
                  {quest.alphaRequired && (
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400">Special:</span>
                      <span className="text-purple-300 font-medium">Alpha Required</span>
                    </div>
                  )}
                </div>
              </div>

              <div className="bg-slate-800/50 rounded-lg p-4">
                <h4 className="text-sm font-semibold text-slate-300 mb-3">Rewards</h4>
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-lg">
                    <span className="text-slate-400">Gold:</span>
                    <span className="text-yellow-400 font-bold flex items-center gap-2">
                      <Zap className="w-5 h-5" />
                      {rewardGold}
                    </span>
                  </div>
                  {quest.reward?.trustGain && (
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-slate-400">Trust Gain:</span>
                      <span className="text-green-300 font-medium">+{quest.reward.trustGain}</span>
                    </div>
                  )}
                  {quest.reward?.notesGain && (
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-slate-400">Research Notes:</span>
                      <span className="text-cyan-300 font-medium">+{quest.reward.notesGain}</span>
                    </div>
                  )}
                  {quest.reward?.items?.length > 0 && (
                    <div className="mt-3">
                      <p className="text-xs text-slate-500 uppercase tracking-wide mb-2">Items</p>
                      <div className="flex flex-wrap gap-2">
                        {quest.reward.items.map((item, idx) => (
                          <Badge key={idx} className="bg-indigo-900/40 text-indigo-200 border-indigo-700/50">
                            {item}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {timeLeft && (
                <div className="bg-slate-800/50 rounded-lg p-4 flex items-center justify-between">
                  <div className="flex items-center gap-2 text-slate-400">
                    <Clock className="w-4 h-4" />
                    <span className="text-sm">Time Remaining:</span>
                  </div>
                  <span className="text-white font-semibold">{timeLeft}</span>
                </div>
              )}
            </div>

            {onSubmit && (
              <Button
                onClick={() => {
                  onSubmit(quest);
                  onClose();
                }}
                className="w-full bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600"
              >
                Submit Pokémon
              </Button>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
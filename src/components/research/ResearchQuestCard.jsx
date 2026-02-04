import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Sparkles, Zap, RefreshCcw, ChevronDown, Info } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { TalentRegistry } from '@/components/data/TalentRegistry';
import { formatTalentName } from '@/components/utils/talentUtils';
import { formatQuestCard } from '@/components/research/questUtils';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

const tierColors = {
  Common: 'bg-slate-500/20 text-slate-300 border-slate-500/50',
  Uncommon: 'bg-green-500/20 text-green-300 border-green-500/50',
  Rare: 'bg-purple-500/20 text-purple-300 border-purple-500/50',
  Easy: 'bg-slate-500/20 text-slate-300 border-slate-500/50',
  Normal: 'bg-green-500/20 text-green-300 border-green-500/50',
  Hard: 'bg-purple-500/20 text-purple-300 border-purple-500/50',
  'Very Hard': 'bg-orange-500/20 text-orange-300 border-orange-500/50',
  Elite: 'bg-red-500/20 text-red-300 border-red-500/50',
  Legendary: 'bg-yellow-500/20 text-yellow-300 border-yellow-500/50'
};

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

function renderTalentRequirement(condition) {
  if (!condition) return 'Talent requirement';
  if (condition.talentId) {
    const talentData = TalentRegistry[condition.talentId];
    const displayName = talentData?.name || formatTalentName(condition.talentId);
    const gradeLabel = condition.grade ? ` ${condition.grade}+` : '';
    const tagText = condition.requiredTags?.length ? ` (${condition.requiredTags.join(', ')} tag)` : '';
    return `${displayName}${gradeLabel}${tagText}`;
  }
  const gradeList = condition.grades?.length ? condition.grades.join(', ') : 'Basic+';
  const tagText = condition.requiredTags?.length ? ` (${condition.requiredTags.join(', ')} tag)` : '';
  return `Any ${condition.count} talents (${gradeList})${tagText}`;
}

export default function ResearchQuestCard({
  quest,
  onSubmit,
  onReroll,
  timeLeft,
  rerollState,
  rerollCost,
  isRerolling,
  canAffordReroll
}) {
  const [isHovered, setIsHovered] = useState(false);
  const [isPinned, setIsPinned] = useState(false);
  const isExpanded = isPinned || isHovered;
  const requirements = quest.requirements || {};
  const difficultyTier = quest.difficulty
    || (quest.rarity ? `${quest.rarity[0].toUpperCase()}${quest.rarity.slice(1)}` : 'Normal');
  const rewardGold = quest.reward?.gold ?? quest.rewardBase;
  const rewardItems = quest.reward?.items || [];
  const legacyDetails = quest.requirementType === 'nature' || quest.requirementType === 'iv';
  const hasDetails = legacyDetails
    || quest.nature
    || quest.level
    || (quest.ivConditions?.length || 0) > 0
    || (quest.talentConditions?.length || 0) > 0
    || requirements.nature
    || requirements.level
    || (requirements.ivConditions?.length || 0) > 0
    || (requirements.talentConditions?.length || 0) > 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass rounded-xl p-6 hover:border-indigo-500/50 transition-all"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="flex items-start justify-between mb-4">
        <div>
          <h3 className="text-lg font-bold text-white flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-indigo-400" />
            Research Request
            <TooltipProvider delayDuration={200}>
              <Tooltip>
                <TooltipTrigger asChild>
                  <button
                    type="button"
                    className="text-slate-400 hover:text-slate-200"
                    onClick={(event) => event.stopPropagation()}
                  >
                    <Info className="w-4 h-4" />
                  </button>
                </TooltipTrigger>
                <TooltipContent className="max-w-xs whitespace-pre-line border border-white/10 bg-slate-900/95 p-3 text-xs text-slate-100 shadow-lg">
                  {formatQuestCard(quest)}
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </h3>
          <Badge className={`mt-2 ${tierColors[difficultyTier] || tierColors.Normal}`}>
            {difficultyTier}
          </Badge>
        </div>
        {timeLeft && (
          <div className="text-xs text-slate-400 text-right">
            <p className="uppercase tracking-wide text-[10px] text-slate-500">Time Left</p>
            <p className="text-slate-200">{timeLeft}</p>
          </div>
        )}
      </div>

      <div className="space-y-3 mb-4">
        <div className="bg-slate-800/50 rounded-lg p-4">
          <p className="text-sm text-slate-400 mb-2">Required Pokémon:</p>
          <p className="text-xl font-bold text-white">{quest.species}</p>

          {hasDetails && isExpanded && (
            <div className="mt-3 space-y-2 text-sm text-slate-300">
              {legacyDetails && quest.requirementType === 'nature' && (
                <p><span className="text-slate-400">Nature:</span> {quest.nature}</p>
              )}
              {legacyDetails && quest.requirementType === 'iv' && (
                <p><span className="text-slate-400">IV:</span> {statNames[quest.ivStat]} ≥ {quest.ivThreshold}</p>
              )}
              {quest.nature && (
                <p><span className="text-slate-400">Nature:</span> {quest.nature}</p>
              )}
              {quest.level && (
                <p><span className="text-slate-400">Level:</span> ≥ {quest.level}</p>
              )}
              {quest.ivConditions?.map((iv) => (
                <p key={`${quest.id}-iv-${iv.stat}`}>
                  <span className="text-slate-400">IV:</span> {statNames[iv.stat] || iv.stat} ≥ {iv.min}
                </p>
              ))}
              {quest.talentConditions?.map((condition, index) => (
                <p key={`${quest.id}-talent-${index}`}>
                  <span className="text-slate-400">Talent:</span> {renderTalentRequirement(condition)}
                </p>
              ))}
              {requirements.nature && (
                <p><span className="text-slate-400">Nature:</span> {requirements.nature}</p>
              )}
              {requirements.level && (
                <p><span className="text-slate-400">Level:</span> ≥ {requirements.level}</p>
              )}
              {requirements.ivConditions?.map((iv) => (
                <p key={`${quest.id}-iv-${iv.stat}`}>
                  <span className="text-slate-400">IV:</span> {statNames[iv.stat] || iv.stat} ≥ {iv.min}
                </p>
              ))}
              {requirements.talentConditions?.map((condition, index) => (
                <p key={`${quest.id}-talent-${index}`}>
                  <span className="text-slate-400">Talent:</span> {renderTalentRequirement(condition)}
                </p>
              ))}
            </div>
          )}
        </div>

        <div className="flex items-center justify-between text-sm">
          <span className="text-slate-400">Reward:</span>
          <span className="text-yellow-400 font-semibold flex items-center gap-1">
            <Zap className="w-4 h-4" />
            {rewardGold} gold
          </span>
        </div>

        {rewardItems.length > 0 && (
          <div className="text-xs text-slate-400">
            <span className="text-slate-500 uppercase tracking-wide text-[10px]">Item Preview</span>
            <ul className="mt-1 space-y-1">
              {rewardItems.map((item) => (
                <li key={`${quest.id}-${item}`} className="text-slate-300">{item}</li>
              ))}
            </ul>
          </div>
        )}
      </div>

      <div className="space-y-2">
        <Button
          onClick={() => onSubmit(quest)}
          className="w-full bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600"
        >
          Submit Pokémon
        </Button>

        {onReroll && (
          <Button
            onClick={() => onReroll(quest)}
            variant="outline"
            disabled={isRerolling || (!rerollState?.freeLeft && !canAffordReroll)}
            className="w-full border-indigo-500/50 text-indigo-200 hover:bg-indigo-500/10"
          >
            <RefreshCcw className="w-4 h-4 mr-2" />
            {rerollState?.freeLeft ? `Free Reroll (${rerollState.freeLeft} left)` : `Reroll (${rerollCost} gold)`}
          </Button>
        )}
      </div>

      {hasDetails && (
        <button
          onClick={() => setIsPinned((prev) => !prev)}
          className="mt-3 text-xs text-slate-400 flex items-center gap-1 hover:text-slate-200"
          type="button"
        >
          <ChevronDown className={`w-3 h-3 transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
          {isExpanded ? 'Hide details' : 'Show details'}
        </button>
      )}
    </motion.div>
  );
}

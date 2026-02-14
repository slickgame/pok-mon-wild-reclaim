import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Sparkles, Zap, RefreshCcw, ChevronDown, Info } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { TalentRegistry } from '@/components/data/TalentRegistry';
import { ItemRegistry } from '@/components/data/ItemRegistry';
import { formatTalentName } from '@/components/utils/talentUtils';
import { formatQuestCard } from '@/components/research/questUtils';
import talentTagIcons from '@/components/research/talentTagIcons.json';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { getSubmissionCount } from '@/systems/quests/questProgressTracker';
import '@/components/research/questCard.css';

const rarityIndicators = {
  common: { color: 'bg-slate-400', glow: 'shadow-[0_0_10px_rgba(148,163,184,0.3)]', label: '●' },
  uncommon: { color: 'bg-green-400', glow: 'shadow-[0_0_10px_rgba(74,222,128,0.4)]', label: '●●' },
  rare: { color: 'bg-purple-400', glow: 'shadow-[0_0_15px_rgba(192,132,252,0.5)]', label: '●●●' }
};

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

function renderTagIcon(tag) {
  const normalized = tag?.toString?.().toLowerCase?.();
  const icon = talentTagIcons[normalized];
  return icon ? `${icon} ${tag}` : tag;
}


function formatItemLabel(itemId) {
  if (!itemId) return 'Unknown item';
  const item = ItemRegistry[itemId];
  if (item?.name) return item.name;
  return itemId
    .toString()
    .replace(/_/g, ' ')
    .replace(/\b\w/g, (c) => c.toUpperCase());
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

export default function ResearchQuestCard({
  quest,
  onSubmit,
  onAccept,
  isAccepted = false,
  isAccepting = false,
  onReroll,
  timeLeft,
  rerollState,
  rerollCost,
  isRerolling,
  canAffordReroll,
  isRerollDisabled = false,
  onQuickView
}) {
  const [isHovered, setIsHovered] = useState(false);
  const [isPinned, setIsPinned] = useState(false);
  const isExpanded = isPinned || isHovered;
  const requirements = quest.requirements || {};
  const difficultyTier = quest.difficulty
    || (quest.rarity ? `${quest.rarity[0].toUpperCase()}${quest.rarity.slice(1)}` : 'Normal');
  const rarityKey = quest.rarity?.toLowerCase() || 'common';
  const rarityInfo = rarityIndicators[rarityKey] || rarityIndicators.common;
  const rewardGold = quest.reward?.gold ?? quest.rewardBase;
  const rewardItems = quest.reward?.items || [];
  const rewardCategoryLabel = quest.reward?.rewardCategoryLabel;
  const possibleRewards = quest.reward?.possibleRewards || [];
  const possibleRewardLabels = possibleRewards.map(formatItemLabel);
  const legacyDetails = quest.requirementType === 'nature' || quest.requirementType === 'iv';
  const requiredCount = quest.quantityRequired || quest.requiredCount || 1;
  const submissionCount = getSubmissionCount(quest.id);
  const hasDetails = legacyDetails
    || quest.nature
    || quest.level
    || (quest.ivConditions?.length || 0) > 0
    || (quest.talentConditions?.length || 0) > 0
    || requirements.nature
    || requirements.level
    || (requirements.ivConditions?.length || 0) > 0
    || (requirements.talentConditions?.length || 0) > 0;

  const primaryNature = quest.nature || requirements.nature;
  const primaryLevel = quest.level || requirements.level;
  const ivRules = (quest.ivConditions?.length ? quest.ivConditions : requirements.ivConditions) || [];
  const talentRules = (quest.talentConditions?.length ? quest.talentConditions : requirements.talentConditions) || [];


  const compactRequirementChips = [];
  if (requiredCount > 1) compactRequirementChips.push(`${requiredCount}x submit`);
  if (primaryNature) compactRequirementChips.push(`Nature: ${primaryNature}`);
  if (primaryLevel) compactRequirementChips.push(`Lv≥${primaryLevel}`);
  if (ivRules.length) compactRequirementChips.push(`IV +${ivRules.length}`);
  if (talentRules.length) compactRequirementChips.push(`Talents +${talentRules.length}`);
  if (quest.shinyRequired) compactRequirementChips.push('Shiny');
  if (quest.alphaRequired) compactRequirementChips.push('Alpha');
  if (quest.hiddenAbilityRequired) compactRequirementChips.push('Hidden Ability');
  if (quest.bondedRequired) compactRequirementChips.push('Bonded');

  const tierGlow = {
    Easy: 'border border-slate-500/40',
    Normal: 'border border-green-500/40',
    Hard: 'border border-purple-500/40 shadow-[0_0_18px_rgba(139,92,246,0.25)]',
    'Very Hard': 'border border-orange-500/40 shadow-[0_0_18px_rgba(249,115,22,0.25)]',
    Elite: 'border border-red-500/40 shadow-[0_0_18px_rgba(239,68,68,0.25)]',
    Legendary: 'border border-yellow-400/50 shadow-[0_0_24px_rgba(250,204,21,0.35)]'
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`glass rounded-xl p-4 sm:p-6 hover:border-indigo-500/50 transition-all quest-card ${tierGlow[difficultyTier] || ''} relative overflow-hidden`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className={`absolute top-0 left-0 w-full h-1 ${rarityInfo.color} ${rarityInfo.glow}`} />
      
      <div className="flex items-start justify-between mb-4 gap-2">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-2">
            <h3 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
              <Sparkles className="w-4 h-4 sm:w-5 sm:h-5 text-indigo-400 flex-shrink-0" />
              <span className="truncate">Research Request</span>
            </h3>
            <span className={`text-xs ${rarityInfo.color.replace('bg-', 'text-')} ${rarityInfo.glow} font-bold flex-shrink-0`}>
              {rarityInfo.label}
            </span>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <Badge className={`${tierColors[difficultyTier] || tierColors.Normal} text-xs`}>
              {difficultyTier}
            </Badge>
            {onQuickView && (
              <button
                type="button"
                onClick={() => onQuickView(quest)}
                className="text-xs text-indigo-400 hover:text-indigo-300 flex items-center gap-1"
              >
                <Info className="w-3 h-3" />
                Quick View
              </button>
            )}
          </div>
          <div className="mt-1 text-xs text-slate-400">
            {submissionCount}/{requiredCount} submitted
          </div>
        </div>
        {timeLeft && (
          <div className="text-xs text-slate-400 text-right flex-shrink-0">
            <p className="uppercase tracking-wide text-[10px] text-slate-500">Time Left</p>
            <p className="text-slate-200 text-xs sm:text-sm">{timeLeft}</p>
          </div>
        )}
      </div>

      <div className="space-y-3 mb-4">
        <div className="bg-slate-800/50 rounded-lg p-3 sm:p-4">
          <p className="text-xs sm:text-sm text-slate-400 mb-2">Required Pokémon:</p>
          <p className="text-lg sm:text-xl font-bold text-white truncate">{quest.species}</p>
          {compactRequirementChips.length > 0 && (
            <div className="mt-2 flex flex-wrap gap-1">
              {compactRequirementChips.slice(0, 3).map((chip) => (
                <Badge key={`${quest.id}-${chip}`} className="bg-indigo-900/40 text-indigo-200 border border-indigo-700/50 text-[10px]">
                  {chip}
                </Badge>
              ))}
              {compactRequirementChips.length > 3 && (
                <Badge className="bg-slate-800 text-slate-300 border border-slate-700 text-[10px]">
                  +{compactRequirementChips.length - 3} more
                </Badge>
              )}
            </div>
          )}

          {hasDetails && isExpanded && (
            <div className="mt-3 space-y-2 text-sm text-slate-300">
              {legacyDetails && quest.requirementType === 'iv' && quest.ivStat && quest.ivThreshold != null && !quest.ivConditions?.length && (
                <p><span className="text-slate-400">IV:</span> {statNames[quest.ivStat]} ≥ {quest.ivThreshold}</p>
              )}
              {primaryNature && (
                <p><span className="text-slate-400">Nature:</span> {primaryNature}</p>
              )}
              {primaryLevel && (
                <p><span className="text-slate-400">Level:</span> ≥ {primaryLevel}</p>
              )}
              {ivRules.map((iv) => (
                <p key={`${quest.id}-iv-${iv.stat}`}>
                  <span className="text-slate-400">IV:</span> {statNames[iv.stat] || iv.stat} ≥ {iv.min}
                </p>
              ))}
              {talentRules.map((condition, index) => (
                <p key={`${quest.id}-talent-${index}`}>
                  <span className="text-slate-400">Talent:</span> {renderTalentRequirement(condition)}
                </p>
              ))}
              {quest.shinyRequired && (
                <p><span className="text-slate-400">Shiny:</span> Required</p>
              )}
              {quest.alphaRequired && (
                <p><span className="text-slate-400">Alpha:</span> Required</p>
              )}
              {quest.hiddenAbilityRequired && (
                <p><span className="text-slate-400">Hidden Ability:</span> Required</p>
              )}
              {quest.bondedRequired && (
                <p><span className="text-slate-400">Bonded:</span> Required</p>
              )}
            </div>
          )}
        </div>

        <div className="flex items-center justify-between text-xs sm:text-sm">
          <span className="text-slate-400">Reward:</span>
          <span className="text-yellow-400 font-semibold flex items-center gap-1">
            <Zap className="w-3 h-3 sm:w-4 sm:h-4" />
            {rewardGold} gold
          </span>
        </div>
        {(quest.reward?.trustGain || quest.reward?.notesGain) && (
          <div className="text-xs text-slate-400">
            {quest.reward?.trustGain ? `Trust +${quest.reward.trustGain}` : ''}
            {quest.reward?.trustGain && quest.reward?.notesGain ? ' • ' : ''}
            {quest.reward?.notesGain ? `Notes +${quest.reward.notesGain}` : ''}
          </div>
        )}
        {rewardCategoryLabel && (
          <div className="text-xs text-cyan-300">
            Reward Category: <span className="text-cyan-200 font-semibold">{rewardCategoryLabel}</span>
          </div>
        )}
        {(possibleRewards.length > 0) && (
          <div className="text-xs text-slate-400">
            <span className="text-slate-500 uppercase tracking-wide text-[10px]">Possible Rewards</span>
            <p className="mt-1 text-slate-300">{possibleRewardLabels.slice(0, 6).join(', ')}</p>
          </div>
        )}

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
        {onAccept && (
          <Button
            onClick={() => onAccept(quest)}
            className="w-full bg-emerald-500/80 hover:bg-emerald-500 text-sm sm:text-base"
            disabled={isAccepted || isAccepting}
          >
            {isAccepted ? 'Accepted' : 'Accept Quest'}
          </Button>
        )}
        <Button
          onClick={() => onSubmit(quest)}
          className="w-full bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 text-sm sm:text-base"
        >
          Submit Pokémon
        </Button>

        {onReroll && (
          <Button
            onClick={() => onReroll(quest)}
            variant="outline"
            disabled={isRerollDisabled || isRerolling || (!rerollState?.freeLeft && !canAffordReroll)}
            className="w-full border-indigo-500/50 text-indigo-200 hover:bg-indigo-500/10 text-xs sm:text-sm"
          >
            <RefreshCcw className="w-3 h-3 sm:w-4 sm:h-4 mr-2" />
            <span className="truncate">
              {isRerollDisabled
                ? 'Cannot reroll'
                : rerollState?.freeLeft
                  ? `Free (${rerollState.freeLeft} left)`
                  : `${rerollCost}g`}
            </span>
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
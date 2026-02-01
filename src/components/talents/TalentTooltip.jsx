import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { TalentRegistry } from '@/data/TalentRegistry';
import { getTalentDescription, getTalentGradeColor } from '@/components/talents/TalentDescriptions';
import MoveTagBadges from '@/components/moves/MoveTagBadges';
import { formatTalentName, normalizeTalentGrade, resolveTalentKey } from '@/components/utils/talentUtils';
import { renderTalentTooltip } from '@/components/utils/tooltipUtils';

function resolveTalentData(talentKey) {
  if (!talentKey) return null;
  return TalentRegistry[talentKey]
    || Object.values(TalentRegistry).find((entry) => entry.name === talentKey);
}

export default function TalentTooltip({ talent, children }) {
  const talentKey = resolveTalentKey(talent);
  const talentData = resolveTalentData(talentKey);
  const gradeLabel = normalizeTalentGrade(
    typeof talent === 'object' ? (talent?.grade || 'Basic') : 'Basic'
  );
  const displayName = talentData?.name
    || (typeof talent === 'string'
      ? (talent.includes(' ') ? talent : formatTalentName(talent))
      : talent?.displayName || talent?.name || formatTalentName(resolveTalentKey(talent)));
  const description = talent?.description
    || getTalentDescription(talentData?.id || talentKey, gradeLabel);
  const gradeColorClass = getTalentGradeColor(gradeLabel);
  const tooltipText = renderTalentTooltip(talentKey || talentData?.id, gradeLabel);
  const tags = talentData?.tags || talentData?.tagsAffected || [];

  return (
    <TooltipProvider delayDuration={200}>
      <Tooltip>
        <TooltipTrigger asChild>
          <span className="inline-flex items-center" tabIndex={0}>
            {children}
          </span>
        </TooltipTrigger>
        <TooltipContent className="max-w-xs border border-white/10 bg-slate-900/95 p-3 text-slate-100 shadow-lg">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="text-sm font-semibold text-white">{displayName}</span>
              <Badge className={`${gradeColorClass} text-[10px]`}>
                {gradeLabel}
              </Badge>
            </div>
            <p className="text-xs leading-relaxed text-slate-200">{description}</p>
            {tags.length > 0 && (
              <MoveTagBadges tags={tags} />
            )}
            <p className="text-[10px] text-slate-400">{tooltipText}</p>
            <div className="border-t border-white/10 pt-2 text-[10px] text-slate-300">
              <p className="font-semibold text-slate-200">About Talents</p>
              <p>Talents provide unique battle effects and synergies.</p>
              <p><span className="font-semibold text-slate-200">Grade:</span> Basic → Rare → Epic → Diamond</p>
            </div>
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

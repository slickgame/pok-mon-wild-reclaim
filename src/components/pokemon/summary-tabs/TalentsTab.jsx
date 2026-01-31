import React from 'react';
import { Star, Sparkles } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import TalentTooltip from '@/components/talents/TalentTooltip';
import { TalentRegistry } from '@/components/data/TalentRegistry';
import { getTalentDescription, getTalentGradeColor } from '@/components/talents/TalentDescriptions';
import { formatTalentName, normalizeTalentGrade, resolveTalentKey } from '@/components/utils/talentUtils';

const tagStyles = {
  Drain: 'bg-emerald-500/20 text-emerald-200 border border-emerald-400/30',
  Spore: 'bg-lime-500/20 text-lime-200 border border-lime-400/30',
  Powder: 'bg-lime-400/20 text-lime-200 border border-lime-300/30',
  Healing: 'bg-green-500/20 text-green-200 border border-green-400/30',
  Status: 'bg-yellow-500/20 text-yellow-200 border border-yellow-400/30',
  Terrain: 'bg-teal-500/20 text-teal-200 border border-teal-400/30'
};

const getTagClass = (tag) => tagStyles[tag] || 'bg-slate-700/50 text-slate-200 border border-slate-500/30';

export default function TalentsTab({ pokemon }) {
  const talentList = Array.isArray(pokemon.talents)
    ? pokemon.talents
    : pokemon.talents
      ? [pokemon.talents]
      : [];

  if (talentList.length === 0) {
    return (
      <div className="glass rounded-xl p-12 text-center">
        <Sparkles className="w-16 h-16 mx-auto mb-4 text-slate-600" />
        <h3 className="text-lg font-semibold text-white mb-2">No Talents</h3>
        <p className="text-slate-400">This Pokémon hasn't unlocked any talents yet.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="glass rounded-xl p-4">
        <div className="flex items-center gap-2 mb-4">
          <Star className="w-4 h-4 text-amber-400" />
          <h3 className="text-sm font-semibold text-white">Active Talents</h3>
        </div>
        
        <div className="space-y-3">
          {talentList.map((talent, index) => {
            const talentId = resolveTalentKey(talent);
            const talentData = TalentRegistry[talentId]
              || Object.values(TalentRegistry).find((entry) => entry.name === talentId);
            const gradeLabel = normalizeTalentGrade(
              typeof talent === 'object' ? (talent.grade || 'Basic') : 'Basic'
            );
            const displayName = talentData?.name
              || talent?.displayName
              || (talentId
                ? (talentId.includes(' ') ? talentId : formatTalentName(talentId))
                : 'Unknown Talent');
            const description = typeof talent === 'object' && typeof talent.description === 'string'
              ? talent.description
              : getTalentDescription(talentId, gradeLabel);
            const gradeColorClass = getTalentGradeColor(gradeLabel);
            const tagsAffected = talentData?.tagsAffected || [];
            
            return (
              <div key={index} className="glass rounded-lg p-4 hover:bg-white/5 transition-colors">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-indigo-400" />
                    <TalentTooltip talent={talent}>
                      <h4 className="font-semibold text-white">{displayName}</h4>
                    </TalentTooltip>
                  </div>
                  <Badge className={gradeColorClass}>
                    {gradeLabel}
                  </Badge>
                </div>
                <p className="text-sm text-slate-300 leading-relaxed italic">{description}</p>
                {tagsAffected.length > 0 && (
                  <div className="mt-2 flex flex-wrap gap-1">
                    {tagsAffected.map((tag) => (
                      <span
                        key={tag}
                        className={`text-[0.65rem] px-2 py-0.5 rounded-full uppercase tracking-wide ${getTagClass(tag)}`}
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      <div className="glass rounded-xl p-4">
        <h4 className="text-xs font-semibold text-white mb-2">About Talents</h4>
        <div className="space-y-1 text-xs text-slate-400">
          <p><strong className="text-slate-300">Talents</strong> provide unique battle effects and synergies.</p>
          <p><strong className="text-slate-300">Grade:</strong> Basic → Rare → Epic</p>
          <p>Higher grades unlock more powerful effects.</p>
        </div>
      </div>
    </div>
  );
}

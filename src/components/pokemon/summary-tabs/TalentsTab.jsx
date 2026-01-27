import React from 'react';
import { Star, Sparkles } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { TalentRegistry } from '@/data/TalentRegistry';
import { getTalentGradeColor } from '@/components/talents/TalentDescriptions';
import { formatTalentName } from '@/components/utils/talentUtils';

export default function TalentsTab({ pokemon }) {
  if (!pokemon.talents || pokemon.talents.length === 0) {
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
          {pokemon.talents.map((talent, index) => {
            const talentId = talent.id || talent.name;
            const talentData = TalentRegistry[talentId];
            const gradeKey = (talent.grade || 'basic').toLowerCase();
            const gradeMap = {
              basic: 'Basic',
              rare: 'Rare',
              epic: 'Epic',
              bronze: 'Basic',
              silver: 'Rare',
              gold: 'Epic'
            };
            const gradeLabel = gradeMap[gradeKey] || 'Basic';
            const displayName = talentData?.name || formatTalentName(talentId);
            const description = talentData?.grades?.[gradeLabel]?.description || 'No description';
            const gradeColorClass = getTalentGradeColor(gradeLabel);
            
            return (
              <div key={index} className="glass rounded-lg p-4 hover:bg-white/5 transition-colors">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-indigo-400" />
                    <h4 className="font-semibold text-white">{displayName}</h4>
                  </div>
                  <Badge className={gradeColorClass}>
                    {gradeLabel}
                  </Badge>
                </div>
                <p className="text-sm text-slate-300 leading-relaxed italic">{description}</p>
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

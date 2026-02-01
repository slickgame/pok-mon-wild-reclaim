import React from 'react';
import { motion } from 'framer-motion';
import { Sparkles } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { getTalentDescription } from '@/components/talents/TalentDescriptions';
import TalentTooltip from '@/components/talents/TalentTooltip';
import MoveTagBadges from '@/components/moves/MoveTagBadges';
import { formatTalentName, normalizeTalentGrade, resolveTalentKey } from '@/components/utils/talentUtils';
import { TalentRegistry } from '@/components/data/TalentRegistry';

const gradeColors = {
  Basic: 'bg-amber-700/30 text-amber-400 border-amber-600/50',
  Rare: 'bg-slate-400/30 text-slate-200 border-slate-400/50',
  Epic: 'bg-yellow-500/30 text-yellow-300 border-yellow-500/50',
  Diamond: 'bg-cyan-400/30 text-cyan-200 border-cyan-400/50',
  // Legacy support
  Bronze: 'bg-amber-700/30 text-amber-400 border-amber-600/50',
  Silver: 'bg-slate-400/30 text-slate-200 border-slate-400/50',
  Gold: 'bg-yellow-500/30 text-yellow-300 border-yellow-500/50',
};

const resolveTalentData = (talent) => {
  console.log('🔍 TalentDisplay: Resolving talent:', talent);
  
  const talentKey = resolveTalentKey(talent);
  console.log('🔑 TalentDisplay: Resolved key:', talentKey);
  
  if (!talentKey) {
    console.warn('⚠️ TalentDisplay: No talent key found');
    return null;
  }
  
  // Try direct lookup
  if (TalentRegistry[talentKey]) {
    console.log('✅ TalentDisplay: Found via direct lookup:', TalentRegistry[talentKey]);
    return TalentRegistry[talentKey];
  }
  
  // Try case-insensitive lookup by key
  const lowerKey = talentKey.toLowerCase();
  const registryKey = Object.keys(TalentRegistry).find(k => k.toLowerCase() === lowerKey);
  if (registryKey) {
    console.log('✅ TalentDisplay: Found via case-insensitive lookup:', TalentRegistry[registryKey]);
    return TalentRegistry[registryKey];
  }
  
  // Try by name match
  const byName = Object.values(TalentRegistry).find((entry) => 
    entry.name?.toLowerCase() === talentKey.toLowerCase()
  );
  
  if (byName) {
    console.log('✅ TalentDisplay: Found via name match:', byName);
    return byName;
  }
  
  console.error('❌ TalentDisplay: Failed to resolve talent. Key:', talentKey, 'Available keys:', Object.keys(TalentRegistry).slice(0, 10));
  return null;
};

const formatTalentDisplayName = (talent, talentData) => {
  if (talentData?.name) return talentData.name;
  const rawName = resolveTalentKey(talent);
  if (!rawName) return 'Unknown Talent';
  return rawName.includes(' ') ? rawName : formatTalentName(rawName);
};

export default function TalentDisplay({ talents, showDescription = false, compact = false }) {
  if (!talents || talents.length === 0) return null;

  if (compact) {
    return (
      <div className="flex flex-wrap gap-1">
        {talents.map((talent, idx) => {
          const normalizedGrade = normalizeTalentGrade(talent.grade);
          const talentData = resolveTalentData(talent);
          const displayName = formatTalentDisplayName(talent, talentData);
          return (
            <TalentTooltip key={idx} talent={talent}>
              <Badge className={`text-xs ${gradeColors[normalizedGrade]}`}>
                {displayName}
              </Badge>
            </TalentTooltip>
          );
        })}
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {talents.map((talent, idx) => {
        const normalizedGrade = normalizeTalentGrade(talent.grade);
        const talentData = resolveTalentData(talent);
        const displayName = formatTalentDisplayName(talent, talentData);
        const description = talent?.description
          || (talentData
            ? getTalentDescription(talentData.id, normalizedGrade)
            : getTalentDescription(resolveTalentKey(talent), normalizedGrade));
        const tagsAffected = talentData?.tags || talentData?.tagsAffected || [];

        return (
          <motion.div
            key={idx}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: idx * 0.1 }}
            className="glass rounded-lg p-3"
          >
            <div className="flex items-start gap-3">
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                gradeColors[normalizedGrade]?.replace('text-', 'bg-').replace('/30', '/20')
              }`}>
                <Sparkles className="w-4 h-4" />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <TalentTooltip talent={talent}>
                    <span className="text-white font-semibold text-sm">{displayName}</span>
                  </TalentTooltip>
                  <Badge className={`text-xs ${gradeColors[normalizedGrade]}`}>
                    {normalizedGrade}
                  </Badge>
                </div>
                {showDescription && description && (
                  <p className="text-xs text-slate-400 italic">
                    {typeof description === 'string' ? description : JSON.stringify(description)}
                  </p>
                )}
                {tagsAffected.length > 0 && (
                  <MoveTagBadges tags={tagsAffected} className="mt-2" />
                )}
              </div>
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}

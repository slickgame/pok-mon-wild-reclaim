// Talent descriptions by grade
import { TalentRegistry } from '@/data/TalentRegistry';
import { normalizeTalentGrade } from '@/components/utils/talentUtils';

export function getTalentDescription(talentId, grade = 'Basic') {
  const talent = TalentRegistry[talentId];
  if (!talent) return "Unknown talent.";

  const normalizedGrade = normalizeTalentGrade(grade);
  const gradeData = talent.grades?.[normalizedGrade];

  if (gradeData?.description) {
    return gradeData.description;
  }

  const fallbackGrade = Object.values(talent.grades || {})[0];
  return fallbackGrade?.description || "Unknown talent.";
}

export function getTalentGradeColor(grade) {
  const normalizedGrade = normalizeTalentGrade(grade);

  switch (normalizedGrade) {
    case 'Basic': return 'text-amber-600 bg-amber-600/10';
    case 'Rare': return 'text-slate-400 bg-slate-400/10';
    case 'Epic': return 'text-yellow-400 bg-yellow-400/10';
    default: return 'text-slate-500 bg-slate-500/10';
  }
}

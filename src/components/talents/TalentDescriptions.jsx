// Talent descriptions by grade
import CaterpieTalents from './caterpieTalents';
import { TalentRegistry } from '@/components/data/TalentRegistry';
import { normalizeTalentGrade } from '@/components/utils/talentUtils';

export function getTalentDescription(talentId, grade = 'Basic') {
  const normalizedGrade = normalizeTalentGrade(grade);
  const registryTalent = TalentRegistry[talentId];

  if (registryTalent) {
    return registryTalent.grades?.[normalizedGrade]?.description || 'Unknown talent.';
  }

  const talent = CaterpieTalents[talentId];
  if (!talent) return "Unknown talent.";

  const gradeData = talent.grades[normalizedGrade];
  if (!gradeData) return talent.description;

  // Build dynamic description based on grade values
  let description = talent.description;

  switch (talentId) {
    case 'silkenGrip':
      description = `${Math.round(gradeData.chance * 100)}% chance on contact to lower target's Speed by ${gradeData.speedDrop}`;
      if (gradeData.evasionDrop > 0) {
        description += ` and Evasion by ${gradeData.evasionDrop}`;
      }
      break;

    case 'moltingDefense':
      description = `${Math.round(gradeData.chance * 100)}% chance when hit to boost Defense by ${gradeData.defBoost}`;
      break;

    case 'instinctiveSurvival':
      description = `${Math.round(gradeData.chance * 100)}% chance to survive a fatal hit with 1 HP when at full health`;
      break;

    case 'threadAmbush':
      description = `Gain +${gradeData.priorityBoost} priority when opponent's Speed drops`;
      if (gradeData.flinchChance > 0) {
        description += `. ${Math.round(gradeData.flinchChance * 100)}% chance to flinch target`;
      }
      break;

    case 'scavengerInstinct':
      description = `Gain ${Math.round(gradeData.xpBonus * 100)}% bonus XP on defeat`;
      if (gradeData.guaranteedDrop) {
        description += `. Guaranteed item drop`;
      }
      break;

    case 'naturesCloak':
      description = `+${Math.round(gradeData.evasionBoost * 100)}% evasion in forest zones`;
      if (gradeData.nullifyFirstHit) {
        description += `. Nullify first hit received`;
      }
      break;

    case 'photosensitiveGrowth':
      if (gradeData.hpRegen > 0) {
        description = `Regenerate ${Math.round(gradeData.hpRegen * 100)}% HP per turn in daylight`;
      }
      if (gradeData.spDefBoost > 0) {
        description += `. +${gradeData.spDefBoost} SpDef in sunlight`;
      }
      break;

    case 'earlyInstinct':
      description = `Learn moves ${gradeData.levelsEarly} level(s) earlier`;
      if (gradeData.bonusMove) {
        description += `. Can learn ${gradeData.bonusMove}`;
      }
      break;

    case 'tangleReflexes':
      description = `Using String Shot boosts Speed by ${gradeData.speedBoost}`;
      if (gradeData.evasionBoost > 0) {
        description += ` and Evasion by ${gradeData.evasionBoost}`;
      }
      if (gradeData.hpRegen > 0) {
        description += `. Heal ${Math.round(gradeData.hpRegen * 100)}% HP`;
      }
      break;

    case 'adaptiveShell':
      description = `After 3 turns: +${gradeData.defBoost} Defense`;
      if (gradeData.spDefBoost > 0) {
        description += `, +${gradeData.spDefBoost} SpDefense`;
      }
      if (gradeData.critImmune) {
        description += `. Cannot be critically hit`;
      }
      break;

    default:
      return talent.description;
  }

  return description;
}

export function getTalentGradeColor(grade) {
  switch (grade) {
    case 'Basic': return 'text-amber-600 bg-amber-600/10';
    case 'Rare': return 'text-slate-400 bg-slate-400/10';
    case 'Epic': return 'text-yellow-400 bg-yellow-400/10';
    case 'Bronze': return 'text-amber-600 bg-amber-600/10';
    case 'Silver': return 'text-slate-400 bg-slate-400/10';
    case 'Gold': return 'text-yellow-400 bg-yellow-400/10';
    default: return 'text-slate-500 bg-slate-500/10';
  }
}

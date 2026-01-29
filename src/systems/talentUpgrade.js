import { getNextGrade, getPrevGrade } from './TalentGrades';
import { normalizeTalentGrade } from '@/components/utils/talentUtils';

export function upgradeTalent(pokemon, talentIndex, method) {
  const talent = pokemon?.talents?.[talentIndex];

  if (!talent) return { success: false, reason: 'Invalid talent.' };

  const currentGrade = normalizeTalentGrade(talent.grade);
  talent.grade = currentGrade;

  if (currentGrade === 'Diamond') {
    return { success: false, reason: 'Talent already max grade.' };
  }

  if (method === 'bond') {
    if (pokemon.usedBondUpgrade) {
      return { success: false, reason: 'Bond already used.' };
    }

    if (pokemon.friendship < 255) {
      return { success: false, reason: 'Friendship too low.' };
    }

    talent.grade = getNextGrade(currentGrade);
    pokemon.usedBondUpgrade = true;

    return {
      success: true,
      result: 'upgrade',
      grade: talent.grade
    };
  }

  if (method === 'scroll') {
    const roll = Math.random();

    if (roll < 0.7) {
      talent.grade = getNextGrade(currentGrade);
      return { success: true, result: 'upgrade', grade: talent.grade };
    }

    if (roll < 0.95) {
      return { success: true, result: 'nochange', grade: talent.grade };
    }

    talent.grade = getPrevGrade(currentGrade);
    return { success: true, result: 'downgrade', grade: talent.grade };
  }

  return { success: false, reason: 'Unknown upgrade method.' };
}

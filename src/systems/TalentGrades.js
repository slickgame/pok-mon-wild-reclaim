export const TalentGrades = ['Basic', 'Rare', 'Epic', 'Diamond'];

export function getNextGrade(current) {
  const idx = TalentGrades.indexOf(current);
  return TalentGrades[idx + 1] || null;
}

export function getPrevGrade(current) {
  const idx = TalentGrades.indexOf(current);
  return TalentGrades[idx - 1] || current;
}

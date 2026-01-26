/**
 * Format talent ID to display name
 * Converts camelCase to Title Case
 * @param {string} id - Talent ID (e.g., "silkenGrip")
 * @returns {string} Formatted name (e.g., "Silken Grip")
 */
export function formatTalentName(id) {
  if (!id) return "Unknown Talent";
  
  return id
    .replace(/([A-Z])/g, " $1")
    .replace(/^./, c => c.toUpperCase())
    .trim();
}

/**
 * Normalize talent grade from old to new naming
 * @param {string} grade - Grade name (Bronze/Silver/Gold or Basic/Rare/Epic)
 * @returns {string} Normalized grade (Basic/Rare/Epic)
 */
export function normalizeTalentGrade(grade) {
  const gradeMap = {
    'bronze': 'Basic',
    'silver': 'Rare',
    'gold': 'Epic',
    'basic': 'Basic',
    'rare': 'Rare',
    'epic': 'Epic',
    'diamond': 'Diamond'
  };
  
  return gradeMap[grade?.toLowerCase()] || grade || 'Basic';
}
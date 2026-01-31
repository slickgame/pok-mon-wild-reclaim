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

/**
 * Resolve a talent key from various talent shapes.
 * @param {string|object} talent
 * @returns {string|null}
 */
export function resolveTalentKey(talent) {
  if (!talent) return null;
  if (typeof talent === 'string') return talent.trim();
  const directCandidates = [
    talent.id,
    talent.talentId,
    talent.talentID,
    talent.talent_id,
    talent.talentKey,
    talent.talentName,
    talent.key,
    talent.slug,
    talent.name,
    talent.displayName,
    talent.title,
    talent.label,
    talent.value
  ];
  for (const candidate of directCandidates) {
    if (!candidate) continue;
    return typeof candidate === 'string' ? candidate.trim() : resolveTalentKey(candidate);
  }
  const nested = talent.talent || talent.data || talent.definition || talent.details || talent.info;
  if (nested) return resolveTalentKey(nested);
  return null;
}

import { TalentRegistry } from '@/data/TalentRegistry';
import { formatTalentName, normalizeTalentGrade, resolveTalentKey } from '@/components/utils/talentUtils';

const normalizeTag = (tag) => `${tag || ''}`.trim().toLowerCase();

const resolveTalentEntry = (talentEntry) => {
  if (!talentEntry) return null;
  const talentKey = resolveTalentKey(talentEntry);
  const talentDefinition = TalentRegistry[talentKey]
    || Object.values(TalentRegistry).find((entry) => entry.name === talentKey);
  if (!talentDefinition) return null;
  const grade = typeof talentEntry === 'object' ? normalizeTalentGrade(talentEntry.grade) : undefined;
  return {
    id: talentDefinition.id || talentKey,
    name: talentDefinition.name || formatTalentName(talentKey),
    grade,
    tagsAffected: talentDefinition.tagsAffected || [],
  };
};

const resolveTalentTags = (talentEntry) => {
  if (!talentEntry) return [];
  if (talentEntry.tagsAffected) return talentEntry.tagsAffected;
  const resolved = resolveTalentEntry(talentEntry);
  return resolved?.tagsAffected || [];
};

/**
 * Determine if a move's tags match a talent's affected tags.
 * @param {object} move
 * @param {object|string} talent
 * @returns {boolean}
 */
export function moveMatchesTalent(move, talent) {
  if (!move?.tags?.length || !talent) return false;
  const talentTags = resolveTalentTags(talent);
  if (!talentTags.length) return false;
  const normalizedMoveTags = move.tags.map((tag) => normalizeTag(tag));
  return talentTags.some((tag) => normalizedMoveTags.includes(normalizeTag(tag)));
}

/**
 * Get matching talent display names for a move.
 * @param {object} move
 * @param {Array} talents
 * @returns {Array<{name: string, grade?: string, id?: string}>}
 */
export function getMatchingTalents(move, talents = []) {
  if (!move?.tags?.length || !Array.isArray(talents)) return [];
  return talents
    .map((talentEntry) => resolveTalentEntry(talentEntry))
    .filter((entry) => entry && moveMatchesTalent(move, entry))
    .map((entry) => ({
      id: entry.id,
      name: entry.name,
      grade: entry.grade,
    }));
}

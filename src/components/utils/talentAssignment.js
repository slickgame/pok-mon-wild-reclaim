import { TalentRegistry } from '@/components/data/TalentRegistry';
import { normalizeTalentGrade, resolveTalentKey } from '@/components/utils/talentUtils';

const DEFAULT_TALENT_COUNT_WEIGHTS = { 0: 0.2, 1: 0.5, 2: 0.25, 3: 0.05 };
const DEFAULT_GRADE_WEIGHTS = { basic: 0.7, rare: 0.25, epic: 0.05 };

export function weightedRoll(weights) {
  const entries = Object.entries(weights);
  const total = entries.reduce((sum, [, value]) => sum + value, 0);
  if (!total) return entries[0]?.[0];
  let roll = Math.random() * total;
  for (const [key, value] of entries) {
    roll -= value;
    if (roll <= 0) return key;
  }
  return entries[entries.length - 1]?.[0];
}

export function shuffleArray(array) {
  const copy = [...array];
  for (let i = copy.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

const normalizeExistingTalent = (entry) => {
  const id = resolveTalentKey(entry);
  const talentData = TalentRegistry[id];
  const grade = normalizeTalentGrade(entry?.grade || 'Basic');
  return {
    id,
    name: talentData?.name || entry?.name || id,
    grade,
    description: entry?.description || talentData?.grades?.[grade]?.description || null
  };
};

export function assignRandomTalents(pokemon, options = {}) {
  if (!pokemon) return [];
  const pool = typeof pokemon.getTalentPool === 'function'
    ? pokemon.getTalentPool()
    : pokemon.talentPool || [];
  if (!Array.isArray(pool) || pool.length === 0) return [];

  const existingTalents = options.existingTalents || pokemon.talents || [];
  const normalizedExisting = existingTalents.map(normalizeExistingTalent);
  const existingIds = new Set(normalizedExisting.map((talent) => talent.id));

  const countKey = weightedRoll(options.talentCountWeights || DEFAULT_TALENT_COUNT_WEIGHTS);
  const desiredCount = Math.min(options.maxTalents ?? 3, Number(countKey));

  if (normalizedExisting.length >= desiredCount) {
    return normalizedExisting.slice(0, desiredCount);
  }

  const available = pool.filter((talentId) => !existingIds.has(talentId));
  const shuffled = shuffleArray(available);
  const needed = desiredCount - normalizedExisting.length;

  const newTalents = shuffled.slice(0, needed).map((talentId) => {
    const talentData = TalentRegistry[talentId];
    const gradeKey = weightedRoll(options.gradeWeights || DEFAULT_GRADE_WEIGHTS);
    const grade = normalizeTalentGrade(gradeKey);
    return {
      id: talentId,
      name: talentData?.name || talentId,
      grade,
      description: talentData?.grades?.[grade]?.description || null
    };
  });

  return [...normalizedExisting, ...newTalents];
}

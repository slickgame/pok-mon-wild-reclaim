export const QUEST_VALUE_VERSION = 1;

export const QUEST_VALUE_TUNING = {
  baseScore: 1,
  nature: {
    enabled: true,
    weight: 1
  },
  level: {
    thresholds: [
      { min: 20, weight: 1 },
      { min: 35, weight: 1 }
    ]
  },
  iv: {
    defaultWeight: 1,
    highThresholds: [
      { min: 21, weight: 2 }
    ]
  },
  talents: {
    gradeWeights: {
      Basic: 1,
      Rare: 2,
      Epic: 3,
      Diamond: 4
    },
    multiCountBonus: [
      { min: 4, weight: 4 },
      { min: 3, weight: 3 },
      { min: 2, weight: 2 }
    ]
  },
  specialFlags: {
    perFlagWeight: 2
  }
};

function getIvWeight(ivCondition) {
  if (!ivCondition) return 0;
  const highMatch = QUEST_VALUE_TUNING.iv.highThresholds
    .filter((entry) => (ivCondition.min || 0) >= entry.min)
    .sort((a, b) => b.min - a.min)[0];
  return highMatch?.weight ?? QUEST_VALUE_TUNING.iv.defaultWeight;
}

function getTalentCountBonus(count = 0) {
  const match = QUEST_VALUE_TUNING.talents.multiCountBonus
    .find((entry) => count >= entry.min);
  return match?.weight || 0;
}

export function calculateQuestValue(requirements = {}, tuning = QUEST_VALUE_TUNING) {
  const {
    nature,
    level,
    ivConditions = [],
    talentConditions = [],
    specialFlags = {}
  } = requirements;

  let score = tuning.baseScore || 0;

  if (tuning.nature?.enabled && nature) {
    score += tuning.nature.weight || 0;
  }

  if (level && Array.isArray(tuning.level?.thresholds)) {
    tuning.level.thresholds.forEach((entry) => {
      if (level >= entry.min) {
        score += entry.weight || 0;
      }
    });
  }

  if (Array.isArray(ivConditions)) {
    ivConditions.forEach((ivCondition) => {
      score += getIvWeight(ivCondition);
    });
  }

  if (Array.isArray(talentConditions)) {
    talentConditions.forEach((condition) => {
      (condition.grades || []).forEach((grade) => {
        score += tuning.talents?.gradeWeights?.[grade] || 0;
      });
      score += getTalentCountBonus(condition.count || 0);
    });
  }

  const enabledSpecialCount = Object.values(specialFlags).filter(Boolean).length;
  if (enabledSpecialCount > 0) {
    score += enabledSpecialCount * (tuning.specialFlags?.perFlagWeight || 0);
  }

  return score;
}

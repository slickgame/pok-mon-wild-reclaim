export const TIER_TARGETS = {
  Easy: 0.20,
  Normal: 0.35,
  Hard: 0.25,
  'Very Hard': 0.10,
  Elite: 0.07,
  Legendary: 0.03
};

const ALL_TIERS = ['Easy', 'Normal', 'Hard', 'Very Hard', 'Elite', 'Legendary'];

const DEFAULT_ANALYTICS = {
  scope: 'global',
  generatedTotal: 0,
  generatedByTier: Object.fromEntries(ALL_TIERS.map((tier) => [tier, 0])),
  completedByTier: Object.fromEntries(ALL_TIERS.map((tier) => [tier, 0])),
  expiredByTier: Object.fromEntries(ALL_TIERS.map((tier) => [tier, 0])),
  rerolledByTier: Object.fromEntries(ALL_TIERS.map((tier) => [tier, 0])),
  updatedAt: new Date().toISOString()
};

export async function getGlobalResearchAnalytics(base44) {
  try {
    const existing = await base44.entities.ResearchQuestAnalytics.filter({ scope: 'global' });
    if (existing?.length) {
      return normalizeAnalytics(existing[0]);
    }

    const created = await base44.entities.ResearchQuestAnalytics.create(DEFAULT_ANALYTICS);
    return normalizeAnalytics(created);
  } catch (error) {
    console.warn('ResearchQuestAnalytics unavailable, using in-memory fallback.', error);
    return normalizeAnalytics(DEFAULT_ANALYTICS);
  }
}

export async function saveGlobalResearchAnalytics(base44, analytics) {
  try {
    if (!analytics?.id) {
      const existing = await base44.entities.ResearchQuestAnalytics.filter({ scope: 'global' });
      if (existing?.length) {
        analytics.id = existing[0].id;
      }
    }

    const payload = {
      ...DEFAULT_ANALYTICS,
      ...analytics,
      updatedAt: new Date().toISOString()
    };

    if (payload.id) {
      await base44.entities.ResearchQuestAnalytics.update(payload.id, payload);
      return payload;
    }

    const created = await base44.entities.ResearchQuestAnalytics.create(payload);
    return created;
  } catch (error) {
    console.warn('Failed to persist research analytics', error);
    return analytics;
  }
}

function normalizeAnalytics(analytics) {
  const safe = { ...DEFAULT_ANALYTICS, ...(analytics || {}) };
  safe.generatedByTier = { ...DEFAULT_ANALYTICS.generatedByTier, ...(analytics?.generatedByTier || {}) };
  safe.completedByTier = { ...DEFAULT_ANALYTICS.completedByTier, ...(analytics?.completedByTier || {}) };
  safe.expiredByTier = { ...DEFAULT_ANALYTICS.expiredByTier, ...(analytics?.expiredByTier || {}) };
  safe.rerolledByTier = { ...DEFAULT_ANALYTICS.rerolledByTier, ...(analytics?.rerolledByTier || {}) };
  return safe;
}

export function updateAnalyticsForGenerated(analytics, generatedTiers = []) {
  const next = normalizeAnalytics(analytics);
  generatedTiers.forEach((tier) => {
    if (!next.generatedByTier[tier] && next.generatedByTier[tier] !== 0) return;
    next.generatedByTier[tier] += 1;
    next.generatedTotal += 1;
  });
  next.updatedAt = new Date().toISOString();
  return next;
}

export function updateAnalyticsForOutcome(analytics, tier, outcome) {
  const next = normalizeAnalytics(analytics);
  if (!tier) return next;

  if (outcome === 'completed') {
    next.completedByTier[tier] = (next.completedByTier[tier] || 0) + 1;
  } else if (outcome === 'expired') {
    next.expiredByTier[tier] = (next.expiredByTier[tier] || 0) + 1;
  } else if (outcome === 'rerolled') {
    next.rerolledByTier[tier] = (next.rerolledByTier[tier] || 0) + 1;
  }

  next.updatedAt = new Date().toISOString();
  return next;
}

function isTierLocked(tier, progression = {}) {
  const chapter = progression.storyChapter || 0;
  const trust = progression.mapleTrust || 0;
  const avgLevel = progression.avgPartyLevel || 1;

  if (tier === 'Legendary') {
    return chapter < 4 || trust < 70 || avgLevel < 32;
  }

  if (tier === 'Elite') {
    return chapter < 2 || trust < 40 || avgLevel < 18;
  }

  if (tier === 'Very Hard') {
    return chapter < 1 || trust < 20 || avgLevel < 12;
  }

  return false;
}

function expiryPressurePenalty(analytics, tier) {
  const generated = analytics.generatedByTier?.[tier] || 0;
  if (generated <= 0) return 0;
  const expired = analytics.expiredByTier?.[tier] || 0;
  const ratio = expired / generated;

  if (ratio > 0.45) return 4;
  if (ratio > 0.30) return 2;
  if (ratio > 0.20) return 1;
  return 0;
}

export function chooseTierByStrictController({ analytics, progression }) {
  const normalized = normalizeAnalytics(analytics);
  const nextTotal = Math.max(1, (normalized.generatedTotal || 0) + 1);

  let bestTier = 'Normal';
  let bestScore = -Infinity;

  ALL_TIERS.forEach((tier) => {
    if (isTierLocked(tier, progression)) {
      return;
    }

    const targetCount = (TIER_TARGETS[tier] || 0) * nextTotal;
    const current = normalized.generatedByTier?.[tier] || 0;
    const deficit = targetCount - current;
    const pressurePenalty = expiryPressurePenalty(normalized, tier);
    const controllerScore = deficit - pressurePenalty;

    if (controllerScore > bestScore) {
      bestScore = controllerScore;
      bestTier = tier;
    }
  });

  return bestTier;
}

export function getProgressionFactor({ storyChapter = 0, mapleTrust = 0, avgPartyLevel = 1 }) {
  const storyPart = Math.min(storyChapter / 5, 1);
  const trustPart = Math.min(mapleTrust / 100, 1);
  const levelPart = Math.min(avgPartyLevel / 60, 1);
  return (storyPart * 0.45) + (trustPart * 0.35) + (levelPart * 0.20);
}

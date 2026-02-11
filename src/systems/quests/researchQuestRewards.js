import { QUEST_VALUE_VERSION } from '@/systems/quests/researchQuestTuning';

const ITEM_POOLS = {
  general: {
    Easy: [
      { itemId: 'poke_ball', weight: 6, quantity: [1, 2] },
      { itemId: 'potion', weight: 6, quantity: [1, 2] },
      { itemId: 'antidote', weight: 3, quantity: [1, 1] }
    ],
    Normal: [
      { itemId: 'great_ball', weight: 5, quantity: [1, 2] },
      { itemId: 'super_potion', weight: 4, quantity: [1, 2] },
      { itemId: 'revive', weight: 2, quantity: [1, 1] }
    ],
    Hard: [
      { itemId: 'ultra_ball', weight: 4, quantity: [1, 2] },
      { itemId: 'hyper_potion', weight: 4, quantity: [1, 2] },
      { itemId: 'rare_candy', weight: 2, quantity: [1, 1] }
    ],
    'Very Hard': [
      { itemId: 'max_potion', weight: 4, quantity: [1, 2] },
      { itemId: 'max_revive', weight: 2, quantity: [1, 1] },
      { itemId: 'ability_capsule', weight: 1, quantity: [1, 1] }
    ],
    Elite: [
      { itemId: 'ability_patch', weight: 2, quantity: [1, 1] },
      { itemId: 'pp_max', weight: 3, quantity: [1, 1] },
      { itemId: 'choice_band', weight: 1, quantity: [1, 1] }
    ],
    Legendary: [
      { itemId: 'master_ball', weight: 1, quantity: [1, 1] },
      { itemId: 'leftovers', weight: 2, quantity: [1, 1] },
      { itemId: 'ability_patch', weight: 3, quantity: [1, 1] }
    ]
  },
  iv: {
    Easy: [{ itemId: 'hp_up', weight: 3, quantity: [1, 1] }, { itemId: 'protein', weight: 3, quantity: [1, 1] }],
    Normal: [{ itemId: 'calcium', weight: 3, quantity: [1, 1] }, { itemId: 'carbos', weight: 3, quantity: [1, 1] }],
    Hard: [{ itemId: 'zinc', weight: 3, quantity: [1, 1] }, { itemId: 'iron', weight: 3, quantity: [1, 1] }],
    'Very Hard': [{ itemId: 'pp_up', weight: 4, quantity: [1, 1] }, { itemId: 'mint_modest', weight: 1, quantity: [1, 1] }],
    Elite: [{ itemId: 'bottle_cap', weight: 3, quantity: [1, 1] }, { itemId: 'gold_bottle_cap', weight: 1, quantity: [1, 1] }],
    Legendary: [{ itemId: 'gold_bottle_cap', weight: 4, quantity: [1, 1] }, { itemId: 'ability_patch', weight: 1, quantity: [1, 1] }]
  },
  talent: {
    Easy: [{ itemId: 'tm_magical_leaf', weight: 3, quantity: [1, 1] }, { itemId: 'tm_swift', weight: 3, quantity: [1, 1] }],
    Normal: [{ itemId: 'tm_shadow_ball', weight: 2, quantity: [1, 1] }, { itemId: 'tm_thunderbolt', weight: 2, quantity: [1, 1] }],
    Hard: [{ itemId: 'tm_flamethrower', weight: 2, quantity: [1, 1] }, { itemId: 'tm_ice_beam', weight: 2, quantity: [1, 1] }],
    'Very Hard': [{ itemId: 'tm_earthquake', weight: 2, quantity: [1, 1] }, { itemId: 'tm_psychic', weight: 2, quantity: [1, 1] }],
    Elite: [{ itemId: 'hm_surf', weight: 2, quantity: [1, 1] }, { itemId: 'hm_fly', weight: 2, quantity: [1, 1] }],
    Legendary: [{ itemId: 'hm_strength', weight: 2, quantity: [1, 1] }, { itemId: 'tm_draco_meteor', weight: 1, quantity: [1, 1] }]
  },
  level: {
    Easy: [{ itemId: 'exp_candy_s', weight: 6, quantity: [1, 2] }],
    Normal: [{ itemId: 'exp_candy_m', weight: 5, quantity: [1, 2] }],
    Hard: [{ itemId: 'exp_candy_l', weight: 4, quantity: [1, 2] }],
    'Very Hard': [{ itemId: 'exp_candy_xl', weight: 3, quantity: [1, 2] }],
    Elite: [{ itemId: 'rare_candy', weight: 3, quantity: [1, 2] }],
    Legendary: [{ itemId: 'rare_candy', weight: 4, quantity: [2, 3] }]
  },
  special: {
    Easy: [{ itemId: 'dusk_ball', weight: 3, quantity: [1, 1] }],
    Normal: [{ itemId: 'quick_ball', weight: 3, quantity: [1, 1] }],
    Hard: [{ itemId: 'moon_stone', weight: 2, quantity: [1, 1] }, { itemId: 'fire_stone', weight: 2, quantity: [1, 1] }],
    'Very Hard': [{ itemId: 'water_stone', weight: 2, quantity: [1, 1] }, { itemId: 'thunder_stone', weight: 2, quantity: [1, 1] }],
    Elite: [{ itemId: 'dawn_stone', weight: 2, quantity: [1, 1] }, { itemId: 'dusk_stone', weight: 2, quantity: [1, 1] }],
    Legendary: [{ itemId: 'shiny_stone', weight: 2, quantity: [1, 1] }, { itemId: 'master_ball', weight: 1, quantity: [1, 1] }]
  }
};

const LEGENDARY_CURATED_POOL = [
  { itemId: 'master_ball', weight: 1, quantity: [1, 1] },
  { itemId: 'leftovers', weight: 2, quantity: [1, 1] },
  { itemId: 'choice_band', weight: 2, quantity: [1, 1] },
  { itemId: 'choice_specs', weight: 2, quantity: [1, 1] },
  { itemId: 'choice_scarf', weight: 2, quantity: [1, 1] },
  { itemId: 'ability_patch', weight: 4, quantity: [1, 1] },
  { itemId: 'gold_bottle_cap', weight: 3, quantity: [1, 1] },
  { itemId: 'tm_draco_meteor', weight: 1, quantity: [1, 1] }
];

const SPECIALIZED_ARCHETYPES = ['iv', 'talent', 'level', 'special'];

function weightedPick(entries = []) {
  if (!entries.length) return null;
  const total = entries.reduce((sum, entry) => sum + (entry.weight || 1), 0);
  let roll = Math.random() * total;
  for (const entry of entries) {
    roll -= (entry.weight || 1);
    if (roll <= 0) return entry;
  }
  return entries[entries.length - 1];
}

function rollQuantity(range = [1, 1]) {
  const [min, max] = range;
  if (min === max) return min;
  return min + Math.floor(Math.random() * ((max - min) + 1));
}

function getPrimaryArchetype(requirementType = 'mixed') {
  if (SPECIALIZED_ARCHETYPES.includes(requirementType)) return requirementType;
  return 'general';
}

function getArchetypeLabel(archetype) {
  return archetype === 'iv'
    ? 'Stat Training Rewards'
    : archetype === 'talent'
      ? 'Talent Mastery Rewards'
      : archetype === 'level'
        ? 'Growth Support Rewards'
        : archetype === 'special'
          ? 'Rare Condition Rewards'
          : archetype === 'mixed'
            ? 'Mixed Research Rewards'
            : 'General Research Rewards';
}

export function getRewardArchetype(requirementType = 'mixed', requirementKinds = []) {
  if (requirementType !== 'mixed') {
    return getPrimaryArchetype(requirementType);
  }

  const specializedKinds = requirementKinds.filter((kind) => SPECIALIZED_ARCHETYPES.includes(kind));
  if (specializedKinds.length >= 2) return 'mixed';
  if (specializedKinds.length === 1) return specializedKinds[0];
  return 'general';
}

export function buildRewardPackage({
  difficultyTier,
  requirementType,
  requirementKinds = [],
  questValue,
  progressionFactor = 0
}) {
  const archetype = getRewardArchetype(requirementType, requirementKinds);
  const tierName = difficultyTier?.name || 'Normal';
  const tierIndex = ['Easy', 'Normal', 'Hard', 'Very Hard', 'Elite', 'Legendary'].indexOf(tierName);
  const safeTierIndex = Math.max(0, tierIndex);

  const baseMoney = 90 + (safeTierIndex * 40);
  const tierMultiplier = difficultyTier?.difficultyMod || 1;
  const valueMultiplier = 1 + Math.min(0.45, (questValue || 1) * 0.02);
  const progressMultiplier = 1 + (Math.max(0, progressionFactor) * 0.8);

  const rawGold = Math.floor(baseMoney * tierMultiplier * valueMultiplier * progressMultiplier);
  const capPerQuest = Math.floor((350 + (progressionFactor * 500)) * (1 + safeTierIndex * 0.12));
  const gold = Math.min(rawGold, capPerQuest);

  const trustBase = difficultyTier?.trustGain || 0;
  const notesBase = difficultyTier?.notesGain || 0;
  const trustScale = 1 + Math.min(0.35, ((questValue || 1) * 0.015) + (Math.max(0, progressionFactor) * 0.2));
  const notesScale = 1 + Math.min(0.45, ((questValue || 1) * 0.02) + (Math.max(0, progressionFactor) * 0.25));
  const trustGain = Math.max(1, Math.round(trustBase * trustScale));
  const notesGain = Math.max(1, Math.round(notesBase * notesScale));

  const poolArchetypes = archetype === 'mixed'
    ? Array.from(new Set(requirementKinds.filter((kind) => SPECIALIZED_ARCHETYPES.includes(kind))))
    : [archetype];
  const safePoolArchetypes = poolArchetypes.length ? poolArchetypes : ['general'];

  const rewardRollCount = tierName === 'Legendary' ? 2 : (safeTierIndex >= 3 ? 2 : 1);
  const itemRewards = [];

  for (let i = 0; i < rewardRollCount; i++) {
    const rollArchetype = safePoolArchetypes[i % safePoolArchetypes.length];
    const poolByArchetype = ITEM_POOLS[rollArchetype] || ITEM_POOLS.general;
    const tierPool = poolByArchetype[tierName] || ITEM_POOLS.general[tierName] || [];

    const picked = weightedPick(tierPool);
    if (!picked) continue;
    itemRewards.push({
      id: picked.itemId,
      quantity: rollQuantity(picked.quantity)
    });
  }

  if (tierName === 'Legendary') {
    const curated = weightedPick(LEGENDARY_CURATED_POOL);
    if (curated) {
      itemRewards.push({ id: curated.itemId, quantity: rollQuantity(curated.quantity) });
    }
  }

  const possibleRewards = Array.from(new Set(
    safePoolArchetypes.flatMap((pool) => {
      const byTier = ITEM_POOLS[pool]?.[tierName];
      if (!Array.isArray(byTier)) return [];
      return byTier.map((entry) => entry.itemId);
    })
  ));

  const unique = [];
  const tally = new Map();
  itemRewards.forEach((entry) => {
    tally.set(entry.id, (tally.get(entry.id) || 0) + (entry.quantity || 1));
  });
  tally.forEach((qty, id) => unique.push({ id, quantity: qty }));

  return {
    formulaVersion: QUEST_VALUE_VERSION,
    rewardCategory: archetype,
    rewardCategoryLabel: getArchetypeLabel(archetype),
    possibleRewards,
    gold,
    trustGain,
    notesGain,
    itemRewards: unique,
    items: unique.map((entry) => `${entry.id} x${entry.quantity}`)
  };
}

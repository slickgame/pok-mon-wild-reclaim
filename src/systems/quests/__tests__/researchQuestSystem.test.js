import test from 'node:test';
import assert from 'node:assert/strict';

import { calculateQuestValue } from '../researchQuestTuning.js';
import { chooseTierByStrictController } from '../researchQuestAnalytics.js';
import { buildRewardPackage } from '../researchQuestRewards.js';
import {
  QUEST_CONFIG,
  generateQuest,
  getQuestExpiryMinutes,
  rerollQuestAction,
  acceptQuestAction
} from '../researchQuestService.js';

function createMockBase44(player = {}, quest = {}) {
  const state = {
    player: {
      id: 'player-1',
      gold: 1000,
      activeQuests: [],
      researchQuestRerolls: 0,
      researchQuestRerollResetDay: 1,
      ...player
    },
    quest: {
      id: 'quest-1',
      active: true,
      difficulty: 'Normal',
      ...quest
    },
    createdQuests: [],
    updatedQuest: null,
    updatedPlayer: null
  };

  return {
    state,
    base44: {
      entities: {
        Player: {
          list: async () => [state.player],
          update: async (_id, payload) => {
            state.player = { ...state.player, ...payload };
            state.updatedPlayer = payload;
            return state.player;
          }
        },
        ResearchQuest: {
          update: async (_id, payload) => {
            state.quest = { ...state.quest, ...payload };
            state.updatedQuest = payload;
            return state.quest;
          },
          create: async (payload) => {
            state.createdQuests.push(payload);
            return payload;
          },
          get: async () => state.quest
        },
        ResearchQuestAnalytics: {
          filter: async () => [{ id: 'analytics-1', scope: 'global' }],
          update: async () => ({}),
          create: async () => ({})
        }
      }
    }
  };
}

test('quest value scoring increases with harder requirements', () => {
  const easy = calculateQuestValue({ nature: 'Calm' });
  const harder = calculateQuestValue({
    nature: 'Calm',
    level: 36,
    ivConditions: [{ stat: 'SpAtk', min: 24 }],
    talentConditions: [{ count: 3, grades: ['Epic', 'Rare', 'Rare'] }],
    specialFlags: { shinyRequired: true }
  });

  assert.ok(harder > easy);
});

test('strict controller respects hard locks for top tiers', () => {
  const tier = chooseTierByStrictController({
    analytics: {
      generatedTotal: 100,
      generatedByTier: { Easy: 20, Normal: 35, Hard: 25, 'Very Hard': 10, Elite: 7, Legendary: 3 },
      expiredByTier: { Easy: 1, Normal: 1, Hard: 1, 'Very Hard': 0, Elite: 0, Legendary: 0 }
    },
    progression: { storyChapter: 0, mapleTrust: 0, avgPartyLevel: 5 }
  });

  assert.notEqual(tier, 'Elite');
  assert.notEqual(tier, 'Legendary');
});

test('reward package scales with quest value and applies category', () => {
  const low = buildRewardPackage({
    difficultyTier: { name: 'Hard', difficultyMod: 1.5, trustGain: 6, notesGain: 2 },
    requirementType: 'iv',
    questValue: 3,
    progressionFactor: 0
  });
  const high = buildRewardPackage({
    difficultyTier: { name: 'Hard', difficultyMod: 1.5, trustGain: 6, notesGain: 2 },
    requirementType: 'iv',
    questValue: 12,
    progressionFactor: 0.5
  });

  assert.equal(low.rewardCategory, 'iv');
  assert.ok(high.gold >= low.gold);
  assert.ok(Array.isArray(high.itemRewards));
});


test('mixed reward archetype blends specialized pools and scales support rewards', () => {
  const mixed = buildRewardPackage({
    difficultyTier: { name: 'Very Hard', difficultyMod: 2.0, trustGain: 8, notesGain: 3 },
    requirementType: 'mixed',
    requirementKinds: ['iv', 'talent', 'quantity'],
    questValue: 10,
    progressionFactor: 0.7
  });

  assert.equal(mixed.rewardCategory, 'mixed');
  assert.equal(mixed.rewardCategoryLabel, 'Mixed Research Rewards');
  assert.ok(mixed.possibleRewards.includes('pp_up'));
  assert.ok(mixed.possibleRewards.includes('tm_earthquake'));
  assert.ok(mixed.trustGain >= 8);
  assert.ok(mixed.notesGain >= 3);
});

test('acceptance and reroll lockout are enforced', async () => {
  const { base44 } = createMockBase44({ activeQuests: [{ questId: 'quest-1' }] });
  await assert.rejects(
    rerollQuestAction({
      base44,
      quest: { id: 'quest-1', difficulty: 'Normal' },
      gameTime: { currentHour: 10, currentMinute: 0, day: 1, month: 0, year: 0 },
      analytics: null,
      progression: { storyChapter: 0, mapleTrust: 0, avgPartyLevel: 5 }
    })
  );

  const { base44: base442, state } = createMockBase44();
  await acceptQuestAction({
    base44: base442,
    player: state.player,
    quest: { id: 'q2', species: 'Oddish', rarity: 'common', difficulty: 'Normal', reward: { gold: 100 } },
    gameTime: { currentHour: 10, currentMinute: 0, day: 1, month: 0, year: 0 },
    getSubmissionCount: () => 0
  });
  assert.ok(state.player.activeQuests.some((q) => q.questId === 'q2'));
});

test('expiry math and generation invariant', () => {
  const now = { currentHour: 10, currentMinute: 0, day: 1, month: 0, year: 0 };
  const expiry = getQuestExpiryMinutes({ createdAtMinutes: 1000, rarity: 'common', difficulty: 'Normal' }, now);
  assert.ok(Number.isFinite(expiry));

  for (let i = 0; i < 120; i++) {
    const q = generateQuest({ currentZone: 'Verdant Hollow' }, now, {
      analytics: null,
      progression: { storyChapter: 2, mapleTrust: 50, avgPartyLevel: 20 }
    });
    const hasExtraRequirement = Boolean(
      q.nature || q.level || (q.ivConditions?.length || 0) > 0 || (q.talentConditions?.length || 0) > 0
      || q.shinyRequired || q.alphaRequired || q.bondedRequired || q.hiddenAbilityRequired
    );
    assert.ok(hasExtraRequirement, 'quest must have at least one non-species requirement');
  }
});


test('generator produces varied requirement archetypes and mirrors requirements payload', () => {
  const now = { currentHour: 10, currentMinute: 0, day: 1, month: 0, year: 0 };

  let seenIv = 0;
  let seenTalent = 0;
  let seenQuantity = 0;
  let seenMixed = 0;

  for (let i = 0; i < 300; i++) {
    const q = generateQuest({ currentZone: 'Verdant Hollow' }, now, {
      analytics: null,
      progression: { storyChapter: 2, mapleTrust: 50, avgPartyLevel: 20 }
    });

    if ((q.ivConditions?.length || 0) > 0) {
      seenIv += 1;
      assert.ok((q.requirements?.ivConditions?.length || 0) > 0);
    }

    if ((q.talentConditions?.length || 0) > 0) {
      seenTalent += 1;
      assert.ok((q.requirements?.talentConditions?.length || 0) > 0);
    }

    if ((q.quantityRequired || 1) > 1) {
      seenQuantity += 1;
      assert.ok((q.requirements?.quantityRequired || 1) > 1);
    }

    if (q.requirementType === 'mixed') {
      seenMixed += 1;
    }
  }

  assert.ok(seenIv > 0, 'expected at least one IV quest in sample');
  assert.ok(seenTalent > 0, 'expected at least one talent quest in sample');
  assert.ok(seenQuantity > 0, 'expected at least one multi-submit quest in sample');
  assert.ok(seenMixed > 0, 'expected at least one mixed-requirement quest in sample');
});

test('reroll cap transitions from free to paid after daily limit', async () => {
  const { base44, state } = createMockBase44({
    gold: 1000,
    researchQuestRerolls: QUEST_CONFIG.maxFreeRerolls,
    researchQuestRerollResetDay: 1
  });

  const result = await rerollQuestAction({
    base44,
    quest: { id: 'quest-1', difficulty: 'Normal' },
    gameTime: { currentHour: 12, currentMinute: 0, day: 1, month: 0, year: 0 },
    analytics: null,
    progression: { storyChapter: 1, mapleTrust: 30, avgPartyLevel: 12 }
  });

  assert.equal(result.cost, QUEST_CONFIG.rerollCost);
  assert.equal(state.player.gold, 1000 - QUEST_CONFIG.rerollCost);
});

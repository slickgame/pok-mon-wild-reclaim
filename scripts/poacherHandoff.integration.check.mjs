import assert from 'node:assert/strict';
import {
  buildPoacherReturnMetaParams,
  clearPoacherOutcomeParams,
  extractPoacherOutcomeContext
} from '../src/components/zones/poacherOutcomeHandoff.js';

const poacherBattleMeta = {
  trainerId: 'thorn-mire-voss',
  trainerTier: 2,
  rewardTier: 'named',
  lossProfile: 'poacher_standard',
  triggeredByAction: 'Harvest',
  harvestTxnId: 'harvest-123'
};

const params = buildPoacherReturnMetaParams({
  poacherBattleMeta,
  battleRewards: { goldGained: 220 }
});

const full = new URLSearchParams(`zoneId=verdant&nodeletBattle=1&nodeletId=vh-mosswater-bog&nodeletBattleType=enemyNpc&battleOutcome=victory&${params.toString()}`);
const context = extractPoacherOutcomeContext(full);

assert.equal(context.nodeletBattle, '1');
assert.equal(context.nodeletId, 'vh-mosswater-bog');
assert.equal(context.nodeletBattleType, 'enemyNpc');
assert.equal(context.poacherRewardTier, 'named');
assert.equal(context.harvestTxnId, 'harvest-123');
assert.equal(context.battleGoldBase, 220);

const cleaned = clearPoacherOutcomeParams(full);
assert.equal(cleaned.get('nodeletBattle'), null);
assert.equal(cleaned.get('battleGoldBase'), null);
assert.equal(cleaned.get('zoneId'), 'verdant');

console.log('poacher handoff integration checks passed');

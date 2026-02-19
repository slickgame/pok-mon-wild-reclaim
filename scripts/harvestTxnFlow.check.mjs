// TODO: Migrate this deterministic check to Vitest (or project test runner) for CI integration.
import assert from 'node:assert/strict';
import { simulateHarvestTxnFlow } from '../src/components/zones/harvestTxnUtils.js';

const noPoacher = simulateHarvestTxnFlow({
  poacherEncountered: false,
  rewards: [{ name: 'Oran Berry', quantity: 1 }]
});
assert.equal(noPoacher.txnStatus, 'resolved');
assert.equal(noPoacher.grantedRewards.length, 1);

const poacherWin = simulateHarvestTxnFlow({
  poacherEncountered: true,
  battleOutcome: 'victory',
  rewards: [{ name: 'Pecha Berry', quantity: 2 }]
});
assert.equal(poacherWin.txnStatus, 'resolved');
assert.deepEqual(poacherWin.grantedRewards, [{ name: 'Pecha Berry', quantity: 2 }]);

const poacherLoss = simulateHarvestTxnFlow({
  poacherEncountered: true,
  battleOutcome: 'defeat',
  rewards: [{ name: 'Cheri Berry', quantity: 1 }]
});
assert.equal(poacherLoss.txnStatus, 'forfeited');
assert.equal(poacherLoss.grantedRewards.length, 0);

console.log('harvestTxn flow checks passed');

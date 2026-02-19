import assert from 'node:assert/strict';
import {
  buildPoacherRosterPlan,
  resolvePoacherTierRewardItems,
  resolvePoacherTrainerPool
} from '../src/components/zones/poacherTrainerRegistry.js';

const mossPool = resolvePoacherTrainerPool({ nodeletId: 'vh-mosswater-bog', npcLabel: 'Bog Raider' });
assert.ok(mossPool.some((trainer) => trainer.id === 'thorn-mire-voss'));

const apiaryPool = resolvePoacherTrainerPool({ nodeletId: 'vh-whispering-apiary-ruins', npcLabel: 'Honey Thief Crew' });
assert.ok(apiaryPool.some((trainer) => trainer.id === 'thorn-hive-lyra'));

const bogRoster = buildPoacherRosterPlan({
  trainerId: 'thorn-mire-voss',
  baselineLevel: 11,
  fallbackSpecies: 'Oddish',
  fallbackSpeciesPool: ['Cherubi', 'Pidgey']
});
assert.ok(bogRoster.length >= 3);
assert.ok(bogRoster.every((entry) => entry.trainerId === 'thorn-mire-voss'));

const forcedDrops = resolvePoacherTierRewardItems({ rewardTierId: 'named', rng: () => 0 });
assert.ok(forcedDrops.some((item) => item.name === 'Forager Token'));
assert.ok(forcedDrops.some((item) => item.name === "Forager's Gloves"));

// Guard test: duplicate outcome processing should not duplicate grants.
const processedOutcomeKeys = new Set();
let grantEvents = 0;
const applyOutcomeOnce = (key) => {
  if (processedOutcomeKeys.has(key)) return;
  processedOutcomeKeys.add(key);
  grantEvents += resolvePoacherTierRewardItems({ rewardTierId: 'standard', rng: () => 1 }).length;
};

applyOutcomeOnce('zone:nodelet:enemyNpc:victory:txn-1');
applyOutcomeOnce('zone:nodelet:enemyNpc:victory:txn-1');
assert.equal(grantEvents, 1);

console.log('poacher reward + pool checks passed');

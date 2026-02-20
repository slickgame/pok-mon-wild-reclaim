import assert from 'node:assert/strict';
import { VERDANT_HOLLOW_NODELETS } from '../src/components/zones/verdantHollowNodelets.js';
import { resolvePoacherTrainerPool } from '../src/components/zones/poacherTrainerRegistry.js';

const poacherNodeletIds = new Set([
  'vh-brambleberry-thicket',
  'vh-mosswater-bog',
  'vh-whispering-apiary-ruins'
]);

const nodeletsWithEnemyNpcs = VERDANT_HOLLOW_NODELETS
  .filter((nodelet) => poacherNodeletIds.has(nodelet.id))
  .filter((nodelet) => Array.isArray(nodelet.enemyNPCs) && nodelet.enemyNPCs.length > 0);

for (const nodelet of nodeletsWithEnemyNpcs) {
  for (const npcLabel of nodelet.enemyNPCs) {
    const pool = resolvePoacherTrainerPool({ nodeletId: nodelet.id, npcLabel });
    assert.ok(Array.isArray(pool) && pool.length > 0, `Missing pool mapping for ${npcLabel} at ${nodelet.id}`);
  }
}

console.log('poacher nodelet pool audit passed');

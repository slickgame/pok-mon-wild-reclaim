import assert from 'node:assert/strict';
import { migrateZoneNodeletsForPoacherData } from '../src/components/zones/poacherDataMigration.js';

const sampleZone = {
  id: 'zone-1',
  nodelets: [
    {
      id: 'vh-brambleberry-thicket',
      pendingHarvestForfeit: true,
      harvestTxns: [
        { status: 'done', rewards: [{ name: 'Oran Berry' }] },
        null
      ]
    }
  ]
};

const migration = migrateZoneNodeletsForPoacherData(sampleZone);
assert.equal(migration.changed, true);
assert.equal(migration.nodelets[0].pendingHarvestForfeit, false);
assert.ok(Array.isArray(migration.nodelets[0].legacyMigrationNotes));
assert.equal(migration.nodelets[0].harvestTxns.length, 1);
assert.equal(migration.nodelets[0].harvestTxns[0].status, 'resolved');
assert.equal(migration.nodelets[0].harvestTxns[0].rewards[0].name, 'Oran Berry');

console.log('poacher migration checks passed');

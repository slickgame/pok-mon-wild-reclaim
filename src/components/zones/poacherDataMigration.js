const normalizeHarvestTxn = (txn, idx) => {
  if (!txn || typeof txn !== 'object') return null;
  const id = txn.id || `legacy-harvest-${idx}`;
  const status = ['pending', 'resolved', 'forfeited'].includes(txn.status) ? txn.status : 'resolved';
  const rewards = Array.isArray(txn.rewards)
    ? txn.rewards
        .filter((item) => item?.name)
        .map((item) => ({ name: item.name, quantity: item.quantity || 1 }))
    : [];

  return {
    id,
    status,
    trigger: txn.trigger || 'Harvest',
    rewards,
    createdAt: txn.createdAt || txn.settledAt || new Date().toISOString(),
    settledAt: status === 'pending' ? null : (txn.settledAt || new Date().toISOString())
  };
};

export const migrateZoneNodeletsForPoacherData = (zone) => {
  if (!zone?.id || !Array.isArray(zone.nodelets)) return { changed: false, nodelets: zone?.nodelets || [] };

  let changed = false;
  const migratedNodelets = zone.nodelets.map((nodelet) => {
    let nextNodelet = nodelet;

    if (nodelet?.pendingHarvestForfeit) {
      nextNodelet = {
        ...nextNodelet,
        pendingHarvestForfeit: false,
        legacyMigrationNotes: [
          ...(nextNodelet.legacyMigrationNotes || []),
          `pendingHarvestForfeit migrated at ${new Date().toISOString()}`
        ]
      };
      changed = true;
    }

    const normalizedTxns = (nextNodelet?.harvestTxns || [])
      .map(normalizeHarvestTxn)
      .filter(Boolean);

    if (JSON.stringify(normalizedTxns) !== JSON.stringify(nextNodelet?.harvestTxns || [])) {
      nextNodelet = {
        ...nextNodelet,
        harvestTxns: normalizedTxns
      };
      changed = true;
    }

    return nextNodelet;
  });

  return { changed, nodelets: migratedNodelets };
};

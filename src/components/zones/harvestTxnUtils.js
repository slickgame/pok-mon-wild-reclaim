import { getHarvestTxnRetentionMs } from './zoneBalanceConfig.js';

export const HARVEST_TXN_RETENTION_MS = getHarvestTxnRetentionMs();

export const pruneHarvestTxnsForNodelets = ({ nodelets = [], nowMs = Date.now(), retentionMs = HARVEST_TXN_RETENTION_MS }) => (
  (nodelets || []).map((nodelet) => {
    if (!Array.isArray(nodelet?.harvestTxns) || nodelet.harvestTxns.length === 0) {
      return nodelet;
    }

    const pruned = nodelet.harvestTxns.filter((txn) => {
      if (txn?.status === 'pending') return true;
      const settledAtMs = Number.isFinite(new Date(txn?.settledAt).getTime())
        ? new Date(txn.settledAt).getTime()
        : Number.isFinite(new Date(txn?.createdAt).getTime())
          ? new Date(txn.createdAt).getTime()
          : nowMs;
      return nowMs - settledAtMs < retentionMs;
    });

    return {
      ...nodelet,
      harvestTxns: pruned
    };
  })
);

export const simulateHarvestTxnFlow = ({
  rewards = [{ name: 'Oran Berry', quantity: 1 }],
  poacherEncountered = false,
  battleOutcome = null
} = {}) => {
  const txns = [{ id: 'sim-harvest-txn', status: 'pending', rewards }];
  const grantedRewards = [];

  const settleTxn = (outcome) => {
    if (txns[0].status !== 'pending') return;
    txns[0].status = outcome;
    if (outcome === 'resolved') {
      grantedRewards.push(...rewards);
    }
  };

  if (!poacherEncountered) {
    settleTxn('resolved');
  } else if (battleOutcome === 'victory') {
    settleTxn('resolved');
  } else if (battleOutcome === 'defeat') {
    settleTxn('forfeited');
  }

  return {
    txnStatus: txns[0].status,
    grantedRewards
  };
};

const DEFAULT_HARVEST_TXN_RETENTION_MINUTES = 90;

export const getHarvestTxnRetentionMs = () => {
  const envMinutes = Number(import.meta.env?.VITE_HARVEST_TXN_RETENTION_MINUTES);
  if (Number.isFinite(envMinutes) && envMinutes > 0) {
    return Math.floor(envMinutes * 60 * 1000);
  }

  if (typeof window !== 'undefined') {
    const localOverride = Number(window.localStorage?.getItem('zone.harvestTxnRetentionMinutes'));
    if (Number.isFinite(localOverride) && localOverride > 0) {
      return Math.floor(localOverride * 60 * 1000);
    }
  }

  return DEFAULT_HARVEST_TXN_RETENTION_MINUTES * 60 * 1000;
};

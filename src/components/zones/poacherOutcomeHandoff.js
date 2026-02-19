const OUTCOME_KEYS = [
  'nodeletBattle',
  'nodeletId',
  'battleOutcome',
  'nodeletBattleType',
  'poacherTrainerId',
  'poacherTrainerTier',
  'poacherRewardTier',
  'poacherLossProfile',
  'triggeredByAction',
  'harvestTxnId',
  'battleGoldBase'
];

export const buildPoacherReturnMetaParams = ({ poacherBattleMeta, battleRewards }) => {
  const params = new URLSearchParams();
  if (poacherBattleMeta?.trainerId) params.set('poacherTrainerId', poacherBattleMeta.trainerId);
  if (poacherBattleMeta?.trainerTier) params.set('poacherTrainerTier', String(poacherBattleMeta.trainerTier));
  if (poacherBattleMeta?.rewardTier) params.set('poacherRewardTier', poacherBattleMeta.rewardTier);
  if (poacherBattleMeta?.lossProfile) params.set('poacherLossProfile', poacherBattleMeta.lossProfile);
  if (poacherBattleMeta?.triggeredByAction) params.set('triggeredByAction', poacherBattleMeta.triggeredByAction);
  if (poacherBattleMeta?.harvestTxnId) params.set('harvestTxnId', poacherBattleMeta.harvestTxnId);
  if (poacherBattleMeta?.trainerId) params.set('battleGoldBase', String(battleRewards?.goldGained || 0));
  return params;
};

export const extractPoacherOutcomeContext = (searchParams) => ({
  nodeletBattle: searchParams.get('nodeletBattle'),
  nodeletId: searchParams.get('nodeletId'),
  battleOutcome: searchParams.get('battleOutcome'),
  nodeletBattleType: searchParams.get('nodeletBattleType'),
  poacherRewardTier: searchParams.get('poacherRewardTier'),
  poacherLossProfile: searchParams.get('poacherLossProfile'),
  harvestTxnId: searchParams.get('harvestTxnId'),
  battleGoldBase: Number(searchParams.get('battleGoldBase') || 0)
});

export const clearPoacherOutcomeParams = (searchParams) => {
  const nextParams = new URLSearchParams(searchParams);
  OUTCOME_KEYS.forEach((key) => nextParams.delete(key));
  return nextParams;
};

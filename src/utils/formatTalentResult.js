export function formatUpgradeResult(result) {
  if (!result?.success) return result?.reason || 'Upgrade failed.';

  if (result.result === 'upgrade')
    return `Talent upgraded to ${result.grade}!`;

  if (result.result === 'nochange')
    return 'Talent resisted change.';

  if (result.result === 'downgrade')
    return `Talent degraded to ${result.grade}...`;

  return 'Upgrade complete.';
}

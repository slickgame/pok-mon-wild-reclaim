const REROLL_COST = 150;
const MAX_FREE_REROLLS = 3;

let rerollUsage = {
  date: null,
  count: 0
};

function canUseFreeReroll() {
  const today = new Date().toDateString();
  if (rerollUsage.date !== today) {
    rerollUsage.date = today;
    rerollUsage.count = 0;
  }
  return rerollUsage.count < MAX_FREE_REROLLS;
}

export function rerollQuest(player, questIndex, rerollCallback) {
  if (!player?.activeQuests || typeof rerollCallback !== 'function') {
    return { status: 'error', message: 'Invalid reroll request.' };
  }

  if (canUseFreeReroll()) {
    rerollUsage.count += 1;
    player.activeQuests[questIndex] = rerollCallback();
    return { status: 'success', cost: 0, free: true };
  }

  if (player.money >= REROLL_COST) {
    player.money -= REROLL_COST;
    player.activeQuests[questIndex] = rerollCallback();
    return { status: 'success', cost: REROLL_COST, free: false };
  }

  return { status: 'error', message: 'Not enough funds to reroll quest.' };
}

export { REROLL_COST, MAX_FREE_REROLLS };

import { getEVYield } from './baseStats';

/**
 * Apply EV gains to a Pokémon after defeating an opponent
 * Respects 252 per stat and 510 total caps
 */
export function applyEVGains(currentEVs, defeatedSpecies) {
  const evYield = getEVYield(defeatedSpecies);
  const newEVs = { ...currentEVs };
  
  // Calculate current total EVs
  const currentTotal = Object.values(currentEVs).reduce((sum, val) => sum + val, 0);
  
  // Track EVs gained for display
  const evsGained = { hp: 0, atk: 0, def: 0, spAtk: 0, spDef: 0, spd: 0 };
  let totalGained = 0;
  
  // Apply EV gains for each stat
  for (const stat of ['hp', 'atk', 'def', 'spAtk', 'spDef', 'spd']) {
    if (evYield[stat] > 0) {
      // Calculate how many EVs we can actually add to this stat
      const currentStat = currentEVs[stat] || 0;
      const roomInStat = Math.max(0, 252 - currentStat);
      const roomInTotal = Math.max(0, 510 - currentTotal - totalGained);
      const canAdd = Math.min(evYield[stat], roomInStat, roomInTotal);
      
      if (canAdd > 0) {
        newEVs[stat] = currentStat + canAdd;
        evsGained[stat] = canAdd;
        totalGained += canAdd;
      }
    }
  }
  
  return {
    newEVs,
    evsGained,
    totalGained
  };
}

/**
 * Check if EVs are at cap
 */
export function isEVCapped(evs, stat = null) {
  if (stat) {
    return (evs[stat] || 0) >= 252;
  }
  
  const total = Object.values(evs).reduce((sum, val) => sum + val, 0);
  return total >= 510;
}

/**
 * Get EV progress information
 */
export function getEVProgress(evs) {
  const total = Object.values(evs).reduce((sum, val) => sum + val, 0);
  
  return {
    total,
    remaining: Math.max(0, 510 - total),
    percentage: (total / 510) * 100,
    isCapped: total >= 510
  };
}
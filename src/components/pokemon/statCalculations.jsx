/**
 * Pokémon Stat Calculation Utilities
 * Based on traditional Pokémon formulas with IVs, EVs, and Natures
 */

// Nature modifiers (1.1 = +10%, 0.9 = -10%, 1.0 = neutral)
export const NATURES = {
  Hardy: { atk: 1.0, def: 1.0, spAtk: 1.0, spDef: 1.0, spd: 1.0 },
  Lonely: { atk: 1.1, def: 0.9, spAtk: 1.0, spDef: 1.0, spd: 1.0 },
  Brave: { atk: 1.1, def: 1.0, spAtk: 1.0, spDef: 1.0, spd: 0.9 },
  Adamant: { atk: 1.1, def: 1.0, spAtk: 0.9, spDef: 1.0, spd: 1.0 },
  Naughty: { atk: 1.1, def: 1.0, spAtk: 1.0, spDef: 0.9, spd: 1.0 },
  Bold: { atk: 0.9, def: 1.1, spAtk: 1.0, spDef: 1.0, spd: 1.0 },
  Docile: { atk: 1.0, def: 1.0, spAtk: 1.0, spDef: 1.0, spd: 1.0 },
  Relaxed: { atk: 1.0, def: 1.1, spAtk: 1.0, spDef: 1.0, spd: 0.9 },
  Impish: { atk: 1.0, def: 1.1, spAtk: 0.9, spDef: 1.0, spd: 1.0 },
  Lax: { atk: 1.0, def: 1.1, spAtk: 1.0, spDef: 0.9, spd: 1.0 },
  Timid: { atk: 0.9, def: 1.0, spAtk: 1.0, spDef: 1.0, spd: 1.1 },
  Hasty: { atk: 1.0, def: 0.9, spAtk: 1.0, spDef: 1.0, spd: 1.1 },
  Serious: { atk: 1.0, def: 1.0, spAtk: 1.0, spDef: 1.0, spd: 1.0 },
  Jolly: { atk: 1.0, def: 1.0, spAtk: 0.9, spDef: 1.0, spd: 1.1 },
  Naive: { atk: 1.0, def: 1.0, spAtk: 1.0, spDef: 0.9, spd: 1.1 },
  Modest: { atk: 0.9, def: 1.0, spAtk: 1.1, spDef: 1.0, spd: 1.0 },
  Mild: { atk: 1.0, def: 0.9, spAtk: 1.1, spDef: 1.0, spd: 1.0 },
  Quiet: { atk: 1.0, def: 1.0, spAtk: 1.1, spDef: 1.0, spd: 0.9 },
  Bashful: { atk: 1.0, def: 1.0, spAtk: 1.0, spDef: 1.0, spd: 1.0 },
  Rash: { atk: 1.0, def: 1.0, spAtk: 1.1, spDef: 0.9, spd: 1.0 },
  Calm: { atk: 0.9, def: 1.0, spAtk: 1.0, spDef: 1.1, spd: 1.0 },
  Gentle: { atk: 1.0, def: 0.9, spAtk: 1.0, spDef: 1.1, spd: 1.0 },
  Sassy: { atk: 1.0, def: 1.0, spAtk: 1.0, spDef: 1.1, spd: 0.9 },
  Careful: { atk: 1.0, def: 1.0, spAtk: 0.9, spDef: 1.1, spd: 1.0 },
  Quirky: { atk: 1.0, def: 1.0, spAtk: 1.0, spDef: 1.0, spd: 1.0 },
};

/**
 * Calculate HP stat
 */
export function calculateHP(base, iv, ev, level) {
  return Math.floor(((2 * base + iv + Math.floor(ev / 4)) * level / 100) + level + 10);
}

/**
 * Calculate other stats (Atk, Def, SpAtk, SpDef, Spd)
 */
export function calculateStat(base, iv, ev, level, natureModifier = 1.0) {
  return Math.floor((((2 * base + iv + Math.floor(ev / 4)) * level / 100) + 5) * natureModifier);
}

/**
 * Calculate all stats for a Pokémon
 */
export function calculateAllStats(pokemon, baseStats) {
  const nature = NATURES[pokemon.nature] || NATURES.Hardy;
  const level = pokemon.level || 5;
  
  const ivs = pokemon.ivs || {
    hp: 15, atk: 15, def: 15, spAtk: 15, spDef: 15, spd: 15
  };
  
  const evs = pokemon.evs || {
    hp: 0, atk: 0, def: 0, spAtk: 0, spDef: 0, spd: 0
  };

  return {
    hp: calculateHP(baseStats.hp, ivs.hp, evs.hp, level),
    maxHp: calculateHP(baseStats.hp, ivs.hp, evs.hp, level),
    atk: calculateStat(baseStats.atk, ivs.atk, evs.atk, level, nature.atk),
    def: calculateStat(baseStats.def, ivs.def, evs.def, level, nature.def),
    spAtk: calculateStat(baseStats.spAtk, ivs.spAtk, evs.spAtk, level, nature.spAtk),
    spDef: calculateStat(baseStats.spDef, ivs.spDef, evs.spDef, level, nature.spDef),
    spd: calculateStat(baseStats.spd, ivs.spd, evs.spd, level, nature.spd)
  };
}

/**
 * Generate random IVs (0-31 for each stat)
 */
export function generateRandomIVs() {
  return {
    hp: Math.floor(Math.random() * 32),
    atk: Math.floor(Math.random() * 32),
    def: Math.floor(Math.random() * 32),
    spAtk: Math.floor(Math.random() * 32),
    spDef: Math.floor(Math.random() * 32),
    spd: Math.floor(Math.random() * 32)
  };
}

/**
 * Get random nature
 */
export function getRandomNature() {
  const natureNames = Object.keys(NATURES);
  return natureNames[Math.floor(Math.random() * natureNames.length)];
}

/**
 * Award EVs after battle (max 252 per stat, 510 total)
 */
export function awardEVs(currentEVs, evYield) {
  const newEVs = { ...currentEVs };
  const currentTotal = Object.values(currentEVs).reduce((sum, val) => sum + val, 0);
  
  if (currentTotal >= 510) return newEVs;
  
  for (const [stat, value] of Object.entries(evYield)) {
    if (newEVs[stat] < 252) {
      const toAdd = Math.min(value, 252 - newEVs[stat], 510 - currentTotal);
      newEVs[stat] += toAdd;
    }
  }
  
  return newEVs;
}

/**
 * Get nature description
 */
export function getNatureDescription(nature) {
  const mod = NATURES[nature];
  if (!mod) return 'Neutral nature';
  
  const stats = { atk: 'Attack', def: 'Defense', spAtk: 'Sp. Atk', spDef: 'Sp. Def', spd: 'Speed' };
  const increased = Object.entries(mod).find(([k, v]) => v > 1.0);
  const decreased = Object.entries(mod).find(([k, v]) => v < 1.0);
  
  if (!increased || !decreased) return 'Neutral nature';
  
  return `+${stats[increased[0]]}, -${stats[decreased[0]]}`;
}
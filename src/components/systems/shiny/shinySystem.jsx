/**
 * Shiny Pokémon System
 *
 * Base rate: 1/4096 (matches modern main series games, Gen 6+)
 *
 * Odds Boosters:
 * ─────────────────────────────────────────────────────────────────
 * 1. SHINY CHARM (item)
 *    Triples the base rate to ~1/1365
 *    Obtained from Professor Maple after completing the regional Pokédex
 *
 * 2. OUTBREAK BONUS
 *    A Mass Outbreak for the species is active.
 *    Adds +2 rerolls per encounter (effective ~1/683 base, ~1/455 with charm)
 *    Outbreaks are announced on the Bulletin Board and last 1 in-game day.
 *
 * 3. CATCH STREAK (Masuda-style chain)
 *    Each consecutive catch of the SAME species (without catching a different species)
 *    adds one extra roll, up to +5 bonus rolls (at 25+ streak).
 *    Streak persists in localStorage. Resets if you catch a different species.
 *    Thresholds: 0→0, 5→+1, 10→+2, 15→+3, 20→+4, 25→+5 bonus rolls
 *
 * 4. GLITTER LURE (crafted bait item)
 *    Equipping this bait during an encounter doubles the bonus rolls.
 *    Stackable with all other bonuses.
 *
 * 5. LUNAR BLESSING (time-of-day)
 *    During "Night" phase (20:00–05:00 in-game), +1 bonus roll.
 *
 * Combined example (best possible odds):
 *   Shiny Charm + Outbreak + 25-streak + Glitter Lure + Night
 *   = 3 base rolls + 2 outbreak + (5 streak * 2 lure) + 1 night = 16 rolls
 *   ≈ 1/256 per encounter
 */

export const BASE_SHINY_RATE = 4096;

/**
 * Returns the number of shiny rolls for a single encounter.
 * More rolls = higher chance. Each roll is a 1/4096 check.
 *
 * @param {object} opts
 * @param {boolean} opts.hasShinyCharm       - Player owns the Shiny Charm item
 * @param {boolean} opts.isOutbreak          - Species has an active outbreak
 * @param {number}  opts.catchStreak         - Consecutive same-species catch streak
 * @param {boolean} opts.hasGlitterLure      - Glitter Lure bait equipped
 * @param {boolean} opts.isNightTime         - In-game time is Night phase
 * @returns {number} total rolls
 */
export function getShinyRolls({ hasShinyCharm = false, isOutbreak = false, catchStreak = 0, hasGlitterLure = false, isNightTime = false }) {
  let rolls = 1;

  // Shiny Charm: +2 bonus rolls (total 3)
  if (hasShinyCharm) rolls += 2;

  // Outbreak: +2 bonus rolls
  if (isOutbreak) rolls += 2;

  // Catch Streak bonus rolls
  const streakBonus = getStreakBonus(catchStreak);
  rolls += streakBonus;

  // Glitter Lure: doubles all bonus rolls (not the base 1)
  if (hasGlitterLure) {
    const bonusSoFar = rolls - 1;
    rolls = 1 + bonusSoFar * 2;
  }

  // Lunar Blessing: +1 at night
  if (isNightTime) rolls += 1;

  return rolls;
}

function getStreakBonus(streak) {
  if (streak >= 25) return 5;
  if (streak >= 20) return 4;
  if (streak >= 15) return 3;
  if (streak >= 10) return 2;
  if (streak >= 5) return 1;
  return 0;
}

/**
 * Rolls for shiny with the given number of dice.
 * @param {number} rolls
 * @returns {boolean}
 */
export function rollForShiny(rolls = 1) {
  for (let i = 0; i < rolls; i++) {
    if (Math.floor(Math.random() * BASE_SHINY_RATE) === 0) return true;
  }
  return false;
}

/**
 * Returns display-friendly odds string, e.g. "1/1365"
 */
export function getShinyOddsLabel(rolls) {
  const rate = Math.round(BASE_SHINY_RATE / rolls);
  return `1/${rate}`;
}

// ── Catch streak localStorage helpers ──────────────────────────────────────

const STREAK_KEY = 'shinyStreakData';

export function getStreakData() {
  try {
    const raw = localStorage.getItem(STREAK_KEY);
    return raw ? JSON.parse(raw) : { species: null, count: 0 };
  } catch {
    return { species: null, count: 0 };
  }
}

/**
 * Call after every catch. Returns the updated streak count.
 * @param {string} species
 * @returns {number} new streak count
 */
export function updateCatchStreak(species) {
  const data = getStreakData();
  if (data.species === species) {
    const newData = { species, count: data.count + 1 };
    localStorage.setItem(STREAK_KEY, JSON.stringify(newData));
    return newData.count;
  } else {
    const newData = { species, count: 1 };
    localStorage.setItem(STREAK_KEY, JSON.stringify(newData));
    return 1;
  }
}

export function resetCatchStreak() {
  localStorage.removeItem(STREAK_KEY);
}
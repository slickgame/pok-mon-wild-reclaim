/**
 * TrainerRegistry — Step 4: Trainer Roster Build Depth
 *
 * Defines NPC trainer identities, archetypes, team rosters, AI tier,
 * and reward tables. Each Pokémon slot supports an optional `buildOverride`
 * that is consumed by createWildPokemonInstance() to override random generation.
 *
 * IV Templates:
 *   'random'      — fully random (default)
 *   'competitive' — 31/31/31/31/31/31
 *   'mixed'       — 31 in offensive stats, 0 in useless ones
 *   'bulk'        — 31 hp/def/spDef, random offensive
 *   'speed_sweep' — 31 spd/atk or spd/spAtk, rest 20+
 */

export const IV_TEMPLATES = {
  random:      null, // handled by generateRandomIVs()
  competitive: { hp: 31, atk: 31, def: 31, spAtk: 31, spDef: 31, spd: 31 },
  mixed:       { hp: 31, atk: 31, def: 20, spAtk: 15, spDef: 20, spd: 31 },
  bulk:        { hp: 31, atk: 15, def: 31, spAtk: 10, spDef: 31, spd: 15 },
  speed_sweep: { hp: 25, atk: 31, def: 20, spAtk: 25, spDef: 20, spd: 31 },
};

// ─── Faction: Thorn Syndicate ────────────────────────────────────────────────

/**
 * Rusk "Pruner" Vale — Archetype: Fast Harass
 * AI Tier 1 → prioritises speed / status opener, then pivot or finish.
 * Drops: Soft Mulch, contraband token (common)
 */
const RUSK_VALE = {
  id: 'rusk_vale',
  name: 'Rusk "Pruner" Vale',
  faction: 'Thorn Syndicate',
  archetype: 'Fast Harass',
  aiTier: 1,
  description: 'Cuts routes and steals before defenders can react. Quick and ruthless.',
  roster: [
    {
      species: 'Pidgey',
      level: 8,
      buildOverride: {
        nature: 'Timid',
        ivTemplate: 'speed_sweep',
        evSpread: { spd: 100, atk: 100, hp: 20 },
        moves: ['Gust', 'Quick Attack', 'Sand Attack', 'Tackle'],
        ability: 'Keen Eye',
      }
    },
    {
      species: 'Oddish',
      level: 7,
      buildOverride: {
        nature: 'Modest',
        ivTemplate: 'mixed',
        evSpread: { spAtk: 100, spd: 60, hp: 20 },
        moves: ['Absorb', 'Poison Powder', 'Sleep Powder', 'Growth'],
        ability: null,
      }
    },
    {
      species: 'Caterpie',
      level: 6,
      buildOverride: {
        nature: 'Bold',
        ivTemplate: 'bulk',
        evSpread: { hp: 100, def: 60 },
        moves: ['Tackle', 'String Shot'],
        ability: null,
      }
    },
  ],
  rewards: {
    gold: { min: 120, max: 180 },
    items: [
      { name: 'Soft Mulch',       chance: 0.60 },
      { name: 'Contraband Token', chance: 0.20 },
      { name: 'Pecha Berry Seed', chance: 0.15 },
    ]
  }
};

/**
 * Marta Siltgrin — Archetype: Sustain / Drain
 * AI Tier 1 → sleep / leech / defense core; outlasts foragers.
 */
const MARTA_SILTGRIN = {
  id: 'marta_siltgrin',
  name: 'Marta Siltgrin',
  faction: 'Thorn Syndicate',
  archetype: 'Sustain / Drain',
  aiTier: 1,
  description: 'Outlasts foragers and strips resources with attrition tactics.',
  roster: [
    {
      species: 'Oddish',
      level: 10,
      buildOverride: {
        nature: 'Bold',
        ivTemplate: 'bulk',
        evSpread: { hp: 120, def: 60, spDef: 60 },
        moves: ['Absorb', 'Sleep Powder', 'Leech Seed', 'Poison Powder'],
        ability: null,
      }
    },
    {
      species: 'Cherubi',
      level: 9,
      buildOverride: {
        nature: 'Calm',
        ivTemplate: 'bulk',
        evSpread: { hp: 120, spDef: 80 },
        moves: ['Absorb', 'Leech Seed', 'Growth', 'Tackle'],
        ability: null,
      }
    },
    {
      species: 'Bounsweet',
      level: 9,
      buildOverride: {
        nature: 'Careful',
        ivTemplate: 'bulk',
        evSpread: { hp: 100, spDef: 100 },
        moves: ['Splash', 'Razor Leaf', 'Sweet Scent', 'Tackle'],
        ability: null,
      }
    },
  ],
  rewards: {
    gold: { min: 140, max: 200 },
    items: [
      { name: 'Soft Mulch',   chance: 0.55 },
      { name: 'Oran Berry',   chance: 0.35 },
      { name: 'Bog Reed',     chance: 0.20 },
    ]
  }
};

/**
 * Kade & Nix ("The Basket Blades") — Archetype: Duo Pressure
 * AI Tier 2 → coordinated two-front pressure; anti-swap tech; cleanup.
 * Named trainer — higher reward + guaranteed material.
 */
const KADE_AND_NIX = {
  id: 'kade_and_nix',
  name: 'Kade & Nix',
  faction: 'Thorn Syndicate',
  archetype: 'Duo Pressure',
  aiTier: 2,
  isNamed: true,
  signatureDrop: 'Snare Wire',
  description: 'Coordinated dual assault — one disrupts while the other damages.',
  roster: [
    {
      species: 'Pidgey',
      level: 12,
      buildOverride: {
        nature: 'Jolly',
        ivTemplate: 'speed_sweep',
        evSpread: { spd: 152, atk: 100, hp: 20 },
        moves: ['Gust', 'Quick Attack', 'Sand Attack', 'Roost'],
        ability: 'Keen Eye',
      }
    },
    {
      species: 'Caterpie',
      level: 11,
      buildOverride: {
        nature: 'Impish',
        ivTemplate: 'bulk',
        evSpread: { hp: 120, def: 80 },
        moves: ['Tackle', 'String Shot', 'Bug Bite'],
        ability: null,
      }
    },
    {
      species: 'Oddish',
      level: 12,
      buildOverride: {
        nature: 'Modest',
        ivTemplate: 'mixed',
        evSpread: { spAtk: 120, spd: 60, hp: 20 },
        moves: ['Absorb', 'Poison Powder', 'Mega Drain', 'Stun Spore'],
        ability: null,
      }
    },
    {
      species: 'Bounsweet',
      level: 11,
      buildOverride: {
        nature: 'Adamant',
        ivTemplate: 'mixed',
        evSpread: { atk: 120, spd: 60, hp: 20 },
        moves: ['Rapid Spin', 'Razor Leaf', 'Sweet Scent', 'Tackle'],
        ability: null,
      }
    },
  ],
  rewards: {
    gold: { min: 220, max: 320 },
    items: [
      { name: 'Soft Mulch',       chance: 0.70 },
      { name: 'Wax Comb',         chance: 0.30 },
      { name: 'Contraband Token', chance: 0.40 },
    ]
  }
};

/**
 * Foreman Bramblejack — Archetype: Contract Gatekeeper / Boss
 * AI Tier 3 → 6-mon checkpoint fight; sacrificial lead, pivot chain, closer.
 * Boss reward: guaranteed rare + contract rep bump.
 */
const FOREMAN_BRAMBLEJACK = {
  id: 'foreman_bramblejack',
  name: 'Foreman Bramblejack',
  faction: 'Thorn Syndicate',
  archetype: 'Contract Gatekeeper',
  aiTier: 3,
  isBoss: true,
  description: 'Controls illegal berry routes. Does not lose gracefully.',
  roster: [
    // Sacrificial lead — status setter
    {
      species: 'Oddish',
      level: 16,
      buildOverride: {
        nature: 'Bold',
        ivTemplate: 'bulk',
        evSpread: { hp: 150, def: 80, spDef: 28 },
        moves: ['Sleep Powder', 'Leech Seed', 'Absorb', 'Poison Powder'],
        ability: null,
      }
    },
    // Core bruiser
    {
      species: 'Pidgeotto',
      level: 17,
      buildOverride: {
        nature: 'Adamant',
        ivTemplate: 'competitive',
        evSpread: { atk: 200, spd: 100, hp: 20 },
        moves: ['Wing Attack', 'Quick Attack', 'Sand Attack', 'Gust'],
        ability: 'Keen Eye',
        heldItem: 'Normal Gem',
        talents: [{ name: 'Swift Wing', grade: 'Silver' }],
      }
    },
    // Utility disruptor
    {
      species: 'Cherubi',
      level: 15,
      buildOverride: {
        nature: 'Modest',
        ivTemplate: 'mixed',
        evSpread: { spAtk: 152, hp: 80, spDef: 26 },
        moves: ['Absorb', 'Leech Seed', 'Weather Ball', 'Growth'],
        ability: null,
      }
    },
    // Mid-pivot
    {
      species: 'Caterpie',
      level: 14,
      buildOverride: {
        nature: 'Impish',
        ivTemplate: 'bulk',
        evSpread: { hp: 200, def: 58 },
        moves: ['String Shot', 'Bug Bite', 'Tackle', 'Harden'],
        ability: null,
      }
    },
    // Pivot escalation
    {
      species: 'Bounsweet',
      level: 17,
      buildOverride: {
        nature: 'Jolly',
        ivTemplate: 'speed_sweep',
        evSpread: { spd: 160, atk: 100, hp: 20 },
        moves: ['Rapid Spin', 'Razor Leaf', 'Stomp', 'Sweet Scent'],
        ability: null,
      }
    },
    // Closer
    {
      species: 'Pikachu',
      level: 18,
      buildOverride: {
        nature: 'Timid',
        ivTemplate: 'competitive',
        evSpread: { spd: 252, spAtk: 200, hp: 8 },
        moves: ['Thunderbolt', 'Quick Attack', 'Nuzzle', 'Iron Tail'],
        ability: 'Lightning Rod',
        heldItem: 'Sitrus Berry',
        talents: [{ name: 'Static Surge', grade: 'Gold' }],
      }
    },
  ],
  rewards: {
    gold: { min: 500, max: 700 },
    items: [
      { name: 'Soft Mulch',       chance: 1.00 },
      { name: 'Contraband Token', chance: 0.80 },
      { name: 'Royal Jelly',      chance: 0.40 },
      { name: 'Masterwork Shard', chance: 0.15 },
    ]
  }
};

// ─── Registry Map ─────────────────────────────────────────────────────────────

export const TrainerRegistry = {
  rusk_vale:          RUSK_VALE,
  marta_siltgrin:     MARTA_SILTGRIN,
  kade_and_nix:       KADE_AND_NIX,
  foreman_bramblejack: FOREMAN_BRAMBLEJACK,
};

// ─── Per-nodelet encounter pools ──────────────────────────────────────────────

/**
 * Maps nodelet IDs to weighted trainer encounter pools.
 * `weight` drives random selection. Higher tiers appear at lower weights.
 */
export const NodeletTrainerPools = {
  'vh-brambleberry-thicket': [
    { trainerId: 'rusk_vale',          weight: 40 },
    { trainerId: 'marta_siltgrin',     weight: 35 },
    { trainerId: 'kade_and_nix',       weight: 20 },
    { trainerId: 'foreman_bramblejack', weight: 5 },
  ],
};

/**
 * Pick a weighted random trainer from a nodelet's pool.
 * Returns the trainer object or null.
 */
export function pickRandomTrainer(nodeletId) {
  const pool = NodeletTrainerPools[nodeletId];
  if (!pool?.length) return null;

  const total = pool.reduce((sum, e) => sum + e.weight, 0);
  let rand = Math.random() * total;

  for (const entry of pool) {
    rand -= entry.weight;
    if (rand <= 0) return TrainerRegistry[entry.trainerId] || null;
  }

  return TrainerRegistry[pool[0].trainerId] || null;
}

/**
 * Build a reward payout from a trainer's reward table.
 * Applies boss/named multipliers and guaranteed signature drops.
 * Returns { gold: number, items: string[] }
 */
export function rollTrainerRewards(trainer) {
  const t = trainer || {};
  const tier = t.aiTier || t.tier || 1;

  // Base gold + item rolls from reward table
  const rewardTable = t.rewards || {};
  const { gold, items = [] } = rewardTable;
  let baseGold = gold
    ? Math.floor(Math.random() * (gold.max - gold.min + 1)) + gold.min
    : 100;

  let droppedItems = items
    .filter(item => Math.random() < item.chance)
    .map(item => item.name);

  // --- Boss / Named modifiers ---
  const isNamed = Boolean(t.isNamed);
  const isBoss = Boolean(t.isBoss);

  let goldMult = 1.0;
  if (isNamed) goldMult *= 1.25;
  if (isBoss) {
    if (tier >= 4) goldMult *= 1.75;
    else if (tier >= 3) goldMult *= 1.55;
    else goldMult *= 1.40;
  }

  baseGold = Math.round(baseGold * goldMult);

  // Guaranteed signature material
  if (isBoss) {
    const sig = t.signatureDrop || 'Poacher Emblem';
    droppedItems = [sig, ...droppedItems];
  } else if (isNamed) {
    const sig = t.signatureDrop || 'Marked Coin';
    droppedItems = [sig, ...droppedItems];
  }

  // Bonus roll for bosses (50% chance to duplicate a drop)
  if (isBoss && Math.random() < 0.5 && droppedItems.length > 0) {
    const extra = droppedItems[1] || droppedItems[0];
    if (extra) droppedItems.push(extra);
  }

  return { gold: baseGold, items: droppedItems };
}
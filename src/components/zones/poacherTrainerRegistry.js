export const POACHER_ARCHETYPES = {
  fast_harass: {
    id: 'fast_harass',
    label: 'Fast Harass',
    behaviorTags: ['open_status', 'focus_kills', 'low_defensive_switching'],
    moveTagWeights: {
      status_open: 3,
      chip: 3,
      priority: 2,
      sustain: 1
    }
  },
  sustain_drain: {
    id: 'sustain_drain',
    label: 'Sustain / Drain',
    behaviorTags: ['status_then_stall', 'prefer_survivability', 'mid_switching'],
    moveTagWeights: {
      sustain: 4,
      status_open: 2,
      chip: 2
    }
  },
  duo_pressure: {
    id: 'duo_pressure',
    label: 'Duo Pressure',
    behaviorTags: ['momentum_chain', 'aggressive_swaps', 'target_weak_links'],
    moveTagWeights: {
      chip: 3,
      priority: 2,
      trap: 2,
      status_open: 1
    }
  },
  boss_gatekeeper: {
    id: 'boss_gatekeeper',
    label: 'Boss Gatekeeper',
    behaviorTags: ['scripted_open', 'resource_drain', 'closer_protect'],
    moveTagWeights: {
      status_open: 2,
      sustain: 3,
      trap: 2,
      finisher: 3
    }
  }
};

export const POACHER_DIFFICULTY_TIERS = {
  1: { id: 1, label: 'Scrapper', teamSize: [3, 4], aiProfile: 'poacher_v1', payoutMult: 1.0, levelOffset: 0 },
  2: { id: 2, label: 'Raider', teamSize: [3, 5], aiProfile: 'poacher_v2', payoutMult: 1.2, levelOffset: 1 },
  3: { id: 3, label: 'Enforcer', teamSize: [4, 5], aiProfile: 'poacher_v3', payoutMult: 1.5, levelOffset: 2 },
  4: { id: 4, label: 'Foreman', teamSize: [6, 6], aiProfile: 'poacher_boss', payoutMult: 2.0, levelOffset: 3 }
};

export const POACHER_REWARD_TIERS = {
  standard: {
    id: 'standard',
    goldMultiplier: 1.4,
    guaranteedItems: [{ name: 'Soft Mulch', quantity: 1 }],
    rollTable: [
      { name: 'Pecha Berry', quantity: 2, chance: 0.35 },
      { name: 'Bog Reed', quantity: 1, chance: 0.2 },
      { name: 'Wax Comb', quantity: 1, chance: 0.12 }
    ]
  },
  named: {
    id: 'named',
    goldMultiplier: 1.8,
    guaranteedItems: [{ name: 'Soft Mulch', quantity: 1 }, { name: 'Forager Token', quantity: 1 }],
    rollTable: [{ name: "Forager's Gloves", quantity: 1, chance: 0.12 }]
  },
  boss: {
    id: 'boss',
    goldMultiplier: 2.5,
    guaranteedItems: [{ name: 'Forager Token', quantity: 2 }, { name: "Forager's Gloves", quantity: 1 }],
    rollTable: [{ name: 'Royal Jelly', quantity: 1, chance: 0.25 }]
  }
};


export const resolvePoacherTierRewardItems = ({ rewardTierId = 'standard', rng = Math.random }) => {
  const tier = POACHER_REWARD_TIERS[rewardTierId] || POACHER_REWARD_TIERS.standard;
  const guaranteed = [...(tier?.guaranteedItems || [])].map((item) => ({
    name: item.name,
    quantity: item.quantity || 1
  }));

  const rolled = (tier?.rollTable || [])
    .filter((drop) => rng() < (drop.chance || 0))
    .map((drop) => ({
      name: drop.name,
      quantity: drop.quantity || 1
    }));

  return [...guaranteed, ...rolled];
};

export const LOSS_CONSEQUENCE_PROFILES = {
  poacher_standard: {
    id: 'poacher_standard',
    timePenaltyMinutes: 60,
    sendTo: 'town_pokemon_center',
    teamHpPercentAfter: 0.1,
    goldLossPercent: 0.1,
    forfeitHarvestIfTriggeredByHarvest: true
  },
  poacher_boss: {
    id: 'poacher_boss',
    timePenaltyMinutes: 60,
    sendTo: 'town_pokemon_center',
    teamHpPercentAfter: 0.1,
    goldLossPercent: 0.12,
    forfeitHarvestIfTriggeredByHarvest: true
  }
};

export const POACHER_TRAINERS = {
  'thorn-rusk-pruner': {
    id: 'thorn-rusk-pruner',
    displayName: 'Rusk "Pruner" Vale',
    faction: 'Thorn Syndicate',
    archetype: 'fast_harass',
    allowedNodelets: ['vh-brambleberry-thicket'],
    rarityWeight: 28,
    difficultyTier: 1,
    rewardTier: 'standard',
    lossProfile: 'poacher_standard',
    identity: {
      title: 'Route Cutter',
      bio: 'Strikes quickly and strips berry routes before local foragers can react.',
      introLines: [
        "Hands off those berries. They're already sold.",
        'You can keep your pride. We keep the produce.'
      ],
      defeatLines: [
        "This route's burned.",
        'You just made the Syndicate notice you.'
      ]
    },
    teamPlan: {
      slots: ['lead_harass', 'pivot_speed', 'closer'],
      speciesPools: {
        lead_harass: ['Pidgey', 'Pikachu', 'Caterpie'],
        pivot_speed: ['Oddish', 'Pidgey', 'Bounsweet'],
        closer: ['Cherubi', 'Bounsweet', 'Oddish']
      },
      moveTags: ['status_open', 'chip', 'priority'],
      preventDuplicates: false
    }
  },
  'thorn-marta-siltgrin': {
    id: 'thorn-marta-siltgrin',
    displayName: 'Marta Siltgrin',
    faction: 'Thorn Syndicate',
    archetype: 'sustain_drain',
    allowedNodelets: ['vh-brambleberry-thicket', 'vh-mosswater-bog'],
    rarityWeight: 24,
    difficultyTier: 2,
    rewardTier: 'named',
    lossProfile: 'poacher_standard',
    identity: {
      title: 'Sackkeeper',
      bio: 'Wears teams down with status and attrition while her runners sweep stockpiles.',
      introLines: [
        'Long day? Let me make it longer.',
        'You bring the berries. I bring the bill.'
      ],
      defeatLines: [
        'You fought through the rot... impressive.',
        'The next collector will not be this patient.'
      ]
    },
    teamPlan: {
      slots: ['lead_status', 'drain_core', 'drain_core', 'closer'],
      speciesPools: {
        lead_status: ['Oddish', 'Cherubi'],
        drain_core: ['Bounsweet', 'Oddish', 'Cherubi'],
        closer: ['Pikachu', 'Pidgey', 'Bounsweet']
      },
      moveTags: ['sustain', 'status_open', 'chip'],
      preventDuplicates: false
    }
  },
  'thorn-kade-nix': {
    id: 'thorn-kade-nix',
    displayName: 'Kade & Nix, Basket Blades',
    faction: 'Thorn Syndicate',
    archetype: 'duo_pressure',
    allowedNodelets: ['vh-brambleberry-thicket'],
    rarityWeight: 18,
    difficultyTier: 3,
    rewardTier: 'named',
    lossProfile: 'poacher_standard',
    identity: {
      title: 'Dual Route Hit Team',
      bio: 'Ambush partners that chain pressure and force bad switches.',
      introLines: [
        'Two routes, one haul.',
        'You brought one team? Cute.'
      ],
      defeatLines: [
        'Split and regroup!',
        'Fine. We take the next thicket over.'
      ]
    },
    teamPlan: {
      slots: ['lead_harass', 'pivot_speed', 'pivot_speed', 'trap_tech', 'closer'],
      speciesPools: {
        lead_harass: ['Pidgey', 'Pikachu'],
        pivot_speed: ['Caterpie', 'Oddish', 'Pidgey'],
        trap_tech: ['Oddish', 'Cherubi'],
        closer: ['Bounsweet', 'Pikachu']
      },
      moveTags: ['chip', 'priority', 'trap', 'status_open'],
      preventDuplicates: false
    }
  },

  'thorn-mire-voss': {
    id: 'thorn-mire-voss',
    displayName: 'Mire Voss',
    faction: 'Thorn Syndicate',
    archetype: 'sustain_drain',
    allowedNodelets: ['vh-mosswater-bog'],
    rarityWeight: 20,
    difficultyTier: 2,
    rewardTier: 'named',
    lossProfile: 'poacher_standard',
    identity: {
      title: 'Bog Route Reclaimer',
      bio: 'Turns wetlands into choke points and bleeds teams with attrition.',
      introLines: [
        'The bog keeps what it takes.',
        'Sink slow and fight slower.'
      ],
      defeatLines: [
        'You crossed deeper than most.',
        'This marsh remembers you now.'
      ]
    },
    teamPlan: {
      slots: ['lead_status', 'drain_core', 'pivot_speed', 'drain_core', 'closer'],
      speciesPools: {
        lead_status: ['Oddish', 'Cherubi'],
        drain_core: ['Bounsweet', 'Oddish', 'Cherubi'],
        pivot_speed: ['Pidgey', 'Caterpie'],
        closer: ['Pikachu', 'Bounsweet']
      },
      moveTags: ['sustain', 'status_open', 'chip'],
      preventDuplicates: false
    }
  },
  'thorn-hive-lyra': {
    id: 'thorn-hive-lyra',
    displayName: 'Lyra Combcut',
    faction: 'Thorn Syndicate',
    archetype: 'duo_pressure',
    allowedNodelets: ['vh-whispering-apiary-ruins'],
    rarityWeight: 16,
    difficultyTier: 3,
    rewardTier: 'named',
    lossProfile: 'poacher_standard',
    identity: {
      title: 'Apiary Breaker',
      bio: 'Raids hive routes with quick pivots and trap pressure.',
      introLines: [
        'Honey belongs to whoever can hold it.',
        'Try not to get stung on the way out.'
      ],
      defeatLines: [
        'Fine, the hive is yours today.',
        'We will strip the next apiary dry.'
      ]
    },
    teamPlan: {
      slots: ['lead_harass', 'pivot_speed', 'trap_tech', 'pivot_speed', 'closer'],
      speciesPools: {
        lead_harass: ['Pidgey', 'Pikachu'],
        pivot_speed: ['Caterpie', 'Bounsweet', 'Pidgey'],
        trap_tech: ['Oddish', 'Caterpie'],
        closer: ['Pikachu', 'Bounsweet']
      },
      moveTags: ['chip', 'priority', 'trap'],
      preventDuplicates: false
    }
  },
  'thorn-foreman-bramblejack': {
    id: 'thorn-foreman-bramblejack',
    displayName: 'Foreman Bramblejack',
    faction: 'Thorn Syndicate',
    archetype: 'boss_gatekeeper',
    allowedNodelets: ['vh-brambleberry-thicket'],
    rarityWeight: 8,
    difficultyTier: 4,
    rewardTier: 'boss',
    lossProfile: 'poacher_boss',
    identity: {
      title: 'Thorn Route Foreman',
      bio: 'Enforces illegal berry routes and punishes resistance with overwhelming numbers.',
      introLines: [
        'Every basket here pays me first.',
        'You are standing on Syndicate ground now.'
      ],
      defeatLines: [
        'This patch is yours... for now.',
        'I will remember this loss.'
      ]
    },
    teamPlan: {
      slots: ['lead_status', 'drain_core', 'pivot_speed', 'trap_tech', 'drain_core', 'closer'],
      speciesPools: {
        lead_status: ['Oddish', 'Cherubi'],
        drain_core: ['Bounsweet', 'Cherubi', 'Oddish'],
        pivot_speed: ['Pidgey', 'Pikachu'],
        trap_tech: ['Caterpie', 'Oddish'],
        closer: ['Bounsweet', 'Pikachu', 'Pidgey']
      },
      moveTags: ['status_open', 'sustain', 'trap', 'finisher'],
      preventDuplicates: false
    }
  }
};

export const POACHER_NPC_NAME_TO_TRAINER_IDS = {
  'Berry Poacher Duo': ['thorn-rusk-pruner', 'thorn-marta-siltgrin', 'thorn-kade-nix'],
  'Rusk "Pruner" Vale': ['thorn-rusk-pruner'],
  'Marta Siltgrin': ['thorn-marta-siltgrin'],
  'Kade & Nix, Basket Blades': ['thorn-kade-nix'],
  'Foreman Bramblejack': ['thorn-foreman-bramblejack'],
  'Bog Raider': ['thorn-mire-voss', 'thorn-marta-siltgrin'],
  'Honey Thief Crew': ['thorn-hive-lyra', 'thorn-kade-nix'],
  'Bug Specialist': ['thorn-hive-lyra']
};

export const getPoacherTrainerById = (trainerId) => POACHER_TRAINERS[trainerId] || null;


const randomFromPool = (pool = [], fallback = null) => {
  if (!Array.isArray(pool) || pool.length === 0) return fallback;
  return pool[Math.floor(Math.random() * pool.length)] || fallback;
};

export const buildPoacherRosterPlan = ({
  trainerId,
  baselineLevel = 8,
  fallbackSpecies,
  fallbackSpeciesPool = [],
  overrideTeamSizeRange
}) => {
  const trainer = getPoacherTrainerById(trainerId);
  if (!trainer?.teamPlan) {
    return [{ species: fallbackSpecies, level: Math.max(1, baselineLevel) }].filter((entry) => entry.species);
  }

  const difficultyTier = POACHER_DIFFICULTY_TIERS[trainer.difficultyTier] || POACHER_DIFFICULTY_TIERS[1];
  const [minTeamSize, maxTeamSize] = overrideTeamSizeRange || difficultyTier.teamSize || [3, 4];
  const desiredTeamSize = Math.max(minTeamSize || 1, Math.floor(Math.random() * ((maxTeamSize || minTeamSize || 1) - (minTeamSize || 1) + 1)) + (minTeamSize || 1));

  const slotPlan = Array.isArray(trainer.teamPlan.slots) && trainer.teamPlan.slots.length > 0
    ? trainer.teamPlan.slots
    : ['lead_harass', 'pivot_speed', 'closer'];

  const picks = [];
  for (let i = 0; i < desiredTeamSize; i += 1) {
    const slot = slotPlan[i] || slotPlan[slotPlan.length - 1];
    const pool = trainer.teamPlan.speciesPools?.[slot] || [];
    const fallbackPool = [fallbackSpecies, ...fallbackSpeciesPool].filter(Boolean);
    const species = randomFromPool(pool, randomFromPool(fallbackPool, fallbackSpecies));
    if (!species) continue;
    picks.push({
      species,
      level: Math.max(1, baselineLevel + Math.min(i, 3)),
      slot,
      trainerId: trainer.id,
      trainerDisplayName: trainer.displayName,
      trainerDifficultyTier: difficultyTier.id
    });
  }

  if (picks.length === 0 && fallbackSpecies) {
    picks.push({ species: fallbackSpecies, level: Math.max(1, baselineLevel), slot: 'fallback', trainerId: trainer.id });
  }

  return picks;
};

export const resolvePoacherTrainerPool = ({ nodeletId, npcLabel }) => {
  const mapped = POACHER_NPC_NAME_TO_TRAINER_IDS[npcLabel] || [];
  const filtered = mapped
    .map((trainerId) => POACHER_TRAINERS[trainerId])
    .filter(Boolean)
    .filter((trainer) => !nodeletId || trainer.allowedNodelets?.includes(nodeletId));

  if (filtered.length > 0) return filtered;

  return Object.values(POACHER_TRAINERS).filter((trainer) =>
    !nodeletId || trainer.allowedNodelets?.includes(nodeletId)
  );
};

export const pickWeightedPoacherTrainer = (trainerPool) => {
  if (!Array.isArray(trainerPool) || trainerPool.length === 0) return null;

  const total = trainerPool.reduce((sum, trainer) => sum + (trainer.rarityWeight || 0), 0);
  if (total <= 0) return trainerPool[0];

  let roll = Math.random() * total;
  for (const trainer of trainerPool) {
    roll -= trainer.rarityWeight || 0;
    if (roll <= 0) {
      return trainer;
    }
  }

  return trainerPool[0];
};

export const buildPoacherDifficultyContext = ({ trainer, baselineLevel = 8 }) => {
  if (!trainer) return null;

  const tier = POACHER_DIFFICULTY_TIERS[trainer.difficultyTier] || POACHER_DIFFICULTY_TIERS[1];
  return {
    trainerId: trainer.id,
    trainerName: trainer.displayName,
    difficultyTier: tier.id,
    aiProfile: tier.aiProfile,
    levelOffset: tier.levelOffset,
    level: Math.max(1, baselineLevel + (tier.levelOffset || 0)),
    teamSizeRange: tier.teamSize,
    rewardTier: trainer.rewardTier,
    lossProfile: trainer.lossProfile
  };
};

/**
 * Contract shape for loss consequence execution after nodelet-linked battles.
 *
 * {
 *   zoneId: string,
 *   nodeletId: string,
 *   battleType: 'enemyNpc' | 'locationExplore' | 'berry' | 'fishing' | 'apiary' | 'eclipse',
 *   trainerId?: string,
 *   trainerDifficultyTier?: 1|2|3|4,
 *   harvestTxnId?: string,
 *   triggeredByAction?: 'Harvest'|'Explore'|'Fish'|'DefendApiary',
 *   lossConsequencesProfile?: 'poacher_standard'|'poacher_boss'
 * }
 */
export const NODELET_BATTLE_CONTEXT_CONTRACT = true;

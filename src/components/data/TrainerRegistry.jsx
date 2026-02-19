/**
 * TrainerRegistry — Step 4
 *
 * Defines NPC trainer teams with full buildOverride support per slot.
 * Each trainer entry:
 * {
 *   id:          string           — unique trainer id
 *   name:        string           — display name
 *   trainerClass: string          — e.g. 'Bug Catcher', 'Ranger'
 *   party: [
 *     {
 *       species:       string
 *       level:         number
 *       buildOverride?: {
 *         nature?:      string
 *         ivTemplate?:  'competitive'|'physical'|'special'|'defensive'|'average'
 *         ivs?:         { hp, atk, def, spAtk, spDef, spd }
 *         evSpread?:    { hp, atk, def, spAtk, spDef, spd }
 *         moves?:       string[]         (up to 4)
 *         heldItem?:    string
 *         talents?:     { id, grade }[]
 *         ability?:     string
 *       }
 *     }
 *   ]
 *   postBattleDialogue?: string
 *   zone?:       string           — zone where this trainer is found
 * }
 */

export const TrainerRegistry = {

  // ── Verdant Hollow trainers ───────────────────────────────────────────────

  bug_catcher_tim: {
    id: 'bug_catcher_tim',
    name: 'Bug Catcher Tim',
    trainerClass: 'Bug Catcher',
    zone: 'Verdant Hollow',
    postBattleDialogue: "Ugh! My bugs lost again!",
    party: [
      {
        species: 'Caterpie',
        level: 5,
      },
      {
        species: 'Metapod',
        level: 7,
        buildOverride: {
          nature: 'Bold',
          ivTemplate: 'defensive',
          evSpread: { hp: 252, def: 252, spDef: 6 },
          moves: ['Harden', 'Tackle'],
        }
      }
    ]
  },

  youngster_sam: {
    id: 'youngster_sam',
    name: 'Youngster Sam',
    trainerClass: 'Youngster',
    zone: 'Verdant Hollow',
    postBattleDialogue: "You're pretty strong for a new trainer!",
    party: [
      {
        species: 'Pidgey',
        level: 8,
        buildOverride: {
          nature: 'Jolly',
          ivTemplate: 'physical',
          evSpread: { spd: 252, atk: 252, hp: 6 },
          moves: ['Tackle', 'Gust', 'Sand Attack', 'Quick Attack'],
        }
      },
      {
        species: 'Oddish',
        level: 6,
        buildOverride: {
          nature: 'Modest',
          ivTemplate: 'special',
          moves: ['Absorb', 'Poison Powder'],
        }
      }
    ]
  },

  lass_lily: {
    id: 'lass_lily',
    name: 'Lass Lily',
    trainerClass: 'Lass',
    zone: 'Verdant Hollow',
    postBattleDialogue: "Wow, you really know your Pokémon!",
    party: [
      {
        species: 'Oddish',
        level: 9,
        buildOverride: {
          nature: 'Calm',
          ivTemplate: 'special',
          evSpread: { spAtk: 252, hp: 252, spDef: 6 },
          moves: ['Absorb', 'Poison Powder', 'Stun Spore', 'Sleep Powder'],
          talents: [{ id: 'toxicAffinity', grade: 'Bronze' }]
        }
      },
      {
        species: 'Caterpie',
        level: 7,
      }
    ]
  },

  // ── Rival trainer ────────────────────────────────────────────────────────

  rival_cole: {
    id: 'rival_cole',
    name: 'Rival Cole',
    trainerClass: 'Rival',
    zone: 'Verdant Hollow',
    postBattleDialogue: "Tch… you got lucky. I'll be back stronger.",
    party: [
      {
        species: 'Pidgey',
        level: 12,
        buildOverride: {
          nature: 'Jolly',
          ivTemplate: 'competitive',
          evSpread: { spd: 252, atk: 252, hp: 6 },
          moves: ['Gust', 'Quick Attack', 'Sand Attack', 'Tackle'],
          heldItem: 'Oran Berry',
          talents: [{ id: 'swiftWing', grade: 'Bronze' }]
        }
      },
      {
        species: 'Oddish',
        level: 10,
        buildOverride: {
          nature: 'Modest',
          ivTemplate: 'special',
          evSpread: { spAtk: 252, hp: 128, spDef: 128 },
          moves: ['Absorb', 'Sleep Powder', 'Stun Spore', 'Mega Drain'],
        }
      }
    ]
  },

  // ── Ace Trainer (stronger, mid-game) ────────────────────────────────────

  ace_trainer_vera: {
    id: 'ace_trainer_vera',
    name: 'Ace Trainer Vera',
    trainerClass: 'Ace Trainer',
    zone: 'Verdant Hollow',
    postBattleDialogue: "Impressive. You have real talent.",
    party: [
      {
        species: 'Pikachu',
        level: 15,
        buildOverride: {
          nature: 'Timid',
          ivTemplate: 'competitive',
          evSpread: { spd: 252, spAtk: 252, hp: 6 },
          moves: ['Thunderbolt', 'Quick Attack', 'Agility', 'Thunder Wave'],
          heldItem: 'Silk Scarf',
          talents: [{ id: 'staticCharge', grade: 'Silver' }]
        }
      },
      {
        species: 'Oddish',
        level: 13,
        buildOverride: {
          nature: 'Bold',
          ivTemplate: 'defensive',
          evSpread: { hp: 252, def: 128, spDef: 128 },
          moves: ['Sleep Powder', 'Leech Seed', 'Giga Drain', 'Moonlight'],
          talents: [{ id: 'nightBlooming', grade: 'Bronze' }]
        }
      },
      {
        species: 'Butterfree',
        level: 14,
        buildOverride: {
          nature: 'Modest',
          ivTemplate: 'special',
          evSpread: { spAtk: 252, spd: 200, hp: 58 },
          moves: ['Gust', 'Confusion', 'Poison Powder', 'Sleep Powder'],
          heldItem: 'Wise Glasses',
        }
      }
    ]
  },
};

/**
 * Get a trainer definition by id.
 */
export function getTrainer(trainerId) {
  return TrainerRegistry[trainerId] || null;
}

/**
 * Get all trainers for a given zone.
 */
export function getTrainersForZone(zoneName) {
  return Object.values(TrainerRegistry).filter(t => t.zone === zoneName);
}
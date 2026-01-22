// Move Tutor definitions
// Each tutor can teach specific moves for a cost

export const MOVE_TUTORS = {
  wells: {
    npcId: 'wells',
    npcName: 'Wells',
    location: 'Verdant Hollow',
    description: 'A skilled craftsman who can teach Pokémon special techniques',
    moves: [
      {
        name: 'Seismic Toss',
        cost: { gold: 500, materials: [] },
        teachableTo: ['Machop', 'Machoke', 'Machamp', 'Hitmonlee', 'Hitmonchan', 'Primeape'],
        description: 'Throws the target with raw power, dealing damage equal to the user\'s level',
        trustRequired: 25
      },
      {
        name: 'Thunder Punch',
        cost: { gold: 750, materials: [{ name: 'Glowworm', quantity: 3 }] },
        teachableTo: ['Pikachu', 'Raichu', 'Electabuzz', 'Jolteon', 'Luxray', 'Machop', 'Machoke', 'Machamp'],
        description: 'An electrified punch that may paralyze the target',
        trustRequired: 50
      },
      {
        name: 'Fire Punch',
        cost: { gold: 750, materials: [{ name: 'Silk Fragment', quantity: 3 }] },
        teachableTo: ['Charmander', 'Charmeleon', 'Charizard', 'Magmar', 'Flareon', 'Machop', 'Machoke', 'Machamp'],
        description: 'A fiery punch that may burn the target',
        trustRequired: 50
      }
    ]
  },
  
  maple: {
    npcId: 'maple',
    npcName: 'Professor Maple',
    location: 'Maple\'s Lab',
    description: 'A renowned researcher who knows ancient move techniques',
    moves: [
      {
        name: 'Ancient Power',
        cost: { gold: 1000, materials: [{ name: 'Ancient Shard', quantity: 5 }] },
        teachableTo: ['Omanyte', 'Omastar', 'Kabuto', 'Kabutops', 'Aerodactyl'],
        description: 'The user attacks with ancient power, may raise all stats',
        trustRequired: 75
      },
      {
        name: 'Heal Bell',
        cost: { gold: 1200, materials: [{ name: 'Moonleaf', quantity: 5 }] },
        teachableTo: ['Bulbasaur', 'Ivysaur', 'Venusaur', 'Chansey', 'Blissey', 'Miltank'],
        description: 'The user makes a soothing sound that heals all status conditions of allies',
        trustRequired: 100
      }
    ]
  },
  
  marlo: {
    npcId: 'marlo',
    npcName: 'Marlo',
    location: 'Fishing Spots',
    description: 'An expert angler who teaches water-type techniques',
    moves: [
      {
        name: 'Aqua Jet',
        cost: { gold: 600, materials: [{ name: 'River Stone', quantity: 2 }] },
        teachableTo: ['Squirtle', 'Wartortle', 'Blastoise', 'Goldeen', 'Seaking', 'Magikarp', 'Gyarados'],
        description: 'The user lunges at the target with high speed priority',
        trustRequired: 30
      },
      {
        name: 'Whirlpool',
        cost: { gold: 800, materials: [{ name: 'River Stone', quantity: 4 }] },
        teachableTo: ['Squirtle', 'Wartortle', 'Blastoise', 'Horsea', 'Seadra', 'Lapras', 'Vaporeon'],
        description: 'Traps the target in a whirlpool for several turns',
        trustRequired: 60
      }
    ]
  }
};

/**
 * Get all moves a tutor can teach
 * @param {string} tutorId - Tutor NPC ID
 * @returns {Array} Array of move objects
 */
export function getTutorMoves(tutorId) {
  const tutor = MOVE_TUTORS[tutorId];
  return tutor ? tutor.moves : [];
}

/**
 * Check if a Pokémon can learn a move from a tutor
 * @param {string} species - Pokémon species name
 * @param {string} moveName - Move name
 * @returns {boolean}
 */
export function canLearnFromTutor(species, moveName) {
  for (const tutor of Object.values(MOVE_TUTORS)) {
    const move = tutor.moves.find(m => m.name === moveName);
    if (move && move.teachableTo.includes(species)) {
      return true;
    }
  }
  return false;
}

/**
 * Get all tutors that can teach a specific move
 * @param {string} moveName - Move name
 * @returns {Array} Array of tutor objects
 */
export function getTutorsForMove(moveName) {
  const tutors = [];
  
  for (const [tutorId, tutor] of Object.entries(MOVE_TUTORS)) {
    const move = tutor.moves.find(m => m.name === moveName);
    if (move) {
      tutors.push({ ...tutor, tutorId });
    }
  }
  
  return tutors;
}
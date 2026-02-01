// Pokémon evolution chains and conditions
import { PokemonRegistry } from '@/components/data/PokemonRegistry';
import { assignRandomTalents } from '@/components/utils/talentAssignment';

export const EVOLUTION_CHAINS = {
  // Starter evolutions
  Charmander: {
    evolvesInto: 'Charmeleon',
    method: 'level',
    requirement: 16
  },
  Charmeleon: {
    evolvesInto: 'Charizard',
    method: 'level',
    requirement: 36
  },
  
  Bulbasaur: {
    evolvesInto: 'Ivysaur',
    method: 'level',
    requirement: 16
  },
  Ivysaur: {
    evolvesInto: 'Venusaur',
    method: 'level',
    requirement: 32
  },
  
  Squirtle: {
    evolvesInto: 'Wartortle',
    method: 'level',
    requirement: 16
  },
  Wartortle: {
    evolvesInto: 'Blastoise',
    method: 'level',
    requirement: 36
  },
  
  // Common Pokémon
  Pidgey: {
    evolvesInto: 'Pidgeotto',
    method: 'level',
    requirement: 18
  },
  Pidgeotto: {
    evolvesInto: 'Pidgeot',
    method: 'level',
    requirement: 36
  },
  
  Rattata: {
    evolvesInto: 'Raticate',
    method: 'level',
    requirement: 20
  },
  
  Caterpie: {
    evolvesInto: 'Metapod',
    method: 'level',
    requirement: 7
  },
  Metapod: {
    evolvesInto: 'Butterfree',
    method: 'level',
    requirement: 10
  },

  Oddish: {
    evolvesInto: 'Gloom',
    method: 'level',
    requirement: 21
  },
  
  // Stone evolutions
  Pikachu: {
    evolvesInto: 'Raichu',
    method: 'item',
    requirement: 'Thunder Stone'
  },
  
  Eevee: [
    {
      evolvesInto: 'Vaporeon',
      method: 'item',
      requirement: 'Water Stone'
    },
    {
      evolvesInto: 'Jolteon',
      method: 'item',
      requirement: 'Thunder Stone'
    },
    {
      evolvesInto: 'Flareon',
      method: 'item',
      requirement: 'Fire Stone'
    },
    {
      evolvesInto: 'Espeon',
      method: 'happiness',
      requirement: 220,
      timeOfDay: 'Day'
    },
    {
      evolvesInto: 'Umbreon',
      method: 'happiness',
      requirement: 220,
      timeOfDay: 'Night'
    }
  ],
  
  Gloom: [
    {
      evolvesInto: 'Vileplume',
      method: 'item',
      requirement: 'Leaf Stone'
    },
    {
      evolvesInto: 'Bellossom',
      method: 'item',
      requirement: 'Sun Stone'
    }
  ],
  
  Poliwhirl: [
    {
      evolvesInto: 'Poliwrath',
      method: 'item',
      requirement: 'Water Stone'
    },
    {
      evolvesInto: 'Politoed',
      method: 'item',
      requirement: 'King\'s Rock'
    }
  ]
};

// Updated base stats for evolved forms
export const EVOLVED_STATS_MODIFIERS = {
  // First stage evolution: +20-30 to each stat
  Charmeleon: { hp: 25, atk: 28, def: 23, spAtk: 30, spDef: 25, spd: 28 },
  Ivysaur: { hp: 20, atk: 22, def: 23, spAtk: 30, spDef: 30, spd: 20 },
  Wartortle: { hp: 25, atk: 23, def: 30, spAtk: 25, spDef: 30, spd: 23 },
  
  // Final stage evolution: +35-50 to each stat
  Charizard: { hp: 40, atk: 44, def: 38, spAtk: 55, spDef: 42, spd: 50 },
  Venusaur: { hp: 40, atk: 42, def: 43, spAtk: 50, spDef: 50, spd: 40 },
  Blastoise: { hp: 50, atk: 43, def: 50, spAtk: 45, spDef: 52, spd: 38 },
  
  Pidgeotto: { hp: 23, atk: 20, def: 20, spAtk: 18, spDef: 18, spd: 28 },
  Pidgeot: { hp: 40, atk: 40, def: 38, spAtk: 35, spDef: 35, spd: 51 },
  
  Raticate: { hp: 30, atk: 41, def: 30, spAtk: 25, spDef: 35, spd: 48 },
  
  Metapod: { hp: 5, atk: 0, def: 25, spAtk: 5, spDef: 10, spd: 5 },
  Butterfree: { hp: 20, atk: 23, def: 25, spAtk: 40, spDef: 40, spd: 35 },
  
  Raichu: { hp: 25, atk: 45, def: 25, spAtk: 45, spDef: 40, spd: 50 },
  
  Vaporeon: { hp: 65, atk: 33, def: 30, spAtk: 55, spDef: 48, spd: 33 },
  Jolteon: { hp: 33, atk: 33, def: 30, spAtk: 55, spDef: 48, spd: 65 },
  Flareon: { hp: 33, atk: 65, def: 30, spAtk: 48, spDef: 55, spd: 33 },
  Espeon: { hp: 33, atk: 33, def: 30, spAtk: 65, spDef: 48, spd: 55 },
  Umbreon: { hp: 48, atk: 33, def: 55, spAtk: 30, spDef: 65, spd: 33 },
};

// Role changes on evolution
export const EVOLUTION_ROLE_CHANGES = {
  Charizard: ['Striker', 'Scout'],
  Venusaur: ['Medic', 'Tank'],
  Blastoise: ['Tank', 'Juggernaut'],
  Pidgeot: ['Scout'],
  Raticate: ['Striker'],
  Butterfree: ['Support'],
  Raichu: ['Striker'],
};

/**
 * Check if a Pokémon can evolve
 * @param {Object} pokemon - Pokémon object
 * @param {number} newLevel - New level after level up (optional)
 * @param {string} itemUsed - Evolution item used (optional)
 * @param {Object} conditions - Additional conditions (happiness, time, etc)
 * @returns {Object|null} Evolution data or null
 */
export function checkEvolution(pokemon, newLevel = null, itemUsed = null, conditions = {}) {
  const evolution = EVOLUTION_CHAINS[pokemon.species];
  if (!evolution) return null;
  
  // Handle multiple evolution paths (like Eevee)
  const evolutions = Array.isArray(evolution) ? evolution : [evolution];
  const levelToCheck = newLevel ?? pokemon.level;
  
  for (const evo of evolutions) {
    // Level-based evolution
    if (evo.method === 'level') {
      const canEvolve = levelToCheck >= evo.requirement;
      return {
        evolvesInto: evo.evolvesInto,
        evolvesTo: evo.evolvesInto,
        method: 'Level',
        requirement: evo.requirement,
        canEvolve,
        reason: canEvolve ? null : `Reach level ${evo.requirement}`
      };
    }
    
    // Item-based evolution
    if (evo.method === 'item') {
      const canEvolve = itemUsed === evo.requirement;
      return {
        evolvesInto: evo.evolvesInto,
        evolvesTo: evo.evolvesInto,
        method: 'Item',
        requirement: evo.requirement,
        canEvolve,
        reason: canEvolve ? null : `Use ${evo.requirement}`
      };
    }
    
    // Happiness-based evolution
    if (evo.method === 'happiness') {
      const currentTime = conditions.timeOfDay || 'Day';
      const meetsHappiness = (conditions.happiness || 0) >= evo.requirement;
      const meetsTime = !evo.timeOfDay || currentTime === evo.timeOfDay;
      const canEvolve = meetsHappiness && meetsTime;
      return {
        evolvesInto: evo.evolvesInto,
        evolvesTo: evo.evolvesInto,
        method: 'Happiness',
        requirement: evo.requirement,
        canEvolve,
        reason: canEvolve
          ? null
          : evo.timeOfDay && !meetsTime
            ? `Evolve during the ${evo.timeOfDay.toLowerCase()}`
            : 'Increase happiness to evolve',
        timeOfDay: evo.timeOfDay
      };
    }
  }
  
  return null;
}

/**
 * Get evolved stats for a Pokémon
 * @param {string} evolvedSpecies - Name of evolved species
 * @param {Object} currentStats - Current stats
 * @returns {Object} New stats
 */
export function getEvolvedStats(evolvedSpecies, currentStats) {
  const modifiers = EVOLVED_STATS_MODIFIERS[evolvedSpecies];
  if (!modifiers) return currentStats;
  
  return {
    hp: currentStats.hp + modifiers.hp,
    maxHp: currentStats.maxHp + modifiers.hp,
    atk: currentStats.atk + modifiers.atk,
    def: currentStats.def + modifiers.def,
    spAtk: currentStats.spAtk + modifiers.spAtk,
    spDef: currentStats.spDef + modifiers.spDef,
    spd: currentStats.spd + modifiers.spd
  };
}

/**
 * Get new roles for evolved Pokémon
 * @param {string} evolvedSpecies - Name of evolved species
 * @param {Array} currentRoles - Current roles
 * @returns {Array} New roles
 */
export function getEvolvedRoles(evolvedSpecies, currentRoles) {
  return EVOLUTION_ROLE_CHANGES[evolvedSpecies] || currentRoles;
}

export function getEvolutionMoveOptions(evolvedSpecies) {
  const speciesData = PokemonRegistry[evolvedSpecies?.toLowerCase()];
  if (!speciesData?.learnset) return [];
  if (Array.isArray(speciesData.learnset)) {
    return speciesData.learnset
      .filter((move) => move.level === 1)
      .map((move) => move.name || move.move);
  }
  return speciesData.learnset[1] || [];
}

/**
 * Evolve a Pokémon and update all relevant data
 * @param {Object} pokemon - Pokemon object to evolve
 * @param {string} evolvesInto - Species name to evolve into
 * @returns {Object} Updated Pokemon with evolved data
 */
export function evolvePokemon(pokemon, evolvesInto) {
  const currentStats = {
    hp: pokemon.currentHp,
    maxHp: pokemon.stats?.hp || pokemon.level * 2 + 60,
    atk: pokemon.stats?.atk || 50,
    def: pokemon.stats?.def || 50,
    spAtk: pokemon.stats?.spAtk || 50,
    spDef: pokemon.stats?.spDef || 50,
    spd: pokemon.stats?.spd || 50
  };

  const newStats = getEvolvedStats(evolvesInto, currentStats);
  const newRoles = getEvolvedRoles(evolvesInto, pokemon.roles || []);
  const newSpecies = PokemonRegistry[evolvesInto?.toLowerCase()];
  const retainedTalents = (pokemon.talents || []).filter((talent) => {
    if (!newSpecies?.talentPool) return true;
    return newSpecies.talentPool.includes(talent.id);
  });
  const evolvedTalents = newSpecies?.talentPool
    ? assignRandomTalents({ talentPool: newSpecies.talentPool, talents: retainedTalents }, {
      existingTalents: retainedTalents
    })
    : retainedTalents;

  return {
    ...pokemon,
    species: evolvesInto,
    roles: newRoles,
    stats: newStats,
    currentHp: newStats.maxHp, // Heal to full on evolution
    evolutionMoveOptions: getEvolutionMoveOptions(evolvesInto),
    // Preserve talents from pre-evolution, filter invalid ones
    talents: evolvedTalents,
    // Flag for future NPC talent teaching
    canLearnNewTalents: true
  };
}

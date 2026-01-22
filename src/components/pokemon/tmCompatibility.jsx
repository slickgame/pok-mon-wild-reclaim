// TM/HM compatibility lists for each move
// Format: { moveName: [compatible species] }

export const TM_COMPATIBILITY = {
  // Fire Moves
  'Flamethrower': ['Charmander', 'Charmeleon', 'Charizard', 'Vulpix', 'Ninetales', 'Growlithe', 'Arcanine', 'Ponyta', 'Rapidash', 'Magmar', 'Flareon', 'Moltres'],
  'Fire Blast': ['Charmander', 'Charmeleon', 'Charizard', 'Ninetales', 'Arcanine', 'Rapidash', 'Magmar', 'Flareon', 'Moltres'],
  
  // Water Moves
  'Surf': ['Squirtle', 'Wartortle', 'Blastoise', 'Psyduck', 'Golduck', 'Poliwag', 'Poliwhirl', 'Poliwrath', 'Tentacool', 'Tentacruel', 'Slowpoke', 'Slowbro', 'Seel', 'Dewgong', 'Shellder', 'Cloyster', 'Krabby', 'Kingler', 'Horsea', 'Seadra', 'Goldeen', 'Seaking', 'Staryu', 'Starmie', 'Magikarp', 'Gyarados', 'Lapras', 'Vaporeon', 'Omanyte', 'Omastar', 'Kabuto', 'Kabutops'],
  'Hydro Pump': ['Squirtle', 'Wartortle', 'Blastoise', 'Golduck', 'Poliwrath', 'Tentacruel', 'Slowbro', 'Cloyster', 'Kingler', 'Seadra', 'Starmie', 'Gyarados', 'Lapras', 'Vaporeon'],
  
  // Grass Moves
  'Solar Beam': ['Bulbasaur', 'Ivysaur', 'Venusaur', 'Oddish', 'Gloom', 'Vileplume', 'Paras', 'Parasect', 'Bellsprout', 'Weepinbell', 'Victreebel', 'Exeggcute', 'Exeggutor', 'Tangela', 'Moltres'],
  
  // Electric Moves
  'Thunderbolt': ['Pikachu', 'Raichu', 'Magnemite', 'Magneton', 'Voltorb', 'Electrode', 'Electabuzz', 'Jolteon', 'Zapdos', 'Luxray'],
  'Thunder': ['Pikachu', 'Raichu', 'Magneton', 'Electrode', 'Electabuzz', 'Jolteon', 'Zapdos', 'Luxray'],
  
  // Psychic Moves
  'Psychic': ['Butterfree', 'Venonat', 'Venomoth', 'Psyduck', 'Golduck', 'Kadabra', 'Alakazam', 'Slowpoke', 'Slowbro', 'Drowzee', 'Hypno', 'Exeggcute', 'Exeggutor', 'Starmie', 'Mr. Mime', 'Jynx', 'Mewtwo', 'Mew'],
  
  // Ice Moves
  'Ice Beam': ['Squirtle', 'Wartortle', 'Blastoise', 'Psyduck', 'Golduck', 'Slowpoke', 'Slowbro', 'Seel', 'Dewgong', 'Shellder', 'Cloyster', 'Lapras', 'Vaporeon', 'Articuno'],
  'Blizzard': ['Dewgong', 'Cloyster', 'Jynx', 'Lapras', 'Articuno'],
  
  // Normal Moves
  'Hyper Beam': ['Pidgeot', 'Raticate', 'Fearow', 'Arcanine', 'Rapidash', 'Snorlax', 'Dragonite', 'Mewtwo', 'Mew'],
  
  // Fighting Moves
  'Submission': ['Mankey', 'Primeape', 'Machop', 'Machoke', 'Machamp', 'Poliwrath', 'Hitmonlee', 'Hitmonchan'],
  
  // Dark Moves
  'Shadow Ball': ['Gastly', 'Haunter', 'Gengar', 'Drowzee', 'Hypno', 'Mewtwo', 'Mew'],
  
  // Dragon Moves
  'Dragon Claw': ['Charmander', 'Charmeleon', 'Charizard', 'Dragonite'],
  
  // Universal TMs (can be learned by many)
  'Toxic': ['Bulbasaur', 'Ivysaur', 'Venusaur', 'Ekans', 'Arbok', 'Nidoran', 'Nidorina', 'Nidoqueen', 'Nidorino', 'Nidoking', 'Zubat', 'Golbat', 'Oddish', 'Gloom', 'Vileplume', 'Venonat', 'Venomoth', 'Grimer', 'Muk', 'Gastly', 'Haunter', 'Gengar', 'Koffing', 'Weezing', 'Tentacool', 'Tentacruel'],
  'Protect': [], // Universal - all Pokémon can learn
  'Rest': [], // Universal - all Pokémon can learn
  'Substitute': [], // Universal - all Pokémon can learn
};

/**
 * Check if a Pokémon species can learn a specific move via TM
 * @param {string} species - Pokémon species name
 * @param {string} moveName - Move name
 * @returns {boolean}
 */
export function canLearnTM(species, moveName) {
  const compatible = TM_COMPATIBILITY[moveName];
  if (!compatible) return false;
  
  // Empty array means universal TM
  if (compatible.length === 0) return true;
  
  return compatible.includes(species);
}

/**
 * Get all TM-compatible moves for a species
 * @param {string} species - Pokémon species name
 * @returns {string[]} Array of move names
 */
export function getCompatibleTMs(species) {
  const compatible = [];
  
  for (const [moveName, speciesList] of Object.entries(TM_COMPATIBILITY)) {
    if (speciesList.length === 0 || speciesList.includes(species)) {
      compatible.push(moveName);
    }
  }
  
  return compatible;
}
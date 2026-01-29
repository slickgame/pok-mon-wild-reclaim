import { PokemonRegistry } from '@/components/data/PokemonRegistry';
import { consumeItem, playerHasItem } from '@/utils/itemUtils';

const gradeWeights = {
  Basic: 0.75,
  Rare: 0.2,
  Epic: 0.05
};

function rollGrade() {
  const roll = Math.random();
  let cumulative = 0;
  for (const grade of Object.keys(gradeWeights)) {
    cumulative += gradeWeights[grade];
    if (roll <= cumulative) return grade;
  }
  return 'Basic';
}

function rollTalentCount() {
  const roll = Math.random();
  if (roll < 0.4) return 0;
  if (roll < 0.8) return 1;
  if (roll < 0.95) return 2;
  return 3;
}

function getTalentPoolFor(species) {
  return PokemonRegistry[species?.toLowerCase()]?.talentPool || [];
}

export function reRollTalents(pokemon, inventory) {
  if (!playerHasItem(inventory, 'Talent Crystal')) {
    return { success: false, reason: 'Missing Talent Crystal.' };
  }

  const pool = getTalentPoolFor(pokemon.species);
  if (!pool || pool.length === 0) {
    return { success: false, reason: 'No talent pool defined.' };
  }

  const count = rollTalentCount();
  const newTalents = [];

  while (newTalents.length < count) {
    const rand = pool[Math.floor(Math.random() * pool.length)];
    if (newTalents.some((entry) => entry.id === rand)) continue;
    newTalents.push({ id: rand, grade: rollGrade() });
  }

  const { updatedInventory, item } = consumeItem(inventory, 'Talent Crystal', 1);

  return {
    success: true,
    talents: newTalents,
    inventory: updatedInventory,
    consumedItem: item
  };
}

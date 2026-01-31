import { MOVE_DATA } from '@/components/pokemon/moveData';
import { TalentRegistry } from '@/components/data/TalentRegistry';

const VALID_TAGS = [
  "Spore",
  "Powder",
  "Drain",
  "Healing",
  "Status",
  "Cleanse",
  "Terrain",
  "Flying",
  "Poison",
  "Grass",
  "Physical"
];

export function validateTagsAndTriggers() {
  for (const move of Object.values(MOVE_DATA)) {
    if (!Array.isArray(move.tags)) {
      console.warn(`Move ${move.name || 'Unknown'} is missing or has invalid tags`);
    }
  }

  for (const talent of Object.values(TalentRegistry)) {
    if (!talent?.tagsAffected) continue;
    for (const tag of talent.tagsAffected) {
      if (!VALID_TAGS.includes(tag)) {
        console.warn(`Talent ${talent.name || talent.id || 'Unknown'} has unknown tag: ${tag}`);
      }
    }
  }
}

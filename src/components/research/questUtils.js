import { TalentRegistry } from '@/components/data/TalentRegistry';
import { formatTalentName, normalizeTalentGrade, resolveTalentKey } from '@/components/utils/talentUtils';
import talentTagIcons from '@/components/research/talentTagIcons.json';

const gradeRanking = {
  Basic: 1,
  Rare: 2,
  Epic: 3,
  Diamond: 4
};

const statNameMap = {
  HP: 'HP',
  Atk: 'Attack',
  Def: 'Defense',
  SpAtk: 'Sp. Atk',
  SpDef: 'Sp. Def',
  Speed: 'Speed'
};

const statAliases = {
  hp: 'HP',
  atk: 'Atk',
  def: 'Def',
  spatk: 'SpAtk',
  spdef: 'SpDef',
  speed: 'Speed',
  spd: 'Speed'
};

function normalizeStatKey(statKey) {
  if (!statKey) return statKey;
  const normalized = statKey.toString().replace(/\s+/g, '');
  return statAliases[normalized.toLowerCase()] || normalized;
}

function getQuestField(quest, key) {
  return quest[key] ?? quest.requirements?.[key];
}

function formatTagIcons(tags = []) {
  return tags
    .map((tag) => {
      const normalized = tag?.toString?.().toLowerCase?.();
      const icon = talentTagIcons[normalized];
      return icon ? `${icon} ${tag}` : tag;
    })
    .filter(Boolean)
    .join(', ');
}

export function pokemonFulfillsQuest(pokemon, quest) {
  if (!pokemon || !quest) return false;
  if (pokemon.isWildInstance) return false;
  if (pokemon.species !== quest.species) return false;

  const questNature = getQuestField(quest, 'nature');
  const questLevel = getQuestField(quest, 'level');
  const ivConditions = getQuestField(quest, 'ivConditions') || [];
  const talentConditions = getQuestField(quest, 'talentConditions') || [];
  const shinyRequired = quest.shinyRequired || quest.requirements?.shinyRequired;
  const alphaRequired = quest.alphaRequired || quest.requirements?.alphaRequired;
  const bondedRequired = quest.bondedRequired || quest.requirements?.bondedRequired;
  const hiddenAbilityRequired = quest.hiddenAbilityRequired || quest.requirements?.hiddenAbilityRequired;

  if (questNature && pokemon.nature !== questNature) return false;
  if (questLevel && (pokemon.level || 0) < questLevel) return false;

  if (ivConditions.length) {
    if (!pokemon.ivs) return false;
    const ivMatch = ivConditions.every((iv) => {
      const statKey = normalizeStatKey(iv.stat);
      const value = pokemon.ivs[statKey] ?? pokemon.ivs[statKey?.toLowerCase?.()];
      return (value || 0) >= iv.min;
    });
    if (!ivMatch) return false;
  }

  if (talentConditions.length) {
    const talents = Array.isArray(pokemon.talents) ? pokemon.talents : (pokemon.talents ? [pokemon.talents] : []);
    const normalizedTalents = talents.map((talent) => {
      const talentKey = resolveTalentKey(talent);
      const grade = normalizeTalentGrade(typeof talent === 'object' ? talent.grade : talent?.grade);
      const tags = TalentRegistry[talentKey]?.tagsAffected || [];
      return { talentKey, grade, tags };
    });

    const talentMatch = talentConditions.every((condition) => {
      if (condition.talentId) {
        return normalizedTalents.some((talent) => {
          const matchesTalent = talent.talentKey === condition.talentId;
          const matchesGrade = (gradeRanking[talent.grade] || 0) >= (gradeRanking[condition.grade] || 0);
          const matchesTags = condition.requiredTags?.length
            ? condition.requiredTags.some((tag) => talent.tags.includes(tag))
            : true;
          return matchesTalent && matchesGrade && matchesTags;
        });
      }

      const requiredGrades = (condition.grades || [])
        .map((grade) => gradeRanking[grade] || 0)
        .sort((a, b) => b - a);
      const availableGrades = normalizedTalents
        .filter((talent) => (
          condition.requiredTags?.length
            ? condition.requiredTags.some((tag) => talent.tags.includes(tag))
            : true
        ))
        .map((talent) => gradeRanking[talent.grade] || 0)
        .sort((a, b) => b - a);

      if (requiredGrades.length === 0) {
        return availableGrades.length >= condition.count;
      }
      if (availableGrades.length < condition.count) return false;
      return requiredGrades.every((grade, index) => (availableGrades[index] || 0) >= grade);
    });

    if (!talentMatch) return false;
  }

  if (shinyRequired && !pokemon.isShiny) return false;
  if (alphaRequired && !pokemon.isAlpha) return false;
  if (bondedRequired && !pokemon.isBonded) return false;
  if (hiddenAbilityRequired && !pokemon.hasHiddenAbility) return false;

  return true;
}

export function getEligiblePokemon(playerCollection, quest) {
  if (!quest) return [];
  return playerCollection.filter((pokemon) => pokemonFulfillsQuest(pokemon, quest));
}

export function formatPokemonCard(pokemon) {
  if (!pokemon) return '';
  const ivs = Object.entries(pokemon.ivs || {})
    .map(([stat, value]) => `${statNameMap[normalizeStatKey(stat)] || stat} IV: ${value}`)
    .join(', ');

  const talents = (pokemon.talents || [])
    .map((talent) => {
      const talentKey = resolveTalentKey(talent);
      const grade = normalizeTalentGrade(typeof talent === 'object' ? talent.grade : talent?.grade);
      const displayName = TalentRegistry[talentKey]?.name || formatTalentName(talentKey);
      return `${displayName} (${grade})`;
    })
    .join(', ') || 'None';

  return [
    `${pokemon.nickname || pokemon.species} (Lv. ${pokemon.level})`,
    pokemon.nature ? `Nature: ${pokemon.nature}` : null,
    pokemon.isShiny ? 'Shiny: Yes' : null,
    pokemon.isAlpha ? 'Alpha: Yes' : null,
    pokemon.hasHiddenAbility ? 'Hidden Ability: Yes' : null,
    pokemon.isBonded ? 'Bonded: Yes' : null,
    ivs ? `IVs: ${ivs}` : null,
    `Talents: ${talents}`
  ].filter(Boolean).join('\n');
}

export function formatQuestCard(quest) {
  if (!quest) return '';
  const questNature = getQuestField(quest, 'nature');
  const questLevel = getQuestField(quest, 'level');
  const requiredCount = getQuestField(quest, 'quantityRequired') || quest.requiredCount || 1;
  const ivConditions = getQuestField(quest, 'ivConditions') || [];
  const talentConditions = getQuestField(quest, 'talentConditions') || [];
  const shinyRequired = quest.shinyRequired || quest.requirements?.shinyRequired;
  const alphaRequired = quest.alphaRequired || quest.requirements?.alphaRequired;
  const bondedRequired = quest.bondedRequired || quest.requirements?.bondedRequired;
  const hiddenAbilityRequired = quest.hiddenAbilityRequired || quest.requirements?.hiddenAbilityRequired;

  const ivText = ivConditions.map((iv) => {
    const statLabel = statNameMap[normalizeStatKey(iv.stat)] || iv.stat;
    return `${statLabel} IV ≥ ${iv.min}`;
  }).join(', ');

  const talentText = talentConditions.map((condition) => {
    if (condition.talentId) {
      const displayName = TalentRegistry[condition.talentId]?.name || formatTalentName(condition.talentId);
      const tagText = condition.requiredTags?.length
        ? ` (${formatTagIcons(condition.requiredTags)})`
        : '';
      return `${displayName} ${condition.grade}+${tagText}`;
    }
    const gradeList = condition.grades?.length ? condition.grades.join(', ') : 'Basic+';
    const tagText = condition.requiredTags?.length
      ? ` (${formatTagIcons(condition.requiredTags)})`
      : '';
    return `Any ${condition.count} talents (${gradeList})${tagText}`;
  }).join(', ');

  return [
    `Quest ID: ${quest.id || 'Research Quest'}`,
    `Target: ${quest.species}`,
    requiredCount > 1 ? `Quantity: Submit ${requiredCount}` : null,
    questNature ? `Nature: ${questNature}` : null,
    questLevel ? `Level ≥ ${questLevel}` : null,
    ivText ? `IVs: ${ivText}` : null,
    talentText ? `Talents: ${talentText}` : null,
    shinyRequired ? 'Shiny: Required' : null,
    alphaRequired ? 'Alpha: Required' : null,
    hiddenAbilityRequired ? 'Hidden Ability: Required' : null,
    bondedRequired ? 'Bonded: Required' : null,
    quest.reward?.gold ? `Reward: ${quest.reward.gold} gold` : null,
    quest.reward?.trustGain ? `Trust +${quest.reward.trustGain}` : null,
    quest.reward?.notesGain ? `Research Notes +${quest.reward.notesGain}` : null,
    quest.difficulty ? `Difficulty: ${quest.difficulty}` : null
  ].filter(Boolean).join('\n');
}

import {
  submitMultiplePokemon,
  isPokemonAlreadySubmitted,
  isQuestCompleted,
  getSubmissionCount,
  markQuestComplete
} from './questProgressTracker';

export function handleSubmitAllEligible({ quest, eligiblePokemon, requiredCount, onComplete }) {
  if (!eligiblePokemon?.length) {
    return { status: 'empty', message: 'No eligible Pokémon available for submission.', submitted: [] };
  }

  if (isQuestCompleted(quest.id)) {
    return { status: 'completed', message: 'Quest already completed.', submitted: [] };
  }

  const newSubmissions = eligiblePokemon.filter((pokemon) => !isPokemonAlreadySubmitted(quest.id, pokemon.id));
  if (newSubmissions.length === 0) {
    return { status: 'duplicate', message: 'All eligible Pokémon have already been submitted.', submitted: [] };
  }

  submitMultiplePokemon(quest.id, newSubmissions.map((pokemon) => pokemon.id));

  const count = getSubmissionCount(quest.id);
  if (count >= requiredCount) {
    markQuestComplete(quest.id);
    onComplete?.();
    return { status: 'completed', message: 'Quest completed!', submitted: newSubmissions };
  }

  return { status: 'partial', message: `Submitted ${newSubmissions.length} Pokémon.`, submitted: newSubmissions };
}

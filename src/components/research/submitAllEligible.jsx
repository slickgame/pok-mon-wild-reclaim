import { submitPokemonToQuest, getSubmissionCount } from './questProgressTracker';

export function handleSubmitAllEligible({ quest, eligiblePokemon, requiredCount, onComplete }) {
  const initialCount = getSubmissionCount(quest.id);
  const remainingNeeded = Math.max(requiredCount - initialCount, 0);
  const toSubmit = eligiblePokemon.slice(0, remainingNeeded);

  toSubmit.forEach((pokemon) => {
    submitPokemonToQuest(quest.id, pokemon.id);
  });

  const newCount = getSubmissionCount(quest.id);
  const isCompleted = newCount >= requiredCount;

  if (isCompleted && onComplete) {
    onComplete();
  }

  return {
    status: isCompleted ? 'completed' : 'partial',
    submitted: toSubmit,
    newCount
  };
}
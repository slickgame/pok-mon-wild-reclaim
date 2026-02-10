// This function doesn't need external dependencies for the simple case
export function handleSubmitAllEligible({ quest, eligiblePokemon, requiredCount, onComplete }) {
  const toSubmit = eligiblePokemon.slice(0, requiredCount);

  if (onComplete) {
    onComplete(toSubmit);
  }

  return {
    status: toSubmit.length >= requiredCount ? 'completed' : 'partial',
    submitted: toSubmit,
    newCount: toSubmit.length
  };
}
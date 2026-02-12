const STORAGE_KEY = 'researchQuestProgress';

export function loadQuestProgress() {
  const data = localStorage.getItem(STORAGE_KEY);
  return data ? JSON.parse(data) : {};
}

export function saveQuestProgress(progress) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
}

export function ensureQuestInitialized(progress, questId) {
  if (!progress[questId]) {
    progress[questId] = {
      submittedPokemon: [],
      completed: false
    };
  }
}

export function isQuestCompleted(questId) {
  const progress = loadQuestProgress();
  return !!progress[questId]?.completed;
}

export function hasQuestBonusClaimed(questId) {
  const progress = loadQuestProgress();
  return !!progress[questId]?.bonusClaimed;
}

export function markQuestBonusClaimed(questId) {
  const progress = loadQuestProgress();
  ensureQuestInitialized(progress, questId);
  progress[questId].bonusClaimed = true;
  saveQuestProgress(progress);
}

export function isPokemonAlreadySubmitted(questId, pokemonId) {
  const progress = loadQuestProgress();
  return progress[questId]?.submittedPokemon?.includes(pokemonId);
}

export function submitPokemonToQuest(questId, pokemonId) {
  const progress = loadQuestProgress();
  ensureQuestInitialized(progress, questId);

  if (!progress[questId].submittedPokemon.includes(pokemonId)) {
    progress[questId].submittedPokemon.push(pokemonId);
  }

  saveQuestProgress(progress);
}

export function submitMultiplePokemon(questId, pokemonIds = []) {
  const progress = loadQuestProgress();
  ensureQuestInitialized(progress, questId);

  const newIds = pokemonIds.filter((id) => !progress[questId].submittedPokemon.includes(id));
  progress[questId].submittedPokemon.push(...newIds);

  saveQuestProgress(progress);
}

export function markQuestComplete(questId) {
  const progress = loadQuestProgress();
  ensureQuestInitialized(progress, questId);
  progress[questId].completed = true;
  saveQuestProgress(progress);
}

export function getSubmissionCount(questId) {
  const progress = loadQuestProgress();
  return progress[questId]?.submittedPokemon?.length || 0;
}

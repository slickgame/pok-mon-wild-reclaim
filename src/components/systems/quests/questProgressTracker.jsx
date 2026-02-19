/**
 * Quest Progress Tracker
 * Tracks submission counts for research quests using localStorage.
 */

const STORAGE_KEY = 'questSubmissionCounts';

function getStore() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

function saveStore(store) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(store));
  } catch {
    // ignore storage errors
  }
}

export function incrementSubmissionCount(questId) {
  if (!questId) return;
  const store = getStore();
  store[questId] = (store[questId] || 0) + 1;
  saveStore(store);
}

export function getSubmissionCount(questId) {
  if (!questId) return 0;
  return getStore()[questId] || 0;
}

export function resetSubmissionCount(questId) {
  if (!questId) return;
  const store = getStore();
  delete store[questId];
  saveStore(store);
}
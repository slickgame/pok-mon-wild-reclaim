import { initialOuting, loadOuting, OUTING_SAVE_KEY, type OutingState } from './outing';

export const GAME_SAVE_KEY = 'wild-reclaim.save.v1';
const PREVIOUS_SAVE_KEY = 'wild-reclaim.save.previous.v1';
const DAMAGED_SAVE_KEY = 'wild-reclaim.save.damaged.v1';
const OPENING_SAVE_KEY = 'wild-reclaim.brookbend.opening.v1';
export const SAVE_VERSION = 1;
export const MAX_IMPORT_BYTES = 1024 * 1024;

const milestones = ['mapleMet', 'clinicVisited', 'merraMet', 'boardRead', 'gateOpen'] as const;
export type Milestone = typeof milestones[number];
type Progress = Record<Milestone, boolean>;
export type WorldLocation = 'town' | 'hollow' | 'grove';
export type GameSave = {
  version: typeof SAVE_VERSION;
  revision: number;
  location: WorldLocation;
  progress: Progress;
  outing: OutingState;
};

type SaveStorage = Pick<Storage, 'getItem' | 'setItem'>;
export type SaveSource = 'current' | 'previous' | 'legacy' | 'new' | 'damaged' | 'unavailable';

const firstVisit: Progress = {
  mapleMet: false,
  clinicVisited: false,
  merraMet: false,
  boardRead: false,
  gateOpen: false,
};

export const newGameSave: GameSave = {
  version: SAVE_VERSION,
  revision: 0,
  location: 'town',
  progress: firstVisit,
  outing: initialOuting,
};

function record(value: unknown): Record<string, unknown> | null {
  return value !== null && typeof value === 'object' && !Array.isArray(value)
    ? value as Record<string, unknown> : null;
}

function readJson(value: string | null): Record<string, unknown> | null {
  if (value === null) return null;
  try { return record(JSON.parse(value)); } catch { return null; }
}

function readProgress(value: Record<string, unknown>): Progress {
  return {
    mapleMet: value.mapleMet === true,
    clinicVisited: value.clinicVisited === true,
    merraMet: value.merraMet === true,
    boardRead: value.boardRead === true,
    gateOpen: value.gateOpen === true,
  };
}

function readOuting(value: Record<string, unknown> | null, strict = false): OutingState | null {
  if (!Array.isArray(value?.party)) return null;
  if (strict && (
    (value.leadId !== null && (typeof value.leadId !== 'number' || !Number.isSafeInteger(value.leadId))) ||
    typeof value.pokeBalls !== 'number' || !Number.isSafeInteger(value.pokeBalls) ||
    typeof value.fieldSupplies !== 'number' || !Number.isSafeInteger(value.fieldSupplies) ||
    typeof value.campRestUsed !== 'boolean' || typeof value.theoDefeated !== 'boolean' ||
    typeof value.ruskDefeated !== 'boolean' || !record(value.groveQuest) || !record(value.sporesQuest)
  )) return null;
  const outing = loadOuting(JSON.stringify(value));
  if (value.party.length > 0 && !outing.party.length) return null;
  if (strict && (outing.party.length < value.party.length ||
      (value.encounter != null && !outing.encounter) ||
      (value.trainerBattle != null && !outing.trainerBattle) ||
      (value.revenantBattle != null && !outing.revenantBattle))) return null;
  return outing;
}

export function hasActiveEncounter(outing: OutingState) {
  return outing.encounter?.outcome === 'active' ||
    outing.trainerBattle?.outcome === 'active' || outing.revenantBattle?.outcome === 'active';
}

export function normalizeLocation(save: Pick<GameSave, 'progress' | 'outing'>, location: WorldLocation): WorldLocation {
  if (!save.progress.gateOpen || !save.outing.party.length) return 'town';
  return hasActiveEncounter(save.outing) ? 'grove' : location;
}

export function readGameSave(value: string | null): GameSave | null {
  const raw = readJson(value);
  const progress = record(raw?.progress);
  const location = raw?.location;
  const revision = raw?.revision;
  if (!raw || raw.version !== SAVE_VERSION || typeof revision !== 'number' ||
      !Number.isSafeInteger(revision) || revision < 0 ||
      (location !== 'town' && location !== 'hollow' && location !== 'grove') ||
      !progress || !milestones.every(key => typeof progress[key] === 'boolean')) return null;
  const outing = readOuting(record(raw.outing), true);
  if (!outing) return null;
  const save = { version: SAVE_VERSION, revision, progress: readProgress(progress), outing } as const;
  return { ...save, location: normalizeLocation(save, location) };
}

export function loadGameSave(storage: SaveStorage): { save: GameSave; source: SaveSource } {
  try {
    const current = storage.getItem(GAME_SAVE_KEY);
    const primary = readGameSave(current);
    if (primary) return { save: primary, source: 'current' };
    const previous = storage.getItem(PREVIOUS_SAVE_KEY);
    const backup = readGameSave(previous);
    if (backup) return { save: backup, source: 'previous' };

    const oldProgress = storage.getItem(OPENING_SAVE_KEY);
    const oldOuting = storage.getItem(OUTING_SAVE_KEY);
    const decodedProgress = readJson(oldProgress);
    const decodedOuting = readOuting(readJson(oldOuting));
    if (decodedProgress || decodedOuting) {
      const progress = decodedProgress ? readProgress(decodedProgress) : { ...firstVisit };
      const outing = decodedOuting ?? initialOuting;
      if (outing.party.length) progress.mapleMet = true;
      if (outing.groveQuest.explored || outing.trainerBattle || outing.revenantBattle || outing.theoDefeated) {
        progress.gateOpen = true;
      }
      if (progress.gateOpen) {
        progress.mapleMet = true;
        progress.clinicVisited = true;
        progress.merraMet = true;
        progress.boardRead = true;
      }
      const save = { ...newGameSave, progress, outing };
      const pending = outing.encounter || outing.trainerBattle || outing.revenantBattle || outing.groveDiscovery;
      return { save: { ...save, location: normalizeLocation(save, pending ? 'grove' : 'town') }, source: 'legacy' };
    }
    return {
      save: newGameSave,
      source: [current, previous, oldProgress, oldOuting].some(item => item !== null) ? 'damaged' : 'new',
    };
  } catch {
    return { save: newGameSave, source: 'unavailable' };
  }
}

export function persistGameSave(storage: SaveStorage, save: GameSave) {
  const current = storage.getItem(GAME_SAVE_KEY);
  if (current !== null) {
    if (readGameSave(current)) {
      try { storage.setItem(PREVIOUS_SAVE_KEY, current); } catch { /* the primary write still gets a chance */ }
    } else {
      storage.setItem(DAMAGED_SAVE_KEY, current);
    }
  }
  storage.setItem(GAME_SAVE_KEY, JSON.stringify(save));
}

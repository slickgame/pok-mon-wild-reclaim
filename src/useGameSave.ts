import { useCallback, useEffect, useRef, useState } from 'react';
import {
  GAME_SAVE_KEY, loadGameSave, newGameSave, normalizeLocation, persistGameSave, readGameSave,
  type GameSave, type SaveSource, type WorldLocation,
} from './gameSave';

type SaveStatus = 'saved' | 'recovered' | 'unavailable' | 'damaged' | 'conflict';

function readBrowserSave() {
  try { return loadGameSave(window.localStorage); }
  catch { return { save: newGameSave, source: 'unavailable' as const }; }
}

function initialStatus(source: SaveSource): SaveStatus {
  if (source === 'unavailable' || source === 'damaged') return source;
  return source === 'previous' ? 'recovered' : 'saved';
}

export function useGameSave(requestedLocation?: WorldLocation) {
  const [initial] = useState(() => {
    const loaded = readBrowserSave();
    const location = normalizeLocation(loaded.save, requestedLocation ?? loaded.save.location);
    return { ...loaded, location };
  });
  const [save, setSave] = useState(() => ({ ...initial.save, location: initial.location }));
  const [saveStatus, setSaveStatus] = useState<SaveStatus>(() => initialStatus(initial.source));
  const current = useRef(save);
  const pendingSince = useRef<number | null>(null);
  const started = useRef(false);

  const show = useCallback((next: GameSave) => {
    current.current = next;
    setSave(next);
    return next;
  }, []);

  const persist = useCallback((next: GameSave, baseRevision: number, force = false) => {
    try {
      const storage = window.localStorage;
      const durable = readGameSave(storage.getItem(GAME_SAVE_KEY));
      if (!force && pendingSince.current !== null && durable && durable.revision > pendingSince.current) {
        setSaveStatus('conflict');
        return false;
      }
      persistGameSave(storage, next);
      pendingSince.current = null;
      setSaveStatus('saved');
      return true;
    } catch {
      if (!force) pendingSince.current ??= baseRevision;
      setSaveStatus('unavailable');
      return false;
    }
  }, []);

  const latest = useCallback(() => {
    if (pendingSince.current !== null) return current.current;
    try {
      const durable = readGameSave(window.localStorage.getItem(GAME_SAVE_KEY));
      return durable && durable.revision > current.current.revision ? durable : current.current;
    } catch {
      return current.current;
    }
  }, []);

  const changeSave = useCallback((transform: (current: GameSave) => GameSave) => {
    const base = latest();
    const edited = transform(base);
    if (edited === base) {
      if (base !== current.current) show(base);
      return base;
    }
    const next = {
      ...edited,
      revision: base.revision + 1,
      location: normalizeLocation(edited, edited.location),
    };
    persist(next, base.revision);
    return show(next);
  }, [latest, persist, show]);

  function importSave(backup: GameSave) {
    const local = latest();
    let revision = local.revision;
    try {
      const durable = readGameSave(window.localStorage.getItem(GAME_SAVE_KEY));
      if (durable) revision = Math.max(revision, durable.revision);
    } catch { /* persist reports the inaccessible storage */ }
    const restored = { ...backup, revision: revision + 1 };
    if (!persist(restored, revision, true)) return false;
    show(restored);
    return true;
  }

  useEffect(() => {
    if (!started.current) {
      started.current = true;
      const migrate = initial.source === 'previous' || initial.source === 'legacy';
      const changedLocation = initial.location !== initial.save.location;
      if (migrate || changedLocation) {
        const now = latest();
        const location = normalizeLocation(now, initial.location);
        const next = { ...now, location, revision: now.revision + 1 };
        if (persist(next, now.revision) && initial.source === 'previous') setSaveStatus('recovered');
        show(next);
      }
    }

    function sync() {
      if (pendingSince.current !== null) {
        persist(current.current, pendingSince.current);
        return;
      }
      const usable = latest();
      if (usable !== current.current) {
        show(usable);
        setSaveStatus('saved');
      }
    }
    function syncStorage(event: StorageEvent) {
      if (event.key === GAME_SAVE_KEY && event.newValue !== null) sync();
    }
    function saveBeforeExit() {
      if (pendingSince.current !== null) persist(current.current, pendingSince.current);
    }

    window.addEventListener('storage', syncStorage);
    window.addEventListener('focus', sync);
    window.addEventListener('pagehide', saveBeforeExit);
    return () => {
      window.removeEventListener('storage', syncStorage);
      window.removeEventListener('focus', sync);
      window.removeEventListener('pagehide', saveBeforeExit);
    };
  }, [initial, latest, persist, show]);

  return { save, saveStatus, changeSave, importSave, getSave: latest };
}

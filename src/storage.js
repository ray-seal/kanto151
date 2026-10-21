export const STORAGE_KEY = 'pokemon-collection-tracker:v1';

export function loadCollection(storage = globalThis.localStorage) {
  try {
    const parsed = JSON.parse(storage.getItem(STORAGE_KEY));
    return parsed && typeof parsed === 'object' && !Array.isArray(parsed) ? parsed : {};
  } catch {
    return {};
  }
}

export function saveCollection(collection, storage = globalThis.localStorage) {
  try {
    storage.setItem(STORAGE_KEY, JSON.stringify(collection));
    return true;
  } catch {
    return false;
  }
}

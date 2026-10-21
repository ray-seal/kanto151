import { getStatus } from './collection.js';

export const FILTERS = {
  all: { label: 'All', test: () => true },
  owned: { label: 'Owned', test: (s) => s.owned },
  notOwned: { label: 'Not owned', test: (s) => !s.owned },
  wanted: { label: 'Wanted', test: (s) => s.wanted },
  notWanted: { label: 'Not wanted', test: (s) => !s.wanted },
};

export const SORTS = {
  dex: { label: 'Pokédex number', compare: (a, b) => a.dexNumber - b.dexNumber },
};

export function matchesSearch(p, query) {
  const q = query.trim().toLowerCase();
  if (!q) return true;
  const numeric = q.replace(/^#/, '');
  if (/^\d+$/.test(numeric)) return p.dexNumber === Number(numeric) || String(p.dexNumber).padStart(3, '0').startsWith(numeric);
  return p.name.toLowerCase().includes(q);
}

export function applyView(pokemon, collection, { query = '', filter = 'all', sort = 'dex' } = {}) {
  const f = FILTERS[filter] || FILTERS.all;
  const s = SORTS[sort] || SORTS.dex;
  return pokemon
    .filter((p) => matchesSearch(p, query) && f.test(getStatus(collection, p.id)))
    .sort(s.compare);
}

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { POKEMON } from '../src/data/pokemon.js';
import { applyView } from '../src/filter.js';
import { setFlag, getStats } from '../src/collection.js';
import { loadCollection, saveCollection } from '../src/storage.js';

const mem = () => { const d = {}; return { getItem: (k) => d[k] ?? null, setItem: (k, v) => { d[k] = v; } }; };

test('data has 151 ordered unique entries', () => {
  assert.equal(POKEMON.length, 151);
  POKEMON.forEach((p, i) => assert.equal(p.dexNumber, i + 1));
  assert.equal(new Set(POKEMON.map((p) => p.id)).size, 151);
  assert.equal(POKEMON[24].name, 'Pikachu');
  assert.equal(POKEMON[149].name, 'Mewtwo');
  assert.equal(POKEMON[150].name, 'Mew');
});

test('search by name and number', () => {
  for (const q of ['25', '025', '#025', 'pikachu']) {
    assert.equal(applyView(POKEMON, {}, { query: q })[0].name, 'Pikachu');
  }
  assert.equal(applyView(POKEMON, {}, { query: 'zzz' }).length, 0);
});

test('owned and wanted are independent; filters and stats work', () => {
  let c = setFlag({}, POKEMON[0].id, 'wanted', true);
  c = setFlag(c, POKEMON[1].id, 'owned', true);
  assert.deepEqual(applyView(POKEMON, c, { filter: 'wanted' }).map((p) => p.dexNumber), [1]);
  assert.deepEqual(applyView(POKEMON, c, { filter: 'owned' }).map((p) => p.dexNumber), [2]);
  assert.equal(applyView(POKEMON, c, { filter: 'notOwned' }).length, 150);
  assert.equal(applyView(POKEMON, c, { filter: 'notWanted' }).length, 150);
  assert.deepEqual(getStats(POKEMON, c), { total: 151, owned: 1, wanted: 1, percent: 1 });
});

test('storage round-trips and tolerates bad data', () => {
  const s = mem();
  assert.deepEqual(loadCollection(s), {});
  saveCollection({ a: { owned: true, wanted: false } }, s);
  assert.deepEqual(loadCollection(s), { a: { owned: true, wanted: false } });
  s.setItem('pokemon-collection-tracker:v1', '{bad');
  assert.deepEqual(loadCollection(s), {});
});

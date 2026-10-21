import { test } from 'node:test';
import assert from 'node:assert/strict';
import { POKEMON as ALL } from '../src/data/pokemon.js';
const POKEMON = ALL.slice(0, 151);
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

import { REGIONS, POKEMON as FULL } from '../src/data/pokemon.js';
import { loadProfiles, createProfile, switchProfile, loadProfileCollection, saveProfileCollection, STORAGE_KEY } from '../src/storage.js';

test('full dataset: 1025 ordered unique species, correct regions', () => {
  assert.equal(FULL.length, 1025);
  FULL.forEach((p, i) => assert.equal(p.dexNumber, i + 1));
  assert.equal(new Set(FULL.map((p) => p.id)).size, 1025);
  assert.equal(FULL[0].id, 'kanto-001');
  const count = (r) => FULL.filter((p) => p.region === r).length;
  assert.deepEqual(REGIONS.map(count), [151, 100, 135, 107, 156, 72, 88, 96, 120]);
  assert.equal(FULL[1024].name, 'Pecharunt');
});

test('region filter combines with search and filters', () => {
  assert.equal(applyView(FULL, {}, { region: 'Johto', query: '025' }).length, 0);
  assert.equal(applyView(FULL, {}, { region: 'Kanto', query: '025' })[0].name, 'Pikachu');
  assert.equal(applyView(FULL, {}, { region: 'Johto' }).length, 100);
  const c = setFlag(setFlag({}, 'johto-152', 'owned', true), 'kanto-001', 'owned', true);
  assert.deepEqual(applyView(FULL, c, { region: 'Johto', filter: 'owned' }).map((p) => p.dexNumber), [152]);
  assert.equal(getStats(FULL.filter((p) => p.region === 'Johto'), c).total, 100);
});

test('legacy collection migrates once into a default profile; profiles are isolated', () => {
  const s = mem();
  const legacy = { 'kanto-001': { owned: true, wanted: true } };
  s.setItem(STORAGE_KEY, JSON.stringify(legacy));
  let m = loadProfiles(s);
  assert.deepEqual(loadProfileCollection(m.activeId, s), legacy);
  const firstId = m.activeId;
  saveProfileCollection(firstId, { 'kanto-002': { owned: true, wanted: false } }, s);
  m = loadProfiles(s); // repeat: no re-migration, no overwrite
  assert.equal(m.activeId, firstId);
  assert.deepEqual(loadProfileCollection(firstId, s), { 'kanto-002': { owned: true, wanted: false } });
  m = createProfile(m, 'Friend', s);
  assert.notEqual(m.activeId, firstId);
  assert.deepEqual(loadProfileCollection(m.activeId, s), {});
  m = switchProfile(m, firstId, s);
  assert.deepEqual(loadProfileCollection(firstId, s), { 'kanto-002': { owned: true, wanted: false } });
  assert.deepEqual(JSON.parse(s.getItem(STORAGE_KEY)), legacy);
});

test('empty storage creates an empty default profile', () => {
  const s = mem();
  const m = loadProfiles(s);
  assert.deepEqual(loadProfileCollection(m.activeId, s), {});
});

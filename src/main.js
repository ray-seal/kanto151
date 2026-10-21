import { POKEMON } from './data/pokemon.js';
import { loadCollection, saveCollection } from './storage.js';
import { getStatus, setFlag, getStats } from './collection.js';
import { applyView, FILTERS, SORTS } from './filter.js';

const activePokemon = POKEMON;
let collection = loadCollection();
const view = { query: '', filter: 'all', sort: 'dex' };

const $ = (id) => document.getElementById(id);
const list = $('list');
const search = $('search');
const filterSel = $('filter');
const sortSel = $('sort');

function fill(select, options) {
  for (const [value, { label }] of Object.entries(options)) {
    select.append(new Option(label, value));
  }
}
fill(filterSel, FILTERS);
fill(sortSel, SORTS);

const pad = (n) => String(n).padStart(3, '0');

function renderStats() {
  const s = getStats(activePokemon, collection);
  $('count').textContent = `${s.owned} / ${s.total} collected`;
  $('percent').textContent = `${s.percent}%`;
  $('wantedCount').textContent = `${s.wanted} wanted`;
  const bar = $('bar');
  bar.value = s.owned;
  bar.max = s.total;
}

function row(p) {
  const st = getStatus(collection, p.id);
  const li = document.createElement('li');
  li.className = 'row' + (st.owned ? ' is-owned' : '');
  li.dataset.id = p.id;

  const num = document.createElement('span');
  num.className = 'num';
  num.textContent = `#${pad(p.dexNumber)}`;

  const name = document.createElement('span');
  name.className = 'name';
  name.textContent = p.name;
  if (st.owned) {
    const badge = document.createElement('span');
    badge.className = 'badge';
    badge.textContent = '✓ Owned';
    name.append(badge);
  }

  li.append(num, name, check(p, 'owned', 'Owned'), check(p, 'wanted', 'Wanted'));
  return li;
}

function check(p, flag, label) {
  const l = document.createElement('label');
  l.className = 'check';
  const input = document.createElement('input');
  input.type = 'checkbox';
  input.checked = getStatus(collection, p.id)[flag];
  input.setAttribute('aria-label', `${label}: ${p.name} #${pad(p.dexNumber)}`);
  input.addEventListener('change', () => {
    collection = setFlag(collection, p.id, flag, input.checked);
    saveCollection(collection);
    renderStats();
    renderList();
  });
  const text = document.createElement('span');
  text.textContent = label;
  l.append(input, text);
  return l;
}

function renderList() {
  const items = applyView(activePokemon, collection, view);
  list.replaceChildren(...items.map(row));
  $('empty').hidden = items.length > 0;
}

search.addEventListener('input', () => {
  view.query = search.value;
  $('clear').hidden = !search.value;
  renderList();
});
$('clear').addEventListener('click', () => {
  search.value = '';
  view.query = '';
  $('clear').hidden = true;
  renderList();
  search.focus();
});
filterSel.addEventListener('change', () => { view.filter = filterSel.value; renderList(); });
sortSel.addEventListener('change', () => { view.sort = sortSel.value; renderList(); });

renderStats();
renderList();

if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('sw.js').catch(() => {});
  });
}

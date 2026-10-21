# Pokémon Collection Tracker (National Pokédex, Gen I–IX)

Collections are local profiles stored in this device's browser storage (no sync across devices). Pokémon data is in `src/data/pokemon.js`, sourced from PokeAPI species data.

Dependency-free static app (ES modules, localStorage).

- Run: `npm start` then open http://localhost:8000
- Test: `npm test`

Structure: `src/data/pokemon.js` (reference data), `src/collection.js` (state), `src/filter.js` (search/filter/sort), `src/storage.js` (persistence), `src/main.js` + `index.html` + `styles.css` (UI).

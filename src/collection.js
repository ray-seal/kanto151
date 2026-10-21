// Collection state: { [pokemonId]: { owned: boolean, wanted: boolean } }
export function getStatus(collection, id) {
  const s = collection[id];
  return { owned: !!(s && s.owned), wanted: !!(s && s.wanted) };
}

export function setFlag(collection, id, flag, value) {
  const next = { ...getStatus(collection, id), [flag]: !!value };
  const copy = { ...collection };
  if (next.owned || next.wanted) copy[id] = next;
  else delete copy[id];
  return copy;
}

export function getStats(pokemon, collection) {
  const total = pokemon.length;
  const owned = pokemon.filter((p) => getStatus(collection, p.id).owned).length;
  const wanted = pokemon.filter((p) => getStatus(collection, p.id).wanted).length;
  return { total, owned, wanted, percent: total ? Math.round((owned / total) * 100) : 0 };
}

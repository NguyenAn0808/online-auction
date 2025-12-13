const KEY = "ea_watchlist_v1";

function load() {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return [];
    return JSON.parse(raw);
  } catch (e) {
    console.warn("watchlist: failed to parse", e);
    return [];
  }
}

function save(list) {
  try {
    localStorage.setItem(KEY, JSON.stringify(list));
  } catch (e) {
    console.warn("watchlist: failed to save", e);
  }
}

export function getWatchlist() {
  return load();
}

export function isInWatchlist(productId) {
  if (!productId) return false;
  return load().some((p) => p.id === productId);
}

export function addToWatchlist(item) {
  if (!item || !item.id) return;
  const list = load();
  if (list.some((p) => p.id === item.id)) return;
  const toStore = {
    id: item.id,
    name: item.name,
    imageSrc: item.images?.[0]?.src || item.imageSrc || "",
    price: typeof item.price === "number" ? item.price : item.price || null,
  };
  list.unshift(toStore);
  save(list);
}

export function removeFromWatchlist(productId) {
  if (!productId) return;
  const list = load().filter((p) => p.id !== productId);
  save(list);
}

export function clearWatchlist() {
  save([]);
}

export default {
  getWatchlist,
  isInWatchlist,
  addToWatchlist,
  removeFromWatchlist,
  clearWatchlist,
};

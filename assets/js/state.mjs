export function storageKeyForContext(context) {
  return "echoframe:" + context.key;
}

export function cloneDefaultState(defaultState) {
  return Object.assign({}, defaultState);
}

export function loadState(storageKey, defaultState) {
  try {
    const saved = JSON.parse(localStorage.getItem(storageKey) || "{}");
    return Object.assign({}, defaultState, saved);
  } catch (error) {
    return cloneDefaultState(defaultState);
  }
}

export function persistState(storageKey, state) {
  state.lastSaved = new Date().toISOString();
  localStorage.setItem(storageKey, JSON.stringify(state));
}

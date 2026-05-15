/**
 * In-memory access token store.
 * This is the ONLY place the access token lives on the frontend.
 * Never written to localStorage, sessionStorage, or any persistent storage.
 * Resets on page refresh — silent refresh via httpOnly cookie handles re-hydration.
 */
let _accessToken = null;

export const tokenStore = {
  get: () => _accessToken,
  set: (token) => { _accessToken = token; },
  clear: () => { _accessToken = null; },
};
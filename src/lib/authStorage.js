const AUTH_TOKEN_KEY = "instant_auth_refresh";
const AUTH_TOKEN_EXP_KEY = "instant_auth_refresh_exp";
const ONE_YEAR_MS = 1000 * 60 * 60 * 24 * 365;

const safeGet = (key) => {
  try {
    return localStorage.getItem(key);
  } catch {
    return null;
  }
};

const safeSet = (key, value) => {
  try {
    localStorage.setItem(key, value);
  } catch {
    // Ignore storage write failures (private mode, quota, etc.)
  }
};

const safeRemove = (key) => {
  try {
    localStorage.removeItem(key);
  } catch {
    // Ignore storage remove failures
  }
};

export const setStoredAuthToken = (token, ttlMs = ONE_YEAR_MS) => {
  if (!token) return;
  const expiresAt = Date.now() + ttlMs;
  safeSet(AUTH_TOKEN_KEY, token);
  safeSet(AUTH_TOKEN_EXP_KEY, String(expiresAt));
};

export const getStoredAuthToken = () => {
  const token = safeGet(AUTH_TOKEN_KEY);
  const expRaw = safeGet(AUTH_TOKEN_EXP_KEY);
  const expiresAt = expRaw ? Number(expRaw) : 0;
  if (!token || !expiresAt) {
    clearStoredAuthToken();
    return null;
  }
  if (Date.now() > expiresAt) {
    clearStoredAuthToken();
    return null;
  }
  return token;
};

export const clearStoredAuthToken = () => {
  safeRemove(AUTH_TOKEN_KEY);
  safeRemove(AUTH_TOKEN_EXP_KEY);
};

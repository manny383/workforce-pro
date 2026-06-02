import type { Session } from '../types/auth';

const SESSION_STORAGE_KEY = 'workforce-pro-session';

const getTokenExpiration = (token: string) => {
  try {
    const payload = token.split('.')[1];
    const normalizedPayload = payload.replace(/-/g, '+').replace(/_/g, '/');
    const paddedPayload = normalizedPayload.padEnd(Math.ceil(normalizedPayload.length / 4) * 4, '=');
    const decodedPayload = JSON.parse(atob(paddedPayload)) as { exp?: number };

    return decodedPayload.exp ? decodedPayload.exp * 1000 : null;
  } catch {
    return null;
  }
};

const isSessionValid = (session: Session) => {
  const expiration = getTokenExpiration(session.token);

  return Boolean(expiration && expiration > Date.now());
};

export const loadStoredSession = () => {
  try {
    const rawSession = window.localStorage.getItem(SESSION_STORAGE_KEY);

    if (!rawSession) return null;

    const session = JSON.parse(rawSession) as Session;

    if (!isSessionValid(session)) {
      clearStoredSession();
      return null;
    }

    return session;
  } catch {
    clearStoredSession();
    return null;
  }
};

export const saveStoredSession = (session: Session) => {
  window.localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(session));
};

export const clearStoredSession = () => {
  window.localStorage.removeItem(SESSION_STORAGE_KEY);
};

const KEY = 'insignia.token';

/** Persists the access token. Storage can be unavailable (private mode). */
export const tokenStorage = {
  get(): string | null {
    try {
      return localStorage.getItem(KEY);
    } catch {
      return null;
    }
  },
  set(token: string): void {
    try {
      localStorage.setItem(KEY, token);
    } catch {
      // The session then only lasts until the page is reloaded.
    }
  },
  clear(): void {
    try {
      localStorage.removeItem(KEY);
    } catch {
      // Nothing stored.
    }
  },
};

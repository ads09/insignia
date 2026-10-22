import { useSyncExternalStore } from 'react';

export type ThemePreference = 'system' | 'light' | 'dark';
type Theme = 'light' | 'dark';

const STORAGE_KEY = 'insignia.theme';
const DARK_QUERY = '(prefers-color-scheme: dark)';
const listeners = new Set<() => void>();

function subscribe(listener: () => void) {
  listeners.add(listener);
  const media = window.matchMedia(DARK_QUERY);
  media.addEventListener('change', listener);
  return () => {
    listeners.delete(listener);
    media.removeEventListener('change', listener);
  };
}

/** The theme pinned on <html data-theme>, set by index.html from storage. */
function getPreference(): ThemePreference {
  const theme = document.documentElement.dataset.theme;
  return theme === 'light' || theme === 'dark' ? theme : 'system';
}

function getTheme(): Theme {
  const preference = getPreference();
  if (preference !== 'system') return preference;
  return window.matchMedia(DARK_QUERY).matches ? 'dark' : 'light';
}

export function setThemePreference(preference: ThemePreference): void {
  const root = document.documentElement;
  try {
    if (preference === 'system') {
      delete root.dataset.theme;
      localStorage.removeItem(STORAGE_KEY);
    } else {
      root.dataset.theme = preference;
      localStorage.setItem(STORAGE_KEY, preference);
    }
  } catch {
    // Storage unavailable: the choice lasts for this page only.
  }
  listeners.forEach((listener) => listener());
}

export function useThemePreference(): ThemePreference {
  return useSyncExternalStore(subscribe, getPreference, () => 'system');
}

/** The theme in effect: the pinned one, or the system's. */
export function useTheme(): Theme {
  return useSyncExternalStore(subscribe, getTheme, () => 'light');
}

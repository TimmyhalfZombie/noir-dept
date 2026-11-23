// Adapted from Ink Bleed by Codemure (MIT License)
export type Theme = 'light' | 'dark';

const STORAGE_KEY = 'noir-theme';
const THEME_META_COLOR: Record<Theme, string> = {
  dark: '#0D0D0D',
  light: '#E5E5E1',
};

const root = document.documentElement;

export function getTheme(): Theme {
  return root.dataset.theme === 'dark' ? 'dark' : 'light';
}

export function otherTheme(theme: Theme): Theme {
  return theme === 'dark' ? 'light' : 'dark';
}

/** Instantly applies a theme to the live DOM, persists it, updates meta theme-color, and keeps ARIA in sync. */
export function applyTheme(theme: Theme, toggle?: HTMLButtonElement | null): void {
  root.dataset.theme = theme;
  root.style.colorScheme = theme;

  if (toggle) {
    toggle.setAttribute('aria-pressed', String(theme === 'dark'));
  }

  const meta = document.querySelector<HTMLMetaElement>('meta[name="theme-color"]');
  if (meta) {
    meta.setAttribute('content', THEME_META_COLOR[theme]);
  }

  try {
    window.localStorage.removeItem('noir-dept-theme');
    window.localStorage.setItem(STORAGE_KEY, theme);
  } catch {
    // Ignore storage access errors in restricted contexts
  }
}

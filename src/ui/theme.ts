/**
 * Multi-theme controller with localStorage persistence.
 * Available themes:
 * - obsidian (Default): Liquid Monochrome / Obsidian Silver (original release)
 * - matrix: The Matrix / Cyber Phosphor Green
 * - amber: Cyberpunk / Terminal Amber
 * - synthwave: Neon Synthwave / Electric Violet
 * - cyan: Deep Ocean / Ice Cyan
 * - crimson: Cyber Crimson / Crimson Red
 */

export type ThemeId = 'obsidian' | 'matrix' | 'amber' | 'synthwave' | 'cyan' | 'crimson';

export interface ThemeMeta {
  id: ThemeId;
  name: string;
  dotColor: string;
  themeColor: string;
}

export const THEMES: readonly ThemeMeta[] = [
  { id: 'obsidian', name: 'Obsidian Silver', dotColor: '#e0e4ec', themeColor: '#050507' },
  { id: 'matrix', name: 'The Matrix', dotColor: '#00ff66', themeColor: '#030805' },
  { id: 'amber', name: 'Cyber Amber', dotColor: '#ffaa00', themeColor: '#070503' },
  { id: 'synthwave', name: 'Neon Synthwave', dotColor: '#d946ef', themeColor: '#07040d' },
  { id: 'cyan', name: 'Electric Cyan', dotColor: '#00d2ff', themeColor: '#02070e' },
  { id: 'crimson', name: 'Crimson Red', dotColor: '#ff2a55', themeColor: '#080203' },
] as const;

export const DEFAULT_THEME: ThemeId = 'obsidian';
const THEME_STORAGE_KEY = 'subnet-verify-theme';

export function getStoredTheme(): ThemeId {
  try {
    const raw = localStorage.getItem(THEME_STORAGE_KEY);
    const saved = raw === 'red' ? 'crimson' : (raw as ThemeId | null);
    if (saved && THEMES.some((t) => t.id === saved)) {
      return saved;
    }
  } catch {
    // LocalStorage inaccessible (private mode / sandboxed)
  }
  return DEFAULT_THEME;
}

const FALLBACK_THEME: ThemeMeta = {
  id: 'obsidian',
  name: 'Obsidian Silver',
  dotColor: '#e0e4ec',
  themeColor: '#050507',
};

export function applyTheme(themeId: ThemeId | 'red'): void {
  const normalizedId = themeId === 'red' ? 'crimson' : themeId;
  const meta: ThemeMeta = THEMES.find((t) => t.id === normalizedId) ?? THEMES[0] ?? FALLBACK_THEME;
  document.documentElement.setAttribute('data-theme', meta.id);

  // Update theme-color meta tag for browser UI (e.g. mobile address bar)
  const metaThemeColor = document.querySelector<HTMLMetaElement>('meta[name="theme-color"]');
  if (metaThemeColor) {
    metaThemeColor.content = meta.themeColor;
  }

  try {
    localStorage.setItem(THEME_STORAGE_KEY, meta.id);
  } catch {
    // Ignore storage errors
  }

  // Update active state in theme buttons
  const buttons = document.querySelectorAll<HTMLButtonElement>('[data-theme-id]');
  buttons.forEach((btn) => {
    const isActive = btn.dataset.themeId === meta.id;
    btn.classList.toggle('theme-btn--active', isActive);
    btn.setAttribute('aria-pressed', isActive ? 'true' : 'false');
  });
}

export function initThemePicker(): void {
  const current = getStoredTheme();
  applyTheme(current);

  const container = document.getElementById('theme-track');
  if (!container) return;

  container.addEventListener('click', (e) => {
    const target = (e.target as HTMLElement).closest<HTMLButtonElement>('[data-theme-id]');
    if (!target) return;
    const rawChosen = target.dataset.themeId;
    const chosen = (rawChosen === 'red' ? 'crimson' : rawChosen) as ThemeId;
    if (chosen && THEMES.some((t) => t.id === chosen)) {
      applyTheme(chosen);
    }
  });
}

import { describe, expect, it } from 'vitest';
import { DEFAULT_THEME, THEMES, getStoredTheme } from '../theme';

describe('theme system', () => {
  it('has obsidian as default theme', () => {
    expect(DEFAULT_THEME).toBe('obsidian');
  });

  it('includes obsidian and matrix and extra color themes', () => {
    const ids = THEMES.map((t) => t.id);
    expect(ids).toContain('obsidian');
    expect(ids).toContain('matrix');
    expect(ids).toContain('amber');
    expect(ids).toContain('synthwave');
    expect(ids).toContain('cyan');
    expect(ids).toContain('crimson');
    expect(THEMES.length).toBe(6);
  });

  it('falls back to default theme when storage is empty', () => {
    expect(getStoredTheme()).toBe('obsidian');
  });
});

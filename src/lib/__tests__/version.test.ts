import { describe, expect, it } from 'vitest';
import { APP_VERSION } from '../../version';

describe('APP_VERSION', () => {
  it('exports a valid SemVer string', () => {
    expect(APP_VERSION).toBeDefined();
    expect(typeof APP_VERSION).toBe('string');
    // SemVer 2.0.0 regex pattern
    const semverRegex =
      /^(0|[1-9]\d*)\.(0|[1-9]\d*)\.(0|[1-9]\d*)(?:-((?:0|[1-9]\d*|\d*[a-zA-Z-][0-9a-zA-Z-]*)(?:\.(?:0|[1-9]\d*|\d*[a-zA-Z-][0-9a-zA-Z-]*))*))?(?:\+([0-9a-zA-Z-]+(?:\.[0-9a-zA-Z-]+)*))?$/;
    expect(APP_VERSION).toMatch(semverRegex);
  });
});

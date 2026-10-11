/**
 * Application version exported as a single source of truth.
 * Injected at build time by Vite via `__APP_VERSION__` defined from package.json.
 */
declare const __APP_VERSION__: string | undefined;

export const APP_VERSION: string =
  typeof __APP_VERSION__ !== 'undefined' ? __APP_VERSION__ : '1.1.0';

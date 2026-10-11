import { defineConfig } from 'vite';
import pkg from './package.json';

// base './' keeps asset URLs relative so the build works at any GitHub Pages subpath.
export default defineConfig({
  base: './',
  define: {
    __APP_VERSION__: JSON.stringify(pkg.version),
  },
  build: {
    target: 'es2022',
    rollupOptions: {
      input: {
        main: 'index.html',
        lookup: 'lookup.html',
      },
    },
  },
});

import { defineConfig } from 'vite';

// base './' keeps asset URLs relative so the build works at any GitHub Pages subpath.
export default defineConfig({
  base: './',
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

import { resolve } from 'path';
import { defineConfig } from 'vite';

export default defineConfig({
  root: '.',
  build: {
    rollupOptions: {
      input: {
        main: resolve(import.meta.dirname, 'index.html'),
        listing: resolve(import.meta.dirname, 'listing.html'),
        admin: resolve(import.meta.dirname, 'admin.html'),
      },
    },
  },
  server: {
    port: 3000,
    open: false,
  },
});

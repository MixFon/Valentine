import { defineConfig } from 'vite';

export default defineConfig({
  build: {
    // Go embed не умеет ходить вверх по каталогам (../), поэтому Vite
    // собирает прямо в каталог, который вкомпилирует cmd/valentine/main.go.
    outDir: '../cmd/valentine/dist',
    emptyOutDir: true,
  },
  server: {
    proxy: {
      '/api': 'http://127.0.0.1:8081',
    },
  },
});

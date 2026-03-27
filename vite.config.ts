import { defineConfig } from 'vite';

export default defineConfig({
  server: {
    host: '0.0.0.0',
    port: 4200,
    strictPort: false,
    hmr: {
      protocol: 'ws',
      host: 'localhost',
      port: 4200
    }
  }
});
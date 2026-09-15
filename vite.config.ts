import { defineConfig, Plugin } from 'vite';
import react from '@vitejs/plugin-react';
import { handleApiRequest } from './server/api.js';

function apiServerPlugin(): Plugin {
  return {
    name: 'workflex-api-server',
    configureServer(server) {
      server.middlewares.use((req, res, next) => {
        if (req.url && req.url.startsWith('/api')) {
          handleApiRequest(req, res);
        } else {
          next();
        }
      });
    }
  };
}

export default defineConfig({
  plugins: [react(), apiServerPlugin()],
  server: {
    port: 3000,
    open: false
  }
});

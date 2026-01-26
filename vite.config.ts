import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import pc from 'picocolors';

// Vite config for React + TypeScript
export default defineConfig({
  plugins: [
    react(),
    {
      name: 'url-override',
      configureServer: (server) => {
        const oldPrintUrl = server.printUrls;
        server.printUrls = () => {
          const { logger } = server.config;
          const url = 'https://auth-page.dewa.localhost/';
          logger.info(
            `  ${pc.green('➜')}  ${pc.bold('URL')}:     ${pc.cyan(url)}`,
          );
          oldPrintUrl();
        };
      },
    },
  ],
  server: {
    allowedHosts: true,
    host: '127.0.0.1',
    port: 5173,
    hmr: {
      host: 'auth-page.dewa.localhost',
      clientPort: 443
    }
  },
});

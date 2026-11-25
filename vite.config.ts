import fs from 'node:fs';
import path from 'node:path';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  envPrefix: ['VITE_', 'NEXT_PUBLIC_'],
  build: {
    emptyOutDir: true,
  },
  plugins: [
    react(),
    tailwindcss(),
    {
      name: 'clean-cloudflare-redirects',
      closeBundle() {
        const redirectsPath = path.resolve(process.cwd(), 'dist', '_redirects');
        if (fs.existsSync(redirectsPath)) {
          fs.unlinkSync(redirectsPath);
        }
      },
    },
  ],
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://localhost:3001',
        changeOrigin: true,
      },
      '/uploads': {
        target: 'http://localhost:3001',
        changeOrigin: true,
      },
    },
  },
});

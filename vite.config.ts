import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

import dotenv from 'dotenv';
dotenv.config();

const apiUrl = process.env.VITE_API_URL;
const port = parseInt(process.env.VITE_PORT || '3000', 10);

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: port,
    proxy: {
      '/api': {
        target: apiUrl,
        changeOrigin: true,
        secure: false,
        rewrite: (path) => path.replace(/^\/api/, ''),
      },
    },
  },
});

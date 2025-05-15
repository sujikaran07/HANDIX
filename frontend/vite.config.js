import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

// Get port from environment or use default
const port = parseInt(process.env.PORT) || 5173;

export default defineConfig({
  plugins: [react()],
  server: {
    port: port,
    strictPort: false, // Allow fallback to next available port if specified port is in use
    proxy: {
      '/api': {
        target: 'http://localhost:5000',
        changeOrigin: true,
        secure: false
      }
    }
  },
  preview: {
    port: port
  }
});

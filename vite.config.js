import react from '@vitejs/plugin-react';
import path from 'path';
import { defineConfig } from 'vite';

export default defineConfig({
  logLevel: 'error', // Suppress warnings, only show errors
  base: '/',
  server: {
    allowedHosts: ["srv1397016.tail8be541.ts.net"],
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src')
    }
  },
  plugins: [
    // base44 plugin is commented out due to previous proxy errors.
    // If needed, it requires further investigation and configuration.
    react(),
  ]
});

import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: process.env.VITE_BACKEND_URL || 'http://localhost:5150',
        changeOrigin: true,
      },
      '/static': {
        target: process.env.VITE_BACKEND_URL || 'http://localhost:5150',
        changeOrigin: true,
      },
      '/leave-requests': {
        target: process.env.VITE_BACKEND_URL || 'http://localhost:5150',
        changeOrigin: true,
      },
      '/wfh-requests': {
        target: process.env.VITE_BACKEND_URL || 'http://localhost:5150',
        changeOrigin: true,
      },
      '/comp-off': {
        target: process.env.VITE_BACKEND_URL || 'http://localhost:5150',
        changeOrigin: true,
      },
      '/comp-off-requests': {
        target: process.env.VITE_BACKEND_URL || 'http://localhost:5150',
        changeOrigin: true,
      },
      '/swap-requests': {
        target: process.env.VITE_BACKEND_URL || 'http://localhost:5150',
        changeOrigin: true,
      },
      '/shifts': {
        target: process.env.VITE_BACKEND_URL || 'http://localhost:5150',
        changeOrigin: true,
      },
      '/holidays': {
        target: process.env.VITE_BACKEND_URL || 'http://localhost:5150',
        changeOrigin: true,
      },
      '/leave-types': {
        target: process.env.VITE_BACKEND_URL || 'http://localhost:5150',
        changeOrigin: true,
      },
      '/leave-quotas': {
        target: process.env.VITE_BACKEND_URL || 'http://localhost:5150',
        changeOrigin: true,
      },
      '/leave-calc': {
        target: process.env.VITE_BACKEND_URL || 'http://localhost:5150',
        changeOrigin: true,
      },
      '/roster': {
        target: process.env.VITE_BACKEND_URL || 'http://localhost:5150',
        changeOrigin: true,
      },
      '/attendance': {
        target: process.env.VITE_BACKEND_URL || 'http://localhost:5150',
        changeOrigin: true,
      },
      '/employees': {
        target: process.env.VITE_BACKEND_URL || 'http://localhost:5150',
        changeOrigin: true,
      },
    },
  },
  preview: {
    port: 5173,
    proxy: {
      '/api': {
        target: process.env.VITE_BACKEND_URL || 'http://localhost:5150',
        changeOrigin: true,
      },
      '/static': {
        target: process.env.VITE_BACKEND_URL || 'http://localhost:5150',
        changeOrigin: true,
      },
      '/leave-requests': {
        target: process.env.VITE_BACKEND_URL || 'http://localhost:5150',
        changeOrigin: true,
      },
      '/wfh-requests': {
        target: process.env.VITE_BACKEND_URL || 'http://localhost:5150',
        changeOrigin: true,
      },
      '/comp-off': {
        target: process.env.VITE_BACKEND_URL || 'http://localhost:5150',
        changeOrigin: true,
      },
      '/comp-off-requests': {
        target: process.env.VITE_BACKEND_URL || 'http://localhost:5150',
        changeOrigin: true,
      },
      '/swap-requests': {
        target: process.env.VITE_BACKEND_URL || 'http://localhost:5150',
        changeOrigin: true,
      },
      '/shifts': {
        target: process.env.VITE_BACKEND_URL || 'http://localhost:5150',
        changeOrigin: true,
      },
      '/holidays': {
        target: process.env.VITE_BACKEND_URL || 'http://localhost:5150',
        changeOrigin: true,
      },
      '/leave-types': {
        target: process.env.VITE_BACKEND_URL || 'http://localhost:5150',
        changeOrigin: true,
      },
      '/leave-quotas': {
        target: process.env.VITE_BACKEND_URL || 'http://localhost:5150',
        changeOrigin: true,
      },
      '/leave-calc': {
        target: process.env.VITE_BACKEND_URL || 'http://localhost:5150',
        changeOrigin: true,
      },
      '/roster': {
        target: process.env.VITE_BACKEND_URL || 'http://localhost:5150',
        changeOrigin: true,
      },
      '/attendance': {
        target: process.env.VITE_BACKEND_URL || 'http://localhost:5150',
        changeOrigin: true,
      },
      '/employees': {
        target: process.env.VITE_BACKEND_URL || 'http://localhost:5150',
        changeOrigin: true,
      },
    },
  },
});


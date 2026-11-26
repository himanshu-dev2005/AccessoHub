import path from 'path';

import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default ({ mode }) => {
  process.env = { ...process.env, ...loadEnv(mode, process.cwd()) };

  const proxy_url =
    process.env.VITE_DEV_REMOTE === 'remote'
      ? process.env.VITE_BACKEND_SERVER
      : 'http://localhost:8888/';

  const config = {
    plugins: [react()],
    resolve: {
      base: '/',
      alias: {
        '@': path.resolve(__dirname, 'src'),
      },
    },
    build: {
      target: 'es2020',
      minify: 'esbuild',
      cssCodeSplit: true,
      sourcemap: false,
      chunkSizeWarningLimit: 1200,
      rollupOptions: {
        output: {
          manualChunks: {
            'vendor-react': [
              'react',
              'react-dom',
              'react-router-dom',
              'react-redux',
              '@reduxjs/toolkit',
            ],
            'vendor-antd': ['antd'],
            'vendor-icons': ['@ant-design/icons'],
            'vendor-xlsx': ['xlsx'],
          },
        },
      },
    },
    server: {
      port: 3000,
      proxy: {
        '/api': {
          target: proxy_url,
          changeOrigin: true,
          secure: false,
        },
      },
    },
  };
  return defineConfig(config);
};

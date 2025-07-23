import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(), // Tailwind 4.1 plugin - no config file needed
  ],
  optimizeDeps: {
    include: ['react', 'react-dom']
  },
  // server: {
  //   port: 3000,
  //   open: true
  // },
  build: {
    outDir: 'dist',
    sourcemap: true,
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          utilities: ['js-yaml', 'json-2-csv', 'hash-wasm']
        }
      }
    }
  }
});

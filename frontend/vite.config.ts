import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
  ],
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules')) {
            if (id.includes('react') || id.includes('react-dom') || id.includes('react-router-dom')) {
              return 'vendor-react';
            }
            if (id.includes('@tanstack/react-query') || id.includes('axios')) {
              return 'vendor-query';
            }
            if (id.includes('lucide-react') || id.includes('clsx') || id.includes('tailwind-merge') || id.includes('sonner')) {
              return 'vendor-ui';
            }
          }
        },
      },
    },
    chunkSizeWarningLimit: 600,
  },
});
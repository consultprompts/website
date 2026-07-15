import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import {defineConfig} from 'vite';

export default defineConfig(() => {
  return {
    plugins: [react(), tailwindcss()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    build: {
      rollupOptions: {
        output: {
          // Framework code changes far less often than app code — splitting it
          // into its own chunk lets returning visitors keep it cached across
          // app deploys (the 1y-immutable /assets cache in server.ts).
          // Function form on purpose: the object form maps exact package
          // entries, and imports like `react-dom/client` slip past it into
          // the app chunk.
          manualChunks(id: string) {
            if (id.includes('node_modules')) return 'vendor';
          },
        },
      },
    },
  };
});

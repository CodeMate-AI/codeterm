import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
    plugins: [react()],
    base: './',
    build: {
        outDir: 'dist-react',
        rollupOptions: {
            output: {
                manualChunks(id) {
                    if (id.includes('node_modules')) {
                        return id.split('node_modules/')[1].split('/')[0].toString();
                    }
                },
            },
        },
        chunkSizeWarningLimit: 1000,
        sourcemap: true,
    },
    server: {
        port: 5123,
        strictPort: true,
    },
});



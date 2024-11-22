// import { defineConfig } from 'vite';
// import react from '@vitejs/plugin-react';

// // https://vitejs.dev/config/
// export default defineConfig({
//   plugins: [react()],
//   base: './',
//   build: {
//     outDir: 'dist-react',
//   },
//   server: {
//     port: 5123,
//     strictPort: true,
//   },
// });



// import { defineConfig } from 'vite';
// import react from '@vitejs/plugin-react';

// // https://vitejs.dev/config/
// export default defineConfig({
//     plugins: [react()],
//     base: './',
//     build: {
//         outDir: 'dist-react',
//         rollupOptions: {
//             output: {
//                 manualChunks(id) {
//                     if (id.includes('node_modules')) {
//                         return id.split('node_modules/')[1].split('/')[0].toString();
//                     }
//                 },
//             },
//         },
//         chunkSizeWarningLimit: 1000,
//         sourcemap: true,
//     },
//     server: {
//         port: 5123,
//         strictPort: true,
//     },
// });



import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';

// https://vitejs.dev/config/
export default defineConfig({
    plugins: [react()],
    base: './',
    build: {
        outDir: 'dist-react',
        rollupOptions: {
            input: {
                index: resolve(__dirname, 'index.html'),       
                preview: resolve(__dirname, 'preview.html'), 
            },
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
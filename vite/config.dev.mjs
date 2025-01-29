import { defineConfig } from 'vite';
import solid from 'vite-plugin-solid';

export default defineConfig({
    plugins: [
        solid(),
    ],
    server: {
        // hmr: false,
        port: 8080
    }
});
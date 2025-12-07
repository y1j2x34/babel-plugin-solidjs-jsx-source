import { defineConfig, PluginOption } from 'vite';
import solidPlugin from 'vite-plugin-solid';
import tsconfigPaths from 'vite-tsconfig-paths';

export default defineConfig({
    plugins: [
        solidPlugin({
            babel: {
                plugins: ['babel-plugin-solidjs-jsx-source'],
            },
        }),
        tsconfigPaths(),
    ],
    build: {
        target: 'esnext',
        minify: false,
        emptyOutDir: true,
        rollupOptions: {
            input: 'src/index.tsx',
            output: {
                dir: 'lib',
                format: 'esm',
                inlineDynamicImports: false,
            },
        },
    },
});

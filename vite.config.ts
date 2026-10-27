import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  build: {
    target: 'es2022',
    // Never inline fonts as data: URIs; the site CSP's font-src doesn't allow data:.
    assetsInlineLimit: (filePath: string) => (/\.woff2$/.test(filePath) ? false : undefined),
  },
});

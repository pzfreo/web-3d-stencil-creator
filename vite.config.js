import { defineConfig } from 'vite';
import { VitePWA } from 'vite-plugin-pwa';

// Vercel environment detection
const isVercel = process.env.VERCEL === '1';
const isPreview = process.env.VERCEL_ENV === 'preview';
const commitSha = process.env.VERCEL_GIT_COMMIT_SHA || 'dev';
const shortSha = commitSha.slice(0, 7);

// Generate unique cache name for each deployment
const cacheVersion = isVercel ? shortSha : 'dev';

export default defineConfig({
  base: '/',
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
  },
  define: {
    // Expose build info to the app
    __APP_VERSION__: JSON.stringify(cacheVersion),
    __IS_PREVIEW__: JSON.stringify(isPreview),
  },
  server: {
    port: 3000,
  },
  plugins: [
    VitePWA({
      // Disable service worker registration for preview deployments
      // This prevents PWA caching issues when testing different versions
      selfDestroying: isPreview,
      registerType: 'autoUpdate',
      includeAssets: ['icons/*.png', 'favicon.ico', 'favicon-16x16.png', 'favicon-32x32.png'],
      manifest: {
        name: 'Stencillator',
        short_name: 'Stencillator',
        description: 'Generate SVG stencils for 3D printing with ease',
        theme_color: '#0f172a',
        background_color: '#0f172a',
        display: 'standalone',
        orientation: 'any',
        scope: '/',
        start_url: '/',
        icons: [
          {
            src: '/icons/icon-72x72.png',
            sizes: '72x72',
            type: 'image/png',
          },
          {
            src: '/icons/icon-96x96.png',
            sizes: '96x96',
            type: 'image/png',
          },
          {
            src: '/icons/icon-128x128.png',
            sizes: '128x128',
            type: 'image/png',
          },
          {
            src: '/icons/icon-144x144.png',
            sizes: '144x144',
            type: 'image/png',
          },
          {
            src: '/icons/icon-152x152.png',
            sizes: '152x152',
            type: 'image/png',
          },
          {
            src: '/icons/icon-192x192.png',
            sizes: '192x192',
            type: 'image/png',
            purpose: 'any maskable',
          },
          {
            src: '/icons/icon-384x384.png',
            sizes: '384x384',
            type: 'image/png',
          },
          {
            src: '/icons/icon-512x512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any maskable',
          },
        ],
      },
      workbox: {
        // Use versioned cache names to avoid conflicts between deployments
        cacheId: `stencillator-${cacheVersion}`,
        globPatterns: ['**/*.{js,css,html,ico,png,svg,ttf,otf}'],
        // Clean up old caches from previous versions
        cleanupOutdatedCaches: true,
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/cdn\.jsdelivr\.net\/pyodide\/.*/i,
            handler: 'CacheFirst',
            options: {
              cacheName: `pyodide-cache-${cacheVersion}`,
              expiration: {
                maxEntries: 50,
                maxAgeSeconds: 60 * 60 * 24 * 30, // 30 days
              },
              cacheableResponse: {
                statuses: [0, 200],
              },
            },
          },
          {
            urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'google-fonts-cache',
              expiration: {
                maxEntries: 10,
                maxAgeSeconds: 60 * 60 * 24 * 365, // 1 year
              },
            },
          },
          {
            urlPattern: /^https:\/\/fonts\.gstatic\.com\/.*/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'gstatic-fonts-cache',
              expiration: {
                maxEntries: 10,
                maxAgeSeconds: 60 * 60 * 24 * 365, // 1 year
              },
            },
          },
        ],
      },
    }),
  ],
});

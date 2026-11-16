import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import path from 'node:path'
import type { Plugin } from 'vite'
import { defineConfig } from 'vite'

/** Force le téléchargement APK (sinon Chrome ouvre / ignore le fichier). */
function apkDownloadPlugin(): Plugin {
  return {
    name: 'apk-download-headers',
    configureServer(server) {
      server.middlewares.use((req, res, next) => {
        const url = req.url?.split('?')[0] ?? ''
        // Évite que le téléphone garde une vieille page / JS en cache.
        res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate')
        res.setHeader('Pragma', 'no-cache')
        if (url.endsWith('.apk') || url.endsWith('/AfriConnect.apk')) {
          res.setHeader(
            'Content-Type',
            'application/vnd.android.package-archive',
          )
          res.setHeader(
            'Content-Disposition',
            'attachment; filename="AfriConnect.apk"',
          )
          res.setHeader('X-Content-Type-Options', 'nosniff')
        }
        next()
      })
    },
  }
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss(), apkDownloadPlugin()],
  resolve: {
    alias: {
      '@': path.resolve(import.meta.dirname, './src'),
    },
  },
  server: {
    host: true,
    port: 5200,
    // Tunnels téléphone (Cloudflare / localtunnel) : Host public ≠ localhost.
    allowedHosts: true,
  },
})

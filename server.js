// Minimal static server for the built SPA (used by Railway).
import express from 'express'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'
import { existsSync } from 'node:fs'

const __dirname = dirname(fileURLToPath(import.meta.url))
const dist = join(__dirname, 'dist')

if (!existsSync(dist)) {
  console.error('Build not found. Run "npm run build" first (dist/ is missing).')
  process.exit(1)
}

const app = express()
const PORT = process.env.PORT || 3000

// Long-cache hashed assets, no-cache for the HTML shell.
app.use(
  express.static(dist, {
    setHeaders: (res, path) => {
      if (path.endsWith('index.html')) res.setHeader('Cache-Control', 'no-cache')
      else if (path.includes('/assets/')) res.setHeader('Cache-Control', 'public, max-age=31536000, immutable')
    },
  })
)

// SPA fallback.
app.get('*', (_req, res) => res.sendFile(join(dist, 'index.html')))

app.listen(PORT, () => console.log(`Baza zadań serwuje na porcie ${PORT}`))

# Hostinger-Specific Deployment Notes

## Why We Use `serve`

QR Seal is a **Vite static app** (React + TypeScript). It builds to a `dist/` folder containing plain HTML, CSS, and JS files — no server required.

However, **Hostinger Node.js Hosting** expects a Node.js process that:
1. Listens on the port assigned via the `$PORT` environment variable.
2. Stays running as a long-lived process.

Hostinger's auto-deploy runs `npm install`, then `npm run build`, then `npm start`. If there's no `start` script, deploy fails.

### The Adapter Pattern

We use the [`serve`](https://www.npmjs.com/package/serve) package as a lightweight static file server to bridge this gap:

```json
{
  "scripts": {
    "build": "vite build",
    "start": "serve dist -p $PORT -s"
  }
}
```

**What each flag does:**

| Flag | Purpose |
|------|---------|
| `dist` | Serve files from the `dist/` directory (Vite's build output) |
| `-p $PORT` | Listen on the port Hostinger assigns (required for their routing) |
| `-s` | **SPA mode** — serves `index.html` for any path that doesn't match a file. This is critical because QR Seal uses **hash-based routing** (`/#dashboard`, `/#billing`, etc.) and also has a multi-entry build (`/app/index.html`). Without `-s`, refreshing the page on a route like `/app` would return a 404. |

### Why `serve` Is a Production Dependency

`serve` is listed in `dependencies` (not `devDependencies`) because it runs in production on Hostinger. Hostinger only installs production dependencies by default.

### Multi-Entry Build

The Vite config (`vite.config.ts`) defines two entry points:

```
dist/
├── index.html          ← Landing site (marketing pages)
├── app/
│   └── index.html      ← App dashboard (the actual app)
├── assets/
│   ├── index-*.css
│   ├── index-*.js       ← Landing site bundle
│   ├── main-*.js        ← Landing site bundle
│   └── app-*.js         ← App dashboard bundle
```

The `serve -s` flag handles both entries correctly:
- `/` → serves `dist/index.html` (landing site)
- `/app` → serves `dist/app/index.html` (dashboard)
- `/app/#billing` → serves `dist/app/index.html` (dashboard, hash router handles the rest)

## Environment Variables on Hostinger

Set these in **Hostinger Dashboard → Website → Advanced → Node.js → Environment Variables**:

| Variable | Required | Notes |
|----------|----------|-------|
| `VITE_SUPABASE_URL` | ✅ | Must be set **before** `npm run build` (baked into the JS bundle at build time) |
| `VITE_SUPABASE_ANON_KEY` | ✅ | Same as above — build-time variable |
| `REPLICATE_API_TOKEN` | ⚠️ | Only needed if AI generation endpoint is server-side |
| `PORT` | ❌ | Hostinger sets this automatically — do NOT set manually |

> **Important:** `VITE_*` variables are embedded into the JavaScript bundle during `npm run build`. They are NOT read at runtime. If you change a `VITE_*` variable, you must **rebuild** the app.

## Deploy Flow on Hostinger

```
1. Push to GitHub (main branch)
2. Hostinger auto-deploy triggers:
   a. npm install        ← installs dependencies + serve
   b. npm run build      ← vite build → creates dist/
   c. npm start          ← serve dist -p $PORT -s → serves the app
3. App is live on your domain
```

## Troubleshooting

| Symptom | Likely Cause | Fix |
|---------|-------------|-----|
| Blank page after deploy | `VITE_SUPABASE_URL` not set before build | Set env vars, then rebuild |
| 404 on `/app` | `serve -s` flag missing | Ensure `start` script uses `-s` |
| Port conflict error | Manually set `PORT` env var | Remove manual `PORT` — let Hostinger assign it |
| `serve: not found` | `serve` is in devDependencies | Move to `dependencies` (already done) |

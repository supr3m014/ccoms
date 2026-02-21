# REPO MAP (Generated in Stage 00)

Fill using repo‑truth commands (no guessing). Keep it short and accurate.

## Repo structure
- Top‑level directories: `docs/`, `src/`, `supabase/`, `public/`
- App directory (frontend): `src/app`
- API/server directory (if any): `src/app/api` (standard Next.js)
- Where `package.json` lives: `./package.json`
- Where config lives (vite/next/tailwind/tsconfig): `next.config.js`, `tailwind.config.js`, `postcss.config.js`, `tsconfig.json`

## Scripts (from package.json)
- dev: `next dev`
- build: `next build`
- lint: `next lint`
- test: (None detected in package.json)
- e2e (if any): (None detected)
- other: `start`, `typecheck`

## Environment keys (from repo search)
- Supabase (url/anon/etc): `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- Other APIs: (None detected)
- Payments: (None detected)
- Analytics/monitoring: (None detected)

## Confirmed critical paths
- App entry (router/layout): `src/app/layout.tsx`, `src/app/page.tsx`
- Feature under work (current stage): Stage 00 (Orientation)
- API routes / server handlers: `src/app/api`
- DB client init: `src/lib/supabase.ts`
- Auth middleware/guards: `supabase/functions`, `src/contexts`
- Deploy config (vercel/netlify/etc): (None detected in repo, likely Vercel default)

## Commands used
```bash
ls -F
find . -maxdepth 3 -name package.json
cat package.json
ls src/app
cat src/lib/supabase.ts
ls -a
```

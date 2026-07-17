// SERVER ONLY — the single source of SEO config for Next's metadata layer.
//
// This is what makes localhost behave exactly like the live site: robots.txt,
// sitemap.xml, llms.txt, per-page meta and JSON-LD are all produced by real
// Next routes/metadata reading this config, in `next dev` AND in the static
// export. Nothing is "build-only" any more.
//
// Where the config comes from:
//   dev    → live Firestore when serviceAccount.json is present (edit in the
//            admin panel, refresh localhost, see it — same as production),
//            falling back to the cache file.
//   build  → .seo-cache.json, refreshed by `npm run seo:pull` in prebuild.
//            Keeps the build deterministic and credential-optional.
//
// Never import this from a client component.

import 'server-only'
import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { EMPTY_CONFIG, normalizeSchema, type SeoConfig } from '@/lib/seo-routes'

const CACHE_FILE = join(process.cwd(), '.seo-cache.json')
const DEV = process.env.NODE_ENV === 'development'
const DEV_TTL_MS = 3000

let memo: { at: number; cfg: SeoConfig } | null = null

function fromCacheFile(): SeoConfig {
  try {
    const raw = JSON.parse(readFileSync(CACHE_FILE, 'utf8'))
    return {
      ...EMPTY_CONFIG,
      ...raw,
      meta: { pages: raw?.meta?.pages ?? {} },
      schema: { rules: normalizeSchema(raw?.schema) },
      files: { ...EMPTY_CONFIG.files, ...(raw?.files ?? {}) },
      sitemap: { ...EMPTY_CONFIG.sitemap, ...(raw?.sitemap ?? {}) },
      scripts: { ...EMPTY_CONFIG.scripts, ...(raw?.scripts ?? {}) },
    }
  } catch {
    return EMPTY_CONFIG
  }
}

async function fromFirestore(): Promise<SeoConfig | null> {
  try {
    const credPath = join(process.cwd(), 'serviceAccount.json')
    const cred = JSON.parse(readFileSync(credPath, 'utf8'))
    const { getApps, initializeApp, cert } = await import('firebase-admin/app')
    const { getFirestore } = await import('firebase-admin/firestore')
    const app =
      getApps().find((a) => a.name === 'seo-config') ??
      initializeApp({ credential: cert(cred) }, 'seo-config')
    const db = getFirestore(app)
    const ids = ['meta', 'schema', 'files', 'sitemap', 'scripts'] as const
    const snaps = await Promise.all(ids.map((id) => db.collection('seo_config').doc(id).get()))
    const raw: Record<string, any> = {}
    ids.forEach((id, i) => { raw[id] = snaps[i].exists ? snaps[i].data() : {} })
    return {
      meta: { pages: raw.meta?.pages ?? {} },
      schema: { rules: normalizeSchema(raw.schema) },
      files: { ...EMPTY_CONFIG.files, ...raw.files },
      sitemap: { ...EMPTY_CONFIG.sitemap, ...raw.sitemap },
      scripts: { ...EMPTY_CONFIG.scripts, ...raw.scripts },
    }
  } catch {
    return null // no credentials, offline, etc. — caller falls back to cache
  }
}

export async function getSeoConfig(): Promise<SeoConfig> {
  if (memo && (!DEV || Date.now() - memo.at < DEV_TTL_MS)) return memo.cfg
  const cfg = (DEV ? await fromFirestore() : null) ?? fromCacheFile()
  memo = { at: Date.now(), cfg }
  return cfg
}

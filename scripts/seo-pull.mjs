#!/usr/bin/env node
/**
 * Pull the admin-managed SEO config out of Firestore into .seo-cache.json.
 *
 * The Next build reads that file (src/lib/seo-config.server.ts) to produce
 * robots.txt, sitemap.xml, llms.txt, per-page meta and JSON-LD. Running this
 * in `prebuild` keeps the build deterministic and means a machine without
 * credentials can still build from the committed cache.
 *
 * Best-effort by design: if there are no credentials it warns and leaves the
 * existing cache alone — it must never break `npm run dev` or `npm run build`.
 *
 * Usage:
 *   npm run seo:pull                                   # uses ./serviceAccount.json
 *   GOOGLE_APPLICATION_CREDENTIALS=./serviceAccount.json node scripts/seo-pull.mjs
 */

import { initializeApp, cert, applicationDefault } from 'firebase-admin/app'
import { getFirestore } from 'firebase-admin/firestore'
import { readFileSync, writeFileSync, existsSync } from 'node:fs'

const OUT = '.seo-cache.json'
const IDS = ['meta', 'schema', 'files', 'sitemap', 'scripts']

function credentials() {
  const explicit = process.env.GOOGLE_APPLICATION_CREDENTIALS
  if (explicit && existsSync(explicit)) return cert(JSON.parse(readFileSync(explicit, 'utf8')))
  if (existsSync('./serviceAccount.json')) return cert(JSON.parse(readFileSync('./serviceAccount.json', 'utf8')))
  return applicationDefault()
}

async function main() {
  initializeApp({ credential: credentials() })
  const db = getFirestore()
  const snaps = await Promise.all(IDS.map((id) => db.collection('seo_config').doc(id).get()))

  const cfg = {}
  IDS.forEach((id, i) => { cfg[id] = snaps[i].exists ? snaps[i].data() : {} })

  // Timestamps aren't JSON and aren't needed downstream.
  const clean = JSON.parse(JSON.stringify(cfg, (k, v) => (k === 'updatedAt' ? undefined : v)))
  writeFileSync(OUT, JSON.stringify(clean, null, 2) + '\n')

  const pages = Object.keys(clean.meta?.pages ?? {}).length
  const rules = (clean.schema?.rules ?? []).length || (clean.schema?.global ? 1 : 0)
  console.log(`seo-pull: wrote ${OUT} — ${pages} page override(s), ${rules} schema rule(s), robots ${clean.files?.robots ? 'set' : 'empty'}, llms ${clean.files?.llms ? 'set' : 'empty'}`)
}

main()
  .then(() => process.exit(0))
  .catch((e) => {
    console.warn(`seo-pull: skipped (${e.message?.split('\n')[0] || e}) — using existing ${OUT}`)
    process.exit(0) // never break dev/build
  })

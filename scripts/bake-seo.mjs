#!/usr/bin/env node
/**
 * Bake SEO scripts into the static export.
 *
 * Runs AFTER `next build`. Reads the admin-managed scripts from Firestore
 * (doc seo_config/scripts) and injects them as REAL <script> tags into every
 * out/*.html — head before </head>, bodyStart after <body>, footer before
 * </body>. Idempotent: re-running replaces content between markers, so it's
 * safe to run on every deploy.
 *
 * Usage:
 *   node scripts/bake-seo.mjs                                   # EMULATOR (local test)
 *   SEED_TARGET=production GOOGLE_APPLICATION_CREDENTIALS=./serviceAccount.json \
 *     node scripts/bake-seo.mjs                                 # PRODUCTION (deploy)
 *
 * Deploy order:  next build  →  node scripts/bake-seo.mjs  →  push out/ to production
 */

import { initializeApp, cert, applicationDefault } from 'firebase-admin/app'
import { getFirestore } from 'firebase-admin/firestore'
import { readFileSync, readdirSync, statSync, writeFileSync } from 'node:fs'
import { join, relative, sep } from 'node:path'

const OUT_DIR = 'out'
const SITE_ORIGIN = 'https://ccoms.ph'
const TARGET = process.env.SEED_TARGET === 'production' ? 'production' : 'emulator'

if (TARGET === 'emulator') {
  process.env.FIRESTORE_EMULATOR_HOST ||= '127.0.0.1:8080'
  process.env.GCLOUD_PROJECT ||= 'demo-ccoms'
  initializeApp({ projectId: process.env.GCLOUD_PROJECT })
  console.log(`bake-seo: reading from EMULATOR (${process.env.FIRESTORE_EMULATOR_HOST})`)
} else {
  const credPath = process.env.GOOGLE_APPLICATION_CREDENTIALS
  if (credPath) initializeApp({ credential: cert(JSON.parse(readFileSync(credPath, 'utf8'))) })
  else if (process.env.FIREBASE_PROJECT_ID && process.env.FIREBASE_CLIENT_EMAIL && process.env.FIREBASE_PRIVATE_KEY) {
    initializeApp({ credential: cert({
      projectId: process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
    }) })
  } else initializeApp({ credential: applicationDefault() })
  console.log('bake-seo: reading from PRODUCTION Firestore')
}

const db = getFirestore()

const block = (slot, content) => `<!-- CC-SEO:${slot}:start -->\n${content.trim()}\n<!-- CC-SEO:${slot}:end -->`

// Remove any prior injection for a slot so the bake is idempotent.
function stripBlock(html, slot) {
  const re = new RegExp(`<!-- CC-SEO:${slot}:start -->[\\s\\S]*?<!-- CC-SEO:${slot}:end -->\\n?`, 'g')
  return html.replace(re, '')
}

// head → before the last </head>; footer → before the last </body>
function injectBefore(html, slot, content, anchor) {
  html = stripBlock(html, slot)
  if (!content) return html
  const i = html.lastIndexOf(anchor)
  if (i === -1) return html
  return html.slice(0, i) + block(slot, content) + '\n' + html.slice(i)
}

// bodyStart → immediately after the opening <body ...> tag
function injectAfterBody(html, content) {
  html = stripBlock(html, 'bodyStart')
  if (!content) return html
  const m = html.match(/<body[^>]*>/i)
  if (!m) return html
  const at = html.indexOf(m[0]) + m[0].length
  return html.slice(0, at) + '\n' + block('bodyStart', content) + html.slice(at)
}

function walkHtml(dir) {
  const files = []
  for (const name of readdirSync(dir)) {
    const p = join(dir, name)
    const st = statSync(p)
    if (st.isDirectory()) files.push(...walkHtml(p))
    else if (name.endsWith('.html')) files.push(p)
  }
  return files
}

// out/about.html -> /about ; out/index.html -> / ; out/services/seo.html -> /services/seo
function routeOf(file) {
  let r = '/' + relative(OUT_DIR, file).split(sep).join('/')
  r = r.replace(/\.html$/, '').replace(/\/index$/, '')
  return r === '' ? '/' : r
}

const escapeHtml = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')

/* ── Meta rewriting ──────────────────────────────────────────────────── */

function setTitle(html, title) {
  if (!title) return html
  return html.replace(/<title>[\s\S]*?<\/title>/i, `<title>${escapeHtml(title)}</title>`)
}

// Replace an existing <meta name|property="X" content="…"> or insert before </head>.
function setMeta(html, attr, key, content) {
  if (!content) return html
  const re = new RegExp(`<meta[^>]*${attr}=["']${key.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}["'][^>]*>`, 'i')
  const tag = `<meta ${attr}="${key}" content="${escapeHtml(content)}"/>`
  if (re.test(html)) return html.replace(re, tag)
  const i = html.lastIndexOf('</head>')
  return i === -1 ? html : html.slice(0, i) + tag + html.slice(i)
}

function applyMeta(html, o) {
  if (!o) return html
  html = setTitle(html, o.title)
  html = setMeta(html, 'name', 'description', o.description)
  html = setMeta(html, 'property', 'og:title', o.ogTitle || o.title)
  html = setMeta(html, 'property', 'og:description', o.ogDescription || o.description)
  html = setMeta(html, 'property', 'og:image', o.ogImage)
  return html
}

const isNoindex = (html) => /<meta[^>]*name=["']robots["'][^>]*content=["'][^"']*noindex/i.test(html)

async function readCfg(id) {
  const snap = await db.collection('seo_config').doc(id).get()
  return snap.exists ? snap.data() : {}
}

async function main() {
  const [s, metaCfg, filesCfg, schemaCfg, sitemapCfg] = await Promise.all([
    readCfg('scripts'), readCfg('meta'), readCfg('files'), readCfg('schema'), readCfg('sitemap'),
  ])

  const head = (s.head || '').trim()
  const bodyStart = (s.bodyStart || '').trim()
  const footer = (s.footer || '').trim()
  const metaPages = metaCfg.pages || {}
  const schemaJson = (schemaCfg.global || '').trim()
  const excluded = new Set(sitemapCfg.exclude || [])
  const changefreq = sitemapCfg.changefreq || 'monthly'
  const priority = typeof sitemapCfg.priority === 'number' ? sitemapCfg.priority : 0.7

  // Schema is injected as a real JSON-LD script inside the head slot's sibling marker.
  const schemaBlock = schemaJson ? `<script type="application/ld+json">${schemaJson}</script>` : ''

  const files = walkHtml(OUT_DIR)
  let touched = 0
  const sitemapUrls = []

  for (const file of files) {
    const route = routeOf(file)
    const before = readFileSync(file, 'utf8')
    let html = before

    // 1) per-page meta overrides
    html = applyMeta(html, metaPages[route])

    // 2) scripts + schema
    html = injectBefore(html, 'head', head, '</head>')
    html = injectAfterBody(html, bodyStart)
    html = injectBefore(html, 'footer', footer, '</body>')
    html = injectBefore(html, 'schema', schemaBlock, '</head>')

    if (html !== before) { writeFileSync(file, html); touched++ }

    // 3) collect sitemap entries — skip admin, 404, noindex and excluded routes
    const isPrivate = route.startsWith('/admin') || route === '/404'
    if (!isPrivate && !excluded.has(route) && !isNoindex(html)) {
      sitemapUrls.push(route)
    }
  }

  // 4) sitemap.xml — built from what's actually in the deployed site
  sitemapUrls.sort((a, b) => (a === '/' ? -1 : b === '/' ? 1 : a.localeCompare(b)))
  const today = new Date().toISOString().split('T')[0]
  const xml = [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
    ...sitemapUrls.map((r) => [
      '  <url>',
      `    <loc>${SITE_ORIGIN}${r}</loc>`,
      `    <lastmod>${today}</lastmod>`,
      `    <changefreq>${changefreq}</changefreq>`,
      `    <priority>${r === '/' ? '1.0' : priority.toFixed(1)}</priority>`,
      '  </url>',
    ].join('\n')),
    '</urlset>',
  ].join('\n')
  writeFileSync(join(OUT_DIR, 'sitemap.xml'), xml + '\n')

  // 5) robots.txt / llms.txt
  const robots = (filesCfg.robots || '').trim()
  const llms = (filesCfg.llms || '').trim()
  if (robots) writeFileSync(join(OUT_DIR, 'robots.txt'), robots + '\n')
  if (llms) writeFileSync(join(OUT_DIR, 'llms.txt'), llms + '\n')

  console.log(`bake-seo: ${files.length} html scanned, ${touched} updated`)
  console.log(`bake-seo: sitemap.xml written with ${sitemapUrls.length} urls`)
  console.log(`bake-seo: robots.txt ${robots ? 'written' : 'skipped (empty)'}, llms.txt ${llms ? 'written' : 'skipped (empty)'}`)
  console.log(`bake-seo: schema ${schemaJson ? 'injected' : 'none'}, scripts ${head || bodyStart || footer ? 'injected' : 'none'}`)
}

main().then(() => process.exit(0)).catch((e) => { console.error('bake-seo failed:', e); process.exit(1) })

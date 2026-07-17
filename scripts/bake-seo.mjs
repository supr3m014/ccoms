#!/usr/bin/env node
/**
 * Bake the admin's custom <script> tags into the static export.
 *
 * This is the ONE piece of SEO that can't be a Next route: raw third-party
 * snippets (GA, Pixel, Clarity, verification tags…) have to land in the HTML
 * as real, executing <script> tags. Everything else — robots.txt, sitemap.xml,
 * llms.txt, per-page meta, canonical, noindex/nofollow and JSON-LD — is now
 * produced by native Next routes/metadata, so it works on localhost too:
 *
 *   src/app/robots.ts         → /robots.txt
 *   src/app/sitemap.ts        → /sitemap.xml
 *   src/app/llms.txt/route.ts → /llms.txt
 *   src/lib/seo-meta.ts       → per-page <title>/description/OG/canonical/robots
 *   src/components/JsonLd.tsx → per-page JSON-LD
 *
 * Reads seo_config/scripts via .seo-cache.json (written by scripts/seo-pull.mjs
 * in prebuild), so the bake needs no credentials of its own.
 *
 * Idempotent: content between the CC-SEO markers is replaced on every run.
 *
 * Deploy order:  npm run build  →  node scripts/bake-seo.mjs  →  push out/
 */

import { readFileSync, readdirSync, statSync, writeFileSync, existsSync } from 'node:fs'
import { join } from 'node:path'

const OUT_DIR = 'out'
const CACHE = '.seo-cache.json'

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

function main() {
  if (!existsSync(OUT_DIR)) {
    console.error(`bake-seo: no ${OUT_DIR}/ — run \`npm run build\` first`)
    process.exit(1)
  }

  let scripts = {}
  try {
    scripts = JSON.parse(readFileSync(CACHE, 'utf8')).scripts ?? {}
  } catch {
    console.warn(`bake-seo: no ${CACHE} — run \`npm run seo:pull\`; skipping script injection`)
  }

  const head = (scripts.head || '').trim()
  const bodyStart = (scripts.bodyStart || '').trim()
  const footer = (scripts.footer || '').trim()

  const files = walkHtml(OUT_DIR)
  let touched = 0

  for (const file of files) {
    const before = readFileSync(file, 'utf8')
    let html = before
    html = injectBefore(html, 'head', head, '</head>')
    html = injectAfterBody(html, bodyStart)
    html = injectBefore(html, 'footer', footer, '</body>')
    if (html !== before) { writeFileSync(file, html); touched++ }
  }

  const slots = [head && 'head', bodyStart && 'bodyStart', footer && 'footer'].filter(Boolean)
  console.log(
    slots.length
      ? `bake-seo: injected [${slots.join(', ')}] into ${touched}/${files.length} html files`
      : `bake-seo: no custom scripts configured — ${files.length} html files left untouched`,
  )
}

main()

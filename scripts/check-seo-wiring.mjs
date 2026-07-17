#!/usr/bin/env node
/**
 * Structural guards for the SEO wiring. Runs in prebuild — cheap, and it
 * catches the two mistakes that are invisible until they've hurt rankings.
 *
 *  1. A layout that renders <JsonLd> must not sit above child routes, or the
 *     schema is emitted again on every descendant (duplicate Organization on
 *     every /services/* page).
 *  2. Every path in the master page table must have a real layout wiring up
 *     pageMetadata(), or that page silently falls back to the root defaults.
 */

import { readdirSync, readFileSync, existsSync, statSync } from 'node:fs'
import { join } from 'node:path'

const APP = 'src/app'
const problems = []

/* 1 · No <JsonLd> above child routes ─────────────────────────────────────── */

function childPages(dir) {
  const found = []
  ;(function find(d, depth) {
    for (const name of readdirSync(d)) {
      const p = join(d, name)
      if (statSync(p).isDirectory()) find(p, depth + 1)
      else if (name === 'page.tsx' && depth > 0) found.push(p)
    }
  })(dir, 0)
  return found
}

function walk(dir) {
  for (const name of readdirSync(dir)) {
    const p = join(dir, name)
    if (statSync(p).isDirectory()) walk(p)
  }
  const layout = join(dir, 'layout.tsx')
  if (!existsSync(layout)) return
  if (!readFileSync(layout, 'utf8').includes('<JsonLd')) return
  const kids = childPages(dir)
  if (kids.length) {
    problems.push(
      `${layout} renders <JsonLd> but wraps child routes — schema would be duplicated on:\n    ${kids.join('\n    ')}\n` +
      `  Fix: move this route's page.tsx + layout.tsx into a (group) folder.`,
    )
  }
}

walk(APP)

/* 2 · Every table path is wired ──────────────────────────────────────────── */

const table = readFileSync('src/lib/seo-pages.ts', 'utf8')
const paths = [...table.matchAll(/^ {2}'([^']+)': \{$/gm)].map((m) => m[1])

const wired = new Set()
;(function scan(dir) {
  for (const name of readdirSync(dir)) {
    const p = join(dir, name)
    if (statSync(p).isDirectory()) { scan(p); continue }
    if (name !== 'layout.tsx') continue
    const src = readFileSync(p, 'utf8')
    for (const m of src.matchAll(/pageMetadata\('([^']+)'\)/g)) wired.add(m[1])
  }
})(APP)

for (const p of paths) {
  if (!wired.has(p)) problems.push(`${p} is in seo-pages.ts but no layout calls pageMetadata('${p}') — it would use the root defaults.`)
}

/* ────────────────────────────────────────────────────────────────────────── */

if (problems.length) {
  console.error('check-seo-wiring: FAILED\n  ' + problems.join('\n  '))
  process.exit(1)
}
console.log(`check-seo-wiring: ok — ${paths.length} pages wired, no duplicate JSON-LD`)

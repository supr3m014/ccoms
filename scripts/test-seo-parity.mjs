#!/usr/bin/env node
/**
 * Proves local == live: writes real config to Firestore from the admin's own
 * collections, reads localhost back, then restores the previous state.
 *
 * This is the scenario that used to fail — an override saved in the admin was
 * invisible on localhost because it was only applied at build time.
 *
 * Usage: node scripts/test-seo-parity.mjs [devUrl]
 */

import { initializeApp, cert } from 'firebase-admin/app'
import { getFirestore } from 'firebase-admin/firestore'
import { readFileSync } from 'node:fs'

const DEV = process.argv[2] || 'http://localhost:3001'
const sleep = (ms) => new Promise((r) => setTimeout(r, ms))

initializeApp({ credential: cert(JSON.parse(readFileSync('./serviceAccount.json', 'utf8'))) })
const db = getFirestore()

let pass = 0, fail = 0
const ok = (name, cond, extra = '') => {
  if (cond) { pass++; console.log(`  ✓ ${name}`) }
  else { fail++; console.log(`  ✗ ${name}${extra ? ` — ${extra}` : ''}`) }
}
const get = (p) => fetch(`${DEV}${p}`).then((r) => r.text())
// Count real rendered tags only. The bare string "application/ld+json" also
// appears inside Next's serialized RSC payload, which would inflate this.
const countLd = (html) => (html.match(/<script type="application\/ld\+json">/g) || []).length

const metaRef = db.collection('seo_config').doc('meta')
const schemaRef = db.collection('seo_config').doc('schema')

async function main() {
  // Snapshot so we always put the site back exactly as we found it.
  const metaBefore = (await metaRef.get()).data() ?? {}
  const schemaBefore = (await schemaRef.get()).data() ?? {}
  console.log(`baseline: ${Object.keys(metaBefore.pages ?? {}).length} meta override(s), ${(schemaBefore.rules ?? []).length} schema rule(s)\n`)

  try {
    console.log('1) meta override appears on localhost with no rebuild')
    await metaRef.set({
      pages: {
        '/about': {
          title: 'PARITY TEST TITLE',
          description: 'PARITY TEST DESCRIPTION',
          canonical: '/about-canonical-test',
          noindex: true,
        },
      },
    }, { merge: true })
    await sleep(4000) // dev config TTL is 3s
    let html = await get('/about')
    ok('title overridden', html.includes('<title>PARITY TEST TITLE</title>'))
    ok('description overridden', html.includes('PARITY TEST DESCRIPTION'))
    ok('canonical overridden', html.includes('/about-canonical-test'))
    ok('noindex applied', /<meta name="robots" content="noindex/.test(html))
    const sm = await get('/sitemap.xml')
    ok('noindex page dropped from sitemap.xml', !sm.includes('<loc>https://ccoms.ph/about</loc>'))

    console.log('\n2) admin can force a built-in noindex page back INTO the index')
    await metaRef.set({ pages: { '/portfolio': { noindex: false } } }, { merge: true })
    await sleep(4000)
    html = await get('/portfolio')
    ok('portfolio now index,follow', /<meta name="robots" content="index/.test(html))
    ok('portfolio now in sitemap.xml', (await get('/sitemap.xml')).includes('<loc>https://ccoms.ph/portfolio</loc>'))

    console.log('\n3) granular schema — a /services/* category layer')
    await schemaRef.set({
      global: '',
      rules: [
        { id: 'org', label: 'Org', pattern: '/*', json: JSON.stringify({ '@context': 'https://schema.org', '@type': 'Organization', name: 'Core Conversion' }), enabled: true },
        { id: 'svc', label: 'Service', pattern: '/services/*', json: JSON.stringify({ '@context': 'https://schema.org', '@type': 'Service', serviceType: 'CATEGORY LAYER TEST' }), enabled: true },
        { id: 'one', label: 'One page', pattern: '/contact', json: JSON.stringify({ '@context': 'https://schema.org', '@type': 'ContactPage', name: 'SINGLE PAGE TEST' }), enabled: true },
      ],
    }, { merge: true })
    await sleep(4000)

    const home = await get('/')
    ok('homepage: site-wide rule only (1 block)', countLd(home) === 1, `got ${countLd(home)}`)
    ok('homepage has no category schema', !home.includes('CATEGORY LAYER TEST'))

    const svc = await get('/services/seo')
    ok('/services/seo: site-wide + category (2 blocks)', countLd(svc) === 2, `got ${countLd(svc)}`)
    ok('/services/seo has the category schema', svc.includes('CATEGORY LAYER TEST'))

    const svcHub = await get('/services')
    ok('/services (parent) excluded by /services/*', !svcHub.includes('CATEGORY LAYER TEST'))

    const contact = await get('/contact')
    ok('/contact: site-wide + single-page rule', countLd(contact) === 2 && contact.includes('SINGLE PAGE TEST'), `got ${countLd(contact)}`)
    ok('/contact has no category schema', !contact.includes('CATEGORY LAYER TEST'))

    console.log('\n4) a disabled rule emits nothing')
    await schemaRef.set({
      rules: [{ id: 'off', label: 'Off', pattern: '/*', json: JSON.stringify({ '@type': 'Thing', name: 'DISABLED TEST' }), enabled: false }],
    }, { merge: true })
    await sleep(4000)
    ok('disabled rule not rendered', !(await get('/')).includes('DISABLED TEST'))
  } finally {
    console.log('\n5) restore')
    await metaRef.set({ ...metaBefore, pages: metaBefore.pages ?? {} })
    await schemaRef.set(schemaBefore)
    await sleep(4000)
    const html = await get('/about')
    ok('about title restored', html.includes('<title>About Core Conversion'))
    ok('no test data left on localhost', !html.includes('PARITY TEST'))
    const restoredMeta = (await metaRef.get()).data()?.pages ?? {}
    ok('firestore meta restored', JSON.stringify(restoredMeta) === JSON.stringify(metaBefore.pages ?? {}))
  }

  console.log(`\n${pass} passed, ${fail} failed`)
  process.exit(fail ? 1 : 0)
}

main().catch((e) => { console.error('parity test crashed:', e); process.exit(1) })

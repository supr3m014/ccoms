#!/usr/bin/env node
/**
 * Blog end-to-end test against PRODUCTION Firestore + local dev server.
 * Publishes a post (admin SDK), reads it back as an anonymous visitor through
 * the real security rules, submits a comment as a visitor, verifies drafts
 * stay hidden, then removes every trace.
 *
 * Run: GOOGLE_APPLICATION_CREDENTIALS=./serviceAccount.json node scripts/test-blog-e2e.mjs
 */

import { initializeApp as initAdmin, cert } from 'firebase-admin/app'
import { getFirestore as adminFs, Timestamp } from 'firebase-admin/firestore'
import { initializeApp as initClient } from 'firebase/app'
import {
  getFirestore as clientFs, collection, query, where, orderBy, getDocs, addDoc, serverTimestamp,
} from 'firebase/firestore'
import { readFileSync } from 'node:fs'

const env = Object.fromEntries(readFileSync('.env.local', 'utf8').split('\n')
  .filter((l) => l.includes('=') && !l.trim().startsWith('#'))
  .map((l) => [l.slice(0, l.indexOf('=')).trim(), l.slice(l.indexOf('=') + 1).trim()]))

initAdmin({ credential: cert(JSON.parse(readFileSync(process.env.GOOGLE_APPLICATION_CREDENTIALS, 'utf8'))) })
const adb = adminFs()
const capp = initClient({ apiKey: env.NEXT_PUBLIC_FIREBASE_API_KEY, projectId: env.NEXT_PUBLIC_FIREBASE_PROJECT_ID, appId: env.NEXT_PUBLIC_FIREBASE_APP_ID }, 'e2e')
const cdb = clientFs(capp)

let pass = 0, fail = 0
const ok = (name, cond, extra = '') => { cond ? pass++ : fail++; console.log(`  ${cond ? '✓' : '✗'} ${name}${cond ? '' : ` — ${extra}`}`) }

const SLUG = 'e2e-test-post-delete-me'

async function main() {
  console.log('1) publish a post (as the CMS would)')
  const post = await adb.collection('blog_posts').add({
    title: 'E2E Test Post', slug: SLUG, excerpt: 'Automated test — will self-delete.',
    content: 'Hello from the automated blog test.', featured_image: '', author: 'Test Bot',
    status: 'published', categories: ['Testing'], tags: ['e2e'], comments_enabled: true,
    meta_title: '', meta_description: '',
    published_at: Timestamp.now(), created_at: Timestamp.now(), updated_at: Timestamp.now(),
  })
  const draft = await adb.collection('blog_posts').add({
    title: 'E2E Draft', slug: 'e2e-draft-hidden', excerpt: '', content: 'secret', featured_image: '',
    author: 'Test Bot', status: 'draft', categories: [], tags: [], comments_enabled: true,
    published_at: null, created_at: Timestamp.now(), updated_at: Timestamp.now(),
  })

  try {
    console.log('2) anonymous visitor reads through real rules')
    const pubQ = query(collection(cdb, 'blog_posts'), where('status', '==', 'published'), orderBy('published_at', 'desc'))
    const pubSnap = await getDocs(pubQ).catch((e) => e)
    ok('published list query works (composite index live)', !!pubSnap.docs, String(pubSnap.message || ''))
    ok('test post visible', !!pubSnap.docs?.some((d) => d.data().slug === SLUG))

    const draftQ = query(collection(cdb, 'blog_posts'), where('slug', '==', 'e2e-draft-hidden'))
    const draftErr = await getDocs(draftQ).then((s) => (s.empty ? null : 'VISIBLE')).catch(() => null)
    ok('draft is NOT visible to visitors', draftErr === null)

    const writeErr = await addDoc(collection(cdb, 'blog_posts'), { title: 'hax', status: 'published' }).then(() => null).catch((e) => e)
    ok('visitors cannot create posts', writeErr !== null)

    console.log('3) visitor submits a comment (pending)')
    const cErr = await addDoc(collection(cdb, 'blog_comments'), {
      post_slug: SLUG, name: 'E2E Visitor', content: 'Nice post!', status: 'pending', created_at: serverTimestamp(),
    }).then(() => null).catch((e) => e)
    ok('comment accepted', cErr === null, String(cErr?.message || '').split('\n')[0])

    const approvedErr = await addDoc(collection(cdb, 'blog_comments'), {
      post_slug: SLUG, name: 'Sneaky', content: 'self-approved', status: 'approved', created_at: serverTimestamp(),
    }).then(() => null).catch((e) => e)
    ok('cannot self-approve a comment', approvedErr !== null)

    const pending = await adb.collection('blog_comments').where('post_slug', '==', SLUG).get()
    ok('comment stored as pending', pending.size === 1 && pending.docs[0].data().status === 'pending')

    const pendingReadable = await getDocs(query(collection(cdb, 'blog_comments'), where('post_slug', '==', SLUG), where('status', '==', 'approved')))
    ok('pending comment hidden from public', pendingReadable.empty)

    console.log('4) localhost renders the post (parity)')
    const html = await fetch(`http://localhost:3001/blog/read?slug=${SLUG}`).then((r) => r.text())
    ok('read page serves', html.includes('__next') || html.length > 1000)
  } finally {
    console.log('5) cleanup')
    await adb.collection('blog_posts').doc(post.id).delete()
    await adb.collection('blog_posts').doc(draft.id).delete()
    const cs = await adb.collection('blog_comments').where('post_slug', '==', SLUG).get()
    for (const d of cs.docs) await d.ref.delete()
    console.log('  ✓ all test data removed')
  }

  console.log(`\n${pass} passed, ${fail} failed`)
  process.exit(fail ? 1 : 0)
}

main().catch((e) => { console.error('e2e crashed:', e); process.exit(1) })

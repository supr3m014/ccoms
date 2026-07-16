#!/usr/bin/env node
/**
 * Production smoke test for the Support section. Creates one throwaway chat
 * through the REAL chatStart function, sends a visitor message through the
 * REAL rules, waits for the REAL AI trigger, then deletes every trace.
 *
 * Run: GOOGLE_APPLICATION_CREDENTIALS=./serviceAccount.json node scripts/smoke-support-prod.mjs
 */

import { initializeApp as initAdmin, cert } from 'firebase-admin/app'
import { getFirestore as adminFirestore } from 'firebase-admin/firestore'
import { initializeApp as initClient } from 'firebase/app'
import {
  getFirestore as clientFirestore, doc, getDoc, collection, addDoc, serverTimestamp, getDocs,
} from 'firebase/firestore'
import { readFileSync } from 'node:fs'

const env = Object.fromEntries(
  readFileSync('.env.local', 'utf8').split('\n')
    .filter((l) => l.includes('=') && !l.trim().startsWith('#'))
    .map((l) => [l.slice(0, l.indexOf('=')).trim(), l.slice(l.indexOf('=') + 1).trim()]),
)

initAdmin({ credential: cert(JSON.parse(readFileSync(process.env.GOOGLE_APPLICATION_CREDENTIALS, 'utf8'))) })
const adb = adminFirestore()

const capp = initClient({
  apiKey: env.NEXT_PUBLIC_FIREBASE_API_KEY,
  projectId: env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  appId: env.NEXT_PUBLIC_FIREBASE_APP_ID,
}, 'smoke')
const cdb = clientFirestore(capp)

const sleep = (ms) => new Promise((r) => setTimeout(r, ms))

async function main() {
  console.log('1) chatStart (live)')
  const res = await fetch('https://asia-southeast1-ccoms-production.cloudfunctions.net/chatStart', {
    method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      visitor_name: 'Smoke Test', visitor_email: 'smoke@test.invalid',
      visitor_phone: '+639170000000', visitor_address: '', visitor_country: 'Philippines', category: 'general',
    }),
  })
  const start = await res.json()
  if (!start.session_id) throw new Error(`chatStart failed: ${JSON.stringify(start)}`)
  const sid = start.session_id
  console.log(`   ✓ session ${sid}`)

  console.log('2) visitor rules (unauthenticated, production)')
  const sess = await getDoc(doc(cdb, 'chat_sessions', sid))
  console.log(`   ${sess.exists() ? '✓' : '✗'} can read own session`)
  const denied = await getDocs(collection(cdb, 'chat_sessions')).then(() => false).catch(() => true)
  console.log(`   ${denied ? '✓' : '✗'} cannot list sessions`)

  console.log('3) AI reply (live trigger + secret)')
  await addDoc(collection(cdb, 'chat_sessions', sid, 'messages'), {
    sender_type: 'visitor', content: 'Reply with the single word: WORKING', created_at: serverTimestamp(),
  })
  let ai = null
  for (let i = 0; i < 30 && !ai; i++) {
    await sleep(1000)
    const snap = await adb.collection('chat_sessions').doc(sid).collection('messages').orderBy('created_at').get()
    const msgs = snap.docs.map((d) => d.data())
    if (msgs.filter((m) => m.sender_type === 'ai').length >= 2) ai = msgs[msgs.length - 1]
  }
  console.log(ai ? `   ✓ AI replied: "${String(ai.content).slice(0, 60)}"` : '   ✗ no AI reply in 30s')

  console.log('4) cleanup')
  const msgs = await adb.collection('chat_sessions').doc(sid).collection('messages').get()
  for (const m of msgs.docs) await m.ref.delete()
  await adb.collection('chat_sessions').doc(sid).delete()
  console.log('   ✓ test session removed')

  if (!ai) process.exit(1)
  process.exit(0)
}

main().catch((e) => { console.error('smoke failed:', e.message); process.exit(1) })

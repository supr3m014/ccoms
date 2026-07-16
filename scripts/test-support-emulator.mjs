#!/usr/bin/env node
/**
 * Support section end-to-end test against the local emulators.
 * Run from the project root:  node scripts/test-support-emulator.mjs
 *
 * Covers: chatStart validation, visitor capability rules, AI reply trigger,
 * ticket-from-chat trigger, submitContact (+honeypot), sendSupportEmail auth.
 */

process.env.FIRESTORE_EMULATOR_HOST = '127.0.0.1:8080'
process.env.FIREBASE_AUTH_EMULATOR_HOST = '127.0.0.1:9099'
process.env.GCLOUD_PROJECT = 'demo-ccoms'

import { initializeApp as initAdmin } from 'firebase-admin/app'
import { getFirestore as adminFirestore } from 'firebase-admin/firestore'
import { getAuth as adminAuth } from 'firebase-admin/auth'
import { initializeApp as initClient } from 'firebase/app'
import {
  getFirestore as clientFirestore, connectFirestoreEmulator,
  doc, getDoc, getDocs, collection, addDoc, updateDoc, serverTimestamp, query, orderBy,
} from 'firebase/firestore'

const FN = 'http://127.0.0.1:5001/demo-ccoms/asia-southeast1'

let pass = 0, fail = 0
const ok = (name, cond, extra = '') => {
  if (cond) { pass++; console.log(`  ✓ ${name}`) }
  else { fail++; console.log(`  ✗ ${name} ${extra}`) }
}
const sleep = (ms) => new Promise((r) => setTimeout(r, ms))

initAdmin({ projectId: 'demo-ccoms' })
const adb = adminFirestore()

const capp = initClient({ apiKey: 'fake', projectId: 'demo-ccoms', appId: 'fake' }, 'client')
const cdb = clientFirestore(capp)
connectFirestoreEmulator(cdb, '127.0.0.1', 8080)

async function main() {
  console.log('1) chatStart')
  let res = await fetch(`${FN}/chatStart`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ visitor_name: 'T', visitor_email: 'bad', visitor_phone: '1', visitor_country: '' }) })
  ok('rejects invalid payload (400)', res.status === 400)

  res = await fetch(`${FN}/chatStart`, {
    method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ visitor_name: 'Test Visitor', visitor_email: 'visitor@test.local', visitor_phone: '+639171234567', visitor_address: '', visitor_country: 'Philippines', category: 'sales' }),
  })
  const start = await res.json()
  ok('creates session', res.status === 200 && !!start.session_id, JSON.stringify(start))
  ok('returns welcome', typeof start.welcome === 'string' && start.welcome.includes('Test Visitor'))
  const sid = start.session_id

  console.log('2) visitor capability rules (unauthenticated client)')
  const sessSnap = await getDoc(doc(cdb, 'chat_sessions', sid)).catch((e) => e)
  ok('can GET own session by ID', sessSnap.exists?.() === true)

  const listErr = await getDocs(collection(cdb, 'chat_sessions')).then(() => null).catch((e) => e)
  ok('cannot LIST sessions', listErr !== null && String(listErr.code).includes('permission-denied'))

  const adminMsgErr = await addDoc(collection(cdb, 'chat_sessions', sid, 'messages'), { sender_type: 'admin', content: 'spoof', created_at: serverTimestamp() }).then(() => null).catch((e) => e)
  ok('cannot spoof admin message', adminMsgErr !== null)

  const identityErr = await updateDoc(doc(cdb, 'chat_sessions', sid), { visitor_name: 'Hacker' }).then(() => null).catch((e) => e)
  ok('cannot rewrite identity fields', identityErr !== null)

  const ticketReadErr = await getDocs(collection(cdb, 'tickets')).then(() => null).catch((e) => e)
  ok('cannot read tickets', ticketReadErr !== null)

  console.log('3) AI reply trigger (real Anthropic call)')
  await addDoc(collection(cdb, 'chat_sessions', sid, 'messages'), { sender_type: 'visitor', content: 'What SEO services do you offer? One short sentence please.', created_at: serverTimestamp() })
  let aiMsg = null
  for (let i = 0; i < 30 && !aiMsg; i++) {
    await sleep(1000)
    const snap = await adb.collection('chat_sessions').doc(sid).collection('messages').orderBy('created_at', 'asc').get()
    const msgs = snap.docs.map((d) => d.data())
    if (msgs.filter((m) => m.sender_type === 'ai').length >= 2) aiMsg = msgs[msgs.length - 1]
  }
  ok('AI replied', !!aiMsg, '(no ai message within 30s)')
  if (aiMsg) console.log(`    AI said: "${String(aiMsg.content).slice(0, 100)}…"`)

  const sess = (await adb.collection('chat_sessions').doc(sid).get()).data()
  ok('session last_message fields updated', !!sess.last_message_at && ['ai', 'visitor'].includes(sess.last_message_sender))

  console.log('4) end chat + ticket trigger')
  await updateDoc(doc(cdb, 'chat_sessions', sid), { mode: 'ended', ended_at: serverTimestamp() })
  await updateDoc(doc(cdb, 'chat_sessions', sid), { ticket_created: true })
  let ticket = null
  for (let i = 0; i < 15 && !ticket; i++) {
    await sleep(1000)
    const t = await adb.collection('tickets').where('chat_session_id', '==', sid).get()
    if (!t.empty) ticket = { id: t.docs[0].id, ...t.docs[0].data() }
  }
  ok('ticket created from chat', !!ticket)
  if (ticket) {
    const tmsgs = await adb.collection('tickets').doc(ticket.id).collection('messages').get()
    ok('transcript copied to ticket', tmsgs.size >= 2, `(got ${tmsgs.size})`)
    ok('ticket fields correct', ticket.status === 'open' && ticket.source === 'chat' && ticket.visitor_email === 'visitor@test.local')
  }
  // Re-flip should NOT create a second ticket
  await adb.collection('chat_sessions').doc(sid).update({ ticket_created: false })
  await sleep(500)
  await adb.collection('chat_sessions').doc(sid).update({ ticket_created: true })
  await sleep(4000)
  const dup = await adb.collection('tickets').where('chat_session_id', '==', sid).get()
  ok('no duplicate ticket on re-flip', dup.size === 1, `(got ${dup.size})`)

  const closedErr = await addDoc(collection(cdb, 'chat_sessions', sid, 'messages'), { sender_type: 'visitor', content: 'too late', created_at: serverTimestamp() }).then(() => null).catch((e) => e)
  ok('cannot message an ended session', closedErr !== null)

  console.log('5) submitContact')
  res = await fetch(`${FN}/submitContact`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ name: 'Contact Tester', email: 'contact@test.local', message: 'Hello, I need a website.', phone: '', company: 'TestCo' }) })
  const contact = await res.json()
  ok('accepts valid submission', res.status === 200 && contact.success === true, JSON.stringify(contact))
  const cs = await adb.collection('contact_submissions').where('email', '==', 'contact@test.local').get()
  ok('submission stored', cs.size === 1 && cs.docs[0].data().company === 'TestCo')

  res = await fetch(`${FN}/submitContact`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ name: 'Bot', email: 'bot@spam.local', message: 'spam spam', website_confirm: 'http://spam' }) })
  const honey = await res.json()
  const botDocs = await adb.collection('contact_submissions').where('email', '==', 'bot@spam.local').get()
  ok('honeypot: fake success, nothing stored', honey.success === true && botDocs.empty)

  res = await fetch(`${FN}/submitContact`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ name: 'X', email: 'nope', message: 'hi' }) })
  ok('rejects invalid submission (400)', res.status === 400)

  console.log('6) sendSupportEmail auth')
  res = await fetch(`${FN}/sendSupportEmail`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ to: 'a@b.co', subject: 's', text: 't' }) })
  ok('rejects missing token (403)', res.status === 403)

  // Non-admin user
  await adminAuth().createUser({ uid: 'plain', email: 'plain@test.local', password: 'secret123' })
  let tok = await fetch('http://127.0.0.1:9099/identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=fake', {
    method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'plain@test.local', password: 'secret123', returnSecureToken: true }),
  }).then((r) => r.json())
  ok('got non-admin token', !!tok.idToken)
  res = await fetch(`${FN}/sendSupportEmail`, { method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${tok.idToken}` }, body: JSON.stringify({ to: 'a@b.co', subject: 's', text: 't' }) })
  ok('rejects non-admin token (403)', res.status === 403)

  // Admin user — real SMTP send to the admin's own inbox as end-to-end proof
  await adminAuth().createUser({ uid: 'adm', email: 'admin@test.local', password: 'secret123' })
  await adminAuth().setCustomUserClaims('adm', { admin: true })
  tok = await fetch('http://127.0.0.1:9099/identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=fake', {
    method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'admin@test.local', password: 'secret123', returnSecureToken: true }),
  }).then((r) => r.json())
  ok('got admin token', !!tok.idToken)

  const adminEmail = process.env.TEST_EMAIL_TO
  if (adminEmail) {
    res = await fetch(`${FN}/sendSupportEmail`, {
      method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${tok.idToken}` },
      body: JSON.stringify({ to: adminEmail, subject: '[CCOMS test] Support email relay OK', text: 'This is the Support section SMTP test. If you can read this, ticket replies and transcripts can reach customers.' }),
    })
    const mail = await res.json().catch(() => ({}))
    ok(`admin can send email (real SMTP → ${adminEmail})`, res.status === 200 && mail.success === true, JSON.stringify(mail))
  } else {
    console.log('  – skipped real SMTP send (set TEST_EMAIL_TO to enable)')
  }

  console.log(`\n${pass} passed, ${fail} failed`)
  process.exit(fail ? 1 : 0)
}

main().catch((e) => { console.error('test crashed:', e); process.exit(1) })

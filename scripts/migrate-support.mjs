#!/usr/bin/env node
/**
 * One-time migration: Support data from the MySQL bridge → Firestore.
 *
 * Pulls tickets (+ messages), chat sessions (+ messages) and contact
 * submissions through the live api-bridge.php endpoints, and writes them into
 * Firestore with their original IDs (idempotent — re-running overwrites the
 * same docs, never duplicates).
 *
 * Usage:
 *   node scripts/migrate-support.mjs                    # EMULATOR (dry-run target)
 *   SEED_TARGET=production GOOGLE_APPLICATION_CREDENTIALS=./serviceAccount.json \
 *     node scripts/migrate-support.mjs                  # PRODUCTION
 */

import { initializeApp, cert, applicationDefault } from 'firebase-admin/app'
import { getFirestore, Timestamp } from 'firebase-admin/firestore'
import { readFileSync } from 'node:fs'

const BRIDGE = 'https://ccoms.ph/api-bridge.php'
const TARGET = process.env.SEED_TARGET === 'production' ? 'production' : 'emulator'

if (TARGET === 'emulator') {
  process.env.FIRESTORE_EMULATOR_HOST ||= '127.0.0.1:8080'
  process.env.GCLOUD_PROJECT ||= 'demo-ccoms'
  initializeApp({ projectId: process.env.GCLOUD_PROJECT })
  console.log(`migrate-support: writing to EMULATOR (${process.env.FIRESTORE_EMULATOR_HOST})`)
} else {
  const credPath = process.env.GOOGLE_APPLICATION_CREDENTIALS
  if (credPath) initializeApp({ credential: cert(JSON.parse(readFileSync(credPath, 'utf8'))) })
  else initializeApp({ credential: applicationDefault() })
  console.log('migrate-support: writing to PRODUCTION Firestore')
}

const db = getFirestore()

const get = async (params) => {
  const url = new URL(BRIDGE)
  Object.entries(params).forEach(([k, v]) => url.searchParams.set(k, v))
  const res = await fetch(url, { signal: AbortSignal.timeout(30000) })
  if (!res.ok) throw new Error(`${url} → HTTP ${res.status}`)
  return res.json()
}
const post = async (action, body) => {
  const res = await fetch(`${BRIDGE}?action=${action}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
    signal: AbortSignal.timeout(30000),
  })
  if (!res.ok) throw new Error(`${action} → HTTP ${res.status}`)
  return res.json()
}

// MySQL datetimes are naive strings; the admin UI always treated them as UTC
// (it appended 'Z' before parsing), so we do the same.
const ts = (s) => {
  if (!s) return null
  const d = new Date(String(s).endsWith('Z') || String(s).includes('T') ? s : `${s.replace(' ', 'T')}Z`)
  return Number.isNaN(d.getTime()) ? null : Timestamp.fromDate(d)
}

const bool = (v) => v === true || v === 1 || v === '1'

async function migrateChats() {
  const { sessions = [] } = await get({ action: 'chat-history-list' })
  let msgTotal = 0
  for (const s of sessions) {
    const started = ts(s.started_at) ?? Timestamp.now()
    const { messages = [] } = await post('chat-history-messages', { session_id: s.id })
    const last = messages.length ? messages[messages.length - 1] : null

    await db.collection('chat_sessions').doc(s.id).set({
      visitor_name: s.visitor_name || 'Visitor',
      visitor_email: s.visitor_email || '',
      visitor_phone: s.visitor_phone || '',
      visitor_address: s.visitor_address || '',
      visitor_country: s.visitor_country || '',
      category: s.category || 'general',
      // historical sessions always arrive closed — nobody is waiting in them
      mode: 'ended',
      ticket_created: bool(s.ticket_created),
      started_at: started,
      ended_at: ts(s.ended_at) ?? ts(last?.created_at) ?? started,
      last_message_at: ts(last?.created_at) ?? started,
      last_message_sender: last?.sender_type || 'system',
      admin_typing_at: null,
      visitor_typing_at: null,
      migrated_from: 'mysql',
    })

    for (const m of messages) {
      await db.collection('chat_sessions').doc(s.id).collection('messages').doc(m.id).set({
        sender_type: m.sender_type,
        content: m.content || '',
        created_at: ts(m.created_at) ?? started,
      })
    }
    msgTotal += messages.length
  }
  console.log(`chats: ${sessions.length} sessions, ${msgTotal} messages`)
}

async function migrateTickets() {
  const { tickets = [] } = await post('ticket-list', {})
  let msgTotal = 0
  for (const t of tickets) {
    const created = ts(t.created_at) ?? Timestamp.now()
    await db.collection('tickets').doc(t.id).set({
      subject: t.subject || '(no subject)',
      visitor_name: t.visitor_name || '',
      visitor_email: t.visitor_email || '',
      visitor_phone: t.visitor_phone || '',
      category: t.category || 'general',
      status: t.status || 'open',
      priority: t.priority || 'medium',
      source: t.source || 'manual',
      ...(t.chat_session_id && { chat_session_id: t.chat_session_id }),
      created_at: created,
      updated_at: ts(t.updated_at) ?? created,
      migrated_from: 'mysql',
    })

    const { messages = [] } = await post('ticket-messages', { ticket_id: t.id })
    for (const m of messages) {
      await db.collection('tickets').doc(t.id).collection('messages').doc(m.id).set({
        sender_type: m.sender_type || 'customer',
        sender_name: m.sender_name || '',
        content: m.content || '',
        is_internal: bool(m.is_internal),
        created_at: ts(m.created_at) ?? created,
      })
    }
    msgTotal += messages.length
  }
  console.log(`tickets: ${tickets.length} tickets, ${msgTotal} messages`)
}

async function migrateContacts() {
  const res = await get({ table: 'contact_submissions', order: 'created_at', dir: 'DESC' })
  const rows = Array.isArray(res.data) ? res.data : Array.isArray(res) ? res : []
  for (const c of rows) {
    await db.collection('contact_submissions').doc(String(c.id)).set({
      name: c.name || '',
      email: c.email || '',
      ...(c.phone && { phone: c.phone }),
      ...(c.company && { company: c.company }),
      ...(c.subject && { subject: c.subject }),
      ...(c.service && { service: c.service }),
      message: c.message || '',
      status: c.status || 'new',
      archived: bool(c.archived),
      created_at: ts(c.created_at) ?? Timestamp.now(),
      migrated_from: 'mysql',
    })
  }
  console.log(`contacts: ${rows.length} submissions`)
  return rows.length
}

async function main() {
  await migrateChats()
  await migrateTickets()
  await migrateContacts()
  console.log('migrate-support: done')
}

main().then(() => process.exit(0)).catch((e) => { console.error('migrate-support failed:', e); process.exit(1) })

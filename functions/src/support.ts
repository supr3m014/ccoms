/**
 * Core Conversion — Support section server side (chat, tickets, contact, email).
 *
 * Replaces the PHP/MySQL bridge endpoints (api-bridge.php chat-… / ticket-…)
 * with Firebase. The static site talks to:
 *
 *   POST chatStart          — visitor opens a chat: creates chat_sessions doc +
 *                             AI welcome message, rate-limited, emails admin.
 *   (Firestore trigger) onChatMessageCreated
 *                           — visitor messages get an AI reply (Claude) while
 *                             the session is in 'ai' mode; keeps the session's
 *                             last_message_* fields fresh for the admin hub.
 *   (Firestore trigger) onChatSessionUpdated
 *                           — when the visitor asks for a ticket after the chat
 *                             ends (ticket_created flips true), builds the
 *                             ticket + copies the transcript.
 *   POST submitContact      — contact form → contact_submissions (validated,
 *                             honeypot, rate-limited).
 *   POST sendSupportEmail   — ADMIN ONLY (verified ID token + admin claim):
 *                             sends ticket replies / transcripts via SMTP.
 *
 * Secrets: ANTHROPIC_API_KEY, SMTP_PASS (Secret Manager).
 * Plain config (functions/.env): SMTP_HOST, SMTP_PORT, SMTP_SECURE, SMTP_USER,
 * ADMIN_EMAIL, FROM_NAME. Everything degrades gracefully when unset.
 */

import { onRequest } from 'firebase-functions/v2/https'
import { onDocumentCreated, onDocumentUpdated } from 'firebase-functions/v2/firestore'
import { logger } from 'firebase-functions/v2'
import { defineSecret } from 'firebase-functions/params'
import { getApps, initializeApp } from 'firebase-admin/app'
import { getFirestore, Timestamp, FieldValue } from 'firebase-admin/firestore'
import { getAuth } from 'firebase-admin/auth'
import { createHash } from 'node:crypto'
import * as nodemailer from 'nodemailer'

if (!getApps().length) initializeApp()
const db = getFirestore()

const ANTHROPIC_API_KEY = defineSecret('ANTHROPIC_API_KEY')
const SMTP_PASS = defineSecret('SMTP_PASS')

const REGION = 'asia-southeast1'

const ALLOWED_ORIGINS = [
  'https://ccoms.ph',
  'https://www.ccoms.ph',
  'http://localhost:3000',
  'http://localhost:3001',
  'http://127.0.0.1:3000',
]

const CATEGORIES = ['general', 'billing', 'sales', 'technical']

/* ── Shared helpers ──────────────────────────────────────────────────── */

const str = (v: unknown, max = 2000): string =>
  typeof v === 'string' ? v.replace(/<[^>]*>/g, '').trim().slice(0, max) : ''

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/

function ipOf(req: { headers: Record<string, unknown>; ip?: string }): string {
  return (req.headers['x-forwarded-for'] as string | undefined)?.split(',')[0]?.trim() || req.ip || 'unknown'
}

/** Max `limit` hits per IP per 10 minutes, per bucket. Fails open. */
async function rateLimited(bucket: string, ip: string, limit: number): Promise<boolean> {
  const ipHash = createHash('sha256').update(`${bucket}|${ip}`).digest('hex').slice(0, 32)
  const windowStart = Timestamp.fromMillis(Date.now() - 10 * 60 * 1000)
  const ref = db.collection('rate_limits').doc(ipHash)
  try {
    return await db.runTransaction(async (tx) => {
      const snap = await tx.get(ref)
      const data = snap.data()
      if (data && data.windowStart.toMillis() > windowStart.toMillis() && data.count >= limit) return true
      if (data && data.windowStart.toMillis() > windowStart.toMillis()) {
        tx.update(ref, { count: FieldValue.increment(1) })
      } else {
        tx.set(ref, { windowStart: Timestamp.now(), count: 1 })
      }
      return false
    })
  } catch (err) {
    logger.error('rate-limit transaction failed', err as Error)
    return false
  }
}

/* ── Email (SMTP via Hostinger) ──────────────────────────────────────── */

function smtpReady(): boolean {
  const pass = SMTP_PASS.value()
  // '__unset__' is the placeholder used until the real mailbox password is
  // stored in Secret Manager — treat it as not configured.
  return Boolean(process.env.SMTP_HOST && process.env.SMTP_USER && pass && pass !== '__unset__')
}

function transporter() {
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT || 465),
    secure: process.env.SMTP_SECURE !== 'false',
    auth: { user: process.env.SMTP_USER, pass: SMTP_PASS.value() },
  })
}

async function sendMail(to: string, subject: string, text: string, replyTo?: string): Promise<boolean> {
  if (!smtpReady()) {
    logger.info('sendMail skipped — SMTP not configured', { subject })
    return false
  }
  try {
    await transporter().sendMail({
      from: `"${process.env.FROM_NAME || 'Core Conversion Support'}" <${process.env.SMTP_USER}>`,
      to,
      subject,
      text,
      ...(replyTo && { replyTo }),
    })
    return true
  } catch (err) {
    logger.error('sendMail failed', err as Error)
    return false
  }
}

/* ── Claude (ported from api-bridge.php call_claude) ─────────────────── */

const PERSONAS: Record<string, string> = {
  billing:
    'You are a billing support specialist for Core Conversion digital marketing agency. Help with invoice questions, payments, refunds. Be empathetic and solution-focused. Keep responses under 4 sentences.',
  sales:
    'You are a sales representative for Core Conversion, a digital marketing agency. Help prospects understand SEO, web dev, brand design, and AI video services. Be helpful but not pushy. Keep responses under 4 sentences.',
  technical:
    'You are a technical support specialist for Core Conversion. Help with website issues, tracking, analytics, CMS questions. Be precise and step-by-step. Keep responses under 4 sentences.',
  general:
    'You are a helpful support assistant for Core Conversion, a digital marketing agency in the Philippines. Help with general inquiries. Be friendly and concise. Keep responses under 3 sentences.',
}

const AI_UNAVAILABLE = 'Our AI assistant is temporarily unavailable. A human agent will assist you shortly.'
const AI_TROUBLE = "I'm having trouble responding right now. A human agent will assist you shortly."

async function callClaude(sessionId: string, category: string): Promise<string> {
  const apiKey = ANTHROPIC_API_KEY.value()
  if (!apiKey) return AI_UNAVAILABLE

  // Last 10 messages, oldest first, as alternating user/assistant turns.
  const snap = await db
    .collection('chat_sessions').doc(sessionId).collection('messages')
    .orderBy('created_at', 'desc').limit(10).get()
  const rows = snap.docs.map((d) => d.data()).reverse()

  const turns: { role: 'user' | 'assistant'; content: string }[] = []
  for (const r of rows) {
    const role = r.sender_type === 'visitor' ? 'user' : r.sender_type === 'ai' || r.sender_type === 'admin' ? 'assistant' : null
    if (!role) continue
    const prev = turns[turns.length - 1]
    if (prev && prev.role === role) prev.content += `\n${r.content}`
    else turns.push({ role, content: String(r.content) })
  }
  while (turns.length && turns[0].role !== 'user') turns.shift()
  if (!turns.length) return AI_TROUBLE

  try {
    const res = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-haiku-4-5-20251001',
        max_tokens: 300,
        system: PERSONAS[category] ?? PERSONAS.general,
        messages: turns,
      }),
      signal: AbortSignal.timeout(25000),
    })
    if (!res.ok) {
      logger.error('anthropic error', { status: res.status, body: (await res.text()).slice(0, 500) })
      return AI_TROUBLE
    }
    const data = (await res.json()) as { content?: { text?: string }[] }
    return data.content?.[0]?.text ?? AI_TROUBLE
  } catch (err) {
    logger.error('anthropic request failed', err as Error)
    return AI_TROUBLE
  }
}

/* ── chatStart ───────────────────────────────────────────────────────── */

export const chatStart = onRequest(
  { region: REGION, cors: ALLOWED_ORIGINS, maxInstances: 5, secrets: [SMTP_PASS] },
  async (req, res) => {
    if (req.method !== 'POST') {
      res.status(405).json({ error: 'Method not allowed.' })
      return
    }
    const body = (req.body ?? {}) as Record<string, unknown>

    const name = str(body.visitor_name, 120)
    const email = str(body.visitor_email, 254).toLowerCase()
    const phone = str(body.visitor_phone, 40)
    const address = str(body.visitor_address, 300)
    const country = str(body.visitor_country, 80)
    const category = CATEGORIES.includes(str(body.category, 20)) ? str(body.category, 20) : 'general'

    if (name.length < 2 || !EMAIL_RE.test(email) || phone.replace(/\D/g, '').length < 7 || !country) {
      res.status(400).json({ error: 'Please fill in your name, a valid email, phone number and country.' })
      return
    }

    if (await rateLimited('chat', ipOf(req), 5)) {
      res.status(429).json({ error: 'Too many chats started from your connection. Please try again in a few minutes.' })
      return
    }

    const now = Timestamp.now()
    const sessionRef = db.collection('chat_sessions').doc()
    const welcome = `Hi ${name}! 👋 Welcome to Core Conversion support. I'm your AI assistant here to help with your ${category} inquiry. How can I help you today?`

    await sessionRef.set({
      visitor_name: name,
      visitor_email: email,
      visitor_phone: phone,
      visitor_address: address,
      visitor_country: country,
      category,
      mode: 'ai',
      ticket_created: false,
      started_at: now,
      ended_at: null,
      last_message_at: now,
      last_message_sender: 'ai',
      admin_typing_at: null,
      visitor_typing_at: null,
    })
    await sessionRef.collection('messages').add({ sender_type: 'ai', content: welcome, created_at: now })

    // Notifications mirror the old bridge; failures never block the chat.
    const adminEmail = process.env.ADMIN_EMAIL
    void sendMail(
      email,
      'Core Conversion — We received your inquiry',
      `Hi ${name},\n\nThank you for reaching out to Core Conversion! We've received your ${category} inquiry.\n\n` +
        `Our AI assistant is currently helping you in the live chat. If a human agent isn't available right away, ` +
        `don't worry — our team will review your conversation and follow up via this email within 24 hours.\n\n` +
        `If you'd like to continue the conversation later, simply visit our website and start a new chat.\n\n` +
        `Best regards,\nCore Conversion Support Team\nhttps://ccoms.ph`,
    )
    if (adminEmail) {
      void sendMail(
        adminEmail,
        `[CCOMS] New Live Chat — ${name} (${category})`,
        `New live chat session started:\n\nName: ${name}\nEmail: ${email}\nPhone: ${phone}\nCategory: ${category}\nCountry: ${country}\n\n` +
          `View in admin: https://ccoms.ph/admin/support/chat\n`,
        email,
      )
    }

    res.json({ session_id: sessionRef.id, welcome })
  },
)

/* ── AI reply + session freshness trigger ────────────────────────────── */

export const onChatMessageCreated = onDocumentCreated(
  { region: REGION, document: 'chat_sessions/{sid}/messages/{mid}', secrets: [ANTHROPIC_API_KEY], maxInstances: 5 },
  async (event) => {
    const msg = event.data?.data()
    if (!msg) return
    const sid = event.params.sid
    const sessionRef = db.collection('chat_sessions').doc(sid)

    if (msg.sender_type !== 'system') {
      await sessionRef.update({
        last_message_at: msg.created_at ?? Timestamp.now(),
        last_message_sender: msg.sender_type,
      }).catch(() => { /* session may be gone */ })
    }

    // Only visitor messages in AI mode get a Claude reply.
    if (msg.sender_type !== 'visitor') return
    const session = (await sessionRef.get()).data()
    if (!session || session.mode !== 'ai') return

    const reply = await callClaude(sid, session.category)
    await sessionRef.collection('messages').add({
      sender_type: 'ai',
      content: reply,
      created_at: Timestamp.now(),
    })
  },
)

/* ── Ticket-from-chat trigger ────────────────────────────────────────── */

export const onChatSessionUpdated = onDocumentUpdated(
  { region: REGION, document: 'chat_sessions/{sid}', maxInstances: 5 },
  async (event) => {
    const before = event.data?.before.data()
    const after = event.data?.after.data()
    if (!before || !after) return
    if (before.ticket_created === true || after.ticket_created !== true) return

    const sid = event.params.sid

    // Idempotency: never create two tickets for one session.
    const existing = await db.collection('tickets').where('chat_session_id', '==', sid).limit(1).get()
    if (!existing.empty) return

    const now = Timestamp.now()
    const ticketRef = db.collection('tickets').doc()
    await ticketRef.set({
      subject: `Chat inquiry — ${after.category}`,
      visitor_name: after.visitor_name,
      visitor_email: after.visitor_email,
      visitor_phone: after.visitor_phone || '',
      category: after.category,
      status: 'open',
      priority: 'medium',
      source: 'chat',
      chat_session_id: sid,
      created_at: now,
      updated_at: now,
    })

    // Copy the transcript (skip system notices), preserving timestamps.
    const msgs = await db.collection('chat_sessions').doc(sid).collection('messages').orderBy('created_at', 'asc').get()
    const batch = db.batch()
    for (const doc of msgs.docs) {
      const m = doc.data()
      if (m.sender_type === 'system') continue
      batch.set(ticketRef.collection('messages').doc(), {
        sender_type: m.sender_type === 'visitor' ? 'customer' : 'admin',
        sender_name: m.sender_type === 'visitor' ? after.visitor_name : m.sender_type === 'ai' ? 'AI Assistant' : 'Agent',
        content: m.content,
        is_internal: false,
        created_at: m.created_at ?? now,
      })
    }
    await batch.commit()
    logger.info('ticket created from chat', { sid, ticket: ticketRef.id })
  },
)

/* ── submitContact ───────────────────────────────────────────────────── */

export const submitContact = onRequest(
  { region: REGION, cors: ALLOWED_ORIGINS, maxInstances: 5, secrets: [SMTP_PASS] },
  async (req, res) => {
    if (req.method !== 'POST') {
      res.status(405).json({ success: false, message: 'Method not allowed.' })
      return
    }
    const body = (req.body ?? {}) as Record<string, unknown>

    // Honeypot — respond as success so bots learn nothing.
    if (str(body.website_confirm, 100).length > 0) {
      logger.info('contact honeypot rejection')
      res.json({ success: true })
      return
    }

    const name = str(body.name, 120)
    const email = str(body.email, 254).toLowerCase()
    const phone = str(body.phone, 40)
    const company = str(body.company, 160)
    const message = str(body.message, 5000)

    if (name.length < 2 || !EMAIL_RE.test(email) || message.length < 5) {
      res.status(400).json({ success: false, message: 'Please review the highlighted fields.' })
      return
    }

    if (await rateLimited('contact', ipOf(req), 3)) {
      res.status(429).json({ success: false, message: 'Too many submissions. Please try again shortly.' })
      return
    }

    await db.collection('contact_submissions').add({
      name,
      email,
      ...(phone && { phone }),
      ...(company && { company }),
      message,
      status: 'new',
      archived: false,
      created_at: Timestamp.now(),
      ...(str(req.headers['user-agent'], 400) && { userAgent: str(req.headers['user-agent'], 400) }),
    })

    const adminEmail = process.env.ADMIN_EMAIL
    if (adminEmail) {
      void sendMail(
        adminEmail,
        `[CCOMS] New Contact Message — ${name}`,
        `New contact form submission:\n\nName: ${name}\nEmail: ${email}\nPhone: ${phone || '—'}\nCompany: ${company || '—'}\n\n${message}\n\n` +
          `Reply from admin: https://ccoms.ph/admin/support/email\n`,
        email,
      )
    }

    res.json({ success: true })
  },
)

/* ── sendSupportEmail (admin only) ───────────────────────────────────── */

export const sendSupportEmail = onRequest(
  { region: REGION, cors: ALLOWED_ORIGINS, maxInstances: 5, secrets: [SMTP_PASS] },
  async (req, res) => {
    if (req.method !== 'POST') {
      res.status(405).json({ success: false, message: 'Method not allowed.' })
      return
    }

    // Verify the caller is a signed-in admin (Firebase ID token + claim).
    const authHeader = String(req.headers.authorization || '')
    const idToken = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : ''
    try {
      const decoded = await getAuth().verifyIdToken(idToken)
      if (decoded.admin !== true) throw new Error('not admin')
    } catch {
      res.status(403).json({ success: false, message: 'Not authorized.' })
      return
    }

    const body = (req.body ?? {}) as Record<string, unknown>
    const to = str(body.to, 254)
    const subject = str(body.subject, 200)
    const text = typeof body.text === 'string' ? body.text.trim().slice(0, 20000) : ''

    if (!EMAIL_RE.test(to) || !subject || !text) {
      res.status(400).json({ success: false, message: 'to, subject and text are required.' })
      return
    }

    if (!smtpReady()) {
      res.status(503).json({ success: false, message: 'Email sending is not configured yet (SMTP secret missing).' })
      return
    }

    const sent = await sendMail(to, subject, text)
    if (!sent) {
      res.status(502).json({ success: false, message: 'The mail server rejected the message. Please try again.' })
      return
    }
    res.json({ success: true })
  },
)

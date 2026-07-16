// Admin-side Support helpers — shared types + the email relay caller.
// Import ONLY from admin pages (the public bundle must stay Firebase-free).

import { Timestamp } from 'firebase/firestore'
import { getFirebaseAuth } from '@/lib/firebase'

export type TicketStatus = 'open' | 'pending' | 'on-hold' | 'resolved'
export type TicketPriority = 'low' | 'medium' | 'high'
export type Category = 'general' | 'billing' | 'sales' | 'technical'
export type ChatMode = 'ai' | 'human' | 'ended'

export interface Ticket {
  id: string
  subject: string
  visitor_name: string
  visitor_email: string
  visitor_phone?: string
  category: Category | string
  status: TicketStatus | string
  priority: TicketPriority | string
  source: string
  chat_session_id?: string
  created_at: Timestamp
  updated_at?: Timestamp
}

export interface TicketMessage {
  id: string
  sender_type: 'admin' | 'customer' | 'system' | string
  sender_name?: string
  content: string
  is_internal?: boolean
  created_at: Timestamp
}

export interface ChatSessionDoc {
  id: string
  visitor_name: string
  visitor_email: string
  visitor_phone?: string
  visitor_country?: string
  category: Category | string
  mode: ChatMode
  started_at: Timestamp
  ended_at?: Timestamp | null
  last_message_at?: Timestamp | null
  last_message_sender?: string
  admin_typing_at?: Timestamp | null
  ticket_created?: boolean
}

export interface ChatMessageDoc {
  id: string
  sender_type: 'visitor' | 'ai' | 'admin' | 'system'
  content: string
  created_at: Timestamp
}

export interface Macro {
  id: string
  title: string
  shorthand: string
  content: string
  created_at: string
}

/** One shared doc for macros — fixes the old chat_macros/support_macros split. */
export const MACROS_DOC = { collection: 'support_config', id: 'macros' } as const

const EMAIL_ENDPOINT =
  process.env.NEXT_PUBLIC_EMAIL_ENDPOINT ||
  (process.env.NODE_ENV === 'development'
    ? 'http://127.0.0.1:5001/demo-ccoms/asia-southeast1/sendSupportEmail'
    : '')

/**
 * Sends an email through the sendSupportEmail Cloud Function, authenticated
 * with the signed-in admin's ID token. Returns an error message on failure,
 * null on success.
 */
export async function sendSupportEmail(to: string, subject: string, text: string): Promise<string | null> {
  if (!EMAIL_ENDPOINT) return 'Email endpoint is not configured on this build.'
  const user = getFirebaseAuth().currentUser
  if (!user) return 'You are not signed in.'
  try {
    const token = await user.getIdToken()
    const res = await fetch(EMAIL_ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ to, subject, text }),
    })
    const data = await res.json().catch(() => ({}))
    if (!res.ok || !data.success) return data.message || 'Sending failed.'
    return null
  } catch {
    return 'Could not reach the email service.'
  }
}

export const tsDate = (t?: Timestamp | null): Date | null => (t ? t.toDate() : null)

export const fmtTime = (t?: Timestamp | null): string =>
  t ? t.toDate().toLocaleTimeString('en-PH', { timeZone: 'Asia/Manila', hour: '2-digit', minute: '2-digit' }) : ''

export const fmtDate = (t?: Timestamp | null): string => (t ? t.toDate().toLocaleDateString() : '')

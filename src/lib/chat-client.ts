// Visitor-side live chat on Firebase.
//
// IMPORTANT: this module (and through it the Firebase SDK) must only be
// loaded on demand — ChatWidget dynamic-imports it when the visitor actually
// opens the chat, so the public bundle stays Firebase-free (spec §19).
//
// Access model: chatStart (Cloud Function) creates the session and returns
// its unguessable ID — that ID is the visitor's capability to read/write
// their own session. Messages stream in realtime via onSnapshot (the old
// bridge polled every 2.5s). AI replies are written server-side by the
// onChatMessageCreated trigger.

import {
  collection, doc, onSnapshot, addDoc, updateDoc, getDoc,
  query, orderBy, serverTimestamp, Timestamp, type Unsubscribe,
} from 'firebase/firestore'
import { getDb } from '@/lib/firebase'

export interface ChatMessage {
  id: string
  sender_type: 'visitor' | 'ai' | 'admin' | 'system'
  content: string
  created_at: Timestamp | null
}

export interface ChatSession {
  mode: 'ai' | 'human' | 'ended'
  category: string
  admin_typing_at: Timestamp | null
  ticket_created: boolean
}

const CHAT_ENDPOINT =
  process.env.NEXT_PUBLIC_CHAT_ENDPOINT ||
  (process.env.NODE_ENV === 'development'
    ? 'http://127.0.0.1:5001/demo-ccoms/asia-southeast1/chatStart'
    : '')

export async function startChat(payload: {
  visitor_name: string
  visitor_email: string
  visitor_phone: string
  visitor_address: string
  visitor_country: string
  category: string
}): Promise<{ session_id?: string; welcome?: string; error?: string }> {
  if (!CHAT_ENDPOINT) return { error: 'Chat is not configured on this build.' }
  const res = await fetch(CHAT_ENDPOINT, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  })
  return res.json()
}

/** Returns the session if it exists and is still open, else null. */
export async function getOpenSession(sessionId: string): Promise<ChatSession | null> {
  try {
    const snap = await getDoc(doc(getDb(), 'chat_sessions', sessionId))
    if (!snap.exists()) return null
    const s = snap.data() as ChatSession
    return s.mode === 'ended' ? null : s
  } catch {
    return null
  }
}

export function subscribeSession(sessionId: string, cb: (s: ChatSession | null) => void): Unsubscribe {
  return onSnapshot(
    doc(getDb(), 'chat_sessions', sessionId),
    (snap) => cb(snap.exists() ? (snap.data() as ChatSession) : null),
    () => cb(null),
  )
}

export function subscribeMessages(sessionId: string, cb: (msgs: ChatMessage[]) => void): Unsubscribe {
  const q = query(collection(getDb(), 'chat_sessions', sessionId, 'messages'), orderBy('created_at', 'asc'))
  return onSnapshot(q, (snap) => {
    cb(snap.docs.map((d) => ({ id: d.id, ...(d.data({ serverTimestamps: 'estimate' }) as Omit<ChatMessage, 'id'>) })))
  })
}

export async function sendVisitorMessage(sessionId: string, content: string): Promise<void> {
  await addDoc(collection(getDb(), 'chat_sessions', sessionId, 'messages'), {
    sender_type: 'visitor',
    content,
    created_at: serverTimestamp(),
  })
}

export async function setVisitorTyping(sessionId: string): Promise<void> {
  await updateDoc(doc(getDb(), 'chat_sessions', sessionId), { visitor_typing_at: serverTimestamp() })
}

export async function endChat(sessionId: string): Promise<void> {
  await updateDoc(doc(getDb(), 'chat_sessions', sessionId), { mode: 'ended', ended_at: serverTimestamp() })
}

/** Flips ticket_created — the onChatSessionUpdated trigger builds the ticket. */
export async function requestTicket(sessionId: string): Promise<void> {
  await updateDoc(doc(getDb(), 'chat_sessions', sessionId), { ticket_created: true })
}

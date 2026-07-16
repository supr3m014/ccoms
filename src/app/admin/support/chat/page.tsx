'use client'

// Live Chat Hub — Firestore-backed, fully realtime (onSnapshot; the old
// bridge version polled every 3–5s). Visitor messages appear instantly and
// AI replies are written by the onChatMessageCreated Cloud Function.

import { useState, useEffect, useRef } from 'react'
import {
  collection, doc, query, orderBy, onSnapshot, addDoc, updateDoc, getDoc,
  serverTimestamp,
} from 'firebase/firestore'
import { getDb } from '@/lib/firebase'
import { MACROS_DOC, fmtTime, type ChatSessionDoc, type ChatMessageDoc, type Macro } from '@/lib/support'
import { MessageCircle, User, Bot, Send, UserCheck, Clock } from 'lucide-react'
import { useToast } from '@/contexts/ToastContext'

export default function LiveChatHubPage() {
  const { showToast } = useToast()
  const [sessions, setSessions] = useState<ChatSessionDoc[]>([])
  const [selectedSession, setSelectedSession] = useState<string | null>(null)
  const [messages, setMessages] = useState<ChatMessageDoc[]>([])
  const [input, setInput] = useState('')
  const [sending, setSending] = useState(false)
  const [loading, setLoading] = useState(true)
  const [macros, setMacros] = useState<Macro[]>([])
  const [macroChip, setMacroChip] = useState<Macro | null>(null)

  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const typingThrottleRef = useRef<number>(0)
  // Track when admin last viewed each session (sessionId → timestamp ms)
  const viewedAt = useRef<Map<string, number>>(new Map())

  const isUnread = (s: ChatSessionDoc): boolean => {
    if (s.last_message_sender !== 'visitor' || !s.last_message_at) return false
    return s.last_message_at.toMillis() > (viewedAt.current.get(s.id) ?? 0)
  }

  const selectedSessionData = sessions.find(s => s.id === selectedSession)

  // Macros (shared doc with the Macros page)
  useEffect(() => {
    getDoc(doc(getDb(), MACROS_DOC.collection, MACROS_DOC.id))
      .then((snap) => {
        const list = snap.exists() ? (snap.data().list as Macro[]) : []
        if (Array.isArray(list)) setMacros(list)
      })
      .catch(() => {})
  }, [])

  // Live session list, freshest conversation first
  useEffect(() => {
    const q = query(collection(getDb(), 'chat_sessions'), orderBy('last_message_at', 'desc'))
    const unsub = onSnapshot(q, (snap) => {
      const next = snap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<ChatSessionDoc, 'id'>) }))
      const active = next.filter((s) => s.mode !== 'ended')
      setSessions(active)
      const newest = active[0]
      if (newest && isUnread(newest) && newest.id !== selectedSession) {
        document.title = '💬 New message — Core Conversion Admin'
        setTimeout(() => { document.title = 'Core Conversion Admin' }, 4000)
      }
      setLoading(false)
    }, () => setLoading(false))
    return unsub
  }, [selectedSession])

  // Live messages for the open conversation
  useEffect(() => {
    if (!selectedSession) return
    const q = query(collection(getDb(), 'chat_sessions', selectedSession, 'messages'), orderBy('created_at', 'asc'))
    return onSnapshot(q, (snap) => {
      setMessages(snap.docs.map((d) => ({
        id: d.id,
        ...(d.data({ serverTimestamps: 'estimate' }) as Omit<ChatMessageDoc, 'id'>),
      })))
      viewedAt.current.set(selectedSession, Date.now())
    })
  }, [selectedSession])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const selectSession = (id: string) => {
    viewedAt.current.set(id, Date.now())
    setSelectedSession(id)
    setMessages([])
  }

  const takeover = async (sessionId: string) => {
    try {
      await updateDoc(doc(getDb(), 'chat_sessions', sessionId), { mode: 'human' })
      await addDoc(collection(getDb(), 'chat_sessions', sessionId, 'messages'), {
        sender_type: 'system',
        content: '🔄 An agent has joined the chat and will assist you now.',
        created_at: serverTimestamp(),
      })
      showToast("You've taken over the chat", 'success')
    } catch {
      showToast('Failed to take over', 'error')
    }
  }

  const handleInputChange = (value: string) => {
    setInput(value)
    if (selectedSession && Date.now() - typingThrottleRef.current > 2000) {
      typingThrottleRef.current = Date.now()
      updateDoc(doc(getDb(), 'chat_sessions', selectedSession), { admin_typing_at: serverTimestamp() }).catch(() => {})
    }
    const lastWord = value.split(' ').pop() || ''
    if (lastWord.startsWith('/') && lastWord.length > 1) {
      const match = macros.find(m => m.shorthand.toLowerCase() === lastWord.toLowerCase())
      setMacroChip(match || null)
    } else {
      setMacroChip(null)
    }
  }

  const applyMacro = (macro: Macro) => {
    const words = input.split(' ')
    words[words.length - 1] = macro.content
    setInput(words.join(' '))
    setMacroChip(null)
    inputRef.current?.focus()
  }

  const sendReply = async () => {
    if (!input.trim() || !selectedSession || sending) return
    const text = input.trim()
    setInput('')
    setSending(true)
    try {
      await addDoc(collection(getDb(), 'chat_sessions', selectedSession, 'messages'), {
        sender_type: 'admin', content: text, created_at: serverTimestamp(),
      })
    } catch { showToast('Failed to send', 'error') }
    setSending(false)
  }

  const formatElapsed = (started?: { toMillis: () => number }) => {
    if (!started) return ''
    const mins = Math.floor((Date.now() - started.toMillis()) / 60000)
    return mins < 60 ? `${mins}m` : `${Math.floor(mins / 60)}h ${mins % 60}m`
  }

  const catColor = (cat: string) => ({ general: 'bg-gray-100 text-gray-700', billing: 'bg-yellow-100 text-yellow-700', sales: 'bg-green-100 text-green-700', technical: 'bg-blue-100 text-blue-700' }[cat] || 'bg-gray-100 text-gray-700')

  const bubble = (type: string) => {
    if (type === 'visitor') return 'bg-blue-600 text-white'
    if (type === 'admin') return 'bg-emerald-600 text-white'
    if (type === 'system') return 'bg-gray-100 text-gray-500 text-xs'
    return 'bg-white border border-gray-200 text-gray-800'
  }

  const unreadCount = sessions.filter(s => isUnread(s) && s.id !== selectedSession).length

  return (
    <div className="h-full flex overflow-hidden">
      {/* Sessions list */}
      <div className="w-80 bg-white border-r border-gray-200 flex flex-col shrink-0">
        <div className="px-4 py-4 border-b border-gray-200">
          <h2 className="font-bold text-gray-900">Live Chat Hub</h2>
          <p className="text-xs text-gray-500">
            {sessions.length} active session{sessions.length !== 1 ? 's' : ''}
            {unreadCount > 0 && <span className="ml-1 text-blue-600 font-semibold">· {unreadCount} unread</span>}
            <span className="ml-1 text-emerald-600">· live</span>
          </p>
        </div>
        <div className="flex-1 overflow-y-auto">
          {loading ? (
            <div className="p-8 text-center text-sm text-gray-500">Loading...</div>
          ) : sessions.length === 0 ? (
            <div className="p-8 text-center">
              <MessageCircle className="w-10 h-10 text-gray-300 mx-auto mb-3" />
              <p className="text-sm text-gray-500">No active chats</p>
              <p className="text-xs text-gray-400 mt-1">New sessions appear here instantly</p>
            </div>
          ) : sessions.map(s => {
            const unread = isUnread(s) && s.id !== selectedSession
            const isSelected = selectedSession === s.id
            return (
              <button
                key={s.id}
                onClick={() => selectSession(s.id)}
                className={`w-full text-left px-4 py-3 border-b border-gray-100 transition-colors relative
                  ${isSelected
                    ? 'bg-blue-50 border-l-4 border-l-blue-500'
                    : unread
                      ? 'bg-white hover:bg-blue-50 border-l-4 border-l-blue-400'
                      : 'bg-gray-50 hover:bg-gray-100 border-l-4 border-l-transparent'
                  }`}
              >
                <div className="flex items-start justify-between mb-1">
                  <div className="flex items-center gap-1.5 min-w-0">
                    {unread && <span className="w-2 h-2 rounded-full bg-blue-500 shrink-0" />}
                    <p className={`text-sm truncate ${unread ? 'font-bold text-gray-900' : 'font-medium text-gray-700'}`}>
                      {s.visitor_name}
                    </p>
                  </div>
                  <span className="text-xs text-gray-400 shrink-0 ml-2 flex items-center gap-1">
                    <Clock className="w-3 h-3" />{formatElapsed(s.started_at)}
                  </span>
                </div>
                <p className={`text-xs truncate mb-1.5 ${unread ? 'text-gray-700' : 'text-gray-400'}`}>
                  {s.visitor_email}
                </p>
                <div className="flex gap-1.5">
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${catColor(s.category)}`}>{s.category}</span>
                  <span className={`text-xs px-2 py-0.5 rounded-full ${s.mode === 'ai' ? 'bg-purple-100 text-purple-700' : 'bg-emerald-100 text-emerald-700'}`}>
                    {s.mode === 'ai' ? '🤖 AI' : '👤 Human'}
                  </span>
                  {unread && (
                    <span className="text-xs px-2 py-0.5 rounded-full bg-blue-100 text-blue-700 font-semibold">New</span>
                  )}
                </div>
              </button>
            )
          })}
        </div>
      </div>

      {/* Chat panel */}
      {selectedSession && selectedSessionData ? (
        <div className="flex-1 flex flex-col bg-gray-50 min-w-0">
          <div className="bg-white border-b border-gray-200 px-6 py-3 flex items-center justify-between shrink-0">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 bg-blue-100 rounded-full flex items-center justify-center"><User className="w-5 h-5 text-blue-600" /></div>
              <div>
                <p className="font-semibold text-gray-900 text-sm">{selectedSessionData.visitor_name}</p>
                <p className="text-xs text-gray-500">{selectedSessionData.visitor_email} · {selectedSessionData.visitor_phone || '—'} · {selectedSessionData.visitor_country}</p>
              </div>
            </div>
            <div className="flex gap-2">
              {selectedSessionData.mode === 'ai' && (
                <button onClick={() => takeover(selectedSession)} className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold transition-colors">
                  <UserCheck className="w-3.5 h-3.5" />Take Over from AI
                </button>
              )}
              {selectedSessionData.mode === 'human' && (
                <span className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-100 text-emerald-700 rounded-lg text-xs font-semibold">
                  <UserCheck className="w-3.5 h-3.5" />You're handling this
                </span>
              )}
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-2">
            {messages.map((m) => (
              <div key={m.id} className={`flex ${m.sender_type === 'system' ? 'justify-center' : m.sender_type === 'visitor' ? 'justify-start' : 'justify-end'}`}>
                <div className={`flex items-end gap-2 max-w-[75%] ${m.sender_type !== 'visitor' && m.sender_type !== 'system' ? 'flex-row-reverse' : ''}`}>
                  {m.sender_type === 'ai' && <Bot className="w-5 h-5 text-purple-400 shrink-0 mb-1" />}
                  {m.sender_type === 'visitor' && <User className="w-5 h-5 text-blue-400 shrink-0 mb-1" />}
                  <div>
                    <div className={`px-3.5 py-2.5 rounded-2xl text-sm leading-relaxed ${bubble(m.sender_type)}`}>{m.content}</div>
                    {m.sender_type !== 'system' && (
                      <p className={`text-xs text-gray-400 mt-0.5 px-1 ${m.sender_type !== 'visitor' ? 'text-right' : ''}`}>
                        {m.sender_type === 'visitor' ? selectedSessionData.visitor_name : m.sender_type === 'ai' ? 'AI' : 'You'} · {fmtTime(m.created_at)}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          {selectedSessionData.mode === 'human' ? (
            <div className="bg-white border-t border-gray-200 p-3 shrink-0">
              {macroChip && (
                <div className="mb-2 flex items-center gap-2">
                  <span className="text-xs text-gray-500">Insert macro:</span>
                  <button onClick={() => applyMacro(macroChip)}
                    className="flex items-center gap-1.5 px-3 py-1 bg-blue-50 border border-blue-200 text-blue-700 rounded-lg text-xs font-semibold hover:bg-blue-100 transition-colors">
                    {macroChip.title}
                    <kbd className="text-xs bg-blue-100 px-1 rounded">Tab</kbd>
                  </button>
                </div>
              )}
              <div className="flex gap-2">
                <input
                  ref={inputRef}
                  type="text" value={input}
                  onChange={e => handleInputChange(e.target.value)}
                  onKeyDown={e => {
                    if (e.key === 'Tab' && macroChip) { e.preventDefault(); applyMacro(macroChip); return }
                    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendReply() }
                  }}
                  placeholder="Reply to customer... (type /shorthand for macros)"
                  className="flex-1 px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <button onClick={sendReply} disabled={!input.trim() || sending} className="w-10 h-10 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white rounded-xl flex items-center justify-center transition-colors">
                  <Send className="w-4 h-4" />
                </button>
              </div>
            </div>
          ) : (
            <div className="bg-amber-50 border-t border-amber-200 px-4 py-3 text-center shrink-0">
              <p className="text-xs text-amber-700">🤖 AI is handling this chat. <button onClick={() => takeover(selectedSession)} className="font-semibold underline hover:text-amber-900">Take over</button> to reply manually.</p>
            </div>
          )}
        </div>
      ) : (
        <div className="flex-1 flex items-center justify-center bg-gray-50">
          <div className="text-center">
            <MessageCircle className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Select a chat session</h3>
            <p className="text-sm text-gray-500">Active sessions appear on the left — live</p>
          </div>
        </div>
      )}
    </div>
  )
}

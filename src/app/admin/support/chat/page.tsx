'use client'

import { useState, useEffect, useRef } from 'react'
import { MessageCircle, User, Bot, Send, UserCheck, Clock, RefreshCw } from 'lucide-react'
import { useToast } from '@/contexts/ToastContext'
import { supabase } from '@/lib/supabase'

interface Macro { id: string; title: string; content: string; shorthand: string }

interface Session {
  id: string
  visitor_name: string
  visitor_email: string
  visitor_phone: string
  visitor_country: string
  category: string
  mode: 'ai' | 'human' | 'ended'
  started_at: string
}

interface Message {
  id: string
  session_id: string
  sender_type: 'visitor' | 'ai' | 'admin' | 'system'
  content: string
  created_at: string
}

export default function LiveChatHubPage() {
  const { showToast } = useToast()
  const [sessions, setSessions] = useState<Session[]>([])
  const [selectedSession, setSelectedSession] = useState<string | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [sending, setSending] = useState(false)
  const [loading, setLoading] = useState(true)
  const [macros, setMacros] = useState<Macro[]>([])
  const [macroChip, setMacroChip] = useState<Macro | null>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const sessionPollRef = useRef<NodeJS.Timeout | null>(null)
  const msgPollRef = useRef<NodeJS.Timeout | null>(null)
  const lastMsgCount = useRef(0)
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const [visitorTyping, setVisitorTyping] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  const selectedSessionData = sessions.find(s => s.id === selectedSession)

  // Load macros on mount
  useEffect(() => {
    supabase.from('site_settings').select('value').eq('key', 'support_macros').maybeSingle()
      .then(({ data }) => { if (data?.value && Array.isArray(data.value)) setMacros(data.value) })
  }, [])

  // Poll sessions every 5s
  useEffect(() => {
    fetchSessions()
    sessionPollRef.current = setInterval(fetchSessions, 5000)
    return () => { if (sessionPollRef.current) clearInterval(sessionPollRef.current) }
  }, [])

  // Auto-poll messages every 3s when a session is selected
  useEffect(() => {
    if (msgPollRef.current) clearInterval(msgPollRef.current)
    if (!selectedSession) return
    fetchMessages(selectedSession)
    msgPollRef.current = setInterval(() => fetchMessages(selectedSession), 3000)
    return () => { if (msgPollRef.current) clearInterval(msgPollRef.current) }
  }, [selectedSession])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const BRIDGE = process.env.NEXT_PUBLIC_API_URL!
  const bridgePost = async (action: string, body: any) => {
    const res = await fetch(`${BRIDGE}?action=${action}`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      credentials: 'include', body: JSON.stringify(body),
    })
    return res.json()
  }
  const bridgeGet = async (action: string, params: Record<string, string> = {}) => {
    const url = new URL(BRIDGE)
    url.searchParams.set('action', action)
    Object.entries(params).forEach(([k, v]) => url.searchParams.set(k, v))
    const res = await fetch(url.toString(), { credentials: 'include' })
    return res.json()
  }

  const fetchSessions = async () => {
    try {
      const data = await bridgeGet('chat-poll', { type: 'admin-sessions' })
      setSessions(data.sessions || [])
    } catch {}
    setLoading(false)
  }

  const fetchMessages = async (sessionId: string) => {
    try {
      const data = await bridgeGet('chat-poll', { session_id: sessionId })
      const incoming: Message[] = data.messages || []
      setMessages(prev => {
        if (incoming.length === prev.length) return prev
        // Notify if new messages arrived and it's from visitor
        if (incoming.length > lastMsgCount.current && lastMsgCount.current > 0) {
          const newest = incoming[incoming.length - 1]
          if (newest?.sender_type === 'visitor') {
            document.title = '💬 New message — Core Conversion Admin'
            setTimeout(() => { document.title = 'Core Conversion Admin' }, 4000)
          }
        }
        lastMsgCount.current = incoming.length
        return incoming
      })
      if (data.session) {
        setSessions(prev => prev.map(s => s.id === sessionId ? { ...s, ...data.session } : s))
        if (data.session.visitor_typing_at) {
          const dateStr = data.session.visitor_typing_at.endsWith('Z') ? data.session.visitor_typing_at : `${data.session.visitor_typing_at}Z`
          const isTyping = Date.now() - new Date(dateStr).getTime() < 5000
          setVisitorTyping(isTyping)
        } else {
          setVisitorTyping(false)
        }
      }
    } catch {}
  }

  const takeover = async (sessionId: string) => {
    try {
      await bridgePost('chat-takeover', { session_id: sessionId })
      showToast("You've taken over the chat", 'success')
      await fetchMessages(sessionId)
      fetchSessions()
    } catch {
      showToast('Failed to take over', 'error')
    }
  }

  const handleInputChange = (value: string) => {
    setInput(value)

    if (!typingTimeoutRef.current && selectedSession) {
      bridgePost('chat-typing', { session_id: selectedSession, type: 'admin' }).catch(() => {})
    }
    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current)
    typingTimeoutRef.current = setTimeout(() => {
      typingTimeoutRef.current = null
    }, 2000)

    // Detect shorthand: last word starting with /
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
      await bridgePost('chat-admin-reply', { session_id: selectedSession, content: text })
      fetchMessages(selectedSession)
    } catch { showToast('Failed to send', 'error') }
    setSending(false)
  }

  const formatTime = (iso: string) =>
    new Date(iso).toLocaleTimeString('en-PH', { timeZone: 'Asia/Manila', hour: '2-digit', minute: '2-digit' })

  const formatElapsed = (started: string) => {
    const dateStr = started.endsWith('Z') ? started : `${started}Z`
    const mins = Math.floor((Date.now() - new Date(dateStr).getTime()) / 60000)
    return mins < 60 ? `${mins}m` : `${Math.floor(mins / 60)}h ${mins % 60}m`
  }

  const catColor = (cat: string) => ({ general: 'bg-gray-100 text-gray-700', billing: 'bg-yellow-100 text-yellow-700', sales: 'bg-green-100 text-green-700', technical: 'bg-blue-100 text-blue-700' }[cat] || 'bg-gray-100 text-gray-700')

  const bubble = (type: string) => {
    if (type === 'visitor') return 'bg-blue-600 text-white'
    if (type === 'admin') return 'bg-emerald-600 text-white'
    if (type === 'system') return 'bg-gray-100 text-gray-500 text-xs'
    return 'bg-white border border-gray-200 text-gray-800'
  }

  return (
    <div className="h-full flex overflow-hidden">
      {/* Sessions list */}
      <div className="w-80 bg-white border-r border-gray-200 flex flex-col shrink-0">
        <div className="px-4 py-4 border-b border-gray-200 flex items-center justify-between">
          <div>
            <h2 className="font-bold text-gray-900">Live Chat Hub</h2>
            <p className="text-xs text-gray-500">{sessions.length} active session{sessions.length !== 1 ? 's' : ''}</p>
          </div>
          <button onClick={fetchSessions} className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors">
            <RefreshCw className="w-4 h-4 text-gray-500" />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto">
          {loading ? (
            <div className="p-8 text-center text-sm text-gray-500">Loading...</div>
          ) : sessions.length === 0 ? (
            <div className="p-8 text-center">
              <MessageCircle className="w-10 h-10 text-gray-300 mx-auto mb-3" />
              <p className="text-sm text-gray-500">No active chats</p>
              <p className="text-xs text-gray-400 mt-1">New sessions appear here automatically</p>
            </div>
          ) : sessions.map(s => (
            <button key={s.id} onClick={() => setSelectedSession(s.id)}
              className={`w-full text-left px-4 py-3 border-b border-gray-100 hover:bg-gray-50 transition-colors ${selectedSession === s.id ? 'bg-blue-50 border-l-4 border-l-blue-500' : ''}`}>
              <div className="flex items-start justify-between mb-1">
                <p className="font-semibold text-gray-900 text-sm truncate">{s.visitor_name}</p>
                <span className="text-xs text-gray-400 shrink-0 ml-2 flex items-center gap-1"><Clock className="w-3 h-3" />{formatElapsed(s.started_at)}</span>
              </div>
              <p className="text-xs text-gray-500 truncate mb-1.5">{s.visitor_email}</p>
              <div className="flex gap-1.5">
                <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${catColor(s.category)}`}>{s.category}</span>
                <span className={`text-xs px-2 py-0.5 rounded-full ${s.mode === 'ai' ? 'bg-purple-100 text-purple-700' : 'bg-emerald-100 text-emerald-700'}`}>{s.mode === 'ai' ? '🤖 AI' : '👤 Human'}</span>
              </div>
            </button>
          ))}
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
              <button onClick={() => fetchMessages(selectedSession)} className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors">
                <RefreshCw className="w-4 h-4 text-gray-500" />
              </button>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-2">
            {messages.map((m, i) => (
              <div key={i} className={`flex ${m.sender_type === 'system' ? 'justify-center' : m.sender_type === 'visitor' ? 'justify-start' : 'justify-end'}`}>
                <div className={`flex items-end gap-2 max-w-[75%] ${m.sender_type !== 'visitor' && m.sender_type !== 'system' ? 'flex-row-reverse' : ''}`}>
                  {m.sender_type === 'ai' && <Bot className="w-5 h-5 text-purple-400 shrink-0 mb-1" />}
                  {m.sender_type === 'visitor' && <User className="w-5 h-5 text-blue-400 shrink-0 mb-1" />}
                  <div>
                    <div className={`px-3.5 py-2.5 rounded-2xl text-sm leading-relaxed ${bubble(m.sender_type)}`}>{m.content}</div>
                    {m.sender_type !== 'system' && (
                      <p className={`text-xs text-gray-400 mt-0.5 px-1 ${m.sender_type !== 'visitor' ? 'text-right' : ''}`}>
                        {m.sender_type === 'visitor' ? selectedSessionData.visitor_name : m.sender_type === 'ai' ? 'AI' : 'You'} · {formatTime(m.created_at)}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            ))}
            {visitorTyping && (
              <div className="flex justify-start">
                <div className="flex items-end gap-2 max-w-[75%]">
                  <User className="w-5 h-5 text-blue-400 shrink-0 mb-1" />
                  <div>
                    <div className="px-4 py-2.5 rounded-2xl bg-white border border-gray-200 text-gray-500 text-sm italic">
                      {selectedSessionData?.visitor_name} is typing...
                    </div>
                  </div>
                </div>
              </div>
            )}
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
            <p className="text-sm text-gray-500">Active sessions appear on the left</p>
          </div>
        </div>
      )}
    </div>
  )
}

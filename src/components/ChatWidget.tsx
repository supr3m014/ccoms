'use client'

import { useState, useEffect, useRef } from 'react'
import { MessageCircle, X, Send, ChevronDown, Loader2 } from 'lucide-react'

interface Message {
  id?: string
  sender_type: 'visitor' | 'ai' | 'admin' | 'system'
  content: string
  created_at?: string
}

type Step = 'closed' | 'intro' | 'form' | 'chat' | 'ended'
type Category = 'general' | 'billing' | 'sales' | 'technical'

const STORAGE_KEY = 'ccoms_chat_session'

export default function ChatWidget() {
  const [step, setStep] = useState<Step>('closed')
  const [sessionId, setSessionId] = useState<string | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [sending, setSending] = useState(false)
  const [mode, setMode] = useState<'ai' | 'human' | 'ended'>('ai')
  const [ticketOffered, setTicketOffered] = useState(false)
  const [ticketCreated, setTicketCreated] = useState(false)
  const [lastPoll, setLastPoll] = useState<string>(new Date().toISOString())
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const pollRef = useRef<NodeJS.Timeout | null>(null)

  const [form, setForm] = useState({
    name: '', email: '', phone: '', address: '', country: 'Philippines',
    category: 'general' as Category,
  })

  // Restore session from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY)
    if (!saved) return
    try {
      const { sessionId: sid, form: savedForm, step: savedStep } = JSON.parse(saved)
      if (!sid || savedStep === 'ended') { localStorage.removeItem(STORAGE_KEY); return }
      // Validate session is still active by polling
      fetch(`/api/chat?session_id=${sid}`).then(r => r.json()).then(data => {
        const session = data.session
        if (!session || session.mode === 'ended') { localStorage.removeItem(STORAGE_KEY); return }
        setSessionId(sid)
        setMode(session.mode)
        setMessages(data.messages || [])
        setLastPoll(new Date().toISOString())
        setStep('chat')
        if (savedForm) setForm(savedForm)
      }).catch(() => localStorage.removeItem(STORAGE_KEY))
    } catch { localStorage.removeItem(STORAGE_KEY) }
  }, [])

  // Persist session to localStorage when it changes
  useEffect(() => {
    if (sessionId && step === 'chat') {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ sessionId, form, step }))
    } else if (step === 'ended' || (!sessionId && step === 'closed')) {
      localStorage.removeItem(STORAGE_KEY)
    }
  }, [sessionId, step])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  // Poll for new messages when chat is active
  useEffect(() => {
    if (!sessionId || step !== 'chat') return
    pollRef.current = setInterval(async () => {
      try {
        const res = await fetch(`/api/chat?session_id=${sessionId}&since=${lastPoll}`)
        const data = await res.json()
        if (data.messages?.length > 0) {
          setMessages(prev => [...prev, ...data.messages])
          setLastPoll(new Date().toISOString())
        }
        if (data.session?.mode === 'ended') {
          setStep('ended')
          if (!ticketOffered) setTicketOffered(true)
        }
        if (data.session?.mode) setMode(data.session.mode)
      } catch {}
    }, 2500)
    return () => { if (pollRef.current) clearInterval(pollRef.current) }
  }, [sessionId, step, lastPoll])

  const startChat = async () => {
    if (!form.name.trim() || !form.email.trim()) return
    setSending(true)
    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'start', ...form }),
      })
      const data = await res.json()
      if (data.session_id) {
        setSessionId(data.session_id)
        setMessages([{ sender_type: 'ai', content: data.welcome }])
        setLastPoll(new Date().toISOString())
        setStep('chat')
      }
    } catch {}
    setSending(false)
  }

  const sendMessage = async () => {
    if (!input.trim() || !sessionId || sending) return
    const text = input.trim()
    setInput('')
    setMessages(prev => [...prev, { sender_type: 'visitor', content: text }])
    setSending(true)
    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'send', session_id: sessionId, content: text }),
      })
      const data = await res.json()
      if (data.message) {
        setMessages(prev => [...prev, { sender_type: data.mode === 'human' ? 'admin' : 'ai', content: data.message }])
      }
      if (data.mode) setMode(data.mode)
    } catch {}
    setSending(false)
  }

  const endChat = async () => {
    if (!sessionId) return
    await fetch('/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'end', session_id: sessionId }),
    })
    setStep('ended')
    setTicketOffered(true)
    if (pollRef.current) clearInterval(pollRef.current)
  }

  const createTicket = async () => {
    if (!sessionId) return
    await fetch('/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'create-ticket', session_id: sessionId }),
    })
    setTicketCreated(true)
  }

  const bubbleColor = (type: string) => {
    if (type === 'visitor') return 'bg-blue-600 text-white self-end'
    if (type === 'system') return 'bg-gray-100 text-gray-500 text-xs text-center self-center'
    return 'bg-white text-gray-800 self-start border border-gray-100 shadow-sm'
  }

  if (step === 'closed') {
    return (
      <button
        onClick={() => setStep('intro')}
        className="fixed bottom-6 right-6 z-[9000] w-14 h-14 bg-blue-600 hover:bg-blue-700 text-white rounded-full shadow-xl flex items-center justify-center transition-all hover:scale-110 animate-fadeIn"
        aria-label="Open chat"
      >
        <MessageCircle className="w-6 h-6" />
      </button>
    )
  }

  return (
    <div className="fixed bottom-6 right-6 z-[9000] w-96 max-w-[calc(100vw-24px)] flex flex-col rounded-2xl shadow-2xl overflow-hidden animate-fadeIn bg-white" style={{ height: step === 'form' ? 'auto' : '520px' }}>

      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-4 py-3 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
            <MessageCircle className="w-4 h-4 text-white" />
          </div>
          <div>
            <p className="text-white font-semibold text-sm">Core Conversion Support</p>
            <p className="text-blue-200 text-xs">{mode === 'ai' ? '🤖 AI Assistant' : mode === 'human' ? '👤 Agent Online' : 'Chat ended'}</p>
          </div>
        </div>
        <div className="flex gap-1">
          {step === 'chat' && (
            <button onClick={endChat} className="p-1.5 hover:bg-white/20 rounded-lg text-white/70 hover:text-white transition-colors text-xs px-2">
              End
            </button>
          )}
          <button onClick={() => setStep('closed')} className="p-1.5 hover:bg-white/20 rounded-lg text-white/70 hover:text-white transition-colors">
            <ChevronDown className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Intro */}
      {step === 'intro' && (
        <div className="flex-1 p-6 flex flex-col items-center justify-center text-center gap-4">
          <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center">
            <MessageCircle className="w-8 h-8 text-blue-600" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-gray-900 mb-1">How can we help?</h3>
            <p className="text-sm text-gray-500">Chat with our AI support or get connected to a human agent.</p>
          </div>
          <button
            onClick={() => setStep('form')}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-xl font-semibold transition-colors"
          >
            Start Chat
          </button>
          <p className="text-xs text-gray-400">Usually replies in under a minute</p>
        </div>
      )}

      {/* Form */}
      {step === 'form' && (
        <div className="flex-1 p-5 overflow-y-auto">
          <h3 className="font-semibold text-gray-900 mb-4">Before we start</h3>
          <div className="space-y-3">
            <input type="text" placeholder="Your name *" value={form.name}
              onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
              className="w-full px-3 py-2.5 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
            <input type="email" placeholder="Email address *" value={form.email}
              onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
              className="w-full px-3 py-2.5 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
            <input type="tel" placeholder="Phone number" value={form.phone}
              onChange={e => setForm(f => ({ ...f, phone: e.target.value }))}
              className="w-full px-3 py-2.5 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
            <input type="text" placeholder="Address" value={form.address}
              onChange={e => setForm(f => ({ ...f, address: e.target.value }))}
              className="w-full px-3 py-2.5 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
            <input type="text" placeholder="Country" value={form.country}
              onChange={e => setForm(f => ({ ...f, country: e.target.value }))}
              className="w-full px-3 py-2.5 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
            <select value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value as Category }))}
              className="w-full px-3 py-2.5 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
              <option value="general">General Inquiry</option>
              <option value="billing">Billing Support</option>
              <option value="sales">Sales</option>
              <option value="technical">Technical Support</option>
            </select>
            <button onClick={startChat} disabled={!form.name.trim() || !form.email.trim() || sending}
              className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white py-3 rounded-xl font-semibold transition-colors flex items-center justify-center gap-2">
              {sending ? <><Loader2 className="w-4 h-4 animate-spin" />Starting...</> : 'Start Chat →'}
            </button>
          </div>
        </div>
      )}

      {/* Chat */}
      {step === 'chat' && (
        <>
          <div className="flex-1 overflow-y-auto p-4 space-y-2 bg-gray-50">
            {messages.map((m, i) => (
              <div key={i} className={`flex ${m.sender_type === 'visitor' ? 'justify-end' : m.sender_type === 'system' ? 'justify-center' : 'justify-start'}`}>
                <div className={`max-w-[80%] px-3.5 py-2.5 rounded-2xl text-sm leading-relaxed ${bubbleColor(m.sender_type)}`}>
                  {m.content}
                </div>
              </div>
            ))}
            {sending && (
              <div className="flex justify-start">
                <div className="bg-white border border-gray-100 shadow-sm px-4 py-3 rounded-2xl flex gap-1.5">
                  <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                  <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                  <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
          <div className="p-3 bg-white border-t border-gray-200 flex gap-2 shrink-0">
            <input
              type="text"
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage() } }}
              placeholder="Type your message..."
              className="flex-1 px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button onClick={sendMessage} disabled={!input.trim() || sending}
              className="w-10 h-10 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white rounded-xl flex items-center justify-center transition-colors shrink-0">
              <Send className="w-4 h-4" />
            </button>
          </div>
        </>
      )}

      {/* Ended */}
      {step === 'ended' && (
        <div className="flex-1 p-6 flex flex-col items-center justify-center text-center gap-4">
          <div className="w-14 h-14 bg-green-50 rounded-full flex items-center justify-center">
            <span className="text-2xl">✓</span>
          </div>
          <div>
            <h3 className="text-lg font-bold text-gray-900 mb-1">Chat Ended</h3>
            <p className="text-sm text-gray-500 mb-4">Thank you for reaching out to Core Conversion!</p>
          </div>
          {ticketOffered && !ticketCreated && (
            <div className="w-full bg-blue-50 rounded-xl p-4 text-sm text-blue-800">
              <p className="font-medium mb-2">Would you like to open a support ticket for this query?</p>
              <p className="text-xs text-blue-600 mb-3">A ticket lets us track your issue and follow up if needed.</p>
              <div className="flex gap-2">
                <button onClick={createTicket}
                  className="flex-1 bg-blue-600 text-white py-2 rounded-lg font-semibold text-sm hover:bg-blue-700 transition-colors">
                  Yes, Open a Ticket
                </button>
                <button onClick={() => setTicketOffered(false)}
                  className="flex-1 border border-blue-300 text-blue-700 py-2 rounded-lg font-semibold text-sm hover:bg-blue-100 transition-colors">
                  No Thanks
                </button>
              </div>
            </div>
          )}
          {ticketCreated && (
            <div className="w-full bg-green-50 rounded-xl p-4 text-sm text-green-800 text-center">
              <p className="font-medium">Ticket created! ✓</p>
              <p className="text-xs mt-1">We'll follow up at {form.email}</p>
            </div>
          )}
          <button onClick={() => { setStep('closed'); setSessionId(null); setMessages([]); setTicketOffered(false); setTicketCreated(false); localStorage.removeItem(STORAGE_KEY) }}
            className="text-sm text-gray-500 hover:text-gray-700 underline">
            Close
          </button>
        </div>
      )}
    </div>
  )
}

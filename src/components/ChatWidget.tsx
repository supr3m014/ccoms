'use client'

import { useState, useEffect, useRef } from 'react'
import { MessageCircle, Send, ChevronDown, Loader2 } from 'lucide-react'

interface Message {
  id?: string
  sender_type: 'visitor' | 'ai' | 'admin' | 'system'
  content: string
  created_at?: string
}

interface FormErrors {
  name?: string
  email?: string
  phone?: string
  country?: string
}

type Step = 'closed' | 'intro' | 'form' | 'chat' | 'ended'
type Category = 'general' | 'billing' | 'sales' | 'technical'

const STORAGE_KEY = 'ccoms_chat_session'

const EMAIL_RE = /^[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}$/

const isValidPhone = (v: string): boolean => {
  const digits = v.replace(/\D/g, '')
  return digits.length >= 7 && digits.length <= 15 && /^[+\d][\d\s\-().]{5,}$/.test(v.trim())
}

const COUNTRIES = [
  'Afghanistan','Albania','Algeria','Andorra','Angola','Antigua and Barbuda',
  'Argentina','Armenia','Australia','Austria','Azerbaijan','Bahamas','Bahrain',
  'Bangladesh','Barbados','Belarus','Belgium','Belize','Benin','Bhutan',
  'Bolivia','Bosnia and Herzegovina','Botswana','Brazil','Brunei','Bulgaria',
  'Burkina Faso','Burundi','Cabo Verde','Cambodia','Cameroon','Canada',
  'Central African Republic','Chad','Chile','China','Colombia','Comoros',
  'Congo','Costa Rica','Croatia','Cuba','Cyprus','Czech Republic','Denmark',
  'Djibouti','Dominica','Dominican Republic','DR Congo','Ecuador','Egypt',
  'El Salvador','Equatorial Guinea','Eritrea','Estonia','Eswatini','Ethiopia',
  'Fiji','Finland','France','Gabon','Gambia','Georgia','Germany','Ghana',
  'Greece','Grenada','Guatemala','Guinea','Guinea-Bissau','Guyana','Haiti',
  'Honduras','Hungary','Iceland','India','Indonesia','Iran','Iraq','Ireland',
  'Israel','Italy','Ivory Coast','Jamaica','Japan','Jordan','Kazakhstan',
  'Kenya','Kiribati','Kuwait','Kyrgyzstan','Laos','Latvia','Lebanon',
  'Lesotho','Liberia','Libya','Liechtenstein','Lithuania','Luxembourg',
  'Madagascar','Malawi','Malaysia','Maldives','Mali','Malta','Marshall Islands',
  'Mauritania','Mauritius','Mexico','Micronesia','Moldova','Monaco','Mongolia',
  'Montenegro','Morocco','Mozambique','Myanmar','Namibia','Nauru','Nepal',
  'Netherlands','New Zealand','Nicaragua','Niger','Nigeria','North Korea',
  'North Macedonia','Norway','Oman','Pakistan','Palau','Palestine','Panama',
  'Papua New Guinea','Paraguay','Peru','Philippines','Poland','Portugal',
  'Qatar','Romania','Russia','Rwanda','Saint Kitts and Nevis','Saint Lucia',
  'Saint Vincent and the Grenadines','Samoa','San Marino','Sao Tome and Principe',
  'Saudi Arabia','Senegal','Serbia','Seychelles','Sierra Leone','Singapore',
  'Slovakia','Slovenia','Solomon Islands','Somalia','South Africa','South Korea',
  'South Sudan','Spain','Sri Lanka','Sudan','Suriname','Sweden','Switzerland',
  'Syria','Taiwan','Tajikistan','Tanzania','Thailand','Timor-Leste','Togo',
  'Tonga','Trinidad and Tobago','Tunisia','Turkey','Turkmenistan','Tuvalu',
  'Uganda','Ukraine','United Arab Emirates','United Kingdom','United States',
  'Uruguay','Uzbekistan','Vanuatu','Venezuela','Vietnam','Yemen','Zambia','Zimbabwe',
]

export default function ChatWidget() {
  const [step, setStep] = useState<Step>('closed')
  const [sessionId, setSessionId] = useState<string | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [sending, setSending] = useState(false)
  const [mode, setMode] = useState<'ai' | 'human' | 'ended'>('ai')
  const [ticketOffered, setTicketOffered] = useState(false)
  const [ticketCreated, setTicketCreated] = useState(false)
  const [chatError, setChatError] = useState<string | null>(null)
  const [adminTyping, setAdminTyping] = useState(false)
  const [errors, setErrors] = useState<FormErrors>({})
  const [touched, setTouched] = useState<Record<string, boolean>>({})
  const [submitAttempted, setSubmitAttempted] = useState(false)
  const [isMobile, setIsMobile] = useState(false)

  const messagesEndRef = useRef<HTMLDivElement>(null)
  const pollRef = useRef<NodeJS.Timeout | null>(null)
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  const [form, setForm] = useState({
    name: '', email: '', phone: '', address: '', country: 'Philippines',
    category: 'general' as Category,
  })

  const BRIDGE = process.env.NEXT_PUBLIC_API_URL!

  // Detect mobile after mount (avoids SSR mismatch)
  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 640)
    check()
    window.addEventListener('resize', check)
    return () => window.removeEventListener('resize', check)
  }, [])

  // Lock body scroll on mobile when chat is open — prevents background bleeding through
  useEffect(() => {
    if (!isMobile || step === 'closed') {
      document.body.style.overflow = ''
      document.body.style.position = ''
      document.body.style.top = ''
      document.body.style.width = ''
      return
    }
    const scrollY = window.scrollY
    document.body.style.overflow = 'hidden'
    document.body.style.position = 'fixed'
    document.body.style.top = `-${scrollY}px`
    document.body.style.width = '100%'
    return () => {
      document.body.style.overflow = ''
      document.body.style.position = ''
      document.body.style.top = ''
      document.body.style.width = ''
      window.scrollTo(0, scrollY)
    }
  }, [step, isMobile])

  const bridgePost = async (action: string, body: any) => {
    const res = await fetch(`${BRIDGE}?action=${action}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify(body),
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

  const validateAll = (): FormErrors => {
    const e: FormErrors = {}
    if (!form.name.trim() || form.name.trim().length < 2)
      e.name = 'Full name is required'
    if (!EMAIL_RE.test(form.email.trim()))
      e.email = 'Enter a valid email address (e.g. you@example.com)'
    if (!isValidPhone(form.phone))
      e.phone = 'Enter a valid phone number with at least 7 digits'
    if (!form.country)
      e.country = 'Please select your country'
    return e
  }

  const validateField = (field: string, value: string): string => {
    switch (field) {
      case 'name': return !value.trim() || value.trim().length < 2 ? 'Full name is required' : ''
      case 'email': return !EMAIL_RE.test(value.trim()) ? 'Enter a valid email address (e.g. you@example.com)' : ''
      case 'phone': return !isValidPhone(value) ? 'Enter a valid phone number with at least 7 digits' : ''
      case 'country': return !value ? 'Please select your country' : ''
      default: return ''
    }
  }

  const handleBlur = (field: string) => {
    setTouched(t => ({ ...t, [field]: true }))
    const msg = validateField(field, (form as any)[field])
    setErrors(e => ({ ...e, [field]: msg || undefined }))
  }

  const handleFormChange = (field: string, value: string) => {
    setForm(f => ({ ...f, [field]: value }))
    if (touched[field] || submitAttempted) {
      const msg = validateField(field, value)
      setErrors(e => ({ ...e, [field]: msg || undefined }))
    }
  }

  // Restore session from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY)
    if (!saved) return
    try {
      const { sessionId: sid, form: savedForm, step: savedStep } = JSON.parse(saved)
      if (!sid || savedStep === 'ended') { localStorage.removeItem(STORAGE_KEY); return }
      const url = new URL(BRIDGE)
      url.searchParams.set('action', 'chat-poll')
      url.searchParams.set('session_id', sid)
      fetch(url.toString(), { credentials: 'include' }).then(r => r.json()).then(data => {
        const session = data.session
        if (!session || session.mode === 'ended') { localStorage.removeItem(STORAGE_KEY); return }
        setSessionId(sid)
        setMode(session.mode)
        setMessages(data.messages || [])
        setStep('chat')
        if (savedForm) setForm(savedForm)
      }).catch(() => localStorage.removeItem(STORAGE_KEY))
    } catch { localStorage.removeItem(STORAGE_KEY) }
  }, [])

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

  useEffect(() => {
    if (!sessionId || step !== 'chat') return
    pollRef.current = setInterval(async () => {
      try {
        const data = await bridgeGet('chat-poll', { session_id: sessionId })
        const incoming: Message[] = data.messages || []
        setMessages(prev => incoming.length > prev.length ? incoming : prev)
        if (data.session?.mode === 'ended') {
          setStep('ended')
          setTicketOffered(true)
        }
        if (data.session?.mode) setMode(data.session.mode)
        if (data.session?.admin_typing_at) {
          const dateStr = data.session.admin_typing_at.endsWith('Z')
            ? data.session.admin_typing_at
            : `${data.session.admin_typing_at}Z`
          setAdminTyping(Date.now() - new Date(dateStr).getTime() < 5000)
        } else {
          setAdminTyping(false)
        }
      } catch {}
    }, 2500)
    return () => { if (pollRef.current) clearInterval(pollRef.current) }
  }, [sessionId, step])

  const startChat = async () => {
    setSubmitAttempted(true)
    const errs = validateAll()
    setErrors(errs)
    if (Object.keys(errs).length > 0) return

    setSending(true)
    setChatError(null)
    try {
      const data = await bridgePost('chat-start', {
        visitor_name: form.name.trim(),
        visitor_email: form.email.trim(),
        visitor_phone: form.phone.trim(),
        visitor_address: form.address.trim(),
        visitor_country: form.country,
        category: form.category,
      })
      if (data.error) {
        setChatError(data.error)
      } else if (data.session_id) {
        setSessionId(data.session_id)
        setMessages([{ sender_type: 'ai', content: data.welcome }])
        setStep('chat')
      } else {
        setChatError('Unexpected response from server. Please try again.')
      }
    } catch {
      setChatError('Unable to connect to server. Please check your connection and try again.')
    }
    setSending(false)
  }

  const sendMessage = async () => {
    if (!input.trim() || !sessionId || sending) return
    const text = input.trim()
    setInput('')
    setMessages(prev => [...prev, { sender_type: 'visitor', content: text }])
    setSending(true)
    try {
      const data = await bridgePost('chat-send', { session_id: sessionId, content: text })
      if (data.message) {
        setMessages(prev => [...prev, {
          sender_type: data.mode === 'human' ? 'admin' : 'ai',
          content: data.message,
        }])
      }
      if (data.mode) setMode(data.mode)
    } catch {
      setMessages(prev => [...prev, { sender_type: 'system', content: '⚠️ Failed to send message. Please try again.' }])
    }
    setSending(false)
  }

  const endChat = async () => {
    if (!sessionId) return
    await bridgePost('chat-end', { session_id: sessionId })
    setStep('ended')
    setTicketOffered(true)
    if (pollRef.current) clearInterval(pollRef.current)
  }

  const createTicket = async () => {
    if (!sessionId) return
    await bridgePost('chat-create-ticket', { session_id: sessionId })
    setTicketCreated(true)
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInput(e.target.value)
    if (!typingTimeoutRef.current && sessionId) {
      bridgePost('chat-typing', { session_id: sessionId, type: 'visitor' }).catch(() => {})
    }
    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current)
    typingTimeoutRef.current = setTimeout(() => { typingTimeoutRef.current = null }, 2000)
  }

  const bubbleColor = (type: string) => {
    if (type === 'visitor') return 'bg-blue-600 text-white'
    if (type === 'system') return 'bg-gray-100 text-gray-500 text-xs text-center'
    return 'bg-white text-gray-800 border border-gray-100 shadow-sm'
  }

  const fieldClass = (field: string) =>
    `w-full px-3 py-2.5 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
      (touched[field] || submitAttempted) && errors[field as keyof FormErrors]
        ? 'border-red-400 bg-red-50'
        : 'border-gray-300'
    }`

  const FieldError = ({ field }: { field: string }) =>
    (touched[field] || submitAttempted) && errors[field as keyof FormErrors] ? (
      <p className="text-xs text-red-500 -mt-1 px-1">{errors[field as keyof FormErrors]}</p>
    ) : null

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

  // Mobile: full-screen takeover with dvh so keyboard doesn't push content off-screen
  // Desktop: floating bottom-right widget
  const containerStyle: React.CSSProperties = isMobile
    ? { height: '100dvh' }
    : step === 'form'
      ? { maxHeight: 'calc(100vh - 48px)' }
      : { height: '520px' }

  const containerClass = isMobile
    ? 'fixed inset-0 w-screen z-[9000] flex flex-col bg-white overflow-hidden animate-fadeIn'
    : 'fixed bottom-6 right-6 z-[9000] flex flex-col bg-white overflow-hidden animate-fadeIn rounded-2xl shadow-2xl w-96 max-w-[calc(100vw-24px)]'

  return (
    <div className={containerClass} style={containerStyle}>

      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-4 py-3 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
            <MessageCircle className="w-4 h-4 text-white" />
          </div>
          <div>
            <p className="text-white font-semibold text-sm">Core Conversion Support</p>
            <p className="text-blue-200 text-xs">
              {mode === 'ai' ? '🤖 AI Assistant' : mode === 'human' ? '👤 Agent Online' : 'Chat ended'}
            </p>
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
        <div className="flex-1 overflow-y-auto p-5">
          <h3 className="font-semibold text-gray-900 mb-1">Before we start</h3>
          <p className="text-xs text-gray-400 mb-4">All fields marked * are required.</p>
          <div className="space-y-2.5">

            <div>
              <input
                type="text"
                placeholder="Full name *"
                value={form.name}
                onChange={e => handleFormChange('name', e.target.value)}
                onBlur={() => handleBlur('name')}
                className={fieldClass('name')}
              />
              <FieldError field="name" />
            </div>

            <div>
              <input
                type="email"
                placeholder="Email address *"
                value={form.email}
                onChange={e => handleFormChange('email', e.target.value)}
                onBlur={() => handleBlur('email')}
                className={fieldClass('email')}
              />
              <FieldError field="email" />
            </div>

            <div>
              <input
                type="tel"
                placeholder="Phone number * (e.g. +63 912 345 6789)"
                value={form.phone}
                onChange={e => handleFormChange('phone', e.target.value)}
                onBlur={() => handleBlur('phone')}
                className={fieldClass('phone')}
              />
              <FieldError field="phone" />
            </div>

            <div>
              <input
                type="text"
                placeholder="Address (optional)"
                value={form.address}
                onChange={e => setForm(f => ({ ...f, address: e.target.value }))}
                className="w-full px-3 py-2.5 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <select
                value={form.country}
                onChange={e => handleFormChange('country', e.target.value)}
                onBlur={() => handleBlur('country')}
                className={fieldClass('country')}
              >
                <option value="">Select country *</option>
                {COUNTRIES.map(c => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
              <FieldError field="country" />
            </div>

            <div>
              <select
                value={form.category}
                onChange={e => setForm(f => ({ ...f, category: e.target.value as Category }))}
                className="w-full px-3 py-2.5 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="general">General Inquiry</option>
                <option value="billing">Billing Support</option>
                <option value="sales">Sales</option>
                <option value="technical">Technical Support</option>
              </select>
            </div>

            <button
              onClick={startChat}
              disabled={sending}
              className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white py-3 rounded-xl font-semibold transition-colors flex items-center justify-center gap-2"
            >
              {sending ? <><Loader2 className="w-4 h-4 animate-spin" />Starting...</> : 'Start Chat →'}
            </button>

            {chatError && (
              <div className="bg-red-50 border border-red-200 rounded-xl p-3 text-sm text-red-700 flex items-start gap-2">
                <span className="shrink-0 mt-0.5">⚠️</span>
                <div>
                  <p>{chatError}</p>
                  <button onClick={() => setChatError(null)} className="text-xs text-red-500 underline mt-1">Dismiss</button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Chat */}
      {step === 'chat' && (
        <>
          <div className="flex-1 min-h-0 overflow-y-auto p-4 space-y-2 bg-gray-50" style={{ overscrollBehavior: 'contain' }}>
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
            {adminTyping && !sending && (
              <div className="flex justify-start">
                <div className="bg-white border border-gray-100 shadow-sm px-4 py-3 rounded-2xl flex gap-1.5 items-center italic text-xs text-gray-500">
                  Agent is typing...
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
          <div
            className="bg-white border-t border-gray-200 flex gap-2 shrink-0 px-3 pt-3"
            style={{ paddingBottom: isMobile ? 'max(12px, env(safe-area-inset-bottom))' : '12px' }}
          >
            <input
              type="text"
              value={input}
              onChange={handleInputChange}
              onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage() } }}
              placeholder="Type your message..."
              className="flex-1 px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button
              onClick={sendMessage}
              disabled={!input.trim() || sending}
              className="w-10 h-10 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white rounded-xl flex items-center justify-center transition-colors shrink-0"
            >
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
                <button onClick={createTicket} className="flex-1 bg-blue-600 text-white py-2 rounded-lg font-semibold text-sm hover:bg-blue-700 transition-colors">
                  Yes, Open a Ticket
                </button>
                <button onClick={() => setTicketOffered(false)} className="flex-1 border border-blue-300 text-blue-700 py-2 rounded-lg font-semibold text-sm hover:bg-blue-100 transition-colors">
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
          <button
            onClick={() => {
              setStep('closed')
              setSessionId(null)
              setMessages([])
              setTicketOffered(false)
              setTicketCreated(false)
              setErrors({})
              setTouched({})
              setSubmitAttempted(false)
              localStorage.removeItem(STORAGE_KEY)
            }}
            className="text-sm text-gray-500 hover:text-gray-700 underline"
          >
            Close
          </button>
        </div>
      )}
    </div>
  )
}

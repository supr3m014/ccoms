'use client'

import { useState, useEffect } from 'react'
import { Plus, User, Clock, ChevronDown, ChevronUp, Send, Trash2 } from 'lucide-react'

const API = process.env.NEXT_PUBLIC_API_URL || 'https://ccoms.ph/api-bridge.php'
const post = async (action: string, body: object) => {
  const r = await fetch(`${API}?action=${action}`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body), credentials: 'include' })
  return r.json()
}

const STATUS_COLORS: Record<string, string> = {
  open: 'bg-red-100 text-red-700', pending: 'bg-yellow-100 text-yellow-700',
  'on-hold': 'bg-gray-100 text-gray-600', resolved: 'bg-green-100 text-green-700',
}
const PRIORITY_COLORS: Record<string, string> = {
  low: 'bg-blue-50 text-blue-600', medium: 'bg-orange-50 text-orange-600', high: 'bg-red-50 text-red-600',
}

export default function TicketDeskPage() {
  const [tickets, setTickets] = useState<any[]>([])
  const [messages, setMessages] = useState<Record<string, any[]>>({})
  const [expanded, setExpanded] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [reply, setReply] = useState('')
  const [sending, setSending] = useState(false)
  const [showNew, setShowNew] = useState(false)
  const [filter, setFilter] = useState('all')
  const [nSubject, setNSubject] = useState('')
  const [nName, setNName] = useState('')
  const [nEmail, setNEmail] = useState('')
  const [nCategory, setNCategory] = useState('general')
  const [nPriority, setNPriority] = useState('medium')
  const [nMessage, setNMessage] = useState('')
  const [creating, setCreating] = useState(false)

  const fetchTickets = async () => {
    const data = await post('ticket-list', {})
    if (data.tickets) setTickets(data.tickets)
    setLoading(false)
  }
  useEffect(() => { fetchTickets() }, [])

  const openTicket = async (id: string) => {
    if (expanded === id) { setExpanded(null); return }
    setExpanded(id)
    if (!messages[id]) {
      const data = await post('ticket-messages', { ticket_id: id })
      if (data.messages) setMessages(prev => ({ ...prev, [id]: data.messages }))
    }
  }

  const sendReply = async (ticketId: string) => {
    if (!reply.trim() || sending) return
    setSending(true)
    await post('ticket-reply', { ticket_id: ticketId, content: reply.trim(), sender_name: 'Admin', is_internal: false })
    setReply('')
    const data = await post('ticket-messages', { ticket_id: ticketId })
    if (data.messages) setMessages(prev => ({ ...prev, [ticketId]: data.messages }))
    setSending(false)
  }

  const setStatus = async (ticketId: string, status: string) => {
    await post('ticket-status', { ticket_id: ticketId, status })
    fetchTickets()
  }

  const deleteTicket = async (id: string) => {
    if (!confirm('Delete this ticket and all messages?')) return
    await post('ticket-delete', { ticket_id: id })
    if (expanded === id) setExpanded(null)
    fetchTickets()
  }

  const createTicket = async (e: React.FormEvent) => {
    e.preventDefault(); setCreating(true)
    await post('ticket-create', { subject: nSubject, visitor_name: nName, visitor_email: nEmail, category: nCategory, priority: nPriority, message: nMessage, source: 'manual' })
    setNSubject(''); setNName(''); setNEmail(''); setNMessage('')
    setShowNew(false); setCreating(false); fetchTickets()
  }

  const filtered = filter === 'all' ? tickets : tickets.filter(t => t.status === filter)

  return (
    <div className="p-6 max-w-5xl">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Ticket Desk</h1>
          <p className="text-sm text-gray-500 mt-0.5">{tickets.length} total</p>
        </div>
        <button onClick={() => setShowNew(!showNew)} className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-xl text-sm font-semibold transition-colors">
          <Plus className="w-4 h-4" /> New Ticket
        </button>
      </div>

      {showNew && (
        <form onSubmit={createTicket} className="bg-white border border-gray-200 rounded-xl p-5 mb-6 space-y-3">
          <h3 className="font-semibold text-gray-900">Create Ticket</h3>
          <div className="grid grid-cols-2 gap-3">
            <input required value={nSubject} onChange={e => setNSubject(e.target.value)} placeholder="Subject *" className="col-span-2 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
            <input required value={nName} onChange={e => setNName(e.target.value)} placeholder="Visitor Name *" className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
            <input required type="email" value={nEmail} onChange={e => setNEmail(e.target.value)} placeholder="Email *" className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
            <select value={nCategory} onChange={e => setNCategory(e.target.value)} className="border border-gray-200 rounded-lg px-3 py-2 text-sm bg-white capitalize focus:outline-none focus:ring-2 focus:ring-blue-500">
              {['general','billing','sales','technical'].map(c => <option key={c} value={c}>{c}</option>)}
            </select>
            <select value={nPriority} onChange={e => setNPriority(e.target.value)} className="border border-gray-200 rounded-lg px-3 py-2 text-sm bg-white capitalize focus:outline-none focus:ring-2 focus:ring-blue-500">
              {['low','medium','high'].map(p => <option key={p} value={p}>{p}</option>)}
            </select>
            <textarea required value={nMessage} onChange={e => setNMessage(e.target.value)} placeholder="Initial message *" rows={3} className="col-span-2 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none" />
          </div>
          <div className="flex gap-2">
            <button type="submit" disabled={creating} className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white px-4 py-2 rounded-lg text-sm font-semibold">{creating ? 'Creating…' : 'Create Ticket'}</button>
            <button type="button" onClick={() => setShowNew(false)} className="px-4 py-2 border border-gray-200 rounded-lg text-sm text-gray-600 hover:bg-gray-50">Cancel</button>
          </div>
        </form>
      )}

      <div className="flex gap-1 mb-4 bg-gray-100 p-1 rounded-xl w-fit">
        {['all','open','pending','on-hold','resolved'].map(s => (
          <button key={s} onClick={() => setFilter(s)} className={`px-3 py-1.5 rounded-lg text-xs font-semibold capitalize transition-colors ${filter === s ? 'bg-white shadow text-gray-900' : 'text-gray-500 hover:text-gray-700'}`}>{s}</button>
        ))}
      </div>

      {loading && <p className="text-gray-400 text-sm py-8 text-center">Loading…</p>}
      {!loading && filtered.length === 0 && <p className="text-gray-400 text-sm py-8 text-center">No tickets found.</p>}

      <div className="space-y-2">
        {filtered.map(ticket => (
          <div key={ticket.id} className="bg-white border border-gray-200 rounded-xl overflow-hidden">
            <div className="flex items-start gap-3 p-4 cursor-pointer hover:bg-gray-50" onClick={() => openTicket(ticket.id)}>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-semibold text-sm text-gray-900 truncate">{ticket.subject}</span>
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${STATUS_COLORS[ticket.status] || 'bg-gray-100 text-gray-600'}`}>{ticket.status}</span>
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${PRIORITY_COLORS[ticket.priority] || ''}`}>{ticket.priority}</span>
                  <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full capitalize">{ticket.category}</span>
                </div>
                <div className="flex items-center gap-3 mt-1 text-xs text-gray-500">
                  <span className="flex items-center gap-1"><User className="w-3 h-3" />{ticket.visitor_name} · {ticket.visitor_email}</span>
                  <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{new Date(ticket.created_at).toLocaleDateString()}</span>
                </div>
              </div>
              {expanded === ticket.id ? <ChevronUp className="w-4 h-4 text-gray-400 shrink-0" /> : <ChevronDown className="w-4 h-4 text-gray-400 shrink-0" />}
            </div>

            {expanded === ticket.id && (
              <div className="border-t border-gray-100 px-4 pb-4">
                <div className="flex gap-2 py-3 flex-wrap">
                  {['open','pending','on-hold','resolved'].map(s => (
                    <button key={s} onClick={() => setStatus(ticket.id, s)} className={`text-xs px-3 py-1 rounded-full font-medium border capitalize transition-colors ${ticket.status === s ? STATUS_COLORS[s] + ' border-transparent' : 'border-gray-200 text-gray-500 hover:bg-gray-50'}`}>{s}</button>
                  ))}
                  <button onClick={() => deleteTicket(ticket.id)} className="ml-auto text-xs text-red-500 hover:text-red-700 flex items-center gap-1"><Trash2 className="w-3.5 h-3.5" />Delete</button>
                </div>
                <div className="space-y-3 max-h-64 overflow-y-auto mb-3 bg-gray-50 rounded-xl p-3">
                  {(messages[ticket.id] || []).map((msg: any) => (
                    <div key={msg.id} className={`flex ${msg.sender_type === 'admin' ? 'justify-end' : 'justify-start'}`}>
                      <div className={`max-w-[80%] rounded-xl px-3 py-2 text-sm ${msg.sender_type === 'admin' ? 'bg-blue-600 text-white' : 'bg-white border border-gray-200 text-gray-800'}`}>
                        <p className="text-xs font-semibold mb-0.5 opacity-75">{msg.sender_name || msg.sender_type}</p>
                        <p>{msg.content}</p>
                      </div>
                    </div>
                  ))}
                  {(!messages[ticket.id] || messages[ticket.id].length === 0) && <p className="text-xs text-gray-400 text-center py-2">No messages</p>}
                </div>
                <div className="flex gap-2">
                  <input value={reply} onChange={e => setReply(e.target.value)} onKeyDown={e => { if (e.key === 'Enter') sendReply(ticket.id) }} placeholder="Type a reply and press Enter…" className="flex-1 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                  <button onClick={() => sendReply(ticket.id)} disabled={sending || !reply.trim()} className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white px-3 py-2 rounded-lg"><Send className="w-4 h-4" /></button>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}

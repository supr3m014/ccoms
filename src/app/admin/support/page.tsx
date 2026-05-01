'use client'

import { useState, useEffect, useRef } from 'react'
import { supabase } from '@/lib/supabase'
import { useToast } from '@/contexts/ToastContext'
import { useConfirm } from '@/contexts/ConfirmContext'
import {
  MessageSquare, Clock, CheckCircle, Trash2, Plus, Send,
  User, ChevronDown, X, Search, TicketCheck, Lock, UserCheck
} from 'lucide-react'

interface Ticket {
  id: string
  subject: string
  visitor_name: string
  visitor_email: string
  visitor_phone: string | null
  category: 'general' | 'billing' | 'sales' | 'technical'
  status: 'open' | 'pending' | 'on-hold' | 'resolved'
  priority: 'low' | 'medium' | 'high'
  source: string
  assigned_to: string | null
  created_at: string
  updated_at: string
}

interface TicketMessage {
  id: string
  ticket_id: string
  sender_type: 'customer' | 'admin'
  sender_name: string | null
  content: string
  is_internal: number
  created_at: string
}

const STATUS_COLORS: Record<string, string> = {
  open:     'bg-red-100 text-red-700',
  pending:  'bg-yellow-100 text-yellow-700',
  'on-hold':'bg-gray-100 text-gray-600',
  resolved: 'bg-green-100 text-green-700',
}

const PRIORITY_BORDER: Record<string, string> = {
  high:   'border-l-4 border-l-red-500',
  medium: 'border-l-4 border-l-yellow-400',
  low:    'border-l-4 border-l-green-400',
}

const CAT_COLORS: Record<string, string> = {
  general:   'bg-gray-100 text-gray-600',
  billing:   'bg-yellow-100 text-yellow-700',
  sales:     'bg-blue-100 text-blue-700',
  technical: 'bg-purple-100 text-purple-700',
}

export default function TicketDeskPage() {
  const { showToast } = useToast()
  const { showConfirm } = useConfirm()

  const [tickets, setTickets] = useState<Ticket[]>([])
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null)
  const [messages, setMessages] = useState<TicketMessage[]>([])
  const [agents, setAgents] = useState<string[]>([])
  const [loading, setLoading] = useState(true)
  const [loadingMessages, setLoadingMessages] = useState(false)
  const [filter, setFilter] = useState<'all' | 'open' | 'pending' | 'on-hold' | 'resolved'>('all')
  const [search, setSearch] = useState('')
  const [reply, setReply] = useState('')
  const [isInternal, setIsInternal] = useState(false)
  const [sending, setSending] = useState(false)
  const [showNewTicket, setShowNewTicket] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const [newForm, setNewForm] = useState({
    subject: '', visitor_name: '', visitor_email: '',
    visitor_phone: '', category: 'general' as Ticket['category'],
    priority: 'medium' as Ticket['priority'], content: '',
  })

  useEffect(() => { fetchTickets(); fetchAgents() }, [filter])

  useEffect(() => {
    if (selectedTicket) fetchMessages(selectedTicket.id)
  }, [selectedTicket?.id])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const BRIDGE = process.env.NEXT_PUBLIC_API_URL!
  const apiGet = async (action: string, params: Record<string, string> = {}) => {
    const url = new URL(BRIDGE)
    url.searchParams.append('action', action)
    for (const [k, v] of Object.entries(params)) url.searchParams.append(k, v)
    const res = await fetch(url.toString())
    return res.json()
  }

  const fetchTickets = async () => {
    try {
      const { tickets, error } = await apiGet('ticket-list')
      if (error) throw new Error(error)
      let data = tickets || []
      if (filter !== 'all') data = data.filter((t: any) => t.status === filter)
      setTickets(data)
    } catch (e) { console.error('fetchTickets', e) }
    finally { setLoading(false) }
  }

  const fetchAgents = async () => {
    try {
      const { users } = await apiGet('list-users')
      setAgents((users || []).map((u: any) => u.email))
    } catch (e) { console.error('fetchAgents', e) }
  }

  const fetchMessages = async (ticketId: string) => {
    setLoadingMessages(true)
    try {
      const { messages, error } = await apiGet('ticket-messages', { ticket_id: ticketId })
      if (error) throw new Error(error)
      setMessages(messages || [])
    } catch (e) { console.error('fetchMessages', e) }
    finally { setLoadingMessages(false) }
  }


  const apiCall = async (action: string, extra: any = {}) => {
    const phpAction = action === 'reply' ? 'ticket-reply'
      : action === 'update-status' ? 'ticket-status'
      : action === 'assign' ? 'ticket-assign'
      : 'ticket-create'
    const res = await fetch(`${BRIDGE}?action=${phpAction}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify(extra),
    })
    return res.json()
  }

  const sendReply = async () => {
    if (!reply.trim() || !selectedTicket || sending) return
    const text = reply.trim()
    setReply('')
    setIsInternal(false)
    setSending(true)
    try {
      const result = await apiCall('reply', { ticket_id: selectedTicket.id, content: text, is_internal: isInternal })
      if (result.error) throw new Error(result.error)
      await fetchMessages(selectedTicket.id)
      fetchTickets()
      if (!isInternal) showToast('Reply sent and email notification sent to customer', 'success')
      else showToast('Internal note added', 'info')
    } catch { showToast('Failed to send reply', 'error') }
    setSending(false)
  }

  const updateStatus = async (ticketId: string, status: string) => {
    const result = await apiCall('update-status', { ticket_id: ticketId, status })
    if (result.error) { showToast('Failed to update status', 'error'); return }
    setTickets(prev => prev.map(t => t.id === ticketId ? { ...t, status: status as Ticket['status'] } : t))
    if (selectedTicket?.id === ticketId) setSelectedTicket(prev => prev ? { ...prev, status: status as Ticket['status'] } : null)
    showToast(`Marked as ${status}`, 'success')
  }

  const assignTicket = async (ticketId: string, email: string | null) => {
    const result = await apiCall('assign', { ticket_id: ticketId, assigned_to: email })
    if (result.error) { showToast('Failed to assign', 'error'); return }
    setTickets(prev => prev.map(t => t.id === ticketId ? { ...t, assigned_to: email } : t))
    if (selectedTicket?.id === ticketId) setSelectedTicket(prev => prev ? { ...prev, assigned_to: email } : null)
    showToast(email ? `Assigned to ${email}` : 'Unassigned', 'success')
  }

  const deleteTicket = async (ticketId: string) => {
    const ok = await showConfirm('Delete this ticket and all messages? This cannot be undone.', { destructive: true })
    if (!ok) return
    const result = await apiCall('ticket-delete', { ticket_id: ticketId })
    if (result.error) { showToast('Failed to delete', 'error'); return }
    setTickets(prev => prev.filter(t => t.id !== ticketId))
    if (selectedTicket?.id === ticketId) { setSelectedTicket(null); setMessages([]) }
    showToast('Ticket deleted', 'success')
  }

  const createTicket = async () => {
    if (!newForm.subject.trim() || !newForm.visitor_name.trim() || !newForm.visitor_email.trim() || !newForm.content.trim()) {
      showToast('Please fill in all required fields', 'warning'); return
    }
    const result = await apiCall('create', newForm)
    if (result.error) { showToast('Failed to create ticket', 'error'); return }
    setNewForm({ subject: '', visitor_name: '', visitor_email: '', visitor_phone: '', category: 'general', priority: 'medium', content: '' })
    setShowNewTicket(false)
    fetchTickets()
    showToast('Ticket created — admin notified by email', 'success')
  }

  const formatTime = (iso: string) => {
    const dateStr = iso.endsWith('Z') ? iso : `${iso}Z`;
    return new Date(dateStr).toLocaleString('en-PH', { timeZone: 'Asia/Manila', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })
  }

  const filtered = tickets.filter(t =>
    !search || t.subject.toLowerCase().includes(search.toLowerCase()) ||
    t.visitor_name.toLowerCase().includes(search.toLowerCase()) ||
    t.visitor_email.toLowerCase().includes(search.toLowerCase())
  )

  const counts = {
    all: tickets.length,
    open: tickets.filter(t => t.status === 'open').length,
    pending: tickets.filter(t => t.status === 'pending').length,
    'on-hold': tickets.filter(t => t.status === 'on-hold').length,
    resolved: tickets.filter(t => t.status === 'resolved').length,
  }

  return (
    <div className="h-full flex flex-col overflow-hidden">

      {/* New Ticket Modal */}
      {showNewTicket && (
        <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setShowNewTicket(false)} />
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-xl animate-fadeIn overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
              <h3 className="font-bold text-gray-900 text-lg">Create New Ticket</h3>
              <button onClick={() => setShowNewTicket(false)} className="p-1.5 hover:bg-gray-100 rounded-lg"><X className="w-5 h-5 text-gray-500" /></button>
            </div>
            <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Name <span className="text-red-500">*</span></label>
                  <input value={newForm.visitor_name} onChange={e => setNewForm(f => ({ ...f, visitor_name: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="Customer name" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email <span className="text-red-500">*</span></label>
                  <input type="email" value={newForm.visitor_email} onChange={e => setNewForm(f => ({ ...f, visitor_email: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="email@example.com" />
                </div>
              </div>
              <input value={newForm.visitor_phone} onChange={e => setNewForm(f => ({ ...f, visitor_phone: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="Phone (optional)" />
              <input value={newForm.subject} onChange={e => setNewForm(f => ({ ...f, subject: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="Subject *" />
              <div className="grid grid-cols-2 gap-4">
                <select value={newForm.category} onChange={e => setNewForm(f => ({ ...f, category: e.target.value as Ticket['category'] }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                  <option value="general">General</option>
                  <option value="billing">Billing</option>
                  <option value="sales">Sales</option>
                  <option value="technical">Technical</option>
                </select>
                <select value={newForm.priority} onChange={e => setNewForm(f => ({ ...f, priority: e.target.value as Ticket['priority'] }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                  <option value="low">Low priority</option>
                  <option value="medium">Medium priority</option>
                  <option value="high">High priority</option>
                </select>
              </div>
              <textarea value={newForm.content} onChange={e => setNewForm(f => ({ ...f, content: e.target.value }))} rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                placeholder="Describe the issue *" />
            </div>
            <div className="px-6 py-4 bg-gray-50 flex gap-3 justify-end">
              <button onClick={() => setShowNewTicket(false)} className="px-5 py-2.5 border border-gray-300 text-gray-700 rounded-xl font-semibold hover:bg-gray-100 transition-colors text-sm">Cancel</button>
              <button onClick={createTicket} className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-semibold transition-colors text-sm">Create Ticket</button>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between shrink-0">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Ticket Desk</h1>
          <p className="text-sm text-gray-500">{counts.open} open · {counts.pending} pending · {counts.resolved} resolved</p>
        </div>
        <button onClick={() => setShowNewTicket(true)}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-semibold transition-colors text-sm">
          <Plus className="w-4 h-4" /> New Ticket
        </button>
      </div>

      {/* Stats bar */}
      <div className="grid grid-cols-4 gap-3 px-6 py-3 bg-white border-b border-gray-200 shrink-0">
        {(['open', 'pending', 'on-hold', 'resolved'] as const).map(s => (
          <button key={s} onClick={() => setFilter(f => f === s ? 'all' : s)}
            className={`rounded-lg p-3 text-left transition-all border ${filter === s ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-gray-300'}`}>
            <p className="text-xs text-gray-500 capitalize">{s}</p>
            <p className={`text-2xl font-bold ${s === 'open' ? 'text-red-600' : s === 'pending' ? 'text-yellow-600' : s === 'resolved' ? 'text-green-600' : 'text-gray-600'}`}>{counts[s]}</p>
          </button>
        ))}
      </div>

      {/* Body */}
      <div className="flex flex-1 overflow-hidden">

        {/* Ticket list */}
        <div className="w-96 bg-white border-r border-gray-200 flex flex-col shrink-0">
          <div className="px-3 py-3 border-b border-gray-100 space-y-2 shrink-0">
            <div className="flex gap-1">
              {(['all', 'open', 'pending', 'on-hold', 'resolved'] as const).map(s => (
                <button key={s} onClick={() => setFilter(s)}
                  className={`flex-1 text-xs py-1.5 rounded-lg font-medium transition-colors ${filter === s ? 'bg-blue-600 text-white' : 'text-gray-500 hover:bg-gray-100'}`}>
                  {s === 'all' ? 'All' : s.charAt(0).toUpperCase() + s.slice(1)}
                </button>
              ))}
            </div>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
              <input type="text" value={search} onChange={e => setSearch(e.target.value)}
                placeholder="Search tickets..." className="w-full pl-8 pr-3 py-2 border border-gray-200 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
          </div>

          <div className="flex-1 overflow-y-auto">
            {loading ? (
              <div className="p-8 text-center text-sm text-gray-500">Loading tickets...</div>
            ) : filtered.length === 0 ? (
              <div className="p-8 text-center">
                <TicketCheck className="w-10 h-10 text-gray-300 mx-auto mb-2" />
                <p className="text-sm text-gray-500">No tickets found</p>
              </div>
            ) : filtered.map(ticket => (
              <button key={ticket.id} onClick={() => setSelectedTicket(ticket)}
                className={`w-full text-left p-4 border-b border-gray-100 hover:bg-gray-50 transition-colors ${PRIORITY_BORDER[ticket.priority]} ${selectedTicket?.id === ticket.id ? 'ring-2 ring-inset ring-blue-400 bg-blue-50' : ''}`}>
                <div className="flex items-start justify-between gap-2 mb-1">
                  <p className="font-semibold text-gray-900 text-sm leading-tight truncate flex-1">{ticket.subject}</p>
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium shrink-0 ${STATUS_COLORS[ticket.status]}`}>{ticket.status}</span>
                </div>
                <p className="text-xs text-gray-600 mb-1.5">{ticket.visitor_name} · {ticket.visitor_email}</p>
                <div className="flex items-center gap-2 flex-wrap">
                  <span className={`text-xs px-1.5 py-0.5 rounded-full font-medium ${CAT_COLORS[ticket.category]}`}>{ticket.category}</span>
                  {ticket.assigned_to && (
                    <span className="text-xs text-emerald-600 flex items-center gap-0.5">
                      <UserCheck className="w-3 h-3" />{ticket.assigned_to.split('@')[0]}
                    </span>
                  )}
                  <span className="text-xs text-gray-400 ml-auto flex items-center gap-1">
                    <Clock className="w-3 h-3" />{formatTime(ticket.created_at)}
                  </span>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Ticket detail */}
        {selectedTicket ? (
          <div className="flex-1 flex flex-col bg-gray-50 min-w-0">
            {/* Detail header */}
            <div className="bg-white border-b border-gray-200 px-6 py-3 shrink-0">
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0">
                  <h2 className="font-bold text-gray-900 text-base truncate">{selectedTicket.subject}</h2>
                  <p className="text-sm text-gray-500 mt-0.5">
                    <span className="font-medium text-gray-700">{selectedTicket.visitor_name}</span>
                    {' · '}{selectedTicket.visitor_email}
                    {selectedTicket.visitor_phone ? ` · ${selectedTicket.visitor_phone}` : ''}
                  </p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  {/* Status dropdown */}
                  <div className="relative group">
                    <button className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold ${STATUS_COLORS[selectedTicket.status]}`}>
                      {selectedTicket.status} <ChevronDown className="w-3 h-3" />
                    </button>
                    <div className="absolute right-0 top-full mt-1 bg-white border border-gray-200 rounded-xl shadow-xl py-1 w-36 z-20 hidden group-hover:block">
                      {(['open', 'pending', 'on-hold', 'resolved'] as const).map(s => (
                        <button key={s} onClick={() => updateStatus(selectedTicket.id, s)}
                          className="w-full text-left px-3 py-2 text-xs hover:bg-gray-50 capitalize">{s}</button>
                      ))}
                    </div>
                  </div>
                  {selectedTicket.status !== 'resolved' && (
                    <button onClick={() => updateStatus(selectedTicket.id, 'resolved')}
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-green-600 hover:bg-green-700 text-white rounded-lg text-xs font-semibold transition-colors">
                      <CheckCircle className="w-3.5 h-3.5" /> Resolve
                    </button>
                  )}
                  <button onClick={() => deleteTicket(selectedTicket.id)}
                    className="p-1.5 hover:bg-red-50 text-gray-400 hover:text-red-600 rounded-lg transition-colors">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
              {/* Meta row */}
              <div className="flex gap-2 mt-2 flex-wrap items-center">
                <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${CAT_COLORS[selectedTicket.category]}`}>{selectedTicket.category}</span>
                <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${selectedTicket.priority === 'high' ? 'bg-red-100 text-red-700' : selectedTicket.priority === 'medium' ? 'bg-yellow-100 text-yellow-700' : 'bg-green-100 text-green-700'}`}>
                  {selectedTicket.priority} priority
                </span>
                <span className="text-xs text-gray-400">{formatTime(selectedTicket.created_at)}</span>
                {/* Assign dropdown */}
                <div className="relative group ml-auto">
                  <button className="flex items-center gap-1.5 text-xs px-3 py-1.5 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                    <UserCheck className="w-3.5 h-3.5 text-gray-400" />
                    {selectedTicket.assigned_to ? selectedTicket.assigned_to.split('@')[0] : 'Unassigned'}
                    <ChevronDown className="w-3 h-3 text-gray-400" />
                  </button>
                  <div className="absolute right-0 top-full mt-1 bg-white border border-gray-200 rounded-xl shadow-xl py-1 w-48 z-20 hidden group-hover:block">
                    <button onClick={() => assignTicket(selectedTicket.id, null)}
                      className="w-full text-left px-3 py-2 text-xs hover:bg-gray-50 text-gray-400">Unassign</button>
                    {agents.map(email => (
                      <button key={email} onClick={() => assignTicket(selectedTicket.id, email)}
                        className={`w-full text-left px-3 py-2 text-xs hover:bg-gray-50 ${selectedTicket.assigned_to === email ? 'text-blue-600 font-semibold' : 'text-gray-700'}`}>
                        {email}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {loadingMessages ? (
                <div className="text-center text-sm text-gray-400 py-8">Loading messages...</div>
              ) : messages.length === 0 ? (
                <div className="text-center text-sm text-gray-400 py-8">No messages yet</div>
              ) : messages.map(m => (
                <div key={m.id} className={`flex gap-3 ${m.sender_type === 'admin' ? 'flex-row-reverse' : ''}`}>
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${m.sender_type === 'admin' ? (m.is_internal ? 'bg-amber-500' : 'bg-blue-600') : 'bg-gray-200'}`}>
                    {m.is_internal ? <Lock className="w-4 h-4 text-white" /> : <User className={`w-4 h-4 ${m.sender_type === 'admin' ? 'text-white' : 'text-gray-600'}`} />}
                  </div>
                  <div className={`max-w-[75%] flex flex-col gap-1 ${m.sender_type === 'admin' ? 'items-end' : 'items-start'}`}>
                    <p className="text-xs text-gray-500 px-1">
                      {m.is_internal ? '🔒 Internal note · ' : ''}{m.sender_name || (m.sender_type === 'admin' ? 'Support Team' : selectedTicket.visitor_name)} · {formatTime(m.created_at)}
                    </p>
                    <div className={`px-4 py-3 rounded-2xl text-sm leading-relaxed ${
                      m.is_internal ? 'bg-amber-50 border border-amber-200 text-amber-900' :
                      m.sender_type === 'admin' ? 'bg-blue-600 text-white' : 'bg-white border border-gray-200 text-gray-800 shadow-sm'
                    }`}>
                      {m.content}
                    </div>
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>

            {/* Reply box */}
            <div className="bg-white border-t border-gray-200 p-4 shrink-0">
              <div className="flex items-center gap-3 mb-2">
                <button onClick={() => setIsInternal(false)}
                  className={`text-xs px-3 py-1.5 rounded-lg font-medium transition-colors ${!isInternal ? 'bg-blue-600 text-white' : 'text-gray-500 hover:bg-gray-100'}`}>
                  Reply to Customer
                </button>
                <button onClick={() => setIsInternal(true)}
                  className={`flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg font-medium transition-colors ${isInternal ? 'bg-amber-500 text-white' : 'text-gray-500 hover:bg-gray-100'}`}>
                  <Lock className="w-3 h-3" /> Internal Note
                </button>
                {!isInternal && <p className="text-xs text-gray-400 ml-auto">Customer will receive an email</p>}
                {isInternal && <p className="text-xs text-amber-600 ml-auto">Only visible to your team</p>}
              </div>
              <div className="flex gap-3">
                <textarea value={reply} onChange={e => setReply(e.target.value)}
                  onKeyDown={e => { if (e.key === 'Enter' && e.ctrlKey) { e.preventDefault(); sendReply() } }}
                  placeholder={isInternal ? 'Add an internal note...' : 'Write your reply... (Ctrl+Enter to send)'}
                  rows={3}
                  className={`flex-1 px-4 py-3 border rounded-xl text-sm focus:outline-none focus:ring-2 resize-none ${isInternal ? 'border-amber-300 focus:ring-amber-400 bg-amber-50' : 'border-gray-200 focus:ring-blue-500'}`} />
                <button onClick={sendReply} disabled={!reply.trim() || sending}
                  className={`self-end w-11 h-11 disabled:opacity-40 text-white rounded-xl flex items-center justify-center transition-colors shrink-0 ${isInternal ? 'bg-amber-500 hover:bg-amber-600' : 'bg-blue-600 hover:bg-blue-700'}`}>
                  <Send className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div className="flex-1 flex items-center justify-center bg-gray-50">
            <div className="text-center">
              <MessageSquare className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Select a ticket</h3>
              <p className="text-sm text-gray-500">Choose a ticket from the list to view the conversation</p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

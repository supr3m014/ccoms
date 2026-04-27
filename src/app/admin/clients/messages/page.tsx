'use client'

import { useState, useEffect, useRef } from 'react'
import { supabase } from '@/lib/supabase'
import { useToast } from '@/contexts/ToastContext'
import { MessageCircle, Send, User, Loader2, RefreshCw } from 'lucide-react'

interface Client {
  id: string
  client_id: string
  name: string
  email: string
  business_name: string | null
}

interface Message {
  id: string
  client_id: string
  sender_type: 'client' | 'admin'
  content: string
  created_at: string
  read_at: string | null
}

export default function ClientMessagesPage() {
  const { showToast } = useToast()
  const [clients, setClients] = useState<Client[]>([])
  const [selectedClient, setSelectedClient] = useState<string | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [sending, setSending] = useState(false)
  const [loading, setLoading] = useState(true)
  const [unreadCounts, setUnreadCounts] = useState<Record<string, number>>({})
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const pollRef = useRef<NodeJS.Timeout | null>(null)

  const selectedClientData = clients.find(c => c.id === selectedClient)

  useEffect(() => {
    fetchClients()
    pollRef.current = setInterval(fetchClients, 10000)
    return () => { if (pollRef.current) clearInterval(pollRef.current) }
  }, [])

  useEffect(() => {
    if (selectedClient) fetchMessages(selectedClient)
  }, [selectedClient])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const fetchClients = async () => {
    const { data: clientsData } = await supabase
      .from('clients')
      .select('id, client_id, name, email, business_name')
      .eq('status', 'active')
      .order('name')
    setClients(clientsData || [])

    // Get unread counts per client
    const { data: msgs } = await supabase
      .from('client_messages')
      .select('client_id, read_at, sender_type')
      .eq('sender_type', 'client')
    const counts: Record<string, number> = {}
    ;(msgs || []).forEach((m: any) => {
      if (!m.read_at) counts[m.client_id] = (counts[m.client_id] || 0) + 1
    })
    setUnreadCounts(counts)
    setLoading(false)
  }

  const fetchMessages = async (clientId: string) => {
    const { data } = await supabase
      .from('client_messages')
      .select('*')
      .eq('client_id', clientId)
      .order('created_at', { ascending: true })
    setMessages(data || [])

    // Mark client messages as read
    const now = new Date().toISOString().slice(0, 19).replace('T', ' ')
    const unread = (data || []).filter((m: Message) => m.sender_type === 'client' && !m.read_at)
    for (const m of unread) {
      await supabase.from('client_messages').update({ read_at: now }).eq('id', m.id)
    }
    if (unread.length > 0) {
      setUnreadCounts(prev => ({ ...prev, [clientId]: 0 }))
    }
  }

  const sendMessage = async () => {
    if (!input.trim() || !selectedClient || sending) return
    const text = input.trim()
    setInput('')
    setSending(true)
    try {
      await supabase.from('client_messages').insert([{
        client_id: selectedClient,
        sender_type: 'admin',
        content: text,
      }])
      // Add notification for client
      await supabase.from('client_notifications').insert([{
        client_id: selectedClient,
        type: 'new_message',
        message: `New message from Core Conversion: "${text.substring(0, 80)}${text.length > 80 ? '...' : ''}"`,
        link: '/client-dashboard/messages',
      }])
      fetchMessages(selectedClient)
    } catch { showToast('Failed to send', 'error') }
    setSending(false)
  }

  const formatTime = (iso: string) =>
    new Date(iso).toLocaleString('en-PH', { timeZone: 'Asia/Manila', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })

  return (
    <div className="h-full flex overflow-hidden">
      {/* Client list */}
      <div className="w-80 bg-white border-r border-gray-200 flex flex-col shrink-0">
        <div className="px-4 py-4 border-b border-gray-200 flex items-center justify-between">
          <div>
            <h2 className="font-bold text-gray-900">Client Messages</h2>
            <p className="text-xs text-gray-500">Direct messages with clients</p>
          </div>
          <button onClick={fetchClients} className="p-1.5 hover:bg-gray-100 rounded-lg">
            <RefreshCw className="w-4 h-4 text-gray-500" />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto">
          {loading ? (
            <div className="p-8 text-center text-sm text-gray-500">Loading...</div>
          ) : clients.length === 0 ? (
            <div className="p-8 text-center">
              <MessageCircle className="w-10 h-10 text-gray-300 mx-auto mb-2" />
              <p className="text-sm text-gray-500">No active clients</p>
            </div>
          ) : clients.map(c => (
            <button key={c.id} onClick={() => setSelectedClient(c.id)}
              className={`w-full text-left px-4 py-3.5 border-b border-gray-100 hover:bg-gray-50 transition-colors ${selectedClient === c.id ? 'bg-blue-50 border-l-4 border-l-blue-500' : ''}`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-full flex items-center justify-center text-xs font-bold text-white shrink-0">
                    {c.name.charAt(0)}
                  </div>
                  <div className="min-w-0">
                    <p className="font-semibold text-gray-900 text-sm truncate">{c.name}</p>
                    <p className="text-xs text-gray-400">{c.client_id}</p>
                  </div>
                </div>
                {unreadCounts[c.id] > 0 && (
                  <span className="w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center font-bold shrink-0">
                    {unreadCounts[c.id]}
                  </span>
                )}
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Chat panel */}
      {selectedClient && selectedClientData ? (
        <div className="flex-1 flex flex-col bg-gray-50 min-w-0">
          <div className="bg-white border-b border-gray-200 px-6 py-3 shrink-0">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-full flex items-center justify-center font-bold text-white shrink-0">
                {selectedClientData.name.charAt(0)}
              </div>
              <div>
                <p className="font-bold text-gray-900 text-sm">{selectedClientData.name}</p>
                <p className="text-xs text-gray-500">{selectedClientData.email} · {selectedClientData.client_id}</p>
              </div>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {messages.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-32 text-center">
                <MessageCircle className="w-8 h-8 text-gray-300 mb-2" />
                <p className="text-sm text-gray-400">No messages yet. Start the conversation.</p>
              </div>
            ) : messages.map(m => (
              <div key={m.id} className={`flex ${m.sender_type === 'admin' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[75%] flex flex-col gap-1 ${m.sender_type === 'admin' ? 'items-end' : 'items-start'}`}>
                  <div className={`px-4 py-2.5 rounded-2xl text-sm leading-relaxed ${m.sender_type === 'admin' ? 'bg-blue-600 text-white' : 'bg-white border border-gray-200 text-gray-800 shadow-sm'}`}>
                    {m.content}
                  </div>
                  <p className="text-xs text-gray-400 px-1">
                    {m.sender_type === 'admin' ? 'You' : selectedClientData.name} · {formatTime(m.created_at)}
                    {m.sender_type === 'admin' && m.read_at && <span className="ml-1 text-blue-400">· Read</span>}
                  </p>
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          <div className="bg-white border-t border-gray-200 p-3 flex gap-2 shrink-0">
            <input type="text" value={input} onChange={e => setInput(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage() } }}
              placeholder={`Message ${selectedClientData.name}...`}
              className="flex-1 px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
            <button onClick={sendMessage} disabled={!input.trim() || sending}
              className="w-10 h-10 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white rounded-xl flex items-center justify-center transition-colors">
              {sending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
            </button>
          </div>
        </div>
      ) : (
        <div className="flex-1 flex items-center justify-center bg-gray-50">
          <div className="text-center">
            <MessageCircle className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Select a client</h3>
            <p className="text-sm text-gray-500">Choose a client from the left to view messages</p>
          </div>
        </div>
      )}
    </div>
  )
}

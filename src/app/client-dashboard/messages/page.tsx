'use client'

import { useState, useEffect, useRef } from 'react'
import { supabase } from '@/lib/supabase'
import { useClientAuth } from '@/contexts/ClientAuthContext'
import { Send, MessageCircle, Loader2 } from 'lucide-react'

interface Message {
  id: string
  client_id: string
  sender_type: 'client' | 'admin'
  content: string
  created_at: string
  read_at: string | null
}

export default function MessagesPage() {
  const { client } = useClientAuth()
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(true)
  const [sending, setSending] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const pollRef = useRef<NodeJS.Timeout | null>(null)

  useEffect(() => {
    if (!client) return
    fetchMessages()
    pollRef.current = setInterval(fetchMessages, 5000)
    return () => { if (pollRef.current) clearInterval(pollRef.current) }
  }, [client])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const fetchMessages = async () => {
    const { data } = await supabase
      .from('client_messages')
      .select('*')
      .eq('client_id', client!.id)
      .order('created_at', { ascending: true })
    setMessages(data || [])
    setLoading(false)

    // Mark all admin messages as read (filter nulls client-side)
    const unread = (data || []).filter((m: Message) => m.sender_type === 'admin' && !m.read_at)
    if (unread.length > 0) {
      const now = new Date().toISOString().slice(0, 19).replace('T', ' ')
      for (const m of unread) {
        await supabase.from('client_messages').update({ read_at: now }).eq('id', m.id)
      }
    }
  }

  const sendMessage = async () => {
    if (!input.trim() || !client || sending) return
    const text = input.trim()
    setInput('')
    setSending(true)
    try {
      await supabase.from('client_messages').insert([{
        client_id: client.id,
        sender_type: 'client',
        content: text,
      }])
      fetchMessages()
    } catch {}
    setSending(false)
  }

  const formatTime = (iso: string) =>
    new Date(iso).toLocaleTimeString('en-PH', { timeZone: 'Asia/Manila', hour: '2-digit', minute: '2-digit' })

  return (
    <div className="h-full flex flex-col max-w-3xl mx-auto">
      <div className="px-6 lg:px-8 py-5 border-b border-gray-200 bg-white shrink-0">
        <h1 className="text-xl font-bold text-gray-900">Direct Messages</h1>
        <p className="text-sm text-gray-400 mt-0.5">General chat with the Core Conversion team</p>
      </div>

      <div className="flex-1 overflow-y-auto px-6 lg:px-8 py-6 space-y-3 bg-gray-50">
        {loading ? (
          <div className="flex justify-center py-12"><Loader2 className="w-6 h-6 animate-spin text-blue-600" /></div>
        ) : messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-48 text-center">
            <MessageCircle className="w-12 h-12 text-gray-300 mb-3" />
            <p className="text-gray-500 font-medium">No messages yet</p>
            <p className="text-sm text-gray-400 mt-1">Send a message to start the conversation</p>
          </div>
        ) : messages.map(m => (
          <div key={m.id} className={`flex ${m.sender_type === 'client' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[75%] ${m.sender_type === 'client' ? 'items-end' : 'items-start'} flex flex-col gap-1`}>
              <div className={`px-4 py-3 rounded-2xl text-sm leading-relaxed ${m.sender_type === 'client' ? 'bg-blue-600 text-white' : 'bg-white border border-gray-200 text-gray-800 shadow-sm'}`}>
                {m.content}
              </div>
              <p className="text-xs text-gray-400 px-1">
                {m.sender_type === 'client' ? 'You' : 'Core Conversion'} · {formatTime(m.created_at)}
              </p>
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      <div className="px-6 lg:px-8 py-4 bg-white border-t border-gray-200 shrink-0">
        <div className="flex gap-3">
          <input type="text" value={input} onChange={e => setInput(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage() } }}
            placeholder="Type your message..."
            className="flex-1 px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
          <button onClick={sendMessage} disabled={!input.trim() || sending}
            className="w-12 h-12 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white rounded-xl flex items-center justify-center transition-colors">
            {sending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
          </button>
        </div>
        <p className="text-xs text-gray-400 mt-2 text-center">For task-specific feedback, use the comments in My Orders</p>
      </div>
    </div>
  )
}

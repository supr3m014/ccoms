'use client'

// Client Messages — realtime DM thread per client, the admin side of the
// portal blueprint's DM hub (client_messages/{clientId}/messages). When the
// client portal ships, clients see the same thread from their side.

import { useState, useEffect, useRef } from 'react'
import {
  collection, doc, query, orderBy, onSnapshot, addDoc, setDoc, serverTimestamp,
} from 'firebase/firestore'
import { getDb } from '@/lib/firebase'
import { fetchClients, type Client, type ClientMessage } from '@/lib/clients'
import { MessageCircle, Send, User } from 'lucide-react'

export default function ClientMessagesPage() {
  const [clients, setClients] = useState<Client[]>([])
  const [selected, setSelected] = useState<Client | null>(null)
  const [messages, setMessages] = useState<ClientMessage[]>([])
  const [input, setInput] = useState('')
  const [sending, setSending] = useState(false)
  const [loading, setLoading] = useState(true)
  const endRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    fetchClients().then((cs) => { setClients(cs.filter((c) => c.status !== 'archived')); setLoading(false) })
      .catch(() => setLoading(false))
  }, [])

  useEffect(() => {
    if (!selected) return
    const q = query(collection(getDb(), 'client_messages', selected.id, 'messages'), orderBy('created_at', 'asc'))
    return onSnapshot(q, (snap) => {
      setMessages(snap.docs.map((d) => ({
        id: d.id,
        ...(d.data({ serverTimestamps: 'estimate' }) as Omit<ClientMessage, 'id'>),
      })))
    })
  }, [selected])

  useEffect(() => { endRef.current?.scrollIntoView({ behavior: 'smooth' }) }, [messages])

  const send = async () => {
    if (!input.trim() || !selected || sending) return
    const text = input.trim()
    setInput(''); setSending(true)
    try {
      // Parent doc mirrors thread metadata so the portal can list threads.
      await setDoc(doc(getDb(), 'client_messages', selected.id), {
        client_id: selected.id, client_name: selected.name,
        last_message_at: serverTimestamp(), last_sender: 'admin',
      }, { merge: true })
      await addDoc(collection(getDb(), 'client_messages', selected.id, 'messages'), {
        sender: 'admin', content: text, created_at: serverTimestamp(),
      })
    } catch { /* snapshot shows the truth either way */ }
    setSending(false)
  }

  return (
    <div className="h-full flex overflow-hidden">
      <div className="w-72 bg-white border-r border-gray-200 flex flex-col shrink-0">
        <div className="px-4 py-4 border-b border-gray-200">
          <h2 className="font-bold text-gray-900">Client Messages</h2>
          <p className="text-xs text-gray-500">{clients.length} client{clients.length !== 1 ? 's' : ''}</p>
        </div>
        <div className="flex-1 overflow-y-auto">
          {loading ? (
            <p className="p-6 text-center text-sm text-gray-400">Loading…</p>
          ) : clients.length === 0 ? (
            <p className="p-6 text-center text-sm text-gray-400">No clients yet — add one under All Clients.</p>
          ) : clients.map((c) => (
            <button key={c.id} onClick={() => setSelected(c)}
              className={`w-full text-left px-4 py-3 border-b border-gray-100 transition-colors ${selected?.id === c.id ? 'bg-blue-50 border-l-4 border-l-blue-500' : 'hover:bg-gray-50 border-l-4 border-l-transparent'}`}>
              <p className="text-sm font-medium text-gray-900">{c.name}</p>
              <p className="text-xs text-gray-400">{c.client_number}{c.company ? ` · ${c.company}` : ''}</p>
            </button>
          ))}
        </div>
      </div>

      {selected ? (
        <div className="flex-1 flex flex-col bg-gray-50 min-w-0">
          <div className="bg-white border-b border-gray-200 px-6 py-3 flex items-center gap-3 shrink-0">
            <div className="w-9 h-9 bg-blue-100 rounded-full flex items-center justify-center"><User className="w-5 h-5 text-blue-600" /></div>
            <div>
              <p className="font-semibold text-gray-900 text-sm">{selected.name}</p>
              <p className="text-xs text-gray-500">{selected.email}</p>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-2">
            {messages.length === 0 && (
              <p className="text-center text-xs text-gray-400 py-10">No messages yet — say hello. The client will see this thread in their portal.</p>
            )}
            {messages.map((m) => (
              <div key={m.id} className={`flex ${m.sender === 'admin' ? 'justify-end' : 'justify-start'}`}>
                <div>
                  <div className={`px-3.5 py-2.5 rounded-2xl text-sm leading-relaxed max-w-md ${m.sender === 'admin' ? 'bg-blue-600 text-white' : 'bg-white border border-gray-200 text-gray-800'}`}>
                    {m.content}
                  </div>
                  <p className={`text-[11px] text-gray-400 mt-0.5 px-1 ${m.sender === 'admin' ? 'text-right' : ''}`}>
                    {m.sender === 'admin' ? 'You' : selected.name} · {m.created_at?.toDate().toLocaleTimeString('en-PH', { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
              </div>
            ))}
            <div ref={endRef} />
          </div>

          <div className="bg-white border-t border-gray-200 p-3 flex gap-2 shrink-0">
            <input value={input} onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send() } }}
              placeholder={`Message ${selected.name}…`}
              className="flex-1 px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
            <button onClick={send} disabled={!input.trim() || sending}
              className="w-10 h-10 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white rounded-xl flex items-center justify-center">
              <Send className="w-4 h-4" />
            </button>
          </div>
        </div>
      ) : (
        <div className="flex-1 flex items-center justify-center bg-gray-50">
          <div className="text-center">
            <MessageCircle className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-1">Select a client</h3>
            <p className="text-sm text-gray-500">Their message thread opens here</p>
          </div>
        </div>
      )}
    </div>
  )
}

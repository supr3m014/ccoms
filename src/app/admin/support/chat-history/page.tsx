'use client'

import { useState, useEffect } from 'react'
import { ChevronDown, ChevronUp, Mail, Eye } from 'lucide-react'

const API = process.env.NEXT_PUBLIC_API_URL || 'https://ccoms.ph/api-bridge.php'
const post = async (action: string, body: object) => {
  const r = await fetch(`${API}?action=${action}`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body), credentials: 'include' })
  return r.json()
}
const get = async (params: string) => {
  const r = await fetch(`${API}?${params}`, { credentials: 'include' })
  return r.json()
}

function elapsed(start: string, end?: string) {
  const ms = new Date(end || Date.now()).getTime() - new Date(start).getTime()
  const h = Math.floor(ms / 3600000), m = Math.floor((ms % 3600000) / 60000)
  return h > 0 ? `${h}h ${m}m` : `${m}m`
}
function fmt(ts: string) {
  return new Date(ts).toLocaleTimeString('en-PH', { hour: '2-digit', minute: '2-digit', timeZone: 'Asia/Manila' })
}

const CAT_COLORS: Record<string, string> = { general: 'bg-gray-100 text-gray-600', billing: 'bg-yellow-100 text-yellow-700', sales: 'bg-green-100 text-green-700', technical: 'bg-blue-100 text-blue-700' }

export default function ChatHistoryPage() {
  const [sessions, setSessions] = useState<any[]>([])
  const [messages, setMessages] = useState<Record<string, any[]>>({})
  const [expanded, setExpanded] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [emailing, setEmailing] = useState<string | null>(null)

  useEffect(() => {
    get('action=chat-history-list').then(data => {
      if (data.sessions) setSessions(data.sessions)
      setLoading(false)
    })
  }, [])

  const openSession = async (id: string) => {
    if (expanded === id) { setExpanded(null); return }
    setExpanded(id)
    if (!messages[id]) {
      const data = await post('chat-history-messages', { session_id: id })
      setMessages(prev => ({ ...prev, [id]: data.messages || [] }))
    }
  }

  const emailTranscript = async (session: any) => {
    if (!session.visitor_email) return alert('No email on record for this visitor.')
    setEmailing(session.id)
    const msgs = messages[session.id] || []
    const transcript = msgs.map((m: any) => `[${fmt(m.created_at)}] ${m.sender_type.toUpperCase()}: ${m.content}`).join('\n')
    await post('ticket-reply', {
      ticket_id: null, visitor_email: session.visitor_email, visitor_name: session.visitor_name,
      content: `Chat Transcript:\n\n${transcript}`, send_email: true, subject: 'Your Chat Transcript — Core Conversion'
    })
    setEmailing(null)
    alert('Transcript sent to ' + session.visitor_email)
  }

  return (
    <div className="p-6 max-w-5xl">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Chat History</h1>
        <p className="text-sm text-gray-500 mt-0.5">All saved chat sessions and transcripts</p>
      </div>

      {loading && <p className="text-gray-400 text-sm py-8 text-center">Loading…</p>}
      {!loading && sessions.length === 0 && <p className="text-gray-400 text-sm py-8 text-center">No chat sessions yet.</p>}

      <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="text-left px-4 py-3 text-xs font-semibold text-gray-600">NAME</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-gray-600">EMAIL</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-gray-600">CATEGORY</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-gray-600">DATE</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-gray-600">DURATION</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-gray-600">ACTIONS</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {sessions.map(session => (
              <>
                <tr key={session.id} className="hover:bg-gray-50 cursor-pointer" onClick={() => openSession(session.id)}>
                  <td className="px-4 py-3 font-medium text-gray-900">{session.visitor_name}</td>
                  <td className="px-4 py-3 text-gray-600">{session.visitor_email}</td>
                  <td className="px-4 py-3"><span className={`text-xs px-2 py-0.5 rounded-full font-medium ${CAT_COLORS[session.category] || 'bg-gray-100 text-gray-600'}`}>{session.category}</span></td>
                  <td className="px-4 py-3 text-gray-600">{new Date(session.started_at).toLocaleDateString()}</td>
                  <td className="px-4 py-3 text-gray-600 text-xs">{elapsed(session.started_at, session.ended_at || undefined)} {session.ended_at ? '' : '(ongoing)'}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2" onClick={e => e.stopPropagation()}>
                      <button onClick={() => openSession(session.id)} className="flex items-center gap-1 text-xs text-blue-600 hover:text-blue-800 font-medium">
                        <Eye className="w-3.5 h-3.5" /> {expanded === session.id ? 'Hide' : 'View'}
                      </button>
                      <button onClick={() => emailTranscript(session)} disabled={emailing === session.id} className="flex items-center gap-1 text-xs text-gray-500 hover:text-gray-700 font-medium">
                        <Mail className="w-3.5 h-3.5" /> {emailing === session.id ? 'Sending…' : 'Email'}
                      </button>
                    </div>
                  </td>
                </tr>
                {expanded === session.id && (
                  <tr key={session.id + '-msg'}>
                    <td colSpan={6} className="px-4 pb-4 bg-gray-50">
                      <div className="space-y-2 max-h-72 overflow-y-auto pt-2">
                        {(messages[session.id] || []).length === 0 && <p className="text-xs text-gray-400 text-center py-4">No messages recorded</p>}
                        {(messages[session.id] || []).map((msg: any) => (
                          <div key={msg.id} className={`flex ${msg.sender_type === 'visitor' ? 'justify-start' : msg.sender_type === 'system' ? 'justify-center' : 'justify-end'}`}>
                            {msg.sender_type === 'system'
                              ? <p className="text-xs text-gray-400 italic">{msg.content}</p>
                              : <div className={`max-w-[75%] rounded-xl px-3 py-2 text-xs ${msg.sender_type === 'visitor' ? 'bg-blue-600 text-white' : 'bg-white border border-gray-200 text-gray-800'}`}>
                                  <span className="font-semibold opacity-70 capitalize">{msg.sender_type} · {fmt(msg.created_at)}</span>
                                  <p className="mt-0.5">{msg.content}</p>
                                </div>
                            }
                          </div>
                        ))}
                      </div>
                    </td>
                  </tr>
                )}
              </>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

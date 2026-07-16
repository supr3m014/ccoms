'use client'

// Chat History — Firestore-backed. Shows ended sessions with transcripts;
// transcripts can be emailed to the visitor via the sendSupportEmail function.

import React, { useState, useEffect } from 'react'
import { collection, query, orderBy, getDocs } from 'firebase/firestore'
import { getDb } from '@/lib/firebase'
import { sendSupportEmail, fmtTime, fmtDate, type ChatSessionDoc, type ChatMessageDoc } from '@/lib/support'
import { ChevronUp, ChevronDown, Mail, Eye } from 'lucide-react'

function elapsed(s: ChatSessionDoc) {
  const start = s.started_at?.toMillis()
  if (!start) return ''
  const end = s.ended_at?.toMillis() ?? Date.now()
  const ms = end - start
  const h = Math.floor(ms / 3600000), m = Math.floor((ms % 3600000) / 60000)
  return h > 0 ? `${h}h ${m}m` : `${m}m`
}

const CAT_COLORS: Record<string, string> = { general: 'bg-gray-100 text-gray-600', billing: 'bg-yellow-100 text-yellow-700', sales: 'bg-green-100 text-green-700', technical: 'bg-blue-100 text-blue-700' }

export default function ChatHistoryPage() {
  const [sessions, setSessions] = useState<ChatSessionDoc[]>([])
  const [messages, setMessages] = useState<Record<string, ChatMessageDoc[]>>({})
  const [expanded, setExpanded] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [emailing, setEmailing] = useState<string | null>(null)
  const [notice, setNotice] = useState('')

  useEffect(() => {
    (async () => {
      try {
        const snap = await getDocs(query(collection(getDb(), 'chat_sessions'), orderBy('started_at', 'desc')))
        setSessions(snap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<ChatSessionDoc, 'id'>) })))
      } catch { setNotice('Could not load chat history.') }
      setLoading(false)
    })()
  }, [])

  const loadMessages = async (id: string): Promise<ChatMessageDoc[]> => {
    if (messages[id]) return messages[id]
    const snap = await getDocs(query(collection(getDb(), 'chat_sessions', id, 'messages'), orderBy('created_at', 'asc')))
    const msgs = snap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<ChatMessageDoc, 'id'>) }))
    setMessages(prev => ({ ...prev, [id]: msgs }))
    return msgs
  }

  const openSession = async (id: string) => {
    if (expanded === id) { setExpanded(null); return }
    setExpanded(id)
    await loadMessages(id).catch(() => {})
  }

  const emailTranscript = async (session: ChatSessionDoc) => {
    if (!session.visitor_email) { setNotice('No email on record for this visitor.'); return }
    setEmailing(session.id)
    setNotice('')
    try {
      const msgs = await loadMessages(session.id)
      const transcript = msgs
        .filter(m => m.sender_type !== 'system')
        .map(m => `[${fmtTime(m.created_at)}] ${m.sender_type.toUpperCase()}: ${m.content}`)
        .join('\n')
      const err = await sendSupportEmail(
        session.visitor_email,
        'Your Chat Transcript — Core Conversion',
        `Hi ${session.visitor_name},\n\nHere is the transcript of your chat with Core Conversion support:\n\n${transcript}\n\nBest regards,\nCore Conversion Support Team\nhttps://ccoms.ph`,
      )
      setNotice(err ? `Could not send: ${err}` : `Transcript sent to ${session.visitor_email}.`)
    } catch {
      setNotice('Could not send the transcript — please try again.')
    }
    setEmailing(null)
  }

  return (
    <div className="p-6 max-w-5xl">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Chat History</h1>
        <p className="text-sm text-gray-500 mt-0.5">All saved chat sessions and transcripts</p>
      </div>

      {notice && <p className="mb-4 text-sm text-gray-600">{notice}</p>}
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
              <React.Fragment key={session.id}>
                <tr className="hover:bg-gray-50 cursor-pointer" onClick={() => openSession(session.id)}>
                  <td className="px-4 py-3 font-medium text-gray-900">{session.visitor_name}</td>
                  <td className="px-4 py-3 text-gray-600">{session.visitor_email}</td>
                  <td className="px-4 py-3"><span className={`text-xs px-2 py-0.5 rounded-full font-medium ${CAT_COLORS[session.category] || 'bg-gray-100 text-gray-600'}`}>{session.category}</span></td>
                  <td className="px-4 py-3 text-gray-600">{fmtDate(session.started_at)}</td>
                  <td className="px-4 py-3 text-gray-600 text-xs">{elapsed(session)} {session.mode === 'ended' ? '' : '(ongoing)'}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2" onClick={e => e.stopPropagation()}>
                      <button onClick={() => openSession(session.id)} className="flex items-center gap-1 text-xs text-blue-600 hover:text-blue-800 font-medium">
                        {expanded === session.id ? <ChevronUp className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />} {expanded === session.id ? 'Hide' : 'View'}
                      </button>
                      <button onClick={() => emailTranscript(session)} disabled={emailing === session.id} className="flex items-center gap-1 text-xs text-gray-500 hover:text-gray-700 font-medium">
                        <Mail className="w-3.5 h-3.5" /> {emailing === session.id ? 'Sending…' : 'Email'}
                      </button>
                    </div>
                  </td>
                </tr>
                {expanded === session.id && (
                  <tr>
                    <td colSpan={6} className="px-4 pb-4 bg-gray-50">
                      <div className="space-y-2 max-h-72 overflow-y-auto pt-2">
                        {(messages[session.id] || []).length === 0 && <p className="text-xs text-gray-400 text-center py-4">No messages recorded</p>}
                        {(messages[session.id] || []).map((msg) => (
                          <div key={msg.id} className={`flex ${msg.sender_type === 'visitor' ? 'justify-start' : msg.sender_type === 'system' ? 'justify-center' : 'justify-end'}`}>
                            {msg.sender_type === 'system'
                              ? <p className="text-xs text-gray-400 italic">{msg.content}</p>
                              : <div className={`max-w-[75%] rounded-xl px-3 py-2 text-xs ${msg.sender_type === 'visitor' ? 'bg-blue-600 text-white' : 'bg-white border border-gray-200 text-gray-800'}`}>
                                  <span className="font-semibold opacity-70 capitalize">{msg.sender_type} · {fmtTime(msg.created_at)}</span>
                                  <p className="mt-0.5">{msg.content}</p>
                                </div>
                            }
                          </div>
                        ))}
                      </div>
                    </td>
                  </tr>
                )}
              </React.Fragment>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

'use client'

import React, { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { MessageCircle, Mail, ChevronDown, ChevronUp, Clock, User } from 'lucide-react'
import { useToast } from '@/contexts/ToastContext'

interface ChatSession {
  id: string
  visitor_name: string
  visitor_email: string
  visitor_phone: string
  visitor_address: string
  visitor_country: string
  category: string
  mode: string
  ticket_created: number
  started_at: string
  ended_at: string | null
}

interface ChatMessage {
  id: string
  session_id: string
  sender_type: string
  content: string
  created_at: string
}

function formatUTC8(iso: string) {
  const dateStr = iso.endsWith('Z') ? iso : `${iso}Z`;
  return new Date(dateStr).toLocaleString('en-PH', {
    timeZone: 'Asia/Manila',
    year: 'numeric', month: 'short', day: 'numeric',
    hour: '2-digit', minute: '2-digit',
  })
}

function formatTimeOnly(iso: string) {
  const dateStr = iso.endsWith('Z') ? iso : `${iso}Z`;
  return new Date(dateStr).toLocaleTimeString('en-PH', {
    timeZone: 'Asia/Manila',
    hour: '2-digit', minute: '2-digit',
  })
}

function formatHourSpan(start: string, end: string | null) {
  if (!end) return `${formatTimeOnly(start)} – ongoing`
  return `${formatTimeOnly(start)} – ${formatTimeOnly(end)}`
}

function catColor(cat: string) {
  return { general: 'bg-gray-100 text-gray-700', billing: 'bg-yellow-100 text-yellow-700', sales: 'bg-green-100 text-green-700', technical: 'bg-blue-100 text-blue-700' }[cat] || 'bg-gray-100 text-gray-700'
}

export default function ChatHistoryPage() {
  const { showToast } = useToast()
  const [sessions, setSessions] = useState<ChatSession[]>([])
  const [loading, setLoading] = useState(true)
  const [expanded, setExpanded] = useState<string | null>(null)
  const [messages, setMessages] = useState<Record<string, ChatMessage[]>>({})
  const [loadingMessages, setLoadingMessages] = useState<string | null>(null)
  const [emailingSession, setEmailingSession] = useState<string | null>(null)

  useEffect(() => { fetchSessions() }, [])

  const BRIDGE = process.env.NEXT_PUBLIC_API_URL!
  const apiGet = async (action: string, params: Record<string, string> = {}) => {
    const url = new URL(BRIDGE)
    url.searchParams.append('action', action)
    for (const [k, v] of Object.entries(params)) url.searchParams.append(k, v)
    const res = await fetch(url.toString())
    return res.json()
  }

  const fetchSessions = async () => {
    try {
      const { sessions, error } = await apiGet('chat-history-list')
      if (error) throw new Error(error)
      setSessions(sessions || [])
    } catch (e) {
      console.error('Failed to load chat history', e)
    } finally {
      setLoading(false)
    }
  }

  const fetchMessages = async (sessionId: string) => {
    if (messages[sessionId]) { setExpanded(sessionId); return }
    setLoadingMessages(sessionId)
    try {
      const { messages: msgs, error } = await apiGet('chat-history-messages', { session_id: sessionId })
      if (error) throw new Error(error)
      setMessages(prev => ({ ...prev, [sessionId]: msgs || [] }))
      setExpanded(sessionId)
    } catch {}
    setLoadingMessages(null)
  }

  const toggleSession = (sessionId: string) => {
    if (expanded === sessionId) { setExpanded(null); return }
    fetchMessages(sessionId)
  }

  const emailHistory = async (session: ChatSession) => {
    if (!session.visitor_email) { showToast('No email address on file', 'warning'); return }
    setEmailingSession(session.id)
    const msgs = messages[session.id]
    if (!msgs) {
      // load first
      await fetchMessages(session.id)
    }
    const transcript = (messages[session.id] || [])
      .filter(m => m.sender_type !== 'system')
      .map(m => `[${m.sender_type.toUpperCase()} - ${formatUTC8(m.created_at)}]\n${m.content}`)
      .join('\n\n')

    const subject = encodeURIComponent(`Your Core Conversion Chat Transcript — ${formatUTC8(session.started_at)}`)
    const body = encodeURIComponent(`Hi ${session.visitor_name},\n\nHere is the transcript from your chat session with Core Conversion:\n\n${formatHourSpan(session.started_at, session.ended_at)} (Asia/Manila)\nCategory: ${session.category}\n\n---\n\n${transcript}\n\n---\n\nThank you for contacting Core Conversion.\nhttps://ccoms.ph`)
    window.location.href = `mailto:${session.visitor_email}?subject=${subject}&body=${body}`
    setEmailingSession(null)
    showToast('Email client opened', 'success')
  }

  const senderLabel = (type: string) => {
    if (type === 'visitor') return { label: 'Visitor', color: 'text-blue-600 font-semibold' }
    if (type === 'ai') return { label: 'AI', color: 'text-purple-600 font-semibold' }
    if (type === 'admin') return { label: 'Agent', color: 'text-emerald-600 font-semibold' }
    return { label: 'System', color: 'text-gray-400 italic text-xs' }
  }

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Chat History</h1>
        <p className="text-gray-600">All saved chat sessions and transcripts</p>
      </div>

      {loading ? (
        <div className="bg-white rounded-lg shadow p-12 text-center text-gray-500">Loading chat history...</div>
      ) : sessions.length === 0 ? (
        <div className="bg-white rounded-lg shadow p-12 text-center">
          <MessageCircle className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-600">No chat sessions yet</p>
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-md overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Name</th>
                <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Email</th>
                <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Phone</th>
                <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Country</th>
                <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Category</th>
                <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Date</th>
                <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Duration (UTC+8)</th>
                <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Ticket</th>
                <th className="px-5 py-3 text-right text-xs font-semibold text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody>
              {sessions.map(session => (
                <React.Fragment key={session.id}>
                  <tr className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 bg-blue-100 rounded-full flex items-center justify-center shrink-0">
                          <User className="w-4 h-4 text-blue-600" />
                        </div>
                        <span className="font-medium text-gray-900 text-sm">{session.visitor_name}</span>
                      </div>
                    </td>
                    <td className="px-5 py-4 text-sm text-gray-600">{session.visitor_email}</td>
                    <td className="px-5 py-4 text-sm text-gray-600">{session.visitor_phone || '—'}</td>
                    <td className="px-5 py-4 text-sm text-gray-600">{session.visitor_country || '—'}</td>
                    <td className="px-5 py-4">
                      <span className={`text-xs px-2 py-1 rounded-full font-medium ${catColor(session.category)}`}>{session.category}</span>
                    </td>
                    <td className="px-5 py-4 text-sm text-gray-600 whitespace-nowrap">
                      {new Date(session.started_at.endsWith('Z') ? session.started_at : `${session.started_at}Z`).toLocaleDateString('en-PH', { timeZone: 'Asia/Manila', day: 'numeric', month: 'short', year: 'numeric' })}
                    </td>
                    <td className="px-5 py-4 text-sm text-gray-600 whitespace-nowrap">
                      <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5 text-gray-400" />{formatHourSpan(session.started_at, session.ended_at)}</span>
                    </td>
                    <td className="px-5 py-4">
                      {session.ticket_created ? (
                        <span className="text-xs px-2 py-1 bg-green-100 text-green-700 rounded-full font-medium">✓ Created</span>
                      ) : (
                        <span className="text-xs text-gray-400">—</span>
                      )}
                    </td>
                    <td className="px-5 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => emailHistory(session)}
                          disabled={emailingSession === session.id}
                          className="flex items-center gap-1.5 px-3 py-1.5 border border-gray-300 rounded-lg text-xs font-medium text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-50"
                        >
                          <Mail className="w-3.5 h-3.5" />Email
                        </button>
                        <button
                          onClick={() => toggleSession(session.id)}
                          className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-medium transition-colors"
                        >
                          {loadingMessages === session.id ? (
                            <span>Loading...</span>
                          ) : expanded === session.id ? (
                            <><ChevronUp className="w-3.5 h-3.5" />Hide Chat</>
                          ) : (
                            <><ChevronDown className="w-3.5 h-3.5" />View Chat</>
                          )}
                        </button>
                      </div>
                    </td>
                  </tr>

                  {expanded === session.id && messages[session.id] && (
                    <tr>
                      <td colSpan={9} className="px-5 py-4 bg-gray-50 border-b border-gray-200">
                        <div className="bg-white rounded-xl border border-gray-200 p-4 max-h-96 overflow-y-auto space-y-2">
                          <p className="text-xs font-semibold text-gray-500 uppercase mb-3">Full Transcript</p>
                          {messages[session.id].map((m, i) => {
                            const { label, color } = senderLabel(m.sender_type)
                            return (
                              <div key={i} className="flex gap-3 text-sm">
                                <span className={`shrink-0 w-14 text-right ${color}`}>{label}</span>
                                <span className="text-gray-400 shrink-0 w-14 text-xs pt-0.5">{formatTimeOnly(m.created_at)}</span>
                                <span className="text-gray-700 leading-relaxed">{m.content}</span>
                              </div>
                            )
                          })}
                          {messages[session.id].length === 0 && <p className="text-gray-400 text-sm">No messages recorded</p>}
                        </div>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}

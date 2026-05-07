'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { Mail, Trash2, Archive, Reply, X } from 'lucide-react'

export default function EmailInboxPage() {
  const [emails, setEmails] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [selected, setSelected] = useState<any | null>(null)
  const [replyText, setReplyText] = useState('')
  const [sending, setSending] = useState(false)
  const [filter, setFilter] = useState<'all' | 'unread' | 'archived'>('all')

  const fetchEmails = async () => {
    const { data } = await supabase.from('contact_submissions').select('*').order('created_at', { ascending: false })
    if (data) setEmails(data)
    setLoading(false)
  }
  useEffect(() => { fetchEmails() }, [])

  const archive = async (id: string) => {
    await supabase.from('contact_submissions').update({ archived: true }).eq('id', id)
    fetchEmails()
    if (selected?.id === id) setSelected(null)
  }

  const deleteEmail = async (id: string) => {
    if (!confirm('Delete this submission?')) return
    await supabase.from('contact_submissions').delete().eq('id', id)
    fetchEmails()
    if (selected?.id === id) setSelected(null)
  }

  const sendReply = async () => {
    if (!replyText.trim() || !selected) return
    setSending(true)
    const API = process.env.NEXT_PUBLIC_API_URL || 'https://ccoms.ph/api-bridge.php'
    await fetch(`${API}?action=ticket-reply`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ visitor_email: selected.email, visitor_name: selected.name, content: replyText, send_email: true, subject: `Re: ${selected.subject || 'Your Inquiry'}` }),
      credentials: 'include',
    })
    setReplyText('')
    setSending(false)
    alert('Reply sent to ' + selected.email)
  }

  const filtered = emails.filter(e => {
    if (filter === 'archived') return e.archived
    if (filter === 'unread') return !e.archived
    return true
  })

  return (
    <div className="p-6 h-[calc(100vh-80px)] flex flex-col">
      <div className="mb-4">
        <h1 className="text-2xl font-bold text-gray-900">Email Inbox</h1>
        <p className="text-sm text-gray-500 mt-0.5">Contact form submissions</p>
      </div>

      <div className="flex gap-1 mb-4 bg-gray-100 p-1 rounded-xl w-fit">
        {(['all','unread','archived'] as const).map(f => (
          <button key={f} onClick={() => setFilter(f)} className={`px-3 py-1.5 rounded-lg text-xs font-semibold capitalize transition-colors ${filter === f ? 'bg-white shadow text-gray-900' : 'text-gray-500 hover:text-gray-700'}`}>{f}</button>
        ))}
      </div>

      <div className="flex gap-4 flex-1 min-h-0">
        {/* List */}
        <div className="w-80 shrink-0 border border-gray-200 rounded-xl bg-white overflow-y-auto">
          {loading && <p className="text-center text-gray-400 text-sm py-8">Loading…</p>}
          {!loading && filtered.length === 0 && <p className="text-center text-gray-400 text-sm py-8">No emails</p>}
          {filtered.map(email => (
            <div
              key={email.id}
              onClick={() => setSelected(email)}
              className={`p-3 border-b border-gray-100 cursor-pointer hover:bg-gray-50 transition-colors ${selected?.id === email.id ? 'bg-blue-50 border-l-2 border-l-blue-500' : ''} ${email.archived ? 'opacity-50' : ''}`}
            >
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <p className="font-semibold text-sm text-gray-900 truncate">{email.name}</p>
                  <p className="text-xs text-gray-500 truncate">{email.email}</p>
                  <p className="text-xs text-gray-700 mt-0.5 truncate">{email.subject || email.message?.substring(0, 40)}</p>
                </div>
                <p className="text-xs text-gray-400 shrink-0">{new Date(email.created_at).toLocaleDateString()}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Detail */}
        {selected ? (
          <div className="flex-1 border border-gray-200 rounded-xl bg-white flex flex-col overflow-hidden">
            <div className="flex items-start justify-between p-4 border-b border-gray-100">
              <div>
                <h3 className="font-bold text-gray-900">{selected.subject || 'No Subject'}</h3>
                <p className="text-sm text-gray-600 mt-0.5"><span className="font-medium">{selected.name}</span> · {selected.email}</p>
                {selected.phone && <p className="text-xs text-gray-400 mt-0.5">{selected.phone}</p>}
              </div>
              <div className="flex items-center gap-2">
                <button onClick={() => archive(selected.id)} title="Archive" className="p-1.5 hover:bg-gray-100 rounded-lg text-gray-500 hover:text-gray-700"><Archive className="w-4 h-4" /></button>
                <button onClick={() => deleteEmail(selected.id)} title="Delete" className="p-1.5 hover:bg-gray-100 rounded-lg text-red-400 hover:text-red-600"><Trash2 className="w-4 h-4" /></button>
                <button onClick={() => setSelected(null)} className="p-1.5 hover:bg-gray-100 rounded-lg text-gray-400"><X className="w-4 h-4" /></button>
              </div>
            </div>
            <div className="flex-1 p-4 overflow-y-auto">
              <p className="text-sm text-gray-800 whitespace-pre-wrap leading-relaxed">{selected.message}</p>
              {selected.service && <p className="mt-3 text-xs text-gray-500">Service interested in: <span className="font-medium">{selected.service}</span></p>}
            </div>
            <div className="p-4 border-t border-gray-100">
              <p className="text-xs font-semibold text-gray-600 mb-2 flex items-center gap-1"><Reply className="w-3.5 h-3.5" />Reply to {selected.email}</p>
              <textarea value={replyText} onChange={e => setReplyText(e.target.value)} rows={3} placeholder="Type your reply…" className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none mb-2" />
              <button onClick={sendReply} disabled={sending || !replyText.trim()} className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white px-4 py-2 rounded-xl text-sm font-semibold transition-colors">
                {sending ? 'Sending…' : 'Send Reply'}
              </button>
            </div>
          </div>
        ) : (
          <div className="flex-1 border border-gray-200 rounded-xl bg-white flex items-center justify-center text-gray-400 flex-col gap-2">
            <Mail className="w-10 h-10" />
            <p className="text-sm">Select a message to read</p>
          </div>
        )}
      </div>
    </div>
  )
}

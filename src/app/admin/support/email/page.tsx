'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { Mail, Trash2, Archive, ArrowLeft, ArchiveRestore, Send, X, Loader2 } from 'lucide-react'
import Link from 'next/link'
import { useToast } from '@/contexts/ToastContext'
import { useConfirm } from '@/contexts/ConfirmContext'

interface Email {
  id: string
  name: string
  email: string
  company: string
  message: string
  created_at: string
  archived: number
}

export default function EmailInboxPage() {
  const { showToast } = useToast()
  const { showConfirm } = useConfirm()
  const [emails, setEmails] = useState<Email[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedEmail, setSelectedEmail] = useState<string | null>(null)
  const [showArchived, setShowArchived] = useState(false)
  const [replyModal, setReplyModal] = useState<Email | null>(null)
  const [replyText, setReplyText] = useState('')
  const [sending, setSending] = useState(false)

  useEffect(() => { fetchEmails() }, [showArchived])

  const fetchEmails = async () => {
    setLoading(true)
    try {
      let query = supabase.from('contact_submissions').select('*').order('created_at', { ascending: false })
      query = showArchived ? query.eq('archived', 1) : query.eq('archived', 0)
      const { data, error } = await query
      if (error) throw error
      setEmails((data || []).map((item: any) => ({
        id: item.id,
        name: item.name,
        email: item.email,
        company: item.company || '(not specified)',
        message: item.message,
        created_at: item.created_at,
        archived: item.archived || 0,
      })))
    } catch (e) { console.error('fetchEmails', e) }
    finally { setLoading(false) }
  }

  const deleteEmail = async (id: string) => {
    const ok = await showConfirm('Delete this email? This cannot be undone.', { destructive: true })
    if (!ok) return
    const { error } = await supabase.from('contact_submissions').delete().eq('id', id)
    if (error) { showToast('Failed to delete', 'error'); return }
    setEmails(prev => prev.filter(e => e.id !== id))
    if (selectedEmail === id) setSelectedEmail(null)
    showToast('Email deleted', 'success')
  }

  const archiveEmail = async (id: string, archive: boolean) => {
    const { error } = await supabase.from('contact_submissions').update({ archived: archive ? 1 : 0 }).eq('id', id)
    if (error) { showToast('Failed to archive', 'error'); return }
    setEmails(prev => prev.filter(e => e.id !== id))
    if (selectedEmail === id) setSelectedEmail(null)
    showToast(archive ? 'Archived' : 'Restored to inbox', 'success')
  }

  const sendReply = async () => {
    if (!replyText.trim() || !replyModal) return
    setSending(true)
    try {
      const res = await fetch('/api/contact/reply', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          to: replyModal.email,
          name: replyModal.name,
          original_message: replyModal.message,
          reply_content: replyText,
        }),
      })
      const data = await res.json()
      if (!res.ok || data.error) throw new Error(data.error || 'Failed')
      showToast('Reply sent successfully', 'success')
      setReplyModal(null)
      setReplyText('')
    } catch (err: any) {
      showToast(err.message || 'Failed to send reply', 'error')
    }
    setSending(false)
  }

  const selectedItem = emails.find(e => e.id === selectedEmail)
  const unreadCount = emails.filter(e => !e.archived).length

  return (
    <div className="p-8">

      {/* Reply Modal */}
      {replyModal && (
        <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setReplyModal(null)} />
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg animate-fadeIn overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
              <div>
                <h3 className="font-bold text-gray-900">Reply to {replyModal.name}</h3>
                <p className="text-xs text-gray-500 mt-0.5">To: {replyModal.email}</p>
              </div>
              <button onClick={() => setReplyModal(null)} className="p-1.5 hover:bg-gray-100 rounded-lg"><X className="w-5 h-5 text-gray-500" /></button>
            </div>
            <div className="p-6 space-y-3">
              <div className="bg-gray-50 rounded-xl p-3 text-sm text-gray-600 border border-gray-200">
                <p className="text-xs font-semibold text-gray-400 mb-1">Original message:</p>
                <p className="line-clamp-3">{replyModal.message}</p>
              </div>
              <textarea value={replyText} onChange={e => setReplyText(e.target.value)} rows={5}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                placeholder="Write your reply..." />
            </div>
            <div className="px-6 py-4 bg-gray-50 flex gap-3 justify-end">
              <button onClick={() => setReplyModal(null)} className="px-5 py-2.5 border border-gray-300 text-gray-700 rounded-xl font-semibold hover:bg-gray-100 transition-colors text-sm">Cancel</button>
              <button onClick={sendReply} disabled={!replyText.trim() || sending}
                className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white rounded-xl font-semibold transition-colors text-sm">
                {sending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                {sending ? 'Sending...' : 'Send Reply'}
              </button>
            </div>
          </div>
        </div>
      )}

      <Link href="/admin/support" className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 mb-4">
        <ArrowLeft className="w-4 h-4" />Back to Support
      </Link>

      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-1">Email Inbox</h1>
          <p className="text-gray-600">Contact form submissions</p>
        </div>
        <button onClick={() => { setShowArchived(v => !v); setSelectedEmail(null) }}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-colors ${showArchived ? 'bg-amber-100 text-amber-700 hover:bg-amber-200' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>
          {showArchived ? <><ArchiveRestore className="w-4 h-4" />Show Inbox</> : <><Archive className="w-4 h-4" />Show Archived</>}
        </button>
      </div>

      <div className="grid grid-cols-3 gap-8">
        {/* Email list */}
        <div className="col-span-2">
          <div className="bg-white rounded-xl shadow-md overflow-hidden">
            {loading ? (
              <div className="p-8 text-center text-gray-500">Loading...</div>
            ) : emails.length === 0 ? (
              <div className="p-12 text-center">
                <Mail className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-600">{showArchived ? 'No archived emails' : 'No emails in inbox'}</p>
              </div>
            ) : (
              <div className="divide-y divide-gray-100">
                {emails.map(emailItem => (
                  <div key={emailItem.id} onClick={() => setSelectedEmail(selectedEmail === emailItem.id ? null : emailItem.id)}
                    className={`p-4 cursor-pointer hover:bg-gray-50 transition-colors ${selectedEmail === emailItem.id ? 'bg-blue-50' : ''}`}>
                    <div className="flex items-start justify-between mb-1">
                      <h3 className="font-semibold text-gray-900 text-sm">{emailItem.name}</h3>
                      <span className="text-xs text-gray-400 whitespace-nowrap ml-2">
                        {new Date(emailItem.created_at).toLocaleDateString()}
                      </span>
                    </div>
                    <p className="text-xs text-gray-500 mb-1">{emailItem.email} · {emailItem.company}</p>
                    <p className="text-xs text-gray-500 line-clamp-2">{emailItem.message}</p>

                    {selectedEmail === emailItem.id && (
                      <div className="mt-3 pt-3 border-t border-gray-200 flex gap-2" onClick={e => e.stopPropagation()}>
                        <button onClick={() => setReplyModal(emailItem)}
                          className="flex items-center gap-1.5 text-xs px-3 py-1.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium">
                          <Send className="w-3.5 h-3.5" /> Reply
                        </button>
                        <button onClick={() => archiveEmail(emailItem.id, !showArchived)}
                          className="flex items-center gap-1.5 text-xs px-3 py-1.5 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors font-medium">
                          {showArchived ? <><ArchiveRestore className="w-3.5 h-3.5" />Restore</> : <><Archive className="w-3.5 h-3.5" />Archive</>}
                        </button>
                        <button onClick={() => deleteEmail(emailItem.id)}
                          className="flex items-center gap-1.5 text-xs px-3 py-1.5 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors font-medium">
                          <Trash2 className="w-3.5 h-3.5" /> Delete
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Preview panel */}
        <div className="bg-white rounded-xl shadow-md p-6">
          {selectedItem ? (
            <div>
              <h3 className="text-lg font-bold text-gray-900 mb-4">Email Details</h3>
              <div className="space-y-3 text-sm">
                <div><p className="text-xs text-gray-400 uppercase font-semibold mb-0.5">From</p><p className="font-medium text-gray-900">{selectedItem.name}</p></div>
                <div><p className="text-xs text-gray-400 uppercase font-semibold mb-0.5">Email</p><p className="text-gray-700">{selectedItem.email}</p></div>
                <div><p className="text-xs text-gray-400 uppercase font-semibold mb-0.5">Company</p><p className="text-gray-700">{selectedItem.company}</p></div>
                <div><p className="text-xs text-gray-400 uppercase font-semibold mb-0.5">Date</p><p className="text-gray-700">{new Date(selectedItem.created_at).toLocaleString()}</p></div>
                <div className="pt-3 border-t border-gray-200">
                  <p className="text-xs text-gray-400 uppercase font-semibold mb-2">Message</p>
                  <p className="text-gray-700 whitespace-pre-wrap leading-relaxed">{selectedItem.message}</p>
                </div>
              </div>
              <button onClick={() => setReplyModal(selectedItem)}
                className="mt-6 w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white py-2.5 rounded-xl font-semibold text-sm transition-colors">
                <Send className="w-4 h-4" /> Reply via Email
              </button>
            </div>
          ) : (
            <div className="text-center text-gray-500 py-8">
              <Mail className="w-8 h-8 text-gray-300 mx-auto mb-2" />
              <p className="text-sm">Select an email to view details</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

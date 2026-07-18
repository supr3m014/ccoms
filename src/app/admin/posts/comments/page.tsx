'use client'

// Comments moderation — visitors submit on /blog/read (status: pending);
// only approved comments show publicly.

import { useState, useEffect } from 'react'
import { collection, query, orderBy, onSnapshot, updateDoc, deleteDoc, doc } from 'firebase/firestore'
import { getDb } from '@/lib/firebase'
import type { BlogComment } from '@/lib/blog'
import { MessageSquare, Check, Ban, Trash2, ExternalLink } from 'lucide-react'

const STATUS_STYLE: Record<string, string> = {
  pending: 'bg-yellow-100 text-yellow-700',
  approved: 'bg-green-100 text-green-700',
  spam: 'bg-red-100 text-red-600',
}

export default function CommentsPage() {
  const [comments, setComments] = useState<BlogComment[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<'all' | 'pending' | 'approved' | 'spam'>('pending')

  useEffect(() => {
    const q = query(collection(getDb(), 'blog_comments'), orderBy('created_at', 'desc'))
    return onSnapshot(q, (snap) => {
      setComments(snap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<BlogComment, 'id'>) })))
      setLoading(false)
    }, () => setLoading(false))
  }, [])

  const setStatus = (id: string, status: BlogComment['status']) =>
    updateDoc(doc(getDb(), 'blog_comments', id), { status })

  const remove = async (id: string) => {
    if (!confirm('Delete this comment permanently?')) return
    await deleteDoc(doc(getDb(), 'blog_comments', id))
  }

  const shown = comments.filter((c) => filter === 'all' || c.status === filter)
  const pendingCount = comments.filter((c) => c.status === 'pending').length

  return (
    <div className="p-8 max-w-4xl">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-1">Comments</h1>
        <p className="text-gray-600 text-sm">
          {comments.length} total{pendingCount > 0 && <span className="text-yellow-600 font-semibold"> · {pendingCount} awaiting review</span>}
        </p>
      </div>

      <div className="mb-4 flex gap-1 bg-gray-100 p-1 rounded-xl w-fit">
        {(['pending', 'approved', 'spam', 'all'] as const).map((f) => (
          <button key={f} onClick={() => setFilter(f)}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold capitalize transition-colors ${filter === f ? 'bg-white shadow text-gray-900' : 'text-gray-500 hover:text-gray-700'}`}>
            {f}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="bg-white rounded-lg shadow-md p-12 text-center text-gray-500">Loading…</div>
      ) : shown.length === 0 ? (
        <div className="bg-white rounded-lg shadow-md p-12 text-center">
          <MessageSquare className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500">
            {comments.length === 0 ? 'No comments yet. They appear here when readers comment on your posts.' : `No ${filter} comments.`}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {shown.map((c) => (
            <div key={c.id} className="bg-white border border-gray-200 rounded-xl p-4">
              <div className="flex items-start justify-between gap-3 mb-2 flex-wrap">
                <div className="min-w-0">
                  <span className="font-semibold text-gray-900 text-sm">{c.name}</span>
                  {c.email && <span className="text-xs text-gray-400 ml-2">{c.email}</span>}
                  <a href={`/blog/read?slug=${c.post_slug}`} target="_blank" rel="noreferrer"
                    className="ml-2 text-xs text-blue-600 inline-flex items-center gap-1">
                    on /{c.post_slug} <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${STATUS_STYLE[c.status]}`}>{c.status}</span>
                  <span className="text-xs text-gray-400">{c.created_at?.toDate().toLocaleString()}</span>
                </div>
              </div>
              <p className="text-sm text-gray-700 whitespace-pre-wrap mb-3">{c.content}</p>
              <div className="flex gap-2">
                {c.status !== 'approved' && (
                  <button onClick={() => setStatus(c.id, 'approved')}
                    className="inline-flex items-center gap-1 text-xs font-semibold text-green-700 bg-green-50 hover:bg-green-100 px-3 py-1.5 rounded-lg">
                    <Check className="w-3.5 h-3.5" /> Approve
                  </button>
                )}
                {c.status !== 'spam' && (
                  <button onClick={() => setStatus(c.id, 'spam')}
                    className="inline-flex items-center gap-1 text-xs font-semibold text-orange-700 bg-orange-50 hover:bg-orange-100 px-3 py-1.5 rounded-lg">
                    <Ban className="w-3.5 h-3.5" /> Spam
                  </button>
                )}
                <button onClick={() => remove(c.id)}
                  className="inline-flex items-center gap-1 text-xs font-semibold text-red-600 bg-red-50 hover:bg-red-100 px-3 py-1.5 rounded-lg">
                  <Trash2 className="w-3.5 h-3.5" /> Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

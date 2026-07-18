'use client'

// All Posts — Firestore-backed (collection: blog_posts). Publishing here makes
// the post live on /blog immediately; edit links use ?id= because dynamic
// route params can't exist in a static export.

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { collection, query, orderBy, onSnapshot, deleteDoc, doc, updateDoc, serverTimestamp } from 'firebase/firestore'
import { getDb } from '@/lib/firebase'
import type { BlogPost } from '@/lib/blog'
import { Plus, Search, Pencil, Trash2, ExternalLink, FileText } from 'lucide-react'

export default function AllPostsPage() {
  const [posts, setPosts] = useState<BlogPost[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<'all' | 'published' | 'draft'>('all')
  const [term, setTerm] = useState('')

  useEffect(() => {
    const q = query(collection(getDb(), 'blog_posts'), orderBy('updated_at', 'desc'))
    return onSnapshot(q, (snap) => {
      setPosts(snap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<BlogPost, 'id'>) })))
      setLoading(false)
    }, () => setLoading(false))
  }, [])

  const remove = async (p: BlogPost) => {
    if (!confirm(`Delete “${p.title}” permanently?`)) return
    await deleteDoc(doc(getDb(), 'blog_posts', p.id))
  }

  const toggleStatus = async (p: BlogPost) => {
    await updateDoc(doc(getDb(), 'blog_posts', p.id), {
      status: p.status === 'published' ? 'draft' : 'published',
      updated_at: serverTimestamp(),
      ...(p.status !== 'published' && !p.published_at && { published_at: serverTimestamp() }),
    })
  }

  const shown = posts
    .filter((p) => filter === 'all' || p.status === filter)
    .filter((p) => !term.trim() || p.title.toLowerCase().includes(term.toLowerCase()) || p.slug.includes(term.toLowerCase()))

  return (
    <div className="p-8">
      <div className="mb-6 flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-1">All Posts</h1>
          <p className="text-gray-600 text-sm">{posts.length} post{posts.length !== 1 ? 's' : ''} · {posts.filter(p => p.status === 'published').length} published</p>
        </div>
        <Link href="/admin/posts/new"
          className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded-lg font-semibold text-sm">
          <Plus className="w-4 h-4" /> Create New Post
        </Link>
      </div>

      <div className="mb-4 flex items-center gap-3 flex-wrap">
        <div className="flex gap-1 bg-gray-100 p-1 rounded-xl w-fit">
          {(['all', 'published', 'draft'] as const).map((f) => (
            <button key={f} onClick={() => setFilter(f)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold capitalize transition-colors ${filter === f ? 'bg-white shadow text-gray-900' : 'text-gray-500 hover:text-gray-700'}`}>
              {f}
            </button>
          ))}
        </div>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input value={term} onChange={(e) => setTerm(e.target.value)} placeholder="Search posts…"
            className="pl-9 pr-3 py-2 rounded-lg border border-gray-200 text-sm focus:border-gray-400 outline-none w-64" />
        </div>
      </div>

      {loading ? (
        <div className="bg-white rounded-lg shadow-md p-12 text-center text-gray-500">Loading…</div>
      ) : shown.length === 0 ? (
        <div className="bg-white rounded-lg shadow-md p-12 text-center">
          <FileText className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500">{posts.length === 0 ? 'No posts yet — write your first one.' : 'Nothing matches the filter.'}</p>
        </div>
      ) : (
        <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-600">TITLE</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-600">STATUS</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-600 hidden md:table-cell">CATEGORIES</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-600 hidden md:table-cell">UPDATED</th>
                <th className="text-right px-4 py-3 text-xs font-semibold text-gray-600">ACTIONS</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {shown.map((p) => (
                <tr key={p.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3">
                    <Link href={`/admin/posts/edit?id=${p.id}`} className="font-medium text-gray-900 hover:text-blue-600">{p.title}</Link>
                    <p className="text-xs text-gray-400 font-mono">/{p.slug}</p>
                  </td>
                  <td className="px-4 py-3">
                    <button onClick={() => toggleStatus(p)} title="Click to toggle publish state"
                      className={`text-xs px-2 py-0.5 rounded-full font-medium ${p.status === 'published' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>
                      {p.status}
                    </button>
                  </td>
                  <td className="px-4 py-3 hidden md:table-cell text-xs text-gray-500">{(p.categories || []).join(', ') || '—'}</td>
                  <td className="px-4 py-3 hidden md:table-cell text-xs text-gray-500">{p.updated_at?.toDate().toLocaleDateString()}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-1">
                      {p.status === 'published' && (
                        <a href={`/blog/read?slug=${p.slug}`} target="_blank" rel="noreferrer" title="View live"
                          className="p-1.5 rounded hover:bg-gray-100 text-gray-500"><ExternalLink className="w-4 h-4" /></a>
                      )}
                      <Link href={`/admin/posts/edit?id=${p.id}`} title="Edit"
                        className="p-1.5 rounded hover:bg-gray-100 text-gray-500"><Pencil className="w-4 h-4" /></Link>
                      <button onClick={() => remove(p)} title="Delete"
                        className="p-1.5 rounded hover:bg-red-50 text-red-400 hover:text-red-600"><Trash2 className="w-4 h-4" /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}

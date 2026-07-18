'use client'

// Shared manager for blog categories and tags — one list field each on the
// blog_config/taxonomy doc. Renaming or deleting also updates every post that
// uses the term, so posts and pickers can never drift apart.

import { useState, useEffect } from 'react'
import {
  doc, getDoc, setDoc, collection, getDocs, query, where, writeBatch,
} from 'firebase/firestore'
import { getDb } from '@/lib/firebase'
import { TAXONOMY_DOC } from '@/components/admin/PostEditor'
import { Plus, Pencil, Trash2, Check, X, FolderOpen, Tag as TagIcon } from 'lucide-react'

interface Props {
  kind: 'categories' | 'tags'
}

export default function TaxonomyManager({ kind }: Props) {
  const singular = kind === 'categories' ? 'category' : 'tag'
  const Icon = kind === 'categories' ? FolderOpen : TagIcon

  const [items, setItems] = useState<string[]>([])
  const [counts, setCounts] = useState<Record<string, number>>({})
  const [loading, setLoading] = useState(true)
  const [busy, setBusy] = useState(false)
  const [statusMsg, setStatusMsg] = useState('')
  const [newName, setNewName] = useState('')
  const [editing, setEditing] = useState<string | null>(null)
  const [editValue, setEditValue] = useState('')

  const load = async () => {
    try {
      const snap = await getDoc(doc(getDb(), ...TAXONOMY_DOC))
      const list: string[] = snap.exists() && Array.isArray(snap.data()[kind]) ? snap.data()[kind] : []
      setItems(list)
      // usage counts across all posts
      const posts = await getDocs(collection(getDb(), 'blog_posts'))
      const c: Record<string, number> = {}
      posts.docs.forEach((d) => {
        for (const v of (d.data()[kind] as string[]) || []) c[v] = (c[v] || 0) + 1
      })
      setCounts(c)
    } catch (err) { console.error(err); setStatusMsg(`Could not load ${kind}.`) }
    setLoading(false)
  }
  useEffect(() => { load() }, [])

  const persist = async (list: string[]) => {
    await setDoc(doc(getDb(), ...TAXONOMY_DOC), { [kind]: list.sort() }, { merge: true })
    setItems(list.sort())
  }

  const add = async () => {
    const v = newName.trim()
    if (!v || items.includes(v)) { setNewName(''); return }
    setBusy(true)
    try { await persist([...items, v]); setNewName('') }
    catch { setStatusMsg('Save failed.') }
    setBusy(false)
  }

  /** Update the term inside every post that carries it. */
  const retagPosts = async (from: string, to: string | null) => {
    const snap = await getDocs(query(collection(getDb(), 'blog_posts'), where(kind, 'array-contains', from)))
    const batch = writeBatch(getDb())
    snap.docs.forEach((d) => {
      const cur: string[] = (d.data()[kind] as string[]) || []
      const next = cur.filter((x) => x !== from)
      if (to && !next.includes(to)) next.push(to)
      batch.update(d.ref, { [kind]: next })
    })
    await batch.commit()
    return snap.size
  }

  const saveRename = async () => {
    const from = editing!
    const to = editValue.trim()
    if (!to || to === from) { setEditing(null); return }
    setBusy(true)
    try {
      const touched = await retagPosts(from, to)
      await persist([...items.filter((x) => x !== from), to])
      setStatusMsg(`Renamed “${from}” to “${to}” (${touched} post${touched === 1 ? '' : 's'} updated).`)
    } catch { setStatusMsg('Rename failed.') }
    setEditing(null); setBusy(false)
    load()
  }

  const remove = async (name: string) => {
    const used = counts[name] || 0
    if (!confirm(used ? `Delete “${name}”? It will be removed from ${used} post${used === 1 ? '' : 's'}.` : `Delete “${name}”?`)) return
    setBusy(true)
    try {
      await retagPosts(name, null)
      await persist(items.filter((x) => x !== name))
      setStatusMsg(`Deleted “${name}”.`)
    } catch { setStatusMsg('Delete failed.') }
    setBusy(false)
    load()
  }

  return (
    <div className="p-8 max-w-3xl">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-1 capitalize">{kind}</h1>
        <p className="text-gray-600 text-sm">Organize your blog posts. Renames and deletes update every post automatically.</p>
      </div>

      {statusMsg && <p className="mb-4 text-sm text-gray-600">{statusMsg}</p>}

      <div className="mb-5 flex gap-2 max-w-md">
        <input value={newName} onChange={(e) => setNewName(e.target.value)}
          onKeyDown={(e) => { if (e.key === 'Enter') add() }}
          placeholder={`New ${singular} name`}
          className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
        <button onClick={add} disabled={busy || !newName.trim()}
          className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white px-4 py-2 rounded-lg font-semibold text-sm">
          <Plus className="w-4 h-4" /> Add
        </button>
      </div>

      {loading ? (
        <div className="bg-white rounded-lg shadow-md p-12 text-center text-gray-500">Loading…</div>
      ) : items.length === 0 ? (
        <div className="bg-white rounded-lg shadow-md p-12 text-center">
          <Icon className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500">No {kind} yet.</p>
        </div>
      ) : (
        <div className="bg-white border border-gray-200 rounded-xl divide-y divide-gray-100">
          {items.map((name) => (
            <div key={name} className="flex items-center gap-3 px-4 py-3">
              <Icon className="w-4 h-4 text-gray-400 shrink-0" />
              {editing === name ? (
                <>
                  <input value={editValue} onChange={(e) => setEditValue(e.target.value)} autoFocus
                    onKeyDown={(e) => { if (e.key === 'Enter') saveRename(); if (e.key === 'Escape') setEditing(null) }}
                    className="flex-1 px-3 py-1.5 border border-blue-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                  <button onClick={saveRename} disabled={busy} className="p-1.5 text-green-600 hover:bg-green-50 rounded"><Check className="w-4 h-4" /></button>
                  <button onClick={() => setEditing(null)} className="p-1.5 text-gray-400 hover:bg-gray-100 rounded"><X className="w-4 h-4" /></button>
                </>
              ) : (
                <>
                  <span className="flex-1 font-medium text-gray-900 text-sm">{name}</span>
                  <span className="text-xs text-gray-400">{counts[name] || 0} post{(counts[name] || 0) === 1 ? '' : 's'}</span>
                  <button onClick={() => { setEditing(name); setEditValue(name) }} className="p-1.5 text-gray-400 hover:bg-gray-100 rounded"><Pencil className="w-4 h-4" /></button>
                  <button onClick={() => remove(name)} disabled={busy} className="p-1.5 text-red-400 hover:bg-red-50 rounded"><Trash2 className="w-4 h-4" /></button>
                </>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

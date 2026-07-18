'use client'

// Backup / Restore — exports every business collection (including message
// subcollections) to a JSON file on your computer, and restores from one.
// Restore merges by document ID: existing docs are overwritten, docs that
// only exist in the database are left alone.

import { useState } from 'react'
import {
  collection, getDocs, doc, setDoc, Timestamp,
} from 'firebase/firestore'
import { getDb } from '@/lib/firebase'
import { DatabaseBackup, Download, Upload, Loader2, AlertTriangle, CheckCircle2 } from 'lucide-react'

// Every collection the panel owns. Subcollections are walked per parent doc.
const COLLECTIONS: { name: string; sub?: string }[] = [
  { name: 'leads' },
  { name: 'clients' },
  { name: 'orders' },
  { name: 'payments' },
  { name: 'client_files' },
  { name: 'client_messages', sub: 'messages' },
  { name: 'tickets', sub: 'messages' },
  { name: 'chat_sessions', sub: 'messages' },
  { name: 'contact_submissions' },
  { name: 'blog_posts' },
  { name: 'blog_comments' },
  { name: 'blog_config' },
  { name: 'media' },
  { name: 'support_config' },
  { name: 'seo_config' },
  { name: 'redirects' },
]

// Timestamps survive the JSON round-trip as { __ts: millis }.
const serialize = (v: unknown): unknown => {
  if (v instanceof Timestamp) return { __ts: v.toMillis() }
  if (Array.isArray(v)) return v.map(serialize)
  if (v && typeof v === 'object') {
    return Object.fromEntries(Object.entries(v as Record<string, unknown>).map(([k, x]) => [k, serialize(x)]))
  }
  return v
}
const deserialize = (v: unknown): unknown => {
  if (v && typeof v === 'object') {
    const o = v as Record<string, unknown>
    if (typeof o.__ts === 'number' && Object.keys(o).length === 1) return Timestamp.fromMillis(o.__ts)
    if (Array.isArray(v)) return v.map(deserialize)
    return Object.fromEntries(Object.entries(o).map(([k, x]) => [k, deserialize(x)]))
  }
  return v
}

interface BackupShape {
  version: 1
  exported_at: string
  collections: Record<string, Record<string, { data: Record<string, unknown>; sub?: Record<string, Record<string, unknown>> }>>
}

export default function ToolsPage() {
  const [working, setWorking] = useState<'backup' | 'restore' | null>(null)
  const [progress, setProgress] = useState('')
  const [result, setResult] = useState<{ ok: boolean; text: string } | null>(null)

  const backup = async () => {
    setWorking('backup'); setResult(null)
    try {
      const db = getDb()
      const out: BackupShape = { version: 1, exported_at: new Date().toISOString(), collections: {} }
      let docs = 0
      for (const c of COLLECTIONS) {
        setProgress(`Reading ${c.name}…`)
        const snap = await getDocs(collection(db, c.name))
        out.collections[c.name] = {}
        for (const d of snap.docs) {
          const entry: BackupShape['collections'][string][string] = { data: serialize(d.data()) as Record<string, unknown> }
          if (c.sub) {
            const subSnap = await getDocs(collection(db, c.name, d.id, c.sub))
            if (!subSnap.empty) {
              entry.sub = {}
              for (const s of subSnap.docs) { entry.sub[s.id] = serialize(s.data()) as Record<string, unknown>; docs++ }
            }
          }
          out.collections[c.name][d.id] = entry
          docs++
        }
      }
      const blob = new Blob([JSON.stringify(out)], { type: 'application/json' })
      const a = document.createElement('a')
      a.href = URL.createObjectURL(blob)
      a.download = `ccoms-backup-${new Date().toISOString().split('T')[0]}.json`
      a.click()
      URL.revokeObjectURL(a.href)
      setResult({ ok: true, text: `Backup downloaded — ${docs} documents across ${COLLECTIONS.length} collections.` })
    } catch (err) {
      console.error(err)
      setResult({ ok: false, text: 'Backup failed — please try again.' })
    }
    setWorking(null); setProgress('')
  }

  const restore = async (file: File) => {
    if (!confirm(`Restore from “${file.name}”?\n\nDocuments in the backup will OVERWRITE current documents with the same ID. Nothing is deleted.`)) return
    setWorking('restore'); setResult(null)
    try {
      const parsed = JSON.parse(await file.text()) as BackupShape
      if (parsed.version !== 1 || !parsed.collections) throw new Error('not a ccoms backup')
      const db = getDb()
      let docs = 0
      for (const [name, entries] of Object.entries(parsed.collections)) {
        setProgress(`Restoring ${name}…`)
        for (const [id, entry] of Object.entries(entries)) {
          await setDoc(doc(db, name, id), deserialize(entry.data) as Record<string, unknown>, { merge: false })
          docs++
          const subName = COLLECTIONS.find((c) => c.name === name)?.sub
          if (entry.sub && subName) {
            for (const [sid, sdata] of Object.entries(entry.sub)) {
              await setDoc(doc(db, name, id, subName, sid), deserialize(sdata) as Record<string, unknown>, { merge: false })
              docs++
            }
          }
        }
      }
      setResult({ ok: true, text: `Restored ${docs} documents from ${file.name} (exported ${parsed.exported_at?.split('T')[0]}).` })
    } catch (err) {
      console.error(err)
      setResult({ ok: false, text: 'Restore failed — is this a backup file made by this page?' })
    }
    setWorking(null); setProgress('')
  }

  return (
    <div className="p-8 max-w-2xl">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-1">Backup / Restore</h1>
        <p className="text-gray-600 text-sm">Everything in the panel — leads, clients, support, blog, SEO settings — in one file.</p>
      </div>

      {result && (
        <div className={`mb-4 rounded-xl border p-4 text-sm flex items-start gap-2 ${result.ok ? 'bg-green-50 border-green-200 text-green-800' : 'bg-red-50 border-red-200 text-red-700'}`}>
          {result.ok ? <CheckCircle2 className="w-4 h-4 mt-0.5 shrink-0" /> : <AlertTriangle className="w-4 h-4 mt-0.5 shrink-0" />}
          {result.text}
        </div>
      )}

      <div className="bg-white border border-gray-200 rounded-xl p-6 mb-4">
        <h3 className="font-semibold text-gray-900 mb-1 flex items-center gap-2"><DatabaseBackup className="w-4 h-4 text-blue-600" /> Download a backup</h3>
        <p className="text-xs text-gray-500 mb-4">Saves a JSON file to your computer. Do this before big changes, or on a schedule you trust.</p>
        <button onClick={backup} disabled={working !== null}
          className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white px-5 py-2.5 rounded-lg font-semibold text-sm">
          {working === 'backup' ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
          {working === 'backup' ? progress || 'Backing up…' : 'Download Backup'}
        </button>
      </div>

      <div className="bg-white border border-gray-200 rounded-xl p-6">
        <h3 className="font-semibold text-gray-900 mb-1 flex items-center gap-2"><Upload className="w-4 h-4 text-orange-500" /> Restore from a backup</h3>
        <p className="text-xs text-gray-500 mb-4">
          Overwrites documents with the same ID; never deletes anything extra. Media files themselves (images, uploads) live in Storage and are not part of this file.
        </p>
        <label className={`inline-flex items-center gap-2 border border-gray-300 hover:bg-gray-50 text-gray-700 px-5 py-2.5 rounded-lg font-semibold text-sm cursor-pointer ${working ? 'opacity-50 pointer-events-none' : ''}`}>
          {working === 'restore' ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
          {working === 'restore' ? progress || 'Restoring…' : 'Choose backup file…'}
          <input type="file" accept="application/json" className="hidden"
            onChange={(e) => { if (e.target.files?.[0]) restore(e.target.files[0]); e.target.value = '' }} />
        </label>
      </div>
    </div>
  )
}

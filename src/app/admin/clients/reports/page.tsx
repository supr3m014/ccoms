'use client'

// Reports & Files — per-client documents (reports, materials, invoices) in
// Firebase Storage under client_files/<clientId>/, indexed in Firestore.
// This is the admin side of the portal blueprint's Material Vault.

import { useState, useEffect, useRef } from 'react'
import {
  collection, query, orderBy, onSnapshot, addDoc, deleteDoc, doc, serverTimestamp,
} from 'firebase/firestore'
import { ref, uploadBytesResumable, getDownloadURL, deleteObject } from 'firebase/storage'
import { getDb, getStorageClient } from '@/lib/firebase'
import { fetchClients, type Client, type ClientFile } from '@/lib/clients'
import { isBucketMissing, formatBytes } from '@/lib/media'
import StorageSetupNotice from '@/components/admin/StorageSetupNotice'
import { UploadCloud, FolderOpen, Trash2, Download, Loader2, FileText } from 'lucide-react'

const CATEGORIES = ['report', 'material', 'invoice', 'other'] as const

export default function ReportsFilesPage() {
  const [clients, setClients] = useState<Client[]>([])
  const [files, setFiles] = useState<ClientFile[]>([])
  const [loading, setLoading] = useState(true)
  const [needsSetup, setNeedsSetup] = useState(false)
  const [clientFilter, setClientFilter] = useState('')
  const [uploadClient, setUploadClient] = useState('')
  const [uploadCategory, setUploadCategory] = useState<ClientFile['category']>('report')
  const [uploadPct, setUploadPct] = useState<number | null>(null)
  const [notice, setNotice] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    fetchClients().then((cs) => setClients(cs.filter((c) => c.status !== 'archived'))).catch(() => {})
    const q = query(collection(getDb(), 'client_files'), orderBy('created_at', 'desc'))
    return onSnapshot(q, (snap) => {
      setFiles(snap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<ClientFile, 'id'>) })))
      setLoading(false)
    }, () => setLoading(false))
  }, [])

  const upload = (file: File) => {
    const client = clients.find((c) => c.id === uploadClient)
    if (!client) { setNotice('Pick which client this file belongs to first.'); return }
    setNotice(''); setUploadPct(0)
    const clean = file.name.replace(/[^\w.\-]+/g, '_')
    const path = `client_files/${client.id}/${Date.now()}-${clean}`
    const task = uploadBytesResumable(ref(getStorageClient(), path), file, { contentType: file.type })
    task.on('state_changed',
      (s) => setUploadPct(Math.round((s.bytesTransferred / s.totalBytes) * 100)),
      (err) => { if (isBucketMissing(err)) setNeedsSetup(true); else setNotice('Upload failed — please try again.'); setUploadPct(null) },
      async () => {
        const url = await getDownloadURL(task.snapshot.ref)
        await addDoc(collection(getDb(), 'client_files'), {
          client_id: client.id, client_name: client.name,
          filename: file.name, category: uploadCategory, path, url,
          size: file.size, created_at: serverTimestamp(),
        })
        setUploadPct(null)
        setNotice(`Uploaded ${file.name} for ${client.name}.`)
      })
  }

  const remove = async (f: ClientFile) => {
    if (!confirm(`Delete “${f.filename}” (${f.client_name})?`)) return
    try { await deleteObject(ref(getStorageClient(), f.path)) } catch { /* doc cleanup still matters */ }
    await deleteDoc(doc(getDb(), 'client_files', f.id))
  }

  const shown = clientFilter ? files.filter((f) => f.client_id === clientFilter) : files

  return (
    <div className="p-8 max-w-5xl">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-1">Reports &amp; Files</h1>
        <p className="text-gray-600 text-sm">Deliverables, reports and invoices per client — the future client portal reads this same vault.</p>
      </div>

      {needsSetup ? <StorageSetupNotice /> : (
        <>
          <div className="bg-white border border-gray-200 rounded-xl p-5 mb-6">
            <h3 className="font-semibold text-gray-900 mb-3">Upload a file</h3>
            <div className="flex items-center gap-3 flex-wrap">
              <select value={uploadClient} onChange={(e) => setUploadClient(e.target.value)}
                className="border border-gray-200 rounded-lg px-3 py-2 text-sm bg-white">
                <option value="">For which client? *</option>
                {clients.map((c) => <option key={c.id} value={c.id}>{c.name} ({c.client_number})</option>)}
              </select>
              <select value={uploadCategory} onChange={(e) => setUploadCategory(e.target.value as ClientFile['category'])}
                className="border border-gray-200 rounded-lg px-3 py-2 text-sm bg-white capitalize">
                {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
              <button onClick={() => inputRef.current?.click()} disabled={uploadPct !== null}
                className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white px-4 py-2 rounded-lg font-semibold text-sm">
                {uploadPct !== null ? <><Loader2 className="w-4 h-4 animate-spin" /> {uploadPct}%</> : <><UploadCloud className="w-4 h-4" /> Choose file</>}
              </button>
              <input ref={inputRef} type="file" className="hidden"
                onChange={(e) => { if (e.target.files?.[0]) upload(e.target.files[0]); e.target.value = '' }} />
            </div>
            {notice && <p className="mt-3 text-sm text-gray-600">{notice}</p>}
          </div>

          <div className="mb-4 flex items-center gap-3">
            <select value={clientFilter} onChange={(e) => setClientFilter(e.target.value)}
              className="border border-gray-200 rounded-lg px-3 py-2 text-sm bg-white">
              <option value="">All clients</option>
              {clients.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
            <span className="text-xs text-gray-400">{shown.length} file{shown.length !== 1 ? 's' : ''}</span>
          </div>

          {loading ? (
            <div className="bg-white rounded-lg shadow-md p-12 text-center text-gray-500">Loading…</div>
          ) : shown.length === 0 ? (
            <div className="bg-white rounded-lg shadow-md p-12 text-center">
              <FolderOpen className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500">No files yet.</p>
            </div>
          ) : (
            <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-gray-600">FILE</th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-gray-600">CLIENT</th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-gray-600 hidden md:table-cell">CATEGORY</th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-gray-600 hidden md:table-cell">SIZE</th>
                    <th className="text-right px-4 py-3 text-xs font-semibold text-gray-600">ACTIONS</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {shown.map((f) => (
                    <tr key={f.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3">
                        <p className="font-medium text-gray-900 flex items-center gap-2"><FileText className="w-4 h-4 text-gray-300 shrink-0" />{f.filename}</p>
                        <p className="text-xs text-gray-400 ml-6">{f.created_at?.toDate().toLocaleDateString()}</p>
                      </td>
                      <td className="px-4 py-3 text-xs text-gray-600">{f.client_name}</td>
                      <td className="px-4 py-3 hidden md:table-cell">
                        <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full capitalize">{f.category}</span>
                      </td>
                      <td className="px-4 py-3 hidden md:table-cell text-xs text-gray-500">{formatBytes(f.size)}</td>
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-end gap-1">
                          <a href={f.url} target="_blank" rel="noreferrer" title="Download"
                            className="p-1.5 rounded hover:bg-gray-100 text-gray-500"><Download className="w-4 h-4" /></a>
                          <button onClick={() => remove(f)} title="Delete"
                            className="p-1.5 rounded hover:bg-red-50 text-red-400 hover:text-red-600"><Trash2 className="w-4 h-4" /></button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}
    </div>
  )
}

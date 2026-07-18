'use client'

// Add Media — drag & drop (or pick) multiple files; uploads go to Firebase
// Storage with live progress, and each finished file gets a `media` doc so
// the Library can list it. This route used to 404 — it now exists for real.

import { useState, useRef, useCallback } from 'react'
import Link from 'next/link'
import { uploadMedia, formatBytes, isBucketMissing } from '@/lib/media'
import StorageSetupNotice from '@/components/admin/StorageSetupNotice'
import { UploadCloud, CheckCircle2, AlertCircle, Copy, Check, ArrowLeft, Loader2 } from 'lucide-react'

interface UploadRow {
  key: string
  name: string
  size: number
  pct: number
  status: 'uploading' | 'done' | 'error'
  url?: string
  error?: string
}

const MAX_MB = 25

export default function AddMediaPage() {
  const [rows, setRows] = useState<UploadRow[]>([])
  const [dragOver, setDragOver] = useState(false)
  const [needsSetup, setNeedsSetup] = useState(false)
  const [copied, setCopied] = useState<string | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const patch = (key: string, p: Partial<UploadRow>) =>
    setRows((rs) => rs.map((r) => (r.key === key ? { ...r, ...p } : r)))

  const startUploads = useCallback((files: FileList | File[]) => {
    for (const file of Array.from(files)) {
      const key = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
      if (file.size > MAX_MB * 1024 * 1024) {
        setRows((rs) => [{ key, name: file.name, size: file.size, pct: 0, status: 'error', error: `Over the ${MAX_MB} MB limit` }, ...rs])
        continue
      }
      setRows((rs) => [{ key, name: file.name, size: file.size, pct: 0, status: 'uploading' }, ...rs])
      const { done } = uploadMedia(file, (pct) => patch(key, { pct }))
      done
        .then((item) => patch(key, { status: 'done', pct: 100, url: item.url }))
        .catch((err) => {
          if (isBucketMissing(err)) setNeedsSetup(true)
          patch(key, { status: 'error', error: 'Upload failed' })
        })
    }
  }, [])

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setDragOver(false)
    if (e.dataTransfer.files?.length) startUploads(e.dataTransfer.files)
  }

  const copyUrl = async (row: UploadRow) => {
    if (!row.url) return
    await navigator.clipboard.writeText(row.url)
    setCopied(row.key)
    setTimeout(() => setCopied(null), 1500)
  }

  return (
    <div className="p-8 max-w-3xl">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-1">Add Media</h1>
        <p className="text-gray-600 text-sm">Upload images and files, then copy their URLs for posts, featured images, or OG images.</p>
      </div>

      {needsSetup ? (
        <StorageSetupNotice />
      ) : (
        <>
          <div
            onDragOver={(e) => { e.preventDefault(); setDragOver(true) }}
            onDragLeave={() => setDragOver(false)}
            onDrop={onDrop}
            onClick={() => inputRef.current?.click()}
            className={`cursor-pointer border-2 border-dashed rounded-2xl p-12 text-center transition-colors ${dragOver ? 'border-blue-500 bg-blue-50' : 'border-gray-300 bg-white hover:border-blue-400 hover:bg-blue-50/40'}`}
          >
            <UploadCloud className={`w-12 h-12 mx-auto mb-3 ${dragOver ? 'text-blue-500' : 'text-gray-300'}`} />
            <p className="font-semibold text-gray-900">Drop files here, or click to choose</p>
            <p className="text-sm text-gray-500 mt-1">Images, PDFs, videos — up to {MAX_MB} MB each</p>
            <input ref={inputRef} type="file" multiple className="hidden"
              onChange={(e) => { if (e.target.files?.length) startUploads(e.target.files); e.target.value = '' }} />
          </div>

          {rows.length > 0 && (
            <div className="mt-6 space-y-2">
              {rows.map((r) => (
                <div key={r.key} className="bg-white border border-gray-200 rounded-xl px-4 py-3">
                  <div className="flex items-center gap-3">
                    {r.status === 'uploading' && <Loader2 className="w-4 h-4 text-blue-500 animate-spin shrink-0" />}
                    {r.status === 'done' && <CheckCircle2 className="w-4 h-4 text-green-600 shrink-0" />}
                    {r.status === 'error' && <AlertCircle className="w-4 h-4 text-red-500 shrink-0" />}
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium text-gray-900 truncate">{r.name}</p>
                      <p className="text-xs text-gray-400">{formatBytes(r.size)}{r.error ? ` — ${r.error}` : ''}</p>
                    </div>
                    {r.status === 'done' && (
                      <button onClick={() => copyUrl(r)}
                        className="inline-flex items-center gap-1 border border-gray-200 hover:bg-gray-50 rounded px-2.5 py-1.5 text-xs font-semibold text-gray-600 shrink-0">
                        {copied === r.key ? <><Check className="w-3.5 h-3.5 text-green-600" /> Copied</> : <><Copy className="w-3.5 h-3.5" /> Copy URL</>}
                      </button>
                    )}
                    {r.status === 'uploading' && <span className="text-xs text-gray-500 shrink-0">{r.pct}%</span>}
                  </div>
                  {r.status === 'uploading' && (
                    <div className="mt-2 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                      <div className="h-full bg-blue-500 rounded-full transition-all" style={{ width: `${r.pct}%` }} />
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          <Link href="/admin/media" className="mt-6 inline-flex items-center gap-2 text-sm text-blue-600 font-semibold">
            <ArrowLeft className="w-4 h-4" /> Back to Media Library
          </Link>
        </>
      )}
    </div>
  )
}

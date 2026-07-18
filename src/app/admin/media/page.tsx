'use client'

// Media Library — Firebase Storage + Firestore `media` docs. Upload lives at
// /admin/media/upload; here you browse, copy URLs (for posts, featured
// images, OG images) and delete.

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { listMedia, deleteMedia, isImage, formatBytes, isBucketMissing, type MediaItem } from '@/lib/media'
import StorageSetupNotice from '@/components/admin/StorageSetupNotice'
import { Grid3x3, List, Upload, Search, FileText, Copy, Trash2, Check } from 'lucide-react'

export default function MediaLibraryPage() {
  const [media, setMedia] = useState<MediaItem[]>([])
  const [loading, setLoading] = useState(true)
  const [needsSetup, setNeedsSetup] = useState(false)
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [filter, setFilter] = useState<'all' | 'images' | 'files'>('all')
  const [term, setTerm] = useState('')
  const [copied, setCopied] = useState<string | null>(null)

  const load = () =>
    listMedia()
      .then((items) => { setMedia(items); setLoading(false) })
      .catch((err) => { if (isBucketMissing(err)) setNeedsSetup(true); setLoading(false) })

  useEffect(() => { load() }, [])

  const copyUrl = async (m: MediaItem) => {
    await navigator.clipboard.writeText(m.url)
    setCopied(m.id)
    setTimeout(() => setCopied(null), 1500)
  }

  const remove = async (m: MediaItem) => {
    if (!confirm(`Delete “${m.filename}”? Anywhere it is used will show a broken link.`)) return
    await deleteMedia(m)
    load()
  }

  const shown = media
    .filter((m) => filter === 'all' || (filter === 'images' ? isImage(m) : !isImage(m)))
    .filter((m) => !term.trim() || m.filename.toLowerCase().includes(term.toLowerCase()))

  return (
    <div className="p-8">
      <div className="mb-6 flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-1">Media Library</h1>
          <p className="text-gray-600 text-sm">{media.length} file{media.length !== 1 ? 's' : ''} · copy a URL to use it in posts or SEO images</p>
        </div>
        <Link href="/admin/media/upload"
          className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded-lg font-semibold text-sm">
          <Upload className="w-4 h-4" /> Add Media
        </Link>
      </div>

      <div className="mb-4 flex items-center gap-3 flex-wrap">
        <div className="flex gap-1 bg-gray-100 p-1 rounded-xl w-fit">
          {(['all', 'images', 'files'] as const).map((f) => (
            <button key={f} onClick={() => setFilter(f)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold capitalize transition-colors ${filter === f ? 'bg-white shadow text-gray-900' : 'text-gray-500 hover:text-gray-700'}`}>
              {f}
            </button>
          ))}
        </div>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input value={term} onChange={(e) => setTerm(e.target.value)} placeholder="Search files…"
            className="pl-9 pr-3 py-2 rounded-lg border border-gray-200 text-sm focus:border-gray-400 outline-none w-64" />
        </div>
        <div className="ml-auto flex gap-1 bg-gray-100 p-1 rounded-xl">
          <button onClick={() => setViewMode('grid')} className={`px-3 py-1.5 rounded-lg ${viewMode === 'grid' ? 'bg-white shadow' : ''}`}><Grid3x3 className="w-4 h-4 text-gray-600" /></button>
          <button onClick={() => setViewMode('list')} className={`px-3 py-1.5 rounded-lg ${viewMode === 'list' ? 'bg-white shadow' : ''}`}><List className="w-4 h-4 text-gray-600" /></button>
        </div>
      </div>

      {needsSetup ? (
        <StorageSetupNotice />
      ) : loading ? (
        <div className="bg-white rounded-lg shadow-md p-12 text-center text-gray-500">Loading…</div>
      ) : shown.length === 0 ? (
        <div className="bg-white rounded-lg shadow-md p-12 text-center">
          <FileText className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500">{media.length === 0 ? 'No files yet — upload your first.' : 'Nothing matches the filter.'}</p>
        </div>
      ) : viewMode === 'grid' ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          {shown.map((m) => (
            <div key={m.id} className="group bg-white border border-gray-200 rounded-xl overflow-hidden">
              <div className="h-32 bg-gray-50 flex items-center justify-center overflow-hidden">
                {isImage(m)
                  ? <img src={m.url} alt={m.filename} className="w-full h-full object-cover" loading="lazy" />
                  : <FileText className="w-10 h-10 text-gray-300" />}
              </div>
              <div className="p-3">
                <p className="text-xs font-medium text-gray-900 truncate" title={m.filename}>{m.filename}</p>
                <p className="text-[11px] text-gray-400">{formatBytes(m.size)}</p>
                <div className="mt-2 flex gap-1">
                  <button onClick={() => copyUrl(m)} title="Copy URL"
                    className="flex-1 inline-flex items-center justify-center gap-1 border border-gray-200 hover:bg-gray-50 rounded px-2 py-1 text-[11px] font-semibold text-gray-600">
                    {copied === m.id ? <><Check className="w-3 h-3 text-green-600" /> Copied</> : <><Copy className="w-3 h-3" /> Copy URL</>}
                  </button>
                  <button onClick={() => remove(m)} title="Delete"
                    className="border border-gray-200 hover:bg-red-50 rounded px-2 py-1 text-red-400 hover:text-red-600"><Trash2 className="w-3 h-3" /></button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-600">FILE</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-600">TYPE</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-600">SIZE</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-600">UPLOADED</th>
                <th className="text-right px-4 py-3 text-xs font-semibold text-gray-600">ACTIONS</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {shown.map((m) => (
                <tr key={m.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3">
                    <a href={m.url} target="_blank" rel="noreferrer" className="font-medium text-gray-900 hover:text-blue-600">{m.filename}</a>
                  </td>
                  <td className="px-4 py-3 text-xs text-gray-500">{m.contentType}</td>
                  <td className="px-4 py-3 text-xs text-gray-500">{formatBytes(m.size)}</td>
                  <td className="px-4 py-3 text-xs text-gray-500">{m.created_at?.toDate().toLocaleDateString()}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-1">
                      <button onClick={() => copyUrl(m)} className="p-1.5 rounded hover:bg-gray-100 text-gray-500" title="Copy URL">
                        {copied === m.id ? <Check className="w-4 h-4 text-green-600" /> : <Copy className="w-4 h-4" />}
                      </button>
                      <button onClick={() => remove(m)} className="p-1.5 rounded hover:bg-red-50 text-red-400 hover:text-red-600" title="Delete"><Trash2 className="w-4 h-4" /></button>
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

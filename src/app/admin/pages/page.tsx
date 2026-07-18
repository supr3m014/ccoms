'use client'

// All Pages — the REAL pages of ccoms.ph (they are code, not CMS entries),
// with live SEO state from Firestore and quick actions. This replaced a
// WordPress-style page CMS that wrote to a table nothing ever read.

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { doc, getDoc } from 'firebase/firestore'
import { getDb } from '@/lib/firebase'
import { effectiveNoindex, type MetaOverride } from '@/lib/seo-routes'
import { ALL_ROUTES, PAGE_SEO } from '@/lib/seo-pages'
import { ExternalLink, Pencil, EyeOff, Search, Layers, Braces } from 'lucide-react'

export default function AllPagesPage() {
  const [overrides, setOverrides] = useState<Record<string, MetaOverride>>({})
  const [term, setTerm] = useState('')

  useEffect(() => {
    getDoc(doc(getDb(), 'seo_config', 'meta'))
      .then((snap) => setOverrides((snap.exists() ? snap.data().pages : {}) || {}))
      .catch(() => {})
  }, [])

  const shown = ALL_ROUTES.filter((r) => {
    const t = term.trim().toLowerCase()
    return !t || r.label.toLowerCase().includes(t) || r.path.toLowerCase().includes(t)
  })

  return (
    <div className="p-8 max-w-5xl">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-1">All Pages</h1>
        <p className="text-gray-600 text-sm">
          Every page of ccoms.ph with its live SEO state. Titles, descriptions and indexing are tuned in the{' '}
          <Link href="/admin/seo/meta" className="text-blue-600 font-semibold">Meta Editor</Link>; new pages are built as part of the site itself.
        </p>
      </div>

      <div className="mb-4 relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input value={term} onChange={(e) => setTerm(e.target.value)} placeholder="Search pages…"
          className="w-full pl-9 pr-3 py-2 rounded-lg border border-gray-200 text-sm focus:border-gray-400 outline-none" />
      </div>

      <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="text-left px-4 py-3 text-xs font-semibold text-gray-600">PAGE</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-gray-600 hidden md:table-cell">EFFECTIVE TITLE</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-gray-600">INDEXING</th>
              <th className="text-right px-4 py-3 text-xs font-semibold text-gray-600">ACTIONS</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {shown.map(({ path, label }) => {
              const o = overrides[path]
              const own = PAGE_SEO[path]?.seo
              const noindex = effectiveNoindex(o, own)
              const title = (o?.title || '').trim() || own?.title || '—'
              const overridden = Boolean((o?.title || '').trim() || (o?.description || '').trim())
              return (
                <tr key={path} className="hover:bg-gray-50">
                  <td className="px-4 py-3">
                    <p className="font-medium text-gray-900 flex items-center gap-2">
                      <Layers className="w-4 h-4 text-gray-300 shrink-0" />{label}
                    </p>
                    <p className="text-xs text-gray-400 font-mono ml-6">{path}</p>
                  </td>
                  <td className="px-4 py-3 hidden md:table-cell">
                    <p className="text-xs text-gray-600 truncate max-w-xs" title={title}>{title}</p>
                    {overridden && <p className="text-[11px] text-blue-600 font-semibold">customized in Meta Editor</p>}
                  </td>
                  <td className="px-4 py-3">
                    {noindex ? (
                      <span className="inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full font-medium bg-amber-50 text-amber-700 border border-amber-200">
                        <EyeOff className="w-3 h-3" /> noindex
                      </span>
                    ) : (
                      <span className="text-xs px-2 py-0.5 rounded-full font-medium bg-green-100 text-green-700">indexed</span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-1">
                      <a href={`https://ccoms.ph${path === '/' ? '' : path}`} target="_blank" rel="noreferrer" title="View live"
                        className="p-1.5 rounded hover:bg-gray-100 text-gray-500"><ExternalLink className="w-4 h-4" /></a>
                      <Link href="/admin/seo/meta" title="Edit SEO"
                        className="p-1.5 rounded hover:bg-gray-100 text-gray-500"><Pencil className="w-4 h-4" /></Link>
                      <Link href="/admin/seo/schema" title="Schema"
                        className="p-1.5 rounded hover:bg-gray-100 text-gray-500"><Braces className="w-4 h-4" /></Link>
                    </div>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}

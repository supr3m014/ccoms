'use client'

// Meta Editor — Firestore-backed (doc: seo_config/meta).
//
// Overrides each page's title, description, OG tags, canonical URL and
// indexing directives. Applied by src/lib/seo-meta.ts through Next's
// generateMetadata, so changes show up on localhost (after a refresh) exactly
// as they will live — no post-build rewriting.
//
// Leave a field blank / on "Default" to keep whatever the page ships with.

import { useState, useEffect, useMemo } from 'react'
import { doc, getDoc, setDoc, Timestamp } from 'firebase/firestore'
import { getDb } from '@/lib/firebase'
import { TITLE_MAX, DESC_MAX, type MetaOverride } from '@/lib/seo-routes'
import { ALL_ROUTES, PAGE_SEO } from '@/lib/seo-pages'
import { Save, RotateCcw, Search, Info, EyeOff } from 'lucide-react'

type Pages = Record<string, MetaOverride>

/** undefined = inherit the page's own default; true/false = force it. */
type TriState = 'default' | 'yes' | 'no'
const toTri = (v: boolean | undefined): TriState => (v === undefined ? 'default' : v ? 'yes' : 'no')
const fromTri = (v: TriState): boolean | undefined => (v === 'default' ? undefined : v === 'yes')

export default function SEOMetaPage() {
  const [pages, setPages] = useState<Pages>({})
  const [saved, setSaved] = useState<Pages>({})
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [status, setStatus] = useState('')
  const [term, setTerm] = useState('')

  useEffect(() => {
    (async () => {
      try {
        const snap = await getDoc(doc(getDb(), 'seo_config', 'meta'))
        const data = (snap.exists() ? snap.data() : {}) as { pages?: Pages }
        const next = data.pages || {}
        setPages(next); setSaved(next)
      } catch (err) {
        console.error(err); setStatus('Could not load meta settings.')
      } finally { setLoading(false) }
    })()
  }, [])

  const dirty = JSON.stringify(pages) !== JSON.stringify(saved)

  const filtered = useMemo(() => {
    const t = term.trim().toLowerCase()
    return t ? ALL_ROUTES.filter((r) => r.label.toLowerCase().includes(t) || r.path.toLowerCase().includes(t)) : ALL_ROUTES
  }, [term])

  const set = (path: string, field: keyof MetaOverride, value: string | boolean | undefined) =>
    setPages((p) => ({ ...p, [path]: { ...p[path], [field]: value } }))

  const save = async () => {
    setSaving(true); setStatus('')
    try {
      // Strip empty strings and 'default' directives so blanks always mean
      // "leave the page's own value alone".
      const clean: Pages = {}
      for (const [path, o] of Object.entries(pages)) {
        const e = Object.fromEntries(
          Object.entries(o || {}).filter(([, v]) =>
            typeof v === 'boolean' ? true : (v ?? '').toString().trim() !== ''),
        )
        if (Object.keys(e).length) clean[path] = e as MetaOverride
      }
      await setDoc(doc(getDb(), 'seo_config', 'meta'), { pages: clean, updatedAt: Timestamp.now() }, { merge: true })
      setPages(clean); setSaved(clean)
      setStatus('Saved. Refresh localhost to preview; deploy to publish.')
    } catch (err) {
      console.error(err); setStatus('Save failed — please try again.')
    } finally { setSaving(false) }
  }

  const counter = (v: string, max: number) => {
    const n = (v || '').length
    const over = n > max
    return <span className={`text-[11px] ${over ? 'text-red-600 font-semibold' : 'text-gray-400'}`}>{n}/{max}{over ? ' — too long' : ''}</span>
  }

  return (
    <div className="p-8">
      <div className="mb-6 flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Meta Editor</h1>
          <p className="text-gray-600">Tune the title, description, social preview, canonical URL and indexing of every page.</p>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={() => setPages(saved)} disabled={!dirty}
            className="inline-flex items-center gap-2 border border-gray-300 hover:bg-gray-50 disabled:opacity-50 text-gray-700 px-4 py-2 rounded-lg font-semibold text-sm">
            <RotateCcw className="w-4 h-4" /> Revert
          </button>
          <button onClick={save} disabled={saving || !dirty}
            className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white px-5 py-2 rounded-lg font-semibold text-sm">
            <Save className="w-4 h-4" /> {saving ? 'Saving…' : 'Save Changes'}
          </button>
        </div>
      </div>

      {status && <p className="mb-4 text-sm text-gray-600">{status}</p>}

      <div className="mb-5 relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input value={term} onChange={(e) => setTerm(e.target.value)} placeholder="Search pages…"
          className="w-full pl-9 pr-3 py-2 rounded-lg border border-gray-200 text-sm focus:border-gray-400 outline-none" />
      </div>

      {loading ? (
        <div className="bg-white rounded-lg shadow-md p-12 text-center text-gray-500">Loading…</div>
      ) : (
        <div className="space-y-4">
          {filtered.map(({ path, label }) => {
            const o = pages[path] || {}
            const own = PAGE_SEO[path]?.seo
            const noindex = o.noindex ?? own?.noindex ?? false
            return (
              <div key={path} className="bg-white rounded-lg shadow-md p-6">
                <div className="flex items-baseline justify-between mb-1 gap-3">
                  <h3 className="font-bold text-gray-900 flex items-center gap-2">
                    {label}
                    {noindex && (
                      <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-amber-700 bg-amber-50 border border-amber-200 rounded-full px-2 py-0.5">
                        <EyeOff className="w-3 h-3" /> not indexed
                      </span>
                    )}
                  </h3>
                  <code className="text-xs text-gray-500 shrink-0">{path}</code>
                </div>
                <p className="text-xs text-gray-400 mb-4 truncate">Default title: {own?.title || '—'}</p>

                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <div className="flex justify-between mb-1">
                      <label className="text-sm font-medium text-gray-700">Title</label>{counter(o.title || '', TITLE_MAX)}
                    </div>
                    <input value={o.title || ''} onChange={(e) => set(path, 'title', e.target.value)}
                      placeholder="Leave blank to keep the current title"
                      className="w-full px-3 py-2 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                  </div>
                  <div>
                    <div className="flex justify-between mb-1">
                      <label className="text-sm font-medium text-gray-700">Meta description</label>{counter(o.description || '', DESC_MAX)}
                    </div>
                    <input value={o.description || ''} onChange={(e) => set(path, 'description', e.target.value)}
                      placeholder="Leave blank to keep the current description"
                      className="w-full px-3 py-2 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">OG title <span className="text-gray-400 font-normal">(social share)</span></label>
                    <input value={o.ogTitle || ''} onChange={(e) => set(path, 'ogTitle', e.target.value)}
                      placeholder="Defaults to the title"
                      className="w-full px-3 py-2 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">OG image URL</label>
                    <input value={o.ogImage || ''} onChange={(e) => set(path, 'ogImage', e.target.value)}
                      placeholder="/core-conversion.png or https://…"
                      className="w-full px-3 py-2 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                  </div>
                </div>

                {/* Indexing + canonical — independent, per page */}
                <div className="mt-4 pt-4 border-t border-gray-100 grid md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Indexing</label>
                    <select value={toTri(o.noindex)} onChange={(e) => set(path, 'noindex', fromTri(e.target.value as TriState))}
                      className="w-full px-3 py-2 border border-gray-300 rounded text-sm bg-white">
                      <option value="default">Default ({own?.noindex ? 'noindex' : 'index'})</option>
                      <option value="no">Index — allow in search results</option>
                      <option value="yes">Noindex — keep out of search results</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Link following</label>
                    <select value={toTri(o.nofollow)} onChange={(e) => set(path, 'nofollow', fromTri(e.target.value as TriState))}
                      className="w-full px-3 py-2 border border-gray-300 rounded text-sm bg-white">
                      <option value="default">Default ({own?.nofollow ? 'nofollow' : 'follow'})</option>
                      <option value="no">Follow — crawl links on this page</option>
                      <option value="yes">Nofollow — don’t crawl links</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Canonical URL</label>
                    <input value={o.canonical || ''} onChange={(e) => set(path, 'canonical', e.target.value)}
                      placeholder={own?.canonical || path}
                      className="w-full px-3 py-2 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}

      <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h3 className="font-semibold text-blue-900 mb-2 flex items-center gap-2"><Info className="w-4 h-4" /> How these apply</h3>
        <ul className="text-sm text-blue-800 space-y-1">
          <li>• Blank fields and “Default” keep whatever the page already ships with — nothing is overwritten by accident.</li>
          <li>• <strong>Noindex</strong> also removes the page from <code>sitemap.xml</code> automatically — the two can’t contradict each other.</li>
          <li>• Saved instantly to the database. <strong>Refresh localhost to preview</strong>, deploy to publish to ccoms.ph.</li>
          <li>• Titles over {TITLE_MAX} and descriptions over {DESC_MAX} characters usually get truncated by Google.</li>
        </ul>
      </div>
    </div>
  )
}

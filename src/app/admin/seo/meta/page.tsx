'use client'

// Meta Editor — Firestore-backed (doc: seo_config/meta).
// Overrides the <title>, meta description and OG tags of the REAL marketing
// pages. Applied by scripts/bake-seo.mjs at deploy time (rewrites out/*.html).
// Leave a field blank to keep whatever the page already ships with.

import { useState, useEffect, useMemo } from 'react'
import { doc, getDoc, setDoc, Timestamp } from 'firebase/firestore'
import { getDb } from '@/lib/firebase'
import { PUBLIC_ROUTES, TITLE_MAX, DESC_MAX, type MetaOverride } from '@/lib/seo-routes'
import { Save, RotateCcw, Search, Info } from 'lucide-react'

type Pages = Record<string, MetaOverride>

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
    return t ? PUBLIC_ROUTES.filter((r) => r.label.toLowerCase().includes(t) || r.path.toLowerCase().includes(t)) : PUBLIC_ROUTES
  }, [term])

  const set = (path: string, field: keyof MetaOverride, value: string) =>
    setPages((p) => ({ ...p, [path]: { ...p[path], [field]: value } }))

  const save = async () => {
    setSaving(true); setStatus('')
    try {
      // strip empty strings so blanks mean "leave the page's own tag alone"
      const clean: Pages = {}
      for (const [path, o] of Object.entries(pages)) {
        const e = Object.fromEntries(Object.entries(o || {}).filter(([, v]) => (v || '').trim() !== ''))
        if (Object.keys(e).length) clean[path] = e as MetaOverride
      }
      await setDoc(doc(getDb(), 'seo_config', 'meta'), { pages: clean, updatedAt: Timestamp.now() }, { merge: true })
      setPages(clean); setSaved(clean)
      setStatus('Saved. Applied to the live pages on the next deploy.')
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
          <p className="text-gray-600">Tune the title, description and social preview of your live pages.</p>
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
            return (
              <div key={path} className="bg-white rounded-lg shadow-md p-6">
                <div className="flex items-baseline justify-between mb-4">
                  <h3 className="font-bold text-gray-900">{label}</h3>
                  <code className="text-xs text-gray-500">{path}</code>
                </div>
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
              </div>
            )
          })}
        </div>
      )}

      <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h3 className="font-semibold text-blue-900 mb-2 flex items-center gap-2"><Info className="w-4 h-4" /> How these apply</h3>
        <ul className="text-sm text-blue-800 space-y-1">
          <li>• Blank fields keep whatever the page already ships with — nothing is overwritten by accident.</li>
          <li>• Saved instantly to the database; the live pages update on the <strong>next deploy</strong> (build → bake → push).</li>
          <li>• Titles over {TITLE_MAX} and descriptions over {DESC_MAX} characters usually get truncated by Google.</li>
        </ul>
      </div>
    </div>
  )
}

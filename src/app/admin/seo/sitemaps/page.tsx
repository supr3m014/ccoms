'use client'

// XML Sitemap — settings in Firestore (doc: seo_config/sitemap).
// The real sitemap.xml is generated at deploy time by scripts/bake-seo.mjs from
// the pages actually present in the build (noindex pages are skipped
// automatically), minus anything excluded here.

import { useState, useEffect, useMemo } from 'react'
import { doc, getDoc, setDoc, Timestamp } from 'firebase/firestore'
import { getDb } from '@/lib/firebase'
import { PUBLIC_ROUTES, SITE_ORIGIN } from '@/lib/seo-routes'
import { Save, RotateCcw, Info, Map as MapIcon } from 'lucide-react'

const FREQS = ['always', 'hourly', 'daily', 'weekly', 'monthly', 'yearly', 'never'] as const
type Freq = (typeof FREQS)[number]

interface SitemapCfg { exclude: string[]; changefreq: Freq; priority: number }
const DEFAULTS: SitemapCfg = { exclude: [], changefreq: 'monthly', priority: 0.7 }

export default function SitemapsPage() {
  const [cfg, setCfg] = useState<SitemapCfg>(DEFAULTS)
  const [saved, setSaved] = useState<SitemapCfg>(DEFAULTS)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [status, setStatus] = useState('')

  useEffect(() => {
    (async () => {
      try {
        const snap = await getDoc(doc(getDb(), 'seo_config', 'sitemap'))
        const d = (snap.exists() ? snap.data() : {}) as Partial<SitemapCfg>
        const next: SitemapCfg = {
          exclude: d.exclude || [], changefreq: (d.changefreq as Freq) || 'monthly',
          priority: typeof d.priority === 'number' ? d.priority : 0.7,
        }
        setCfg(next); setSaved(next)
      } catch (err) { console.error(err); setStatus('Could not load sitemap settings.') }
      finally { setLoading(false) }
    })()
  }, [])

  const dirty = JSON.stringify(cfg) !== JSON.stringify(saved)
  const included = useMemo(() => PUBLIC_ROUTES.filter((r) => !cfg.exclude.includes(r.path)), [cfg.exclude])

  const toggle = (path: string) =>
    setCfg((c) => ({ ...c, exclude: c.exclude.includes(path) ? c.exclude.filter((p) => p !== path) : [...c.exclude, path] }))

  const save = async () => {
    setSaving(true); setStatus('')
    try {
      await setDoc(doc(getDb(), 'seo_config', 'sitemap'), { ...cfg, updatedAt: Timestamp.now() }, { merge: true })
      setSaved(cfg); setStatus('Saved. sitemap.xml is regenerated on the next deploy.')
    } catch (err) { console.error(err); setStatus('Save failed — please try again.') }
    finally { setSaving(false) }
  }

  const preview = useMemo(() => {
    const urls = included.slice(0, 3).map((r) =>
      `  <url>\n    <loc>${SITE_ORIGIN}${r.path === '/' ? '/' : r.path}</loc>\n    <changefreq>${cfg.changefreq}</changefreq>\n    <priority>${r.path === '/' ? '1.0' : cfg.priority.toFixed(1)}</priority>\n  </url>`).join('\n')
    return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n  … ${Math.max(0, included.length - 3)} more\n</urlset>`
  }, [included, cfg])

  return (
    <div className="p-8">
      <div className="mb-6 flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">XML Sitemap</h1>
          <p className="text-gray-600">Choose what goes in <code>sitemap.xml</code>. Generated automatically on deploy.</p>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={() => setCfg(saved)} disabled={!dirty}
            className="inline-flex items-center gap-2 border border-gray-300 hover:bg-gray-50 disabled:opacity-50 text-gray-700 px-4 py-2 rounded-lg font-semibold text-sm">
            <RotateCcw className="w-4 h-4" /> Revert
          </button>
          <button onClick={save} disabled={saving || !dirty}
            className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white px-5 py-2 rounded-lg font-semibold text-sm">
            <Save className="w-4 h-4" /> {saving ? 'Saving…' : 'Save Settings'}
          </button>
        </div>
      </div>
      {status && <p className="mb-4 text-sm text-gray-600">{status}</p>}

      {loading ? (
        <div className="bg-white rounded-lg shadow-md p-12 text-center text-gray-500">Loading…</div>
      ) : (
        <div className="grid lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="font-bold text-gray-900 mb-1 flex items-center gap-2"><MapIcon className="w-4 h-4 text-blue-600" /> Pages included ({included.length})</h3>
            <p className="text-xs text-gray-500 mb-4">Untick a page to leave it out. Pages marked noindex (like /assessment and redirect stubs) are skipped automatically.</p>
            <div className="space-y-1 max-h-96 overflow-y-auto pr-1">
              {PUBLIC_ROUTES.map(({ path, label }) => {
                const on = !cfg.exclude.includes(path)
                return (
                  <label key={path} className="flex items-center gap-3 py-1.5 px-2 rounded hover:bg-gray-50 cursor-pointer">
                    <input type="checkbox" checked={on} onChange={() => toggle(path)} className="w-4 h-4" />
                    <span className={`text-sm ${on ? 'text-gray-900' : 'text-gray-400 line-through'}`}>{label}</span>
                    <code className="ml-auto text-[11px] text-gray-400">{path}</code>
                  </label>
                )
              })}
            </div>
          </div>

          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="font-bold text-gray-900 mb-4">Defaults</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Change frequency</label>
                  <select value={cfg.changefreq} onChange={(e) => setCfg((c) => ({ ...c, changefreq: e.target.value as Freq }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded text-sm">
                    {FREQS.map((f) => <option key={f} value={f}>{f}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Priority <span className="text-gray-400 font-normal">({cfg.priority.toFixed(1)} — homepage is always 1.0)</span></label>
                  <input type="range" min={0.1} max={1} step={0.1} value={cfg.priority}
                    onChange={(e) => setCfg((c) => ({ ...c, priority: Number(e.target.value) }))} className="w-full" />
                </div>
              </div>
            </div>
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="font-bold text-gray-900 mb-3">Preview</h3>
              <pre className="bg-gray-50 border border-gray-200 rounded p-3 text-[11px] text-gray-700 overflow-x-auto">{preview}</pre>
              <p className="mt-2 text-xs text-gray-500">Published at <code>{SITE_ORIGIN}/sitemap.xml</code></p>
            </div>
          </div>
        </div>
      )}

      <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h3 className="font-semibold text-blue-900 mb-2 flex items-center gap-2"><Info className="w-4 h-4" /> How it works</h3>
        <ul className="text-sm text-blue-800 space-y-1">
          <li>• The sitemap is built from the pages actually in the deployed site — it can’t drift out of sync.</li>
          <li>• Any page carrying <code>noindex</code> is skipped automatically, so you can’t accidentally submit a private page.</li>
          <li>• Remember to reference it in <code>robots.txt</code> (the recommended default already does).</li>
        </ul>
      </div>
    </div>
  )
}

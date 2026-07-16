'use client'

// Schema (JSON-LD) — Firestore-backed (doc: seo_config/schema).
// Injected into every page's <head> at deploy time by scripts/bake-seo.mjs
// as <script type="application/ld+json">.

import { useState, useEffect } from 'react'
import { doc, getDoc, setDoc, Timestamp } from 'firebase/firestore'
import { getDb } from '@/lib/firebase'
import { SITE_ORIGIN } from '@/lib/seo-routes'
import { Save, RotateCcw, Braces, Info, Wand2, CheckCircle2, AlertCircle } from 'lucide-react'

const DEFAULT_ORG = JSON.stringify({
  '@context': 'https://schema.org',
  '@type': 'ProfessionalService',
  name: 'Core Conversion',
  alternateName: 'CCOMS',
  url: SITE_ORIGIN,
  logo: `${SITE_ORIGIN}/core-conversion.png`,
  description: 'Strategy-led digital marketing and development agency providing SEO, local SEO, AI-search visibility, websites, mobile apps, and commercial production.',
  email: 'hello@ccoms.ph',
  telephone: '+63 992 298 1422',
  address: {
    '@type': 'PostalAddress',
    addressLocality: 'Biñan',
    addressRegion: 'Laguna',
    addressCountry: 'PH',
  },
  areaServed: 'PH',
  sameAs: [] as string[],
}, null, 2)

export default function SEOSchemaPage() {
  const [global, setGlobal] = useState('')
  const [saved, setSaved] = useState('')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [status, setStatus] = useState('')

  useEffect(() => {
    (async () => {
      try {
        const snap = await getDoc(doc(getDb(), 'seo_config', 'schema'))
        const d = (snap.exists() ? snap.data() : {}) as { global?: string }
        setGlobal(d.global || ''); setSaved(d.global || '')
      } catch (err) { console.error(err); setStatus('Could not load schema.') }
      finally { setLoading(false) }
    })()
  }, [])

  const dirty = global !== saved
  const trimmed = global.trim()
  const valid = trimmed === '' ? null : (() => { try { JSON.parse(trimmed); return true } catch { return false } })()

  const save = async () => {
    if (valid === false) { setStatus('Fix the JSON before saving.'); return }
    setSaving(true); setStatus('')
    try {
      await setDoc(doc(getDb(), 'seo_config', 'schema'), { global: trimmed, updatedAt: Timestamp.now() }, { merge: true })
      setSaved(global); setStatus('Saved. Injected into every page on the next deploy.')
    } catch (err) { console.error(err); setStatus('Save failed — please try again.') }
    finally { setSaving(false) }
  }

  return (
    <div className="p-8">
      <div className="mb-6 flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Schema (JSON-LD)</h1>
          <p className="text-gray-600">Structured data that helps search engines and AI assistants understand your business.</p>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={() => setGlobal(saved)} disabled={!dirty}
            className="inline-flex items-center gap-2 border border-gray-300 hover:bg-gray-50 disabled:opacity-50 text-gray-700 px-4 py-2 rounded-lg font-semibold text-sm">
            <RotateCcw className="w-4 h-4" /> Revert
          </button>
          <button onClick={save} disabled={saving || !dirty || valid === false}
            className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white px-5 py-2 rounded-lg font-semibold text-sm">
            <Save className="w-4 h-4" /> {saving ? 'Saving…' : 'Save Schema'}
          </button>
        </div>
      </div>
      {status && <p className="mb-4 text-sm text-gray-600">{status}</p>}

      {loading ? (
        <div className="bg-white rounded-lg shadow-md p-12 text-center text-gray-500">Loading…</div>
      ) : (
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-start justify-between gap-4 mb-2">
            <div>
              <h3 className="font-bold text-gray-900 flex items-center gap-2"><Braces className="w-4 h-4 text-blue-600" /> Organization schema (site-wide)</h3>
              <p className="text-xs text-gray-500 mt-1">Injected into the &lt;head&gt; of every public page.</p>
            </div>
            <button onClick={() => setGlobal(DEFAULT_ORG)}
              className="inline-flex items-center gap-2 shrink-0 border border-gray-300 hover:bg-gray-50 text-gray-700 px-3 py-1.5 rounded text-xs font-semibold">
              <Wand2 className="w-3.5 h-3.5" /> Use recommended
            </button>
          </div>
          <textarea value={global} onChange={(e) => setGlobal(e.target.value)}
            className={`w-full h-96 px-3 py-2 border rounded focus:outline-none focus:ring-2 font-mono text-xs ${valid === false ? 'border-red-400 focus:ring-red-500' : 'border-gray-300 focus:ring-blue-500'}`}
            placeholder="Leave blank to inject no schema" spellCheck={false} />
          <div className="mt-2 text-xs">
            {valid === true && <span className="text-green-700 inline-flex items-center gap-1.5"><CheckCircle2 className="w-3.5 h-3.5" /> Valid JSON</span>}
            {valid === false && <span className="text-red-600 inline-flex items-center gap-1.5"><AlertCircle className="w-3.5 h-3.5" /> Invalid JSON — this won’t save until it parses.</span>}
            {valid === null && <span className="text-gray-400">Empty — no schema will be injected.</span>}
          </div>
        </div>
      )}

      <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h3 className="font-semibold text-blue-900 mb-2 flex items-center gap-2"><Info className="w-4 h-4" /> Notes</h3>
        <ul className="text-sm text-blue-800 space-y-1">
          <li>• Only valid JSON can be saved — bad markup is worse than none.</li>
          <li>• Applies to the live site on the <strong>next deploy</strong> (build → bake → push).</li>
          <li>• Validate afterwards with Google’s Rich Results Test.</li>
        </ul>
      </div>
    </div>
  )
}

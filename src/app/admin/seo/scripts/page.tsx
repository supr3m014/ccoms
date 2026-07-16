'use client'

// SEO Scripts — Firestore-backed (doc: seo_config/scripts).
// Content is baked into the live HTML at deploy time by scripts/bake-seo.mjs
// (post-build injector) — zero public-bundle cost, real <script> tags that run.

import { useState, useEffect } from 'react'
import { doc, getDoc, setDoc, Timestamp } from 'firebase/firestore'
import { getDb } from '@/lib/firebase'
import { Code, Save, RotateCcw, Info } from 'lucide-react'

const SLOTS = [
  { key: 'head', label: 'Head Scripts', hint: 'Injected before </head> (e.g. Google Tag Manager, verification tags).', ph: '<!-- e.g. GTM head snippet -->\n<script>…</script>' },
  { key: 'bodyStart', label: 'Body Start Scripts', hint: 'Injected right after <body> (e.g. GTM <noscript>).', ph: '<!-- e.g. GTM noscript -->' },
  { key: 'footer', label: 'Footer Scripts', hint: 'Injected before </body> (e.g. chat widgets, deferred analytics).', ph: '<script>…</script>' },
] as const

type SlotKey = (typeof SLOTS)[number]['key']
type Scripts = Record<SlotKey, string>

const EMPTY: Scripts = { head: '', bodyStart: '', footer: '' }

export default function SEOScriptsPage() {
  const [scripts, setScripts] = useState<Scripts>(EMPTY)
  const [saved, setSaved] = useState<Scripts>(EMPTY)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [status, setStatus] = useState('')

  useEffect(() => {
    (async () => {
      try {
        const snap = await getDoc(doc(getDb(), 'seo_config', 'scripts'))
        const data = (snap.exists() ? snap.data() : {}) as Partial<Scripts>
        const next = { head: data.head || '', bodyStart: data.bodyStart || '', footer: data.footer || '' }
        setScripts(next); setSaved(next)
      } catch (err) {
        console.error('Error loading scripts:', err); setStatus('Could not load scripts.')
      } finally { setLoading(false) }
    })()
  }, [])

  const dirty = (Object.keys(EMPTY) as SlotKey[]).some((k) => scripts[k] !== saved[k])

  const save = async () => {
    setSaving(true); setStatus('')
    try {
      await setDoc(doc(getDb(), 'seo_config', 'scripts'), { ...scripts, updatedAt: Timestamp.now() }, { merge: true })
      setSaved(scripts); setStatus('Saved. Changes go live on the next deploy (build → bake → push).')
    } catch (err) {
      console.error(err); setStatus('Save failed — please try again.')
    } finally { setSaving(false) }
  }

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">SEO Scripts</h1>
        <p className="text-gray-600">Global tracking, analytics, and verification scripts — baked into the site on deploy.</p>
      </div>

      {loading ? (
        <div className="bg-white rounded-lg shadow-md p-12 text-center text-gray-500">Loading scripts…</div>
      ) : (
        <div className="space-y-6">
          <div className="bg-white rounded-lg shadow-md p-6 space-y-6">
            {SLOTS.map(({ key, label, hint, ph }) => (
              <div key={key}>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  <Code className="w-4 h-4 inline mr-2" />{label}
                </label>
                <p className="text-xs text-gray-500 mb-2">{hint}</p>
                <textarea
                  value={scripts[key]}
                  onChange={(e) => setScripts((s) => ({ ...s, [key]: e.target.value }))}
                  className="w-full h-32 px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-sm"
                  placeholder={ph}
                  spellCheck={false}
                />
              </div>
            ))}

            <div className="flex items-center gap-3">
              <button onClick={save} disabled={saving || !dirty}
                className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white px-6 py-2 rounded-lg font-semibold transition-colors">
                <Save className="w-4 h-4" /> {saving ? 'Saving…' : 'Save Scripts'}
              </button>
              <button onClick={() => setScripts(saved)} disabled={!dirty}
                className="inline-flex items-center gap-2 border border-gray-300 hover:bg-gray-50 disabled:opacity-50 text-gray-700 px-6 py-2 rounded-lg font-semibold transition-colors">
                <RotateCcw className="w-4 h-4" /> Revert
              </button>
              {status && <span className="text-sm text-gray-600">{status}</span>}
            </div>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h3 className="font-semibold text-blue-900 mb-2 flex items-center gap-2"><Info className="w-4 h-4" /> How these apply</h3>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• Saved here to the database instantly, but they take effect on the <strong>live site after the next deploy</strong>.</li>
              <li>• Deploy runs <code>next build</code> → <code>node scripts/bake-seo.mjs</code> (injects these into every page) → push.</li>
              <li>• Paste complete snippets including their <code>&lt;script&gt;</code> tags — they’re written as real HTML, so they execute.</li>
              <li>• GA4 and the Facebook Pixel are already hardcoded in the layout; add <em>additional</em> tags here.</li>
            </ul>
          </div>
        </div>
      )}
    </div>
  )
}

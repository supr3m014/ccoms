'use client'

// Schema (JSON-LD) — Firestore-backed (doc: seo_config/schema → { rules }).
//
// Granular by design: each rule targets a path pattern, so schema can be
// scoped to one page, to a whole "category layer" (/services/*), or to the
// entire site (/*). Rendered by src/components/JsonLd.tsx into the static
// HTML — visible on localhost and live, identically.

import { useState, useEffect, useMemo } from 'react'
import { doc, getDoc, setDoc, Timestamp } from 'firebase/firestore'
import { getDb } from '@/lib/firebase'
import { SITE_ORIGIN, matchPath, normalizeSchema, type SchemaRule } from '@/lib/seo-routes'
import { ALL_ROUTES } from '@/lib/seo-pages'
import {
  Save, RotateCcw, Braces, Info, Wand2, CheckCircle2, AlertCircle,
  Plus, Trash2, Target, Power,
} from 'lucide-react'

const uid = () => Math.random().toString(36).slice(2, 10)

/* ── Starter templates ───────────────────────────────────────────────────── */

const TPL_ORG = JSON.stringify({
  '@context': 'https://schema.org',
  '@type': 'ProfessionalService',
  name: 'Core Conversion',
  alternateName: 'CCOMS',
  url: SITE_ORIGIN,
  logo: `${SITE_ORIGIN}/core-conversion.png`,
  description: 'Strategy-led digital marketing and development agency providing SEO, local SEO, AI-search visibility, websites, mobile apps, and commercial production.',
  email: 'hello@ccoms.ph',
  telephone: '+63 992 298 1422',
  address: { '@type': 'PostalAddress', addressLocality: 'Biñan', addressRegion: 'Laguna', addressCountry: 'PH' },
  areaServed: 'PH',
  sameAs: [] as string[],
}, null, 2)

const TPL_SERVICE = JSON.stringify({
  '@context': 'https://schema.org',
  '@type': 'Service',
  serviceType: 'SEO Services',
  provider: { '@type': 'Organization', name: 'Core Conversion', url: SITE_ORIGIN },
  areaServed: 'PH',
  description: 'What this service delivers, in one or two sentences.',
}, null, 2)

const TPL_BREADCRUMB = JSON.stringify({
  '@context': 'https://schema.org',
  '@type': 'BreadcrumbList',
  itemListElement: [
    { '@type': 'ListItem', position: 1, name: 'Home', item: SITE_ORIGIN },
    { '@type': 'ListItem', position: 2, name: 'Services', item: `${SITE_ORIGIN}/services` },
  ],
}, null, 2)

const TPL_FAQ = JSON.stringify({
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [{
    '@type': 'Question',
    name: 'A question your customers actually ask',
    acceptedAnswer: { '@type': 'Answer', text: 'The answer, in plain language.' },
  }],
}, null, 2)

const TEMPLATES = [
  { label: 'Organization', json: TPL_ORG, pattern: '/*' },
  { label: 'Service', json: TPL_SERVICE, pattern: '/services/*' },
  { label: 'Breadcrumbs', json: TPL_BREADCRUMB, pattern: '/services/*' },
  { label: 'FAQ', json: TPL_FAQ, pattern: '' },
]

const PATTERN_HINTS = [
  { pattern: '/*', desc: 'Every page on the site' },
  { pattern: '/services/*', desc: 'Every page under /services — a category layer' },
  { pattern: '/services*', desc: '/services and everything under it' },
  { pattern: '/about', desc: 'That one page only' },
]

export default function SEOSchemaPage() {
  const [rules, setRules] = useState<SchemaRule[]>([])
  const [saved, setSaved] = useState<SchemaRule[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [status, setStatus] = useState('')
  const [openId, setOpenId] = useState<string | null>(null)

  useEffect(() => {
    (async () => {
      try {
        const snap = await getDoc(doc(getDb(), 'seo_config', 'schema'))
        // Migrates a legacy site-wide `global` blob into a visible /* rule.
        const next = normalizeSchema(snap.exists() ? snap.data() : {})
        setRules(next); setSaved(next)
        if (next.length) setOpenId(next[0].id)
      } catch (err) { console.error(err); setStatus('Could not load schema.') }
      finally { setLoading(false) }
    })()
  }, [])

  const dirty = JSON.stringify(rules) !== JSON.stringify(saved)
  const isValid = (json: string) => { try { JSON.parse(json.trim()); return true } catch { return false } }
  const allValid = rules.every((r) => isValid(r.json))

  const matchesFor = (pattern: string) =>
    ALL_ROUTES.filter((r) => { try { return matchPath(pattern, r.path) } catch { return false } })

  const update = (id: string, patch: Partial<SchemaRule>) =>
    setRules((rs) => rs.map((r) => (r.id === id ? { ...r, ...patch } : r)))

  const addRule = (tpl?: { label: string; json: string; pattern: string }) => {
    const rule: SchemaRule = {
      id: uid(),
      label: tpl?.label ?? 'New schema',
      pattern: tpl?.pattern ?? '',
      json: tpl?.json ?? '',
      enabled: true,
    }
    setRules((rs) => [...rs, rule])
    setOpenId(rule.id)
  }

  const remove = (id: string) => {
    if (!confirm('Delete this schema rule?')) return
    setRules((rs) => rs.filter((r) => r.id !== id))
  }

  const save = async () => {
    if (!allValid) { setStatus('Fix the invalid JSON before saving.'); return }
    setSaving(true); setStatus('')
    try {
      const clean = rules
        .filter((r) => r.pattern.trim() && r.json.trim())
        .map((r) => ({ ...r, pattern: r.pattern.trim(), json: r.json.trim() }))
      // `global: ''` retires the old site-wide field now that rules own this.
      await setDoc(doc(getDb(), 'seo_config', 'schema'), { rules: clean, global: '', updatedAt: Timestamp.now() }, { merge: true })
      setRules(clean); setSaved(clean)
      setStatus('Saved. Refresh localhost to preview; deploy to publish.')
    } catch (err) { console.error(err); setStatus('Save failed — please try again.') }
    finally { setSaving(false) }
  }

  return (
    <div className="p-8">
      <div className="mb-6 flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Schema (JSON-LD)</h1>
          <p className="text-gray-600">Structured data that tells search engines and AI assistants what each page is about.</p>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={() => setRules(saved)} disabled={!dirty}
            className="inline-flex items-center gap-2 border border-gray-300 hover:bg-gray-50 disabled:opacity-50 text-gray-700 px-4 py-2 rounded-lg font-semibold text-sm">
            <RotateCcw className="w-4 h-4" /> Revert
          </button>
          <button onClick={save} disabled={saving || !dirty || !allValid}
            className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white px-5 py-2 rounded-lg font-semibold text-sm">
            <Save className="w-4 h-4" /> {saving ? 'Saving…' : 'Save Schema'}
          </button>
        </div>
      </div>
      {status && <p className="mb-4 text-sm text-gray-600">{status}</p>}

      {loading ? (
        <div className="bg-white rounded-lg shadow-md p-12 text-center text-gray-500">Loading…</div>
      ) : (
        <>
          <div className="space-y-4">
            {rules.map((rule) => {
              const valid = rule.json.trim() === '' ? null : isValid(rule.json)
              const matches = matchesFor(rule.pattern)
              const open = openId === rule.id
              return (
                <div key={rule.id} className={`bg-white rounded-lg shadow-md overflow-hidden ${rule.enabled === false ? 'opacity-60' : ''}`}>
                  <div className="p-5 flex items-center gap-3 cursor-pointer hover:bg-gray-50" onClick={() => setOpenId(open ? null : rule.id)}>
                    <Braces className="w-4 h-4 text-blue-600 shrink-0" />
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-bold text-gray-900 truncate">{rule.label || 'Untitled'}</span>
                        <code className="text-[11px] bg-gray-100 text-gray-600 px-1.5 py-0.5 rounded">{rule.pattern || 'no target'}</code>
                        {valid === false && (
                          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-red-600">
                            <AlertCircle className="w-3 h-3" /> invalid JSON
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-gray-500 mt-0.5">
                        {rule.pattern
                          ? matches.length
                            ? `Applies to ${matches.length} page${matches.length === 1 ? '' : 's'}`
                            : 'Matches no page yet — it will apply automatically when one exists'
                          : 'Set a target below'}
                      </p>
                    </div>
                    <button
                      onClick={(e) => { e.stopPropagation(); update(rule.id, { enabled: rule.enabled === false }) }}
                      title={rule.enabled === false ? 'Enable' : 'Disable'}
                      className={`shrink-0 p-1.5 rounded ${rule.enabled === false ? 'text-gray-400 hover:bg-gray-100' : 'text-green-600 hover:bg-green-50'}`}>
                      <Power className="w-4 h-4" />
                    </button>
                    <button onClick={(e) => { e.stopPropagation(); remove(rule.id) }}
                      className="shrink-0 p-1.5 rounded text-red-400 hover:text-red-600 hover:bg-red-50">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  {open && (
                    <div className="px-5 pb-5 border-t border-gray-100 pt-4 space-y-4">
                      <div className="grid md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Name <span className="text-gray-400 font-normal">(for you, not published)</span></label>
                          <input value={rule.label} onChange={(e) => update(rule.id, { label: e.target.value })}
                            placeholder="e.g. Organization"
                            className="w-full px-3 py-2 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Apply to <span className="text-gray-400 font-normal">(path or pattern)</span></label>
                          <input value={rule.pattern} onChange={(e) => update(rule.id, { pattern: e.target.value })}
                            placeholder="/services/*"
                            list="cc-path-hints"
                            className="w-full px-3 py-2 border border-gray-300 rounded text-sm font-mono focus:outline-none focus:ring-2 focus:ring-blue-500" />
                          <datalist id="cc-path-hints">
                            {PATTERN_HINTS.map((h) => <option key={h.pattern} value={h.pattern}>{h.desc}</option>)}
                            {ALL_ROUTES.map((r) => <option key={r.path} value={r.path}>{r.label}</option>)}
                          </datalist>
                        </div>
                      </div>

                      {matches.length > 0 && (
                        <div className="flex items-start gap-2 text-xs text-gray-500 bg-gray-50 border border-gray-200 rounded p-2">
                          <Target className="w-3.5 h-3.5 mt-0.5 shrink-0 text-gray-400" />
                          <span className="leading-relaxed">{matches.map((m) => m.path).join(' · ')}</span>
                        </div>
                      )}

                      <div>
                        <div className="flex items-center justify-between mb-1">
                          <label className="text-sm font-medium text-gray-700">JSON-LD</label>
                          <div className="flex gap-1">
                            {TEMPLATES.map((t) => (
                              <button key={t.label} onClick={() => update(rule.id, { json: t.json })}
                                className="inline-flex items-center gap-1 border border-gray-300 hover:bg-gray-50 text-gray-700 px-2 py-1 rounded text-[11px] font-semibold">
                                <Wand2 className="w-3 h-3" /> {t.label}
                              </button>
                            ))}
                          </div>
                        </div>
                        <textarea value={rule.json} onChange={(e) => update(rule.id, { json: e.target.value })}
                          className={`w-full h-72 px-3 py-2 border rounded focus:outline-none focus:ring-2 font-mono text-xs ${valid === false ? 'border-red-400 focus:ring-red-500' : 'border-gray-300 focus:ring-blue-500'}`}
                          spellCheck={false} />
                        <div className="mt-2 text-xs">
                          {valid === true && <span className="text-green-700 inline-flex items-center gap-1.5"><CheckCircle2 className="w-3.5 h-3.5" /> Valid JSON</span>}
                          {valid === false && <span className="text-red-600 inline-flex items-center gap-1.5"><AlertCircle className="w-3.5 h-3.5" /> Invalid JSON — this won’t save until it parses.</span>}
                          {valid === null && <span className="text-gray-400">Empty — pick a template above to start.</span>}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )
            })}
          </div>

          <div className="mt-4 flex items-center gap-2 flex-wrap">
            <button onClick={() => addRule()}
              className="inline-flex items-center gap-2 bg-gray-900 hover:bg-gray-800 text-white px-4 py-2 rounded-lg font-semibold text-sm">
              <Plus className="w-4 h-4" /> Add schema
            </button>
            <span className="text-xs text-gray-400">or start from:</span>
            {TEMPLATES.map((t) => (
              <button key={t.label} onClick={() => addRule(t)}
                className="inline-flex items-center gap-1.5 border border-gray-300 hover:bg-gray-50 text-gray-700 px-3 py-1.5 rounded-lg text-xs font-semibold">
                <Wand2 className="w-3.5 h-3.5" /> {t.label}
              </button>
            ))}
          </div>

          {rules.length === 0 && (
            <div className="mt-4 bg-white rounded-lg shadow-md p-10 text-center text-gray-500 text-sm">
              No schema yet. Add one above — start with <strong>Organization</strong> applied to <code>/*</code>.
            </div>
          )}
        </>
      )}

      <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h3 className="font-semibold text-blue-900 mb-2 flex items-center gap-2"><Info className="w-4 h-4" /> Targeting pages</h3>
        <ul className="text-sm text-blue-800 space-y-1">
          <li>• <code>/about</code> — that page only.</li>
          <li>• <code>/services/*</code> — every page under /services. This is your <strong>category layer</strong>: one rule covers the whole group, including pages you add later.</li>
          <li>• <code>/*</code> — the whole site. Use it for Organization, and little else.</li>
          <li>• Rules stack: a page gets <em>every</em> matching rule, so site-wide Organization + a per-page Service can coexist.</li>
          <li>• A pattern that matches nothing is kept and applies the moment a matching page exists.</li>
          <li>• Only valid JSON saves — bad markup is worse than none. Verify with Google’s Rich Results Test after deploying.</li>
        </ul>
      </div>
    </div>
  )
}

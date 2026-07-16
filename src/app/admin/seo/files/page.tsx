'use client'

// File Generator — robots.txt and llms.txt (doc: seo_config/files).
// Written into out/ at deploy time by scripts/bake-seo.mjs.

import { useState, useEffect } from 'react'
import { doc, getDoc, setDoc, Timestamp } from 'firebase/firestore'
import { getDb } from '@/lib/firebase'
import { SITE_ORIGIN } from '@/lib/seo-routes'
import { Save, RotateCcw, FileText, Info, Wand2 } from 'lucide-react'

const DEFAULT_ROBOTS = `User-agent: *
Allow: /

# Keep private/utility areas out of the index
Disallow: /admin
Disallow: /assessment

Sitemap: ${SITE_ORIGIN}/sitemap.xml`

const DEFAULT_LLMS = `# Core Conversion

> Strategy-led digital marketing and development agency in the Philippines.
> We help businesses replace disconnected marketing activity with a coordinated,
> measurable path to growth.

## Services
- [Digital Marketing Services](${SITE_ORIGIN}/services/digital-marketing-services): Coordinated, retained growth programs.
- [SEO Services](${SITE_ORIGIN}/services/seo): Technical SEO, content architecture, authority development.
- [Local SEO](${SITE_ORIGIN}/services/local-seo): Google Business Profile, map visibility, local conversion.
- [GEO & AI Search Visibility](${SITE_ORIGIN}/services/geo): Entity clarity and citation readiness for AI-assisted search.
- [Website Development](${SITE_ORIGIN}/services/website-development): Business websites, e-commerce, platforms.
- [Mobile App Development](${SITE_ORIGIN}/services/mobile-app-development): Customer and operational applications.
- [AI Ad & Commercial Production](${SITE_ORIGIN}/services/ai-ad-commercial-production): Campaign-ready commercial assets.

## Company
- [About](${SITE_ORIGIN}/about)
- [Case Studies](${SITE_ORIGIN}/case-studies)
- [Contact](${SITE_ORIGIN}/contact)`

type Files = { robots: string; llms: string }
const EMPTY: Files = { robots: '', llms: '' }

export default function SEOFilesPage() {
  const [files, setFiles] = useState<Files>(EMPTY)
  const [saved, setSaved] = useState<Files>(EMPTY)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [status, setStatus] = useState('')

  useEffect(() => {
    (async () => {
      try {
        const snap = await getDoc(doc(getDb(), 'seo_config', 'files'))
        const d = (snap.exists() ? snap.data() : {}) as Partial<Files>
        const next = { robots: d.robots || '', llms: d.llms || '' }
        setFiles(next); setSaved(next)
      } catch (err) { console.error(err); setStatus('Could not load files.') }
      finally { setLoading(false) }
    })()
  }, [])

  const dirty = files.robots !== saved.robots || files.llms !== saved.llms

  const save = async () => {
    setSaving(true); setStatus('')
    try {
      await setDoc(doc(getDb(), 'seo_config', 'files'), { ...files, updatedAt: Timestamp.now() }, { merge: true })
      setSaved(files); setStatus('Saved. Files are written on the next deploy.')
    } catch (err) { console.error(err); setStatus('Save failed — please try again.') }
    finally { setSaving(false) }
  }

  const blocks: { key: keyof Files; name: string; desc: string; def: string }[] = [
    { key: 'robots', name: 'robots.txt', desc: 'Tells search crawlers what they may crawl, and where your sitemap is.', def: DEFAULT_ROBOTS },
    { key: 'llms', name: 'llms.txt', desc: 'An emerging standard that gives AI assistants a clean summary of your site — supports your GEO positioning.', def: DEFAULT_LLMS },
  ]

  return (
    <div className="p-8">
      <div className="mb-6 flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">File Generator</h1>
          <p className="text-gray-600">Generate <code>robots.txt</code> and <code>llms.txt</code> for the live site.</p>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={() => setFiles(saved)} disabled={!dirty}
            className="inline-flex items-center gap-2 border border-gray-300 hover:bg-gray-50 disabled:opacity-50 text-gray-700 px-4 py-2 rounded-lg font-semibold text-sm">
            <RotateCcw className="w-4 h-4" /> Revert
          </button>
          <button onClick={save} disabled={saving || !dirty}
            className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white px-5 py-2 rounded-lg font-semibold text-sm">
            <Save className="w-4 h-4" /> {saving ? 'Saving…' : 'Save Files'}
          </button>
        </div>
      </div>
      {status && <p className="mb-4 text-sm text-gray-600">{status}</p>}

      {loading ? (
        <div className="bg-white rounded-lg shadow-md p-12 text-center text-gray-500">Loading…</div>
      ) : (
        <div className="space-y-6">
          {blocks.map(({ key, name, desc, def }) => (
            <div key={key} className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-start justify-between gap-4 mb-2">
                <div>
                  <h3 className="font-bold text-gray-900 flex items-center gap-2"><FileText className="w-4 h-4 text-blue-600" /> {name}</h3>
                  <p className="text-xs text-gray-500 mt-1">{desc}</p>
                </div>
                <button onClick={() => setFiles((f) => ({ ...f, [key]: def }))}
                  className="inline-flex items-center gap-2 shrink-0 border border-gray-300 hover:bg-gray-50 text-gray-700 px-3 py-1.5 rounded text-xs font-semibold">
                  <Wand2 className="w-3.5 h-3.5" /> Use recommended
                </button>
              </div>
              <textarea value={files[key]} onChange={(e) => setFiles((f) => ({ ...f, [key]: e.target.value }))}
                className="w-full h-56 px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-xs"
                placeholder={`Leave blank to not publish ${name}`} spellCheck={false} />
              <p className="mt-2 text-xs text-gray-500">Published at <code>{SITE_ORIGIN}/{name}</code>. Leave blank to skip the file entirely.</p>
            </div>
          ))}
        </div>
      )}

      <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h3 className="font-semibold text-blue-900 mb-2 flex items-center gap-2"><Info className="w-4 h-4" /> Heads up</h3>
        <ul className="text-sm text-blue-800 space-y-1">
          <li>• Your site currently has <strong>no robots.txt and no sitemap.xml</strong> — publishing them is a real SEO win.</li>
          <li>• Files are written into the site on the <strong>next deploy</strong> (build → bake → push).</li>
          <li>• The sitemap itself is generated automatically — see the Sitemaps page.</li>
        </ul>
      </div>
    </div>
  )
}

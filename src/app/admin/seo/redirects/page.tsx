'use client'

// Redirects & 404 monitor — Firestore-backed (collection: `redirects`).
// Admin-only (the admin shell already signs in via Firebase + claim; rules
// enforce it). Redirects are applied to the live static site through the
// generated .htaccess block (Tools tab) — the SEO-correct way for Hostinger.

import { useState, useEffect, useCallback } from 'react'
import {
  collection, query, orderBy, getDocs, addDoc, updateDoc, deleteDoc, doc,
  where, getDocs as getDocsQ, writeBatch, Timestamp,
} from 'firebase/firestore'
import { getDb } from '@/lib/firebase'
import { Plus, Trash2, AlertCircle, ArrowRight, Upload, Download, FileCode, Copy, Check } from 'lucide-react'

interface Redirect {
  id: string
  redirect_from: string
  redirect_to: string
  status_code: number
  enabled: boolean
  hit_count: number
  created_at?: Timestamp
}

interface Error404 {
  id: string
  url: string
  referrer: string
  hit_count: number
  last_seen_at?: Timestamp
}

// Normalize a "from" path: ensure a single leading slash, strip origin/trailing slash.
function normFrom(v: string): string {
  let s = v.trim()
  s = s.replace(/^https?:\/\/[^/]+/i, '')
  if (!s.startsWith('/')) s = '/' + s
  if (s.length > 1) s = s.replace(/\/+$/, '')
  return s
}
// "to" can be a path or an absolute URL — keep as typed, just trim + add slash if it looks like a path.
function normTo(v: string): string {
  const s = v.trim()
  if (/^https?:\/\//i.test(s)) return s
  return s.startsWith('/') ? s : '/' + s
}

export default function RedirectsPage() {
  const [activeTab, setActiveTab] = useState<'redirects' | '404' | 'tools'>('redirects')
  const [redirects, setRedirects] = useState<Redirect[]>([])
  const [errors404, setErrors404] = useState<Error404[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [redirectFrom, setRedirectFrom] = useState('')
  const [redirectTo, setRedirectTo] = useState('')
  const [statusCode, setStatusCode] = useState(301)
  const [importFile, setImportFile] = useState<File | null>(null)
  const [importMode, setImportMode] = useState<'skip' | 'update'>('skip')
  const [htaccess, setHtaccess] = useState('')
  const [copied, setCopied] = useState(false)

  const fetchData = useCallback(async () => {
    setLoading(true)
    try {
      const db = getDb()
      if (activeTab === '404') {
        const snap = await getDocs(query(collection(db, 'error_404_log'), orderBy('hit_count', 'desc')))
        setErrors404(snap.docs.map((d) => ({ id: d.id, ...d.data() }) as Error404))
      } else {
        const snap = await getDocs(query(collection(db, 'redirects'), orderBy('created_at', 'desc')))
        setRedirects(snap.docs.map((d) => ({ id: d.id, ...d.data() }) as Redirect))
      }
    } catch (err) {
      console.error('Error fetching data:', err)
    } finally {
      setLoading(false)
    }
  }, [activeTab])

  useEffect(() => { void fetchData() }, [fetchData])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const from = normFrom(redirectFrom)
    const to = normTo(redirectTo)
    if (from.length < 2 || to.length < 1) { alert('Please fill in both fields.'); return }
    if (from === to) { alert('"From" and "To" cannot be the same.'); return }
    try {
      const db = getDb()
      // prevent duplicate "from"
      const dup = await getDocsQ(query(collection(db, 'redirects'), where('redirect_from', '==', from)))
      if (!dup.empty) { alert(`A redirect from "${from}" already exists.`); return }
      await addDoc(collection(db, 'redirects'), {
        redirect_from: from, redirect_to: to, status_code: statusCode,
        enabled: true, hit_count: 0, created_at: Timestamp.now(),
      })
      setRedirectFrom(''); setRedirectTo(''); setStatusCode(301); setShowForm(false)
      void fetchData()
    } catch (err) {
      console.error(err); alert('Failed to create redirect.')
    }
  }

  const toggleRedirect = async (id: string, current: boolean) => {
    try { await updateDoc(doc(getDb(), 'redirects', id), { enabled: !current }); void fetchData() }
    catch (err) { console.error(err) }
  }

  const deleteRedirect = async (id: string) => {
    if (!confirm('Delete this redirect?')) return
    try { await deleteDoc(doc(getDb(), 'redirects', id)); void fetchData() }
    catch (err) { console.error(err) }
  }

  const delete404 = async (id: string) => {
    if (!confirm('Delete this 404 log?')) return
    try { await deleteDoc(doc(getDb(), 'error_404_log', id)); void fetchData() }
    catch (err) { console.error(err) }
  }

  const createRedirectFrom404 = (url: string) => {
    setRedirectFrom(url); setActiveTab('redirects'); setShowForm(true)
  }

  const handleDeleteAllRedirects = async () => {
    if (!confirm('Delete ALL redirect rules? This cannot be undone.')) return
    try {
      const db = getDb()
      const snap = await getDocs(collection(db, 'redirects'))
      const batch = writeBatch(db)
      snap.docs.forEach((d) => batch.delete(d.ref))
      await batch.commit()
      void fetchData()
      alert('All redirects deleted.')
    } catch (err) { console.error(err); alert('Failed to delete redirects.') }
  }

  const handleImportCSV = async () => {
    if (!importFile) { alert('Please select a CSV file.'); return }
    const reader = new FileReader()
    reader.onload = async (e) => {
      try {
        const db = getDb()
        const text = e.target?.result as string
        const rows = text.split('\n').slice(1)
          .map((line) => {
            const [f, t, c] = line.split(',')
            return { redirect_from: normFrom(f || ''), redirect_to: normTo(t || ''), status_code: parseInt((c || '301').trim()) || 301 }
          })
          .filter((r) => r.redirect_from.length > 1 && r.redirect_to.length > 0)
        for (const r of rows) {
          const existing = await getDocsQ(query(collection(db, 'redirects'), where('redirect_from', '==', r.redirect_from)))
          if (!existing.empty) {
            if (importMode === 'update') await updateDoc(existing.docs[0].ref, { ...r })
            // skip mode: leave as-is
          } else {
            await addDoc(collection(db, 'redirects'), { ...r, enabled: true, hit_count: 0, created_at: Timestamp.now() })
          }
        }
        setImportFile(null); void fetchData(); alert('Redirects imported.')
      } catch (err) { console.error(err); alert('Failed to import redirects.') }
    }
    reader.readAsText(importFile)
  }

  const handleExportCSV = () => {
    const csv = ['redirect_from,redirect_to,status_code',
      ...redirects.map((r) => `${r.redirect_from},${r.redirect_to},${r.status_code}`)].join('\n')
    downloadFile(csv, `redirects-export-${new Date().toISOString().split('T')[0]}.csv`, 'text/csv')
  }

  const downloadExampleCSV = () => {
    downloadFile(`redirect_from,redirect_to,status_code
/old-page,/new-page,301
/blog/old-post,/blog/new-post,301
/temporary,/temp-destination,302`, 'redirects-example.csv', 'text/csv')
  }

  // Build the .htaccess RewriteRule block from ENABLED redirects.
  const buildHtaccess = useCallback(() => {
    const active = redirects.filter((r) => r.enabled)
    const lines = active.map((r) => {
      const pattern = r.redirect_from.replace(/^\//, '').replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
      return `RewriteRule ^${pattern}/?$ ${r.redirect_to} [R=${r.status_code},L,QSA]`
    })
    const block = [
      '# BEGIN Core Conversion redirects (managed in /admin/seo/redirects)',
      '# Paste this block inside <IfModule mod_rewrite.c>, right after "RewriteBase /".',
      ...(lines.length ? lines : ['# (no active redirects)']),
      '# END Core Conversion redirects',
    ].join('\n')
    setHtaccess(block)
    return block
  }, [redirects])

  useEffect(() => { if (activeTab === 'tools') buildHtaccess() }, [activeTab, buildHtaccess])

  const copyHtaccess = async () => {
    const block = htaccess || buildHtaccess()
    try { await navigator.clipboard.writeText(block); setCopied(true); setTimeout(() => setCopied(false), 1800) }
    catch { alert('Copy failed — select the text manually.') }
  }

  const activeCount = redirects.filter((r) => r.enabled).length

  return (
    <div className="p-8">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Redirects &amp; 404 Monitor</h1>
          <p className="text-gray-600">Manage URL redirects and monitor 404 errors</p>
        </div>
        {activeTab === 'redirects' && (
          <button onClick={() => setShowForm(!showForm)}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-semibold transition-colors flex items-center gap-2">
            <Plus className="w-4 h-4" /> Add Redirect
          </button>
        )}
      </div>

      <div className="flex gap-4 mb-6">
        {(['redirects', '404', 'tools'] as const).map((tab) => (
          <button key={tab} onClick={() => setActiveTab(tab)}
            className={`px-6 py-3 rounded-lg font-semibold transition-colors ${activeTab === tab ? 'bg-blue-600 text-white' : 'bg-white text-gray-700 hover:bg-gray-50'}`}>
            {tab === 'redirects' ? `Redirects (${redirects.length})` : tab === '404' ? `404 Errors (${errors404.length})` : 'Tools & Options'}
          </button>
        ))}
      </div>

      {activeTab === 'redirects' && showForm && (
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Add New Redirect</h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Redirect From</label>
              <input type="text" value={redirectFrom} onChange={(e) => setRedirectFrom(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="/old-page" required />
              <p className="mt-1 text-xs text-gray-500">A path on this site, e.g. <code>/old-page</code>.</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Redirect To</label>
              <input type="text" value={redirectTo} onChange={(e) => setRedirectTo(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="/new-page or https://…" required />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Status Code</label>
              <select value={statusCode} onChange={(e) => setStatusCode(Number(e.target.value))}
                className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500">
                <option value={301}>301 - Permanent</option>
                <option value={302}>302 - Temporary</option>
                <option value={307}>307 - Temporary (Preserve Method)</option>
              </select>
            </div>
            <div className="flex gap-2">
              <button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-semibold transition-colors">Create Redirect</button>
              <button type="button" onClick={() => setShowForm(false)} className="border border-gray-300 hover:bg-gray-50 text-gray-700 px-6 py-2 rounded-lg font-semibold transition-colors">Cancel</button>
            </div>
          </form>
        </div>
      )}

      {activeTab === 'tools' ? (
        <div className="space-y-6">
          {/* .htaccess generator — the real "apply to live site" step */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center gap-2 mb-2">
              <FileCode className="w-5 h-5 text-blue-600" />
              <h3 className="text-lg font-semibold text-gray-900">Apply to the live site — .htaccess rules</h3>
            </div>
            <p className="text-sm text-gray-600 mb-4">
              This site is a static export, so redirects run as real 301s in <code>.htaccess</code>. Copy the block below and
              paste it inside <code>&lt;IfModule mod_rewrite.c&gt;</code>, right after <code>RewriteBase /</code>, then redeploy.
              ({activeCount} active redirect{activeCount === 1 ? '' : 's'}.)
            </p>
            <div className="flex gap-2 mb-3">
              <button onClick={copyHtaccess} className="inline-flex items-center gap-2 bg-gray-900 hover:bg-gray-800 text-white px-4 py-2 rounded-lg text-sm font-semibold">
                {copied ? <><Check className="w-4 h-4" /> Copied</> : <><Copy className="w-4 h-4" /> Copy block</>}
              </button>
              <button onClick={() => downloadFile(htaccess || buildHtaccess(), 'redirects.htaccess.txt', 'text/plain')}
                className="inline-flex items-center gap-2 border border-gray-300 hover:bg-gray-50 text-gray-700 px-4 py-2 rounded-lg text-sm font-semibold">
                <Download className="w-4 h-4" /> Download
              </button>
            </div>
            <pre className="bg-gray-50 border border-gray-200 rounded-lg p-4 text-[12.5px] text-gray-800 overflow-x-auto whitespace-pre">{htaccess || '# (generating…)'}</pre>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Import Redirect Rules</h3>
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <input type="file" accept=".csv" id="csv-upload" onChange={(e) => setImportFile(e.target.files?.[0] || null)} className="hidden" />
                  <label htmlFor="csv-upload" className="px-4 py-2 bg-gray-100 hover:bg-gray-200 border border-gray-300 rounded cursor-pointer transition-colors">Choose File</label>
                  <span className="text-sm text-gray-600">{importFile ? importFile.name : 'No file chosen'}</span>
                </div>
                <div className="space-y-2">
                  {(['skip', 'update'] as const).map((mode) => (
                    <label key={mode} className="flex items-center gap-2 cursor-pointer">
                      <input type="radio" name="import-mode" value={mode} checked={importMode === mode} onChange={() => setImportMode(mode)} className="text-blue-600" />
                      <span className="text-sm text-gray-700">{mode === 'skip' ? 'Skip Duplicates' : 'Update Duplicates'}</span>
                    </label>
                  ))}
                </div>
                <button onClick={handleImportCSV} disabled={!importFile}
                  className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
                  <Upload className="w-4 h-4" /> Upload CSV
                </button>
                <button onClick={downloadExampleCSV} className="w-full text-sm text-blue-600 hover:text-blue-700 font-medium">Download Example CSV</button>
              </div>
            </div>

            <div className="space-y-6">
              <div className="bg-white rounded-lg shadow-md p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Export Redirect Rules</h3>
                <button onClick={handleExportCSV} className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg font-semibold transition-colors">
                  <Download className="w-4 h-4" /> Export Redirects (CSV)
                </button>
                <p className="text-sm text-gray-500 mt-2">Back up all redirects to CSV.</p>
              </div>
              <div className="bg-white rounded-lg shadow-md p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Danger Zone</h3>
                <button onClick={handleDeleteAllRedirects} className="w-full px-6 py-3 bg-red-600 hover:bg-red-700 text-white rounded-lg font-semibold transition-colors">Delete All Redirect Rules</button>
                <p className="text-sm text-gray-500 mt-2">Permanently delete every redirect. Cannot be undone.</p>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-md">
          {loading ? (
            <div className="p-8 text-center text-gray-500">Loading…</div>
          ) : activeTab === 'redirects' ? (
            redirects.length === 0 ? (
              <div className="p-12 text-center">
                <ArrowRight className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">No redirects yet</h3>
                <p className="text-gray-600 mb-4">Create your first redirect</p>
                <button onClick={() => setShowForm(true)} className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-semibold transition-colors">
                  <Plus className="w-4 h-4" /> Add Redirect
                </button>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      {['From', 'To', 'Type', 'Hits', 'Status', ''].map((h, i) => (
                        <th key={h || 'act'} className={`px-6 py-3 text-xs font-medium text-gray-500 uppercase ${i === 5 ? 'text-right' : 'text-left'}`}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {redirects.map((r) => (
                      <tr key={r.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 text-sm text-gray-900">{r.redirect_from}</td>
                        <td className="px-6 py-4 text-sm text-gray-600 break-all">{r.redirect_to}</td>
                        <td className="px-6 py-4 text-sm text-gray-600">{r.status_code}</td>
                        <td className="px-6 py-4 text-sm text-gray-600">{r.hit_count ?? 0}</td>
                        <td className="px-6 py-4">
                          <button onClick={() => toggleRedirect(r.id, r.enabled)}
                            className={`px-2 py-1 rounded-full text-xs font-medium ${r.enabled ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                            {r.enabled ? 'Active' : 'Disabled'}
                          </button>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <button onClick={() => deleteRedirect(r.id)} className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded transition-colors" title="Delete">
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )
          ) : errors404.length === 0 ? (
            <div className="p-12 text-center">
              <AlertCircle className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No 404 errors logged</h3>
              <p className="text-gray-600">404 errors will appear here once the 404 logger is enabled (server-side, coming with the next SEO pass).</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    {['URL', 'Referrer', 'Hits', 'Last Seen', ''].map((h, i) => (
                      <th key={h || 'act'} className={`px-6 py-3 text-xs font-medium text-gray-500 uppercase ${i === 4 ? 'text-right' : 'text-left'}`}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {errors404.map((err) => (
                    <tr key={err.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 text-sm text-gray-900">{err.url}</td>
                      <td className="px-6 py-4 text-sm text-gray-600 truncate max-w-xs">{err.referrer || '-'}</td>
                      <td className="px-6 py-4 text-sm text-gray-600">{err.hit_count}</td>
                      <td className="px-6 py-4 text-sm text-gray-600">{err.last_seen_at?.toDate ? err.last_seen_at.toDate().toLocaleDateString() : '-'}</td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button onClick={() => createRedirectFrom404(err.url)} className="text-sm text-blue-600 hover:text-blue-800 font-medium">Create Redirect</button>
                          <button onClick={() => delete404(err.id)} className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded transition-colors" title="Delete">
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

function downloadFile(content: string, filename: string, type: string) {
  const blob = new Blob([content], { type })
  const url = window.URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url; a.download = filename
  document.body.appendChild(a); a.click(); document.body.removeChild(a)
  window.URL.revokeObjectURL(url)
}

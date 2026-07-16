'use client'

// Leads — Business Growth Assessment submissions (spec §13).
//
// Data security model: this page talks to Firestore with the Firebase client
// SDK. Reads/updates only succeed for accounts carrying the `admin: true`
// custom claim (see firestore.rules + scripts/set-admin-claim.mjs). The PHP
// back-panel session only gates the UI shell — Firestore rules are the real
// protection, so knowing the URL exposes nothing.

import { useCallback, useEffect, useMemo, useState } from 'react'
import {
  signInWithEmailAndPassword, signInWithPopup, GoogleAuthProvider, signOut,
  onAuthStateChanged, type User as FirebaseUser,
} from 'firebase/auth'
import {
  collection, query, orderBy, limit, startAfter, getDocs, doc, updateDoc,
  Timestamp, arrayUnion, type QueryDocumentSnapshot, type DocumentData,
  type UpdateData,
} from 'firebase/firestore'
import { getFirebaseAuth, getDb, isFirebaseConfigured } from '@/lib/firebase'
import {
  type Lead, type LeadStatus, LEAD_STATUSES, LEAD_SOURCES, STATUS_LABELS,
  STATUS_STYLES, SOURCE_LABELS, SUBMITTED_DATA_HEADERS, formatTimestamp,
  tsToDate, safeExternalUrl,
} from '@/lib/leads'
import {
  Zap, Mail, Phone, ExternalLink, X, Archive, ArchiveRestore, UserCheck,
  CalendarClock, StickyNote, PhoneCall, AlertTriangle, ChevronLeft,
  ChevronRight, Search, LogOut, Loader2, ShieldAlert, Inbox,
} from 'lucide-react'

const PAGE_SIZE = 25
const FETCH_BATCH = 200

type Phase = 'config' | 'auth' | 'denied' | 'loading' | 'ready' | 'error'

export default function LeadsPage() {
  const [phase, setPhase] = useState<Phase>('loading')
  const [fbUser, setFbUser] = useState<FirebaseUser | null>(null)
  const [leads, setLeads] = useState<Lead[]>([])
  const [lastDoc, setLastDoc] = useState<QueryDocumentSnapshot<DocumentData> | null>(null)
  const [hasMore, setHasMore] = useState(false)

  // filters
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [sourceFilter, setSourceFilter] = useState<string>('all')
  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo] = useState('')
  const [showArchived, setShowArchived] = useState(false)
  const [sortAsc, setSortAsc] = useState(false)
  const [page, setPage] = useState(0)

  const [selected, setSelected] = useState<Lead | null>(null)

  /* ── Auth ─────────────────────────────────────────────────────────── */

  useEffect(() => {
    if (!isFirebaseConfigured()) { setPhase('config'); return }
    const auth = getFirebaseAuth()
    const unsub = onAuthStateChanged(auth, async (u) => {
      setFbUser(u)
      if (!u) { setPhase('auth'); return }
      const token = await u.getIdTokenResult()
      if (token.claims.admin !== true) { setPhase('denied'); return }
      setPhase('loading')
      void loadLeads(true)
    })
    return () => unsub()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  /* ── Data ─────────────────────────────────────────────────────────── */

  const loadLeads = useCallback(async (reset: boolean) => {
    try {
      const db = getDb()
      let q = query(collection(db, 'leads'), orderBy('createdAt', 'desc'), limit(FETCH_BATCH))
      if (!reset && lastDoc) {
        q = query(collection(db, 'leads'), orderBy('createdAt', 'desc'), startAfter(lastDoc), limit(FETCH_BATCH))
      }
      const snap = await getDocs(q)
      const rows = snap.docs.map((d) => ({ id: d.id, ...d.data() }) as Lead)
      setLeads((prev) => (reset ? rows : [...prev, ...rows]))
      setLastDoc(snap.docs[snap.docs.length - 1] ?? null)
      setHasMore(snap.docs.length === FETCH_BATCH)
      setPhase('ready')
    } catch (err) {
      console.error('leads load failed', err)
      setPhase('error')
    }
  }, [lastDoc])

  async function applyUpdate(lead: Lead, patch: Record<string, unknown>, historyEntry?: Record<string, unknown>) {
    const db = getDb()
    const payload: Record<string, unknown> = { ...patch, updatedAt: Timestamp.now() }
    if (historyEntry) {
      payload.history = arrayUnion({ at: Timestamp.now(), by: fbUser?.email || 'admin', ...historyEntry })
    }
    await updateDoc(doc(db, 'leads', lead.id), payload as UpdateData<DocumentData>)
    const merged = { ...lead, ...patch, updatedAt: Timestamp.now() } as Lead
    setLeads((prev) => prev.map((l) => (l.id === lead.id ? merged : l)))
    setSelected((s) => (s && s.id === lead.id ? merged : s))
  }

  /* ── Derived rows ─────────────────────────────────────────────────── */

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase()
    let rows = leads.filter((l) => Boolean(l.isArchived) === showArchived)
    if (statusFilter !== 'all') rows = rows.filter((l) => l.status === statusFilter)
    if (sourceFilter !== 'all') rows = rows.filter((l) => l.source === sourceFilter)
    if (dateFrom) {
      const from = new Date(dateFrom).getTime()
      rows = rows.filter((l) => (tsToDate(l.createdAt)?.getTime() ?? 0) >= from)
    }
    if (dateTo) {
      const to = new Date(dateTo).getTime() + 24 * 60 * 60 * 1000
      rows = rows.filter((l) => (tsToDate(l.createdAt)?.getTime() ?? 0) < to)
    }
    if (term) {
      rows = rows.filter((l) =>
        [l.fullName, l.businessName, l.businessEmail, l.emailAddress, l.mobileNumber, l.role,
          l.onlinePresenceUrl, l.desiredBusinessOutcome, l.growthConstraint, l.assignedTo]
          .some((v) => (v || '').toLowerCase().includes(term)),
      )
    }
    if (sortAsc) rows = [...rows].reverse()
    return rows
  }, [leads, search, statusFilter, sourceFilter, dateFrom, dateTo, showArchived, sortAsc])

  const pageRows = filtered.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE)
  const pageCount = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))
  useEffect(() => { setPage(0) }, [search, statusFilter, sourceFilter, dateFrom, dateTo, showArchived])

  const summary = useMemo(() => {
    const active = leads.filter((l) => !l.isArchived)
    const inPeriod = active.filter((l) => {
      if (!dateFrom && !dateTo) return true
      const t = tsToDate(l.createdAt)?.getTime() ?? 0
      if (dateFrom && t < new Date(dateFrom).getTime()) return false
      if (dateTo && t >= new Date(dateTo).getTime() + 24 * 60 * 60 * 1000) return false
      return true
    })
    const count = (s: LeadStatus) => active.filter((l) => l.status === s).length
    return [
      { label: 'New leads', value: count('new') },
      { label: 'Qualified', value: count('qualified') },
      { label: 'Discovery scheduled', value: count('discovery_scheduled') },
      { label: 'Proposal sent', value: count('proposal_sent') },
      { label: 'Won', value: count('won') },
      { label: 'Received in period', value: inPeriod.length },
    ]
  }, [leads, dateFrom, dateTo])

  /* ── Auth / error screens ─────────────────────────────────────────── */

  if (phase === 'config') {
    return (
      <Shell>
        <Notice icon={ShieldAlert} title="Firebase is not configured yet.">
          Add the <code className="font-mono text-[13px]">NEXT_PUBLIC_FIREBASE_*</code> variables to <code className="font-mono text-[13px]">.env.local</code> and
          restart the dev server. See <code className="font-mono text-[13px]">docs/FIREBASE-SETUP.md</code>.
        </Notice>
      </Shell>
    )
  }

  if (phase === 'auth') return <Shell><FirebaseSignIn /></Shell>

  if (phase === 'denied') {
    return (
      <Shell>
        <Notice icon={ShieldAlert} title="This account is not authorized for lead data.">
          Signed in as {fbUser?.email || 'unknown'} — this account has no admin claim. Run{' '}
          <code className="font-mono text-[13px]">node scripts/set-admin-claim.mjs {fbUser?.email || 'you@email.com'}</code>{' '}
          then sign out and back in.
          <button onClick={() => signOut(getFirebaseAuth())} className="mt-4 flex items-center gap-2 text-sm font-semibold text-blue-600 hover:text-blue-700">
            <LogOut className="w-4 h-4" /> Sign out of Firebase
          </button>
        </Notice>
      </Shell>
    )
  }

  if (phase === 'error') {
    return (
      <Shell>
        <Notice icon={AlertTriangle} title="Could not load leads.">
          Check your connection and Firestore rules, then{' '}
          <button onClick={() => { setPhase('loading'); void loadLeads(true) }} className="font-semibold text-blue-600 hover:text-blue-700">try again</button>.
        </Notice>
      </Shell>
    )
  }

  if (phase === 'loading') {
    return (
      <Shell>
        <div className="p-16 text-center text-gray-500">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-gray-400" aria-hidden />
          Loading leads…
        </div>
      </Shell>
    )
  }

  /* ── Main view ────────────────────────────────────────────────────── */

  return (
    <Shell
      headerRight={
        <button onClick={() => signOut(getFirebaseAuth())} title={`Firebase: ${fbUser?.email || ''}`}
          className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-800 transition-colors">
          <LogOut className="w-4 h-4" /> {fbUser?.email}
        </button>
      }>

      {/* Overview (spec §13.1) */}
      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-3 mb-6">
        {summary.map((s) => (
          <div key={s.label} className="bg-white rounded-xl border border-gray-200 px-4 py-3.5">
            <p className="text-2xl font-bold text-gray-900 tabular-nums">{s.value}</p>
            <p className="text-[12.5px] text-gray-500 mt-0.5">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl border border-gray-200 p-4 mb-6 flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[220px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" aria-hidden />
          <input type="search" value={search} onChange={(e) => setSearch(e.target.value)}
            placeholder="Search name, business, email, mobile…" aria-label="Search leads"
            className="w-full pl-9 pr-3 py-2 rounded-lg border border-gray-200 text-sm focus:border-gray-400 outline-none" />
        </div>
        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} aria-label="Filter by status"
          className="rounded-lg border border-gray-200 px-3 py-2 text-sm">
          <option value="all">All statuses</option>
          {LEAD_STATUSES.map((s) => <option key={s} value={s}>{STATUS_LABELS[s]}</option>)}
        </select>
        <select value={sourceFilter} onChange={(e) => setSourceFilter(e.target.value)} aria-label="Filter by source"
          className="rounded-lg border border-gray-200 px-3 py-2 text-sm">
          <option value="all">All sources</option>
          {LEAD_SOURCES.map((s) => <option key={s} value={s}>{SOURCE_LABELS[s]}</option>)}
        </select>
        <input type="date" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} aria-label="From date"
          className="rounded-lg border border-gray-200 px-3 py-2 text-sm" />
        <input type="date" value={dateTo} onChange={(e) => setDateTo(e.target.value)} aria-label="To date"
          className="rounded-lg border border-gray-200 px-3 py-2 text-sm" />
        <button onClick={() => setSortAsc((v) => !v)}
          className="rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-600 hover:border-gray-400">
          {sortAsc ? 'Oldest first' : 'Newest first'}
        </button>
        <label className="flex items-center gap-2 text-sm text-gray-600 cursor-pointer">
          <input type="checkbox" checked={showArchived} onChange={(e) => setShowArchived(e.target.checked)} className="w-4 h-4" />
          Archived
        </label>
      </div>

      {/* Empty state */}
      {filtered.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-200 p-16 text-center text-gray-500">
          <Inbox className="w-10 h-10 mx-auto mb-3 text-gray-300" aria-hidden />
          {leads.length === 0 ? 'No leads yet. Submissions from /assessment will appear here.' : 'No leads match the current filters.'}
        </div>
      ) : (
        <>
          {/* Desktop table (spec §6 exact headers) */}
          <div className="hidden lg:block bg-white rounded-xl border border-gray-200 overflow-x-auto">
            <table className="w-full text-sm min-w-[1600px]">
              <thead>
                <tr className="border-b border-gray-200 bg-gray-50 text-left">
                  {[...SUBMITTED_DATA_HEADERS, 'Status', 'Source', 'Assigned To', 'Last Contacted', 'Next Follow-Up', 'Actions'].map((h) => (
                    <th key={h} className="px-4 py-3 font-semibold text-gray-600 whitespace-nowrap max-w-[260px] overflow-hidden text-ellipsis">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {pageRows.map((l) => {
                  const link = safeExternalUrl(l.onlinePresenceUrl)
                  return (
                    <tr key={l.id} className={`hover:bg-gray-50 ${l.possibleDuplicateOf ? 'bg-amber-50/40' : ''}`}>
                      <td className="px-4 py-3 whitespace-nowrap text-gray-500 tabular-nums">{formatTimestamp(l.createdAt)}</td>
                      <td className="px-4 py-3"><a href={`mailto:${l.emailAddress}`} className="text-blue-600 hover:underline">{l.emailAddress}</a></td>
                      <td className="px-4 py-3 font-medium text-gray-900 whitespace-nowrap">
                        {l.fullName}
                        {l.possibleDuplicateOf && <span title="Possible duplicate" className="ml-1.5 inline-flex align-middle"><AlertTriangle className="w-3.5 h-3.5 text-amber-500" /></span>}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">{l.businessName}</td>
                      <td className="px-4 py-3"><a href={`mailto:${l.businessEmail}`} className="text-blue-600 hover:underline">{l.businessEmail}</a></td>
                      <td className="px-4 py-3 whitespace-nowrap"><a href={`tel:${l.mobileNumber}`} className="text-blue-600 hover:underline">{l.mobileNumber}</a></td>
                      <td className="px-4 py-3 whitespace-nowrap">{l.role}</td>
                      <td className="px-4 py-3 max-w-[220px] truncate">
                        {link
                          ? <a href={link} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">{l.onlinePresenceUrl}</a>
                          : l.onlinePresenceUrl}
                      </td>
                      <td className="px-4 py-3 max-w-[220px] truncate">{l.desiredBusinessOutcome}</td>
                      <td className="px-4 py-3 max-w-[260px] truncate" title={l.growthConstraint}>{l.growthConstraint}</td>
                      <td className="px-4 py-3"><StatusBadge status={l.status} /></td>
                      <td className="px-4 py-3 whitespace-nowrap">{SOURCE_LABELS[l.source] || l.source}</td>
                      <td className="px-4 py-3 whitespace-nowrap">{l.assignedTo || '—'}</td>
                      <td className="px-4 py-3 whitespace-nowrap text-gray-500">{l.lastContactedAt ? formatTimestamp(l.lastContactedAt) : '—'}</td>
                      <td className="px-4 py-3 whitespace-nowrap text-gray-500">{l.nextFollowUpAt ? formatTimestamp(l.nextFollowUpAt) : '—'}</td>
                      <td className="px-4 py-3">
                        <button onClick={() => setSelected(l)} className="text-blue-600 hover:text-blue-700 font-semibold whitespace-nowrap">View details</button>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>

          {/* Mobile cards (spec §6 responsive pattern) */}
          <div className="lg:hidden space-y-3">
            {pageRows.map((l) => (
              <button key={l.id} onClick={() => setSelected(l)}
                className="w-full text-left bg-white rounded-xl border border-gray-200 p-4 hover:border-gray-300 transition-colors">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="font-semibold text-gray-900">{l.fullName}</p>
                    <p className="text-sm text-gray-600">{l.businessName}</p>
                  </div>
                  <StatusBadge status={l.status} />
                </div>
                <p className="mt-2 text-xs text-gray-400 tabular-nums">{formatTimestamp(l.createdAt)} · {SOURCE_LABELS[l.source] || l.source}</p>
                <p className="mt-2 text-sm text-gray-600 line-clamp-2">{l.growthConstraint}</p>
              </button>
            ))}
          </div>

          {/* Pagination */}
          <div className="mt-4 flex items-center justify-between text-sm text-gray-500">
            <span>{filtered.length} lead{filtered.length === 1 ? '' : 's'} · page {page + 1} of {pageCount}</span>
            <div className="flex items-center gap-2">
              {hasMore && (
                <button onClick={() => void loadLeads(false)} className="px-3 py-1.5 rounded-lg border border-gray-200 hover:border-gray-400">
                  Load older leads
                </button>
              )}
              <button onClick={() => setPage((p) => Math.max(0, p - 1))} disabled={page === 0} aria-label="Previous page"
                className="p-2 rounded-lg border border-gray-200 disabled:opacity-40 hover:border-gray-400"><ChevronLeft className="w-4 h-4" /></button>
              <button onClick={() => setPage((p) => Math.min(pageCount - 1, p + 1))} disabled={page >= pageCount - 1} aria-label="Next page"
                className="p-2 rounded-lg border border-gray-200 disabled:opacity-40 hover:border-gray-400"><ChevronRight className="w-4 h-4" /></button>
            </div>
          </div>
        </>
      )}

      {selected && (
        <LeadDrawer
          lead={selected}
          allLeads={leads}
          onClose={() => setSelected(null)}
          onUpdate={applyUpdate}
        />
      )}
    </Shell>
  )
}

/* ── Sub-components ──────────────────────────────────────────────────── */

function Shell({ children, headerRight }: { children: React.ReactNode; headerRight?: React.ReactNode }) {
  return (
    <div className="p-6 md:p-8">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2.5">
            <Zap className="w-7 h-7 text-amber-500" aria-hidden /> Leads
          </h1>
          <p className="text-gray-600 mt-1">Business Growth Assessment submissions from /assessment</p>
        </div>
        {headerRight}
      </div>
      {children}
    </div>
  )
}

function Notice({ icon: Icon, title, children }: { icon: typeof ShieldAlert; title: string; children: React.ReactNode }) {
  return (
    <div className="max-w-xl bg-white rounded-xl border border-gray-200 p-8">
      <Icon className="w-8 h-8 text-amber-500 mb-4" aria-hidden />
      <h2 className="text-lg font-bold text-gray-900 mb-2">{title}</h2>
      <div className="text-sm text-gray-600 leading-relaxed">{children}</div>
    </div>
  )
}

function FirebaseSignIn() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')

  async function withBusy(fn: () => Promise<unknown>) {
    setBusy(true); setError('')
    try { await fn() } catch (e: unknown) {
      const code = (e as { code?: string })?.code || ''
      setError(code.includes('auth/') ? 'Sign-in failed. Check the credentials and try again.' : 'Sign-in failed.')
    } finally { setBusy(false) }
  }

  return (
    <div className="max-w-md bg-white rounded-xl border border-gray-200 p-8">
      <h2 className="text-lg font-bold text-gray-900 mb-1">Lead data sign-in</h2>
      <p className="text-sm text-gray-500 mb-6">Lead records are protected separately. Sign in with an approved Firebase admin account.</p>
      {error && <p role="alert" className="mb-4 text-sm text-red-600">{error}</p>}
      <form onSubmit={(e) => { e.preventDefault(); void withBusy(() => signInWithEmailAndPassword(getFirebaseAuth(), email, password)) }} className="space-y-3">
        <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Admin email" autoComplete="username"
          className="w-full rounded-lg border border-gray-200 px-4 py-2.5 text-sm focus:border-gray-400 outline-none" />
        <input type="password" required value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Password" autoComplete="current-password"
          className="w-full rounded-lg border border-gray-200 px-4 py-2.5 text-sm focus:border-gray-400 outline-none" />
        <button type="submit" disabled={busy}
          className="w-full bg-gray-900 hover:bg-gray-800 disabled:opacity-60 text-white font-semibold rounded-lg py-2.5 text-sm transition-colors">
          {busy ? 'Signing in…' : 'Sign In'}
        </button>
      </form>
      <button onClick={() => void withBusy(() => signInWithPopup(getFirebaseAuth(), new GoogleAuthProvider()))} disabled={busy}
        className="mt-3 w-full border border-gray-200 hover:border-gray-400 text-gray-700 font-semibold rounded-lg py-2.5 text-sm transition-colors">
        Continue with Google
      </button>
    </div>
  )
}

function StatusBadge({ status }: { status: LeadStatus }) {
  return (
    <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-[12px] font-semibold whitespace-nowrap ${STATUS_STYLES[status] || STATUS_STYLES.closed}`}>
      {STATUS_LABELS[status] || status}
    </span>
  )
}

function LeadDrawer({ lead, allLeads, onClose, onUpdate }: {
  lead: Lead
  allLeads: Lead[]
  onClose: () => void
  onUpdate: (lead: Lead, patch: Record<string, unknown>, historyEntry?: Record<string, unknown>) => Promise<void>
}) {
  const [note, setNote] = useState('')
  const [assignTo, setAssignTo] = useState(lead.assignedTo || '')
  const [followUp, setFollowUp] = useState('')
  const [saving, setSaving] = useState<string | null>(null)
  const link = safeExternalUrl(lead.onlinePresenceUrl)
  const duplicateOf = lead.possibleDuplicateOf ? allLeads.find((l) => l.id === lead.possibleDuplicateOf) : null

  async function run(key: string, fn: () => Promise<void>) {
    setSaving(key)
    try { await fn() } catch (e) { console.error(e); alert('Update failed. Please try again.') }
    setSaving(null)
  }

  const answers: [string, string][] = [
    [SUBMITTED_DATA_HEADERS[2], lead.fullName],
    [SUBMITTED_DATA_HEADERS[3], lead.businessName],
    [SUBMITTED_DATA_HEADERS[4], lead.businessEmail],
    [SUBMITTED_DATA_HEADERS[5], lead.mobileNumber],
    [SUBMITTED_DATA_HEADERS[6], lead.role],
    [SUBMITTED_DATA_HEADERS[7], lead.onlinePresenceUrl],
    [SUBMITTED_DATA_HEADERS[8], lead.desiredBusinessOutcome],
    [SUBMITTED_DATA_HEADERS[9], lead.growthConstraint],
  ]

  const metaRows: [string, string | undefined][] = [
    ['Source', SOURCE_LABELS[lead.source] || lead.source],
    ['Campaign', lead.utmCampaign || lead.campaign],
    ['UTM source / medium', [lead.utmSource, lead.utmMedium].filter(Boolean).join(' / ') || undefined],
    ['UTM content / term', [lead.utmContent, lead.utmTerm].filter(Boolean).join(' / ') || undefined],
    ['fbclid', lead.fbclid],
    ['Landing page', lead.pagePath],
    ['Referrer', lead.referrer],
    ['User agent', lead.userAgent],
  ]

  return (
    <div className="fixed inset-0 z-50 flex justify-end" role="dialog" aria-modal="true" aria-label={`Lead: ${lead.fullName}`}>
      <button className="absolute inset-0 bg-black/30" onClick={onClose} aria-label="Close" />
      <div className="relative w-full max-w-2xl h-full bg-white shadow-2xl overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-start justify-between gap-4 z-10">
          <div>
            <div className="flex items-center gap-2.5 flex-wrap">
              <h2 className="text-xl font-bold text-gray-900">{lead.fullName}</h2>
              <StatusBadge status={lead.status} />
              {lead.isArchived && <span className="text-[12px] font-semibold text-gray-400 border border-gray-200 rounded-full px-2.5 py-0.5">Archived</span>}
            </div>
            <p className="text-sm text-gray-500 mt-0.5">{lead.businessName} · {formatTimestamp(lead.createdAt)}</p>
          </div>
          <button onClick={onClose} aria-label="Close details" className="p-2 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-7">
          {lead.possibleDuplicateOf && (
            <div className="flex gap-3 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
              <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" aria-hidden />
              <span>
                Possible duplicate of an earlier lead{duplicateOf ? <> from <strong>{duplicateOf.fullName}</strong> ({formatTimestamp(duplicateOf.createdAt)})</> : <> (ID {lead.possibleDuplicateOf})</>}.
              </span>
            </div>
          )}

          {/* Direct actions */}
          <div className="flex flex-wrap gap-2">
            <a href={`mailto:${lead.businessEmail}`} className="inline-flex items-center gap-2 rounded-lg bg-gray-900 text-white px-4 py-2 text-sm font-semibold hover:bg-gray-800">
              <Mail className="w-4 h-4" /> Email
            </a>
            <a href={`tel:${lead.mobileNumber}`} className="inline-flex items-center gap-2 rounded-lg border border-gray-200 px-4 py-2 text-sm font-semibold text-gray-700 hover:border-gray-400">
              <Phone className="w-4 h-4" /> Call
            </a>
            {link && (
              <a href={link} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 rounded-lg border border-gray-200 px-4 py-2 text-sm font-semibold text-gray-700 hover:border-gray-400">
                <ExternalLink className="w-4 h-4" /> Online presence
              </a>
            )}
          </div>

          {/* Status + operational controls */}
          <section className="rounded-xl border border-gray-200 p-5 space-y-4">
            <h3 className="font-bold text-gray-900">Manage</h3>
            <div className="grid sm:grid-cols-2 gap-3">
              <label className="text-sm">
                <span className="block text-gray-500 mb-1">Status</span>
                <select value={lead.status} disabled={saving === 'status'}
                  onChange={(e) => void run('status', () => onUpdate(lead, { status: e.target.value }, { field: 'status', from: lead.status, to: e.target.value }))}
                  className="w-full rounded-lg border border-gray-200 px-3 py-2">
                  {LEAD_STATUSES.map((s) => <option key={s} value={s}>{STATUS_LABELS[s]}</option>)}
                </select>
              </label>
              <label className="text-sm">
                <span className="block text-gray-500 mb-1">Assigned to</span>
                <div className="flex gap-2">
                  <input value={assignTo} onChange={(e) => setAssignTo(e.target.value)} placeholder="Name or email"
                    className="flex-1 rounded-lg border border-gray-200 px-3 py-2" />
                  <button disabled={saving === 'assign'}
                    onClick={() => void run('assign', () => onUpdate(lead, { assignedTo: assignTo.trim() }, { field: 'assignedTo', to: assignTo.trim() }))}
                    className="rounded-lg border border-gray-200 px-3 text-sm font-semibold text-gray-700 hover:border-gray-400">
                    <UserCheck className="w-4 h-4" />
                  </button>
                </div>
              </label>
              <label className="text-sm">
                <span className="block text-gray-500 mb-1">Next follow-up</span>
                <div className="flex gap-2">
                  <input type="datetime-local" value={followUp} onChange={(e) => setFollowUp(e.target.value)}
                    className="flex-1 rounded-lg border border-gray-200 px-3 py-2" />
                  <button disabled={saving === 'followup' || !followUp}
                    onClick={() => void run('followup', () => onUpdate(lead, { nextFollowUpAt: Timestamp.fromDate(new Date(followUp)) }, { field: 'followUp', to: followUp }))}
                    className="rounded-lg border border-gray-200 px-3 text-sm font-semibold text-gray-700 hover:border-gray-400 disabled:opacity-40">
                    <CalendarClock className="w-4 h-4" />
                  </button>
                </div>
              </label>
              <div className="text-sm flex items-end gap-2">
                <button disabled={saving === 'contacted'}
                  onClick={() => void run('contacted', () => onUpdate(lead, { lastContactedAt: Timestamp.now(), ...(lead.status === 'new' && { status: 'contacted' }) }, { field: 'contacted' }))}
                  className="flex-1 inline-flex items-center justify-center gap-2 rounded-lg border border-gray-200 px-3 py-2 font-semibold text-gray-700 hover:border-gray-400">
                  <PhoneCall className="w-4 h-4" /> Mark contacted
                </button>
                <button disabled={saving === 'archive'}
                  onClick={() => void run('archive', () => onUpdate(lead, { isArchived: !lead.isArchived }, { field: 'archive', to: String(!lead.isArchived) }))}
                  className="flex-1 inline-flex items-center justify-center gap-2 rounded-lg border border-gray-200 px-3 py-2 font-semibold text-gray-700 hover:border-gray-400">
                  {lead.isArchived ? <><ArchiveRestore className="w-4 h-4" /> Restore</> : <><Archive className="w-4 h-4" /> Archive</>}
                </button>
              </div>
            </div>

            {/* Internal note */}
            <div>
              <span className="block text-sm text-gray-500 mb-1">Add internal note</span>
              <div className="flex gap-2">
                <textarea value={note} onChange={(e) => setNote(e.target.value)} rows={2}
                  className="flex-1 rounded-lg border border-gray-200 px-3 py-2 text-sm resize-y" />
                <button disabled={saving === 'note' || !note.trim()}
                  onClick={() => void run('note', async () => {
                    const stamp = new Date().toLocaleString('en-PH')
                    const merged = `${lead.internalNotes ? lead.internalNotes + '\n\n' : ''}[${stamp}] ${note.trim()}`
                    await onUpdate(lead, { internalNotes: merged }, { field: 'note', to: note.trim().slice(0, 120) })
                    setNote('')
                  })}
                  className="self-start rounded-lg border border-gray-200 px-3 py-2 text-sm font-semibold text-gray-700 hover:border-gray-400 disabled:opacity-40">
                  <StickyNote className="w-4 h-4" />
                </button>
              </div>
              {lead.internalNotes && (
                <pre className="mt-3 whitespace-pre-wrap rounded-lg bg-gray-50 border border-gray-200 p-3 text-[13px] text-gray-700 font-sans">{lead.internalNotes}</pre>
              )}
            </div>
          </section>

          {/* Submitted answers */}
          <section className="rounded-xl border border-gray-200 p-5">
            <h3 className="font-bold text-gray-900 mb-4">Submitted answers</h3>
            <dl className="space-y-4">
              {answers.map(([q, a]) => (
                <div key={q}>
                  <dt className="text-[12.5px] font-semibold uppercase tracking-wide text-gray-400">{q}</dt>
                  <dd className="mt-1 text-[15px] text-gray-800 whitespace-pre-wrap break-words">{a || '—'}</dd>
                </div>
              ))}
            </dl>
          </section>

          {/* Attribution */}
          <section className="rounded-xl border border-gray-200 p-5">
            <h3 className="font-bold text-gray-900 mb-4">Source & campaign</h3>
            <dl className="space-y-2.5">
              {metaRows.map(([k, v]) => v ? (
                <div key={k} className="flex gap-4 text-sm">
                  <dt className="w-40 shrink-0 text-gray-400">{k}</dt>
                  <dd className="text-gray-700 break-all">{v}</dd>
                </div>
              ) : null)}
              <div className="flex gap-4 text-sm">
                <dt className="w-40 shrink-0 text-gray-400">Consent</dt>
                <dd className="text-gray-700">{lead.consentAccepted ? 'Accepted' : 'Not recorded'}</dd>
              </div>
            </dl>
          </section>

          {/* History */}
          <section className="rounded-xl border border-gray-200 p-5">
            <h3 className="font-bold text-gray-900 mb-4">History</h3>
            {lead.history?.length ? (
              <ol className="space-y-2.5">
                {[...lead.history].reverse().map((h, i) => (
                  <li key={i} className="text-sm text-gray-600 flex gap-3">
                    <span className="text-gray-400 tabular-nums shrink-0">{formatTimestamp(h.at as never)}</span>
                    <span>
                      {h.field === 'status' && <>Status: {STATUS_LABELS[h.from as LeadStatus] || h.from || '—'} → <strong>{STATUS_LABELS[h.to as LeadStatus] || h.to}</strong></>}
                      {h.field === 'assignedTo' && <>Assigned to <strong>{h.to || '—'}</strong></>}
                      {h.field === 'note' && <>Note added: “{h.to}”</>}
                      {h.field === 'contacted' && <>Marked contacted</>}
                      {h.field === 'followUp' && <>Follow-up set: {h.to}</>}
                      {h.field === 'archive' && <>{h.to === 'true' ? 'Archived' : 'Restored'}</>}
                      {h.by && <span className="text-gray-400"> — {h.by}</span>}
                    </span>
                  </li>
                ))}
              </ol>
            ) : (
              <p className="text-sm text-gray-400">No changes recorded yet.</p>
            )}
            <p className="mt-4 pt-3 border-t border-gray-100 text-[12.5px] text-gray-400">
              Created {formatTimestamp(lead.createdAt)} · Updated {formatTimestamp(lead.updatedAt)} · ID {lead.id}
            </p>
          </section>
        </div>
      </div>
    </div>
  )
}

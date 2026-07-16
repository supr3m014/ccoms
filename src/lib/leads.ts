// Shared Lead model for the Business Growth Assessment system.
// Client-safe: no firebase-admin imports here. The server-side twin lives in
// functions/src/index.ts and must stay field-compatible with this file.

export const LEAD_STATUSES = [
  'new',
  'reviewing',
  'qualified',
  'contacted',
  'discovery_scheduled',
  'proposal_sent',
  'won',
  'nurture',
  'not_qualified',
  'closed',
] as const
export type LeadStatus = (typeof LEAD_STATUSES)[number]

export const LEAD_SOURCES = [
  'meta_ads',
  'facebook',
  'instagram',
  'website',
  'referral',
  'google',
  'direct',
  'other',
] as const
export type LeadSource = (typeof LEAD_SOURCES)[number]

// Firestore Timestamp shape as it arrives through the client SDK.
export interface TimestampLike {
  seconds: number
  nanoseconds: number
  toDate?: () => Date
}

export interface LeadHistoryEntry {
  at: TimestampLike | Date
  field: 'status' | 'assignedTo' | 'note' | 'contacted' | 'followUp' | 'archive'
  from?: string
  to?: string
  by?: string
}

export interface Lead {
  id: string

  createdAt: TimestampLike
  updatedAt: TimestampLike

  emailAddress: string
  fullName: string
  businessName: string
  businessEmail: string
  mobileNumber: string
  role: string
  onlinePresenceUrl: string
  desiredBusinessOutcome: string
  growthConstraint: string

  source: LeadSource
  campaign?: string
  adSet?: string
  ad?: string
  utmSource?: string
  utmMedium?: string
  utmCampaign?: string
  utmContent?: string
  utmTerm?: string
  fbclid?: string

  status: LeadStatus
  assignedTo?: string
  lastContactedAt?: TimestampLike | null
  nextFollowUpAt?: TimestampLike | null
  internalNotes?: string
  history?: LeadHistoryEntry[]

  consentAccepted: boolean
  pagePath: string
  referrer?: string
  userAgent?: string

  duplicateFingerprint?: string
  possibleDuplicateOf?: string
  spamScore?: number
  isArchived: boolean
}

/* ── Display metadata ─────────────────────────────────────────────────── */

export const STATUS_LABELS: Record<LeadStatus, string> = {
  new: 'New',
  reviewing: 'Reviewing',
  qualified: 'Qualified',
  contacted: 'Contacted',
  discovery_scheduled: 'Discovery Scheduled',
  proposal_sent: 'Proposal Sent',
  won: 'Won',
  nurture: 'Nurture',
  not_qualified: 'Not Qualified',
  closed: 'Closed',
}

// Spec §13.5 — never rely on color alone; always render the text label too.
export const STATUS_STYLES: Record<LeadStatus, string> = {
  new: 'bg-blue-50 text-blue-700 border-blue-200',
  reviewing: 'bg-slate-100 text-slate-700 border-slate-300',
  qualified: 'bg-amber-50 text-amber-800 border-amber-300',
  contacted: 'bg-violet-50 text-violet-700 border-violet-200',
  discovery_scheduled: 'bg-cyan-50 text-cyan-700 border-cyan-200',
  proposal_sent: 'bg-indigo-50 text-indigo-700 border-indigo-200',
  won: 'bg-green-50 text-green-700 border-green-300',
  nurture: 'bg-neutral-100 text-neutral-700 border-neutral-300',
  not_qualified: 'bg-red-50 text-red-600/80 border-red-200',
  closed: 'bg-gray-100 text-gray-600 border-gray-300',
}

export const SOURCE_LABELS: Record<LeadSource, string> = {
  meta_ads: 'Meta Ads',
  facebook: 'Facebook',
  instagram: 'Instagram',
  website: 'Website',
  referral: 'Referral',
  google: 'Google',
  direct: 'Direct',
  other: 'Other',
}

// Spec §6 — exact submitted-data headers, in this exact order.
export const SUBMITTED_DATA_HEADERS = [
  'Timestamp',
  'Email Address',
  'What is your full name?',
  'What is the name of your business or organization?',
  'What is your business email address?',
  'What is the best mobile number to reach you?',
  'What best describes your role in the business?',
  'Please share your website or primary online presence.',
  'What business outcome would you most like to improve over the next 6–12 months?',
  'Briefly describe what you believe is currently limiting your business growth.',
] as const

/* ── Form option lists (spec §8.4) ───────────────────────────────────── */

export const ROLE_OPTIONS = [
  'Owner / Founder',
  'CEO / President',
  'General Manager',
  'Marketing Decision-Maker',
  'Department Head / Manager',
  'Executive Assistant / Representative',
  'Other',
] as const

export const OUTCOME_OPTIONS = [
  'Generate more qualified inquiries',
  'Improve online visibility',
  'Increase customer conversion',
  'Strengthen customer retention',
  'Build a stronger digital foundation',
  'Not sure yet',
] as const

/* ── Helpers ─────────────────────────────────────────────────────────── */

export function tsToDate(ts: TimestampLike | Date | null | undefined): Date | null {
  if (!ts) return null
  if (ts instanceof Date) return ts
  if (typeof ts.toDate === 'function') return ts.toDate()
  if (typeof ts.seconds === 'number') return new Date(ts.seconds * 1000)
  return null
}

export function formatTimestamp(ts: TimestampLike | Date | null | undefined): string {
  const d = tsToDate(ts)
  if (!d) return '—'
  return d.toLocaleString('en-PH', {
    year: 'numeric', month: 'numeric', day: 'numeric',
    hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false,
  })
}

// Normalize a user-entered link for safe display/opening. Never trust it as HTML.
export function safeExternalUrl(raw: string): string | null {
  const v = (raw || '').trim()
  if (!v) return null
  const withProto = /^https?:\/\//i.test(v) ? v : `https://${v}`
  try {
    const u = new URL(withProto)
    if (u.protocol !== 'https:' && u.protocol !== 'http:') return null
    return u.href
  } catch {
    return null
  }
}

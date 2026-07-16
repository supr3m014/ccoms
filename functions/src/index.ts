/**
 * Core Conversion — Business Growth Assessment intake.
 *
 * POST submitAssessment
 *   Validates, normalizes, spam-checks, and writes a lead document to the
 *   Firestore `leads` collection via the Admin SDK. The public site is a
 *   static export on Hostinger, so this function IS the server-side endpoint
 *   from the spec (§3.3 / §11). No Admin credentials ever reach the browser.
 */

import { onRequest } from 'firebase-functions/v2/https'
import { logger } from 'firebase-functions/v2'
import { initializeApp } from 'firebase-admin/app'
import { getFirestore, Timestamp, FieldValue } from 'firebase-admin/firestore'
import { createHash } from 'node:crypto'

initializeApp()
const db = getFirestore()

/* ── Approved options (must match src/lib/leads.ts) ─────────────────── */

const ROLE_OPTIONS = [
  'Owner / Founder',
  'CEO / President',
  'General Manager',
  'Marketing Decision-Maker',
  'Department Head / Manager',
  'Executive Assistant / Representative',
  'Other',
]

const OUTCOME_OPTIONS = [
  'Generate more qualified inquiries',
  'Improve online visibility',
  'Increase customer conversion',
  'Strengthen customer retention',
  'Build a stronger digital foundation',
  'Not sure yet',
]

const ALLOWED_ORIGINS = [
  'https://ccoms.ph',
  'https://www.ccoms.ph',
  'http://localhost:3000',
  'http://localhost:3001',
  'http://127.0.0.1:3000',
]

/* ── Helpers ─────────────────────────────────────────────────────────── */

type Body = Record<string, unknown>

const str = (v: unknown, max = 2000): string =>
  typeof v === 'string' ? v.replace(/<[^>]*>/g, '').trim().slice(0, max) : ''

function validationError(res: any) {
  res.status(400).json({ success: false, message: 'Please review the highlighted fields.' })
}

function normalizeMobile(raw: string): string {
  return raw.replace(/[\s().-]/g, '')
}

function normalizeEmail(raw: string): string {
  return raw.trim().toLowerCase()
}

function deriveSource(utmSource: string, referrer: string, fbclid: string): string {
  const s = utmSource.toLowerCase()
  if (s === 'facebook' || s === 'fb' || s === 'meta') return 'meta_ads'
  if (s === 'instagram' || s === 'ig') return 'instagram'
  if (s === 'google') return 'google'
  if (s === 'referral') return 'referral'
  if (s) return 'other'
  if (fbclid) return 'facebook'
  if (/facebook\.com|fb\.com/i.test(referrer)) return 'facebook'
  if (/instagram\.com/i.test(referrer)) return 'instagram'
  if (/google\./i.test(referrer)) return 'google'
  if (referrer) return 'website'
  return 'direct'
}

/* ── The endpoint ────────────────────────────────────────────────────── */

export const submitAssessment = onRequest(
  { region: 'asia-southeast1', cors: ALLOWED_ORIGINS, maxInstances: 5 },
  async (req, res) => {
    if (req.method !== 'POST') {
      res.status(405).json({ success: false, message: 'Method not allowed.' })
      return
    }

    const body: Body = (req.body ?? {}) as Body
    const meta = (typeof body.meta === 'object' && body.meta !== null ? body.meta : {}) as Record<string, unknown>

    /* 1 · Honeypot — bots fill it; humans never see it. Respond as success
       so automated tooling learns nothing (spec §10). */
    if (str(body.website_confirm, 100).length > 0) {
      logger.info('honeypot rejection')
      res.json({ success: true, message: 'Assessment received.' })
      return
    }

    /* 2 · Time-on-page check — a real person needs more than 3 seconds. */
    const startedAt = Number(body.formStartedAt)
    if (!Number.isFinite(startedAt) || Date.now() - startedAt < 3000 || Date.now() - startedAt > 6 * 60 * 60 * 1000) {
      logger.info('timestamp rejection', { elapsedMs: Date.now() - startedAt })
      validationError(res)
      return
    }

    /* 3 · Validate + normalize (spec §9). */
    const fullName = str(body.fullName, 120)
    const businessName = str(body.businessName, 160)
    const businessEmail = normalizeEmail(str(body.businessEmail, 254))
    const mobileNumber = normalizeMobile(str(body.mobileNumber, 40))
    const role = str(body.role, 80)
    const onlinePresenceUrl = str(body.onlinePresenceUrl, 500)
    const desiredBusinessOutcome = str(body.desiredBusinessOutcome, 120)
    const growthConstraint = str(body.growthConstraint, 2000)
    const consentAccepted = body.consentAccepted === true

    const valid =
      fullName.length >= 2 &&
      businessName.length >= 2 &&
      /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(businessEmail) &&
      /^\+?\d{7,25}$/.test(mobileNumber) &&
      ROLE_OPTIONS.includes(role) &&
      onlinePresenceUrl.length >= 3 &&
      OUTCOME_OPTIONS.includes(desiredBusinessOutcome) &&
      growthConstraint.length >= 5 &&
      consentAccepted

    if (!valid) {
      validationError(res)
      return
    }

    /* 4 · Rate limit — max 3 submissions per IP per 10 minutes. Counter docs
       live in `rate_limits` (locked to the public by Firestore rules). */
    const ip = (req.headers['x-forwarded-for'] as string | undefined)?.split(',')[0]?.trim() || req.ip || 'unknown'
    const ipHash = createHash('sha256').update(ip).digest('hex').slice(0, 32)
    const windowStart = Timestamp.fromMillis(Date.now() - 10 * 60 * 1000)
    const rlRef = db.collection('rate_limits').doc(ipHash)

    try {
      const allowed = await db.runTransaction(async (tx) => {
        const snap = await tx.get(rlRef)
        const data = snap.data()
        if (data && data.windowStart.toMillis() > windowStart.toMillis() && data.count >= 3) return false
        if (data && data.windowStart.toMillis() > windowStart.toMillis()) {
          tx.update(rlRef, { count: FieldValue.increment(1) })
        } else {
          tx.set(rlRef, { windowStart: Timestamp.now(), count: 1 })
        }
        return true
      })
      if (!allowed) {
        res.status(429).json({ success: false, message: 'Too many submissions. Please try again shortly.' })
        return
      }
    } catch (err) {
      logger.error('rate-limit transaction failed', err as Error)
      // fail open — do not lose a legitimate lead over a limiter hiccup
    }

    /* 5 · Duplicate detection — flag, never block (spec §10). */
    const duplicateFingerprint = createHash('sha256')
      .update(`${businessEmail}|${mobileNumber}`)
      .digest('hex')
      .slice(0, 32)

    let possibleDuplicateOf: string | null = null
    try {
      const dup = await db
        .collection('leads')
        .where('duplicateFingerprint', '==', duplicateFingerprint)
        .orderBy('createdAt', 'desc')
        .limit(1)
        .get()
      if (!dup.empty) possibleDuplicateOf = dup.docs[0].id
    } catch (err) {
      logger.warn('duplicate lookup failed', err as Error)
    }

    /* 6 · Build and save the lead (spec §5). */
    const now = Timestamp.now()
    const utmSource = str(meta.utm_source, 300)
    const referrer = str(meta.referrer, 500)
    const fbclid = str(meta.fbclid, 300)

    const lead = {
      createdAt: now,
      updatedAt: now,

      emailAddress: businessEmail,
      fullName,
      businessName,
      businessEmail,
      mobileNumber,
      role,
      onlinePresenceUrl,
      desiredBusinessOutcome,
      growthConstraint,

      source: deriveSource(utmSource, referrer, fbclid),
      ...(utmSource && { utmSource }),
      ...(str(meta.utm_medium, 300) && { utmMedium: str(meta.utm_medium, 300) }),
      ...(str(meta.utm_campaign, 300) && { utmCampaign: str(meta.utm_campaign, 300), campaign: str(meta.utm_campaign, 300) }),
      ...(str(meta.utm_content, 300) && { utmContent: str(meta.utm_content, 300) }),
      ...(str(meta.utm_term, 300) && { utmTerm: str(meta.utm_term, 300) }),
      ...(fbclid && { fbclid }),

      status: 'new',
      lastContactedAt: null,
      nextFollowUpAt: null,

      consentAccepted: true,
      pagePath: str(meta.pagePath, 300) || '/assessment',
      ...(referrer && { referrer }),
      ...(str(req.headers['user-agent'], 400) && { userAgent: str(req.headers['user-agent'], 400) }),

      duplicateFingerprint,
      ...(possibleDuplicateOf && { possibleDuplicateOf }),
      isArchived: false,
    }

    try {
      await db.collection('leads').add(lead)
    } catch (err) {
      logger.error('lead write failed', err as Error)
      res.status(500).json({ success: false, message: 'We could not save your assessment. Please try again.' })
      return
    }

    res.json({ success: true, message: 'Assessment received.' })
  }
)

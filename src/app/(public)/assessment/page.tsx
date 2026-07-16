'use client'

import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { Reveal } from '@/components/Reveal'
import { track } from '@/lib/track'
import { ROLE_OPTIONS, OUTCOME_OPTIONS } from '@/lib/leads'
import { ArrowRight, CheckCircle2, AlertCircle, Clock } from 'lucide-react'

// The Cloud Function endpoint. Local dev falls back to the Functions emulator.
// Production MUST set NEXT_PUBLIC_ASSESSMENT_ENDPOINT (see docs/FIREBASE-SETUP.md).
const ENDPOINT =
  process.env.NEXT_PUBLIC_ASSESSMENT_ENDPOINT ||
  (process.env.NODE_ENV === 'development'
    ? 'http://127.0.0.1:5001/demo-ccoms/asia-southeast1/submitAssessment'
    : '')

type Fields = {
  fullName: string
  businessName: string
  businessEmail: string
  mobileNumber: string
  role: string
  onlinePresenceUrl: string
  desiredBusinessOutcome: string
  growthConstraint: string
  consentAccepted: boolean
}

const EMPTY: Fields = {
  fullName: '', businessName: '', businessEmail: '', mobileNumber: '',
  role: '', onlinePresenceUrl: '', desiredBusinessOutcome: '', growthConstraint: '',
  consentAccepted: false,
}

type Errors = Partial<Record<keyof Fields, string>>

// Client-side mirror of the server rules (spec §9). The server re-validates everything.
function validate(f: Fields): Errors {
  const e: Errors = {}
  const name = f.fullName.trim()
  if (name.length < 2 || name.length > 120) e.fullName = 'Please enter your full name (2–120 characters).'
  const biz = f.businessName.trim()
  if (biz.length < 2 || biz.length > 160) e.businessName = 'Please enter your business or organization name.'
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(f.businessEmail.trim())) e.businessEmail = 'Please enter a valid email address.'
  const mobile = f.mobileNumber.replace(/[\s().-]/g, '')
  if (!/^\+?\d{7,25}$/.test(mobile)) e.mobileNumber = 'Please enter a valid mobile number (7–25 digits).'
  if (!ROLE_OPTIONS.includes(f.role as (typeof ROLE_OPTIONS)[number])) e.role = 'Please select your role.'
  const presence = f.onlinePresenceUrl.trim()
  if (presence.length < 3 || presence.length > 500) e.onlinePresenceUrl = 'Please share a website or business link (3–500 characters).'
  if (!OUTCOME_OPTIONS.includes(f.desiredBusinessOutcome as (typeof OUTCOME_OPTIONS)[number])) e.desiredBusinessOutcome = 'Please select the closest answer.'
  const constraint = f.growthConstraint.trim()
  if (constraint.length < 5 || constraint.length > 2000) e.growthConstraint = 'A short answer is enough — at least a sentence (5–2,000 characters).'
  if (!f.consentAccepted) e.consentAccepted = 'Please confirm you agree before submitting.'
  return e
}

function fieldClasses(hasError: boolean): string {
  return `w-full rounded-lg border bg-white px-4 py-3.5 text-[16px] text-[#0A1730] placeholder:text-slate-400 outline-none transition-colors
    ${hasError ? 'border-red-400 focus:border-red-500' : 'cc-rule-md focus:border-[#0A1730]'}`
}

function FieldError({ id, children }: { id: string; children?: string }) {
  if (!children) return null
  return (
    <p id={id} role="alert" className="mt-2 flex items-start gap-1.5 text-[13.5px] text-red-600">
      <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" aria-hidden /> {children}
    </p>
  )
}

export default function AssessmentPage() {
  const [fields, setFields] = useState<Fields>(EMPTY)
  const [errors, setErrors] = useState<Errors>({})
  const [phase, setPhase] = useState<'form' | 'submitting' | 'success' | 'error'>('form')
  const [honeypot, setHoneypot] = useState('')
  const startedAtRef = useRef<number>(0)
  const trackedStartRef = useRef(false)
  const metaRef = useRef<Record<string, string>>({})

  // Capture UTM/referrer metadata once, on mount (spec §12). Never required.
  useEffect(() => {
    startedAtRef.current = Date.now()
    const params = new URLSearchParams(window.location.search)
    const meta: Record<string, string> = {}
    for (const k of ['utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'utm_term', 'fbclid']) {
      const v = params.get(k)
      if (v) meta[k] = v.slice(0, 300)
    }
    if (document.referrer) meta.referrer = document.referrer.slice(0, 500)
    meta.pagePath = window.location.pathname + window.location.search
    metaRef.current = meta
    track('assessment_view', {
      source: meta.utm_source || 'direct',
      campaign: meta.utm_campaign,
      page_path: window.location.pathname,
    })
  }, [])

  const set = <K extends keyof Fields>(key: K, value: Fields[K]) => {
    if (!trackedStartRef.current) {
      trackedStartRef.current = true
      track('assessment_start', {
        source: metaRef.current.utm_source || 'direct',
        campaign: metaRef.current.utm_campaign,
        page_path: '/assessment',
      })
    }
    setFields((f) => ({ ...f, [key]: value }))
    setErrors((e) => (e[key] ? { ...e, [key]: undefined } : e))
  }

  async function handleSubmit(ev: React.FormEvent) {
    ev.preventDefault()
    if (phase === 'submitting') return

    const nextErrors = validate(fields)
    setErrors(nextErrors)
    track('assessment_submit_attempt', {
      source: metaRef.current.utm_source || 'direct',
      campaign: metaRef.current.utm_campaign,
      page_path: '/assessment',
    })
    if (Object.keys(nextErrors).length > 0) {
      const firstKey = Object.keys(nextErrors)[0]
      document.getElementById(`field-${firstKey}`)?.focus()
      return
    }

    setPhase('submitting')
    try {
      const res = await fetch(ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...fields,
          fullName: fields.fullName.trim(),
          businessName: fields.businessName.trim(),
          businessEmail: fields.businessEmail.trim(),
          mobileNumber: fields.mobileNumber.trim(),
          onlinePresenceUrl: fields.onlinePresenceUrl.trim(),
          growthConstraint: fields.growthConstraint.trim(),
          // spam controls (spec §10): honeypot + time-on-page
          website_confirm: honeypot,
          formStartedAt: startedAtRef.current,
          meta: metaRef.current,
        }),
      })
      const data = await res.json().catch(() => ({}))
      if (res.ok && data?.success) {
        setPhase('success')
        window.scrollTo({ top: 0 })
        track('assessment_submit_success', {
          source: metaRef.current.utm_source || 'direct',
          campaign: metaRef.current.utm_campaign,
          page_path: '/assessment',
        })
      } else {
        throw new Error(data?.message || `Request failed (${res.status})`)
      }
    } catch {
      // Preserve entered data (spec §8.9) — only the phase changes.
      setPhase('error')
      track('assessment_submit_error', {
        source: metaRef.current.utm_source || 'direct',
        campaign: metaRef.current.utm_campaign,
        page_path: '/assessment',
      })
    }
  }

  return (
    <div className="relative overflow-hidden cc-canvas text-[#0A1730]">
      <section className="relative border-b cc-rule">
        <div className="container-custom pt-32 md:pt-40 pb-16 md:pb-20">
          <Reveal className="max-w-2xl">
            <span className="inline-block text-xs font-semibold uppercase tracking-[0.24em] mb-4 text-amber-700">
              Business Growth Assessment
            </span>
            <h1 className="text-4xl md:text-5xl font-bold leading-[1.1] tracking-tight">
              Help Us Understand What the Business Needs to Improve.
            </h1>
            <p className="mt-6 text-lg md:text-xl text-slate-600 leading-relaxed">
              This short assessment is designed for business owners and decision-makers. It gives Core Conversion the
              context needed to understand your present growth priorities before recommending the most appropriate
              next step.
            </p>
            <p className="mt-5 inline-flex items-center gap-2 text-[14.5px] font-medium text-slate-500">
              <Clock className="w-4 h-4 text-amber-600" aria-hidden /> Estimated completion time: 2 minutes
            </p>
          </Reveal>
        </div>
      </section>

      <section className="py-16 md:py-20 cc-canvas-alt">
        <div className="container-custom">
          <div className="max-w-2xl mx-auto">
            {phase === 'success' ? (
              /* ── Success state (spec §8.8) ── */
              <Reveal>
                <div className="rounded-2xl border cc-rule bg-white p-9 md:p-12 text-center" role="status" aria-live="polite">
                  <span className="mx-auto w-14 h-14 rounded-full bg-amber-500/10 border border-amber-500/40 flex items-center justify-center mb-6">
                    <CheckCircle2 className="w-7 h-7 text-amber-600" aria-hidden />
                  </span>
                  <h2 className="text-2xl md:text-3xl font-bold leading-snug">
                    Thank You. Your Assessment Has Been Received.
                  </h2>
                  <p className="mt-5 text-[16.5px] text-slate-600 leading-relaxed">
                    Core Conversion will review your responses and current digital presence to determine the most
                    appropriate next step. If there is a strong fit, we will contact you using the details provided.
                  </p>
                  <p className="mt-4 text-[14.5px] text-slate-500">Please allow up to one business day for an initial response.</p>
                  <div className="mt-8">
                    <Link href="/" className="group inline-flex items-center justify-center gap-2.5 bg-[#0A1730] hover:bg-[#122548] text-white font-semibold px-7 py-3.5 rounded-lg transition-colors">
                      View Core Conversion <ArrowRight className="w-4 h-4 text-amber-400 transition-transform group-hover:translate-x-1" />
                    </Link>
                  </div>
                </div>
              </Reveal>
            ) : (
              <Reveal>
                <form onSubmit={handleSubmit} noValidate className="rounded-2xl border cc-rule bg-white p-7 md:p-10">
                  {phase === 'error' && (
                    /* ── Failure state (spec §8.9) — data preserved below ── */
                    <div role="alert" className="mb-7 rounded-lg border border-red-200 bg-red-50 px-5 py-4 text-[15px] text-red-700 leading-relaxed">
                      We could not submit your assessment. Please check your connection and try again. If the problem
                      continues, <Link href="/contact" className="font-semibold underline">contact Core Conversion directly</Link>.
                    </div>
                  )}

                  <div className="space-y-7">
                    {/* Q1 */}
                    <div>
                      <label htmlFor="field-fullName" className="block text-[15.5px] font-semibold mb-2">What is your full name?</label>
                      <input id="field-fullName" type="text" autoComplete="name" required maxLength={120}
                        value={fields.fullName} onChange={(e) => set('fullName', e.target.value)}
                        aria-invalid={!!errors.fullName} aria-describedby={errors.fullName ? 'err-fullName' : undefined}
                        className={fieldClasses(!!errors.fullName)} />
                      <FieldError id="err-fullName">{errors.fullName}</FieldError>
                    </div>

                    {/* Q2 */}
                    <div>
                      <label htmlFor="field-businessName" className="block text-[15.5px] font-semibold mb-2">What is the name of your business or organization?</label>
                      <input id="field-businessName" type="text" autoComplete="organization" required maxLength={160}
                        value={fields.businessName} onChange={(e) => set('businessName', e.target.value)}
                        aria-invalid={!!errors.businessName} aria-describedby={errors.businessName ? 'err-businessName' : undefined}
                        className={fieldClasses(!!errors.businessName)} />
                      <FieldError id="err-businessName">{errors.businessName}</FieldError>
                    </div>

                    {/* Q3 */}
                    <div>
                      <label htmlFor="field-businessEmail" className="block text-[15.5px] font-semibold mb-2">What is your business email address?</label>
                      <input id="field-businessEmail" type="email" inputMode="email" autoComplete="email" required maxLength={254}
                        value={fields.businessEmail} onChange={(e) => set('businessEmail', e.target.value)}
                        aria-invalid={!!errors.businessEmail} aria-describedby={errors.businessEmail ? 'err-businessEmail' : undefined}
                        className={fieldClasses(!!errors.businessEmail)} />
                      <FieldError id="err-businessEmail">{errors.businessEmail}</FieldError>
                    </div>

                    {/* Q4 */}
                    <div>
                      <label htmlFor="field-mobileNumber" className="block text-[15.5px] font-semibold mb-2">What is the best mobile number to reach you?</label>
                      <input id="field-mobileNumber" type="tel" inputMode="tel" autoComplete="tel" required maxLength={25}
                        value={fields.mobileNumber} onChange={(e) => set('mobileNumber', e.target.value)}
                        aria-invalid={!!errors.mobileNumber} aria-describedby={errors.mobileNumber ? 'err-mobileNumber' : 'help-mobile'}
                        className={fieldClasses(!!errors.mobileNumber)} />
                      <p id="help-mobile" className="mt-2 text-[13.5px] text-slate-500">We will only use this to follow up regarding your assessment.</p>
                      <FieldError id="err-mobileNumber">{errors.mobileNumber}</FieldError>
                    </div>

                    {/* Q5 */}
                    <div>
                      <label htmlFor="field-role" className="block text-[15.5px] font-semibold mb-2">What best describes your role in the business?</label>
                      <select id="field-role" required value={fields.role} onChange={(e) => set('role', e.target.value)}
                        aria-invalid={!!errors.role} aria-describedby={errors.role ? 'err-role' : undefined}
                        className={`${fieldClasses(!!errors.role)} ${fields.role ? '' : 'text-slate-400'}`}>
                        <option value="" disabled>Select your role…</option>
                        {ROLE_OPTIONS.map((r) => <option key={r} value={r}>{r}</option>)}
                      </select>
                      <FieldError id="err-role">{errors.role}</FieldError>
                    </div>

                    {/* Q6 */}
                    <div>
                      <label htmlFor="field-onlinePresenceUrl" className="block text-[15.5px] font-semibold mb-2">Please share your website or primary online presence.</label>
                      <input id="field-onlinePresenceUrl" type="text" inputMode="url" autoComplete="url" required maxLength={500}
                        placeholder="e.g. ccoms.ph or facebook.com/yourbusiness"
                        value={fields.onlinePresenceUrl} onChange={(e) => set('onlinePresenceUrl', e.target.value)}
                        aria-invalid={!!errors.onlinePresenceUrl} aria-describedby={errors.onlinePresenceUrl ? 'err-onlinePresenceUrl' : 'help-presence'}
                        className={fieldClasses(!!errors.onlinePresenceUrl)} />
                      <p id="help-presence" className="mt-2 text-[13.5px] text-slate-500">
                        Website, Facebook Page, LinkedIn Company Page, Google Business Profile, or another useful business link.
                      </p>
                      <FieldError id="err-onlinePresenceUrl">{errors.onlinePresenceUrl}</FieldError>
                    </div>

                    {/* Q7 */}
                    <div>
                      <label htmlFor="field-desiredBusinessOutcome" className="block text-[15.5px] font-semibold mb-2">
                        What business outcome would you most like to improve over the next 6–12 months?
                      </label>
                      <select id="field-desiredBusinessOutcome" required value={fields.desiredBusinessOutcome}
                        onChange={(e) => set('desiredBusinessOutcome', e.target.value)}
                        aria-invalid={!!errors.desiredBusinessOutcome} aria-describedby={errors.desiredBusinessOutcome ? 'err-desiredBusinessOutcome' : undefined}
                        className={`${fieldClasses(!!errors.desiredBusinessOutcome)} ${fields.desiredBusinessOutcome ? '' : 'text-slate-400'}`}>
                        <option value="" disabled>Select the closest answer…</option>
                        {OUTCOME_OPTIONS.map((o) => <option key={o} value={o}>{o}</option>)}
                      </select>
                      <FieldError id="err-desiredBusinessOutcome">{errors.desiredBusinessOutcome}</FieldError>
                    </div>

                    {/* Q8 */}
                    <div>
                      <label htmlFor="field-growthConstraint" className="block text-[15.5px] font-semibold mb-2">
                        Briefly describe what you believe is currently limiting your business growth.
                      </label>
                      <textarea id="field-growthConstraint" required rows={5} maxLength={2000}
                        value={fields.growthConstraint} onChange={(e) => set('growthConstraint', e.target.value)}
                        aria-invalid={!!errors.growthConstraint} aria-describedby={errors.growthConstraint ? 'err-growthConstraint' : 'help-constraint'}
                        className={`${fieldClasses(!!errors.growthConstraint)} resize-y min-h-[130px]`} />
                      <p id="help-constraint" className="mt-2 text-[13.5px] text-slate-500">
                        A short answer is enough. This helps us understand the context before recommending a next step.
                      </p>
                      <FieldError id="err-growthConstraint">{errors.growthConstraint}</FieldError>
                    </div>

                    {/* Honeypot — invisible to people, tempting to bots. Not display:none
                        via Tailwind class alone; also kept out of tab order and AT. */}
                    <div className="absolute -left-[9999px] top-auto h-px w-px overflow-hidden" aria-hidden="true">
                      <label htmlFor="website_confirm">Leave this field empty</label>
                      <input id="website_confirm" name="website_confirm" type="text" tabIndex={-1} autoComplete="off"
                        value={honeypot} onChange={(e) => setHoneypot(e.target.value)} />
                    </div>

                    {/* Consent (spec §8.5) */}
                    <div className="pt-2 border-t cc-rule">
                      <label htmlFor="field-consentAccepted" className="mt-5 flex items-start gap-3.5 cursor-pointer">
                        <input id="field-consentAccepted" type="checkbox" checked={fields.consentAccepted}
                          onChange={(e) => set('consentAccepted', e.target.checked)}
                          aria-invalid={!!errors.consentAccepted} aria-describedby={errors.consentAccepted ? 'err-consentAccepted' : undefined}
                          className="mt-1 w-5 h-5 rounded border-slate-300 accent-[#0A1730]" />
                        <span className="text-[14.5px] text-slate-600 leading-relaxed">
                          I agree that Core Conversion may use the information provided to review my business inquiry and
                          contact me regarding the appropriate next step.{' '}
                          <Link href="/privacy" className="font-semibold text-[#0A1730] underline decoration-[rgba(10,23,48,0.25)] hover:decoration-[#0A1730]">
                            Privacy Policy
                          </Link>
                        </span>
                      </label>
                      <FieldError id="err-consentAccepted">{errors.consentAccepted}</FieldError>
                    </div>

                    <button type="submit" disabled={phase === 'submitting'}
                      className="w-full group inline-flex items-center justify-center gap-2.5 bg-[#0A1730] hover:bg-[#122548] disabled:opacity-60 disabled:cursor-not-allowed text-white font-semibold px-7 py-4 rounded-lg transition-colors text-[16.5px]">
                      {phase === 'submitting' ? 'Submitting your assessment…' : 'Submit Assessment'}
                      {phase !== 'submitting' && <ArrowRight className="w-4 h-4 text-amber-400 transition-transform group-hover:translate-x-1" aria-hidden />}
                    </button>

                    <p className="text-center text-[13px] text-slate-400">
                      Your responses are reviewed by Core Conversion only. We do not subscribe you to marketing emails.
                    </p>
                  </div>
                </form>
              </Reveal>
            )}
          </div>
        </div>
      </section>
    </div>
  )
}

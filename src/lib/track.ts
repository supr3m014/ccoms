// Lightweight, provider-agnostic conversion instrumentation.
// Pushes to GTM dataLayer and/or gtag if present; otherwise a safe no-op.
// Sitewide spec §13: track the buying journey consistently.

type TrackProps = Record<string, string | number | boolean | undefined>

export function track(event: string, props: TrackProps = {}): void {
  if (typeof window === 'undefined') return
  const w = window as unknown as {
    dataLayer?: unknown[]
    gtag?: (...args: unknown[]) => void
  }
  try {
    w.dataLayer?.push({ event, ...props })
    w.gtag?.('event', event, props)
  } catch {
    /* never let analytics break UX */
  }
}

// Common CCOMS conversion events (stable names for reporting).
export const CCEvent = {
  primaryCta: 'primary_cta_click',
  secondaryCta: 'secondary_cta_click',
  discoveryCall: 'discovery_call_start',
  faqOpen: 'faq_open',
  caseStudyView: 'case_study_click',
  investmentView: 'investment_section_view',
  workstreamSelect: 'workstream_select',
  phoneClick: 'phone_click',
  emailClick: 'email_click',
} as const

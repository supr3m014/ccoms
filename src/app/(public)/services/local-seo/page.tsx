'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Reveal } from '@/components/Reveal'
import { track, CCEvent } from '@/lib/track'
import {
  ArrowRight, ArrowUpRight, Plus, Minus, MapPin, Star, Phone, Globe, Navigation,
  Building2, Store, Stethoscope, Truck, UtensilsCrossed, ClipboardCheck, MessageSquare,
  Database, FileText, BarChart3, Network, ShieldCheck, Search,
} from 'lucide-react'

const CAL = 'https://calendly.com/ccoms/discovery-call'

/* ─────────────────────────── Data ─────────────────────────── */

const JOURNEY = [
  { stage: 'Need', desc: 'A customer searches for a nearby service, provider, clinic, shop, office, or specialist.', signal: 'The search happens on their phone, near the decision.' },
  { stage: 'Compare', desc: 'They examine proximity, relevance, services, photos, reviews, hours, responsiveness, and website quality.', signal: 'Three taps decide the shortlist.' },
  { stage: 'Verify', desc: 'They check proof, expertise, pricing context, location details, policies, and credibility.', signal: 'One inconsistency is enough to move on.' },
  { stage: 'Act', desc: 'They call, message, book, request directions, visit, or submit an inquiry.', signal: 'The business must be ready to answer.' },
]

const BREAKS = [
  'Wrong or inconsistent business information',
  'Weak categories and service relevance',
  'Incomplete or unconvincing profile',
  'Few, stale, or poorly managed reviews',
  'Generic website pages with no local relevance',
  'Duplicate or conflicting profiles',
  'Weak location pages',
  'Poor mobile conversion',
  'Untracked calls and bookings',
  'Slow response to inquiries',
  'Different branches managed inconsistently',
  'Competitors communicate trust more effectively',
]

const SYSTEM = [
  { icon: MapPin, title: 'Google Business Profile', desc: 'Categories, services, descriptions, attributes, hours, photos, products where appropriate, posts where useful, Q&A, duplicate management, and policy compliance.' },
  { icon: Globe, title: 'Local Website Architecture', desc: 'Service pages, location pages, area relevance, contact information, embedded maps, directions, local proof, and conversion paths.' },
  { icon: Star, title: 'Reviews & Reputation', desc: 'Ethical review acquisition, response process, reputation monitoring, proof presentation, and issue escalation.' },
  { icon: Database, title: 'Business Information & Citations', desc: 'Consistent name, address, phone, categories, directories, local listings, and data cleanup.' },
  { icon: FileText, title: 'Local Content & Authority', desc: 'Relevant local resources, partnerships, mentions, community signals, service-area content, and credible location evidence.' },
  { icon: BarChart3, title: 'Conversion & Tracking', desc: 'Calls, forms, booking, directions, messages, landing-page behavior, and source visibility where technically possible.' },
  { icon: Network, title: 'Multi-Location Governance', desc: 'Standards, ownership, branch data, local pages, review process, content, and reporting across locations.' },
]

const INITIAL_OUTPUTS = ['Local market & competitor review', 'Profile audit', 'Website & local-page audit', 'Citation & data review', 'Review & reputation assessment', 'Conversion-path review', 'Priority roadmap', 'Tracking plan']
const ONGOING_OUTPUTS = ['Profile optimization', 'Listing cleanup', 'Duplicate resolution', 'Category & service refinement', 'Photo & content guidance', 'Local page creation or improvement', 'Review workflow', 'Response templates', 'Local content', 'Citation work', 'Tracking', 'Competitor monitoring', 'Growth review']

const MODELS = [
  { icon: Building2, title: 'Single-Location Business', focus: 'One profile, local site relevance, trust, reviews, and conversion.', pins: [{ x: 50, y: 46 }] },
  { icon: Truck, title: 'Service-Area Business', focus: 'Legitimate service areas, service pages, operating evidence, calls, and policy-compliant profile configuration.', pins: [{ x: 50, y: 48 }], area: true },
  { icon: Store, title: 'Multi-Location Business', focus: 'Governance, unique location pages, branch data, reviews, duplicate control, and location-level measurement.', pins: [{ x: 30, y: 34 }, { x: 62, y: 52 }, { x: 44, y: 68 }, { x: 72, y: 28 }] },
  { icon: Stethoscope, title: 'Professional or Clinic Practice', focus: 'Practitioner and business relationships, services, trust, compliance, booking, and reputation.', pins: [{ x: 50, y: 44 }, { x: 56, y: 52 }] },
  { icon: UtensilsCrossed, title: 'Retail, Hospitality & Foot Traffic', focus: 'Hours, products, imagery, directions, reviews, location experience, and visit-related actions.', pins: [{ x: 46, y: 50 }] },
]

const DEPENDENCIES = [
  'Accurate hours', 'Working phone', 'Quick response', 'Booking availability', 'Clear service information',
  'Mobile usability', 'Location credibility', 'Consistent customer experience', 'Review generation after service',
  'Internal ownership of profile changes',
]

const METRICS = [
  'Priority local visibility', 'Profile views & interactions where available', 'Calls', 'Messages', 'Bookings',
  'Directions', 'Website clicks', 'Local landing-page visits', 'Conversion rate', 'Review volume & response',
  'Data consistency', 'Location-level performance', 'Competitor changes',
]

const INVESTMENT_FACTORS = [
  'Number of locations', 'Market competition', 'Profile condition', 'Duplicate & listing problems',
  'Website requirements', 'Local content', 'Review process', 'Tracking', 'Implementation responsibility',
  'Reporting', 'Support',
]

const FAQS = [
  { q: 'Can you guarantee the top map position?', a: 'No. Local results vary by relevance, distance, prominence, searcher location, competition, profile quality, website signals, reputation, and platform behavior.' },
  { q: 'Do you provide reviews?', a: 'Core Conversion can help establish an ethical review-request and response process. It does not sell or fabricate reviews.' },
  { q: 'Can you optimize multiple branches?', a: 'Yes. Multi-location work requires consistent governance and unique, accurate location information.' },
  { q: 'Is Local SEO different from regular SEO?', a: 'Yes. Local SEO places greater emphasis on geographic intent, map results, business profiles, reviews, citations, local pages, proximity, and branch operations. It still relies on a strong website and broader SEO fundamentals.' },
  { q: 'Do you post on Google Business Profile?', a: 'Posts may be used when relevant, but they are only one part of the system and should not define the service.' },
]

/* ─────────────────────────── Helpers ─────────────────────────── */

function Kicker({ children, light = false }: { children: React.ReactNode; light?: boolean }) {
  return <span className={`inline-block text-xs font-semibold uppercase tracking-[0.24em] mb-4 ${light ? 'text-amber-400' : 'text-amber-700'}`}>{children}</span>
}

function InkButton({ href, children, external = false, event }: { href: string; children: React.ReactNode; external?: boolean; event?: string }) {
  const cls = 'group inline-flex items-center justify-center gap-2.5 bg-[#0A1730] hover:bg-[#122548] text-white font-semibold px-7 py-3.5 rounded-lg transition-colors'
  const inner = <>{children} <ArrowRight className="w-4 h-4 text-amber-400 transition-transform group-hover:translate-x-1" /></>
  const onClick = () => event && track(event, { page: 'local-seo' })
  return external
    ? <a href={href} target="_blank" rel="noopener noreferrer" className={cls} onClick={onClick}>{inner}</a>
    : <Link href={href} className={cls} onClick={onClick}>{inner}</Link>
}

function HairlineButton({ href, children, light = false }: { href: string; children: React.ReactNode; light?: boolean }) {
  const cls = light
    ? 'inline-flex items-center justify-center gap-2 border border-white/25 text-white hover:border-white/60 font-semibold px-7 py-3.5 rounded-lg transition-colors'
    : 'inline-flex items-center justify-center gap-2 border cc-rule-md text-[#0A1730] hover:border-[#0A1730] font-semibold px-7 py-3.5 rounded-lg transition-colors'
  return (
    <Link href={href} className={cls} onClick={() => track(CCEvent.secondaryCta, { page: 'local-seo', to: href })}>
      {children} <ArrowUpRight className="w-4 h-4" />
    </Link>
  )
}

/* Hero — a stylized mobile local-search result, drawn with UI primitives (no fake data) */
function HeroPhone() {
  return (
    <div className="mx-auto w-full max-w-[300px] rounded-[2rem] border cc-rule-md bg-white shadow-[0_30px_70px_-35px_rgba(10,23,48,0.45)] overflow-hidden">
      <div className="px-5 pt-5 pb-3 border-b cc-rule">
        <div className="flex items-center gap-2.5 rounded-full border cc-rule-md px-4 py-2.5">
          <Search className="w-4 h-4 text-slate-400" />
          <span className="text-[13px] text-slate-500">service near me</span>
        </div>
      </div>
      {/* map area */}
      <div className="relative h-32 cc-canvas-alt border-b cc-rule">
        <span className="absolute left-[18%] top-[30%] w-px h-[55%] bg-[rgba(10,23,48,0.08)]" aria-hidden />
        <span className="absolute left-[52%] top-[12%] w-px h-[76%] bg-[rgba(10,23,48,0.08)]" aria-hidden />
        <span className="absolute left-[8%] top-[52%] w-[84%] h-px bg-[rgba(10,23,48,0.08)]" aria-hidden />
        <MapPin className="absolute left-1/2 top-[38%] -translate-x-1/2 w-7 h-7 text-amber-500 fill-amber-400/30" />
      </div>
      {/* profile card */}
      <div className="px-5 py-4">
        <p className="text-[15px] font-bold text-[#0A1730]">Your Business Here</p>
        <div className="mt-1 flex items-center gap-1.5">
          {[0, 1, 2, 3, 4].map((s) => <Star key={s} className="w-3.5 h-3.5 text-amber-500 fill-amber-400" />)}
          <span className="text-[12px] text-slate-500 ml-1">Reviews · Category · Area</span>
        </div>
        <div className="mt-4 grid grid-cols-3 gap-2">
          {[{ icon: Phone, l: 'Call' }, { icon: Navigation, l: 'Directions' }, { icon: Globe, l: 'Website' }].map(({ icon: Icon, l }) => (
            <span key={l} className="flex flex-col items-center gap-1.5 rounded-lg border cc-rule py-2.5">
              <Icon className="w-4 h-4 text-[#0A1730]" />
              <span className="text-[10.5px] font-semibold text-slate-600">{l}</span>
            </span>
          ))}
        </div>
      </div>
      <p className="px-5 pb-4 text-[11px] text-slate-400 leading-relaxed border-t cc-rule pt-3">
        Search → Map result → Profile → Call, booking, or visit. Every link in this chain is part of the service.
      </p>
    </div>
  )
}

/* ─────────────────────────── Page ─────────────────────────── */

export default function LocalSeoPage() {
  const [model, setModel] = useState(0)
  const [openFaq, setOpenFaq] = useState<number | null>(null)
  const M = MODELS[model]

  return (
    <div className="relative overflow-hidden cc-canvas text-[#0A1730]">

      {/* ══════════ 1 · HERO ══════════ */}
      <section className="relative border-b cc-rule">
        <div className="container-custom pt-32 md:pt-40 pb-20 md:pb-24">
          <div className="grid lg:grid-cols-[1.15fr_0.85fr] gap-14 lg:gap-10 items-center">
            <div>
              <Kicker>Local SEO Services</Kicker>
              <h1 className="text-4xl md:text-5xl lg:text-[3.4rem] font-bold leading-[1.08] tracking-tight">
                Be Easier to Find and Trust When Local Customers Are Ready to Act.
              </h1>
              <p className="mt-6 text-lg md:text-xl text-slate-600 leading-relaxed max-w-xl">
                Core Conversion strengthens location-based visibility across Google Business Profile, map results, local
                search pages, reviews, business information, website experience, and conversion tracking.
              </p>
              <p className="mt-4 text-[15.5px] text-slate-500 leading-relaxed max-w-xl">
                Built for calls, bookings, inquiries, directions, and local consideration — not visibility alone.
              </p>
              <div className="mt-9 flex flex-col sm:flex-row gap-4">
                <InkButton href={CAL} external event={CCEvent.discoveryCall}>Discuss Your Local Visibility</InkButton>
                <HairlineButton href="#system">See the Local SEO System</HairlineButton>
              </div>
            </div>
            <Reveal delay={0.1}>
              <HeroPhone />
            </Reveal>
          </div>
        </div>
      </section>

      {/* ══════════ 2 · THE LOCAL DECISION JOURNEY ══════════ */}
      <section className="py-24 md:py-28 cc-canvas-alt border-b cc-rule">
        <div className="container-custom">
          <Reveal className="max-w-3xl mb-14">
            <Kicker>The Local Decision Journey</Kicker>
            <h2 className="text-3xl md:text-4xl lg:text-[2.9rem] font-bold leading-[1.12]">
              Local Visibility Is Not One Ranking. It Is a Chain of Decisions.
            </h2>
            <p className="mt-5 text-lg text-slate-600 leading-relaxed">
              Across the search result, business profile, website, reputation, and operational response — every link
              either carries the customer forward or loses them.
            </p>
          </Reveal>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-px rounded-xl overflow-hidden border cc-rule bg-[rgba(10,23,48,0.08)]">
            {JOURNEY.map(({ stage, desc, signal }, i) => (
              <Reveal key={stage} delay={i * 0.06} className="h-full">
                <div className="h-full bg-white p-7 md:p-8 flex flex-col">
                  <span className="text-[12px] font-bold uppercase tracking-[0.22em] text-amber-700">Step {i + 1}</span>
                  <h3 className="text-2xl font-bold mt-1.5">{stage}</h3>
                  <p className="mt-3 text-[15.5px] text-slate-600 leading-relaxed flex-1">{desc}</p>
                  <p className="mt-5 pt-4 border-t cc-rule text-[13.5px] font-semibold text-[#0A1730]">{signal}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════ 3 · WHERE LOCAL VISIBILITY BREAKS ══════════ */}
      <section className="py-24 md:py-28 cc-canvas-white border-b cc-rule">
        <div className="container-custom">
          <div className="grid lg:grid-cols-[0.85fr_1.15fr] gap-12 lg:gap-16 items-start">
            <Reveal className="lg:sticky lg:top-28">
              <Kicker>Failure Points</Kicker>
              <h2 className="text-3xl md:text-4xl font-bold leading-[1.14]">
                Where Local Visibility Breaks.
              </h2>
              <p className="mt-5 text-[17px] text-slate-600 leading-relaxed">
                Twelve failure points we audit before recommending anything. Most local programs lose customers at two
                or three of them — usually without the business knowing.
              </p>
              <p className="mt-6 text-[15.5px] text-slate-500 leading-relaxed border-l-2 border-amber-500 pl-4">
                Local SEO can generate opportunities, but the business must also answer, respond, book, serve, and earn
                reputation effectively.
              </p>
            </Reveal>
            <Reveal delay={0.05}>
              <div className="grid sm:grid-cols-2 gap-x-10">
                {BREAKS.map((b, i) => (
                  <div key={b} className="flex items-baseline gap-4 py-3.5 border-b cc-rule">
                    <span className="text-[13px] font-bold text-amber-700 tabular-nums shrink-0">{String(i + 1).padStart(2, '0')}</span>
                    <p className="text-[15.5px] text-slate-700 leading-relaxed">{b}</p>
                  </div>
                ))}
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      {/* ══════════ 4 · THE LOCAL VISIBILITY SYSTEM ══════════ */}
      <section id="system" className="py-24 md:py-28 cc-canvas-alt border-b cc-rule scroll-mt-20">
        <div className="container-custom">
          <Reveal className="max-w-3xl mb-14">
            <Kicker>The Local Visibility System</Kicker>
            <h2 className="text-3xl md:text-4xl lg:text-[2.9rem] font-bold leading-[1.12]">
              Seven Components, Built Around the Location.
            </h2>
          </Reveal>

          <div className="relative">
            {/* location spine */}
            <span className="hidden lg:block absolute left-1/2 top-2 bottom-2 w-px bg-gradient-to-b from-amber-500/60 via-[rgba(10,23,48,0.12)] to-amber-500/60" aria-hidden />
            <div className="grid lg:grid-cols-2 gap-x-20 gap-y-8">
              {SYSTEM.map(({ icon: Icon, title, desc }, i) => (
                <Reveal key={title} delay={(i % 2) * 0.06} className={i % 2 ? 'lg:mt-16' : ''}>
                  <div className="relative rounded-xl border cc-rule-md bg-white p-7 md:p-8">
                    <span className={`hidden lg:block absolute top-1/2 w-10 h-px bg-[rgba(10,23,48,0.15)] ${i % 2 ? '-left-10' : '-right-10'}`} aria-hidden />
                    <div className="flex items-start gap-5">
                      <span className="w-12 h-12 rounded-lg bg-[#0A1730] flex items-center justify-center shrink-0">
                        <Icon className="w-5 h-5 text-amber-400" />
                      </span>
                      <div>
                        <h3 className="text-xl font-bold">{title}</h3>
                        <p className="mt-2 text-[15.5px] text-slate-600 leading-relaxed">{desc}</p>
                      </div>
                    </div>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ══════════ 5 · WHAT THE CLIENT RECEIVES ══════════ */}
      <section className="py-24 md:py-28 cc-canvas-white border-b cc-rule">
        <div className="container-custom">
          <Reveal className="max-w-3xl mb-12">
            <Kicker>What the Client Receives</Kicker>
            <h2 className="text-3xl md:text-4xl lg:text-[2.9rem] font-bold leading-[1.12]">
              A Defined Local Program — With an Ethical Line We Do Not Cross.
            </h2>
          </Reveal>

          <div className="grid md:grid-cols-2 gap-8 lg:gap-12">
            <Reveal>
              <div className="h-full border-t-2 border-[#0A1730] pt-6">
                <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-slate-400 mb-5">Phase One — Assessment &amp; Roadmap</p>
                <ul className="space-y-3.5">
                  {INITIAL_OUTPUTS.map((o) => (
                    <li key={o} className="flex gap-3.5 items-baseline">
                      <span className="w-1.5 h-1.5 rounded-full bg-amber-500 shrink-0 translate-y-[-2px]" aria-hidden />
                      <span className="text-[16.5px] text-slate-700 leading-relaxed">{o}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </Reveal>
            <Reveal delay={0.08}>
              <div className="h-full border-t-2 border-amber-500 pt-6">
                <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-slate-400 mb-5">Ongoing — Depending on Scope</p>
                <div className="flex flex-wrap gap-2">
                  {ONGOING_OUTPUTS.map((o) => (
                    <span key={o} className="rounded-full bg-white border cc-rule-md px-3.5 py-1.5 text-[13.5px] font-medium text-slate-700">{o}</span>
                  ))}
                </div>
                <p className="mt-7 text-[15.5px] text-slate-600 leading-relaxed flex gap-3 border-l-2 border-amber-500 pl-4">
                  <ShieldCheck className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                  <span>
                    Core Conversion does not create fake reviews, violate profile policies, keyword-stuff business names,
                    or guarantee map positions.
                  </span>
                </p>
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      {/* ══════════ 6 · LOCAL SEO BY BUSINESS MODEL — noir map ══════════ */}
      <section className="py-24 md:py-28 cc-noir">
        <div className="container-custom">
          <Reveal className="max-w-3xl mb-12">
            <Kicker light>Local SEO by Business Model</Kicker>
            <h2 className="text-3xl md:text-4xl lg:text-[2.9rem] font-bold leading-[1.12] text-white">
              The Same Discipline, Focused Differently for Each Model.
            </h2>
            <p className="mt-5 text-lg text-slate-300 leading-relaxed">Select your business model.</p>
          </Reveal>

          <div className="grid lg:grid-cols-[0.9fr_1.1fr] gap-8 lg:gap-12 items-stretch">
            <Reveal>
              <div className="flex flex-col gap-2.5" role="tablist" aria-label="Business models">
                {MODELS.map(({ icon: Icon, title }, i) => (
                  <button key={title} onClick={() => { setModel(i); track(CCEvent.workstreamSelect, { page: 'local-seo', model: title }) }}
                    role="tab" aria-selected={model === i}
                    className={`text-left rounded-xl border px-6 py-4 transition-all flex items-center gap-4
                      ${model === i ? 'bg-white/[0.07] border-amber-400 text-white' : 'bg-white/[0.03] border-white/10 text-slate-300 hover:border-white/30'}`}>
                    <Icon className={`w-5 h-5 shrink-0 ${model === i ? 'text-amber-400' : 'text-slate-400'}`} />
                    <span className="text-[16px] font-bold">{title}</span>
                  </button>
                ))}
              </div>
            </Reveal>

            <Reveal delay={0.05} className="flex">
              <div key={model} className="w-full rounded-xl border border-white/10 bg-white/[0.04] overflow-hidden flex flex-col">
                {/* stylized map */}
                <div className="relative h-52 md:h-60 border-b border-white/10">
                  <span className="absolute left-[22%] top-0 bottom-0 w-px bg-white/[0.07]" aria-hidden />
                  <span className="absolute left-[58%] top-0 bottom-0 w-px bg-white/[0.07]" aria-hidden />
                  <span className="absolute left-0 right-0 top-[38%] h-px bg-white/[0.07]" aria-hidden />
                  <span className="absolute left-0 right-0 top-[72%] h-px bg-white/[0.07]" aria-hidden />
                  {M.area && <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[62%] aspect-square rounded-full border border-amber-400/30 bg-amber-400/[0.04]" aria-hidden />}
                  {M.pins.map((p, j) => (
                    <MapPin key={j} style={{ left: `${p.x}%`, top: `${p.y}%` }}
                      className="absolute -translate-x-1/2 -translate-y-full w-7 h-7 text-amber-400 fill-amber-400/25" />
                  ))}
                </div>
                <div className="p-7 md:p-8 flex-1">
                  <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-amber-400">Where the work concentrates</p>
                  <h3 className="text-2xl font-bold text-white mt-1.5">{M.title}</h3>
                  <p className="mt-3 text-[16.5px] text-slate-300 leading-relaxed">{M.focus}</p>
                </div>
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      {/* ══════════ 7 · WEBSITE & OPERATIONS ══════════ */}
      <section className="py-24 md:py-28 cc-canvas-white border-b cc-rule">
        <div className="container-custom">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-start">
            <Reveal className="lg:sticky lg:top-28">
              <Kicker>Digital Work, Real-World Dependencies</Kicker>
              <h2 className="text-3xl md:text-4xl lg:text-[2.9rem] font-bold leading-[1.12]">
                Local Search Can Create the Opportunity. The Business Must Still Convert and Serve It.
              </h2>
              <p className="mt-6 text-[17px] text-slate-600 leading-relaxed">
                Local SEO performance is affected by both digital execution and real-world business operations. The
                proposal identifies responsibilities Core Conversion controls and responsibilities the client must own.
              </p>
            </Reveal>
            <Reveal delay={0.05}>
              <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-slate-400 mb-5">Operational dependencies the client owns</p>
              <div className="grid sm:grid-cols-2 gap-x-8 gap-y-3.5">
                {DEPENDENCIES.map((d) => (
                  <div key={d} className="flex gap-3 items-baseline border-b cc-rule pb-3">
                    <ClipboardCheck className="w-4 h-4 text-amber-600 shrink-0 translate-y-0.5" />
                    <span className="text-[15.5px] text-slate-700">{d}</span>
                  </div>
                ))}
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      {/* ══════════ 8 · PROOF — honest scope ══════════ */}
      <section className="py-24 md:py-28 cc-canvas-alt border-b cc-rule">
        <div className="container-custom">
          <div className="grid lg:grid-cols-[1fr_0.9fr] gap-12 lg:gap-16 items-center">
            <Reveal>
              <Kicker>Evidence</Kicker>
              <h2 className="text-3xl md:text-4xl lg:text-[2.9rem] font-bold leading-[1.12]">
                What We Show — and What We Refuse to Invent.
              </h2>
              <p className="mt-5 text-[17px] text-slate-600 leading-relaxed">
                Local attribution is imperfect, so we demonstrate the work itself: real audit examples,
                before-and-after data consistency, location-page architecture, review workflows, and search-visibility
                evidence from broader SEO engagements — each with its dates and limits stated.
              </p>
              <p className="mt-4 text-[15.5px] text-slate-500 leading-relaxed border-l-2 border-amber-500 pl-4">
                We do not invent calls, bookings, or foot-traffic results. If a number cannot be verified, it does not
                appear in our materials.
              </p>
              <div className="mt-8">
                <HairlineButton href="/case-studies">View Verified Case Studies</HairlineButton>
              </div>
            </Reveal>
            <Reveal delay={0.08}>
              <div className="rounded-xl border cc-rule-md bg-white overflow-hidden shadow-[0_18px_50px_-30px_rgba(10,23,48,0.3)]">
                <div className="bg-[#0A1730] px-6 py-3.5 flex items-center justify-between">
                  <span className="text-[13px] font-bold text-white flex items-center gap-2"><MessageSquare className="w-4 h-4 text-amber-400" /> Review Workflow — Sample Artifact</span>
                </div>
                <div className="p-6 space-y-3.5">
                  {['Service completed → request sent within 24 hours', 'Response templates — positive, neutral, critical', 'Escalation path for legitimate complaints', 'Monthly reputation & consistency report'].map((s, i) => (
                    <div key={s} className="flex gap-4 items-baseline">
                      <span className="text-[12px] font-bold text-amber-700 tabular-nums">{String(i + 1).padStart(2, '0')}</span>
                      <p className="text-[14.5px] text-slate-700 leading-relaxed">{s}</p>
                    </div>
                  ))}
                  <p className="pt-3 border-t cc-rule text-[12.5px] text-slate-400">A representative deliverable — the client-specific version follows their operations.</p>
                </div>
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      {/* ══════════ 9 · MEASUREMENT ══════════ */}
      <section className="py-24 md:py-28 cc-canvas-white border-b cc-rule">
        <div className="container-custom">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-start">
            <Reveal className="lg:sticky lg:top-28">
              <Kicker>Measurement</Kicker>
              <h2 className="text-3xl md:text-4xl lg:text-[2.9rem] font-bold leading-[1.12]">
                Measured Where Possible. Directional Where Not.
              </h2>
              <p className="mt-6 text-[15.5px] text-slate-600 leading-relaxed border-l-2 border-amber-500 pl-4">
                Platform reporting and attribution have limitations. We explain what is directly measured and what is
                directional — and never blur the two.
              </p>
            </Reveal>
            <Reveal delay={0.05}>
              <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-slate-400 mb-5">Metrics reviewed, depending on scope</p>
              <div className="grid sm:grid-cols-2 gap-x-8 gap-y-3.5">
                {METRICS.map((m) => (
                  <div key={m} className="flex gap-3 items-baseline border-b cc-rule pb-3">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-500 shrink-0 translate-y-[-2px]" aria-hidden />
                    <span className="text-[15.5px] text-slate-700">{m}</span>
                  </div>
                ))}
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      {/* ══════════ 10 · INVESTMENT ══════════ */}
      <section className="py-24 md:py-28 cc-canvas-alt border-b cc-rule">
        <div className="container-custom">
          <Reveal>
            <div className="rounded-2xl border cc-rule bg-white overflow-hidden grid lg:grid-cols-2">
              <div className="p-9 md:p-11">
                <Kicker>Investment</Kicker>
                <h3 className="text-2xl md:text-3xl font-bold leading-[1.15]">Priced by the Locations, the Market, and the Starting Condition.</h3>
                <p className="mt-4 text-[16px] text-slate-600 leading-relaxed">
                  Ranges are shared during discovery, after we review the profile condition, competition, and how much
                  of the system already exists. A single clean location and a twelve-branch cleanup are not the same
                  engagement — and should not carry the same price.
                </p>
                <div className="mt-6"><InkButton href={CAL} external event={CCEvent.discoveryCall}>Scope Your Local Program</InkButton></div>
              </div>
              <div className="cc-canvas-alt border-t lg:border-t-0 lg:border-l cc-rule p-9 md:p-11">
                <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-amber-700 mb-4">What shapes the range</p>
                <div className="flex flex-wrap gap-2">
                  {INVESTMENT_FACTORS.map((f) => (
                    <span key={f} className="rounded-full bg-white border cc-rule-md px-3 py-1.5 text-[13px] font-medium text-slate-700">{f}</span>
                  ))}
                </div>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ══════════ 11 · FAQs ══════════ */}
      <section className="py-24 md:py-28 cc-canvas-white border-b cc-rule">
        <div className="container-custom">
          <div className="grid lg:grid-cols-[0.9fr_1.1fr] gap-12 lg:gap-16 items-start">
            <Reveal className="lg:sticky lg:top-28">
              <Kicker>Decision Support</Kicker>
              <h2 className="text-3xl md:text-4xl font-bold leading-[1.14]">
                Straight Answers on Local Visibility.
              </h2>
            </Reveal>
            <Reveal delay={0.05} className="divide-y divide-[rgba(10,23,48,0.1)] border-y cc-rule">
              {FAQS.map((f, i) => {
                const open = openFaq === i
                return (
                  <div key={f.q}>
                    <button onClick={() => { setOpenFaq(open ? null : i); if (!open) track(CCEvent.faqOpen, { page: 'local-seo', question: f.q }) }}
                      aria-expanded={open} className="w-full flex items-start justify-between gap-6 text-left py-6 group">
                      <span className="text-lg font-semibold text-[#0A1730] group-hover:text-amber-700 transition-colors">{f.q}</span>
                      <span className="w-7 h-7 rounded-full border cc-rule-md flex items-center justify-center shrink-0 mt-0.5 text-slate-500 group-hover:border-amber-500 group-hover:text-amber-700 transition-colors">
                        {open ? <Minus className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
                      </span>
                    </button>
                    <div className={`grid transition-all duration-300 ease-out ${open ? 'grid-rows-[1fr] opacity-100 pb-6' : 'grid-rows-[0fr] opacity-0'}`}>
                      <div className="overflow-hidden"><p className="text-[16px] text-slate-600 leading-relaxed max-w-2xl">{f.a}</p></div>
                    </div>
                  </div>
                )
              })}
            </Reveal>
          </div>
        </div>
      </section>

      {/* ══════════ 12 · FINAL CTA — noir close ══════════ */}
      <section className="relative py-28 md:py-32 cc-noir overflow-hidden">
        <div className="container-custom relative z-10">
          <Reveal className="max-w-3xl mx-auto text-center">
            <span className="block h-10 w-px bg-amber-400 mx-auto mb-8" aria-hidden />
            <Kicker light>Next Step</Kicker>
            <h2 className="text-3xl md:text-5xl font-bold leading-[1.1] text-white">
              Strengthen the Path From Local Search to Customer Action.
            </h2>
            <p className="mt-6 text-lg md:text-xl text-slate-300 leading-relaxed">
              We will review the business profile, local competitors, website, reviews, location information, and
              conversion path before recommending the appropriate scope.
            </p>
            <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center">
              <a href={CAL} target="_blank" rel="noopener noreferrer" onClick={() => track(CCEvent.discoveryCall, { page: 'local-seo' })}
                className="group inline-flex items-center justify-center gap-2.5 bg-amber-400 hover:bg-amber-300 text-[#0B0C10] font-semibold px-7 py-3.5 rounded-lg transition-colors">
                Request a Local Visibility Review <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
              </a>
              <HairlineButton href="/services/seo" light>Explore SEO Services</HairlineButton>
            </div>
          </Reveal>
        </div>
      </section>
    </div>
  )
}

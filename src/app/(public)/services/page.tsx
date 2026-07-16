'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Reveal } from '@/components/Reveal'
import { track, CCEvent } from '@/lib/track'
import {
  ArrowRight, ArrowUpRight, Plus, Minus, Search, MapPin, Sparkles, Globe,
  Smartphone, Clapperboard, Compass, Target,
} from 'lucide-react'

const CAL = 'https://calendly.com/ccoms/discovery-call'

/* ─────────────────────────── Data ─────────────────────────── */

const HERO_ELEMENTS = ['Website', 'Search', 'Content', 'Paid Media', 'AI Search', 'Analytics', 'Automation', 'Applications', 'Commercial Creative']

const BANDS = [
  {
    n: '01',
    title: 'Be Easier to Find',
    situation: 'Customers are searching, but the business is not consistently visible in the places that influence consideration.',
    paths: [
      { label: 'SEO', href: '/services/seo' },
      { label: 'Local SEO', href: '/services/local-seo' },
      { label: 'GEO / AI Search Visibility', href: '/services/geo' },
      { label: 'Digital Marketing Services', href: '/services/digital-marketing-services' },
    ],
    link: { label: 'Build Search Visibility', href: '/services/seo' },
    visual: 'search',
  },
  {
    n: '02',
    title: 'Convert More Attention Into Action',
    situation: 'The business receives traffic or campaign activity, but the website, message, offer, or customer journey is limiting inquiries and conversions.',
    paths: [
      { label: 'Website Development', href: '/services/website-development' },
      { label: 'Digital Marketing Services', href: '/services/digital-marketing-services' },
      { label: 'AI Ad & Commercial Production', href: '/services/ai-ad-commercial-production' },
    ],
    link: { label: 'Improve Conversion', href: '/services/website-development' },
    visual: 'journey',
  },
  {
    n: '03',
    title: 'Launch or Improve a Digital Platform',
    situation: 'The business needs a website, e-commerce system, customer application, internal platform, or scalable digital product.',
    paths: [
      { label: 'Website Development', href: '/services/website-development' },
      { label: 'Mobile App Development', href: '/services/mobile-app-development' },
    ],
    link: { label: 'Build the Platform', href: '/services/mobile-app-development' },
    visual: 'platform',
  },
  {
    n: '04',
    title: 'Create a More Coordinated Growth System',
    situation: 'Marketing channels, suppliers, content, analytics, and digital assets operate separately, making performance difficult to understand and improve.',
    paths: [
      { label: 'Digital Marketing Services', href: '/services/digital-marketing-services' },
    ],
    link: { label: 'Explore Integrated Digital Marketing', href: '/services/digital-marketing-services' },
    visual: 'system',
  },
]

type Service = {
  icon: typeof Search
  title: string
  href: string
  territory: string
  desc: string
  outcome: string
  useCase: string
}

const SERVICES: Service[] = [
  {
    icon: Compass, title: 'Digital Marketing Services', href: '/services/digital-marketing-services', territory: 'Integrated Growth',
    desc: 'A coordinated retained engagement that selects and sequences the appropriate marketing and digital-execution modules according to business goals, priorities, and budget.',
    outcome: 'A growth system with clear priorities, sequenced execution, and recurring performance decisions.',
    useCase: 'Multiple constraints affect growth and the work must be coordinated across channels.',
  },
  {
    icon: Search, title: 'SEO Services', href: '/services/seo', territory: 'Search & Discovery',
    desc: 'Build sustainable organic visibility through technical strength, content architecture, relevance, authority, and conversion-supporting search strategy.',
    outcome: 'Stronger visibility for commercially relevant demand — a compounding organic asset.',
    useCase: 'Customers research the category online, and the business is under-represented in those moments.',
  },
  {
    icon: MapPin, title: 'Local SEO', href: '/services/local-seo', territory: 'Search & Discovery',
    desc: 'Increase visibility and trust when customers search for nearby or location-specific providers.',
    outcome: 'More calls, bookings, directions, and visits from customers searching near the decision.',
    useCase: 'The business serves a geographic market and local competitors dominate the map results.',
  },
  {
    icon: Sparkles, title: 'GEO / AI Search Visibility', href: '/services/geo', territory: 'Search & Discovery',
    desc: 'Improve how clearly and credibly the business can be understood, retrieved, and cited across AI-assisted search experiences.',
    outcome: 'Readiness for AI-assisted discovery — clear entities, retrievable answers, credible evidence.',
    useCase: 'Buyers use AI tools to research and compare, and the business wants to be prepared, honestly.',
  },
  {
    icon: Globe, title: 'Website Development', href: '/services/website-development', territory: 'Platforms & Acquisition',
    desc: 'Build the digital foundation through business websites, landing pages, e-commerce, portals, performance, security, and conversion architecture.',
    outcome: 'A credible, fast, conversion-ready digital foundation the rest of the system can build on.',
    useCase: 'The current site undermines trust, cannot convert, or cannot support the next stage of growth.',
  },
  {
    icon: Smartphone, title: 'Mobile App Development', href: '/services/mobile-app-development', territory: 'Platforms & Acquisition',
    desc: 'Create customer-facing or operational applications with the appropriate product, backend, integration, and lifecycle foundations.',
    outcome: 'A working product — app, backend, and operations — not just a set of screens.',
    useCase: 'A customer experience or internal operation needs a real application, defined as a product case.',
  },
  {
    icon: Clapperboard, title: 'AI Ad & Commercial Production', href: '/services/ai-ad-commercial-production', territory: 'Platforms & Acquisition',
    desc: 'Create campaign-ready commercial assets that explain an offer, position the brand, and support paid and organic acquisition.',
    outcome: 'A master commercial plus platform cutdowns, produced under brand control.',
    useCase: 'An offer must be understood and remembered — across paid, social, and the website itself.',
  },
]

const STAGES = [
  { n: '1', title: 'Search Demand', desc: 'SEO, Local SEO, and AI-search work improve discoverability for relevant needs and services.' },
  { n: '2', title: 'Trust and Relevance', desc: 'Content, reviews, service information, case evidence, and commercial creative strengthen confidence.' },
  { n: '3', title: 'Conversion Experience', desc: 'The website or landing page presents the offer clearly and removes friction from inquiry or booking.' },
  { n: '4', title: 'Acquisition and Follow-Up', desc: 'Paid media, retargeting, email, and automation support both immediate and delayed decisions.' },
  { n: '5', title: 'Measurement and Improvement', desc: 'Tracking reveals where inquiries originate, where prospects drop off, and what should be improved next.' },
]

const PROCESS = [
  { title: 'Understand', desc: 'Business model, customers, goals, current activity, constraints, and internal capability.' },
  { title: 'Assess', desc: 'Website, visibility, competitors, content, campaigns, tracking, and customer journey.' },
  { title: 'Prioritize', desc: 'Separate urgent constraints, quick wins, strategic projects, and lower-priority work.' },
  { title: 'Scope', desc: 'Define the appropriate service path, responsibilities, timeline, outputs, and investment.' },
  { title: 'Execute & Improve', desc: 'Deliver the approved work, measure relevant outcomes, and refine according to evidence.' },
]

const FOCUSED_EXAMPLES = [
  'Build or replace a website', 'Develop a mobile application', 'Repair a technical SEO problem',
  'Improve local visibility', 'Produce a commercial campaign', 'Prepare the business for AI-assisted discovery',
]
const INTEGRATED_EXAMPLES = [
  'Search visibility and website conversion need to improve together',
  'Paid acquisition lacks the right landing pages and tracking',
  'Content, local visibility, email, and analytics are disconnected',
  'Leadership needs clearer priorities and regular performance decisions',
]

const SUPPORTING_PROOF = [
  { img: '/case-studies/proofs/real-estate-proof-1.png', label: 'Search Visibility', title: 'Real-estate search growth', desc: 'Technical cleanup and intent-matched architecture for high-value property demand.' },
  { img: '/case-studies/peptide-hero.png', label: 'Website / E-Commerce', title: 'E-commerce platform build', desc: 'Category architecture, performance, and conversion-aligned landing work for a complex catalog.' },
  { img: '/case-studies/qrseal-hero.png', label: 'Mobile Application', title: 'QR Seal — a real client product', desc: 'App, web, and backend — released and operational, built from a product case.' },
]

const FAQS = [
  { q: 'Do we have to use multiple services?', a: 'No. A focused project can be appropriate when the requirement is clear. Multiple services are recommended only when the business objective depends on several connected parts of the customer journey.' },
  { q: 'Do you provide fixed packages?', a: 'Some project types can use starting scopes or engagement ranges. Integrated digital marketing is scoped after discovery because the appropriate service mix depends on the business, market, priorities, budget, and existing assets.' },
  { q: 'Can you work with our existing team or suppliers?', a: 'Yes. Core Conversion can own a defined workstream, support an internal team, or coordinate with existing partners when roles, access, approvals, and accountability are clearly established.' },
  { q: 'How do you measure success?', a: 'The measurement model depends on the service and business objective. It may include visibility, qualified inquiries, conversion rate, cost efficiency, user behavior, platform adoption, technical performance, or delivery milestones.' },
  { q: 'What happens when our budget cannot cover everything?', a: 'The roadmap is phased. We prioritize the work most likely to remove the largest immediate constraint and postpone lower-impact initiatives.' },
]

/* ─────────────────────────── Helpers ─────────────────────────── */

function Kicker({ children, light = false }: { children: React.ReactNode; light?: boolean }) {
  return <span className={`inline-block text-xs font-semibold uppercase tracking-[0.24em] mb-4 ${light ? 'text-amber-400' : 'text-amber-700'}`}>{children}</span>
}

function InkButton({ href, children, external = false, event }: { href: string; children: React.ReactNode; external?: boolean; event?: string }) {
  const cls = 'group inline-flex items-center justify-center gap-2.5 bg-[#0A1730] hover:bg-[#122548] text-white font-semibold px-7 py-3.5 rounded-lg transition-colors'
  const inner = <>{children} <ArrowRight className="w-4 h-4 text-amber-400 transition-transform group-hover:translate-x-1" /></>
  const onClick = () => event && track(event, { page: 'services' })
  return external
    ? <a href={href} target="_blank" rel="noopener noreferrer" className={cls} onClick={onClick}>{inner}</a>
    : <Link href={href} className={cls} onClick={onClick}>{inner}</Link>
}

function HairlineButton({ href, children, light = false }: { href: string; children: React.ReactNode; light?: boolean }) {
  const cls = light
    ? 'inline-flex items-center justify-center gap-2 border border-white/25 text-white hover:border-white/60 font-semibold px-7 py-3.5 rounded-lg transition-colors'
    : 'inline-flex items-center justify-center gap-2 border cc-rule-md text-[#0A1730] hover:border-[#0A1730] font-semibold px-7 py-3.5 rounded-lg transition-colors'
  return (
    <Link href={href} className={cls} onClick={() => track(CCEvent.secondaryCta, { page: 'services', to: href })}>
      {children} <ArrowUpRight className="w-4 h-4" />
    </Link>
  )
}

/* Hero diagram — nine capabilities connect around one business objective.
   Assembly uses the shared cc-sat/cc-link keyframes; connectors are SVG. */
function HeroSystem({ connected = false }: { connected?: boolean }) {
  const cx = 50, cy = 50, r = 41
  return (
    <div className="relative aspect-square max-w-[460px] mx-auto w-full">
      <svg className="absolute inset-0 w-full h-full" viewBox="0 0 100 100" aria-hidden>
        {HERO_ELEMENTS.map((_, i) => {
          const a = (i / HERO_ELEMENTS.length) * Math.PI * 2 - Math.PI / 2
          return (
            <line key={i} x1={cx} y1={cy} x2={cx + r * Math.cos(a)} y2={cy + r * Math.sin(a)}
              className={connected ? undefined : 'cc-link'}
              stroke={connected ? 'rgba(251,191,36,0.5)' : '#b45309'} strokeWidth="0.3"
              style={connected ? undefined : { animationDelay: `${0.85 + i * 0.05}s` }} />
          )
        })}
      </svg>
      {/* objective hub */}
      <div className={`absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[32%] aspect-square rounded-full flex flex-col items-center justify-center text-center px-3 ${connected ? 'bg-white/[0.04] border border-amber-400/40' : 'bg-[#0A1730] cc-hub'}`}>
        <Target className="w-5 h-5 text-amber-400 mb-1.5" />
        <p className={`text-[11px] md:text-[12px] font-bold leading-tight ${connected ? 'text-white' : 'text-white'}`}>Your Business<br />Objective</p>
      </div>
      {/* capability nodes */}
      {HERO_ELEMENTS.map((label, i) => {
        const a = (i / HERO_ELEMENTS.length) * Math.PI * 2 - Math.PI / 2
        const x = cx + r * Math.cos(a)
        const y = cy + r * Math.sin(a)
        return (
          <span key={label} style={{ left: `${x}%`, top: `${y}%`, animationDelay: connected ? undefined : `${0.3 + i * 0.06}s` }}
            className={`absolute -translate-x-1/2 -translate-y-1/2 whitespace-nowrap rounded-full border px-2.5 py-1 text-[9.5px] md:text-[10.5px] font-semibold
              ${connected ? 'bg-white/[0.06] border-white/20 text-slate-200' : 'cc-sat bg-white cc-rule-md text-[#0A1730] shadow-sm'}`}>
            {label}
          </span>
        )
      })}
    </div>
  )
}

/* Band visuals — four different miniature diagrams, one per business condition */
function BandVisual({ kind }: { kind: string }) {
  if (kind === 'search') {
    return (
      <div className="space-y-2.5">
        {[80, 62, 71].map((w, i) => (
          <div key={i} className={`rounded-lg border cc-rule px-4 py-3 ${i === 1 ? 'bg-amber-500/[0.08] border-amber-500/50' : 'bg-white'}`}>
            <span className={`block h-2 rounded-full ${i === 1 ? 'bg-amber-500/70' : 'bg-[rgba(10,23,48,0.15)]'}`} style={{ width: `${w}%` }} />
            <span className="mt-1.5 block h-1.5 w-[45%] rounded-full bg-[rgba(10,23,48,0.08)]" />
          </div>
        ))}
        <p className="text-[11px] font-semibold uppercase tracking-widest text-slate-400 pt-1">Where consideration is formed</p>
      </div>
    )
  }
  if (kind === 'journey') {
    return (
      <div>
        <div className="flex items-center gap-2">
          {['Visit', 'Understand', 'Trust', 'Inquire'].map((s, i) => (
            <div key={s} className="flex items-center gap-2 flex-1">
              <span className={`flex-1 text-center rounded-lg border px-1 py-2.5 text-[11px] font-bold ${i === 3 ? 'bg-[#0A1730] border-[#0A1730] text-amber-400' : 'bg-white cc-rule text-[#0A1730]'}`}>{s}</span>
              {i < 3 && <ArrowRight className="w-3.5 h-3.5 text-amber-500 shrink-0" />}
            </div>
          ))}
        </div>
        <p className="mt-3 text-[11px] font-semibold uppercase tracking-widest text-slate-400">The journey must hold at every step</p>
      </div>
    )
  }
  if (kind === 'platform') {
    return (
      <div>
        {['Interface', 'Conversion & content', 'Data, integrations & operations'].map((l, i) => (
          <div key={l} className={`border cc-rule px-4 py-3 text-[12px] font-semibold ${i === 0 ? 'rounded-t-lg bg-[#0A1730] text-amber-400 border-[#0A1730]' : i === 2 ? 'rounded-b-lg bg-white text-slate-600 border-t-0' : 'bg-white text-slate-600 border-t-0'}`}
            style={{ marginLeft: i * 6 }}>
            {l}
          </div>
        ))}
        <p className="mt-3 text-[11px] font-semibold uppercase tracking-widest text-slate-400">The visible layer sits on the system</p>
      </div>
    )
  }
  return (
    <div>
      <div className="grid grid-cols-3 gap-2">
        {['Search', 'Content', 'Ads', 'Email', 'Analytics', 'Website'].map((l) => (
          <span key={l} className="rounded-lg border border-amber-500/40 bg-amber-500/[0.06] px-2 py-2 text-center text-[11px] font-bold text-[#0A1730]">{l}</span>
        ))}
      </div>
      <p className="mt-3 text-[11px] font-semibold uppercase tracking-widest text-slate-400">One system, one objective</p>
    </div>
  )
}

/* ─────────────────────────── Page ─────────────────────────── */

export default function ServicesHubPage() {
  const [svc, setSvc] = useState(0)
  const [openFaq, setOpenFaq] = useState<number | null>(null)
  const S = SERVICES[svc]

  return (
    <div className="relative overflow-hidden cc-canvas text-[#0A1730]">

      {/* ══════════ 1 · HERO — one objective, connected capabilities ══════════ */}
      <section className="relative border-b cc-rule">
        <div className="container-custom pt-32 md:pt-40 pb-20 md:pb-24">
          <div className="grid lg:grid-cols-[1.05fr_0.95fr] gap-14 lg:gap-10 items-center">
            <div>
              <Kicker>Core Conversion Services</Kicker>
              <h1 className="text-4xl md:text-5xl lg:text-[3.4rem] font-bold leading-[1.08] tracking-tight">
                The Right Digital Capabilities, Connected Around Your Business Objective.
              </h1>
              <p className="mt-6 text-lg md:text-xl text-slate-600 leading-relaxed max-w-xl">
                Core Conversion provides digital marketing and development services that can work independently when the
                need is specific — or operate together as a coordinated growth system.
              </p>
              <p className="mt-4 text-[15.5px] text-slate-500 leading-relaxed max-w-xl">
                Start with the business problem. We will help determine the appropriate path.
              </p>
              <div className="mt-9 flex flex-col sm:flex-row gap-4">
                <InkButton href={CAL} external event={CCEvent.discoveryCall}>Discuss Your Business</InkButton>
                <HairlineButton href="#architecture">Explore the Service Paths</HairlineButton>
              </div>
            </div>
            <div>
              <HeroSystem />
            </div>
          </div>
        </div>
      </section>

      {/* ══════════ 2 · START WITH THE OBJECTIVE — four bands ══════════ */}
      <section className="py-24 md:py-28 cc-canvas-alt border-b cc-rule">
        <div className="container-custom">
          <Reveal className="max-w-3xl mb-14">
            <Kicker>Start With the Objective</Kicker>
            <h2 className="text-3xl md:text-4xl lg:text-[2.9rem] font-bold leading-[1.12]">
              What Does the Business Need to Move Forward?
            </h2>
          </Reveal>

          <div className="space-y-6">
            {BANDS.map(({ n, title, situation, paths, link, visual }, i) => (
              <Reveal key={n} delay={(i % 2) * 0.05}>
                <div className={`grid lg:grid-cols-[110px_1.15fr_0.85fr] gap-6 lg:gap-10 rounded-xl border cc-rule p-8 md:p-10 items-center ${i % 2 ? 'cc-canvas-white' : 'bg-white/60'}`}>
                  <span className="text-5xl md:text-6xl font-extralight text-[rgba(10,23,48,0.18)] tabular-nums leading-none">{n}</span>
                  <div>
                    <h3 className="text-2xl md:text-[1.7rem] font-bold leading-snug">{title}</h3>
                    <p className="mt-3 text-[16px] text-slate-600 leading-relaxed">{situation}</p>
                    <div className="mt-4 flex flex-wrap items-center gap-x-2 gap-y-2">
                      {paths.map((p, j) => (
                        <span key={p.label} className="flex items-center gap-2">
                          <Link href={p.href} className="text-[13.5px] font-semibold text-[#0A1730] hover:text-amber-700 transition-colors">{p.label}</Link>
                          {j < paths.length - 1 && <span className="text-[rgba(10,23,48,0.25)]">·</span>}
                        </span>
                      ))}
                    </div>
                    <Link href={link.href} className="mt-5 inline-flex items-center gap-2 font-semibold text-amber-700 hover:text-amber-600 transition-colors">
                      {link.label} <ArrowRight className="w-4 h-4" />
                    </Link>
                  </div>
                  <div className="hidden lg:block">
                    <BandVisual kind={visual} />
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════ 3 · THE SERVICE ARCHITECTURE — noir ecosystem map ══════════ */}
      <section id="architecture" className="py-24 md:py-28 cc-noir scroll-mt-20">
        <div className="container-custom">
          <Reveal className="max-w-3xl mb-12">
            <Kicker light>The Service Architecture</Kicker>
            <h2 className="text-3xl md:text-4xl lg:text-[2.9rem] font-bold leading-[1.12] text-white">
              One Ecosystem. Three Territories. Seven Ways In.
            </h2>
            <p className="mt-5 text-lg text-slate-300 leading-relaxed">
              Everything orbits digital growth and digital operations. Select a service to see the business outcome it
              exists to produce.
            </p>
          </Reveal>

          <div className="grid lg:grid-cols-[0.95fr_1.05fr] gap-8 lg:gap-12 items-stretch">
            {/* territory list */}
            <Reveal>
              <div className="space-y-6">
                {['Integrated Growth', 'Search & Discovery', 'Platforms & Acquisition'].map((territory) => (
                  <div key={territory}>
                    <p className="text-[11px] font-bold uppercase tracking-[0.24em] text-slate-400 mb-2.5">{territory}</p>
                    <div className="flex flex-col gap-2">
                      {SERVICES.map((s, i) => s.territory === territory && (
                        <button key={s.title} onClick={() => { setSvc(i); track(CCEvent.workstreamSelect, { page: 'services', service: s.title }) }}
                          className={`text-left rounded-xl border px-5 py-3.5 transition-all flex items-center gap-3.5
                            ${svc === i ? 'bg-white/[0.07] border-amber-400 text-white' : 'bg-white/[0.03] border-white/10 text-slate-300 hover:border-white/30'}`}>
                          <s.icon className={`w-4.5 h-4.5 shrink-0 ${svc === i ? 'text-amber-400' : 'text-slate-400'}`} style={{ width: 18, height: 18 }} />
                          <span className="text-[15px] font-bold">{s.title}</span>
                          {s.territory === 'Integrated Growth' && (
                            <span className="ml-auto text-[9.5px] font-bold uppercase tracking-widest text-amber-400/90 border border-amber-400/30 rounded-full px-2 py-0.5">Flagship</span>
                          )}
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </Reveal>

            {/* detail panel */}
            <Reveal delay={0.05} className="flex">
              <div key={svc} className="w-full rounded-xl border border-white/10 bg-white/[0.04] p-8 md:p-10 flex flex-col">
                <span className="w-12 h-12 rounded-lg bg-white/[0.06] border border-amber-400/30 flex items-center justify-center mb-5">
                  <S.icon className="w-5 h-5 text-amber-400" />
                </span>
                <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-amber-400">{S.territory}</p>
                <h3 className="text-2xl md:text-[1.7rem] font-bold text-white mt-1.5 leading-snug">{S.title}</h3>
                <p className="mt-3 text-[16px] text-slate-300 leading-relaxed">{S.desc}</p>
                <div className="mt-6 pt-6 border-t border-white/10 space-y-4 flex-1">
                  <div>
                    <p className="text-[11px] font-bold uppercase tracking-widest text-slate-400 mb-1">Business outcome</p>
                    <p className="text-[15.5px] text-slate-200 leading-relaxed">{S.outcome}</p>
                  </div>
                  <div>
                    <p className="text-[11px] font-bold uppercase tracking-widest text-slate-400 mb-1">Ideal when</p>
                    <p className="text-[15.5px] text-slate-200 leading-relaxed">{S.useCase}</p>
                  </div>
                </div>
                <Link href={S.href} className="mt-7 inline-flex items-center gap-2 font-semibold text-amber-400 hover:text-amber-300 transition-colors"
                  onClick={() => track(CCEvent.secondaryCta, { page: 'services', to: S.href })}>
                  Explore {S.title} <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      {/* ══════════ 4 · TWO WAYS TO ENGAGE — split screen ══════════ */}
      <section className="cc-canvas-white border-b cc-rule">
        <div className="container-custom py-24 md:py-28">
          <Reveal className="max-w-3xl mb-12">
            <Kicker>Two Ways to Engage</Kicker>
            <h2 className="text-3xl md:text-4xl lg:text-[2.9rem] font-bold leading-[1.12]">
              Start With a Defined Need — or Build a Coordinated Program.
            </h2>
          </Reveal>

          <Reveal>
            <div className="grid lg:grid-cols-2 rounded-2xl overflow-hidden border cc-rule">
              {/* Focused — light */}
              <div className="p-9 md:p-12 bg-white">
                <p className="text-[11px] font-bold uppercase tracking-[0.24em] text-amber-700">Focused Engagement</p>
                <h3 className="text-2xl font-bold mt-2">A Clear, Bounded Requirement.</h3>
                <ul className="mt-6 space-y-3">
                  {FOCUSED_EXAMPLES.map((e) => (
                    <li key={e} className="flex gap-3.5 items-baseline">
                      <span className="w-1.5 h-1.5 rounded-full bg-amber-500 shrink-0 translate-y-[-2px]" aria-hidden />
                      <span className="text-[15.5px] text-slate-700 leading-relaxed">{e}</span>
                    </li>
                  ))}
                </ul>
                <p className="mt-7 pt-6 border-t cc-rule text-[15px] text-slate-600 leading-relaxed">
                  <strong className="text-[#0A1730]">What the client receives:</strong> a defined scope, delivery plan,
                  responsibilities, timeline, acceptance criteria, and investment.
                </p>
                <Link href="#architecture" className="mt-6 inline-flex items-center gap-2 font-semibold text-[#0A1730] hover:text-amber-700 transition-colors">
                  Explore Project-Based Services <ArrowRight className="w-4 h-4" />
                </Link>
              </div>

              {/* Integrated — ink */}
              <div className="p-9 md:p-12 bg-[#0A1730]">
                <p className="text-[11px] font-bold uppercase tracking-[0.24em] text-amber-400">Integrated Growth Program</p>
                <h3 className="text-2xl font-bold mt-2 text-white">Multiple Constraints, Sequenced Across Channels.</h3>
                <ul className="mt-6 space-y-3">
                  {INTEGRATED_EXAMPLES.map((e) => (
                    <li key={e} className="flex gap-3.5 items-baseline">
                      <span className="w-1.5 h-1.5 rounded-full bg-amber-400 shrink-0 translate-y-[-2px]" aria-hidden />
                      <span className="text-[15.5px] text-slate-300 leading-relaxed">{e}</span>
                    </li>
                  ))}
                </ul>
                <p className="mt-7 pt-6 border-t border-white/10 text-[15px] text-slate-300 leading-relaxed">
                  <strong className="text-white">What the client receives:</strong> a tailored roadmap, selected service
                  modules, implementation backlog, active optimization, and recurring growth reviews.
                </p>
                <Link href="/services/digital-marketing-services" className="mt-6 inline-flex items-center gap-2 font-semibold text-amber-400 hover:text-amber-300 transition-colors">
                  Explore Digital Marketing Services <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ══════════ 5 · HOW THE SERVICES WORK TOGETHER — scrollytelling ══════════ */}
      <section className="py-24 md:py-28 cc-canvas-alt border-b cc-rule">
        <div className="container-custom">
          <div className="grid lg:grid-cols-[0.9fr_1.1fr] gap-12 lg:gap-16 items-start">
            <Reveal className="lg:sticky lg:top-28">
              <Kicker>Coordinated Execution</Kicker>
              <h2 className="text-3xl md:text-4xl lg:text-[2.9rem] font-bold leading-[1.12]">
                What Coordinated Execution Actually Looks Like.
              </h2>
              <div className="mt-7 rounded-xl border cc-rule-md bg-white p-6">
                <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-amber-700 mb-2">The scenario</p>
                <p className="text-[16.5px] text-slate-700 leading-relaxed">
                  A service business wants more qualified consultation bookings.
                </p>
              </div>
              <p className="mt-6 text-[15.5px] text-slate-500 leading-relaxed border-l-2 border-amber-500 pl-4">
                The service names matter less than whether the complete customer journey works.
              </p>
            </Reveal>

            <div className="relative">
              <span className="absolute left-[23px] top-4 bottom-4 w-px bg-gradient-to-b from-amber-500 via-[rgba(10,23,48,0.15)] to-amber-500" aria-hidden />
              <div className="space-y-7">
                {STAGES.map(({ n, title, desc }) => (
                  <Reveal key={n}>
                    <div className="relative pl-16">
                      <span className="absolute left-0 top-0 w-12 h-12 rounded-full bg-white border cc-rule-md flex items-center justify-center text-[15px] font-bold shadow-sm">{n}</span>
                      <div className="rounded-xl border cc-rule bg-white p-6 md:p-7">
                        <h3 className="text-xl font-bold">{title}</h3>
                        <p className="mt-2 text-[15.5px] text-slate-600 leading-relaxed">{desc}</p>
                      </div>
                    </div>
                  </Reveal>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ══════════ 6 · FEATURED PROOF ══════════ */}
      <section className="py-24 md:py-28 cc-canvas-white border-b cc-rule">
        <div className="container-custom">
          <Reveal className="max-w-3xl mb-12">
            <Kicker>Featured Proof</Kicker>
            <h2 className="text-3xl md:text-4xl lg:text-[2.9rem] font-bold leading-[1.12]">
              Evidence Across Marketing, Platforms, and Search.
            </h2>
          </Reveal>

          {/* featured — GPG */}
          <Reveal>
            <div className="grid lg:grid-cols-2 rounded-2xl border cc-rule overflow-hidden bg-white mb-8">
              <div className="relative bg-slate-50 border-b lg:border-b-0 lg:border-r cc-rule">
                <img src="/case-studies/gpg-hero.png" alt="Golden Prosperity Group platform" loading="lazy" className="w-full h-full object-cover object-top" />
              </div>
              <div className="p-9 md:p-11">
                <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-amber-700">Featured — Connected Capabilities</p>
                <h3 className="text-2xl md:text-3xl font-bold mt-2 leading-snug">Golden Prosperity Group</h3>
                <dl className="mt-6 space-y-4">
                  <div>
                    <dt className="text-[11px] font-bold uppercase tracking-widest text-slate-400">Business context</dt>
                    <dd className="mt-1 text-[15.5px] text-slate-700 leading-relaxed">A property business whose growth depended on credibility, discoverability, and a platform able to present complex offerings clearly.</dd>
                  </div>
                  <div>
                    <dt className="text-[11px] font-bold uppercase tracking-widest text-slate-400">Connected capabilities used</dt>
                    <dd className="mt-1 text-[15.5px] text-slate-700 leading-relaxed">Website development, search architecture, content, and conversion pathways — planned as one system.</dd>
                  </div>
                  <div>
                    <dt className="text-[11px] font-bold uppercase tracking-widest text-slate-400">Evidence</dt>
                    <dd className="mt-1 text-[15.5px] text-slate-700 leading-relaxed">Real screenshots and verified outcomes are documented in the full case study, with dates and limitations stated.</dd>
                  </div>
                </dl>
                <Link href="/case-studies" onClick={() => track(CCEvent.caseStudyView, { page: 'services', case: 'gpg' })}
                  className="mt-7 inline-flex items-center gap-2 font-semibold text-[#0A1730] hover:text-amber-700 transition-colors">
                  Read the full case study <ArrowUpRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
          </Reveal>

          {/* supporting */}
          <div className="grid md:grid-cols-3 gap-6">
            {SUPPORTING_PROOF.map(({ img, label, title, desc }, i) => (
              <Reveal key={title} delay={(i % 3) * 0.06}>
                <Link href="/case-studies" onClick={() => track(CCEvent.caseStudyView, { page: 'services', case: title })}
                  className="group block h-full rounded-xl border cc-rule overflow-hidden bg-white hover:border-[rgba(10,23,48,0.3)] transition-colors">
                  <div className="relative h-40 bg-slate-50 border-b cc-rule overflow-hidden">
                    <img src={img} alt={title} loading="lazy" className="w-full h-full object-cover object-top" />
                  </div>
                  <div className="p-6">
                    <p className="text-[10.5px] font-bold uppercase tracking-[0.22em] text-amber-700">{label}</p>
                    <h3 className="text-lg font-bold mt-1.5 group-hover:text-amber-700 transition-colors">{title}</h3>
                    <p className="mt-2 text-[14.5px] text-slate-600 leading-relaxed">{desc}</p>
                  </div>
                </Link>
              </Reveal>
            ))}
          </div>

          <Reveal className="mt-10">
            <HairlineButton href="/case-studies">View All Case Studies</HairlineButton>
          </Reveal>
        </div>
      </section>

      {/* ══════════ 7 · HOW WE BEGIN — connected process ══════════ */}
      <section className="py-24 md:py-28 cc-canvas-alt border-b cc-rule">
        <div className="container-custom">
          <Reveal className="max-w-3xl mb-14">
            <Kicker>How We Begin</Kicker>
            <h2 className="text-3xl md:text-4xl lg:text-[2.9rem] font-bold leading-[1.12]">
              The Recommendation Follows the Business Context.
            </h2>
          </Reveal>

          <div className="relative">
            <span className="hidden lg:block absolute top-6 left-[8%] right-[8%] h-px bg-gradient-to-r from-amber-500 via-[rgba(10,23,48,0.15)] to-amber-500" aria-hidden />
            <div className="grid sm:grid-cols-2 lg:grid-cols-5 gap-x-6 gap-y-10">
              {PROCESS.map(({ title, desc }, i) => (
                <Reveal key={title} delay={(i % 5) * 0.05}>
                  <div className="relative">
                    <span className="relative z-10 w-12 h-12 rounded-full bg-white border cc-rule-md flex items-center justify-center text-[15px] font-bold shadow-sm mb-4">{i + 1}</span>
                    <h3 className="text-lg font-bold">{title}</h3>
                    <p className="mt-2 text-[14.5px] text-slate-600 leading-relaxed">{desc}</p>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ══════════ 8 · DECISION QUESTIONS ══════════ */}
      <section className="py-24 md:py-28 cc-canvas-white border-b cc-rule">
        <div className="container-custom">
          <div className="grid lg:grid-cols-[0.9fr_1.1fr] gap-12 lg:gap-16 items-start">
            <Reveal className="lg:sticky lg:top-28">
              <Kicker>Decision Questions</Kicker>
              <h2 className="text-3xl md:text-4xl font-bold leading-[1.14]">
                Serious Questions About Choosing a Path.
              </h2>
            </Reveal>
            <Reveal delay={0.05} className="divide-y divide-[rgba(10,23,48,0.1)] border-y cc-rule">
              {FAQS.map((f, i) => {
                const open = openFaq === i
                return (
                  <div key={f.q}>
                    <button onClick={() => { setOpenFaq(open ? null : i); if (!open) track(CCEvent.faqOpen, { page: 'services', question: f.q }) }}
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

      {/* ══════════ 9 · FINAL CTA — noir, the system fully connected ══════════ */}
      <section className="relative py-28 md:py-32 cc-noir overflow-hidden">
        <div className="container-custom relative z-10">
          <div className="grid lg:grid-cols-[1.05fr_0.95fr] gap-14 items-center">
            <Reveal>
              <span className="block h-10 w-px bg-amber-400 mb-8" aria-hidden />
              <Kicker light>Find the Right Starting Point</Kicker>
              <h2 className="text-3xl md:text-5xl font-bold leading-[1.1] text-white">
                Tell Us What the Business Needs to Achieve.
              </h2>
              <p className="mt-6 text-lg md:text-xl text-slate-300 leading-relaxed">
                We will help determine whether the right starting point is a focused service, a phased project, or a
                coordinated digital marketing program.
              </p>
              <div className="mt-10 flex flex-col sm:flex-row gap-4">
                <a href={CAL} target="_blank" rel="noopener noreferrer" onClick={() => track(CCEvent.discoveryCall, { page: 'services' })}
                  className="group inline-flex items-center justify-center gap-2.5 bg-amber-400 hover:bg-amber-300 text-[#0B0C10] font-semibold px-7 py-3.5 rounded-lg transition-colors">
                  Book a Discovery Call <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                </a>
                <HairlineButton href="/case-studies" light>View Our Work</HairlineButton>
              </div>
            </Reveal>
            <Reveal delay={0.1} className="hidden lg:block">
              {/* the hero system — now fully connected */}
              <HeroSystem connected />
            </Reveal>
          </div>
        </div>
      </section>
    </div>
  )
}

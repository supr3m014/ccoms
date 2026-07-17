'use client'

import { useEffect, useRef, useState } from 'react'
import Lenis from 'lenis'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import Link from 'next/link'
import {
  ArrowRight, ArrowUpRight, Globe, Search, Megaphone, Workflow, BarChart3, Code2,
  Split, Layers, Activity, Gauge, ClipboardList, Wrench, RefreshCw, Compass,
  PenTool, Smartphone, EyeOff, Eye, Repeat, Trophy, UserCheck, Cpu, Network,
  Handshake, CheckCircle2, Plus, Minus, Target, PieChart,
} from 'lucide-react'
import { track, CCEvent } from '@/lib/track'

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger)
}

const NAVY = '#0A1730'
const CAL = 'https://calendly.com/ccoms/discovery-call'

/* ─────────────────────────── Data ─────────────────────────── */

const SYSTEM = [
  { icon: Globe, label: 'Website' },
  { icon: Search, label: 'Search Visibility' },
  { icon: Megaphone, label: 'Paid Ads' },
  { icon: Workflow, label: 'Automation' },
  { icon: BarChart3, label: 'Analytics' },
  { icon: Code2, label: 'Development' },
]

const PROBLEMS = [
  { icon: Split, title: 'Disconnected Execution', desc: 'Different channels run independently, making growth difficult to measure or scale.' },
  { icon: Layers, title: 'Weak Digital Foundation', desc: 'A slow, unclear, or poorly structured website limits trust, visibility, and conversions.' },
  { icon: Activity, title: 'Inconsistent Lead Flow', desc: 'Inquiries rise and fall because the business has no reliable acquisition system.' },
  { icon: Gauge, title: 'No Clear Measurement', desc: 'Reports show activity, but leadership still doesn’t know what is working, what is wasting budget, or what to improve next.' },
]

const METHOD = [
  { n: '01', icon: Compass, title: 'Understand', desc: 'We learn the business model, target market, current marketing activity, and growth goals.' },
  { n: '02', icon: ClipboardList, title: 'Assess', desc: 'We review the website, search visibility, competitors, content, ads, tracking, and digital presence.' },
  { n: '03', icon: Wrench, title: 'Build', desc: 'We implement the right mix of digital marketing and development services based on priority and impact.' },
  { n: '04', icon: BarChart3, title: 'Measure', desc: 'We track visibility, traffic, inquiries, conversions, campaign performance, and business-relevant outcomes.' },
  { n: '05', icon: RefreshCw, title: 'Optimize', desc: 'We refine campaigns, pages, content, funnels, and strategy based on what the data shows.' },
]

const STAGES = [
  { icon: EyeOff, n: '01', title: 'Invisible', desc: 'Your business exists, but customers rarely find you online.' },
  { icon: Eye, n: '02', title: 'Visible', desc: 'People can find you, but inquiries are inconsistent and hard to predict.' },
  { icon: Repeat, n: '03', title: 'Predictable', desc: 'You have traction, but growth depends on improving systems, campaigns, and conversion.' },
  { icon: Trophy, n: '04', title: 'Market Leader', desc: 'You are ready to dominate your category through authority, visibility, and continuous optimization.' },
]

const CAPABILITIES = [
  { icon: Compass, title: 'Digital Strategy & Growth Planning', desc: 'Business assessment, roadmap creation, campaign prioritization, and growth recommendations.' },
  { icon: Globe, title: 'Website & Landing Page Development', desc: 'Conversion-focused websites, landing pages, technical structure, speed, security, and user experience.' },
  { icon: Search, title: 'Search Visibility', desc: 'SEO, local SEO, Google Business Profile, content architecture, schema, AEO, and AI-search visibility.' },
  { icon: Megaphone, title: 'Paid Advertising', desc: 'Meta Ads, Google Ads, campaign setup, audience targeting, creative testing, retargeting, and optimization.' },
  { icon: PenTool, title: 'Content & Authority Building', desc: 'Educational content, service pages, blog strategy, social content, and trust-building assets.' },
  { icon: Workflow, title: 'Automation & Analytics', desc: 'Tracking, reporting, email workflows, lead handling, dashboards, and process automation.' },
  { icon: Smartphone, title: 'Mobile & Custom Development', desc: 'Mobile apps, web systems, backend tools, client portals, custom workflows, and platform development.' },
]

const PROOF = [
  {
    tag: 'Real Estate Growth', image: '/case-studies/gpg-hero.png',
    problem: 'Local visibility plateau and inconsistent search traffic.',
    solution: 'Competitor gap analysis, SEO architecture, freshness-first content, technical optimization.',
    result: 'Organic visibility increased and high-value inquiries improved.',
  },
  {
    tag: 'E-Commerce Trust & Performance', image: '/case-studies/peptide-hero.png',
    problem: 'A specialized online store needed speed, compliance messaging, and trust.',
    solution: 'Lightweight e-commerce build, trust architecture, product content, tracking.',
    result: 'Faster shopping experience and stronger buyer confidence.',
  },
  {
    tag: 'Web Platform Recovery', image: '/case-studies/efficientpower-solutions.png',
    problem: 'Malware, poor performance, and fragmented lead experience.',
    solution: 'Security remediation, performance rebuild, cleaner architecture.',
    result: 'Secure, faster, more scalable website foundation.',
  },
  {
    tag: 'Mobile App & SaaS System', image: '/case-studies/qrseal-hero.png',
    problem: 'Brand authentication needed a more engaging and secure digital format.',
    solution: 'AI-powered QR system, mobile app, backend platform, analytics.',
    result: 'Custom SaaS ecosystem with web and mobile execution.',
  },
]

const IDEAL = [
  'Service businesses seeking more qualified inquiries',
  'Clinics, professional firms, and local businesses competing on trust',
  'E-commerce brands that need speed, visibility, and conversion',
  'B2B companies with complex services and longer buyer journeys',
  'Startups that need a proper digital foundation before scaling',
  'Established businesses that want stronger market authority',
]

const WHY = [
  { icon: UserCheck, title: 'Senior-Led Work', desc: 'Your account is guided by experienced leadership, not passed blindly through layers of outsourcing.' },
  { icon: Cpu, title: 'Technical Depth', desc: 'We understand the infrastructure behind performance: websites, SEO, tracking, automation, development, and data.' },
  { icon: Network, title: 'Integrated Execution', desc: 'We connect strategy, website, search, ads, content, and analytics into one growth system.' },
  { icon: Handshake, title: 'Long-Term Partnership Mindset', desc: 'We aim to grow with clients, not chase quick transactions or disconnected campaigns.' },
]

const ENGAGE = [
  { title: 'Discovery Call', desc: 'We discuss your business, goals, challenges, and current digital activity.' },
  { title: 'Initial Assessment', desc: 'We review your website, competitors, visibility, offers, tracking, and key growth opportunities.' },
  { title: 'Proposal & Roadmap', desc: 'We recommend the right priorities, scope, timeline, and investment options.' },
  { title: 'Implementation', desc: 'We execute the approved roadmap using the appropriate service modules.' },
  { title: 'Growth Review', desc: 'We track results, review progress, and refine strategy continuously.' },
]

const FAQS = [
  { q: 'Do you offer fixed packages?', a: 'We provide investment ranges and structured growth programs, but recommendations are based on your business goals, market, and current digital maturity. This prevents unnecessary work and ensures the strategy fits the business.' },
  { q: 'How do you measure success?', a: 'We focus on business-relevant indicators such as visibility, qualified inquiries, conversion performance, lead sources, campaign efficiency, and growth opportunities — not just activity metrics.' },
  { q: 'Can you work with a limited monthly budget?', a: 'Yes. If the budget is limited, we prioritize the highest-impact work first and phase the rest over time.' },
  { q: 'What if we already have a website or marketing team?', a: 'We can improve existing assets, work alongside internal teams, or focus on specific gaps such as SEO, conversion, analytics, ads, automation, or development.' },
  { q: 'How long before results?', a: 'It depends on the channel and current business condition. Paid campaigns may generate faster feedback, while SEO and authority building usually require a longer timeline. We set expectations based on the recommended roadmap.' },
]

/* ─────────────────────────── Reusable bits ─────────────────────────── */

function Kicker({ children, light = false }: { children: React.ReactNode; light?: boolean }) {
  return (
    <span className={`inline-block text-xs font-semibold uppercase tracking-[0.24em] mb-4 ${light ? 'text-amber-400' : 'text-amber-700'}`}>
      {children}
    </span>
  )
}

function GoldButton({ href, children, external = false, event }: { href: string; children: React.ReactNode; external?: boolean; event?: string }) {
  const cls = 'group inline-flex items-center justify-center gap-2.5 bg-[#0A1730] hover:bg-[#122548] text-white font-semibold px-7 py-3.5 rounded-lg transition-colors'
  const onClick = event ? () => track(event) : undefined
  const inner = <>{children} <ArrowRight className="w-4 h-4 text-amber-400 transition-transform group-hover:translate-x-1" /></>
  return external
    ? <a href={href} target="_blank" rel="noopener noreferrer" onClick={onClick} className={cls}>{inner}</a>
    : <Link href={href} onClick={onClick} className={cls}>{inner}</Link>
}

function usePrefersReducedMotion() {
  const [reduced, setReduced] = useState(false)
  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)')
    setReduced(mq.matches)
    const onChange = () => setReduced(mq.matches)
    mq.addEventListener('change', onChange)
    return () => mq.removeEventListener('change', onChange)
  }, [])
  return reduced
}

// Hub-and-spoke: six channels orbiting one central business growth system.
const HUB_NODES = [
  { icon: Globe, l1: 'Website', l2: '& Landing Pages', x: 220, y: 18 },   // top center
  { icon: Search, l1: 'Search', l2: 'Visibility', x: 24, y: 96 },   // left upper
  { icon: Target, l1: 'Paid', l2: 'Advertising', x: 416, y: 96 },   // right upper
  { icon: Workflow, l1: 'Automation', l2: '& Workflows', x: 24, y: 250 },  // left lower
  { icon: PieChart, l1: 'Analytics', l2: '& Reporting', x: 416, y: 250 },  // right lower
  { icon: Code2, l1: 'Development', l2: '& Integrations', x: 220, y: 328 },  // bottom center
]
// elbow connectors from hub (box 200,140 → 360,260) to each node edge
const HUB_LINKS = [
  'M280 140 V72',                 // Website (top)
  'M200 176 H182 V123 H144',      // Search (left upper, node right edge x=144)
  'M360 176 H378 V123 H416',      // Paid (right upper, node left edge x=416)
  'M200 224 H182 V277 H144',      // Automation (left lower)
  'M360 224 H378 V277 H416',      // Analytics (right lower)
  'M280 260 V328',                // Development (bottom)
]

function HubIcon({ Icon, x, y }: { Icon: any; x: number; y: number }) {
  return (
    <foreignObject x={x} y={y} width="22" height="22">
      <div style={{ width: 22, height: 22, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Icon width={18} height={18} color="#0A1730" strokeWidth={2} />
      </div>
    </foreignObject>
  )
}

function HeroDiagram({ reduced }: { reduced: boolean }) {
  return (
    <svg viewBox="0 0 560 400" className="w-full h-auto max-w-xl mx-auto" role="img"
      aria-label="Website, search visibility, paid advertising, automation, analytics and development connected around one central business growth system">
      {/* connector base lines (fade in during assembly) */}
      {HUB_LINKS.map((d, i) => (
        <path key={`l${i}`} className={reduced ? undefined : 'cc-link'} d={d} fill="none" stroke="#b45309" strokeOpacity="0.4" strokeWidth="1.4" strokeLinecap="round" strokeDasharray="1 6" />
      ))}

      {/* flowing pulse-dots — a continuous stream from the growth-system core out to each tool */}
      {!reduced && HUB_LINKS.map((d, i) => (
        <path key={`f${i}`} d={d} fill="none" stroke="#d97706" strokeWidth="2.6" strokeLinecap="round" strokeDasharray="2.5 20" opacity="0.9">
          <animate attributeName="stroke-dashoffset" from="22.5" to="0" dur="1.5s" begin={`${1.0 + i * 0.12}s`} repeatCount="indefinite" />
        </path>
      ))}

      {/* satellite nodes (w=120 h=54), staggered assembly */}
      {HUB_NODES.map((n, i) => (
        <g key={`n${i}`} className={reduced ? undefined : 'cc-sat'} style={reduced ? undefined : { animationDelay: `${0.35 + i * 0.09}s` }}>
          <rect x={n.x} y={n.y} width="120" height="54" rx="11" fill="#ffffff" stroke="rgba(10,23,48,0.16)" />
          <HubIcon Icon={n.icon} x={n.x + 12} y={n.y + 16} />
          <text x={n.x + 42} y={n.y + 24} fill="#0A1730" fontSize="11.5" fontWeight="700">{n.l1}</text>
          <text x={n.x + 42} y={n.y + 39} fill="#64748b" fontSize="9">{n.l2}</text>
        </g>
      ))}

      {/* central hub (box 200,140 → 360,260) — appears first */}
      <g className={reduced ? undefined : 'cc-hub'}>
        <rect x="200" y="140" width="160" height="120" rx="16" fill="#0A1730" />
        <text x="280" y="171" textAnchor="middle" fill="#cbd5e1" fontSize="10.5" fontWeight="700" letterSpacing="1.5">YOUR BUSINESS</text>
        <text x="280" y="186" textAnchor="middle" fill="#cbd5e1" fontSize="10.5" fontWeight="700" letterSpacing="1.5">GROWTH SYSTEM</text>
        <g stroke="#fbbf24" strokeWidth="3" strokeLinecap="round">
          <line x1="258" y1="238" x2="258" y2="228" />
          <line x1="270" y1="238" x2="270" y2="221" />
          <line x1="282" y1="238" x2="282" y2="214" />
          <line x1="294" y1="238" x2="294" y2="206" />
        </g>
        <path d="M256 226 L286 208 L296 214 M300 200 L296 214 L288 210" fill="none" stroke="#fbbf24" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" opacity="0.95" />
        <line x1="250" y1="240" x2="304" y2="240" stroke="#fbbf24" strokeOpacity="0.5" strokeWidth="1.5" strokeLinecap="round" />
      </g>
    </svg>
  )
}

/* ─────────────────────────── Page ─────────────────────────── */

export default function Home() {
  const lenisRef = useRef<Lenis | null>(null)
  const [openFaq, setOpenFaq] = useState<number | null>(0)
  const reduced = usePrefersReducedMotion()

  useEffect(() => {
    // Reduced-motion: show everything statically, no smooth-scroll, no reveals.
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (reduce) {
      gsap.set('.reveal', { opacity: 1, y: 0 })
      gsap.utils.toArray<HTMLElement>('.cc-line-x').forEach(el => gsap.set(el, { scaleX: 1 }))
      gsap.utils.toArray<HTMLElement>('.cc-line-y').forEach(el => gsap.set(el, { scaleY: 1 }))
      return
    }

    const lenis = new Lenis({ duration: 1.2, easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)), smoothWheel: true })
    lenisRef.current = lenis
    function raf(time: number) { lenis.raf(time); requestAnimationFrame(raf) }
    requestAnimationFrame(raf)
    lenis.on('scroll', ScrollTrigger.update)
    gsap.ticker.add((time) => lenis.raf(time * 1000))
    gsap.ticker.lagSmoothing(0)

    const ctx = gsap.context(() => {
      // Editorial reveals — one-time, confident deceleration (≈ cubic-bezier(0.22,1,0.36,1)).
      gsap.utils.toArray<HTMLElement>('.reveal').forEach((elem) => {
        gsap.fromTo(elem, { opacity: 0, y: 24 }, {
          opacity: 1, y: 0, duration: 0.75, ease: 'power3.out',
          scrollTrigger: { trigger: elem, start: 'top 85%', once: true },
        })
      })
      // Connected process / progression lines draw with scroll (continuity between sections).
      gsap.utils.toArray<HTMLElement>('.cc-line-x').forEach((line) => {
        gsap.fromTo(line, { scaleX: 0 }, {
          scaleX: 1, ease: 'none',
          scrollTrigger: { trigger: line, start: 'top 82%', end: 'top 48%', scrub: true },
        })
      })
      gsap.utils.toArray<HTMLElement>('.cc-line-y').forEach((line) => {
        gsap.fromTo(line, { scaleY: 0 }, {
          scaleY: 1, ease: 'none',
          scrollTrigger: { trigger: line, start: 'top 92%', end: 'bottom 65%', scrub: true },
        })
      })
    })

    return () => { ctx.revert(); lenis.destroy(); ScrollTrigger.getAll().forEach(t => t.kill()) }
  }, [])

  return (
    <div className="relative overflow-hidden cc-canvas text-[#0A1730]">

      {/* ══════════ 1 · HERO ══════════ */}
      <section className="relative border-b cc-rule">
        <div className="container-custom pt-36 pb-20 lg:pt-44 lg:pb-28">
          <div className="grid lg:grid-cols-2 gap-14 lg:gap-10 items-center">
            {/* Left copy */}
            <div>
              <Kicker>A Growth System — Not an Agency</Kicker>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-[1.06] tracking-tight text-[#0A1730]">
                Growth Shouldn’t Depend on Guesswork.
              </h1>
              <p className="cc-hero-in d1 mt-7 text-lg md:text-xl text-slate-600 leading-relaxed max-w-xl">
                Core Conversion helps businesses build predictable digital growth through the right combination of
                websites, search visibility, paid advertising, automation, analytics, and development.
              </p>
              <p className="cc-hero-in d2 mt-5 flex items-center gap-3 text-base text-slate-800 max-w-xl">
                <span className="h-px w-8 bg-amber-500 shrink-0" />
                Not more random marketing activity. A better growth system.
              </p>
              <div className="cc-hero-in d3 mt-9 flex flex-col sm:flex-row gap-4">
                <GoldButton href={CAL} external event={CCEvent.discoveryCall}>Book a Discovery Call</GoldButton>
                <Link href="/portfolio" onClick={() => track(CCEvent.secondaryCta, { label: 'view_our_work' })} className="inline-flex items-center justify-center gap-2 border cc-rule-md text-[#0A1730] hover:border-[#0A1730] font-semibold px-7 py-3.5 rounded-lg transition-colors">
                  View Our Work <ArrowUpRight className="w-4 h-4" />
                </Link>
              </div>
            </div>

            {/* Right — hub-and-spoke integration diagram */}
            <div className="relative">
              <HeroDiagram reduced={reduced} />
            </div>
          </div>
        </div>
      </section>

      {/* ══════════ 2 · THE PROBLEM ══════════ */}
      <section className="relative py-24 md:py-28 cc-canvas-alt border-y cc-rule">
        {/* continuity — the system line descends from the hero into the problem */}
        <span className="cc-line-y origin-top hidden md:block absolute left-1/2 -translate-x-1/2 top-0 h-14 w-0.5 bg-gradient-to-b from-amber-400 to-amber-300/0" aria-hidden />
        <div className="container-custom">
          <div className="max-w-3xl mb-14 reveal">
            <Kicker>The Real Problem</Kicker>
            <h2 className="text-4xl md:text-5xl font-bold leading-[1.12] text-slate-900">
              Most Businesses Don’t Have a Marketing Problem. They Have a System Problem.
            </h2>
            <p className="mt-5 text-lg text-slate-600 leading-relaxed">
              Websites, ads, SEO, social media, and content often fail because they operate separately instead of working
              together toward a measurable business goal.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-5">
            {PROBLEMS.map(({ icon: Icon, title, desc }) => (
              <div key={title} className="reveal group bg-white rounded-2xl border border-slate-200 p-7 md:p-8 hover:border-amber-300 hover:shadow-lg hover:shadow-slate-200/60 transition-all">
                <div className="w-12 h-12 rounded-xl bg-slate-100 border border-slate-200 flex items-center justify-center mb-5 group-hover:bg-amber-50 group-hover:border-amber-200 transition-colors">
                  <Icon className="w-5 h-5 text-slate-700 group-hover:text-amber-600 transition-colors" />
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-2">{title}</h3>
                <p className="text-slate-600 leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════ 3 · THE METHOD ══════════ */}
      <section id="method" className="py-24 md:py-28 cc-canvas-white scroll-mt-24">
        <div className="container-custom">
          <div className="max-w-3xl mb-16 reveal">
            <Kicker>Our Process</Kicker>
            <h2 className="text-4xl md:text-5xl font-bold leading-[1.12] text-slate-900">
              The Core Conversion Growth Method
            </h2>
            <p className="mt-5 text-lg text-slate-600 leading-relaxed">
              Every engagement follows a structured process: understand the business, identify the growth bottlenecks,
              build the right digital system, measure performance, and continuously improve.
            </p>
          </div>

          <div className="relative">
            {/* connecting timeline line (desktop) */}
            <span className="cc-line-x origin-left hidden lg:block absolute top-[34px] left-[10%] right-[10%] h-0.5 bg-gradient-to-r from-amber-300 via-amber-400 to-amber-300" aria-hidden />
            <div className="grid sm:grid-cols-2 lg:grid-cols-5 gap-y-12 gap-x-6">
              {METHOD.map(({ n, icon: Icon, title, desc }) => (
                <div key={title} className="reveal relative flex flex-col items-center text-center">
                  <span className="relative z-10 inline-flex w-[68px] h-[68px] rounded-2xl bg-[#0A1730] items-center justify-center shadow-lg shadow-slate-900/10 ring-8 ring-white">
                    <Icon className="w-6 h-6 text-amber-400" />
                  </span>
                  <span className="mt-5 text-xs font-bold uppercase tracking-[0.2em] text-amber-500">Step {n}</span>
                  <h3 className="mt-1.5 text-xl font-bold text-slate-900">{title}</h3>
                  <p className="mt-2.5 text-[15px] text-slate-600 leading-relaxed max-w-[15rem]">{desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ══════════ 4 · GROWTH STAGES — piano-black dramatic chapter ══════════ */}
      <section className="py-24 md:py-28 relative cc-noir">
        <div className="container-custom relative z-10">
          <div className="max-w-3xl mb-16 reveal">
            <Kicker light>Digital Maturity</Kicker>
            <h2 className="text-4xl md:text-5xl font-bold leading-[1.12] text-white">
              Where Is Your Business in Its Digital Growth Journey?
            </h2>
            <p className="mt-5 text-lg text-slate-300 leading-relaxed">
              Different businesses need different priorities. We help identify your current stage and build the right
              roadmap forward.
            </p>
          </div>

          {/* maturity path (desktop) — fills in gold on scroll */}
          <div className="hidden lg:block relative h-10 mb-1">
            <span className="absolute left-[12%] right-[12%] top-1/2 -translate-y-1/2 h-0.5 bg-white/15" aria-hidden />
            <span className="cc-line-x origin-left absolute left-[12%] right-[12%] top-1/2 -translate-y-1/2 h-0.5 bg-amber-400" aria-hidden />
            {STAGES.map((_, i) => (
              <span key={i} className="absolute top-1/2 -translate-y-1/2 w-3 h-3 rounded-full bg-amber-400 ring-4 ring-[#0B0C10]" style={{ left: `calc(12% + ${i} * (76% / 3))` }} aria-hidden />
            ))}
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {STAGES.map(({ icon: Icon, n, title, desc }) => (
              <div key={title} className="reveal relative rounded-2xl border border-white/10 bg-white/[0.04] p-7 hover:border-amber-400/50 transition-colors">
                <div className="flex items-center gap-3 mb-5">
                  <span className="w-11 h-11 rounded-xl bg-white/[0.06] border border-amber-400/30 flex items-center justify-center">
                    <Icon className="w-5 h-5 text-amber-400" />
                  </span>
                  <span className="text-xs font-semibold uppercase tracking-widest text-slate-400">Stage {n}</span>
                </div>
                <h3 className="text-xl font-bold text-white mb-2">{title}</h3>
                <p className="text-[15px] text-slate-300 leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════ 5 · CAPABILITIES ══════════ */}
      <section className="py-24 md:py-28 cc-canvas-alt border-y cc-rule">
        <div className="container-custom">
          <div className="max-w-3xl mb-14 reveal">
            <Kicker>What We Execute</Kicker>
            <h2 className="text-4xl md:text-5xl font-bold leading-[1.12] text-slate-900">
              The Capabilities Behind Your Growth System
            </h2>
            <p className="mt-5 text-lg text-slate-600 leading-relaxed">
              We combine strategy-led planning with hands-on execution across the digital channels and platforms that
              influence growth.
            </p>
          </div>

          <div className="grid lg:grid-cols-3 gap-5">
            {/* Featured capability */}
            <div className="reveal lg:col-span-2 relative overflow-hidden rounded-2xl bg-[#0A1730] text-white p-8 md:p-10 flex flex-col justify-between">
              <div className="absolute -top-20 -right-20 w-64 h-64 rounded-full bg-amber-400/10 blur-3xl" />
              <div className="relative">
                <span className="text-xs font-semibold uppercase tracking-[0.2em] text-amber-400">Where every engagement begins</span>
                <div className="flex items-start gap-5 mt-6">
                  <span className="w-14 h-14 rounded-xl bg-white/[0.06] border border-amber-400/40 flex items-center justify-center shrink-0">
                    <Compass className="w-6 h-6 text-amber-400" />
                  </span>
                  <div>
                    <h3 className="text-2xl md:text-3xl font-bold text-white leading-tight">Digital Strategy &amp; Growth Planning</h3>
                    <p className="mt-3 text-[17px] text-slate-300 leading-relaxed max-w-xl">
                      Business assessment, roadmap creation, campaign prioritization, and growth recommendations — the
                      strategic layer that decides which of the capabilities below actually move your business forward.
                    </p>
                  </div>
                </div>
              </div>
              <div className="relative mt-8 flex flex-wrap gap-2">
                {['Business assessment', 'Roadmap creation', 'Campaign prioritization', 'Growth reviews'].map(t => (
                  <span key={t} className="text-xs font-semibold text-amber-300/90 bg-white/[0.05] border border-white/10 rounded-full px-3 py-1.5">{t}</span>
                ))}
              </div>
            </div>

            {/* Connected-system note */}
            <div className="reveal rounded-2xl border border-slate-200 bg-slate-50 p-8 flex flex-col justify-center">
              <h3 className="text-xl font-bold text-slate-900 mb-2">One Connected System</h3>
              <p className="text-[15px] text-slate-600 leading-relaxed mb-5">
                These capabilities aren’t sold as isolated tasks. They’re combined into a single growth system built
                around your business objectives.
              </p>
              <Link href="/services" className="inline-flex items-center gap-2 text-amber-600 font-semibold text-sm hover:gap-3 transition-all">
                Explore capabilities <ArrowRight className="w-4 h-4" />
              </Link>
            </div>

            {/* Supporting capabilities */}
            {CAPABILITIES.slice(1).map(({ icon: Icon, title, desc }) => (
              <div key={title} className="reveal group bg-white rounded-2xl border border-slate-200 p-7 hover:border-amber-300 hover:shadow-lg transition-all">
                <div className="w-12 h-12 rounded-xl bg-[#0A1730] flex items-center justify-center mb-5">
                  <Icon className="w-5 h-5 text-amber-400" />
                </div>
                <h3 className="text-lg font-bold text-slate-900 mb-2 leading-snug">{title}</h3>
                <p className="text-[15px] text-slate-600 leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════ 6 · SELECTED PROOF ══════════ */}
      <section className="py-24 md:py-28 cc-canvas-white">
        <div className="container-custom">
          <div className="max-w-3xl mb-14 reveal">
            <Kicker>Selected Proof</Kicker>
            <h2 className="text-4xl md:text-5xl font-bold leading-[1.12] text-slate-900">
              Proof Through Execution
            </h2>
            <p className="mt-5 text-lg text-slate-600 leading-relaxed">
              Our work spans websites, SEO campaigns, e-commerce, apps, and digital systems built to support real
              business objectives.
            </p>
          </div>

          {/* Featured case study */}
          <div className="reveal grid lg:grid-cols-2 rounded-2xl border border-slate-200 overflow-hidden bg-white mb-6">
            <div className="relative min-h-[280px] lg:min-h-[420px] bg-slate-100 overflow-hidden">
              <img src={PROOF[0].image} alt={`${PROOF[0].tag} — Core Conversion project`} loading="lazy" decoding="async" className="absolute inset-0 w-full h-full object-cover object-top" />
              <span className="absolute top-5 left-5 text-[11px] font-bold uppercase tracking-widest text-[#0A1730] bg-amber-400 rounded-full px-3.5 py-1.5">Featured Case Study</span>
            </div>
            <div className="p-8 md:p-11 flex flex-col justify-center">
              <span className="text-sm font-semibold uppercase tracking-widest text-amber-600 mb-5">{PROOF[0].tag}</span>
              <dl className="space-y-5 flex-none">
                <div>
                  <dt className="font-semibold text-slate-400 uppercase tracking-wide text-[11px] mb-1">Business Challenge</dt>
                  <dd className="text-[17px] text-slate-700 leading-relaxed">{PROOF[0].problem}</dd>
                </div>
                <div>
                  <dt className="font-semibold text-slate-400 uppercase tracking-wide text-[11px] mb-1">What Core Conversion Did</dt>
                  <dd className="text-[17px] text-slate-700 leading-relaxed">{PROOF[0].solution}</dd>
                </div>
                <div>
                  <dt className="font-semibold text-amber-600 uppercase tracking-wide text-[11px] mb-1">Business Result</dt>
                  <dd className="text-xl text-slate-900 font-bold leading-snug">{PROOF[0].result}</dd>
                </div>
              </dl>
              <Link href="/case-studies" className="inline-flex items-center gap-2 text-[#0A1730] font-semibold mt-8 hover:gap-3 transition-all">
                View Full Case Study <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>

          {/* Supporting cases */}
          <div className="grid md:grid-cols-3 gap-5">
            {PROOF.slice(1).map((c) => (
              <div key={c.tag} className="reveal group rounded-2xl border border-slate-200 overflow-hidden hover:shadow-lg transition-all flex flex-col bg-white">
                <div className="h-40 overflow-hidden bg-slate-100">
                  <img src={c.image} alt={c.tag} loading="lazy" className="w-full h-full object-cover object-top group-hover:scale-[1.03] transition-transform duration-500" />
                </div>
                <div className="p-6 flex flex-col flex-1">
                  <span className="text-[11px] font-semibold uppercase tracking-widest text-amber-600 mb-3">{c.tag}</span>
                  <p className="text-[15px] text-slate-600 leading-relaxed flex-1">
                    <span className="font-semibold text-slate-800">Result:</span> {c.result}
                  </p>
                  <Link href="/case-studies" className="inline-flex items-center gap-1.5 text-[#0A1730] font-semibold text-sm mt-5 hover:gap-2.5 transition-all">
                    View Case Study <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            ))}
          </div>

          <div className="reveal mt-12">
            <Link href="/portfolio" className="inline-flex items-center gap-2 text-[#0A1730] font-semibold hover:gap-3 transition-all">
              View the full portfolio <ArrowRight className="w-5 h-5" />
            </Link>
          </div>
        </div>
      </section>

      {/* ══════════ 7 · WHO WE WORK WITH ══════════ */}
      <section className="py-24 md:py-28 cc-canvas-alt border-y cc-rule">
        <div className="container-custom">
          <div className="grid lg:grid-cols-2 gap-14 items-center">
            <div className="reveal">
              <Kicker>Who We Work With</Kicker>
              <h2 className="text-3xl md:text-4xl font-bold leading-tight text-slate-900">
                Built for Businesses That Want More Than Random Marketing Activity
              </h2>
              <p className="mt-5 text-lg text-slate-600 leading-relaxed">
                Core Conversion works best with companies that want a long-term digital growth partner, not isolated
                one-off tasks with no strategic direction.
              </p>
            </div>

            <div className="reveal bg-white rounded-2xl border border-slate-200 p-8 md:p-9">
              <p className="text-xs font-semibold uppercase tracking-widest text-slate-400 mb-6">Ideal Clients</p>
              <ul className="space-y-4">
                {IDEAL.map((item) => (
                  <li key={item} className="flex items-start gap-3.5">
                    <CheckCircle2 className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
                    <span className="text-slate-700 leading-relaxed">{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* ══════════ 8 · WHY CORE CONVERSION ══════════ */}
      <section className="py-24 md:py-28 relative cc-canvas-alt border-y cc-rule">
        <div className="container-custom relative z-10">
          <div className="max-w-3xl mb-16 reveal">
            <Kicker>Why Core Conversion</Kicker>
            <h2 className="text-4xl md:text-5xl font-bold leading-[1.12] text-[#0A1730]">
              Strategy-Led. Execution-Proven. Owner-Driven.
            </h2>
            <p className="mt-5 text-lg text-slate-600 leading-relaxed">
              Core Conversion is built on more than 15 years of hands-on digital marketing, SEO, website development, and
              technical execution.
            </p>
          </div>

          <div className="grid lg:grid-cols-[0.82fr_1.18fr] gap-8 lg:gap-12 items-stretch">
            {/* Real team image */}
            <div className="reveal relative rounded-2xl overflow-hidden border cc-rule-md min-h-[340px] shadow-[0_18px_50px_-30px_rgba(10,23,48,0.35)]">
              <img src="/portfolio/team-collage.png" alt="The Core Conversion team" loading="lazy" decoding="async" className="absolute inset-0 w-full h-full object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-[#0A1730] via-[#0A1730]/50 to-transparent" />
              <div className="absolute bottom-0 inset-x-0 p-6">
                <div className="flex items-center gap-3">
                  <img src="/portfolio/paul-avatar.png" alt="Paul Carrasco" className="w-12 h-12 rounded-full object-cover border-2 border-amber-400/70 shrink-0" />
                  <div>
                    <p className="text-white font-bold leading-tight">Founder-led. Team-executed.</p>
                    <p className="text-slate-300 text-sm">Paul Carrasco &amp; the Core Conversion team</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Advantage blocks */}
            <div className="grid sm:grid-cols-2 gap-4">
              {WHY.map(({ icon: Icon, title, desc }) => (
                <div key={title} className="reveal flex flex-col rounded-2xl border cc-rule bg-white p-7 hover:border-amber-500/60 transition-colors">
                  <span className="w-12 h-12 rounded-xl bg-[#0A1730] flex items-center justify-center mb-5">
                    <Icon className="w-5 h-5 text-amber-400" />
                  </span>
                  <h3 className="text-xl font-bold text-[#0A1730] mb-2">{title}</h3>
                  <p className="text-[15px] text-slate-600 leading-relaxed">{desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ══════════ 9 · ENGAGEMENT PROCESS ══════════ */}
      <section className="py-24 md:py-28 cc-canvas-white">
        <div className="container-custom">
          <div className="max-w-3xl mb-16 reveal">
            <Kicker>Getting Started</Kicker>
            <h2 className="text-4xl md:text-5xl font-bold leading-[1.12] text-slate-900">
              How an Engagement Starts
            </h2>
          </div>

          <div className="max-w-3xl mx-auto lg:mx-0">
            <div className="relative">
              <span className="absolute left-[22px] top-3 bottom-3 w-px bg-slate-200" aria-hidden />
              <ol className="space-y-6">
                {ENGAGE.map((s, i) => (
                  <li key={s.title} className="reveal relative flex gap-6 items-start">
                    <span className="relative z-10 w-11 h-11 rounded-full bg-[#0A1730] text-amber-400 font-bold flex items-center justify-center shrink-0">
                      {i + 1}
                    </span>
                    <div className="pt-1.5">
                      <h3 className="text-lg font-bold text-slate-900">{s.title}</h3>
                      <p className="text-slate-600 leading-relaxed mt-1">{s.desc}</p>
                    </div>
                  </li>
                ))}
              </ol>
            </div>
            <div className="reveal mt-12 pl-0 lg:pl-[68px]">
              <GoldButton href={CAL} external>Start With a Discovery Call</GoldButton>
            </div>
          </div>
        </div>
      </section>

      {/* ══════════ 10 · EXECUTIVE QUESTIONS ══════════ */}
      <section className="py-24 md:py-28 cc-canvas-alt border-y cc-rule">
        <div className="container-custom">
          <div className="grid lg:grid-cols-[0.9fr_1.1fr] gap-12 lg:gap-16 items-start">
            <div className="reveal lg:sticky lg:top-28">
              <Kicker>Before You Reach Out</Kicker>
              <h2 className="text-3xl md:text-4xl font-bold leading-tight text-slate-900">
                Questions Business Owners Usually Ask Before Working With Us
              </h2>
            </div>

            <div className="reveal divide-y divide-slate-200 border-y border-slate-200">
              {FAQS.map((f, i) => {
                const open = openFaq === i
                return (
                  <div key={f.q}>
                    <button
                      onClick={() => { const next = open ? null : i; setOpenFaq(next); if (next !== null) track(CCEvent.faqOpen, { q: f.q }) }}
                      aria-expanded={open}
                      className="w-full flex items-start justify-between gap-6 text-left py-6 group"
                    >
                      <span className="text-lg font-semibold text-slate-900 group-hover:text-amber-600 transition-colors">{f.q}</span>
                      <span className="w-7 h-7 rounded-full border border-slate-300 flex items-center justify-center shrink-0 mt-0.5 text-slate-500 group-hover:border-amber-400 group-hover:text-amber-600 transition-colors">
                        {open ? <Minus className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
                      </span>
                    </button>
                    <div className={`grid transition-all duration-300 ease-out ${open ? 'grid-rows-[1fr] opacity-100 pb-6' : 'grid-rows-[0fr] opacity-0'}`}>
                      <div className="overflow-hidden">
                        <p className="text-slate-600 leading-relaxed max-w-xl">{f.a}</p>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      </section>

      {/* ══════════ 11 · FINAL CTA — piano-black conclusive close ══════════ */}
      <section className="py-28 md:py-32 relative cc-noir">
        {/* continuity — the path that began in the hero completes here */}
        <span className="cc-line-y origin-top hidden md:block absolute left-1/2 -translate-x-1/2 top-0 h-16 w-0.5 bg-gradient-to-b from-amber-400 to-amber-400/0 z-10" aria-hidden />
        <div className="container-custom relative z-10">
          <div className="max-w-3xl mx-auto text-center reveal">
            <Kicker light>Take the Next Step</Kicker>
            <h2 className="text-3xl md:text-5xl font-bold leading-[1.1] text-white">
              Let’s Identify What’s Holding Your Growth Back.
            </h2>
            <p className="mt-6 text-lg md:text-xl text-slate-300 leading-relaxed">
              Book a discovery call and we’ll discuss your business, current digital presence, and the opportunities that
              may be limiting growth.
            </p>
            <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center">
              {/* On a dark section the primary CTA becomes gold-fill (the navy-ink button would vanish) */}
              <a href={CAL} target="_blank" rel="noopener noreferrer" onClick={() => track(CCEvent.discoveryCall)}
                className="group inline-flex items-center justify-center gap-2.5 bg-amber-400 hover:bg-amber-300 text-[#0B0C10] font-semibold px-7 py-3.5 rounded-lg transition-colors">
                Book a Discovery Call <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
              </a>
              <Link href="/portfolio" onClick={() => track(CCEvent.secondaryCta, { label: 'view_portfolio' })} className="inline-flex items-center justify-center gap-2 border border-white/25 text-white hover:bg-white/10 font-semibold px-7 py-3.5 rounded-lg transition-colors">
                View Portfolio <ArrowUpRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}

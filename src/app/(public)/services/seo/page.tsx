'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Reveal } from '@/components/Reveal'
import { track, CCEvent } from '@/lib/track'
import {
  ArrowRight, ArrowUpRight, Plus, Minus, Search, FileSearch, Landmark, MousePointerClick,
  ServerCog, Network, FileText, TrendingUp, Link2, Target, LineChart, ShieldCheck,
} from 'lucide-react'

const CAL = 'https://calendly.com/ccoms/discovery-call'

/* ─────────────────────────── Data ─────────────────────────── */

const INTENTS = [
  { stage: 'Problem Awareness', icon: Search, desc: 'Customers search for symptoms, challenges, comparisons, or ways to solve a problem.', example: 'Early — shapes the shortlist' },
  { stage: 'Solution Research', icon: FileSearch, desc: 'Customers investigate service types, product categories, processes, costs, alternatives, and expected results.', example: 'Middle — builds preference' },
  { stage: 'Provider Evaluation', icon: Landmark, desc: 'Customers compare businesses, expertise, proof, reviews, locations, and fit.', example: 'Late — decides the shortlist' },
  { stage: 'Transaction or Inquiry', icon: MousePointerClick, desc: 'Customers search with strong intent to contact, book, buy, apply, or request a quotation.', example: 'Now — converts to revenue' },
]

const UNDERPERFORM = [
  'The keyword list does not reflect the business model.',
  'Technical problems prevent crawling, indexing, speed, or usability.',
  'Multiple pages compete for the same topic.',
  'Content exists without a coherent architecture.',
  'Pages target traffic but not customer intent.',
  'Authority work is weak, risky, irrelevant, or poorly documented.',
  'The website cannot convert relevant traffic.',
  'Reporting celebrates impressions without business interpretation.',
  'The strategy is not updated as competitors and search behavior change.',
]

const AUDIT_DIMENSIONS = [
  {
    title: 'Business & Search Demand',
    lead: 'The strategy must start from the business — not from a keyword tool.',
    items: ['Business model', 'Priority services & products', 'Markets', 'Customers', 'Margins & value', 'Seasonality', 'Sales cycle', 'Search demand', 'Competitive landscape'],
  },
  {
    title: 'Technical Foundation',
    lead: 'If search engines cannot reliably access and interpret the site, nothing above it compounds.',
    items: ['Crawlability', 'Indexation', 'Architecture', 'Redirects', 'Canonicals', 'Performance', 'Mobile usability', 'Structured data', 'Rendering', 'Duplication', 'International & e-commerce requirements'],
  },
  {
    title: 'Content & Relevance',
    lead: 'Every important page needs a purpose, an intent, and a reason to be chosen.',
    items: ['Topic coverage', 'Page purpose', 'Keyword & intent alignment', 'Content quality', 'Freshness', 'Internal linking', 'Cannibalization', 'E-E-A-T evidence', 'Conversion support'],
  },
  {
    title: 'Authority & Trust',
    lead: 'Authority is earned evidence that the business deserves visibility.',
    items: ['Backlink profile', 'Brand signals', 'Mentions', 'Reputation', 'Link risk', 'Citation opportunities', 'Proof', 'Author & organization clarity'],
  },
  {
    title: 'Measurement',
    lead: 'What cannot be interpreted cannot be improved with confidence.',
    items: ['Analytics', 'Search Console', 'Conversion events', 'Landing-page behavior', 'Lead-source visibility', 'Ranking & visibility trends', 'Attribution limitations'],
  },
]

const FLYWHEEL = [
  { icon: ServerCog, title: 'Technical Reliability', desc: 'Ensure the search platform can access, interpret, and serve the right pages efficiently.' },
  { icon: Network, title: 'Search & Content Architecture', desc: 'Map business priorities, customer intent, pages, topics, and internal relationships.' },
  { icon: Target, title: 'High-Value Page Improvement', desc: 'Strengthen service, category, product, location, comparison, and conversion pages before producing volume content.' },
  { icon: FileText, title: 'Authority Content', desc: 'Create credible resources that support topical depth, customer education, internal linking, and discoverability.' },
  { icon: Link2, title: 'Authority Development', desc: 'Pursue relevant mentions, links, partnerships, citations, digital PR, and trust signals through defensible methods.' },
  { icon: MousePointerClick, title: 'Conversion Alignment', desc: 'Ensure organic visitors receive a clear message, proof, and next step.' },
  { icon: LineChart, title: 'Measurement & Iteration', desc: 'Review visibility, page performance, conversions, market shifts, and constraints to prioritize the next work.' },
]

const INITIAL_OUTPUTS = ['Search & business assessment', 'Technical audit', 'Competitor & search landscape', 'Keyword & intent model', 'Page & content map', 'Priority roadmap', 'Measurement plan']
const ONGOING_OUTPUTS = ['Technical fixes', 'Page optimization', 'New page briefs or content', 'Internal linking', 'Schema', 'Content updates', 'Authority development', 'Monitoring', 'Search-performance interpretation', 'Priority backlog', 'Growth review']

const PROOF_CASES = [
  {
    img: '/case-studies/proofs/real-estate-proof-1.png',
    sector: 'Real Estate',
    context: 'A property business competing for high-value, non-brand search demand in a saturated market.',
    work: 'Technical cleanup, search architecture around priority developments, and content aligned to buyer intent.',
    note: 'Search Console evidence with date ranges is presented in the full case study, including its limitations.',
  },
  {
    img: '/case-studies/proofs/legal-proof-1.png',
    sector: 'Legal Services',
    context: 'A practice whose expertise was not visible for the case types it most wanted.',
    work: 'Practice-area page architecture, intent-matched content, and authority signals built around real credentials.',
    note: 'Visibility screenshots are shown with the period they cover — not as a promise of future rankings.',
  },
  {
    img: '/case-studies/proofs/pharma-proof-1.png',
    sector: 'E-Commerce / Peptides',
    context: 'A regulated-adjacent catalog where category and product pages had to carry the ranking load.',
    work: 'Category architecture, product-page relevance, technical performance, and conversion-aligned landing work.',
    note: 'E-commerce attribution is imperfect; measured outcomes and directional signals are labeled separately.',
  },
]

const MEASURE_AREAS = [
  'Visibility for priority topics', 'Impressions and clicks', 'Qualified organic sessions', 'Landing-page performance',
  'Inquiries or transactions', 'Non-brand and brand discovery', 'Conversion rate', 'Assisted conversions where measurable',
  'Technical health', 'Content contribution', 'Authority progress', 'Competitor movement',
]

const ENGAGEMENTS = [
  'Technical recovery', 'Search foundation', 'Ongoing SEO growth', 'E-commerce SEO',
  'B2B / content-led SEO', 'Migration support', 'Site-redesign SEO', 'Multi-market SEO',
]

const INVESTMENT_DRIVERS = [
  'Website size', 'Technical condition', 'Market competition', 'Geography', 'Content needs',
  'Authority gap', 'Internal client resources', 'Implementation responsibility', 'Reporting & coordination', 'Speed of execution',
]

const FAQS = [
  { q: 'How long does SEO take?', a: 'The time to meaningful progress depends on starting condition, competition, website authority, technical constraints, content quality, implementation speed, and market demand. The proposal defines expected milestones rather than promising a guaranteed ranking date.' },
  { q: 'Do you guarantee Page One rankings?', a: 'No. Search engines control results, competitors continue working, and algorithms change. Core Conversion can commit to the approved strategy, execution, transparency, and measurement — not a guaranteed position.' },
  { q: 'How many articles are included?', a: 'Content quantity follows the roadmap. Publishing more articles is not always the highest-value action.' },
  { q: 'Do you build backlinks?', a: 'Authority development may include relevant links, mentions, partnerships, citations, outreach, and digital PR. The methods, risks, and expectations are always transparent.' },
  { q: 'Can SEO work with a limited budget?', a: 'Yes, but scope and pace must be realistic. The first phase focuses on the highest-impact constraints and commercially important pages.' },
  { q: 'Is website development included?', a: 'Technical and content changes may be included within defined limits. Major redesigns, new systems, and extensive development are scoped separately or combined into an integrated engagement.' },
]

/* ─────────────────────────── Helpers ─────────────────────────── */

function Kicker({ children, light = false }: { children: React.ReactNode; light?: boolean }) {
  return <span className={`inline-block text-xs font-semibold uppercase tracking-[0.24em] mb-4 ${light ? 'text-amber-400' : 'text-amber-700'}`}>{children}</span>
}

function InkButton({ href, children, external = false, event }: { href: string; children: React.ReactNode; external?: boolean; event?: string }) {
  const cls = 'group inline-flex items-center justify-center gap-2.5 bg-[#0A1730] hover:bg-[#122548] text-white font-semibold px-7 py-3.5 rounded-lg transition-colors'
  const inner = <>{children} <ArrowRight className="w-4 h-4 text-amber-400 transition-transform group-hover:translate-x-1" /></>
  const onClick = () => event && track(event, { page: 'seo' })
  return external
    ? <a href={href} target="_blank" rel="noopener noreferrer" className={cls} onClick={onClick}>{inner}</a>
    : <Link href={href} className={cls} onClick={onClick}>{inner}</Link>
}

function HairlineButton({ href, children, light = false }: { href: string; children: React.ReactNode; light?: boolean }) {
  const cls = light
    ? 'inline-flex items-center justify-center gap-2 border border-white/25 text-white hover:border-white/60 font-semibold px-7 py-3.5 rounded-lg transition-colors'
    : 'inline-flex items-center justify-center gap-2 border cc-rule-md text-[#0A1730] hover:border-[#0A1730] font-semibold px-7 py-3.5 rounded-lg transition-colors'
  return (
    <Link href={href} className={cls} onClick={() => track(CCEvent.secondaryCta, { page: 'seo', to: href })}>
      {children} <ArrowUpRight className="w-4 h-4" />
    </Link>
  )
}

/* Hero — demand flows through a system into measured action */
function HeroFlow() {
  const stages = ['Search demand', 'Content & technical system', 'Qualified discovery', 'Relevant landing experience', 'Measured action']
  return (
    <div className="rounded-xl border cc-rule-md cc-canvas-white p-6 md:p-7 shadow-[0_24px_60px_-30px_rgba(10,23,48,0.35)]">
      <p className="text-[10px] font-bold uppercase tracking-[0.28em] text-slate-400 mb-5">How organic demand becomes revenue</p>
      <ol className="space-y-0">
        {stages.map((s, i) => (
          <li key={s} className="relative pl-9 pb-5 last:pb-0">
            {i < stages.length - 1 && <span className="absolute left-[13px] top-7 bottom-0 w-px bg-gradient-to-b from-amber-500/70 to-[rgba(10,23,48,0.12)]" aria-hidden />}
            <span className={`absolute left-0 top-0.5 w-7 h-7 rounded-full border text-[11px] font-bold flex items-center justify-center
              ${i === stages.length - 1 ? 'bg-[#0A1730] border-[#0A1730] text-amber-400' : 'bg-white cc-rule-md text-[#0A1730]'}`}>
              {i + 1}
            </span>
            <p className={`text-[15px] leading-snug ${i === stages.length - 1 ? 'font-bold text-[#0A1730]' : 'font-medium text-slate-700'}`}>{s}</p>
          </li>
        ))}
      </ol>
      <p className="mt-5 pt-4 border-t cc-rule text-[12.5px] text-slate-500 leading-relaxed">
        FIG. 01 — Rankings are the middle of this system, not the end of it.
      </p>
    </div>
  )
}

/* ─────────────────────────── Page ─────────────────────────── */

export default function SeoServicesPage() {
  const [dim, setDim] = useState(0)
  const [wheel, setWheel] = useState(0)
  const [openFaq, setOpenFaq] = useState<number | null>(null)
  const D = AUDIT_DIMENSIONS[dim]
  const W = FLYWHEEL[wheel]

  return (
    <div className="relative overflow-hidden cc-canvas text-[#0A1730]">

      {/* ══════════ 1 · HERO ══════════ */}
      <section className="relative border-b cc-rule">
        <div className="container-custom pt-32 md:pt-40 pb-20 md:pb-24">
          <div className="grid lg:grid-cols-[1.1fr_0.9fr] gap-14 lg:gap-16 items-center">
            <div>
              <Kicker>SEO Services</Kicker>
              <h1 className="text-4xl md:text-5xl lg:text-[3.4rem] font-bold leading-[1.08] tracking-tight">
                Build Search Visibility Around the Customers and Opportunities That Matter.
              </h1>
              <p className="mt-6 text-lg md:text-xl text-slate-600 leading-relaxed max-w-xl">
                Core Conversion improves how a business is discovered, understood, and chosen through technical SEO,
                content architecture, on-page relevance, authority development, and conversion-aligned search strategy.
              </p>
              <p className="mt-4 text-[15.5px] text-slate-500 leading-relaxed max-w-xl">
                The objective is not more rankings in isolation. It is stronger visibility for commercially relevant demand.
              </p>
              <div className="mt-9 flex flex-col sm:flex-row gap-4">
                <InkButton href={CAL} external event={CCEvent.discoveryCall}>Discuss Your Search Visibility</InkButton>
                <HairlineButton href="#proof">View SEO Results</HairlineButton>
              </div>
            </div>
            <Reveal delay={0.1}>
              <HeroFlow />
            </Reveal>
          </div>
        </div>
      </section>

      {/* ══════════ 2 · THE BUSINESS ROLE — intent spectrum ══════════ */}
      <section className="py-24 md:py-28 cc-canvas-alt border-b cc-rule">
        <div className="container-custom">
          <Reveal className="max-w-3xl mb-14">
            <Kicker>The Business Role of SEO</Kicker>
            <h2 className="text-3xl md:text-4xl lg:text-[2.9rem] font-bold leading-[1.12]">
              Search Is a Demand Channel and a Long-Term Business Asset.
            </h2>
            <p className="mt-5 text-lg text-slate-600 leading-relaxed">
              SEO should help the business appear with the right information at the stages where organic search
              influences the decision.
            </p>
          </Reveal>

          {/* Intent spectrum — one connected band, not four cards */}
          <Reveal>
            <div className="relative">
              <span className="hidden lg:block absolute top-7 left-[6%] right-[6%] h-px bg-gradient-to-r from-[rgba(10,23,48,0.12)] via-amber-500/60 to-amber-500" aria-hidden />
              <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-x-8 gap-y-10">
                {INTENTS.map(({ stage, icon: Icon, desc, example }, i) => (
                  <div key={stage} className="relative">
                    <span className={`relative z-10 w-14 h-14 rounded-full flex items-center justify-center border mb-5
                      ${i === INTENTS.length - 1 ? 'bg-[#0A1730] border-[#0A1730]' : 'bg-white cc-rule-md'}`}>
                      <Icon className={`w-6 h-6 ${i === INTENTS.length - 1 ? 'text-amber-400' : 'text-[#0A1730]'}`} />
                    </span>
                    <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-amber-700">{example}</p>
                    <h3 className="text-xl font-bold mt-1.5">{stage}</h3>
                    <p className="mt-2.5 text-[15.5px] text-slate-600 leading-relaxed">{desc}</p>
                  </div>
                ))}
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ══════════ 3 · WHY SEO PROGRAMS UNDERPERFORM — findings sheet ══════════ */}
      <section className="py-24 md:py-28 cc-canvas-white border-b cc-rule">
        <div className="container-custom">
          <div className="grid lg:grid-cols-[0.85fr_1.15fr] gap-12 lg:gap-16 items-start">
            <Reveal className="lg:sticky lg:top-28">
              <Kicker>Program Audit</Kicker>
              <h2 className="text-3xl md:text-4xl font-bold leading-[1.14]">
                Why SEO Programs Underperform.
              </h2>
              <p className="mt-5 text-[17px] text-slate-600 leading-relaxed">
                When an SEO engagement fails, the causes are rarely mysterious. They are usually one or more of these —
                and an honest assessment names them before proposing more spend.
              </p>
              <p className="mt-6 text-[15.5px] text-slate-500 leading-relaxed border-l-2 border-amber-500 pl-4">
                SEO requires technical execution, editorial judgment, business relevance, and patient compounding —
                not isolated tricks.
              </p>
            </Reveal>
            <Reveal delay={0.05}>
              <div className="border-y cc-rule divide-y divide-[rgba(10,23,48,0.08)]">
                {UNDERPERFORM.map((issue, i) => (
                  <div key={issue} className="flex items-baseline gap-5 py-4">
                    <span className="text-[13px] font-bold text-amber-700 tabular-nums shrink-0 w-8">{String(i + 1).padStart(2, '0')}</span>
                    <p className="text-[16.5px] text-slate-700 leading-relaxed">{issue}</p>
                  </div>
                ))}
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      {/* ══════════ 4 · SEO ASSESSMENT — audit workspace ══════════ */}
      <section className="py-24 md:py-28 cc-canvas-alt border-b cc-rule">
        <div className="container-custom">
          <Reveal className="max-w-3xl mb-12">
            <Kicker>The SEO Assessment</Kicker>
            <h2 className="text-3xl md:text-4xl lg:text-[2.9rem] font-bold leading-[1.12]">
              Five Dimensions, Examined Before Anything Is Recommended.
            </h2>
          </Reveal>

          <div className="grid lg:grid-cols-[0.85fr_1.15fr] gap-8 lg:gap-12 items-stretch">
            <Reveal>
              <div className="flex flex-col gap-2.5" role="tablist" aria-label="Assessment dimensions">
                {AUDIT_DIMENSIONS.map((d, i) => (
                  <button key={d.title} onClick={() => { setDim(i); track(CCEvent.workstreamSelect, { page: 'seo', dimension: d.title }) }}
                    role="tab" aria-selected={dim === i}
                    className={`text-left rounded-xl border px-6 py-4 transition-all
                      ${dim === i ? 'bg-white border-amber-500 shadow-[0_10px_30px_-18px_rgba(10,23,48,0.35)]' : 'bg-white/50 cc-rule hover:border-[rgba(10,23,48,0.3)]'}`}>
                    <span className="flex items-center gap-4">
                      <span className={`text-[13px] font-bold tabular-nums ${dim === i ? 'text-amber-600' : 'text-slate-400'}`}>{String(i + 1).padStart(2, '0')}</span>
                      <span className={`text-[16.5px] font-bold ${dim === i ? 'text-[#0A1730]' : 'text-slate-600'}`}>{d.title}</span>
                    </span>
                  </button>
                ))}
              </div>
            </Reveal>
            <Reveal delay={0.05} className="flex">
              <div key={dim} className="w-full rounded-xl border cc-rule-md cc-canvas-white p-8 md:p-9">
                <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-amber-700">Dimension {String(dim + 1).padStart(2, '0')} of {AUDIT_DIMENSIONS.length}</p>
                <h3 className="text-2xl font-bold mt-1.5">{D.title}</h3>
                <p className="mt-3 text-[16.5px] text-slate-600 leading-relaxed">{D.lead}</p>
                <div className="mt-6 pt-6 border-t cc-rule flex flex-wrap gap-2">
                  {D.items.map((it) => (
                    <span key={it} className="rounded-full bg-white border cc-rule-md px-3.5 py-1.5 text-[13.5px] font-medium text-slate-700">{it}</span>
                  ))}
                </div>
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      {/* ══════════ 5 · THE SEO GROWTH SYSTEM — noir flywheel ══════════ */}
      <section className="py-24 md:py-28 cc-noir">
        <div className="container-custom">
          <Reveal className="max-w-3xl mb-14">
            <Kicker light>The SEO Growth System</Kicker>
            <h2 className="text-3xl md:text-4xl lg:text-[2.9rem] font-bold leading-[1.12] text-white">
              Seven Workstreams That Turn Effort Into a Compounding Asset.
            </h2>
            <p className="mt-5 text-lg text-slate-300 leading-relaxed">
              Select a workstream. Each one feeds the next — that is why the system compounds where isolated tactics decay.
            </p>
          </Reveal>

          <div className="grid lg:grid-cols-[1fr_0.9fr] gap-10 lg:gap-14 items-center">
            {/* Flywheel diagram */}
            <Reveal>
              <div className="relative aspect-square max-w-[480px] mx-auto w-full">
                <span className="absolute inset-[11%] rounded-full border border-white/10" aria-hidden />
                <span className="absolute inset-[11%] rounded-full border border-amber-400/25 [clip-path:inset(0_0_50%_0)]" aria-hidden />
                {/* hub */}
                <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[34%] aspect-square rounded-full bg-white/[0.04] border border-amber-400/30 flex flex-col items-center justify-center text-center px-4">
                  <TrendingUp className="w-6 h-6 text-amber-400 mb-2" />
                  <p className="text-[12.5px] font-bold text-white leading-tight">Compounding<br />Search Asset</p>
                </div>
                {/* nodes */}
                {FLYWHEEL.map(({ icon: Icon, title }, i) => {
                  const a = (i / FLYWHEEL.length) * Math.PI * 2 - Math.PI / 2
                  const x = 50 + 39 * Math.cos(a)
                  const y = 50 + 39 * Math.sin(a)
                  const on = wheel === i
                  return (
                    <button key={title} onClick={() => { setWheel(i); track(CCEvent.workstreamSelect, { page: 'seo', workstream: title }) }}
                      aria-label={title} style={{ left: `${x}%`, top: `${y}%` }}
                      className={`absolute -translate-x-1/2 -translate-y-1/2 w-12 h-12 md:w-14 md:h-14 rounded-full border flex items-center justify-center transition-all
                        ${on ? 'bg-amber-400 border-amber-400 text-[#0B0C10] scale-110 shadow-[0_0_30px_rgba(251,191,36,0.35)]' : 'bg-white/[0.05] border-white/15 text-white hover:border-amber-400/60'}`}>
                      <Icon className="w-5 h-5" />
                    </button>
                  )
                })}
              </div>
            </Reveal>

            {/* Detail panel */}
            <Reveal delay={0.05}>
              <div key={wheel} className="rounded-xl border border-white/10 bg-white/[0.04] p-8 md:p-9">
                <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-amber-400">Workstream {String(wheel + 1).padStart(2, '0')} of {FLYWHEEL.length}</p>
                <h3 className="text-2xl font-bold text-white mt-1.5">{W.title}</h3>
                <p className="mt-3 text-[16.5px] text-slate-300 leading-relaxed">{W.desc}</p>
                <div className="mt-7 flex gap-1.5">
                  {FLYWHEEL.map((_, j) => (
                    <button key={j} onClick={() => setWheel(j)} aria-label={`Workstream ${j + 1}`}
                      className={`h-1 flex-1 rounded-full transition-colors ${j === wheel ? 'bg-amber-400' : 'bg-white/15 hover:bg-white/30'}`} />
                  ))}
                </div>
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      {/* ══════════ 6 · WHAT THE CLIENT RECEIVES ══════════ */}
      <section className="py-24 md:py-28 cc-canvas-white border-b cc-rule">
        <div className="container-custom">
          <Reveal className="max-w-3xl mb-12">
            <Kicker>What the Client Receives</Kicker>
            <h2 className="text-3xl md:text-4xl lg:text-[2.9rem] font-bold leading-[1.12]">
              Defined Outputs — Not a Monthly Mystery.
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
                <p className="mt-7 text-[15.5px] text-slate-600 leading-relaxed border-l-2 border-amber-500 pl-4">
                  SEO is not defined by a fixed number of articles. Some months may require technical repair, page
                  consolidation, content improvement, authority work, or conversion changes instead of additional publishing.
                </p>
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      {/* ══════════ 7 · RELATIONSHIP WITH LOCAL SEO & GEO — overlap ══════════ */}
      <section className="py-24 md:py-28 cc-canvas-alt border-b cc-rule">
        <div className="container-custom">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
            <Reveal>
              <Kicker>One Discipline, Three Frontiers</Kicker>
              <h2 className="text-3xl md:text-4xl lg:text-[2.9rem] font-bold leading-[1.12]">
                SEO, Local SEO, and GEO Overlap — but They Are Not Interchangeable.
              </h2>
              <p className="mt-5 text-[17px] text-slate-600 leading-relaxed">
                The recommendation should reflect how the target customer actually searches and chooses.
              </p>
              <div className="mt-8 space-y-4">
                {[
                  { t: 'SEO', d: 'Broader organic visibility across relevant search demand.', href: null },
                  { t: 'Local SEO', d: 'Location-based visibility, map results, reviews, local relevance, and nearby intent.', href: '/services/local-seo' },
                  { t: 'GEO / AI Search Visibility', d: 'Clarity, structure, credibility, and retrievability across AI-assisted discovery.', href: '/services/geo' },
                ].map(({ t, d, href }) => (
                  <div key={t} className="flex gap-4 items-baseline">
                    <span className="w-2 h-2 rounded-full bg-amber-500 shrink-0" aria-hidden />
                    <p className="text-[16px] text-slate-700 leading-relaxed">
                      <strong className="text-[#0A1730]">{t}</strong> — {d}{' '}
                      {href && <Link href={href} className="font-semibold text-amber-700 hover:text-amber-600 whitespace-nowrap">Explore <ArrowUpRight className="inline w-3.5 h-3.5" /></Link>}
                    </p>
                  </div>
                ))}
              </div>
              <div className="mt-8">
                <HairlineButton href="/services/digital-marketing-services">Explore Integrated Digital Marketing</HairlineButton>
              </div>
            </Reveal>

            {/* three-circle overlap */}
            <Reveal delay={0.08}>
              <div className="relative max-w-md mx-auto aspect-square">
                <div className="absolute left-1/2 top-[8%] -translate-x-1/2 w-[58%] aspect-square rounded-full border-2 border-[#0A1730]/70 bg-[#0A1730]/[0.05] flex items-start justify-center pt-7">
                  <span className="text-[13px] font-bold text-[#0A1730]">SEO</span>
                </div>
                <div className="absolute left-[6%] bottom-[10%] w-[58%] aspect-square rounded-full border-2 border-amber-500/70 bg-amber-500/[0.06] flex items-end justify-start pb-9 pl-9">
                  <span className="text-[13px] font-bold text-amber-700">Local SEO</span>
                </div>
                <div className="absolute right-[6%] bottom-[10%] w-[58%] aspect-square rounded-full border-2 border-slate-400/70 bg-slate-400/[0.07] flex items-end justify-end pb-9 pr-9">
                  <span className="text-[13px] font-bold text-slate-600">GEO</span>
                </div>
                <div className="absolute left-1/2 top-[54%] -translate-x-1/2 -translate-y-1/2 text-center">
                  <span className="inline-block rounded-full bg-white border cc-rule-md px-4 py-2 text-[12px] font-bold text-[#0A1730] shadow-sm">How your customer<br />actually searches</span>
                </div>
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      {/* ══════════ 8 · PROOF ══════════ */}
      <section id="proof" className="py-24 md:py-28 cc-canvas-white border-b cc-rule scroll-mt-20">
        <div className="container-custom">
          <Reveal className="max-w-3xl mb-12">
            <Kicker>Evidence</Kicker>
            <h2 className="text-3xl md:text-4xl lg:text-[2.9rem] font-bold leading-[1.12]">
              Real Search Work, Shown With Its Context and Limits.
            </h2>
            <p className="mt-5 text-lg text-slate-600 leading-relaxed">
              Every screenshot below comes from real client reporting. We state the period it covers and what it does
              not prove — because search evidence without context is marketing, not proof.
            </p>
          </Reveal>

          <div className="space-y-8">
            {PROOF_CASES.map(({ img, sector, context, work, note }, i) => (
              <Reveal key={sector} delay={(i % 3) * 0.05}>
                <div className="grid lg:grid-cols-[0.9fr_1.1fr] rounded-xl border cc-rule overflow-hidden bg-white">
                  <div className="relative border-b lg:border-b-0 lg:border-r cc-rule bg-slate-50">
                    <img src={img} alt={`${sector} search visibility evidence`} loading="lazy" className="w-full h-full max-h-72 object-cover object-top" />
                  </div>
                  <div className="p-8 md:p-9">
                    <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-amber-700">{sector}</p>
                    <p className="mt-3 text-[16.5px] text-slate-700 leading-relaxed"><strong className="text-[#0A1730]">Context.</strong> {context}</p>
                    <p className="mt-2.5 text-[16.5px] text-slate-700 leading-relaxed"><strong className="text-[#0A1730]">Work.</strong> {work}</p>
                    <p className="mt-4 pt-4 border-t cc-rule text-[14px] text-slate-500 leading-relaxed flex gap-2.5">
                      <ShieldCheck className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" /> {note}
                    </p>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>

          <Reveal className="mt-10">
            <Link href="/case-studies" onClick={() => track(CCEvent.caseStudyView, { page: 'seo' })}
              className="inline-flex items-center gap-2 font-semibold text-[#0A1730] hover:text-amber-700 transition-colors">
              View the full case studies <ArrowUpRight className="w-4 h-4" />
            </Link>
          </Reveal>
        </div>
      </section>

      {/* ══════════ 9 · MEASUREMENT ══════════ */}
      <section className="py-24 md:py-28 cc-canvas-alt border-b cc-rule">
        <div className="container-custom">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-start">
            <Reveal className="lg:sticky lg:top-28">
              <Kicker>Measurement</Kicker>
              <h2 className="text-3xl md:text-4xl lg:text-[2.9rem] font-bold leading-[1.12]">
                Rankings Matter. Their Business Meaning Matters More.
              </h2>
              <p className="mt-6 text-[15.5px] text-slate-600 leading-relaxed border-l-2 border-amber-500 pl-4">
                Not every customer journey can be attributed perfectly. Reports must distinguish measured outcomes,
                directional signals, and informed interpretation.
              </p>
            </Reveal>
            <Reveal delay={0.05}>
              <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-slate-400 mb-5">Reviewed in every growth cycle</p>
              <div className="grid sm:grid-cols-2 gap-x-8 gap-y-3.5">
                {MEASURE_AREAS.map((m) => (
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

      {/* ══════════ 10 · ENGAGEMENT & INVESTMENT ══════════ */}
      <section className="py-24 md:py-28 cc-canvas-white border-b cc-rule">
        <div className="container-custom">
          <Reveal className="max-w-3xl mb-12">
            <Kicker>Engagement &amp; Investment</Kicker>
            <h2 className="text-3xl md:text-4xl lg:text-[2.9rem] font-bold leading-[1.12]">
              Scoped to the Constraint — Not Sold From a Menu.
            </h2>
          </Reveal>

          <Reveal>
            <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-slate-400 mb-4">Appropriate engagement shapes</p>
            <div className="flex flex-wrap gap-2 mb-12">
              {ENGAGEMENTS.map((e) => (
                <span key={e} className="rounded-full bg-white border cc-rule-md px-4 py-2 text-[14px] font-medium text-slate-700">{e}</span>
              ))}
            </div>
          </Reveal>

          <Reveal>
            <div className="rounded-2xl border cc-rule overflow-hidden grid lg:grid-cols-2">
              <div className="p-9 md:p-11">
                <h3 className="text-2xl font-bold">Investment Follows the Starting Condition and the Market.</h3>
                <p className="mt-4 text-[16px] text-slate-600 leading-relaxed">
                  Monthly ranges and the minimum sensible term are shared during discovery, after we understand the
                  website, competition, and internal capability. We would rather decline an engagement than quote a
                  number that cannot fund honest work.
                </p>
                <div className="mt-6"><InkButton href={CAL} external event={CCEvent.discoveryCall}>Scope Your SEO Program</InkButton></div>
              </div>
              <div className="cc-canvas-alt border-t lg:border-t-0 lg:border-l cc-rule p-9 md:p-11">
                <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-amber-700 mb-4">What shapes the range</p>
                <div className="flex flex-wrap gap-2">
                  {INVESTMENT_DRIVERS.map((f) => (
                    <span key={f} className="rounded-full bg-white border cc-rule-md px-3 py-1.5 text-[13px] font-medium text-slate-700">{f}</span>
                  ))}
                </div>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ══════════ 11 · FAQs ══════════ */}
      <section className="py-24 md:py-28 cc-canvas-alt border-b cc-rule">
        <div className="container-custom">
          <div className="grid lg:grid-cols-[0.9fr_1.1fr] gap-12 lg:gap-16 items-start">
            <Reveal className="lg:sticky lg:top-28">
              <Kicker>Decision Support</Kicker>
              <h2 className="text-3xl md:text-4xl font-bold leading-[1.14]">
                The Questions Serious Buyers Ask About SEO.
              </h2>
            </Reveal>
            <Reveal delay={0.05} className="divide-y divide-[rgba(10,23,48,0.1)] border-y cc-rule">
              {FAQS.map((f, i) => {
                const open = openFaq === i
                return (
                  <div key={f.q}>
                    <button onClick={() => { setOpenFaq(open ? null : i); if (!open) track(CCEvent.faqOpen, { page: 'seo', question: f.q }) }}
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
              Build Organic Visibility That Supports the Business.
            </h2>
            <p className="mt-6 text-lg md:text-xl text-slate-300 leading-relaxed">
              We will review the business priorities, current search position, website, competition, and conversion path
              before recommending the appropriate SEO scope.
            </p>
            <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center">
              <a href={CAL} target="_blank" rel="noopener noreferrer" onClick={() => track(CCEvent.discoveryCall, { page: 'seo' })}
                className="group inline-flex items-center justify-center gap-2.5 bg-amber-400 hover:bg-amber-300 text-[#0B0C10] font-semibold px-7 py-3.5 rounded-lg transition-colors">
                Request an SEO Assessment <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
              </a>
              <HairlineButton href="#proof" light>View SEO Proof</HairlineButton>
            </div>
          </Reveal>
        </div>
      </section>
    </div>
  )
}

'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Reveal } from '@/components/Reveal'
import { track, CCEvent } from '@/lib/track'
import {
  ArrowRight, ArrowUpRight, Plus, Minus, FileText, Braces, Landmark, Sparkles,
  Fingerprint, Network, MessageSquareQuote, ShieldCheck, Cpu, Link2, RefreshCw,
  Eye, CheckCircle2, XCircle, Building2,
} from 'lucide-react'

const CAL = 'https://calendly.com/ccoms/discovery-call'

/* ─────────────────────────── Data ─────────────────────────── */

const PIPELINE = [
  { icon: FileText, label: 'Website content' },
  { icon: Braces, label: 'Structured information' },
  { icon: Landmark, label: 'Trusted sources' },
  { icon: Sparkles, label: 'AI-assisted answer' },
]

const UNDERSTAND = [
  'Who the business is',
  'What it provides',
  'Where it operates',
  'What expertise and evidence it has',
  'Which questions its content answers',
  'How facts, entities, services, and sources relate',
  'Why the information may be credible',
]

const DISCIPLINES = [
  { key: 'SEO', title: 'SEO', desc: 'Improves visibility and performance across traditional organic search.', href: '/services/seo' },
  { key: 'AEO', title: 'AEO', desc: 'Structures content to answer specific questions clearly across answer-focused experiences.', href: null },
  { key: 'GEO', title: 'GEO', desc: 'Improves the clarity, evidence, retrievability, and citation readiness of information used in AI-generated or AI-assisted responses.', href: null },
]

const READINESS = [
  { icon: Fingerprint, title: 'Entity Clarity', q: 'Is the organization consistently identified across its website, profiles, directories, authors, services, locations, and external references?' },
  { icon: Network, title: 'Information Architecture', q: 'Can important business information be found, understood, and related without ambiguity?' },
  { icon: MessageSquareQuote, title: 'Answer Quality', q: 'Does the content provide direct, useful, well-supported responses to relevant customer and industry questions?' },
  { icon: ShieldCheck, title: 'Evidence & Trust', q: 'Are claims supported through proof, case studies, credentials, sources, policies, authorship, reviews, data, or external recognition?' },
  { icon: Cpu, title: 'Technical Accessibility', q: 'Can search and retrieval systems access the content, understand structure, follow internal relationships, and identify key entities?' },
  { icon: Link2, title: 'External Authority', q: 'Is the organization referenced in relevant, credible places beyond its own website?' },
  { icon: RefreshCw, title: 'Freshness & Maintenance', q: 'Are important facts, services, dates, policies, statistics, and market information current and governed?' },
  { icon: Eye, title: 'Measurement', q: 'Can visibility across selected AI and search experiences be monitored without pretending that perfect attribution exists?' },
]

const WORKSTREAMS = [
  { n: '01', title: 'Entity & Business Information', items: ['Organization identity', 'Services', 'Locations', 'People & authors', 'Products', 'Policies', 'Contact & ownership clarity', 'Consistent external profiles'] },
  { n: '02', title: 'Content Architecture', items: ['Topic & question mapping', 'Service & solution pages', 'Entity relationships', 'Internal linking', 'Clear headings', 'Concise answer sections', 'Supporting depth', 'Comparison & decision content'] },
  { n: '03', title: 'Structured & Technical Clarity', items: ['Schema where appropriate', 'Metadata', 'Crawl & index controls', 'Semantic HTML', 'Canonical structure', 'Rendering', 'Performance', 'Accessible page relationships', 'Feeds or data structures where justified'] },
  { n: '04', title: 'Evidence & Authority', items: ['Case studies', 'First-party data', 'Expert authorship', 'Citations & sources', 'Brand mentions', 'Relevant backlinks', 'Credentials', 'Transparent claims', 'External validation'] },
  { n: '05', title: 'Retrieval & Citation Monitoring', items: ['Test priority questions', 'Record visibility patterns', 'Review source & citation behavior', 'Monitor brand & entity interpretation', 'Identify content gaps', 'Compare competitors', 'Document limitations & changes'] },
  { n: '06', title: 'Continuous Improvement', items: ['Update facts', 'Strengthen weak answers', 'Add evidence', 'Consolidate conflicting information', 'Improve page relationships', 'Respond to emerging customer questions', 'Coordinate with SEO & content priorities'] },
]

const INITIAL_OUTPUTS = ['AI-search readiness assessment', 'Priority question & topic map', 'Entity & business-information review', 'Content & evidence gap analysis', 'Technical & structured-data review', 'Competitor visibility observations', 'Prioritized roadmap']
const IMPLEMENTATION_OUTPUTS = ['Service & authority content', 'Direct-answer sections', 'Entity clarification', 'Schema & technical changes', 'Internal-link architecture', 'Case-study & proof development', 'Source & citation improvement', 'Profile consistency', 'Content updates', 'Monitoring & review']

const GOOD_CONTENT = [
  'Clear question or purpose',
  'Concise direct answer',
  'Sufficient supporting explanation',
  'Named organization or expert',
  'Factual consistency',
  'Visible evidence',
  'Relevant dates',
  'Original examples or data where available',
  'Structured relationships',
  'Useful internal and external references',
  'No unnecessary keyword repetition',
  'No unsupported certainty',
]

const MONITORING = [
  'Presence for selected prompts & questions', 'Citation & source patterns', 'Brand & entity interpretation',
  'Visibility changes', 'Competitor presence', 'Referral traffic where identifiable', 'Organic search performance',
  'Branded search change', 'Assisted discovery reported by leads', 'Content & indexation health', 'Authority & mention growth',
]

const LIMITATIONS = [
  'AI outputs can vary by platform, model, location, account, context, and time.',
  'Citation behavior can change.',
  'Some systems provide limited reporting.',
  'Not all influence can be attributed.',
  'Visibility does not guarantee recommendation or conversion.',
]

const GOOD_FIT = [
  'B2B firms with complex expertise',
  'Professional services',
  'Clinics and specialized providers',
  'Software and technical products',
  'E-commerce categories requiring education',
  'Companies with strong proprietary knowledge',
  'Businesses already investing in SEO and content',
  'Brands whose buyers use AI tools to research and compare',
]

const POOR_FIT = [
  'A weak or inaccessible website',
  'No credible information or proof',
  'Expectation of guaranteed AI recommendations',
  'Desire to mass-produce shallow content',
  'Refusal to clarify claims, authorship, or business information',
  'No ability to maintain important facts',
]

const ENGAGEMENT_TYPES = [
  { title: 'GEO Readiness Assessment', desc: 'One-time analysis and roadmap.' },
  { title: 'GEO Foundation Implementation', desc: 'Entity, technical, content, evidence, and architecture work.' },
  { title: 'Ongoing AI Search Visibility', desc: 'Monitoring, content improvement, authority development, and integration with SEO.' },
  { title: 'Integrated SEO + GEO', desc: 'Recommended when the traditional search foundation and AI-search readiness should be developed together.' },
]

const FAQS = [
  { q: 'Can you guarantee that ChatGPT, Google, or another AI system will cite us?', a: 'No. Core Conversion can improve the clarity, accessibility, credibility, and authority of the business’s digital information, but no provider controls a model’s output.' },
  { q: 'Is GEO replacing SEO?', a: 'No. GEO relies heavily on foundations shared with SEO: accessible websites, clear information architecture, useful content, authority, technical quality, and recognized entities.' },
  { q: 'Do we need a separate GEO engagement?', a: 'Not always. GEO may be included within an integrated SEO or digital marketing roadmap when that is more efficient.' },
  { q: 'How do you report performance?', a: 'We monitor selected questions, citation patterns, brand interpretation, technical and content progress, related search performance, and identifiable traffic. We also state the limitations of the data.' },
  { q: 'Will you create hundreds of AI articles?', a: 'No. Volume without usefulness, evidence, or governance can create risk and reduce quality. Content should be prioritized according to customer questions and business relevance.' },
]

/* ─────────────────────────── Helpers ─────────────────────────── */

function Kicker({ children, light = false }: { children: React.ReactNode; light?: boolean }) {
  return <span className={`inline-block text-xs font-semibold uppercase tracking-[0.24em] mb-4 ${light ? 'text-amber-400' : 'text-amber-700'}`}>{children}</span>
}

function InkButton({ href, children, external = false, event }: { href: string; children: React.ReactNode; external?: boolean; event?: string }) {
  const cls = 'group inline-flex items-center justify-center gap-2.5 bg-[#0A1730] hover:bg-[#122548] text-white font-semibold px-7 py-3.5 rounded-lg transition-colors'
  const inner = <>{children} <ArrowRight className="w-4 h-4 text-amber-400 transition-transform group-hover:translate-x-1" /></>
  const onClick = () => event && track(event, { page: 'geo' })
  return external
    ? <a href={href} target="_blank" rel="noopener noreferrer" className={cls} onClick={onClick}>{inner}</a>
    : <Link href={href} className={cls} onClick={onClick}>{inner}</Link>
}

function HairlineButton({ href, children, light = false }: { href: string; children: React.ReactNode; light?: boolean }) {
  const cls = light
    ? 'inline-flex items-center justify-center gap-2 border border-white/25 text-white hover:border-white/60 font-semibold px-7 py-3.5 rounded-lg transition-colors'
    : 'inline-flex items-center justify-center gap-2 border cc-rule-md text-[#0A1730] hover:border-[#0A1730] font-semibold px-7 py-3.5 rounded-lg transition-colors'
  return (
    <Link href={href} className={cls} onClick={() => track(CCEvent.secondaryCta, { page: 'geo', to: href })}>
      {children} <ArrowUpRight className="w-4 h-4" />
    </Link>
  )
}

/* Hero — one business question travels through the pipeline */
function HeroPipeline() {
  return (
    <div className="rounded-xl border cc-rule-md cc-canvas-white p-6 md:p-7 shadow-[0_24px_60px_-30px_rgba(10,23,48,0.35)]">
      <p className="text-[10px] font-bold uppercase tracking-[0.28em] text-slate-400 mb-1.5">One business question</p>
      <p className="text-[15px] font-semibold text-[#0A1730] mb-6">&ldquo;Who should we trust for this — and why?&rdquo;</p>
      <div className="space-y-0">
        {PIPELINE.map(({ icon: Icon, label }, i) => (
          <div key={label} className="relative pl-12 pb-6 last:pb-0">
            {i < PIPELINE.length - 1 && <span className="absolute left-[19px] top-10 bottom-0 w-px bg-gradient-to-b from-amber-500/70 to-[rgba(10,23,48,0.12)]" aria-hidden />}
            <span className={`absolute left-0 top-0 w-10 h-10 rounded-lg border flex items-center justify-center
              ${i === PIPELINE.length - 1 ? 'bg-[#0A1730] border-[#0A1730]' : 'bg-white cc-rule-md'}`}>
              <Icon className={`w-4.5 h-4.5 ${i === PIPELINE.length - 1 ? 'text-amber-400' : 'text-[#0A1730]'}`} style={{ width: 18, height: 18 }} />
            </span>
            <p className={`pt-2 text-[15px] leading-snug ${i === PIPELINE.length - 1 ? 'font-bold text-[#0A1730]' : 'font-medium text-slate-700'}`}>{label}</p>
          </div>
        ))}
      </div>
      <p className="mt-5 pt-4 border-t cc-rule text-[12.5px] text-slate-500 leading-relaxed">
        GEO works on every stage of this journey — it cannot control the last one, and we say so.
      </p>
    </div>
  )
}

/* ─────────────────────────── Page ─────────────────────────── */

export default function GeoPage() {
  const [dim, setDim] = useState(0)
  const [openFaq, setOpenFaq] = useState<number | null>(null)
  const R = READINESS[dim]

  return (
    <div className="relative overflow-hidden cc-canvas text-[#0A1730]">

      {/* ══════════ 1 · HERO ══════════ */}
      <section className="relative border-b cc-rule">
        <div className="container-custom pt-32 md:pt-40 pb-20 md:pb-24">
          <div className="grid lg:grid-cols-[1.15fr_0.85fr] gap-14 lg:gap-16 items-center">
            <div>
              <Kicker>GEO &amp; AI Search Visibility</Kicker>
              <h1 className="text-4xl md:text-5xl lg:text-[3.3rem] font-bold leading-[1.08] tracking-tight">
                Help AI-Assisted Search Understand, Retrieve, and Trust Your Business Information.
              </h1>
              <p className="mt-6 text-lg md:text-xl text-slate-600 leading-relaxed max-w-xl">
                Core Conversion improves the clarity, structure, evidence, authority, and accessibility of your digital
                information so the business is better prepared for discovery across AI-assisted search experiences.
              </p>
              <p className="mt-4 text-[15.5px] text-slate-500 leading-relaxed max-w-xl">
                GEO complements SEO. It does not replace the need for a credible website, useful content, technical
                accessibility, and recognized authority.
              </p>
              <div className="mt-9 flex flex-col sm:flex-row gap-4">
                <InkButton href={CAL} external event={CCEvent.discoveryCall}>Assess Your AI Search Readiness</InkButton>
                <HairlineButton href="#disciplines">See How GEO Relates to SEO</HairlineButton>
              </div>
            </div>
            <Reveal delay={0.1}>
              <HeroPipeline />
            </Reveal>
          </div>
        </div>
      </section>

      {/* ══════════ 2 · WHAT GEO MEANS ══════════ */}
      <section className="py-24 md:py-28 cc-canvas-alt border-b cc-rule">
        <div className="container-custom">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-start">
            <Reveal>
              <Kicker>Definition</Kicker>
              <h2 className="text-3xl md:text-4xl lg:text-[2.7rem] font-bold leading-[1.12]">
                Generative Engine Optimization Is the Discipline of Making Information Easier to Use in AI-Assisted Discovery.
              </h2>
              <p className="mt-6 text-[17px] text-slate-600 leading-relaxed">
                Traditional search often presents a list of pages. AI-assisted search may summarize information, compare
                options, answer questions, and cite or reference selected sources.
              </p>
              <p className="mt-5 text-[15.5px] text-slate-600 leading-relaxed border-l-2 border-amber-500 pl-4">
                No provider controls whether a specific AI system will cite or recommend a business. The goal is to
                strengthen readiness, clarity, evidence, and digital authority.
              </p>
            </Reveal>
            <Reveal delay={0.08}>
              <div className="rounded-xl border cc-rule-md bg-white p-8 md:p-9">
                <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-amber-700 mb-6">GEO improves the conditions that help systems understand</p>
                <ul className="space-y-4">
                  {UNDERSTAND.map((u, i) => (
                    <li key={u} className="flex gap-4 items-baseline border-b cc-rule pb-4 last:border-0 last:pb-0">
                      <span className="text-[12px] font-bold text-amber-700 tabular-nums shrink-0">{String(i + 1).padStart(2, '0')}</span>
                      <span className="text-[16px] text-slate-700 leading-relaxed">{u}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      {/* ══════════ 3 · GEO, SEO, AEO — connected model ══════════ */}
      <section id="disciplines" className="py-24 md:py-28 cc-canvas-white border-b cc-rule scroll-mt-20">
        <div className="container-custom">
          <Reveal className="max-w-3xl mb-14">
            <Kicker>Three Disciplines, One Foundation</Kicker>
            <h2 className="text-3xl md:text-4xl lg:text-[2.9rem] font-bold leading-[1.12]">
              SEO, AEO, and GEO Overlap — the Foundation Is Shared.
            </h2>
            <p className="mt-5 text-lg text-slate-600 leading-relaxed">
              Strong technical SEO, useful content, recognized entities, credible evidence, and clear site architecture
              form much of the foundation for all three.
            </p>
          </Reveal>

          <div className="relative">
            <span className="hidden md:block absolute top-1/2 left-[10%] right-[10%] h-px bg-gradient-to-r from-[rgba(10,23,48,0.15)] via-amber-500/50 to-[rgba(10,23,48,0.15)]" aria-hidden />
            <div className="grid md:grid-cols-3 gap-6 lg:gap-10">
              {DISCIPLINES.map(({ key, title, desc, href }, i) => (
                <Reveal key={key} delay={i * 0.07}>
                  <div className={`relative h-full rounded-xl border p-8 ${key === 'GEO' ? 'bg-[#0A1730] border-[#0A1730]' : 'bg-white cc-rule-md'}`}>
                    <span className={`text-[11px] font-bold uppercase tracking-[0.24em] ${key === 'GEO' ? 'text-amber-400' : 'text-amber-700'}`}>
                      {key === 'GEO' ? 'This service' : 'Related discipline'}
                    </span>
                    <h3 className={`text-2xl font-bold mt-2 ${key === 'GEO' ? 'text-white' : 'text-[#0A1730]'}`}>{title}</h3>
                    <p className={`mt-3 text-[15.5px] leading-relaxed ${key === 'GEO' ? 'text-slate-300' : 'text-slate-600'}`}>{desc}</p>
                    {href && (
                      <Link href={href} className="mt-5 inline-flex items-center gap-1.5 text-[14px] font-semibold text-amber-700 hover:text-amber-600">
                        Explore SEO Services <ArrowUpRight className="w-3.5 h-3.5" />
                      </Link>
                    )}
                  </div>
                </Reveal>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ══════════ 4 · READINESS ASSESSMENT — noir knowledge graph ══════════ */}
      <section className="py-24 md:py-28 cc-noir">
        <div className="container-custom">
          <Reveal className="max-w-3xl mb-14">
            <Kicker light>AI Search Readiness Assessment</Kicker>
            <h2 className="text-3xl md:text-4xl lg:text-[2.9rem] font-bold leading-[1.12] text-white">
              Eight Dimensions of Readiness, Mapped Like a Knowledge Graph.
            </h2>
            <p className="mt-5 text-lg text-slate-300 leading-relaxed">
              Select a node. Each dimension is a question the assessment answers about your business information.
            </p>
          </Reveal>

          <div className="grid lg:grid-cols-[1fr_0.9fr] gap-10 lg:gap-14 items-center">
            {/* graph */}
            <Reveal>
              <div className="relative aspect-square max-w-[480px] mx-auto w-full">
                {/* edges to hub */}
                <svg className="absolute inset-0 w-full h-full" viewBox="0 0 100 100" aria-hidden>
                  {READINESS.map((_, i) => {
                    const a = (i / READINESS.length) * Math.PI * 2 - Math.PI / 2
                    return <line key={i} x1="50" y1="50" x2={50 + 39 * Math.cos(a)} y2={50 + 39 * Math.sin(a)}
                      stroke={i === dim ? 'rgba(251,191,36,0.55)' : 'rgba(255,255,255,0.1)'} strokeWidth="0.35" />
                  })}
                </svg>
                {/* hub */}
                <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[30%] aspect-square rounded-full bg-white/[0.04] border border-amber-400/30 flex flex-col items-center justify-center text-center px-3">
                  <Building2 className="w-5 h-5 text-amber-400 mb-1.5" />
                  <p className="text-[11.5px] font-bold text-white leading-tight">Your Business<br />Entity</p>
                </div>
                {/* nodes */}
                {READINESS.map(({ icon: Icon, title }, i) => {
                  const a = (i / READINESS.length) * Math.PI * 2 - Math.PI / 2
                  const x = 50 + 39 * Math.cos(a)
                  const y = 50 + 39 * Math.sin(a)
                  const on = dim === i
                  return (
                    <button key={title} onClick={() => { setDim(i); track(CCEvent.workstreamSelect, { page: 'geo', dimension: title }) }}
                      aria-label={title} style={{ left: `${x}%`, top: `${y}%` }}
                      className={`absolute -translate-x-1/2 -translate-y-1/2 w-12 h-12 md:w-14 md:h-14 rounded-full border flex items-center justify-center transition-all
                        ${on ? 'bg-amber-400 border-amber-400 text-[#0B0C10] scale-110 shadow-[0_0_30px_rgba(251,191,36,0.35)]' : 'bg-white/[0.05] border-white/15 text-white hover:border-amber-400/60'}`}>
                      <Icon className="w-5 h-5" />
                    </button>
                  )
                })}
              </div>
            </Reveal>

            {/* detail */}
            <Reveal delay={0.05}>
              <div key={dim} className="rounded-xl border border-white/10 bg-white/[0.04] p-8 md:p-9">
                <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-amber-400">Dimension {String(dim + 1).padStart(2, '0')} of {READINESS.length}</p>
                <h3 className="text-2xl font-bold text-white mt-1.5">{R.title}</h3>
                <p className="mt-3 text-[16.5px] text-slate-300 leading-relaxed">{R.q}</p>
                <div className="mt-7 flex gap-1.5">
                  {READINESS.map((_, j) => (
                    <button key={j} onClick={() => setDim(j)} aria-label={`Dimension ${j + 1}`}
                      className={`h-1 flex-1 rounded-full transition-colors ${j === dim ? 'bg-amber-400' : 'bg-white/15 hover:bg-white/30'}`} />
                  ))}
                </div>
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      {/* ══════════ 5 · THE GEO WORKSTREAMS — information pipeline ══════════ */}
      <section className="py-24 md:py-28 cc-canvas-alt border-b cc-rule">
        <div className="container-custom">
          <Reveal className="max-w-3xl mb-14">
            <Kicker>The GEO Workstreams</Kicker>
            <h2 className="text-3xl md:text-4xl lg:text-[2.9rem] font-bold leading-[1.12]">
              An Information Pipeline — Not a Bag of Tricks.
            </h2>
          </Reveal>

          <div className="relative">
            <span className="absolute left-[27px] md:left-[31px] top-4 bottom-4 w-px bg-gradient-to-b from-amber-500 via-[rgba(10,23,48,0.15)] to-amber-500" aria-hidden />
            <div className="space-y-8">
              {WORKSTREAMS.map(({ n, title, items }) => (
                <Reveal key={n}>
                  <div className="relative pl-20 md:pl-24">
                    <span className="absolute left-0 top-0 w-14 h-14 md:w-16 md:h-16 rounded-full bg-white border cc-rule-md flex items-center justify-center text-[15px] font-bold text-[#0A1730] shadow-sm">{n}</span>
                    <h3 className="text-xl md:text-2xl font-bold pt-1">{title}</h3>
                    <div className="mt-3.5 flex flex-wrap gap-2">
                      {items.map((it) => (
                        <span key={it} className="rounded-full bg-white border cc-rule px-3 py-1.5 text-[13px] font-medium text-slate-700">{it}</span>
                      ))}
                    </div>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ══════════ 6 · WHAT THE CLIENT RECEIVES ══════════ */}
      <section className="py-24 md:py-28 cc-canvas-white border-b cc-rule">
        <div className="container-custom">
          <Reveal className="max-w-3xl mb-12">
            <Kicker>What the Client Receives</Kicker>
            <h2 className="text-3xl md:text-4xl lg:text-[2.9rem] font-bold leading-[1.12]">
              Assessment First. Implementation Only Where It Is Justified.
            </h2>
          </Reveal>

          <div className="grid md:grid-cols-2 gap-8 lg:gap-12">
            <Reveal>
              <div className="h-full border-t-2 border-[#0A1730] pt-6">
                <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-slate-400 mb-5">Initial — Assessment &amp; Roadmap</p>
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
                <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-slate-400 mb-5">Implementation — Depending on Scope</p>
                <div className="flex flex-wrap gap-2">
                  {IMPLEMENTATION_OUTPUTS.map((o) => (
                    <span key={o} className="rounded-full bg-white border cc-rule-md px-3.5 py-1.5 text-[13.5px] font-medium text-slate-700">{o}</span>
                  ))}
                </div>
                <p className="mt-7 text-[15.5px] text-slate-600 leading-relaxed border-l-2 border-amber-500 pl-4">
                  GEO should not be sold as a separate layer of jargon applied to weak content. In many cases, the first
                  recommendation will be to strengthen the website, SEO foundation, proof, or content quality.
                </p>
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      {/* ══════════ 7 · WHAT GOOD AI-SEARCH CONTENT LOOKS LIKE ══════════ */}
      <section className="py-24 md:py-28 cc-canvas-alt border-b cc-rule">
        <div className="container-custom">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
            <Reveal>
              <Kicker>Content Standard</Kicker>
              <h2 className="text-3xl md:text-4xl lg:text-[2.9rem] font-bold leading-[1.12]">
                What Good AI-Search Content Looks Like.
              </h2>
              <p className="mt-5 text-[17px] text-slate-600 leading-relaxed">
                Content should be useful to people first and structured clearly enough for machines to interpret
                responsibly. Easy extraction never justifies sacrificing human readability.
              </p>
              <div className="mt-8 grid sm:grid-cols-2 gap-x-8 gap-y-3">
                {GOOD_CONTENT.map((g) => (
                  <div key={g} className="flex gap-2.5 items-baseline">
                    <CheckCircle2 className="w-4 h-4 text-amber-600 shrink-0 translate-y-0.5" />
                    <span className="text-[14.5px] text-slate-700 leading-relaxed">{g}</span>
                  </div>
                ))}
              </div>
            </Reveal>

            {/* annotated page mock */}
            <Reveal delay={0.08}>
              <div className="rounded-xl border cc-rule-md bg-white p-7 md:p-8 shadow-[0_18px_50px_-30px_rgba(10,23,48,0.3)]">
                <p className="text-[10px] font-bold uppercase tracking-[0.28em] text-slate-400 mb-5">Anatomy of an answerable page</p>
                <div className="space-y-4">
                  <div className="border-l-2 border-amber-500 pl-4">
                    <p className="text-[11px] font-bold uppercase tracking-widest text-amber-700">The question</p>
                    <p className="text-[15px] font-bold text-[#0A1730] mt-0.5">A clear heading that states what the page answers</p>
                  </div>
                  <div className="border-l-2 border-[#0A1730] pl-4">
                    <p className="text-[11px] font-bold uppercase tracking-widest text-slate-400">The direct answer</p>
                    <p className="text-[14px] text-slate-600 mt-0.5 leading-relaxed">Two or three sentences a system can retrieve — and a person can trust.</p>
                  </div>
                  <div className="border-l-2 border-[rgba(10,23,48,0.15)] pl-4">
                    <p className="text-[11px] font-bold uppercase tracking-widest text-slate-400">Supporting depth</p>
                    <p className="text-[14px] text-slate-600 mt-0.5 leading-relaxed">Explanation, original examples, and honest caveats.</p>
                  </div>
                  <div className="border-l-2 border-[rgba(10,23,48,0.15)] pl-4">
                    <p className="text-[11px] font-bold uppercase tracking-widest text-slate-400">Evidence &amp; authorship</p>
                    <p className="text-[14px] text-slate-600 mt-0.5 leading-relaxed">Named organization or expert, dates, sources, and proof.</p>
                  </div>
                  <div className="border-l-2 border-[rgba(10,23,48,0.15)] pl-4">
                    <p className="text-[11px] font-bold uppercase tracking-widest text-slate-400">Structured relationships</p>
                    <p className="text-[14px] text-slate-600 mt-0.5 leading-relaxed">Internal links, schema, and consistent entities connecting it to the rest of the site.</p>
                  </div>
                </div>
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      {/* ══════════ 8 · MEASUREMENT & LIMITATIONS ══════════ */}
      <section className="py-24 md:py-28 cc-canvas-white border-b cc-rule">
        <div className="container-custom">
          <Reveal className="max-w-3xl mb-12">
            <Kicker>Measurement &amp; Limitations</Kicker>
            <h2 className="text-3xl md:text-4xl lg:text-[2.9rem] font-bold leading-[1.12]">
              Measure Readiness and Visibility Without Pretending to Control the Answer.
            </h2>
          </Reveal>

          <div className="grid md:grid-cols-2 gap-8 lg:gap-12">
            <Reveal>
              <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-slate-400 mb-5">What can be monitored</p>
              <div className="space-y-3">
                {MONITORING.map((m) => (
                  <div key={m} className="flex gap-3 items-baseline border-b cc-rule pb-3">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-500 shrink-0 translate-y-[-2px]" aria-hidden />
                    <span className="text-[15.5px] text-slate-700">{m}</span>
                  </div>
                ))}
              </div>
            </Reveal>
            <Reveal delay={0.08}>
              <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-slate-400 mb-5">The limits, stated plainly</p>
              <div className="rounded-xl border cc-rule-md cc-canvas-alt p-7 md:p-8">
                <ul className="space-y-4">
                  {LIMITATIONS.map((l) => (
                    <li key={l} className="flex gap-3.5 items-baseline">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#0A1730] shrink-0 translate-y-[-2px]" aria-hidden />
                      <span className="text-[15.5px] text-slate-700 leading-relaxed">{l}</span>
                    </li>
                  ))}
                </ul>
                <p className="mt-6 pt-5 border-t cc-rule text-[15.5px] font-semibold text-[#0A1730]">
                  Core Conversion will distinguish observation, evidence, and inference in every review.
                </p>
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      {/* ══════════ 9 · APPROPRIATE USE CASES ══════════ */}
      <section className="py-24 md:py-28 cc-canvas-alt border-b cc-rule">
        <div className="container-custom">
          <Reveal className="max-w-3xl mb-12">
            <Kicker>Fit</Kicker>
            <h2 className="text-3xl md:text-4xl lg:text-[2.9rem] font-bold leading-[1.12]">
              GEO Rewards Businesses With Real Substance to Structure.
            </h2>
          </Reveal>
          <div className="grid md:grid-cols-2 gap-6">
            <Reveal>
              <div className="h-full rounded-2xl bg-white border cc-rule p-8">
                <h3 className="text-lg font-bold mb-5">Strong Fit</h3>
                <ul className="space-y-3.5">
                  {GOOD_FIT.map((f) => (
                    <li key={f} className="flex gap-3.5"><CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" /><span className="text-[15.5px] text-slate-700 leading-relaxed">{f}</span></li>
                  ))}
                </ul>
              </div>
            </Reveal>
            <Reveal delay={0.1}>
              <div className="h-full rounded-2xl bg-white border cc-rule p-8">
                <h3 className="text-lg font-bold mb-5">A Poor Fit When</h3>
                <ul className="space-y-3.5">
                  {POOR_FIT.map((f) => (
                    <li key={f} className="flex gap-3.5"><XCircle className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" /><span className="text-[15.5px] text-slate-700 leading-relaxed">{f}</span></li>
                  ))}
                </ul>
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      {/* ══════════ 10 · PROOF & DEMONSTRATION ══════════ */}
      <section className="py-24 md:py-28 cc-canvas-white border-b cc-rule">
        <div className="container-custom">
          <div className="grid lg:grid-cols-[1fr_0.9fr] gap-12 lg:gap-16 items-center">
            <Reveal>
              <Kicker>Proof &amp; Demonstration</Kicker>
              <h2 className="text-3xl md:text-4xl lg:text-[2.9rem] font-bold leading-[1.12]">
                Because GEO Attribution Is Limited, We Demonstrate — We Do Not Invent.
              </h2>
              <p className="mt-5 text-[17px] text-slate-600 leading-relaxed">
                We show before-and-after content architecture, entity-consistency work, answer-quality examples,
                schema and technical implementations, and prompt or citation observations — each recorded with its
                platform, date, and query.
              </p>
              <p className="mt-4 text-[15.5px] text-slate-500 leading-relaxed border-l-2 border-amber-500 pl-4">
                Every observation carries the same disclaimer: AI outputs may change. That honesty is part of the service.
              </p>
            </Reveal>
            <Reveal delay={0.08}>
              <div className="rounded-xl border cc-rule-md bg-white overflow-hidden shadow-[0_18px_50px_-30px_rgba(10,23,48,0.3)]">
                <div className="bg-[#0A1730] px-6 py-3.5">
                  <span className="text-[13px] font-bold text-white">Citation Observation — Required Record</span>
                </div>
                <div className="p-6">
                  <dl className="space-y-3">
                    {[
                      ['Platform', 'Which AI system, named'],
                      ['Date', 'When the observation was made'],
                      ['Prompt / query', 'The exact question tested'],
                      ['Context', 'Account and location where relevant'],
                      ['Disclaimer', 'Outputs may change over time'],
                    ].map(([k, v]) => (
                      <div key={k} className="flex gap-4 border-b cc-rule pb-3 last:border-0 last:pb-0">
                        <dt className="w-32 shrink-0 text-[12px] font-bold uppercase tracking-widest text-amber-700 pt-0.5">{k}</dt>
                        <dd className="text-[14.5px] text-slate-700">{v}</dd>
                      </div>
                    ))}
                  </dl>
                </div>
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      {/* ══════════ 11 · INVESTMENT ══════════ */}
      <section className="py-24 md:py-28 cc-canvas-alt border-b cc-rule">
        <div className="container-custom">
          <Reveal className="max-w-3xl mb-12">
            <Kicker>Engagement &amp; Investment</Kicker>
            <h2 className="text-3xl md:text-4xl lg:text-[2.9rem] font-bold leading-[1.12]">
              Four Ways to Engage — Scoped After the Assessment.
            </h2>
          </Reveal>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {ENGAGEMENT_TYPES.map(({ title, desc }, i) => (
              <Reveal key={title} delay={(i % 4) * 0.06}>
                <div className="h-full rounded-2xl border cc-rule bg-white p-6">
                  <span className="w-9 h-9 rounded-lg bg-[#0A1730] text-amber-400 font-bold flex items-center justify-center mb-4">{i + 1}</span>
                  <h3 className="text-lg font-bold mb-1.5 leading-snug">{title}</h3>
                  <p className="text-[15px] text-slate-600 leading-relaxed">{desc}</p>
                </div>
              </Reveal>
            ))}
          </div>
          <Reveal className="mt-8">
            <p className="text-[15.5px] text-slate-600 leading-relaxed max-w-3xl">
              Ranges are shared during discovery, once the assessment shows how much foundation already exists and how
              much must be built. Integrated SEO + GEO is often the most efficient path.
            </p>
          </Reveal>
        </div>
      </section>

      {/* ══════════ 12 · FAQs ══════════ */}
      <section className="py-24 md:py-28 cc-canvas-white border-b cc-rule">
        <div className="container-custom">
          <div className="grid lg:grid-cols-[0.9fr_1.1fr] gap-12 lg:gap-16 items-start">
            <Reveal className="lg:sticky lg:top-28">
              <Kicker>Decision Support</Kicker>
              <h2 className="text-3xl md:text-4xl font-bold leading-[1.14]">
                Honest Answers About an Evolving Discipline.
              </h2>
            </Reveal>
            <Reveal delay={0.05} className="divide-y divide-[rgba(10,23,48,0.1)] border-y cc-rule">
              {FAQS.map((f, i) => {
                const open = openFaq === i
                return (
                  <div key={f.q}>
                    <button onClick={() => { setOpenFaq(open ? null : i); if (!open) track(CCEvent.faqOpen, { page: 'geo', question: f.q }) }}
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

      {/* ══════════ 13 · FINAL CTA — noir close ══════════ */}
      <section className="relative py-28 md:py-32 cc-noir overflow-hidden">
        <div className="container-custom relative z-10">
          <Reveal className="max-w-3xl mx-auto text-center">
            <span className="block h-10 w-px bg-amber-400 mx-auto mb-8" aria-hidden />
            <Kicker light>Next Step</Kicker>
            <h2 className="text-3xl md:text-5xl font-bold leading-[1.1] text-white">
              Prepare the Business for How Search Is Evolving.
            </h2>
            <p className="mt-6 text-lg md:text-xl text-slate-300 leading-relaxed">
              We will assess the website, business information, content, evidence, authority, and technical foundation
              before recommending whether GEO should be a focused initiative or part of a broader SEO program.
            </p>
            <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center">
              <a href={CAL} target="_blank" rel="noopener noreferrer" onClick={() => track(CCEvent.discoveryCall, { page: 'geo' })}
                className="group inline-flex items-center justify-center gap-2.5 bg-amber-400 hover:bg-amber-300 text-[#0B0C10] font-semibold px-7 py-3.5 rounded-lg transition-colors">
                Request an AI Search Readiness Assessment <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
              </a>
              <HairlineButton href="/services/seo" light>Explore SEO Services</HairlineButton>
            </div>
          </Reveal>
        </div>
      </section>
    </div>
  )
}

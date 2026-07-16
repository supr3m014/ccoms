'use client'

import { useState } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { Reveal } from '@/components/Reveal'
import {
  ArrowRight, ArrowUpRight, Search, Globe, PenTool, Megaphone, Mail, BarChart3,
  Workflow, Clapperboard, Target, MousePointerClick, Repeat, Plus, Minus,
  CheckCircle2, AlertCircle, ChevronRight,
} from 'lucide-react'

const NAVY = '#0A1730'
const CAL = 'https://calendly.com/ccoms/discovery-call'

/* ─────────────────────────── Data ─────────────────────────── */

const HERO_CHANNELS = [
  { icon: Search, label: 'Search' },
  { icon: Globe, label: 'Website' },
  { icon: PenTool, label: 'Content' },
  { icon: Megaphone, label: 'Paid Media' },
  { icon: Mail, label: 'Email' },
  { icon: BarChart3, label: 'Analytics' },
  { icon: Workflow, label: 'Automation' },
  { icon: Clapperboard, label: 'Creative' },
]

const JOURNEY = ['Discovery', 'Consideration', 'Conversion', 'Follow-Up', 'Retention']

const BREAKPOINTS = [
  { stage: 'Discovery', title: 'Discovery Is Weak', desc: 'The business is not consistently visible when customers search, compare, or ask for recommendations.' },
  { stage: 'Consideration', title: 'The Message Is Unclear', desc: 'The website and campaign assets do not explain the offer, difference, or reason to act with enough clarity.' },
  { stage: 'Conversion', title: 'Channels Operate Separately', desc: 'SEO, paid media, content, email, and development are managed around separate task lists rather than one commercial objective.' },
  { stage: 'Follow-Up', title: 'Follow-Up Is Inconsistent', desc: 'Potential customers are lost after the initial visit or inquiry because there is no structured nurture or lead-handling process.' },
  { stage: 'Retention', title: 'Reporting Does Not Lead to Decisions', desc: 'Leadership receives numbers but no clear conclusion on what worked, what failed, and what should happen next.' },
]

const TRANSFORM = [
  { from: 'Channels selected because competitors use them.', to: 'Channels selected because they support a defined customer journey and business objective.' },
  { from: 'Monthly deliverables completed without clear priority.', to: 'A ranked implementation backlog based on impact, dependency, effort, and business readiness.' },
  { from: 'Traffic, reach, clicks, and followers reported in isolation.', to: 'Visibility, qualified inquiries, conversion behavior, campaign efficiency, and next actions reviewed together.' },
  { from: 'Every client receives the same checklist.', to: 'The appropriate service modules are assembled around the business while internal delivery remains standardized.' },
  { from: 'Marketing decisions depend on guesswork.', to: 'Decisions improve as evidence, customer behavior, and organizational learning accumulate.' },
]

const DELIVERABLES = [
  { n: '01', title: 'Business and Digital Assessment', body: 'A structured review of the business model, customers, offer, website, visibility, competitors, campaigns, tracking, content, customer journey, and current constraints.' },
  { n: '02', title: 'Prioritized Growth Roadmap', body: 'A phased plan identifying immediate constraints, high-impact opportunities, dependencies, recommended service modules, responsibilities, success indicators, and timing.' },
  { n: '03', title: 'Active Implementation Backlog', body: 'A transparent list of approved work currently being planned, produced, reviewed, launched, measured, and improved. The backlog changes according to priority; it is not an uncontrolled list of unlimited requests.' },
  { n: '04', title: 'Selected Service Modules', body: 'The engagement activates the workstreams justified by the roadmap — search, local visibility, content, website improvements, landing pages, paid campaigns, email, automation, analytics, creative production, or development support.' },
  { n: '05', title: 'Measurement Framework', body: 'Agreed indicators, tracking requirements, data sources, attribution limitations, reporting cadence, and definitions of what constitutes meaningful progress.' },
  { n: '06', title: 'Growth Review', body: 'A decision-focused review answering what changed, what produced evidence of progress, what underperformed, what we learned, what is limiting the next stage, and what will be prioritized next.' },
  { n: '07', title: 'Ongoing Optimization', body: 'Approved pages, campaigns, content, conversion paths, targeting, tracking, and workflows are refined according to evidence and changing business conditions.' },
]

const WORKSTREAMS = [
  { icon: Search, title: 'Search and Discovery', purpose: 'Make the business easier to discover when customers search through Google, maps, and AI-assisted experiences.', modules: ['SEO', 'Local SEO', 'GEO / AI-search visibility', 'Content architecture', 'Technical search improvements', 'Service and location pages', 'Structured data', 'Authority development'] },
  { icon: PenTool, title: 'Positioning, Content, and Trust', purpose: 'Help potential customers understand the offer, believe the claims, and choose the business with greater confidence.', modules: ['Messaging refinement', 'Content strategy', 'Educational assets', 'Service content', 'Social content', 'Case-study development', 'Campaign copy', 'Brand and campaign creative support', 'Reputation assets'] },
  { icon: MousePointerClick, title: 'Digital Experience and Conversion', purpose: 'Turn attention into inquiries, bookings, applications, purchases, or other agreed actions.', modules: ['Website improvements', 'Landing pages', 'Conversion copy', 'Information architecture', 'Forms and booking paths', 'Speed and mobile usability', 'E-commerce optimization', 'Testing'] },
  { icon: Megaphone, title: 'Paid Customer Acquisition', purpose: 'Create controlled, measurable demand-generation and remarketing campaigns where paid media is commercially justified.', modules: ['Meta Ads', 'Google Ads', 'Audience research', 'Offer testing', 'Campaign creative', 'Retargeting', 'Landing-page alignment', 'Budget and performance optimization'] },
  { icon: Repeat, title: 'Nurture, Retention, and Automation', purpose: 'Reduce lead leakage, support longer buying journeys, and maintain customer relationships after initial acquisition.', modules: ['Email campaigns', 'Lead-nurture flows', 'Inquiry follow-up', 'CRM workflow support', 'Remarketing sequences', 'Customer communication', 'Selected operational automation'] },
  { icon: BarChart3, title: 'Measurement and Improvement', purpose: 'Give leadership a clearer basis for deciding where to invest, what to stop, and what to improve.', modules: ['Analytics setup', 'Event and conversion tracking', 'Campaign measurement', 'Search performance', 'Lead-source tracking', 'Growth reviews', 'Experimentation', 'Competitor monitoring'] },
]

const METHOD = ['Understand', 'Assess', 'Prioritize', 'Plan', 'Execute', 'Measure', 'Improve']
const MODULE_ATTRS = ['Objective', 'Required inputs', 'Scope boundaries', 'Process', 'Quality checks', 'Deliverables', 'Dependencies', 'Estimated effort', 'Measurement approach']
const TAILOR_BY = ['Growth stage', 'Market', 'Customer journey', 'Constraints', 'Budget', 'Internal readiness', 'Commercial priority']

const PHASES = [
  { n: 'Phase 1', title: 'Establish the Foundation', items: ['Clarify the offer', 'Correct measurement', 'Remove critical website or technical issues', 'Strengthen high-intent visibility', 'Create the primary conversion path', 'Produce the first required assets'] },
  { n: 'Phase 2', title: 'Build Consistent Acquisition', items: ['Expand search coverage', 'Launch or refine paid acquisition', 'Improve conversion', 'Strengthen trust content', 'Introduce follow-up and nurture'] },
  { n: 'Phase 3', title: 'Improve Efficiency and Authority', items: ['Optimize successful channels', 'Expand authority', 'Automate repeatable workflows', 'Improve attribution', 'Enter additional markets or segments', 'Strengthen retention'] },
]

const REVIEW = [
  { title: 'Business Snapshot', desc: 'Relevant activity and outcomes compared with the agreed baseline and previous period.' },
  { title: 'What Changed', desc: 'Completed work, campaign changes, technical updates, content launched, and market events affecting performance.' },
  { title: 'What Is Working', desc: 'Evidence of channels, pages, messages, offers, audiences, or journeys producing better signals.' },
  { title: 'What Is Limiting Growth', desc: 'Conversion leakage, weak demand, technical constraints, insufficient proof, operational delays, budget limits, or sales-process issues.' },
  { title: 'What We Learned', desc: 'A clear interpretation of the evidence, including uncertainty and attribution limitations.' },
  { title: 'Next Priorities', desc: 'The recommended actions for the next period, ranked according to impact and dependency.' },
]

const FIT_STRONG = [
  'Multiple marketing activities need coordination.',
  'The company wants ongoing execution, not only recommendations.',
  'Leadership needs clearer priorities and measurement.',
  'Search, website, paid media, content, or follow-up affect the same objective.',
  'The business accepts phased progress and active collaboration.',
  'Relevant data, access, and approvals can be provided.',
]
const FIT_FOCUSED = [
  'The requirement is limited to one defined project.',
  'The company needs only a website or application build.',
  'A narrow technical issue is already understood.',
  'There is no need for recurring optimization.',
  'The business is not ready to provide access, approvals, or internal support.',
]

const FAQS = [
  { q: 'Is this a fixed package?', a: 'No. It is a structured engagement assembled from documented service modules. The roadmap and approved scope determine which modules are active.' },
  { q: 'Does a higher budget mean every service is included?', a: 'No. A higher budget may support more implementation capacity, faster execution, more complex work, additional markets, stronger creative production, or deeper optimization. Unnecessary channels should still be excluded.' },
  { q: 'Can you guarantee leads or revenue?', a: 'No responsible provider can guarantee a specific commercial result because performance also depends on market demand, offer quality, budget, competition, sales execution, operations, reputation, and customer experience. Core Conversion commits to the approved work, measurement discipline, transparency, and continuous improvement.' },
  { q: 'Can you work within a ₱50,000 monthly ceiling?', a: 'Potentially. The roadmap would need to prioritize the workstreams with the strongest business justification and phase lower-priority activities. Advertising spend and major development projects may need to be budgeted separately.' },
  { q: 'How long should an engagement run?', a: 'The appropriate term depends on the channels and starting condition. Search and authority work require continuity, while paid acquisition can produce earlier feedback. The proposal should state the recommended minimum term and why.' },
  { q: 'Who owns the accounts and assets?', a: 'The client should own core business accounts and approved final assets unless the contract explicitly states otherwise. Access, licensing, source files, platform ownership, and post-engagement handover must be defined in the agreement.' },
]

/* ─────────────────────────── Helpers ─────────────────────────── */

function Kicker({ children, light = false }: { children: React.ReactNode; light?: boolean }) {
  return <span className={`inline-block text-xs font-semibold uppercase tracking-[0.24em] mb-4 ${light ? 'text-amber-400' : 'text-amber-700'}`}>{children}</span>
}

function GoldButton({ href, children, external = false }: { href: string; children: React.ReactNode; external?: boolean }) {
  const cls = 'group inline-flex items-center justify-center gap-2.5 bg-[#0A1730] hover:bg-[#122548] text-white font-semibold px-7 py-3.5 rounded-lg transition-colors'
  const inner = <>{children} <ArrowRight className="w-4 h-4 text-amber-400 transition-transform group-hover:translate-x-1" /></>
  return external
    ? <a href={href} target="_blank" rel="noopener noreferrer" className={cls}>{inner}</a>
    : <Link href={href} className={cls}>{inner}</Link>
}

function OutlineButton({ href, children, light = false }: { href: string; children: React.ReactNode; light?: boolean }) {
  const cls = light
    ? 'inline-flex items-center justify-center gap-2 border border-white/25 text-white hover:border-white/60 font-semibold px-7 py-3.5 rounded-lg transition-colors'
    : 'inline-flex items-center justify-center gap-2 border cc-rule-md text-[#0A1730] hover:border-[#0A1730] font-semibold px-7 py-3.5 rounded-lg transition-colors'
  return (
    <Link href={href} className={cls}>
      {children} <ArrowUpRight className="w-4 h-4" />
    </Link>
  )
}

/* Hero fragmented → connected diagram */
function HeroDiagram() {
  const left = HERO_CHANNELS.slice(0, 4)
  const right = HERO_CHANNELS.slice(4)
  const yFor = (i: number) => 30 + i * 108
  return (
    <svg viewBox="0 0 560 470" className="w-full h-auto max-w-xl mx-auto" role="img"
      aria-label="Eight marketing channels connecting around a business objective, customer journey and measurement core">
      {/* connectors to core */}
      {left.map((_, i) => (
        <path key={`l${i}`} d={`M150 ${yFor(i) + 25} C 185 ${yFor(i) + 25}, 190 235, 205 235`} fill="none" stroke="#b45309" strokeOpacity="0.55" strokeWidth="1.4" strokeDasharray="1 6" strokeLinecap="round" />
      ))}
      {right.map((_, i) => (
        <path key={`r${i}`} d={`M410 ${yFor(i) + 25} C 375 ${yFor(i) + 25}, 370 235, 355 235`} fill="none" stroke="#b45309" strokeOpacity="0.55" strokeWidth="1.4" strokeDasharray="1 6" strokeLinecap="round" />
      ))}
      {/* channel nodes */}
      {left.map((c, i) => (
        <g key={`ln${i}`}>
          <rect x="6" y={yFor(i)} width="144" height="50" rx="11" fill="#ffffff" stroke="rgba(10,23,48,0.16)" />
          <circle cx="26" cy={yFor(i) + 25} r="3.5" fill="#d97706" />
          <text x="42" y={yFor(i) + 30} fill="#0A1730" fontSize="13" fontWeight="600">{c.label}</text>
        </g>
      ))}
      {right.map((c, i) => (
        <g key={`rn${i}`}>
          <rect x="410" y={yFor(i)} width="144" height="50" rx="11" fill="#ffffff" stroke="rgba(10,23,48,0.16)" />
          <circle cx="430" cy={yFor(i) + 25} r="3.5" fill="#d97706" />
          <text x="446" y={yFor(i) + 30} fill="#0A1730" fontSize="13" fontWeight="600">{c.label}</text>
        </g>
      ))}
      {/* central core: Objective → Journey → Measurement — the one deliberate ink block */}
      <rect x="205" y="150" width="150" height="170" rx="16" fill="#0A1730" />
      {['Business Objective', 'Customer Journey', 'Measurement'].map((t, i) => (
        <g key={t}>
          <rect x="219" y={165 + i * 50} width="122" height="30" rx="8" fill="rgba(251,191,36,0.12)" stroke="rgba(251,191,36,0.4)" />
          <text x="280" y={184 + i * 50} textAnchor="middle" fill="#fde68a" fontSize="10.5" fontWeight="700">{t}</text>
          {i < 2 && <path d={`M280 ${196 + i * 50} l0 8 m-4 -4 l4 4 l4 -4`} stroke="#fbbf24" strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round" />}
        </g>
      ))}
    </svg>
  )
}

/* ─────────────────────────── Page ─────────────────────────── */

export default function DigitalMarketingServicesPage() {
  const [ws, setWs] = useState(0)
  const [openDeliv, setOpenDeliv] = useState<number | null>(0)
  const [openFaq, setOpenFaq] = useState<number | null>(0)
  const active = WORKSTREAMS[ws]

  return (
    <div className="relative overflow-hidden cc-canvas text-[#0A1730]">

      {/* ══════════ 1 · HERO ══════════ */}
      <section className="relative border-b cc-rule">
        <div className="container-custom pt-36 pb-20 lg:pt-44 lg:pb-24">
          <div className="grid lg:grid-cols-[1.05fr_0.95fr] gap-14 lg:gap-12 items-center">
            <div>
              <Kicker>Digital Marketing Services</Kicker>
              <h1 className="text-4xl md:text-5xl lg:text-[3.4rem] font-bold leading-[1.06] tracking-tight text-[#0A1730]">
                Turn Disconnected Marketing Activity Into a Coordinated Growth System.
              </h1>
              <p className="mt-7 text-lg md:text-xl text-slate-600 leading-relaxed max-w-xl">
                Core Conversion plans and executes the right combination of search, content, paid media, digital
                experience, automation, and analytics around a clear business objective.
              </p>
              <p className="mt-5 flex items-start gap-3 text-base text-slate-800 max-w-xl">
                <span className="h-px w-8 bg-amber-500 shrink-0 mt-3" />
                The strategy is tailored. The delivery system is structured. The work is measured and continuously improved.
              </p>
              <div className="mt-9 flex flex-col sm:flex-row gap-4">
                <GoldButton href={CAL} external>Discuss Your Growth Priorities</GoldButton>
                <OutlineButton href="#engagement">See What an Engagement Includes</OutlineButton>
              </div>
              <p className="mt-6 text-sm text-slate-500 max-w-lg">
                We will recommend against channels or deliverables that do not justify their cost at your current stage.
              </p>
            </div>
            <div className="relative"><HeroDiagram /></div>
          </div>
        </div>
      </section>

      {/* ══════════ 2 · COST OF FRAGMENTED MARKETING ══════════ */}
      <section className="py-24 md:py-28 cc-canvas-alt border-y cc-rule">
        <div className="container-custom">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-start">
            <Reveal className="lg:sticky lg:top-28">
              <Kicker>The Business Problem</Kicker>
              <h2 className="text-3xl md:text-4xl lg:text-[2.9rem] font-bold leading-[1.12] text-slate-900">
                Marketing Underperforms When No One Owns the Complete Journey.
              </h2>
              <div className="mt-6 space-y-4 text-[17px] text-slate-600 leading-relaxed max-w-[40rem]">
                <p>A business can have a website, publish content, run ads, appear on social media, and still lack a reliable way to attract and convert the right customers.</p>
                <p>The problem is often not the absence of activity. It is the absence of coordination, priority, ownership, and meaningful measurement.</p>
              </div>
              {/* journey line */}
              <div className="mt-9 rounded-2xl border border-slate-200 bg-white p-5">
                <p className="text-[11px] font-bold uppercase tracking-widest text-slate-400 mb-4">The customer journey — and where it leaks</p>
                <div className="flex items-center flex-wrap gap-y-3">
                  {JOURNEY.map((s, i) => (
                    <span key={s} className="flex items-center">
                      <span className="text-sm font-semibold text-slate-700 bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5">{s}</span>
                      {i < JOURNEY.length - 1 && <ChevronRight className="w-4 h-4 text-amber-400 mx-1.5" />}
                    </span>
                  ))}
                </div>
              </div>
            </Reveal>

            <div className="relative">
              <span className="absolute left-[19px] top-3 bottom-3 w-px bg-gradient-to-b from-amber-300 via-slate-200 to-amber-300" aria-hidden />
              <div className="space-y-5">
                {BREAKPOINTS.map((b) => (
                  <Reveal key={b.title}>
                    <div className="relative pl-12">
                      <span className="absolute left-0 top-1.5 w-10 h-10 rounded-full bg-white border border-amber-300 flex items-center justify-center">
                        <AlertCircle className="w-5 h-5 text-amber-500" />
                      </span>
                      <span className="text-[11px] font-bold uppercase tracking-widest text-amber-600">{b.stage}</span>
                      <h3 className="text-xl font-bold text-slate-900 mt-0.5">{b.title}</h3>
                      <p className="mt-1.5 text-[16px] text-slate-600 leading-relaxed">{b.desc}</p>
                    </div>
                  </Reveal>
                ))}
              </div>
            </div>
          </div>
          <Reveal className="mt-14">
            <p className="text-2xl md:text-3xl font-bold text-slate-900 leading-snug max-w-4xl">
              A growth system connects these stages and assigns each activity a purpose.
            </p>
          </Reveal>
        </div>
      </section>

      {/* ══════════ 3 · THE TRANSFORMATION ══════════ */}
      <section className="py-24 md:py-28 cc-canvas-white">
        <div className="container-custom">
          <Reveal className="max-w-3xl mb-14">
            <Kicker>The Transformation</Kicker>
            <h2 className="text-3xl md:text-4xl lg:text-[2.9rem] font-bold leading-[1.12] text-slate-900">
              From Marketing Activity to Managed Business Progress.
            </h2>
          </Reveal>

          <div className="relative">
            <span className="hidden md:block absolute left-1/2 -translate-x-1/2 top-2 bottom-2 w-0.5 bg-gradient-to-b from-amber-300 via-amber-400 to-amber-300" aria-hidden />
            <div className="space-y-10 md:space-y-0">
              {TRANSFORM.map((t, i) => (
                <Reveal key={i}>
                  <div className="md:grid md:grid-cols-2 md:gap-12 md:py-8 relative">
                    <span className="hidden md:block absolute left-1/2 -translate-x-1/2 top-1/2 -translate-y-1/2 w-3.5 h-3.5 rounded-full bg-amber-400 ring-4 ring-white" />
                    <div className="md:text-right md:pr-12">
                      <span className="text-[11px] font-bold uppercase tracking-widest text-slate-400">From</span>
                      <p className="mt-1 text-[17px] text-slate-500 leading-relaxed">{t.from}</p>
                    </div>
                    <div className="mt-3 md:mt-0 md:pl-12 border-l-2 md:border-l-0 border-amber-300 pl-4 md:pl-12">
                      <span className="text-[11px] font-bold uppercase tracking-widest text-amber-600">To</span>
                      <p className="mt-1 text-[17px] font-semibold text-slate-900 leading-relaxed">{t.to}</p>
                    </div>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ══════════ 4 · WHAT THE CLIENT RECEIVES ══════════ */}
      <section id="engagement" className="py-24 md:py-28 cc-canvas-alt border-y cc-rule scroll-mt-20">
        <div className="container-custom">
          <div className="grid lg:grid-cols-[0.85fr_1.15fr] gap-12 lg:gap-16 items-start">
            <Reveal className="lg:sticky lg:top-28">
              <Kicker>The Engagement</Kicker>
              <h2 className="text-3xl md:text-4xl lg:text-[2.9rem] font-bold leading-[1.12] text-slate-900">
                A Managed Roadmap, Active Execution, and Clear Decisions.
              </h2>
              <p className="mt-5 text-lg text-slate-600 leading-relaxed max-w-md">
                What a client receives is not a bundle of generic benefits. It is a governed program with defined
                deliverables, active implementation, and reviews that end in decisions.
              </p>
            </Reveal>

            <Reveal delay={0.05}>
              <div className="rounded-2xl border border-slate-200 bg-white overflow-hidden divide-y divide-slate-200">
                {DELIVERABLES.map((d, i) => {
                  const open = openDeliv === i
                  return (
                    <div key={d.n}>
                      <button onClick={() => setOpenDeliv(open ? null : i)} className="w-full flex items-center gap-5 text-left px-6 py-5 group">
                        <span className={`text-lg font-bold tabular-nums ${open ? 'text-amber-500' : 'text-slate-300'}`}>{d.n}</span>
                        <span className="flex-1 text-lg font-bold text-slate-900 group-hover:text-amber-600 transition-colors">{d.title}</span>
                        <span className="w-7 h-7 rounded-full border border-slate-300 flex items-center justify-center shrink-0 text-slate-500 group-hover:border-amber-400 group-hover:text-amber-600 transition-colors">
                          {open ? <Minus className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
                        </span>
                      </button>
                      <div className={`grid transition-all duration-300 ease-out ${open ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'}`}>
                        <div className="overflow-hidden">
                          <p className="px-6 pb-5 pl-[3.75rem] text-[16px] text-slate-600 leading-relaxed">{d.body}</p>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      {/* ══════════ 5 · SIX GROWTH WORKSTREAMS ══════════ */}
      <section className="py-24 md:py-28 relative cc-canvas-alt border-y cc-rule">
        <div className="container-custom relative z-10">
          <Reveal className="max-w-3xl mb-12">
            <Kicker>The Operating System</Kicker>
            <h2 className="text-3xl md:text-4xl lg:text-[2.9rem] font-bold leading-[1.12] text-[#0A1730]">
              Six Growth Workstreams Around the Customer Journey.
            </h2>
            <p className="mt-5 text-lg text-slate-600 leading-relaxed">
              Each workstream is a capability that can be activated when the roadmap justifies it. Select one to see its
              business purpose and the modules it can include.
            </p>
          </Reveal>

          <div className="grid lg:grid-cols-[0.95fr_1.05fr] gap-8 lg:gap-10 items-stretch">
            {/* selector */}
            <Reveal className="grid sm:grid-cols-2 gap-3 content-start">
              {WORKSTREAMS.map((w, i) => {
                const on = i === ws
                const Icon = w.icon
                return (
                  <button key={w.title} onClick={() => setWs(i)}
                    className={`text-left rounded-xl border p-5 transition-all ${on ? 'bg-white border-amber-500 shadow-sm' : 'bg-white/60 cc-rule hover:border-[rgba(10,23,48,0.3)]'}`}>
                    <span className={`w-11 h-11 rounded-xl flex items-center justify-center mb-3 ${on ? 'bg-[#0A1730]' : 'bg-white border cc-rule-md'}`}>
                      <Icon className={`w-5 h-5 ${on ? 'text-amber-400' : 'text-[#0A1730]'}`} />
                    </span>
                    <p className="font-bold text-[#0A1730] leading-snug">{w.title}</p>
                  </button>
                )
              })}
            </Reveal>

            {/* detail panel */}
            <motion.div key={ws} initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35 }}
              className="rounded-xl border cc-rule-md cc-canvas-white p-8 md:p-10 shadow-[0_18px_50px_-30px_rgba(10,23,48,0.3)]">
              <span className="text-xs font-bold uppercase tracking-widest text-amber-700">Workstream {String(ws + 1).padStart(2, '0')}</span>
              <h3 className="text-2xl md:text-3xl font-bold text-[#0A1730] mt-2">{active.title}</h3>
              <p className="mt-3 text-[17px] text-slate-600 leading-relaxed">
                <span className="text-amber-700 font-semibold">Business purpose. </span>{active.purpose}
              </p>
              <p className="mt-7 text-[11px] font-bold uppercase tracking-widest text-slate-400">Possible modules</p>
              <div className="mt-3 flex flex-wrap gap-2">
                {active.modules.map((m) => (
                  <span key={m} className="rounded-full bg-white border cc-rule-md px-3.5 py-1.5 text-[13px] font-medium text-slate-700">{m}</span>
                ))}
              </div>
            </motion.div>
          </div>

          <Reveal className="mt-10">
            <p className="text-sm text-slate-600 border-l-2 border-amber-500 pl-4 max-w-3xl">
              The workstreams shown are capabilities, not a promise that every engagement includes every activity.
            </p>
          </Reveal>
        </div>
      </section>

      {/* ══════════ 6 · DELIVERY MODEL ══════════ */}
      <section className="py-24 md:py-28 cc-canvas-white">
        <div className="container-custom">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-start mb-14">
            <Reveal>
              <Kicker>Our Delivery Model</Kicker>
              <h2 className="text-3xl md:text-4xl lg:text-[2.9rem] font-bold leading-[1.12] text-slate-900">
                Tailored to the Business. Structured for Reliable Delivery.
              </h2>
            </Reveal>
            <Reveal delay={0.1} className="space-y-4 text-[17px] text-slate-600 leading-relaxed">
              <p>Core Conversion does not force a company into a generic checklist. It also does not invent a new operating process every month.</p>
              <p>The business context determines which modules are used. The Core Conversion method determines how the work is governed, delivered, checked, and improved.</p>
            </Reveal>
          </div>

          <Reveal className="space-y-3">
            {/* Layer 1 */}
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-6 md:p-7">
              <div className="text-[11px] font-bold uppercase tracking-[0.2em] text-amber-600 mb-4">Layer 1 · One Standard Method</div>
              <div className="flex flex-wrap items-center gap-x-2 gap-y-3">
                {METHOD.map((s, i) => (
                  <span key={s} className="flex items-center gap-2">
                    <span className="rounded-lg bg-[#0A1730] px-4 py-2 text-sm font-semibold text-white">{s}</span>
                    {i < METHOD.length - 1 && <ArrowRight className="w-4 h-4 text-amber-500/70" />}
                  </span>
                ))}
              </div>
            </div>
            <div className="flex justify-center"><span className="h-7 w-px bg-gradient-to-b from-amber-400/70 to-amber-300/30" /></div>
            {/* Layer 2 */}
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-6 md:p-7">
              <div className="text-[11px] font-bold uppercase tracking-[0.2em] text-amber-600 mb-2">Layer 2 · Documented Service Modules</div>
              <p className="text-[15px] text-slate-600 mb-4 max-w-2xl">Every module carries the same defined attributes, so tailored programs stay consistent and accountable:</p>
              <div className="flex flex-wrap gap-2">
                {MODULE_ATTRS.map((m) => (
                  <span key={m} className="rounded-full bg-white border border-slate-200 px-3.5 py-1.5 text-[13px] font-medium text-slate-700">{m}</span>
                ))}
              </div>
            </div>
            <div className="flex justify-center"><span className="h-7 w-px bg-gradient-to-b from-amber-400/70 to-amber-300/30" /></div>
            {/* Layer 3 */}
            <div className="rounded-2xl border border-amber-300 bg-amber-50/60 p-6 md:p-7">
              <div className="text-[11px] font-bold uppercase tracking-[0.2em] text-amber-600 mb-2">Layer 3 · Tailored Program</div>
              <p className="text-[15px] text-slate-600 mb-4 max-w-2xl">Modules are assembled and sequenced according to:</p>
              <div className="flex flex-wrap gap-2">
                {TAILOR_BY.map((m) => (
                  <span key={m} className="rounded-full bg-white border border-amber-200 px-3.5 py-1.5 text-[13px] font-semibold text-amber-800">{m}</span>
                ))}
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ══════════ 7 · PHASED ROADMAP ══════════ */}
      <section className="py-24 md:py-28 cc-canvas-alt border-y cc-rule">
        <div className="container-custom">
          <Reveal className="max-w-3xl mb-14">
            <Kicker>Phased Growth Roadmap</Kicker>
            <h2 className="text-3xl md:text-4xl lg:text-[2.9rem] font-bold leading-[1.12] text-slate-900">
              Not Everything Should Be Done at Once.
            </h2>
            <p className="mt-5 text-lg text-slate-600 leading-relaxed">
              Strategy requires choosing what to prioritize and what to postpone.
            </p>
          </Reveal>

          <div className="grid md:grid-cols-3 gap-5">
            {PHASES.map((p, i) => (
              <Reveal key={p.n} delay={i * 0.08}>
                <div className={`h-full rounded-2xl border p-7 ${i === 0 ? 'bg-[#0A1730] text-white border-transparent' : 'bg-white border-slate-200'}`}>
                  <div className="flex items-center gap-3 mb-5">
                    <span className={`w-9 h-9 rounded-lg flex items-center justify-center font-bold ${i === 0 ? 'bg-amber-400 text-[#0A1730]' : 'bg-[#0A1730] text-amber-400'}`}>{i + 1}</span>
                    <span className={`text-[11px] font-bold uppercase tracking-widest ${i === 0 ? 'text-amber-400' : 'text-amber-600'}`}>{p.n}</span>
                  </div>
                  <h3 className={`text-xl font-bold mb-4 ${i === 0 ? 'text-white' : 'text-slate-900'}`}>{p.title}</h3>
                  <ul className="space-y-2.5">
                    {p.items.map((it) => (
                      <li key={it} className={`flex gap-2.5 text-[15px] leading-snug ${i === 0 ? 'text-slate-300' : 'text-slate-600'}`}>
                        <CheckCircle2 className={`w-4 h-4 shrink-0 mt-0.5 ${i === 0 ? 'text-amber-400' : 'text-amber-500'}`} />{it}
                      </li>
                    ))}
                  </ul>
                </div>
              </Reveal>
            ))}
          </div>
          <Reveal className="mt-8">
            <p className="text-[15px] text-slate-500 italic">The exact phase content is determined by the assessment and approved roadmap.</p>
          </Reveal>
        </div>
      </section>

      {/* ══════════ 8 · MEASUREMENT THAT LEADS TO DECISIONS ══════════ */}
      <section className="py-24 md:py-28 cc-noir">
        <div className="container-custom">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-start">
            <Reveal className="lg:sticky lg:top-28">
              <Kicker light>Growth Review</Kicker>
              <h2 className="text-3xl md:text-4xl lg:text-[2.9rem] font-bold leading-[1.12] text-white">
                A Growth Review Should End With a Decision — not a Page of Metrics.
              </h2>
              <p className="mt-6 text-[17px] text-slate-300 leading-relaxed max-w-md">
                The value is not access to charts. The value is disciplined interpretation, prioritization, and action.
                A higher plan does not simply add a premium dashboard.
              </p>
            </Reveal>

            <Reveal delay={0.05}>
              <div className="rounded-2xl border border-white/10 overflow-hidden bg-white">
                <div className="bg-[#0A1730] px-6 py-4 flex items-center justify-between">
                  <span className="text-sm font-bold text-white">Executive Growth Review</span>
                  <span className="text-[11px] uppercase tracking-widest text-amber-400">Decision-focused</span>
                </div>
                <div className="divide-y divide-slate-200">
                  {REVIEW.map((r, i) => (
                    <div key={r.title} className="flex gap-4 px-6 py-4">
                      <span className="text-sm font-bold text-slate-300 tabular-nums mt-0.5">{String(i + 1).padStart(2, '0')}</span>
                      <div>
                        <p className="font-bold text-slate-900">{r.title}</p>
                        <p className="text-[15px] text-slate-600 leading-relaxed mt-0.5">{r.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      {/* ══════════ 9 · WHO THIS IS FOR ══════════ */}
      <section className="py-24 md:py-28 cc-canvas-alt border-y cc-rule">
        <div className="container-custom">
          <Reveal className="max-w-3xl mb-12">
            <Kicker>Who This Is For</Kicker>
            <h2 className="text-3xl md:text-4xl lg:text-[2.9rem] font-bold leading-[1.12] text-slate-900">
              A Coordinated Program Fits Some Businesses Better Than Others.
            </h2>
          </Reveal>
          <div className="grid md:grid-cols-2 gap-6">
            <Reveal>
              <div className="h-full rounded-2xl bg-white border border-slate-200 p-8">
                <h3 className="text-lg font-bold text-slate-900 mb-5">Strong Fit</h3>
                <ul className="space-y-4">
                  {FIT_STRONG.map((f) => (
                    <li key={f} className="flex gap-3.5"><CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" /><span className="text-[16px] text-slate-700 leading-relaxed">{f}</span></li>
                  ))}
                </ul>
              </div>
            </Reveal>
            <Reveal delay={0.1}>
              <div className="h-full rounded-2xl bg-white border border-slate-200 p-8">
                <h3 className="text-lg font-bold text-slate-900 mb-5">A Focused Service May Be Better When</h3>
                <ul className="space-y-4">
                  {FIT_FOCUSED.map((f) => (
                    <li key={f} className="flex gap-3.5"><AlertCircle className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" /><span className="text-[16px] text-slate-700 leading-relaxed">{f}</span></li>
                  ))}
                </ul>
              </div>
            </Reveal>
          </div>
          <Reveal className="mt-8">
            <p className="text-[17px] text-slate-600 leading-relaxed max-w-3xl">
              Core Conversion will recommend a focused service when a retained digital marketing program would add
              unnecessary cost.
            </p>
          </Reveal>
        </div>
      </section>

      {/* ══════════ 10 · INVESTMENT LOGIC ══════════ */}
      <section className="py-24 md:py-28 cc-canvas-white">
        <div className="container-custom">
          <Reveal className="max-w-5xl mx-auto">
            <div className="rounded-3xl border border-slate-200 bg-slate-50 overflow-hidden">
              <div className="grid lg:grid-cols-[1fr_1fr]">
                <div className="p-9 md:p-12">
                  <Kicker>Investment Logic</Kicker>
                  <h2 className="text-3xl md:text-4xl font-bold leading-[1.14] text-slate-900">
                    Investment Follows Scope, Pace, and Required Capability.
                  </h2>
                  <p className="mt-5 text-[17px] text-slate-600 leading-relaxed">
                    Digital marketing engagements are scoped according to the business objective, number of active
                    workstreams, implementation pace, content and creative requirements, media complexity, technical
                    dependencies, and reporting or support needs.
                  </p>
                </div>
                <div className="cc-canvas-alt border-t lg:border-t-0 lg:border-l cc-rule p-9 md:p-12">
                  <p className="text-[11px] font-bold uppercase tracking-widest text-amber-700 mb-4">Investment ranges</p>
                  <div className="rounded-xl border cc-rule-md bg-white p-5 text-slate-600 text-[15px] leading-relaxed">
                    Foundation-level, growth-level, and advanced or multi-market monthly ranges — with a recommended
                    minimum engagement term — are shared during discovery, once scope is understood.
                    <span className="block mt-3 text-slate-500">Advertising budget is separated from management fees; one-time setup or build costs are identified where applicable.</span>
                  </div>
                  <p className="mt-6 text-[15px] text-slate-600 leading-relaxed">
                    A higher investment represents greater capability, implementation intensity, complexity, or pace —
                    not meaningless quantities of posts and reports.
                  </p>
                  <div className="mt-6"><GoldButton href={CAL} external>Scope Your Investment</GoldButton></div>
                </div>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ══════════ 11 · PROOF ══════════ */}
      <section className="py-24 md:py-28 cc-canvas-alt border-y cc-rule">
        <div className="container-custom">
          <Reveal className="max-w-3xl mb-12">
            <Kicker>Proof Through Execution</Kicker>
            <h2 className="text-3xl md:text-4xl lg:text-[2.9rem] font-bold leading-[1.12] text-slate-900">
              A Coordinated Approach, Applied to Real Business Conditions.
            </h2>
          </Reveal>

          <Reveal>
            <div className="grid lg:grid-cols-2 rounded-2xl border border-slate-200 overflow-hidden bg-white">
              <div className="relative min-h-[280px] lg:min-h-[440px] bg-slate-100">
                <img src="/case-studies/gpg-hero.png" alt="Real estate search growth case" className="absolute inset-0 w-full h-full object-cover object-top" />
                <span className="absolute top-5 left-5 text-[11px] font-bold uppercase tracking-widest text-[#0A1730] bg-amber-400 rounded-full px-3.5 py-1.5">Integrated Case Story</span>
              </div>
              <div className="p-8 md:p-11 flex flex-col justify-center">
                <span className="text-sm font-semibold uppercase tracking-widest text-amber-600 mb-5">Search Growth · Competitive Local Market</span>
                <dl className="space-y-5">
                  <div>
                    <dt className="font-semibold text-slate-400 uppercase tracking-wide text-[11px] mb-1">Business Context &amp; Starting Condition</dt>
                    <dd className="text-[17px] text-slate-700 leading-relaxed">A high-performing agent stuck at a visibility plateau, unable to break through the local noise of established franchises with far larger budgets.</dd>
                  </div>
                  <div>
                    <dt className="font-semibold text-slate-400 uppercase tracking-wide text-[11px] mb-1">Prioritized Workstreams</dt>
                    <dd className="text-[17px] text-slate-700 leading-relaxed">Search and Discovery led — competitor gap analysis, content architecture, and technical improvements — because organic visibility was the constraint limiting qualified inquiries.</dd>
                  </div>
                  <div>
                    <dt className="font-semibold text-amber-600 uppercase tracking-wide text-[11px] mb-1">Verified Outcome</dt>
                    <dd className="text-xl text-slate-900 font-bold leading-snug">Organic visibility increased and high-value inquiries improved — with the strategy documented and reused on later engagements.</dd>
                  </div>
                </dl>
                <Link href="/case-studies" className="inline-flex items-center gap-2 text-[#0A1730] font-semibold mt-8 hover:gap-3 transition-all">
                  View Full Case Study <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ══════════ 12 · EXECUTIVE FAQs ══════════ */}
      <section className="py-24 md:py-28 cc-canvas-white">
        <div className="container-custom">
          <div className="grid lg:grid-cols-[0.9fr_1.1fr] gap-12 lg:gap-16 items-start">
            <Reveal className="lg:sticky lg:top-28">
              <Kicker>Decision Support</Kicker>
              <h2 className="text-3xl md:text-4xl font-bold leading-[1.14] text-slate-900">
                Questions Serious Buyers Ask Before Engaging.
              </h2>
            </Reveal>
            <Reveal delay={0.05} className="divide-y divide-slate-200 border-y border-slate-200">
              {FAQS.map((f, i) => {
                const open = openFaq === i
                return (
                  <div key={f.q}>
                    <button onClick={() => setOpenFaq(open ? null : i)} className="w-full flex items-start justify-between gap-6 text-left py-6 group">
                      <span className="text-lg font-semibold text-slate-900 group-hover:text-amber-600 transition-colors">{f.q}</span>
                      <span className="w-7 h-7 rounded-full border border-slate-300 flex items-center justify-center shrink-0 mt-0.5 text-slate-500 group-hover:border-amber-400 group-hover:text-amber-600 transition-colors">
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

      {/* ══════════ 13 · FINAL CTA ══════════ */}
      <section className="relative py-28 md:py-32 cc-noir overflow-hidden">
        <div className="container-custom relative z-10">
          <Reveal className="max-w-3xl mx-auto text-center">
            <span className="block h-10 w-px bg-amber-400 mx-auto mb-8" aria-hidden />
            <Kicker light>Build the Right System</Kicker>
            <h2 className="text-3xl md:text-5xl font-bold leading-[1.1] text-white">
              Let’s Identify the Work That Deserves Priority.
            </h2>
            <p className="mt-6 text-lg md:text-xl text-slate-300 leading-relaxed">
              The first step is understanding the business, current digital activity, constraints, and growth objective.
              From there, Core Conversion can recommend a focused project or a coordinated digital marketing program.
            </p>
            <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center">
              <a href={CAL} target="_blank" rel="noopener noreferrer" className="group inline-flex items-center justify-center gap-2.5 bg-amber-400 hover:bg-amber-300 text-[#0B0C10] font-semibold px-7 py-3.5 rounded-lg transition-colors">
                Book a Discovery Call <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
              </a>
              <OutlineButton href="/services" light>Explore Our Services</OutlineButton>
            </div>
          </Reveal>
        </div>
      </section>
    </div>
  )
}

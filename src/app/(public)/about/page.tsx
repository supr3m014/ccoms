'use client'

import Link from 'next/link'
import { Reveal } from '@/components/Reveal'
import {
  ArrowRight, ArrowUpRight, Quote, Compass, Search, Globe, Megaphone, Code2,
  CheckCircle2, AlertCircle, Layers, Split, LineChart, FileText,
} from 'lucide-react'

const NAVY = '#0A1730'
const CAL = 'https://calendly.com/ccoms/discovery-call'

/* ─────────────────────────── Data ─────────────────────────── */

const HERO_PROOF = [
  '15+ Years Hands-On Experience',
  'Started in Digital Marketing in 2011',
  'Founder-Led Delivery',
  'Multi-Disciplinary Execution',
]

const FRAGMENTS = [
  { icon: Split, title: 'Disconnected Vendors', desc: 'Each supplier optimizes its own task, but no one owns the complete customer journey.' },
  { icon: Layers, title: 'Activity Without Direction', desc: 'Content, ads, and website changes are produced without a clear hierarchy of business priorities.' },
  { icon: LineChart, title: 'Reporting Without Decisions', desc: 'Data is collected, but leadership still lacks a clear answer on what should be improved next.' },
]

const TIMELINE = [
  { year: '2011', title: 'The Technical Foundation', body: 'Paul Carrasco began working hands-on in digital marketing, starting with SEO and expanding into content, local search, social media, email marketing, WordPress, hosting, analytics, and web technology.' },
  { year: '2012', title: 'Core Conversion Begins', body: 'What began as a one-person SEO operation started developing into a broader digital service practice focused on measurable search performance and reliable execution.' },
  { year: '2015', title: 'Building the Agency', body: 'Core Conversion became a formal brick-and-mortar operation with a multidisciplinary team supporting SEO, content, development, advertising, design, and administration.', image: '/portfolio/team-collage.png' },
  { year: '2019–2024', title: 'Broader Systems and Cross-Functional Work', body: 'The company’s work expanded into larger web platforms, e-commerce, technical infrastructure, mobile applications, analytics, paid acquisition, automation, and integrated digital operations.', image: '/case-studies/qrseal-hero.png' },
  { year: '2025+', title: 'The Core Conversion Model', body: 'Core Conversion is formalizing its methodology: a standardized way to understand the business, assess digital maturity, select the appropriate service modules, execute the roadmap, measure outcomes, and continuously improve.' },
]

const PRINCIPLES = [
  { n: '01', title: 'Understand Before Recommending', lead: 'We do not begin by pushing a predetermined service.', body: 'We first examine the business model, market, customers, existing assets, constraints, and commercial goals. The recommended work should respond to a real business need.' },
  { n: '02', title: 'Prioritize Before Expanding', lead: 'Doing more is not automatically better.', body: 'We identify the highest-impact priorities first, especially when time, budget, or internal capacity is limited. Lower-priority channels can be phased in when the foundation is ready.' },
  { n: '03', title: 'Integrate Before Optimizing', lead: 'A high-performing channel cannot compensate forever for a broken system.', body: 'The website, search visibility, paid acquisition, content, analytics, automation, and development work must support the same customer journey and business objective.' },
  { n: '04', title: 'Measure Before Assuming', lead: 'Activity is not the same as progress.', body: 'We examine visibility, qualified inquiries, conversion pathways, campaign efficiency, customer behavior, and other business-relevant indicators to decide what happens next.' },
  { n: '05', title: 'Improve Continuously', lead: 'Digital growth is not completed in a single launch.', body: 'We review performance, identify new constraints, refine the execution, and allow results and organizational knowledge to compound over time.' },
]

const METHOD_STEPS = ['Understand', 'Assess', 'Prioritize', 'Build', 'Measure', 'Improve']
const MODULES = ['Search / SEO', 'Content', 'Web Development', 'Paid Media', 'Local Visibility', 'Analytics', 'Automation', 'Mobile Development', 'Conversion Optimization']

const DELIVERY_NOTES = [
  { title: 'The Method Stays Consistent', desc: 'Every engagement follows the same core process for understanding, prioritizing, executing, and measuring.' },
  { title: 'The Service Mix Changes', desc: 'The work may involve search, content, web, ads, automation, analytics, development, or a phased combination.' },
  { title: 'The Objective Remains Business Growth', desc: 'Every selected activity must support an agreed business priority rather than exist as a disconnected deliverable.' },
]

const CAP_GROUPS = [
  { icon: Compass, title: 'Growth Direction & Performance', items: ['Business and digital assessment', 'Roadmap development', 'Campaign prioritization', 'Competitor monitoring', 'Measurement and growth reviews'] },
  { icon: Search, title: 'Search, Content & Authority', items: ['SEO', 'Local SEO', 'AEO and AI-search visibility', 'Content architecture', 'Service and educational content', 'Reputation and trust assets'] },
  { icon: Globe, title: 'Websites & Digital Platforms', items: ['Business websites', 'Landing pages', 'E-commerce', 'Performance and security', 'Conversion improvements', 'Custom web systems'] },
  { icon: Megaphone, title: 'Customer Acquisition & Nurturing', items: ['Meta Ads', 'Google Ads', 'Retargeting', 'Creative testing', 'Email campaigns', 'Lead nurturing'] },
  { icon: Code2, title: 'Development, Automation & Data', items: ['Mobile applications', 'Backend systems', 'Workflow automation', 'Analytics implementation', 'Tracking', 'Reporting infrastructure'] },
]

const CAP_STRIP = ['Strategy and Performance', 'SEO and Content', 'Web and Application Development', 'Paid Media', 'Design and Creative', 'Operations and Client Support']

const KNOWLEDGE_FLOW = ['Project', 'Evidence', 'Lessons', 'SOP / Module Improvement', 'Better Future Delivery']
const KNOWLEDGE_ASSETS = ['Case studies', 'Before-and-after evidence', 'Campaign findings', 'Reusable technical solutions', 'Internal service modules', 'Standard operating procedures', 'Quality-control checklists', 'Lessons learned']

const FIT_STRONG = [
  'Leadership has a clear commercial goal or is willing to define one with us.',
  'The business wants coordinated execution rather than isolated marketing tasks.',
  'Relevant data, account access, and business context can be shared.',
  'Decision-makers can participate at important review and approval points.',
  'The company values steady improvement and measurable progress.',
  'The engagement has enough time and continuity for results to compound.',
]
const FIT_DIFFERENT = [
  'The only selection criterion is the lowest possible price.',
  'The business expects guaranteed rankings, sales, or instant outcomes.',
  'No one can provide approvals, data, access, or business context.',
  'The request is for activity with no clear purpose or measurement.',
  'The company wants every channel launched immediately despite limited budget or operational readiness.',
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

/* ─────────────────────────── Page ─────────────────────────── */

export default function AboutPage() {
  return (
    <div className="relative overflow-hidden bg-white">

      {/* ══════════ 1 · HERO ══════════ */}
      <section className="relative border-b cc-rule">
        <div className="container-custom pt-36 pb-20 lg:pt-44 lg:pb-24">
          <div className="grid lg:grid-cols-[1.05fr_0.95fr] gap-14 lg:gap-16 items-center">
            {/* Left */}
            <div>
              <Kicker>About Core Conversion</Kicker>
              <h1 className="text-4xl md:text-5xl lg:text-[3.4rem] font-bold leading-[1.06] tracking-tight text-[#0A1730]">
                Strategy-Led Thinking. Hands-On Execution. One Accountable Team.
              </h1>
              <p className="mt-7 text-lg text-slate-600 leading-relaxed max-w-xl">
                Core Conversion is a founder-led digital marketing and development agency built to help businesses replace
                disconnected marketing activity with a more coordinated, measurable path to growth.
              </p>
              <p className="mt-4 text-lg text-slate-600 leading-relaxed max-w-xl">
                We first understand the business, identify what is limiting progress, and then execute the right combination
                of search, content, paid media, websites, automation, analytics, and custom development.
              </p>
              <div className="mt-9 flex flex-col sm:flex-row gap-4">
                <Link href="/#method" className="group inline-flex items-center justify-center gap-2.5 bg-[#0A1730] hover:bg-[#122548] text-white font-semibold px-7 py-3.5 rounded-lg transition-colors">
                  See How We Work <ArrowRight className="w-4 h-4 text-amber-400 transition-transform group-hover:translate-x-1" />
                </Link>
                <Link href="/case-studies" className="inline-flex items-center justify-center gap-2 border cc-rule-md text-[#0A1730] hover:border-[#0A1730] font-semibold px-7 py-3.5 rounded-lg transition-colors">
                  View Our Work <ArrowUpRight className="w-4 h-4" />
                </Link>
              </div>
              {/* proof strip */}
              <div className="mt-10 grid grid-cols-2 sm:grid-cols-4 gap-px rounded-xl overflow-hidden border cc-rule-md bg-[rgba(10,23,48,0.12)]">
                {HERO_PROOF.map((p) => (
                  <div key={p} className="bg-white px-4 py-4">
                    <p className="text-[13px] font-semibold text-slate-700 leading-snug">{p}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Right — documentary composition */}
            <div className="relative mx-auto lg:mx-0 max-w-sm lg:max-w-none w-full">
              <div className="relative rounded-2xl overflow-hidden ring-1 ring-amber-500/40 shadow-[0_24px_60px_-30px_rgba(10,23,48,0.4)]">
                <img src="/portfolio/paul-avatar.png" alt="Paul Carrasco, Founder of Core Conversion" className="w-full aspect-[4/5] object-cover" />
                <div className="absolute inset-0 ring-1 ring-inset ring-white/10 rounded-2xl" />
              </div>
              <div className="absolute -bottom-6 -left-5 w-40 md:w-48 rounded-xl overflow-hidden ring-1 ring-[rgba(10,23,48,0.15)] shadow-xl hidden sm:block">
                <img src="/portfolio/team-collage.png" alt="The Core Conversion team" className="w-full aspect-[4/3] object-cover" />
              </div>
              <div className="absolute -top-6 -right-5 w-40 md:w-44 rounded-xl overflow-hidden ring-1 ring-[rgba(10,23,48,0.15)] shadow-xl hidden sm:block">
                <img src="/case-studies/ccoms-hero.png" alt="Core Conversion project work" className="w-full aspect-[16/10] object-cover object-top" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ══════════ 2 · WHY WE EXIST ══════════ */}
      <section className="py-24 md:py-28 cc-canvas-alt border-y cc-rule">
        <div className="container-custom">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-16">
            <Reveal>
              <Kicker>Why We Exist</Kicker>
              <h2 className="text-3xl md:text-4xl lg:text-[2.75rem] font-bold leading-[1.14] text-slate-900">
                Digital Growth Breaks Down When Strategy and Execution Are Separated.
              </h2>
              <figure className="mt-10 border-l-2 border-amber-400 pl-6">
                <Quote className="w-7 h-7 text-amber-400 mb-3" />
                <blockquote className="text-xl md:text-2xl font-semibold text-slate-800 leading-snug">
                  We do not separate the people who recommend the work from the people responsible for delivering it.
                </blockquote>
              </figure>
            </Reveal>

            <Reveal delay={0.1}>
              <div className="space-y-5 text-[17px] text-slate-600 leading-relaxed max-w-[42rem]">
                <p>Many businesses do not fail online because they lack activity. They fail because the website, search strategy, advertising, content, tracking, and development work are handled as separate projects with no shared commercial objective.</p>
                <p>Core Conversion was built to close that gap. We combine business understanding with direct technical and marketing execution, so the strategy is informed by what can actually be built, measured, and improved.</p>
                <p>The result is not a collection of random services. It is a coordinated digital growth effort with clear priorities, defined responsibilities, and one team accountable for moving the work forward.</p>
              </div>
              <div className="mt-8 space-y-3">
                {FRAGMENTS.map(({ icon: Icon, title, desc }) => (
                  <div key={title} className="flex gap-4 border-t border-slate-200 pt-4">
                    <Icon className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
                    <div>
                      <p className="font-bold text-slate-900">{title}</p>
                      <p className="text-[15px] text-slate-600 leading-relaxed mt-0.5">{desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      {/* ══════════ 3 · FOUNDER STORY / EVOLUTION ══════════ */}
      <section className="py-24 md:py-28 cc-canvas-white">
        <div className="container-custom">
          <Reveal className="max-w-3xl mb-16">
            <Kicker>Our Evolution</Kicker>
            <h2 className="text-3xl md:text-4xl lg:text-[2.75rem] font-bold leading-[1.14] text-slate-900">
              From Hands-On SEO to an Integrated Digital Marketing and Development Agency.
            </h2>
            <p className="mt-5 text-lg text-slate-600 leading-relaxed">
              Core Conversion did not begin as a sales organization that later hired technical people. It grew from direct
              work: learning search, building websites, solving technical problems, studying user behavior, and improving
              how businesses are discovered and converted online.
            </p>
          </Reveal>

          <div className="relative">
            <span className="absolute left-[19px] md:left-1/2 md:-translate-x-1/2 top-2 bottom-2 w-px bg-slate-200" aria-hidden />
            <div className="space-y-12">
              {TIMELINE.map((t, i) => (
                <Reveal key={t.year} className="relative">
                  <div className={`md:grid md:grid-cols-2 md:gap-12 items-center`}>
                    <div className={`pl-12 md:pl-0 ${i % 2 ? 'md:order-2 md:pl-12' : 'md:pr-12 md:text-right'}`}>
                      <span className="absolute left-0 md:left-1/2 md:-translate-x-1/2 top-1 w-10 h-10 rounded-full bg-[#0A1730] ring-8 ring-white flex items-center justify-center">
                        <span className="w-2 h-2 rounded-full bg-amber-400" />
                      </span>
                      <div className="text-4xl md:text-5xl font-bold text-slate-200 leading-none mb-3">{t.year}</div>
                      <h3 className="text-xl md:text-2xl font-bold text-slate-900">{t.title}</h3>
                      <p className="mt-2 text-[16px] text-slate-600 leading-relaxed">{t.body}</p>
                    </div>
                    <div className={`pl-12 md:pl-0 mt-5 md:mt-0 ${i % 2 ? 'md:order-1' : ''}`}>
                      {t.image && (
                        <div className="rounded-2xl overflow-hidden border border-slate-200 shadow-sm">
                          <img src={t.image} alt={t.title} className="w-full aspect-[16/10] object-cover object-top" />
                        </div>
                      )}
                    </div>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>

          {/* Founder quote */}
          <Reveal className="mt-16">
            <div className="rounded-2xl bg-[#0A1730] text-white p-8 md:p-12 flex flex-col md:flex-row items-start gap-8">
              <img src="/portfolio/paul-avatar.png" alt="Paul Carrasco" className="w-20 h-20 rounded-full object-cover border-2 border-amber-400/70 shrink-0" />
              <div>
                <Quote className="w-8 h-8 text-amber-400 mb-3" />
                <blockquote className="text-xl md:text-2xl font-semibold leading-snug text-white max-w-3xl">
                  I built Core Conversion from the work itself. That keeps our recommendations grounded in what can actually
                  be executed — not only what sounds good in a presentation.
                </blockquote>
                <p className="mt-4 text-amber-400 font-semibold">Paul Carrasco <span className="text-slate-400 font-normal">— Founder</span></p>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ══════════ 4 · OPERATING PHILOSOPHY ══════════ */}
      <section className="py-24 md:py-28 cc-canvas-alt border-y cc-rule">
        <div className="container-custom">
          <Reveal className="max-w-3xl mb-14">
            <Kicker>How We Think</Kicker>
            <h2 className="text-3xl md:text-4xl lg:text-[2.75rem] font-bold leading-[1.14] text-slate-900">
              The Principles Behind Every Core Conversion Engagement.
            </h2>
          </Reveal>

          <div className="border-t border-slate-200">
            {PRINCIPLES.map(({ n, title, lead, body }) => (
              <Reveal key={n}>
                <div className="grid md:grid-cols-[auto_1fr] gap-6 md:gap-10 items-start py-9 border-b border-slate-200">
                  <div className="text-5xl md:text-6xl font-bold text-slate-200 leading-none tabular-nums">{n}</div>
                  <div className="grid lg:grid-cols-[1fr_1.2fr] gap-4 lg:gap-10">
                    <div>
                      <h3 className="text-xl md:text-2xl font-bold text-slate-900">{title}</h3>
                      <p className="mt-2 text-[17px] font-semibold text-amber-600">{lead}</p>
                    </div>
                    <p className="text-[16px] text-slate-600 leading-relaxed max-w-[42rem]">{body}</p>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════ 5 · TAILORED / STANDARDIZED DELIVERY MODEL ══════════ */}
      <section className="py-24 md:py-28 relative cc-canvas-alt border-y cc-rule">
        <div className="container-custom relative z-10">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-start mb-14">
            <Reveal>
              <Kicker>Our Delivery Model</Kicker>
              <h2 className="text-3xl md:text-4xl lg:text-[2.75rem] font-bold leading-[1.14] text-[#0A1730]">
                Tailored to the Business. Standardized Behind the Scenes.
              </h2>
            </Reveal>
            <Reveal delay={0.1} className="space-y-4 text-[17px] text-slate-600 leading-relaxed">
              <p>Core Conversion does not force every client into an identical checklist. It also does not reinvent the entire delivery process for every engagement.</p>
              <p>Every client follows the same disciplined methodology. Behind that methodology is a catalogue of defined service modules, processes, quality standards, and outputs. The combination and sequencing are tailored to the business.</p>
              <p>This allows the work to remain relevant to the client while preserving consistency, accountability, quality control, and predictable delivery.</p>
            </Reveal>
          </div>

          {/* three-layer diagram */}
          <Reveal className="space-y-3">
            <div className="rounded-2xl border cc-rule-md cc-canvas-white p-6 md:p-7">
              <div className="text-[11px] font-bold uppercase tracking-[0.2em] text-amber-700 mb-4">Layer 1 · Standardized Methodology</div>
              <div className="flex flex-wrap items-center gap-x-2 gap-y-3">
                {METHOD_STEPS.map((s, i) => (
                  <span key={s} className="flex items-center gap-2">
                    <span className="rounded-lg bg-[#0A1730] px-4 py-2 text-sm font-semibold text-white">{s}</span>
                    {i < METHOD_STEPS.length - 1 && <ArrowRight className="w-4 h-4 text-amber-400/60" />}
                  </span>
                ))}
              </div>
            </div>
            <div className="flex justify-center"><span className="h-7 w-px bg-gradient-to-b from-amber-400/60 to-amber-400/20" /></div>
            <div className="rounded-2xl border cc-rule-md cc-canvas-white p-6 md:p-7">
              <div className="text-[11px] font-bold uppercase tracking-[0.2em] text-amber-700 mb-4">Layer 2 · Standardized Internal Modules</div>
              <div className="flex flex-wrap gap-2">
                {MODULES.map((m) => (
                  <span key={m} className="rounded-full bg-white border cc-rule-md px-3.5 py-1.5 text-[13px] font-medium text-slate-700">{m}</span>
                ))}
              </div>
            </div>
            <div className="flex justify-center"><span className="h-7 w-px bg-gradient-to-b from-amber-400/60 to-amber-400/20" /></div>
            <div className="rounded-2xl border border-amber-500/50 bg-amber-500/[0.07] p-6 md:p-7">
              <div className="text-[11px] font-bold uppercase tracking-[0.2em] text-amber-700 mb-3">Layer 3 · Tailored Client Roadmap</div>
              <p className="text-[16px] text-slate-700 leading-relaxed max-w-3xl">
                The appropriate modules are selected, sequenced, and scoped according to the client’s growth stage, business
                priorities, budget, and operational readiness.
              </p>
            </div>
          </Reveal>

          <div className="grid md:grid-cols-3 gap-5 mt-12">
            {DELIVERY_NOTES.map(({ title, desc }) => (
              <Reveal key={title}>
                <div className="rounded-2xl border cc-rule cc-canvas-white p-6 h-full">
                  <h3 className="text-lg font-bold text-[#0A1730] mb-2">{title}</h3>
                  <p className="text-[15px] text-slate-600 leading-relaxed">{desc}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════ 6 · ONE TEAM, CONNECTED CAPABILITIES ══════════ */}
      <section className="py-24 md:py-28 cc-canvas-white">
        <div className="container-custom">
          <Reveal className="max-w-3xl mb-12">
            <Kicker>Our Capabilities</Kicker>
            <h2 className="text-3xl md:text-4xl lg:text-[2.75rem] font-bold leading-[1.14] text-slate-900">
              One Team Across the Disciplines That Shape Digital Growth.
            </h2>
            <p className="mt-5 text-lg text-slate-600 leading-relaxed">
              Businesses should not have to translate strategy between disconnected vendors. Core Conversion brings the key
              marketing and development disciplines together so decisions, implementation, data, and improvement remain connected.
            </p>
          </Reveal>

          <Reveal className="flex justify-center mb-8">
            <div className="inline-flex items-center gap-3 rounded-full bg-[#0A1730] text-white px-6 py-3 shadow-lg">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-400" />
              <span className="font-bold tracking-wide">Core Conversion</span>
              <span className="text-slate-400 text-sm hidden sm:inline">— one connected team</span>
            </div>
          </Reveal>

          <div className="relative">
            <span className="hidden lg:block absolute top-0 left-[10%] right-[10%] h-px bg-slate-200" aria-hidden />
            <div className="grid sm:grid-cols-2 lg:grid-cols-5 gap-5">
              {CAP_GROUPS.map(({ icon: Icon, title, items }) => (
                <Reveal key={title}>
                  <div className="group h-full rounded-2xl border border-slate-200 bg-white p-6 hover:border-amber-300 hover:shadow-lg transition-all">
                    <span className="hidden lg:block w-2.5 h-2.5 rounded-full bg-amber-400 ring-4 ring-white mx-auto -mt-[31px] mb-5" />
                    <div className="w-11 h-11 rounded-xl bg-[#0A1730] flex items-center justify-center mb-4">
                      <Icon className="w-5 h-5 text-amber-400" />
                    </div>
                    <h3 className="font-bold text-slate-900 leading-snug mb-3">{title}</h3>
                    <ul className="space-y-1.5">
                      {items.map((it) => (
                        <li key={it} className="text-[13.5px] text-slate-600 leading-snug flex gap-2">
                          <span className="text-amber-400 mt-0.5">·</span>{it}
                        </li>
                      ))}
                    </ul>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ══════════ 7 · THE PEOPLE BEHIND THE WORK ══════════ */}
      <section className="py-24 md:py-28 cc-canvas-alt border-y cc-rule">
        <div className="container-custom">
          <Reveal className="max-w-3xl mb-12">
            <Kicker>The Team</Kicker>
            <h2 className="text-3xl md:text-4xl lg:text-[2.75rem] font-bold leading-[1.14] text-slate-900">
              Senior Direction With Hands-On Delivery.
            </h2>
            <p className="mt-5 text-lg text-slate-600 leading-relaxed">
              Core Conversion is owner-led, but not owner-only. Strategy and technical direction are guided by experienced
              leadership, while specialists across search, content, design, development, advertising, and operations execute
              the approved roadmap.
            </p>
            <p className="mt-4 text-lg text-slate-600 leading-relaxed">
              We are deliberately building a company in which knowledge, standards, and accountability are shared through
              documented systems — not held only in one person’s head.
            </p>
          </Reveal>

          <div className="grid lg:grid-cols-[0.9fr_1.1fr] gap-8 lg:gap-10 items-stretch">
            <Reveal className="flex">
              <div className="w-full rounded-2xl bg-white border border-slate-200 p-8 flex flex-col">
                <img src="/portfolio/paul-avatar.png" alt="Paul Carrasco" className="w-24 h-24 rounded-2xl object-cover mb-5" />
                <h3 className="text-2xl font-bold text-slate-900">Paul Carrasco</h3>
                <p className="text-amber-600 font-semibold mt-1">Founder and Strategic &amp; Technical Lead</p>
                <p className="mt-4 text-[16px] text-slate-600 leading-relaxed">
                  Paul has worked hands-on across SEO, digital marketing, WordPress, development, hosting, analytics, content,
                  automation, and digital operations since 2011. He remains directly involved in strategic direction, technical
                  decisions, quality control, and complex problem-solving.
                </p>
              </div>
            </Reveal>

            <Reveal delay={0.1} className="flex flex-col gap-6">
              <div className="rounded-2xl overflow-hidden border border-slate-200 shadow-sm">
                <img src="/portfolio/team-collage.png" alt="The Core Conversion team" className="w-full aspect-[16/9] object-cover" />
              </div>
              <div className="rounded-2xl bg-white border border-slate-200 p-6">
                <p className="text-xs font-semibold uppercase tracking-widest text-slate-400 mb-4">Capabilities Across the Team</p>
                <div className="flex flex-wrap gap-2">
                  {CAP_STRIP.map((c) => (
                    <span key={c} className="rounded-full bg-slate-50 border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700">{c}</span>
                  ))}
                </div>
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      {/* ══════════ 8 · EXPERIENCE → ORGANIZATIONAL KNOWLEDGE ══════════ */}
      <section className="py-24 md:py-28 cc-canvas-white">
        <div className="container-custom">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
            <Reveal>
              <Kicker>How Experience Compounds</Kicker>
              <h2 className="text-3xl md:text-4xl lg:text-[2.75rem] font-bold leading-[1.14] text-slate-900">
                Every Completed Project Should Make the Company Better at the Next One.
              </h2>
              <div className="mt-5 space-y-4 text-[17px] text-slate-600 leading-relaxed max-w-[42rem]">
                <p>Core Conversion treats delivery as more than the completion of client tasks. Successful work, failed assumptions, technical solutions, campaign findings, and process improvements are documented and used to strengthen future execution.</p>
                <p>This is how experience becomes an organizational capability rather than remaining a collection of memories, screenshots, or isolated results.</p>
              </div>
              <p className="mt-6 border-l-2 border-amber-400 pl-5 text-[17px] font-semibold text-slate-800 leading-snug">
                The goal is not to repeat the same tactic for every client. The goal is to improve the quality of diagnosis
                and execution with every engagement.
              </p>
            </Reveal>

            <Reveal delay={0.1}>
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-7 md:p-8">
                <div className="flex items-center gap-3 mb-6">
                  <span className="w-11 h-11 rounded-xl bg-[#0A1730] flex items-center justify-center"><FileText className="w-5 h-5 text-amber-400" /></span>
                  <p className="font-bold text-slate-900">From project to reusable capability</p>
                </div>
                <ol className="relative border-l-2 border-slate-200 ml-3 space-y-5">
                  {KNOWLEDGE_FLOW.map((step, i) => (
                    <li key={step} className="relative pl-6">
                      <span className="absolute -left-[9px] top-1 w-4 h-4 rounded-full bg-amber-400 ring-4 ring-slate-50" />
                      <span className="text-[11px] font-bold text-slate-400">STEP {i + 1}</span>
                      <p className="font-semibold text-slate-900 leading-snug">{step}</p>
                    </li>
                  ))}
                </ol>
                <div className="mt-7 pt-6 border-t border-slate-200">
                  <p className="text-xs font-semibold uppercase tracking-widest text-slate-400 mb-3">Knowledge Assets Produced</p>
                  <div className="flex flex-wrap gap-2">
                    {KNOWLEDGE_ASSETS.map((a) => (
                      <span key={a} className="rounded-full bg-white border border-slate-200 px-3 py-1.5 text-[13px] font-medium text-slate-700">{a}</span>
                    ))}
                  </div>
                </div>
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      {/* ══════════ 9 · CLIENT FIT ══════════ */}
      <section className="py-24 md:py-28 cc-canvas-alt border-y cc-rule">
        <div className="container-custom">
          <Reveal className="max-w-3xl mb-12">
            <Kicker>Client Fit</Kicker>
            <h2 className="text-3xl md:text-4xl lg:text-[2.75rem] font-bold leading-[1.14] text-slate-900">
              The Strongest Results Begin With the Right Working Relationship.
            </h2>
            <p className="mt-5 text-lg text-slate-600 leading-relaxed">
              Core Conversion works across different industries and business stages. The strongest engagements share several
              operating conditions.
            </p>
          </Reveal>

          <div className="grid md:grid-cols-2 gap-6">
            <Reveal>
              <div className="h-full rounded-2xl bg-white border border-slate-200 p-8">
                <h3 className="text-lg font-bold text-slate-900 mb-5">Strong Fit</h3>
                <ul className="space-y-4">
                  {FIT_STRONG.map((f) => (
                    <li key={f} className="flex gap-3.5">
                      <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
                      <span className="text-[16px] text-slate-700 leading-relaxed">{f}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </Reveal>
            <Reveal delay={0.1}>
              <div className="h-full rounded-2xl bg-white border border-slate-200 p-8">
                <h3 className="text-lg font-bold text-slate-900 mb-5">A Different Approach May Be Better When</h3>
                <ul className="space-y-4">
                  {FIT_DIFFERENT.map((f) => (
                    <li key={f} className="flex gap-3.5">
                      <AlertCircle className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
                      <span className="text-[16px] text-slate-700 leading-relaxed">{f}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </Reveal>
          </div>

          <Reveal className="mt-8">
            <p className="text-[17px] text-slate-600 leading-relaxed max-w-3xl">
              A smaller business can still be a strong fit. Business size matters less than clarity, commitment, access, and a
              realistic willingness to execute.
            </p>
          </Reveal>
        </div>
      </section>

      {/* ══════════ 10 · FINAL TRUST + CTA ══════════ */}
      <section className="relative py-28 md:py-32 cc-noir overflow-hidden">
        <div className="container-custom relative z-10">
          <Reveal className="max-w-3xl mx-auto text-center">
            <span className="block h-10 w-px bg-amber-400 mx-auto mb-8" aria-hidden />
            <Kicker light>Start the Conversation</Kicker>
            <h2 className="text-3xl md:text-5xl font-bold leading-[1.1] text-white">
              Let’s Understand the Business Before Recommending the Work.
            </h2>
            <p className="mt-6 text-lg md:text-xl text-slate-300 leading-relaxed">
              A discovery call gives us the context to understand your objectives, current digital activity, constraints, and
              priorities. From there, we can determine whether Core Conversion is the right partner and what the next
              assessment should cover.
            </p>
            <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center">
              <a href={CAL} target="_blank" rel="noopener noreferrer" className="group inline-flex items-center justify-center gap-2.5 bg-amber-400 hover:bg-amber-300 text-[#0B0C10] font-semibold px-7 py-3.5 rounded-lg transition-colors">
                Book a Discovery Call <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
              </a>
              <Link href="/case-studies" className="inline-flex items-center justify-center gap-2 border border-white/25 text-white hover:border-white/60 font-semibold px-7 py-3.5 rounded-lg transition-colors">
                View Case Studies <ArrowUpRight className="w-4 h-4" />
              </Link>
            </div>
            <p className="mt-6 text-sm text-slate-400">If we do not believe we can contribute meaningfully, we will say so.</p>
          </Reveal>
        </div>
      </section>
    </div>
  )
}

'use client'

/*
 * Website Development — executive canvas edition.
 * Visual identity for this page: the architectural blueprint. Ink lines on a
 * fine-grained white canvas, drafting annotations, roman-numeral chapters.
 */

import { useState } from 'react'
import Link from 'next/link'
import { Reveal } from '@/components/Reveal'
import {
  ArrowRight, ArrowUpRight, Plus, Minus, CheckCircle2, Globe, Layout,
  Search, MousePointerClick, Workflow, Wrench, ShieldCheck, Gauge, Accessibility,
  FileText, PenTool, Code2, TestTube2, Rocket, TrendingUp, Compass,
} from 'lucide-react'

const INK = '#0A1730'
const CAL = 'https://calendly.com/ccoms/discovery-call'

/* ─────────────────────────── Data ─────────────────────────── */

const JOBS = [
  { n: 'I', title: 'Establish Confidence', desc: 'The visitor must quickly understand who the company is, what it provides, and why it is credible.' },
  { n: 'II', title: 'Make the Offer Clear', desc: 'Services, products, audiences, and next steps must be organized around the visitor’s decision — not the company’s internal language.' },
  { n: 'III', title: 'Support Discovery', desc: 'Technical structure, content architecture, speed, indexing, schema, and internal linking should support search visibility.' },
  { n: 'IV', title: 'Convert Interest', desc: 'Calls, forms, booking, checkout, downloads, and other actions must be clear, relevant, trackable, and easy to complete.' },
  { n: 'V', title: 'Support Operations', desc: 'The platform may need integrations, dashboards, product management, notifications, automation, portals, or internal workflows.' },
  { n: 'VI', title: 'Remain Maintainable', desc: 'The website must be secure, documented, editable, backed up, and capable of future expansion without constant reconstruction.' },
]

const SYMPTOMS = [
  'Visitors cannot understand the offer quickly.',
  'Mobile users struggle to read or act.',
  'Campaign traffic arrives on generic pages.',
  'Pages load slowly or break under plugins.',
  'Search engines cannot understand the structure.',
  'Forms or bookings create friction.',
  'Tracking cannot distinguish meaningful actions.',
  'Content is difficult to update.',
  'Security and maintenance are uncertain.',
  'The platform cannot support the next stage of the business.',
]

const ENGAGEMENTS = [
  {
    n: '01', title: 'Campaign and Conversion Pages',
    when: 'For a specific offer, paid campaign, product launch, event, lead magnet, or testing initiative.',
    outputs: ['Landing page', 'Sales page', 'Order page', 'Booking flow', 'Campaign tracking', 'Thank-you and follow-up integration'],
  },
  {
    n: '02', title: 'Business Website',
    when: 'For a company that needs a credible, structured, search-ready, manageable online presence.',
    outputs: ['Information architecture', 'Service pages', 'Company and trust content', 'Inquiry pathways', 'CMS', 'Analytics foundation', 'Technical SEO foundation'],
  },
  {
    n: '03', title: 'Growth Platform',
    when: 'For businesses requiring extensive content, lead generation, multiple audiences, locations, integrations, or ongoing marketing.',
    outputs: ['Scalable architecture', 'Landing-page system', 'Resource center', 'Location or market structure', 'CRM / forms / automation integrations', 'Advanced tracking', 'Conversion improvement'],
  },
  {
    n: '04', title: 'E-Commerce or Custom Web System',
    when: 'For transactions, product catalogs, customer accounts, dashboards, subscriptions, data workflows, or specialized operational requirements.',
    outputs: ['E-commerce', 'Custom checkout', 'Product and compliance systems', 'Customer portals', 'Admin dashboards', 'API integration', 'Custom workflows'],
  },
]

const METHOD = [
  { icon: Compass, title: 'Business and User Context', desc: 'Objectives, users, offers, decision process, content, current platform, integrations, constraints, success criteria.' },
  { icon: Layout, title: 'Information and Conversion Architecture', desc: 'Sitemap, page purpose, user journeys, content hierarchy, calls to action, conversion events, and required functionality.' },
  { icon: PenTool, title: 'Visual Direction and Prototype', desc: 'Design language, key-page composition, responsive behavior, components, accessibility, and approval checkpoints.' },
  { icon: Code2, title: 'Development and Integration', desc: 'Frontend, CMS, backend, forms, data, analytics, integrations, performance, security, and content implementation.' },
  { icon: TestTube2, title: 'Quality Assurance', desc: 'Responsive testing, browser testing, forms, links, accessibility checks, indexing controls, analytics validation, speed, and security review.' },
  { icon: Rocket, title: 'Launch and Stabilization', desc: 'Deployment, DNS or hosting coordination, backups, monitoring, handover, documentation, and post-launch correction period.' },
  { icon: TrendingUp, title: 'Improvement', desc: 'Optional ongoing SEO, conversion, maintenance, campaign, content, or development support.' },
]

const STANDARDS = [
  { icon: FileText, title: 'Business Clarity', desc: 'Every major page has a defined audience, purpose, message, and next action.', x: 14, y: 16 },
  { icon: Layout, title: 'Responsive Experience', desc: 'The site is intentionally designed for desktop, tablet, and mobile — not simply compressed.', x: 78, y: 14 },
  { icon: Gauge, title: 'Performance', desc: 'Images, code, fonts, scripts, hosting, caching, and plugins are managed to reduce unnecessary load.', x: 22, y: 44 },
  { icon: Search, title: 'Search Readiness', desc: 'Indexing, metadata, headings, URL structure, internal links, structured data, and content architecture are prepared correctly.', x: 66, y: 38 },
  { icon: MousePointerClick, title: 'Conversion Readiness', desc: 'Forms, booking, calls, checkout, and campaign actions are designed and measured.', x: 40, y: 64 },
  { icon: ShieldCheck, title: 'Security and Reliability', desc: 'SSL, access control, updates, backups, security configuration, and deployment responsibilities are defined.', x: 82, y: 66 },
  { icon: Wrench, title: 'Maintainability', desc: 'The build uses a documented component system, sensible tooling, and editing workflows appropriate to the client’s capability.', x: 16, y: 82 },
  { icon: Accessibility, title: 'Accessibility', desc: 'Readable contrast, keyboard access, meaningful labels, responsive text, and other practical accessibility requirements are considered.', x: 60, y: 86 },
]

const BRAND_SUPPORT = [
  'Digital visual direction', 'Website-specific brand application', 'Page copy and content structure', 'Custom graphics',
  'Diagrams', 'Iconography', 'Image treatment', 'Campaign assets', 'Basic logo refinement', 'Presentation of proof and case studies',
]

const DELIVERABLE_PHASES = [
  { phase: 'Planning', items: ['Requirements summary', 'Sitemap', 'Page / content plan', 'User journeys', 'Functionality list', 'Project timeline', 'Responsibilities'] },
  { phase: 'Design', items: ['Visual direction', 'Key-page designs', 'Responsive states', 'Component system', 'Revision rounds defined by proposal'] },
  { phase: 'Development', items: ['Approved pages and functionality', 'CMS', 'Integrations', 'Analytics / tracking', 'Technical foundation', 'Content population according to scope'] },
  { phase: 'Launch', items: ['Testing', 'Deployment', 'Backup', 'Basic training', 'Documentation', 'Post-launch support period'] },
]

const INVESTMENT_FACTORS = [
  'Scope and page architecture', 'Content requirements', 'Visual complexity', 'Custom functionality', 'Integrations',
  'Migration', 'E-commerce', 'Data', 'User roles', 'Testing', 'Compliance', 'Timeline', 'Support',
]

const FAQS = [
  { q: 'Can we edit the site ourselves?', a: 'The editing experience is designed according to the platform and client capability. The proposal specifies which content can be edited in-house and what requires technical support.' },
  { q: 'Is SEO included?', a: 'Every build includes a correct technical and on-page foundation for the agreed pages. Ongoing SEO research, content expansion, authority work, local SEO, and continuous optimization are separate unless included in the approved scope.' },
  { q: 'Who provides the content?', a: 'Core Conversion can structure, edit, or produce content when included. Client-provided content must meet agreed deadlines and quality requirements. Responsibilities are made explicit in the proposal.' },
  { q: 'Do you provide hosting and maintenance?', a: 'Hosting, monitoring, updates, backups, security, and support can be included or offered separately. Ownership, renewal costs, and service limits are kept transparent.' },
  { q: 'Can you improve an existing website instead of rebuilding?', a: 'Yes — when the current platform can support the required goals without creating disproportionate technical risk or cost.' },
  { q: 'Do you guarantee leads or sales?', a: 'No. A website supports visibility, credibility, conversion, and operations, but commercial performance also depends on demand, offer, traffic quality, sales execution, pricing, reputation, and customer experience.' },
]

/* ─────────────────────────── Helpers (canvas language) ─────────────────────────── */

function Kicker({ children, light = false }: { children: React.ReactNode; light?: boolean }) {
  return <span className={`inline-block text-xs font-semibold uppercase tracking-[0.24em] mb-4 ${light ? 'text-amber-400' : 'text-amber-700'}`}>{children}</span>
}

function InkButton({ href, children, external = false }: { href: string; children: React.ReactNode; external?: boolean }) {
  const cls = 'group inline-flex items-center justify-center gap-2.5 bg-[#0A1730] hover:bg-[#122548] text-white font-semibold px-7 py-3.5 rounded-lg transition-colors'
  const inner = <>{children} <ArrowRight className="w-4 h-4 text-amber-400 transition-transform group-hover:translate-x-1" /></>
  return external ? <a href={href} target="_blank" rel="noopener noreferrer" className={cls}>{inner}</a> : <Link href={href} className={cls}>{inner}</Link>
}
function HairlineButton({ href, children, light = false }: { href: string; children: React.ReactNode; light?: boolean }) {
  const cls = light
    ? 'inline-flex items-center justify-center gap-2 border border-white/25 text-white hover:border-white/60 font-semibold px-7 py-3.5 rounded-lg transition-colors'
    : 'inline-flex items-center justify-center gap-2 border cc-rule-md text-[#0A1730] hover:border-[#0A1730] font-semibold px-7 py-3.5 rounded-lg transition-colors'
  return (
    <Link href={href} className={cls}>
      {children} <ArrowUpRight className="w-4 h-4" />
    </Link>
  )
}

/* ─────────────────────────── Page ─────────────────────────── */

export default function WebsiteDevelopmentPage() {
  const [standard, setStandard] = useState(0)
  const [openFaq, setOpenFaq] = useState<number | null>(0)
  const S = STANDARDS[standard]

  return (
    <div className="relative overflow-hidden cc-canvas text-[#0A1730]">

      {/* ══════════ 1 · HERO — drafting-table split ══════════ */}
      <section className="relative border-b cc-rule">
        <div className="container-custom pt-36 pb-20 lg:pt-44 lg:pb-24">
          <div className="grid lg:grid-cols-[1.02fr_0.98fr] gap-14 lg:gap-16 items-center">
            <div>
              <Kicker>Website Development</Kicker>
              <h1 className="text-4xl md:text-5xl lg:text-[3.4rem] font-bold leading-[1.06] tracking-tight text-[#0A1730]">
                Build the Digital Foundation Your Business Can Grow On.
              </h1>
              <p className="mt-7 text-lg md:text-xl text-slate-600 leading-relaxed max-w-xl">
                Core Conversion designs and develops business websites, landing pages, e-commerce platforms, and custom
                web systems built for credibility, discoverability, conversion, performance, and long-term use.
              </p>
              <p className="mt-5 flex items-center gap-3 text-base text-slate-800 max-w-xl">
                <span className="h-px w-8 bg-amber-500 shrink-0" />
                Not a decorative online brochure. A working business asset.
              </p>
              <div className="mt-9 flex flex-col sm:flex-row gap-4">
                <InkButton href={CAL} external>Discuss Your Website</InkButton>
                <HairlineButton href="/case-studies">View Website Projects</HairlineButton>
              </div>
            </div>

            {/* exploded system — a real project, annotated like a technical drawing */}
            <Reveal delay={0.1}>
              <div className="relative">
                <div className="rounded-xl overflow-hidden border cc-rule-md shadow-[0_24px_60px_-30px_rgba(10,23,48,0.35)] bg-white">
                  <img src="/case-studies/gpg-hero.png" alt="A Core Conversion website build" className="w-full aspect-[16/10] object-cover object-top" loading="eager" />
                </div>
                {/* drafting annotations */}
                <div className="hidden md:block" aria-hidden>
                  {[
                    { t: 'Message', top: '6%', left: '-3%' },
                    { t: 'Conversion path', top: '38%', left: '-6%' },
                    { t: 'Search foundation', bottom: '10%', left: '-2%' },
                    { t: 'Performance', top: '12%', right: '-4%' },
                    { t: 'Analytics', top: '52%', right: '-6%' },
                    { t: 'Security', bottom: '4%', right: '-3%' },
                  ].map((a) => (
                    <span key={a.t} style={{ top: a.top, bottom: a.bottom, left: a.left, right: a.right }}
                      className="absolute bg-white border cc-rule-md rounded-full px-3.5 py-1.5 text-[11px] font-semibold tracking-wide text-[#0A1730] shadow-sm">
                      <span className="inline-block w-1.5 h-1.5 rounded-full bg-amber-500 mr-2 align-middle" />{a.t}
                    </span>
                  ))}
                </div>
                <p className="mt-4 text-xs text-slate-400 tracking-wide">FIG. 01 — A website is a system: message, structure, conversion, search, data, and operations in one build.</p>
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      {/* ══════════ 2 · WHAT A WEBSITE MUST ACCOMPLISH — ledger rows ══════════ */}
      <section className="cc-canvas-white border-b cc-rule py-24 md:py-28">
        <div className="container-custom">
          <Reveal className="max-w-3xl mb-14">
            <Kicker>The Mandate</Kicker>
            <h2 className="text-3xl md:text-4xl lg:text-[2.9rem] font-bold leading-[1.1] text-[#0A1730]">A Website Has More Than One Job.</h2>
          </Reveal>
          <div className="border-t cc-rule">
            {JOBS.map(({ n, title, desc }) => (
              <Reveal key={n}>
                <div className="grid md:grid-cols-[110px_1fr_1.4fr] gap-3 md:gap-10 items-baseline py-7 border-b cc-rule">
                  <span className="text-3xl md:text-4xl font-light text-slate-300 tracking-wide">{n}</span>
                  <h3 className="text-xl md:text-2xl font-bold text-[#0A1730]">{title}</h3>
                  <p className="text-[16px] text-slate-600 leading-relaxed">{desc}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════ 3 · DIAGNOSTIC — the audit sheet ══════════ */}
      <section className="cc-canvas-alt border-b cc-rule py-24 md:py-28">
        <div className="container-custom">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-start">
            <Reveal className="lg:sticky lg:top-28">
              <Kicker>Diagnosis</Kicker>
              <h2 className="text-3xl md:text-4xl lg:text-[2.9rem] font-bold leading-[1.1] text-[#0A1730]">
                The Website May Be Costing More Than It Appears.
              </h2>
              <p className="mt-6 text-[17px] text-slate-600 leading-relaxed max-w-md">
                A redesign is justified when the current platform prevents the business from communicating, acquiring,
                serving, or scaling effectively — not merely because the visual style is old.
              </p>
            </Reveal>
            <Reveal delay={0.05}>
              {/* audit sheet: numbered findings on ruled paper */}
              <div className="cc-canvas-white rounded-xl border cc-rule-md p-8 md:p-9 shadow-[0_18px_50px_-30px_rgba(10,23,48,0.3)]">
                <div className="flex items-center justify-between pb-4 border-b cc-rule-md">
                  <span className="text-xs font-bold uppercase tracking-[0.2em] text-[#0A1730]">Platform Audit — Findings</span>
                  <span className="text-[11px] text-slate-400 tracking-widest">10 ITEMS</span>
                </div>
                <ol className="divide-y divide-[rgba(10,23,48,0.07)]">
                  {SYMPTOMS.map((s, i) => (
                    <li key={s} className="flex gap-4 py-3.5 items-baseline">
                      <span className="text-[11px] font-bold text-amber-700 tabular-nums w-6 shrink-0">{String(i + 1).padStart(2, '0')}</span>
                      <span className="text-[15.5px] text-slate-700 leading-relaxed">{s}</span>
                    </li>
                  ))}
                </ol>
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      {/* ══════════ 4 · ENGAGEMENT TYPES — four editorial chapters ══════════ */}
      <section className="cc-canvas border-b cc-rule py-24 md:py-28">
        <div className="container-custom">
          <Reveal className="max-w-3xl mb-14">
            <Kicker>Ways We Build</Kicker>
            <h2 className="text-3xl md:text-4xl lg:text-[2.9rem] font-bold leading-[1.1] text-[#0A1730]">
              Four Engagements. One Standard of Construction.
            </h2>
            <p className="mt-5 text-lg text-slate-600 leading-relaxed">
              Not Bronze, Silver, Gold. The engagement is shaped by what the business needs the platform to do.
            </p>
          </Reveal>

          <div className="space-y-6">
            {ENGAGEMENTS.map((e, i) => (
              <Reveal key={e.n}>
                <div className={`grid lg:grid-cols-[140px_1fr_1.1fr] gap-6 lg:gap-10 rounded-xl border cc-rule p-8 md:p-10 ${i % 2 ? 'cc-canvas-white' : 'bg-white/60'}`}>
                  <div className="text-6xl md:text-7xl font-extralight text-slate-200 leading-none tabular-nums">{e.n}</div>
                  <div>
                    <h3 className="text-2xl font-bold text-[#0A1730]">{e.title}</h3>
                    <p className="mt-3 text-[16px] text-slate-600 leading-relaxed">{e.when}</p>
                  </div>
                  <div className="lg:border-l cc-rule lg:pl-10">
                    <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-slate-400 mb-3">Possible outputs</p>
                    <ul className="grid sm:grid-cols-2 gap-x-6 gap-y-2">
                      {e.outputs.map((o) => (
                        <li key={o} className="flex gap-2.5 text-[14.5px] text-slate-700"><span className="text-amber-600 mt-px">—</span>{o}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
          <Reveal className="mt-8">
            <p className="text-[15px] text-slate-500 italic">The final engagement type and scope are determined after requirements and technical discovery.</p>
          </Reveal>
        </div>
      </section>

      {/* ══════════ 5 · THE WEB METHOD — one continuous drafting line ══════════ */}
      <section className="cc-canvas-white border-b cc-rule py-24 md:py-28">
        <div className="container-custom">
          <Reveal className="max-w-3xl mb-16">
            <Kicker>The Core Conversion Web Method</Kicker>
            <h2 className="text-3xl md:text-4xl lg:text-[2.9rem] font-bold leading-[1.1] text-[#0A1730]">
              One Continuous Path From Context to Improvement.
            </h2>
          </Reveal>

          <div className="relative">
            <span className="absolute left-[27px] top-3 bottom-3 w-px bg-gradient-to-b from-amber-500 via-[rgba(10,23,48,0.15)] to-amber-500" aria-hidden />
            <ol className="space-y-10">
              {METHOD.map(({ icon: Icon, title, desc }, i) => (
                <Reveal key={title}>
                  <li className="relative pl-20">
                    <span className="absolute left-0 top-0 w-14 h-14 rounded-full bg-white border cc-rule-md flex items-center justify-center shadow-sm">
                      <Icon className="w-6 h-6 text-[#0A1730]" />
                    </span>
                    <span className="text-[11px] font-bold uppercase tracking-[0.22em] text-amber-700">Stage {i + 1}</span>
                    <h3 className="text-xl md:text-2xl font-bold text-[#0A1730] mt-1">{title}</h3>
                    <p className="mt-2 text-[16px] text-slate-600 leading-relaxed max-w-2xl">{desc}</p>
                  </li>
                </Reveal>
              ))}
            </ol>
          </div>
        </div>
      </section>

      {/* ══════════ 6 · STANDARDS — annotated screen with hotspots ══════════ */}
      <section className="cc-noir py-24 md:py-28">
        <div className="container-custom">
          <Reveal className="max-w-3xl mb-12">
            <Kicker light>Standards Behind the Build</Kicker>
            <h2 className="text-3xl md:text-4xl lg:text-[2.9rem] font-bold leading-[1.1] text-white">
              Eight Standards, Inspected on Every Build.
            </h2>
            <p className="mt-5 text-lg text-slate-300 leading-relaxed">Select a marker to read the standard behind it.</p>
          </Reveal>

          <div className="grid lg:grid-cols-[1.15fr_0.85fr] gap-8 lg:gap-12 items-stretch">
            <Reveal>
              <div className="relative rounded-xl overflow-hidden border border-white/10 bg-white shadow-[0_30px_80px_-40px_rgba(0,0,0,0.9)]">
                <img src="/case-studies/peptide-hero.png" alt="Annotated Core Conversion build" loading="lazy" className="w-full aspect-[16/10] object-cover object-top opacity-90" />
                <div className="absolute inset-0 bg-[#0A1730]/5" />
                {STANDARDS.map((st, i) => (
                  <button key={st.title} onClick={() => setStandard(i)} aria-label={st.title}
                    style={{ left: `${st.x}%`, top: `${st.y}%` }}
                    className={`absolute -translate-x-1/2 -translate-y-1/2 w-8 h-8 rounded-full border-2 text-xs font-bold transition-all
                      ${standard === i ? 'bg-amber-500 border-amber-500 text-[#0A1730] scale-110' : 'bg-white/95 border-[rgba(10,23,48,0.25)] text-[#0A1730] hover:border-amber-500'}`}>
                    {i + 1}
                  </button>
                ))}
              </div>
            </Reveal>
            <Reveal delay={0.05} className="flex">
              <div key={standard} className="w-full rounded-xl border border-white/10 bg-white/[0.04] p-8 md:p-9 flex flex-col justify-center">
                <span className="w-12 h-12 rounded-lg bg-white/[0.06] border border-amber-400/30 flex items-center justify-center mb-5"><S.icon className="w-5 h-5 text-amber-400" /></span>
                <span className="text-[11px] font-bold uppercase tracking-[0.22em] text-amber-400">Standard {String(standard + 1).padStart(2, '0')} of {STANDARDS.length}</span>
                <h3 className="text-2xl font-bold text-white mt-1.5">{S.title}</h3>
                <p className="mt-3 text-[16.5px] text-slate-300 leading-relaxed">{S.desc}</p>
                <div className="mt-7 flex gap-1.5">
                  {STANDARDS.map((_, j) => (
                    <button key={j} onClick={() => setStandard(j)} aria-label={`Standard ${j + 1}`}
                      className={`h-1 flex-1 rounded-full transition-colors ${j === standard ? 'bg-amber-400' : 'bg-white/15 hover:bg-white/30'}`} />
                  ))}
                </div>
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      {/* ══════════ 7 · CONTENT, DESIGN & BRAND SUPPORT ══════════ */}
      <section className="cc-canvas border-b cc-rule py-24 md:py-28">
        <div className="container-custom">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
            <Reveal>
              <Kicker>Content, Design &amp; Brand Support</Kicker>
              <h2 className="text-3xl md:text-4xl font-bold leading-[1.12] text-[#0A1730]">
                The Website Must Express the Brand — Not Wait for Perfect Brand Assets.
              </h2>
              <p className="mt-5 text-[17px] text-slate-600 leading-relaxed max-w-xl">
                Depending on scope, Core Conversion supports the creative work the build actually needs — so the platform
                launches coherent, credible, and on-brand.
              </p>
              <p className="mt-5 text-[15px] text-slate-500 leading-relaxed max-w-xl border-l-2 border-amber-500 pl-4">
                Full corporate rebranding, extensive identity systems, photography, and specialized print production are
                scoped separately or handled with an appropriate partner when required.
              </p>
            </Reveal>
            <Reveal delay={0.08}>
              <div className="flex flex-wrap gap-2.5">
                {BRAND_SUPPORT.map((b) => (
                  <span key={b} className="rounded-full bg-white border cc-rule-md px-4 py-2 text-[14px] font-medium text-slate-700">{b}</span>
                ))}
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      {/* ══════════ 8 · FEATURED PROOF — GPG ══════════ */}
      <section className="cc-canvas-white border-b cc-rule py-24 md:py-28">
        <div className="container-custom">
          <Reveal className="max-w-3xl mb-12">
            <Kicker>Featured Proof</Kicker>
            <h2 className="text-3xl md:text-4xl lg:text-[2.9rem] font-bold leading-[1.1] text-[#0A1730]">
              A Platform Rebuilt to Carry the Business.
            </h2>
          </Reveal>
          <Reveal>
            <div className="grid lg:grid-cols-2 rounded-xl border cc-rule-md overflow-hidden bg-white">
              <div className="relative min-h-[300px] lg:min-h-[460px]">
                <img src="/case-studies/gpg-hero.png" alt="Greater Property Group platform rebuild" loading="lazy" className="absolute inset-0 w-full h-full object-cover object-top" />
                <span className="absolute top-5 left-5 text-[11px] font-bold uppercase tracking-widest text-white bg-[#0A1730]/90 rounded-full px-3.5 py-1.5">Greater Property Group · Real Estate</span>
              </div>
              <div className="p-8 md:p-11 flex flex-col justify-center">
                <dl className="space-y-5">
                  <div>
                    <dt className="font-semibold text-slate-400 uppercase tracking-wide text-[11px] mb-1">Business Situation &amp; Platform Constraint</dt>
                    <dd className="text-[17px] text-slate-700 leading-relaxed">A North American real-estate platform suffering critical security vulnerabilities — including malware injection — and a fragmented experience that hindered lead conversion.</dd>
                  </div>
                  <div>
                    <dt className="font-semibold text-slate-400 uppercase tracking-wide text-[11px] mb-1">Approach &amp; Key Build Decisions</dt>
                    <dd className="text-[17px] text-slate-700 leading-relaxed">Full manual security remediation, a mobile-first frontend rebuild, backend optimized for large-scale IDX/MLS data sync, and bloated third-party plugins replaced with lightweight custom code.</dd>
                  </div>
                  <div>
                    <dt className="font-semibold text-amber-700 uppercase tracking-wide text-[11px] mb-1">Verified Outcome</dt>
                    <dd className="text-xl text-[#0A1730] font-bold leading-snug">A secure platform, free of malware, with pages loading under two seconds — a scalable lead-generation foundation for the North American market.</dd>
                  </div>
                </dl>
                <Link href="/case-studies" className="inline-flex items-center gap-2 text-[#0A1730] font-semibold mt-8 hover:gap-3 transition-all">
                  View Full Case Study <ArrowRight className="w-4 h-4 text-amber-600" />
                </Link>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ══════════ 9 · WHAT THE CLIENT RECEIVES — project room ══════════ */}
      <section className="cc-canvas-alt border-b cc-rule py-24 md:py-28">
        <div className="container-custom">
          <Reveal className="max-w-3xl mb-12">
            <Kicker>What the Client Receives</Kicker>
            <h2 className="text-3xl md:text-4xl lg:text-[2.9rem] font-bold leading-[1.1] text-[#0A1730]">
              Deliverables, Grouped the Way the Project Actually Runs.
            </h2>
          </Reveal>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-5">
            {DELIVERABLE_PHASES.map((p, i) => (
              <Reveal key={p.phase} delay={(i % 4) * 0.06}>
                <div className="h-full cc-canvas-white rounded-xl border cc-rule p-7">
                  <div className="flex items-baseline justify-between border-b cc-rule pb-4 mb-4">
                    <h3 className="text-lg font-bold text-[#0A1730]">{p.phase}</h3>
                    <span className="text-[11px] font-bold text-amber-700 tracking-widest">PHASE {i + 1}</span>
                  </div>
                  <ul className="space-y-2.5">
                    {p.items.map((it) => (
                      <li key={it} className="flex gap-2.5 text-[14.5px] text-slate-700 leading-snug"><CheckCircle2 className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />{it}</li>
                    ))}
                  </ul>
                </div>
              </Reveal>
            ))}
          </div>
          <Reveal className="mt-8">
            <p className="text-[15px] text-slate-600 leading-relaxed max-w-3xl border-l-2 border-amber-500 pl-4">
              The proposal identifies what content, assets, integrations, licenses, hosting, revisions, migration, and
              maintenance are included or excluded.
            </p>
          </Reveal>
        </div>
      </section>

      {/* ══════════ 10 · INVESTMENT & TIMELINE ══════════ */}
      <section className="cc-canvas border-b cc-rule py-24 md:py-28">
        <div className="container-custom">
          <Reveal className="max-w-5xl mx-auto">
            <div className="rounded-2xl border cc-rule-md overflow-hidden grid lg:grid-cols-2 bg-white">
              <div className="p-9 md:p-12">
                <Kicker>Investment &amp; Timeline</Kicker>
                <h2 className="text-3xl md:text-4xl font-bold leading-[1.12] text-[#0A1730]">
                  Scoped by What the Platform Must Do — Not by Page Count.
                </h2>
                <p className="mt-5 text-[16.5px] text-slate-600 leading-relaxed">
                  Starting ranges for campaign pages, business websites, growth platforms, and e-commerce or custom systems
                  are shared during discovery, once requirements are understood.
                </p>
                <p className="mt-4 text-[15.5px] text-slate-500 leading-relaxed">
                  A small campaign page and a multi-system business platform should not share one delivery promise. The
                  proposal provides a realistic schedule based on approved requirements, dependencies, content readiness,
                  and review availability.
                </p>
                <div className="mt-7"><InkButton href={CAL} external>Scope Your Build</InkButton></div>
              </div>
              <div className="cc-canvas-alt p-9 md:p-12 border-t lg:border-t-0 lg:border-l cc-rule">
                <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-amber-700 mb-5">What shapes the investment</p>
                <div className="flex flex-wrap gap-2">
                  {INVESTMENT_FACTORS.map((f) => (
                    <span key={f} className="rounded-full bg-white border cc-rule-md px-3.5 py-1.5 text-[13.5px] font-medium text-slate-700">{f}</span>
                  ))}
                </div>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ══════════ 11 · FAQs ══════════ */}
      <section className="cc-canvas-white border-b cc-rule py-24 md:py-28">
        <div className="container-custom">
          <div className="grid lg:grid-cols-[0.9fr_1.1fr] gap-12 lg:gap-16 items-start">
            <Reveal className="lg:sticky lg:top-28">
              <Kicker>Decision Support</Kicker>
              <h2 className="text-3xl md:text-4xl font-bold leading-[1.12] text-[#0A1730]">
                Questions Owners Ask Before Committing to a Build.
              </h2>
            </Reveal>
            <Reveal delay={0.05} className="divide-y divide-[rgba(10,23,48,0.1)] border-y cc-rule-md">
              {FAQS.map((f, i) => {
                const open = openFaq === i
                return (
                  <div key={f.q}>
                    <button onClick={() => setOpenFaq(open ? null : i)} aria-expanded={open} className="w-full flex items-start justify-between gap-6 text-left py-6 group">
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

      {/* ══════════ 12 · FINAL CTA — quiet, conclusive ══════════ */}
      <section className="cc-noir py-28 md:py-32">
        <div className="container-custom">
          <Reveal className="max-w-3xl mx-auto text-center">
            <span className="block h-10 w-px bg-amber-400 mx-auto mb-8" aria-hidden />
            <Kicker light>Next Step</Kicker>
            <h2 className="text-3xl md:text-5xl font-bold leading-[1.1] text-white">
              Build a Website That Supports the Next Stage of the Business.
            </h2>
            <p className="mt-6 text-lg md:text-xl text-slate-300 leading-relaxed">
              We will first understand the business objective, users, existing assets, and technical requirements — then
              recommend whether the right path is an improvement, focused landing page, full website, or custom platform.
            </p>
            <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center">
              <a href={CAL} target="_blank" rel="noopener noreferrer" className="group inline-flex items-center justify-center gap-2.5 bg-amber-400 hover:bg-amber-300 text-[#0B0C10] font-semibold px-7 py-3.5 rounded-lg transition-colors">
                Discuss Your Website <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
              </a>
              <HairlineButton href="/case-studies" light>View Website Case Studies</HairlineButton>
            </div>
          </Reveal>
        </div>
      </section>
    </div>
  )
}

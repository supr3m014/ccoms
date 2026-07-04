'use client'

import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Search, Eye, ShieldCheck, FileText, MousePointerClick, BarChart3,
  Target, Users, Activity, Map, Rocket, ClipboardList, Route, Cog,
  LineChart, X, ChevronLeft, ChevronRight, ExternalLink, ArrowRight,
  Globe, Code2, Megaphone, Layers, Sparkles, Hammer, HeartHandshake, Gauge
} from 'lucide-react'

/* ───────────────────────────── Sections ───────────────────────────── */

const SECTIONS = [
  'Welcome',
  'Who We Are',
  'The Team',
  'Why CCOMS Exists',
  'What We Help Fix',
  'Services We Provide',
  'Tools & Systems',
  'Proof of Execution',
  'How We Approach You',
  'How We Work',
]
const TOTAL = SECTIONS.length

const SPEECHES = [
  'Hi, I’m Paul from CCOMS. This quick tour walks you through who we are, how we work, and the proof behind it — in a few short steps.',
  'For over 14 years we’ve done one thing well: hands-on digital marketing. We don’t just plan and recommend — we build, fix, ship, and optimize the work ourselves.',
  'Behind every result is a real team. These are the specialists who plan, build, and execute your work — all under one roof.',
  'Too many businesses have been burned by providers who sell confidence but deliver excuses. CCOMS exists to patch those holes.',
  'Before we recommend any service, we look for the gaps. The right problems fixed in the right order.',
  'We don’t push every service just to fill a package. We build the right mix around your goals, audience, and market.',
  'Tools vary depending on the client’s needs — we use them to measure, research, build, and improve, not to decorate reports.',
  'Don’t take our word for it. Here’s public proof from work already presented on our website.',
  'Every business has a different audience, budget, and starting point. That’s why we don’t recommend the same package to everyone.',
  'Our process is simple: understand the business, find the gaps, build the roadmap, execute the work, and measure what moves.',
]

// Where Paul stands on each slide (kept out of the content’s way, varied per scene)
const AVATAR_ALIGN: ('center' | 'left' | 'right')[] =
  ['center', 'left', 'right', 'left', 'right', 'left', 'right', 'left', 'right', 'left']

const NEXT_LABELS = [
  'Start the Tour', 'Next: The Team', 'Next: Why CCOMS Exists', 'Next: What We Help Fix',
  'Next: Services', 'Next: Tools & Systems', 'Next: Proof', 'Next: Our Approach',
  'Next: How We Work', '',
]

/* ───────────────────────────── Content data ───────────────────────────── */

const ABOUT_VALUES = [
  { icon: Hammer, title: 'Hands-On Execution', desc: 'We build, fix, ship, and optimize. Results come from real work, not endless strategy documents.' },
  { icon: Users, title: 'Direct Core Team', desc: 'Every project is handled by our own team — no middlemen, no white-label outsourcing hidden from you.' },
  { icon: Gauge, title: 'Tied to Outcomes', desc: 'Every engagement maps to business results — rankings, leads, sales — not vanity metrics.' },
  { icon: HeartHandshake, title: 'Long-Term Partnership', desc: 'Built for relationships that compound over time, not quick client turnover.' },
]

const TEAM = [
  {
    dept: 'HR & Finance', members: [
      { slug: 'carrasco-joylynn', name: 'Joylynn Carrasco', role: 'HR Manager' },
      { slug: 'sequia-rochelle', name: 'Rochelle Sequia', role: 'HR Assistant' },
      { slug: 'alasgas-tanya', name: 'Tanya Alasgas', role: 'HR Assistant' },
      { slug: 'ramos-lhean', name: 'Lhean Ramos', role: 'Finance' },
    ],
  },
  {
    dept: 'Web Development', members: [
      { slug: 'arevia-maria', name: 'Maria Geneva Arevia', role: 'Team Lead — Web Dev' },
      { slug: 'mahlina-roel', name: 'Roel Mahlina', role: 'Web Development / SEO' },
      { slug: 'cahipo-jules', name: 'Jules Cahipo', role: 'Software Engineer' },
      { slug: 'capunitan-jason', name: 'Jason Capunitan', role: 'Programmer' },
    ],
  },
  {
    dept: 'Content', members: [
      { slug: 'bodoa-jerome', name: 'Jerome David Bodoa', role: 'Team Lead — Content' },
      { slug: 'mangerra-venee', name: 'Venee Mangerra', role: 'Content Specialist' },
      { slug: 'garcia-patrick', name: 'Patrick Garcia', role: 'Content Specialist' },
      { slug: 'alibabang-princess', name: 'Princess Alibabang', role: 'Social Media Specialist' },
    ],
  },
  {
    dept: 'Ads & SEO', members: [
      { slug: 'echeveria-marie', name: 'Marie Echeveria', role: 'Team Lead — Ads / PPC' },
      { slug: 'abayani-judith', name: 'Judith Abayani', role: 'Ads Specialist / Meta' },
      { slug: 'rosales-harvey', name: 'Harvey Rosales', role: 'SEO' },
      { slug: 'almendral-jade', name: 'Jade Almendral', role: 'SEO' },
    ],
  },
  {
    dept: 'Design & Operations', members: [
      { slug: 'santos-kier', name: 'Kier Santos', role: 'Graphics Designer' },
      { slug: 'ochos-ronron', name: 'Ron-ron Ochos', role: 'Liaison Officer' },
    ],
  },
]

const BURNED = ['Empty promises', 'Recycled proposals', 'Fake activity', 'Hidden white-label outsourcing', 'Vanity reports', 'No accountability']
const STANDS = ['Honest assessment', 'Custom roadmap', 'Real implementation', 'Clear ownership', 'Measurable progress', 'Long-term partnership']

const GAPS = [
  { icon: Eye, title: 'Visibility Gaps', desc: 'Are the right people finding you online?' },
  { icon: ShieldCheck, title: 'Credibility Gaps', desc: 'Does your website, branding, and trust presence look established?' },
  { icon: FileText, title: 'Content Gaps', desc: 'Are your services, offers, proof, and FAQs clear?' },
  { icon: MousePointerClick, title: 'Conversion Gaps', desc: 'Is it easy for visitors to inquire, call, book, or message?' },
  { icon: BarChart3, title: 'Tracking Gaps', desc: 'Can you measure what is actually working?' },
]

const SERVICES = [
  { icon: Search, title: 'Full SEO Services', desc: 'Search strategy, technical SEO, on-page, local SEO, content direction, audits, and performance improvement.' },
  { icon: Sparkles, title: 'Answer Engine Optimization', desc: 'Preparing businesses for answer-based search, AI-assisted discovery, and modern search experiences.' },
  { icon: Code2, title: 'Custom Website Development', desc: 'Websites built for credibility, performance, search visibility, and inquiry generation.' },
  { icon: Megaphone, title: 'Paid Ads Management', desc: 'Campaign planning and management across Google, Facebook, Instagram, TikTok, and LinkedIn.' },
  { icon: Layers, title: 'Full Digital Marketing', desc: 'A tailored mix of SEO, paid ads, website work, content, and tracking based on the client’s needs.' },
]

interface Tool { name: string; logo?: string; mono?: string }
const TOOL_GROUPS: { key: string; label: string; tools: Tool[] }[] = [
  { key: 'research', label: 'Research & SEO Audits', tools: [{ name: 'Ahrefs', mono: 'Ah' }, { name: 'SEMrush', logo: 'semrush' }, { name: 'Screaming Frog', mono: 'SF' }] },
  { key: 'tracking', label: 'Tracking & Measurement', tools: [{ name: 'Google Analytics 4', logo: 'googleanalytics' }, { name: 'Search Console', logo: 'googlesearchconsole' }, { name: 'Tag Manager', logo: 'googletagmanager' }] },
  {
    key: 'webdev', label: 'Website & Development', tools: [
      { name: 'WordPress', logo: 'wordpress' }, { name: 'Elementor', logo: 'elementor' }, { name: 'WooCommerce', logo: 'woocommerce' },
      { name: 'VS Code', mono: 'VS' }, { name: 'Google Antigravity', mono: 'AG' }, { name: 'GitHub', logo: 'github' },
      { name: 'Next.js', logo: 'nextdotjs' }, { name: 'Vite', logo: 'vite' }, { name: 'React', logo: 'react' },
      { name: 'Tailwind CSS', logo: 'tailwindcss' }, { name: 'HTML5', logo: 'html5' }, { name: 'CSS', logo: 'css' },
      { name: 'JavaScript', logo: 'javascript' }, { name: 'PHP', logo: 'php' }, { name: 'MySQL', logo: 'mysql' },
    ],
  },
  { key: 'design', label: 'Design & Creative', tools: [{ name: 'Canva', logo: 'canva' }, { name: 'Figma', logo: 'figma' }, { name: 'Photoshop', mono: 'Ps' }] },
]

interface Study { title: string; niche: string; done: string; proof: string; thumb: string; images: string[]; highRes?: string; liveUrl?: string }
const STUDIES: Study[] = [
  { title: 'Efficient Power Solutions', niche: 'Landing Page Development', done: 'Rebuilt a client-supplied AI ad concept into a standards-compliant, mobile-first landing page — with an order dashboard and instant email alerts added as bonuses.', proof: 'Live COD campaign page serving the PH market.', thumb: '/case-studies/efficientpower-solutions.png', images: ['/case-studies/efficientpower-solutions.png'], liveUrl: 'https://efficientpower-solutions.com/' },
  { title: 'CComs Revamp', niche: 'Agency Transformation', done: 'Rebuilt the agency site into a high-performance “Growth OS” on Next.js 14 with AEO/GEO architecture and custom JSON-LD for AI search engines.', proof: 'Sub-second static delivery with AEO-ready schema.', thumb: '/case-studies/ccoms-hero.png', images: ['/case-studies/ccoms-hero.png'] },
  { title: 'QR Seal', niche: 'SaaS Development', done: 'Built an AI-enhanced QR code management platform with generative design and hardened Supabase RLS for absolute data ownership.', proof: 'Production SaaS with AI generative design.', thumb: '/case-studies/qrseal-hero.png', images: ['/case-studies/qrseal-hero.png'] },
  { title: 'Pharma Niche: Peptides', niche: 'E-Commerce & Authority', done: 'Engineered topical authority maps and revenue-first rankings in the ultra-competitive research chemical sector.', proof: 'Achieved #1 for “Peptides for Sale” — survived multiple core updates.', thumb: '/case-studies/ups-hero.png', images: ['/case-studies/ups-hero.png'] },
  { title: 'Real Estate Niche: GPG', niche: 'Enterprise Solution', done: 'Consolidated fragmented domains into a singular, high-DR national hub with regional architecture.', proof: 'Ranks across thousands of location-based keywords.', thumb: '/case-studies/gpg-hero.png', images: ['/case-studies/gpg-hero.png'] },
  { title: 'Niche: Real Estate', niche: 'SEO Campaign', done: 'Competitor gap analysis plus a freshness-first content campaign against established franchises.', proof: 'Broke the 200–300 visit/month plateau — direct rise in agent sign-ups.', thumb: '/case-studies/proofs/real-estate-proof-1.png', images: Array.from({ length: 12 }, (_, i) => `/case-studies/proofs/real-estate-proof-${i + 1}.png`), highRes: 'https://photos.app.goo.gl/iphFUGCQTFqznsMf8' },
  { title: 'Niche: Pharma', niche: 'SEO Recovery', done: 'Diagnosed an algorithmic over-optimization penalty and executed anchor profile dilution to rebalance the domain.', proof: 'Full recovery after the next core update — short-tail dominance restored.', thumb: '/case-studies/proofs/pharma-proof-1.png', images: ['/case-studies/proofs/pharma-proof-1.png', '/case-studies/proofs/pharma-proof-2.png', '/case-studies/proofs/pharma-proof-3.png'], highRes: 'https://photos.app.goo.gl/2NzwqW1U47gU3s8R9' },
  { title: 'Niche: Attorneys', niche: 'Legal SEO', done: 'Micro-niche authority silo with E-E-A-T schema for NYC family law, plus a pillar ecosystem for national financial litigation.', proof: 'Top 3 for “prenup lawyer ny” — Page 3 to Page 1 nationally.', thumb: '/case-studies/proofs/legal-proof-1.png', images: ['/case-studies/proofs/legal-proof-1.png', '/case-studies/proofs/legal-proof-2.png'], highRes: 'https://photos.app.goo.gl/rodRcMNNHUktiZnf6' },
  { title: 'Niche: London', niche: 'Local SEO', done: 'Local dominance campaign in one of the most saturated metropolitan markets.', proof: 'Sustained first-page visibility in a hyper-competitive niche.', thumb: '/case-studies/proofs/escorts-proof-1.jpg', images: ['/case-studies/proofs/escorts-proof-1.jpg'], highRes: 'https://photos.app.goo.gl/D6dAeSumgT8GEx2BA' },
]

const FRAMEWORK = [
  { icon: Target, title: 'Business Goal', desc: 'What are we improving: visibility, credibility, inquiries, sales, bookings, leads, or retention?' },
  { icon: Users, title: 'Audience & Platform Fit', desc: 'Where does the target audience actually search, browse, compare, and decide?' },
  { icon: Activity, title: 'Current Digital Condition', desc: 'Website, search visibility, tracking, content, local presence, brand trust, and conversion flow.' },
  { icon: Map, title: 'Priority Roadmap', desc: 'What should be fixed first to avoid wasting budget?' },
  { icon: Rocket, title: 'Execution Plan', desc: 'Which services and tools fit the real situation?' },
]

const PROCESS = [
  { icon: Search, title: 'Discovery', desc: 'Understand the business, goals, audience, offers, and current digital presence.' },
  { icon: ClipboardList, title: 'Audit', desc: 'Review website, search visibility, competitors, content, tracking, and opportunity gaps.' },
  { icon: Route, title: 'Roadmap', desc: 'Prioritize the actions that matter most based on impact, urgency, and resources.' },
  { icon: Cog, title: 'Execution', desc: 'Implement across SEO, website, ads, content, and tracking channels.' },
  { icon: LineChart, title: 'Reporting & Improvement', desc: 'Track performance, explain what changed, and refine based on data and results.' },
]

/* ───────────────────────────── Animations ───────────────────────────── */

const stagger = { hidden: {}, visible: { transition: { staggerChildren: 0.12, delayChildren: 0.7 } } }
const item = { hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0, transition: { duration: 0.45, ease: 'easeOut' } } }

/* ───────────────────────────── Sub-components ───────────────────────────── */

function Presenter({ section }: { section: number }) {
  const align = AVATAR_ALIGN[section]
  const wrap =
    align === 'center' ? 'justify-center text-center flex-col items-center'
      : align === 'right' ? 'flex-row-reverse ml-auto text-right'
        : 'mr-auto'
  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className={`flex items-end gap-3 mb-7 max-w-xl ${wrap}`}
    >
      <img
        src="/portfolio/paul-avatar.png"
        alt="Paul — CCOMS"
        className={`rounded-full object-cover border-2 border-blue-500 shadow-md shrink-0 ${align === 'center' ? 'w-24 h-24' : 'w-14 h-14'}`}
      />
      <motion.div
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.45, delay: 0.3 }}
        className={`relative bg-white text-neutral-700 rounded-2xl px-4 py-3 shadow-lg border border-neutral-200 text-sm leading-relaxed
          ${align === 'right' ? 'rounded-br-none' : align === 'center' ? '' : 'rounded-bl-none'}`}
      >
        {SPEECHES[section]}
      </motion.div>
    </motion.div>
  )
}

function SlideHead({ title, sub }: { title: string; sub?: string }) {
  return (
    <div className="mb-6">
      <h2 className="text-3xl lg:text-4xl font-bold text-neutral-900">{title}</h2>
      {sub && <p className="text-neutral-500 mt-1.5">{sub}</p>}
    </div>
  )
}

function ToolCard({ tool }: { tool: Tool }) {
  return (
    <div className="flex items-center justify-center gap-3 bg-white rounded-xl border border-neutral-200 px-5 py-4 shadow-sm">
      {tool.logo
        ? <img src={`/portfolio/tools/${tool.logo}.svg`} alt={tool.name} loading="lazy" className="w-9 h-9 object-contain shrink-0" />
        : <span className="w-9 h-9 rounded-md bg-neutral-900 text-white text-[13px] font-bold flex items-center justify-center shrink-0">{tool.mono}</span>}
      <span className="text-base font-semibold text-neutral-800">{tool.name}</span>
    </div>
  )
}

/* ───────────────────────────── Page ───────────────────────────── */

export default function PortfolioPage() {
  const [section, setSection] = useState(0)
  const [toolTab, setToolTab] = useState('tracking')
  const [modal, setModal] = useState<{ study: Study; index: number } | null>(null)
  const isLast = section === TOTAL - 1

  const advance = useCallback(() => { if (!modal) setSection(s => Math.min(s + 1, TOTAL - 1)) }, [modal])

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (modal) {
        if (e.key === 'Escape') setModal(null)
        if (e.key === 'ArrowRight') setModal(m => m && { ...m, index: (m.index + 1) % m.study.images.length })
        if (e.key === 'ArrowLeft') setModal(m => m && { ...m, index: (m.index - 1 + m.study.images.length) % m.study.images.length })
        return
      }
      if (e.key === 'Enter' || e.key === ' ' || e.key === 'ArrowRight') { e.preventDefault(); advance() }
      if (e.key === 'ArrowLeft') setSection(s => Math.max(s - 1, 0))
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [modal, advance])

  const stop = (e: React.MouseEvent) => e.stopPropagation()

  return (
    <div
      onClick={advance}
      className="fixed inset-0 bg-gradient-to-b from-slate-50 to-white text-neutral-900 overflow-hidden cursor-pointer select-none"
      style={{ height: '100dvh' }}
    >
      {/* Top bar: logo + progress rail */}
      <div className="absolute top-0 inset-x-0 z-40 bg-white/80 backdrop-blur border-b border-neutral-200">
        <div className="flex items-center justify-between px-5 lg:px-8 py-3">
          <img src="/logo.png" alt="Core Conversion" className="h-7 w-auto" />
          <span className="text-xs font-bold tracking-widest text-neutral-500 bg-neutral-100 rounded-full px-3 py-1.5">
            {section + 1} / {TOTAL}
          </span>
        </div>
        {/* step rail */}
        <div className="hidden md:flex items-center gap-1 px-8 pb-2" onClick={stop}>
          {SECTIONS.map((s, i) => (
            <button
              key={s}
              onClick={() => setSection(i)}
              className="group flex-1 flex flex-col items-center gap-1"
              title={`${i + 1}. ${s}`}
            >
              <span className={`h-1 w-full rounded-full transition-colors ${i <= section ? 'bg-blue-600' : 'bg-neutral-200'}`} />
              <span className={`text-[10px] font-medium transition-colors ${i === section ? 'text-blue-600' : 'text-neutral-400 group-hover:text-neutral-600'}`}>{s}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Slide area */}
      <div className="h-full overflow-y-auto overscroll-contain px-5 pt-24 md:pt-32 pb-28 lg:px-10">
        <AnimatePresence mode="wait">
          <motion.div
            key={section}
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -18 }}
            transition={{ duration: 0.35 }}
            className="max-w-5xl mx-auto"
          >
            <Presenter section={section} />

            {/* 0 — Welcome / Agenda */}
            {section === 0 && (
              <div className="text-center max-w-3xl mx-auto">
                <span className="inline-block text-xs font-bold uppercase tracking-[0.3em] text-blue-600 mb-4">CCOMS Interactive Portfolio</span>
                <h1 className="text-4xl lg:text-6xl font-bold mb-5 text-neutral-900">Operators, Not Salesmen</h1>
                <p className="text-lg text-neutral-600 leading-relaxed mb-8">
                  CCOMS helps businesses increase visibility, credibility, and inquiries through hands-on digital
                  marketing, SEO, web development, Answer Engine Optimization, paid ads, and custom strategies
                  built around real business goals.
                </p>
                <div className="bg-white border border-neutral-200 rounded-2xl shadow-sm p-6 text-left max-w-xl mx-auto">
                  <p className="text-xs font-bold uppercase tracking-widest text-neutral-400 mb-3">What this tour covers · {TOTAL} steps</p>
                  <div className="grid grid-cols-2 gap-x-6 gap-y-2">
                    {SECTIONS.slice(1).map((s, i) => (
                      <div key={s} className="flex items-center gap-2 text-sm text-neutral-700">
                        <span className="w-5 h-5 rounded-full bg-blue-50 text-blue-600 text-[11px] font-bold flex items-center justify-center shrink-0">{i + 1}</span>
                        {s}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* 1 — Who We Are */}
            {section === 1 && (
              <div>
                <SlideHead title="Who We Are" sub="Core Conversion Digital Marketing Services (CCOMS)" />
                <div className="grid lg:grid-cols-5 gap-8 items-start">
                  <div className="lg:col-span-3 space-y-4 text-neutral-600 leading-relaxed">
                    <p>
                      CCOMS is a full-service digital marketing team founded and led by
                      <strong className="text-neutral-900"> John Paul Carrasco</strong>. For over 14 years, we’ve helped
                      businesses get found, build credibility, and turn attention into real inquiries — through work we
                      execute ourselves, not work we hand off and hope for the best on.
                    </p>
                    <p>
                      We’re operators, not salesmen. Every strategy we recommend is one our own in-house team can build,
                      ship, and stand behind. That’s how we’ve earned long-term partnerships instead of chasing quick
                      client turnover — our reputation is tied to results we can actually trace.
                    </p>
                    <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 text-sm text-blue-800 font-medium italic">
                      We identify what your business actually needs, then use the right services and tools to solve the
                      right problem — not a one-size-fits-all package.
                    </div>
                  </div>

                  <div className="lg:col-span-2 grid grid-cols-2 gap-3">
                    {[
                      { n: '14+', l: 'Years Experience' },
                      { n: '18', l: 'In-House Specialists' },
                      { n: '5', l: 'Core Disciplines' },
                      { n: '100%', l: 'Owned Execution' },
                    ].map(s => (
                      <div key={s.l} className="bg-white border border-neutral-200 rounded-2xl p-5 text-center shadow-sm">
                        <div className="text-3xl font-bold text-blue-600">{s.n}</div>
                        <div className="text-xs text-neutral-500 mt-1 font-medium">{s.l}</div>
                      </div>
                    ))}
                  </div>
                </div>

                <motion.div variants={stagger} initial="hidden" animate="visible" className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-6">
                  {ABOUT_VALUES.map(v => (
                    <motion.div key={v.title} variants={item} className="bg-white border border-neutral-200 rounded-2xl p-5 shadow-sm">
                      <div className="w-11 h-11 rounded-xl bg-blue-50 flex items-center justify-center mb-3"><v.icon className="w-5 h-5 text-blue-600" /></div>
                      <h3 className="font-bold mb-1 text-sm">{v.title}</h3>
                      <p className="text-xs text-neutral-600 leading-relaxed">{v.desc}</p>
                    </motion.div>
                  ))}
                </motion.div>
              </div>
            )}

            {/* 2 — The Team */}
            {section === 2 && (
              <div>
                <SlideHead title="Meet the Team" sub="In-house specialists across web development, SEO, ads, content, and design." />
                <div className="space-y-7">
                  {TEAM.map(group => (
                    <div key={group.dept}>
                      <h3 className="text-xs font-bold uppercase tracking-widest text-blue-600 mb-3">{group.dept}</h3>
                      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                        {group.members.map(m => (
                          <div key={m.slug} className="bg-white border border-neutral-200 rounded-2xl shadow-sm overflow-hidden flex flex-col">
                            <div className="aspect-[4/5] bg-neutral-100 overflow-hidden">
                              <img src={`/portfolio/team/${m.slug}.png`} alt={m.name} loading="lazy" className="w-full h-full object-cover object-center" />
                            </div>
                            <div className="px-3 py-4 text-center flex-1 flex flex-col justify-center">
                              <p className="font-bold text-sm text-neutral-900 leading-tight">{m.name}</p>
                              <p className="text-xs text-neutral-500 mt-1">{m.role}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 3 — Why CCOMS Exists */}
            {section === 3 && (
              <div>
                <SlideHead title="Why CCOMS Exists" sub="For businesses tired of providers who promise everything, outsource the work, and disappear." />
                <motion.div variants={stagger} initial="hidden" animate="visible" className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-red-50 border border-red-200 rounded-2xl p-5">
                    <h3 className="text-sm font-bold uppercase tracking-wider text-red-600 mb-4">What businesses get burned by</h3>
                    {BURNED.map(b => (
                      <motion.div key={b} variants={item} className="flex items-center gap-2.5 py-1.5 text-sm text-red-800/90"><X className="w-4 h-4 text-red-400 shrink-0" /> {b}</motion.div>
                    ))}
                  </div>
                  <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-5">
                    <h3 className="text-sm font-bold uppercase tracking-wider text-emerald-600 mb-4">What CCOMS stands for</h3>
                    {STANDS.map(s => (
                      <motion.div key={s} variants={item} className="flex items-center gap-2.5 py-1.5 text-sm text-emerald-800/90"><ShieldCheck className="w-4 h-4 text-emerald-500 shrink-0" /> {s}</motion.div>
                    ))}
                  </div>
                </motion.div>
              </div>
            )}

            {/* 4 — What We Help Fix */}
            {section === 4 && (
              <div>
                <SlideHead title="What We Help Fix" sub="The gaps that stop businesses from getting found, trusted, and contacted." />
                <motion.div variants={stagger} initial="hidden" animate="visible" className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {GAPS.map(g => (
                    <motion.div key={g.title} variants={item} className="bg-white border border-neutral-200 rounded-2xl p-5 shadow-sm">
                      <g.icon className="w-7 h-7 text-blue-600 mb-3" />
                      <h3 className="font-bold mb-1.5">{g.title}</h3>
                      <p className="text-sm text-neutral-600 leading-relaxed">{g.desc}</p>
                    </motion.div>
                  ))}
                  <motion.div variants={item} className="bg-blue-50 border border-blue-200 rounded-2xl p-5 flex items-center">
                    <p className="text-sm font-medium text-blue-800 italic">“Once we know the gaps, we recommend the right services — not the other way around.”</p>
                  </motion.div>
                </motion.div>
              </div>
            )}

            {/* 5 — Services */}
            {section === 5 && (
              <div>
                <SlideHead title="Services We Provide" sub="Full digital marketing support, tailored around what the business actually needs." />
                <motion.div variants={stagger} initial="hidden" animate="visible" className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {SERVICES.map(s => (
                    <motion.div key={s.title} variants={item} className="bg-white border border-neutral-200 rounded-2xl p-5 shadow-sm hover:border-blue-300 transition-colors">
                      <s.icon className="w-7 h-7 text-blue-600 mb-3" />
                      <h3 className="font-bold mb-1.5">{s.title}</h3>
                      <p className="text-sm text-neutral-600 leading-relaxed">{s.desc}</p>
                    </motion.div>
                  ))}
                  <motion.div variants={item} className="bg-blue-600 text-white rounded-2xl p-5 flex items-center">
                    <p className="text-sm font-medium italic">We identify what your business actually needs, then use the right services and tools to solve the right problem.</p>
                  </motion.div>
                </motion.div>
              </div>
            )}

            {/* 6 — Tools */}
            {section === 6 && (
              <div onClick={stop} className="text-center">
                <SlideHead title="Tools & Systems We Use" sub="The right tools depend on the job — execution always starts with the client’s goals." />
                <div className="flex flex-wrap gap-2 mb-8 justify-center">
                  {TOOL_GROUPS.map(g => (
                    <button key={g.key} onClick={(e) => { e.stopPropagation(); setToolTab(g.key) }}
                      className={`px-5 py-2.5 rounded-full text-sm font-semibold transition-colors ${toolTab === g.key ? 'bg-blue-600 text-white' : 'bg-white text-neutral-600 border border-neutral-200 hover:border-blue-300'}`}>
                      {g.label}
                    </button>
                  ))}
                </div>
                <AnimatePresence mode="wait">
                  <motion.div key={toolTab} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.22 }}
                    className="grid grid-cols-2 sm:grid-cols-3 gap-4 max-w-3xl mx-auto">
                    {TOOL_GROUPS.find(g => g.key === toolTab)!.tools.map(t => <ToolCard key={t.name} tool={t} />)}
                  </motion.div>
                </AnimatePresence>
              </div>
            )}

            {/* 7 — Proof */}
            {section === 7 && (
              <div>
                <SlideHead title="Proof of Execution" sub="Real work, real projects, and proof points from CCOMS case studies." />
                <motion.div variants={stagger} initial="hidden" animate="visible" className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {STUDIES.map(st => (
                    <motion.div key={st.title} variants={item} onClick={stop} className="bg-white rounded-2xl overflow-hidden border border-neutral-200 shadow-sm flex flex-col cursor-default">
                      <div className="h-36 overflow-hidden bg-neutral-100"><img src={st.thumb} alt={st.title} loading="lazy" className="w-full h-full object-cover object-top" /></div>
                      <div className="p-4 flex flex-col flex-1">
                        <span className="text-[10px] font-bold uppercase tracking-widest text-blue-600 mb-1">{st.niche}</span>
                        {st.liveUrl
                          ? <a href={st.liveUrl} target="_blank" rel="nofollow noopener noreferrer" className="font-bold text-sm mb-1.5 inline-flex items-center gap-1 hover:text-blue-600">{st.title} <ExternalLink className="w-3 h-3 text-blue-500" /></a>
                          : <h3 className="font-bold text-sm mb-1.5">{st.title}</h3>}
                        <p className="text-xs text-neutral-600 leading-relaxed mb-2">{st.done}</p>
                        <p className="text-xs font-semibold text-emerald-700 mb-3">{st.proof}</p>
                        <div className="mt-auto flex gap-2">
                          <button onClick={(e) => { e.stopPropagation(); setModal({ study: st, index: 0 }) }} className="flex-1 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold py-2 rounded-lg transition-colors">View Proof</button>
                          {st.highRes && <a href={st.highRes} target="_blank" rel="noopener noreferrer" onClick={stop} className="flex-1 text-center border border-blue-600 text-blue-600 hover:bg-blue-50 text-xs font-bold py-2 rounded-lg transition-colors">High-Res</a>}
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </motion.div>
              </div>
            )}

            {/* 8 — Approach */}
            {section === 8 && (
              <div>
                <SlideHead title="How We Approach Your Business" sub="We don’t start with a package. We start with the business problem." />
                <p className="text-sm text-neutral-600 leading-relaxed max-w-3xl mb-6">
                  If the audience is active on TikTok, the strategy shouldn’t blindly force SEO. If search demand is stronger,
                  Google visibility may become the priority. The channel follows the market — not the agency’s convenience.
                </p>
                <motion.div variants={stagger} initial="hidden" animate="visible" className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {FRAMEWORK.map((f, i) => (
                    <motion.div key={f.title} variants={item} className="bg-white border border-neutral-200 rounded-2xl p-5 shadow-sm">
                      <div className="flex items-center gap-2 mb-2"><span className="w-6 h-6 rounded-full bg-blue-600 text-white text-xs font-bold flex items-center justify-center">{i + 1}</span><f.icon className="w-5 h-5 text-blue-600" /></div>
                      <h3 className="font-bold mb-1">{f.title}</h3>
                      <p className="text-sm text-neutral-600 leading-relaxed">{f.desc}</p>
                    </motion.div>
                  ))}
                </motion.div>
              </div>
            )}

            {/* 9 — How We Work */}
            {section === 9 && (
              <div>
                <SlideHead title="How We Work" sub="A clear process from discovery to execution." />
                <motion.div variants={stagger} initial="hidden" animate="visible" className="space-y-3 max-w-3xl mx-auto">
                  {PROCESS.map((p, i) => (
                    <motion.div key={p.title} variants={item} className="flex items-start gap-4 bg-white border border-neutral-200 rounded-2xl p-5 shadow-sm">
                      <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center shrink-0"><p.icon className="w-5 h-5 text-white" /></div>
                      <div><h3 className="font-bold mb-0.5">{i + 1}. {p.title}</h3><p className="text-sm text-neutral-600 leading-relaxed">{p.desc}</p></div>
                    </motion.div>
                  ))}
                  <motion.div variants={item} className="text-center pt-6">
                    <p className="text-neutral-500 italic mb-5">Built for long-term partnerships, not quick client turnover.</p>
                    <a href="/" onClick={stop} className="inline-flex items-center gap-2 bg-blue-600 text-white hover:bg-blue-700 font-bold px-6 py-3 rounded-xl transition-colors">
                      <Globe className="w-4 h-4" /> Visit ccoms.ph
                    </a>
                  </motion.div>
                </motion.div>
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Bottom bar: hint + next */}
      <div className="absolute bottom-0 inset-x-0 z-40 flex items-center justify-between gap-4 px-5 py-4 lg:px-8 bg-gradient-to-t from-white via-white/90 to-transparent pointer-events-none">
        <span className="text-xs text-neutral-400">{!isLast && 'Click, tap, or press → to continue'}</span>
        {!isLast && (
          <button onClick={(e) => { e.stopPropagation(); advance() }}
            className="pointer-events-auto inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold px-5 py-2.5 rounded-xl shadow-lg transition-colors shrink-0">
            {NEXT_LABELS[section]} <ArrowRight className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Proof lightbox */}
      <AnimatePresence>
        {modal && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={(e) => { e.stopPropagation(); setModal(null) }}
            className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4 cursor-default">
            <div className="relative max-w-5xl w-full" onClick={stop}>
              <div className="flex items-center justify-between mb-3">
                <div>
                  <h3 className="font-bold text-white">{modal.study.title}</h3>
                  {modal.study.images.length > 1 && <p className="text-xs text-white/60">{modal.index + 1} of {modal.study.images.length}</p>}
                </div>
                <div className="flex items-center gap-2">
                  {modal.study.highRes && <a href={modal.study.highRes} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold px-3.5 py-2 rounded-lg transition-colors">View High-Res Proofs <ExternalLink className="w-3.5 h-3.5" /></a>}
                  <button onClick={() => setModal(null)} className="p-2 bg-white/10 hover:bg-white/20 rounded-lg text-white transition-colors"><X className="w-5 h-5" /></button>
                </div>
              </div>
              <div className="relative bg-neutral-900 rounded-2xl overflow-hidden max-h-[75vh] flex items-center justify-center">
                <img src={modal.study.images[modal.index]} alt={`${modal.study.title} proof ${modal.index + 1}`} className="max-h-[75vh] w-auto max-w-full object-contain" />
                {modal.study.images.length > 1 && (
                  <>
                    <button onClick={() => setModal(m => m && { ...m, index: (m.index - 1 + m.study.images.length) % m.study.images.length })} className="absolute left-3 top-1/2 -translate-y-1/2 p-2.5 bg-black/60 hover:bg-black/80 rounded-full text-white transition-colors"><ChevronLeft className="w-5 h-5" /></button>
                    <button onClick={() => setModal(m => m && { ...m, index: (m.index + 1) % m.study.images.length })} className="absolute right-3 top-1/2 -translate-y-1/2 p-2.5 bg-black/60 hover:bg-black/80 rounded-full text-white transition-colors"><ChevronRight className="w-5 h-5" /></button>
                  </>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

'use client'

import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Search, X, ChevronLeft, ChevronRight, ExternalLink, ArrowRight, Globe,
  Code2, Megaphone, Layers, Smartphone, Mail, Phone, ShieldCheck, Zap,
  Rocket, Users, BarChart3, ShoppingCart, Star, Quote, FileDown
} from 'lucide-react'

/* ═══════════════════════════ Slides ═══════════════════════════ */

const SLIDES = [
  'Cover', 'Overview', 'About Paul', 'About Us', 'Track Record', 'The Team',
  'Services', 'Web Dev', 'SEO Results', 'Mobile App', 'Our Offer', 'Contact',
]
const TOTAL = SLIDES.length

const SPEECHES = [
  'Hi, I’m Paul — founder of Core Conversion. Thanks for taking the time. This short deck walks you through who we are, what we’ve built, and the proof behind it.',
  'Five parts, a few minutes. Click anywhere — or use the arrow keys — and I’ll walk you through it.',
  'A quick word about me first, so you know who’s actually behind the work.',
  'CCOMS didn’t start as an agency. It started as one person doing the work — and grew around one principle: delivery before everything else.',
  'Fourteen years, four eras. Here’s how the operation evolved.',
  'These are the people who plan, build, and execute — our own in-house team, no outsourcing.',
  'We don’t sell channels. We solve problems — with whichever of these services the problem actually calls for.',
  'Enough talk — here’s the work. Tap any project to open the full challenge, solution, and results.',
  'And here’s what we’ve done in search — real ranking screenshots, real niches, including some of the hardest ones out there.',
  'We build for mobile too. QR Seal is a client platform we engineered end to end — SaaS web app, mobile app, and the AI engine behind it.',
  'Here’s how engagements are structured. Transparent, one-time fees — no hidden charges.',
  'That’s the portfolio. If what you saw fits what you need, the easiest next step is to book a discovery call — or reach us directly below.',
]

const AVATAR_SIDE: ('left' | 'right' | 'center')[] =
  ['center', 'left', 'right', 'left', 'right', 'left', 'right', 'left', 'right', 'left', 'right', 'center']

const NEXT_LABELS = [
  'Start Presentation', 'Next: About Paul', 'Next: About Us', 'Next: Track Record',
  'Next: The Team', 'Next: Services', 'Next: Web Dev Cases', 'Next: SEO Results',
  'Next: Mobile App', 'Next: Our Offer', 'Next: Contact', '',
]

/* ═══════════════════════════ Data ═══════════════════════════ */

const TIMELINE = [
  { era: '2012 – 2014', text: 'Built on high-intensity technical SEO and the "Clean-Code" development philosophy.' },
  { era: '2015 – 2018', text: 'Officially founded CCOMS — a full brick-and-mortar agency with a team of 18.' },
  { era: '2019 – 2024', text: 'Served as chief digital expert for a North American multi-platform system, leading cross-dimensional integration and growth strategies.' },
  { era: '2025+', text: 'The Core Conversion Model: a senior-led, high-conversion growth architecture built for B2B clients.' },
]

const TEAM_DEPTS = [
  {
    key: 'admin', label: 'Administrative', members: [
      { slug: 'carrasco-joylynn', name: 'Joylynn Carrasco', role: 'HR Manager' },
      { slug: 'sequia-rochelle', name: 'Rochelle Sequia', role: 'HR Assistant' },
      { slug: 'alasgas-tanya', name: 'Tanya Alasgas', role: 'HR Assistant' },
      { slug: 'ramos-lhean', name: 'Lhean Ramos', role: 'Finance' },
    ],
  },
  {
    key: 'tech', label: 'Technology', members: [
      { slug: 'arevia-maria', name: 'Maria Geneva Arevia', role: 'Team Lead — Web Dev / Programmer' },
      { slug: 'mahlina-roel', name: 'Roel Mahlina', role: 'Web Development / SEO' },
      { slug: 'cahipo-jules', name: 'Jules Cahipo', role: 'Software Engineer' },
      { slug: 'capunitan-jason', name: 'Jason Capunitan', role: 'Programmer' },
    ],
  },
  {
    key: 'content', label: 'Content', members: [
      { slug: 'bodoa-jerome', name: 'Jerome David Bodoa', role: 'Team Lead — Content / Copy' },
      { slug: 'mangerra-venee', name: 'Venee Mangerra', role: 'Content Specialist' },
      { slug: 'garcia-patrick', name: 'Patrick Garcia', role: 'Content Specialist' },
      { slug: 'alibabang-princess', name: 'Princess Alibabang', role: 'Social Media Specialist' },
    ],
  },
  {
    key: 'marketing', label: 'Marketing', members: [
      { slug: 'echeveria-marie', name: 'Marie Echeveria', role: 'Team Lead — Ads / PPC' },
      { slug: 'abayani-judith', name: 'Judith Abayani', role: 'Ads Specialist / Meta' },
      { slug: 'rosales-harvey', name: 'Harvey Rosales', role: 'SEO' },
      { slug: 'almendral-jade', name: 'Jade Almendral', role: 'SEO' },
    ],
  },
  {
    key: 'design', label: 'Design & Operations', members: [
      { slug: 'santos-kier', name: 'Kier Santos', role: 'Graphics Designer' },
      { slug: 'ochos-ronron', name: 'Ron-ron Ochos', role: 'Liaison Officer' },
    ],
  },
]

const SERVICES = [
  { icon: Code2, title: 'Custom Website Development', desc: 'Credibility, speed, structure, and inquiry generation — engineered, not templated.' },
  { icon: Search, title: 'SEO / AEO / GEO', desc: 'Technical search dominance across classic Google, answer engines, and AI-assisted discovery.' },
  { icon: Layers, title: 'Digital Marketing', desc: 'The full spectrum — strategy, content, tracking, and channel execution built around your market.' },
  { icon: Smartphone, title: 'Mobile App Development', desc: 'Production-grade iOS/Android apps, from architecture to app-store delivery.' },
  { icon: Megaphone, title: 'Paid Ads Management', desc: 'Google, Facebook / Instagram, TikTok, and LinkedIn — managed for return, not activity.' },
]

interface WebCase {
  title: string
  tag: string
  image: string
  challenge: string
  solution: { h: string; d: string }[]
  results: string[]
  liveUrl?: string
}
const WEB_CASES: WebCase[] = [
  {
    title: 'Efficient Power Solutions',
    tag: 'Landing Page + Order System',
    image: '/case-studies/efficientpower-solutions.png',
    challenge: 'The client arrived with an AI-generated ad concept destined for a paid campaign — visually ambitious, but built without web standards in mind: broken element placement, assets that never existed, and no thought given to how it would actually convert on a phone.',
    solution: [
      { h: 'Standards-First Rebuild', d: 'Re-architected the AI mockup into a clean, standards-compliant layout without losing the original creative vision.' },
      { h: 'Missing Asset Production', d: 'Produced the real product imagery and graphic assets the AI concept only implied.' },
      { h: 'Bonus: Order Dashboard', d: 'A lightweight backend so the client monitors every order in one place.' },
      { h: 'Bonus: Instant Email Alerts', d: 'Automated notifications the moment a new order comes in.' },
    ],
    results: [
      'Live COD campaign page serving the Philippine market',
      'Pixel-tuned for desktop and mobile conversion',
      'Entry-level package — premium-level execution',
    ],
    liveUrl: 'https://efficientpower-solutions.com/',
  },
  {
    title: 'QR Seal',
    tag: 'Next-Gen QR SaaS + AI Art',
    image: '/case-studies/qrseal-hero.png',
    challenge: 'Traditional QR codes present three major challenges for premium brands: high visual intrusion, vulnerability to counterfeiting, and low user engagement. The client needed QR codes that strengthen both brand identity and digital security.',
    solution: [
      { h: 'AI-Generated Branded QR Art', d: 'Leveraging Stable Diffusion with a customized ControlNet workflow.' },
      { h: 'Encrypted "Seal" Authentication', d: 'Every artistic QR code is unique and validated through secure server-side verification.' },
      { h: 'App + Web Ecosystem', d: 'A synchronized dual-platform architecture — the mobile app is the "Key," the web platform the "Vault."' },
      { h: 'Custom API Engine', d: 'Scalable backend automating bulk generation of AI-powered artistic QR codes.' },
    ],
    results: [
      'Industry-first "Trust-as-Art" authentication system',
      'Significantly increased scan engagement via AI-branded visuals',
      '100% tamper-proof data integrity with server-side verification',
    ],
  },
  {
    title: 'Greater Property Group',
    tag: 'Website Redesign — Real Estate',
    image: '/case-studies/gpg-hero.png',
    challenge: 'The GPG website suffered from critical security vulnerabilities — including malware injection — alongside a fragmented user experience that hindered lead conversion.',
    solution: [
      { h: 'End-to-End Security Remediation', d: 'Comprehensive manual audit of the entire codebase to remove malicious backdoors and malware.' },
      { h: 'Performance Engineering', d: 'Mobile-first frontend rebuild; PHP/server backend optimized for large-scale IDX/MLS data sync.' },
      { h: 'Clean Code Architecture', d: 'Replaced bloated third-party plugins with lightweight, custom-built solutions.' },
    ],
    results: [
      '100% secure platform, free of malware and critical vulnerabilities',
      'Page loads under 2 seconds — better UX and SEO',
      'A scalable lead-generation hub for the North American market',
    ],
  },
  {
    title: 'USA Peptide Shop',
    tag: 'High-Performance E-Commerce',
    image: '/case-studies/peptide-hero.png',
    challenge: 'The client needed an e-commerce platform combining pharmaceutical-grade trust with the speed and convenience expected of a modern consumer brand.',
    solution: [
      { h: 'Spectra-Core Architecture', d: 'Zero-bloat build on native Spectra blocks — none of the overhead of Divi or Elementor.' },
      { h: 'Automated Compliance Engine', d: 'Seamless 21+ age verification with dynamic Research-Use-Only messaging for legal-grade protection.' },
      { h: 'Transparency Hub', d: 'Custom Certificate-of-Analysis database — batch-specific HPLC and MS lab reports on every product page.' },
    ],
    results: [
      'Ultra-fast storefront optimized for performance and trust',
      'Scientific research bridged with modern digital retail',
      'Secure, high-converting shopping experience',
    ],
  },
  {
    title: 'CCOMS Revamp',
    tag: 'Website Redesign & Brand Transformation',
    image: '/case-studies/ccoms-hero.png',
    challenge: 'Our own site no longer reflected the technical depth of the platforms we build for clients — it lacked the premium UI/UX, AI-powered experiences, and technical storytelling that had become standard in our work.',
    solution: [
      { h: 'Next-Generation Design Language', d: 'Modern interface with custom CSS animation and motion design to showcase front-end capability.' },
      { h: 'Case-Study-First Architecture', d: 'Information architecture rebuilt around in-depth project stories instead of static galleries.' },
      { h: 'Unified Lead Generation', d: 'Streamlined capture pipeline from visitor engagement to sales qualification.' },
    ],
    results: [
      'Average session duration up over 300%',
      'Repositioned CCOMS for complex, high-impact projects',
      'A scalable platform that proves the expertise it sells',
    ],
  },
]

interface SeoCase {
  title: string
  context: string
  before: string
  after: string
  strategy: string
  images: string[]
  highRes?: string
}
const SEO_CASES: SeoCase[] = [
  {
    title: 'Niche: Real Estate',
    context: 'A high-performing agent trapped at a 200–300 visit-per-month plateau, struggling to break through the "local noise" of established franchises.',
    before: 'Invisible in high-intent local searches — relying on luck and low-volume traffic that failed to convert into sign-ups or listings.',
    after: 'A complete shift in search presence. Traffic surged, high-value inquiries rose directly, and agent sign-ups jumped.',
    strategy: 'Competitor Gap Analysis to find exactly what the top 1% were doing, then a Freshness-First Content Campaign tuned to Google’s freshness algorithm with fully optimized on-page technicals.',
    images: Array.from({ length: 12 }, (_, i) => `/case-studies/proofs/real-estate-proof-${i + 1}.png`),
    highRes: 'https://photos.app.goo.gl/iphFUGCQTFqznsMf8',
  },
  {
    title: 'Niche: Pharma',
    context: 'A peptides e-commerce site (Exact Match Domain) slowly collapsing under its own success and a quiet algorithmic penalty.',
    before: 'No manual actions — yet rankings in a death spiral from an Over-Optimization Penalty: excessive exact-match anchors and keyword stuffing.',
    after: 'Penalty lifted at the next core update. The site went on to dominate short-tail competitive terms, restoring traffic to a stable baseline.',
    strategy: 'Anchor Profile Dilution, treated like an ORM project — diversifying the backlink profile with branded and generic anchors while rewording on-page content to restore semantic balance.',
    images: ['/case-studies/proofs/pharma-proof-1.png', '/case-studies/proofs/pharma-proof-2.png', '/case-studies/proofs/pharma-proof-3.png'],
    highRes: 'https://photos.app.goo.gl/2NzwqW1U47gU3s8R9',
  },
  {
    title: 'Niche: Legal',
    context: 'Two of the most expensive sub-sectors in law — high-stakes NYC family law and national financial litigation.',
    before: 'Buried by multi-practice conglomerates with massive ad budgets; the financial-litigation firm was stuck on Page 3 with weak internal linking and failing mobile scores.',
    after: 'Top 3 for "prenup lawyer ny." Financial litigation moved Page 3 → top of Page One nationally — outranking firms with 10× the budget.',
    strategy: 'A "Micro-Niche Authority" campaign: an exhaustive prenup content silo with E-E-A-T hard-coded via Schema, plus a technical Pillar ecosystem of AEO-optimized articles built for both human researchers and AI engines.',
    images: ['/case-studies/proofs/legal-proof-1.png', '/case-studies/proofs/legal-proof-2.png'],
    highRes: 'https://photos.app.goo.gl/rodRcMNNHUktiZnf6',
  },
  {
    title: 'Niche: Entertainment (London)',
    context: 'An early-stage CCOMS project in one of the world’s most aggressive and competitive "grey-hat" niches.',
    before: 'Entrenched competitors had dominated for years with heavy, banner-laden pages and outdated reciprocal linking schemes.',
    after: 'Page One for the most competitive keywords in the UK — outranking giants by being faster, cleaner, and more relevant.',
    strategy: 'Ignored the old-school playbook: a lightweight HTML/CSS engine built from scratch, topical authority through deep content, and a clean keyword-rich internal linking structure favoring crawl efficiency.',
    images: ['/case-studies/proofs/escorts-proof-1.jpg'],
    highRes: 'https://photos.app.goo.gl/D6dAeSumgT8GEx2BA',
  },
]

const CORE_TIERS = [
  { name: 'Landing Page', price: '₱5,995', promo: '', badge: '', grad: 'from-slate-600 to-slate-800', bullets: ['1 high-impact custom page', 'Mobile-friendly & secure (SSL)', 'Visitor tracking + 1 pro email', '1 year fast hosting'] },
  { name: 'Starter', price: '₱14,995', promo: '', badge: '', grad: 'from-blue-500 to-blue-600', bullets: ['Up to 5 pages, easy to self-edit', 'Basic CMS + on-page SEO', '5 pro email addresses', '1 year fast hosting'] },
  { name: 'Professional', price: '₱24,995', promo: '10% OFF', badge: '★ MOST POPULAR', grad: 'from-cyan-400 to-teal-500', bullets: ['Up to 25 custom pages, robust CMS', 'Pro SEO + custom logo + blog', 'Google Maps · 10 pro emails', 'Weekly backups + priority support'] },
  { name: 'Business', price: '₱49,995', promo: '20% OFF', badge: 'FULL PACKAGE', grad: 'from-purple-600 to-violet-700', bullets: ['Up to 50 pages + full brand identity', 'Advanced SEO + Search Console', 'Advanced analytics · 20 pro emails', '1 yr hosting + free domain'] },
]
const ECOM_TIERS = [
  { name: 'E-commerce Basic', price: '₱15,995', promo: '', badge: '', grad: 'from-emerald-500 to-teal-600', bullets: ['Store up to 50 products', 'Secure checkout, blog & newsletter', '10 pro emails · priority support', '1 yr hosting + free domain'] },
  { name: 'E-commerce Advanced', price: '₱59,995', promo: '', badge: '★ BEST VALUE', grad: 'from-orange-500 to-red-500', bullets: ['200+ products, fully custom design', 'Advanced store SEO + live chat (AI)', 'Custom logo · 25 pro emails', 'Weekly backups + chat support'] },
]

const META_TIERS = [
  {
    name: 'Trial Meta Ads', was: '₱3,995', price: '₱2,995', badge: '★ LIMITED OFFER', grad: 'from-blue-500 to-blue-700',
    chips: ['2 Weeks', 'Up to 2 Creatives', 'Basic Setup'],
    bullets: ['Basic Meta campaign + audience setup', 'Basic ad copywriting & budget monitoring', 'Weekly performance report every Friday', 'End-of-trial campaign recommendation'],
  },
  {
    name: 'Basic Meta Ads', was: '₱5,995', price: '₱4,995', badge: '★ SPECIAL RATE', grad: 'from-teal-500 to-cyan-600',
    chips: ['1 Month', 'Up to 5 Creatives', 'Basic Optimization'],
    bullets: ['Campaign setup + basic optimization', 'Audience targeting, research & analysis', 'Ad copywriting + Auto (AI) responses — basic', 'Weekly report + campaign recommendations'],
  },
  {
    name: 'Startup Meta Ads', was: '₱14,995', price: '₱13,995', badge: '★ LIMITED OFFER', grad: 'from-purple-500 to-violet-700',
    chips: ['3 Months', 'Up to 15 Creatives', 'AI Response Setup'],
    bullets: ['Setup + ongoing optimization & refinement', 'Deeper research & creative testing guidance', 'Landing page / offer recommendation', 'Weekly reports + monthly strategy adjustment'],
  },
  {
    name: 'Professional Meta Ads', was: '₱27,995', price: '₱26,995', badge: '★ SPECIAL RATE', grad: 'from-orange-500 to-red-500',
    chips: ['6 Months', 'Up to 25 Creatives', 'Reports Mon & Fri'],
    bullets: ['Advanced optimization + audience refinement', 'Competitor ad angle review + angle testing', 'AI responses + landing/offer recommendations', 'Twice-weekly reports + monthly strategy'],
  },
  {
    name: 'Business Meta Ads', was: '₱47,995', price: '₱46,995', badge: '★ SPECIAL RATE', grad: 'from-emerald-500 to-green-700',
    chips: ['1 Year', 'Up to 35 Creatives', 'Reports Mon · Wed · Fri'],
    bullets: ['Full setup + active optimization & scaling', 'Comprehensive research + retargeting recs', 'Priority campaign support + AI responses', 'Reports 3× weekly + monthly strategy'],
  },
]

const APP_TIERS = [
  {
    name: 'App MVP Launch', price: '₱39,995', sub: '2-term installment', badge: 'ONE-TIME BUILD', grad: 'from-sky-500 to-blue-600',
    chips: ['iOS + Android', 'Up to 8 Screens'],
    bullets: ['One codebase for both platforms', 'User login + push notifications', 'Basic backend + lite admin panel', 'App-store submission + 30-day support'],
  },
  {
    name: 'App Growth', price: '₱89,995', sub: '2-term installment', badge: 'ONE-TIME BUILD', grad: 'from-indigo-500 to-blue-700',
    chips: ['Up to 20 Screens', 'Payments + Analytics'],
    bullets: ['Custom backend + database', 'Payment integration (GCash / cards)', 'Analytics + full admin dashboard', '90-day support'],
  },
  {
    name: 'App Enterprise', price: '₱299,995', sub: '2-term installment', badge: '★ ADVANCED SCALE + AI', grad: 'from-slate-700 to-slate-900',
    chips: ['Unlimited Screens', 'AI Features'],
    bullets: ['Third-party API integrations', 'AI features (chat, automation) + offline mode', 'Hardened security + CI/CD pipeline', '6-month priority support'],
  },
  {
    name: 'App Care Plan', price: '₱3,995', sub: 'per month', badge: 'MONTHLY ADD-ON', grad: 'from-orange-400 to-amber-500',
    chips: ['After Launch'],
    bullets: ['Updates + OS-compatibility fixes', 'Monitoring', 'Minor changes', 'Perfect as an add-on after launch'],
  },
]

const DM_TIERS = [
  {
    name: 'Growth Foundation', price: '₱15,000–25,000', sub: 'typical investment · per month', badge: 'MONTHLY PARTNERSHIP', grad: 'from-sky-500 to-cyan-600',
    desc: 'Ideal for businesses that need stronger online visibility and credibility.',
    capLabel: 'Typical capabilities include',
    bullets: ['SEO Foundation', 'Google Business Profile Optimization', 'Content Strategy', 'Website Improvements', 'Analytics & Tracking', 'Monthly Growth Review'],
    note: '',
  },
  {
    name: 'Growth Accelerator', price: '₱30,000–50,000', sub: 'typical investment · per month', badge: '★ MOST CHOSEN', grad: 'from-blue-600 to-indigo-600',
    desc: 'Ideal for businesses seeking more consistent inquiries and lead generation.',
    capLabel: 'Capabilities may include',
    bullets: ['Advanced SEO', 'Paid Advertising', 'Landing Pages', 'Conversion Optimization', 'Email Marketing (when appropriate)', 'AI SEO', 'Growth Reviews & Recommendations'],
    note: '',
  },
  {
    name: 'Market Leadership', price: 'Custom', sub: 'custom investment · by engagement', badge: 'MARKET DOMINATION', grad: 'from-violet-600 to-purple-800',
    desc: 'Designed for businesses seeking long-term digital leadership.',
    capLabel: 'May include',
    bullets: ['AI Search Optimization', 'Authority Content', 'Marketing Automation', 'Multi-channel Campaigns', 'Advanced Analytics', 'Executive Growth Reviews', 'Priority Implementation'],
    note: 'Capabilities are selected based on your business objectives and growth opportunities.',
  },
]

/* ═══════════════════════════ Animations ═══════════════════════════ */

const stagger = { hidden: {}, visible: { transition: { staggerChildren: 0.1, delayChildren: 0.55 } } }
const item = { hidden: { opacity: 0, y: 18 }, visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: 'easeOut' } } }

/* ═══════════════════════════ Components ═══════════════════════════ */

function Presenter({ slide, dark = false }: { slide: number; dark?: boolean }) {
  const side = AVATAR_SIDE[slide]
  const wrap = side === 'center' ? 'justify-center flex-col items-center text-center' : side === 'right' ? 'flex-row-reverse ml-auto' : 'mr-auto'
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.45 }}
      className={`flex items-end gap-3 mb-6 max-w-2xl ${wrap}`}
    >
      <img src="/portfolio/paul-avatar.png" alt="Paul — CCOMS"
        className={`rounded-full object-cover shadow-lg shrink-0 border-2 ${dark ? 'border-white/70' : 'border-blue-500'} ${side === 'center' ? 'w-24 h-24' : 'w-14 h-14'}`} />
      <motion.div
        initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.4, delay: 0.28 }}
        className={`relative rounded-2xl px-4 py-3 shadow-xl text-sm leading-relaxed border text-left
          ${dark ? 'bg-white/95 text-neutral-800 border-white/40' : 'bg-white text-neutral-700 border-neutral-200'}
          ${side === 'right' ? 'rounded-br-none' : side === 'center' ? '' : 'rounded-bl-none'}`}
      >
        {SPEECHES[slide]}
      </motion.div>
    </motion.div>
  )
}

function SlideTitle({ kicker, title, sub }: { kicker?: string; title: string; sub?: string }) {
  return (
    <div className="mb-6">
      {kicker && <span className="text-[11px] font-bold uppercase tracking-[0.25em] text-cyan-600 block mb-1">{kicker}</span>}
      <h2 className="text-3xl lg:text-4xl font-bold text-neutral-900">{title}</h2>
      {sub && <p className="text-neutral-500 mt-1.5">{sub}</p>}
    </div>
  )
}

/* ═══════════════════════════ Page ═══════════════════════════ */

export default function PortfolioPage() {
  const [slide, setSlide] = useState(0)
  const [dept, setDept] = useState('admin')
  const [tier, setTier] = useState<'core' | 'ecom' | 'apps' | 'dm' | 'meta'>('core')
  const [webCase, setWebCase] = useState<WebCase | null>(null)
  const [proof, setProof] = useState<{ c: SeoCase; i: number } | null>(null)

  const modalOpen = !!(webCase || proof)
  const isLast = slide === TOTAL - 1
  const isCover = slide === 0

  const advance = useCallback(() => { if (!modalOpen) setSlide(s => Math.min(s + 1, TOTAL - 1)) }, [modalOpen])

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (modalOpen) {
        if (e.key === 'Escape') { setWebCase(null); setProof(null) }
        if (proof) {
          if (e.key === 'ArrowRight') setProof(p => p && { ...p, i: (p.i + 1) % p.c.images.length })
          if (e.key === 'ArrowLeft') setProof(p => p && { ...p, i: (p.i - 1 + p.c.images.length) % p.c.images.length })
        }
        return
      }
      if (e.key === 'Enter' || e.key === ' ' || e.key === 'ArrowRight') { e.preventDefault(); advance() }
      if (e.key === 'ArrowLeft') setSlide(s => Math.max(s - 1, 0))
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [modalOpen, proof, advance])

  const stop = (e: React.MouseEvent) => e.stopPropagation()

  return (
    <div
      onClick={advance}
      className="fixed inset-0 overflow-hidden cursor-pointer select-none bg-gradient-to-br from-blue-800 via-blue-600 to-cyan-500"
      style={{ height: '100dvh' }}
    >
      {/* brand backdrop flourishes */}
      <div className="pointer-events-none absolute -top-40 -left-40 w-[36rem] h-[36rem] rounded-full border border-white/10" />
      <div className="pointer-events-none absolute -bottom-52 -right-52 w-[44rem] h-[44rem] rounded-full border border-white/10" />
      <div className="pointer-events-none absolute top-1/3 right-1/4 w-64 h-64 bg-cyan-300/20 rounded-full blur-3xl" />

      {/* top bar */}
      <div className="absolute top-0 inset-x-0 z-40 px-4 lg:px-8 pt-3">
        <div className="flex items-center justify-between">
          <img src="/logo.png" alt="Core Conversion" className="h-7 w-auto brightness-0 invert drop-shadow" />
          <div className="flex items-center gap-2" onClick={stop}>
            <a href="/portfolio/CCOMS-Portfolio.pdf" download="CCOMS-Portfolio.pdf"
              className="flex items-center gap-1.5 text-xs font-bold text-white bg-white/15 hover:bg-white/25 border border-white/25 rounded-full px-3 py-1.5 backdrop-blur transition-colors">
              <FileDown className="w-3.5 h-3.5" /> PDF
            </a>
            <span className="text-xs font-bold tracking-widest text-white bg-white/15 border border-white/25 rounded-full px-3 py-1.5 backdrop-blur">
              {slide + 1} / {TOTAL}
            </span>
          </div>
        </div>
        {/* step rail */}
        <div className="hidden md:flex items-center gap-1 mt-2" onClick={stop}>
          {SLIDES.map((s, i) => (
            <button key={s} onClick={() => setSlide(i)} title={`${i + 1}. ${s}`} className="group flex-1 flex flex-col items-center gap-1">
              <span className={`h-1 w-full rounded-full transition-colors ${i <= slide ? 'bg-white' : 'bg-white/25'}`} />
              <span className={`text-[9px] font-semibold tracking-wide transition-colors ${i === slide ? 'text-white' : 'text-white/50 group-hover:text-white/80'}`}>{s}</span>
            </button>
          ))}
        </div>
      </div>

      {/* slide card */}
      <div className="absolute inset-0 flex items-center justify-center px-3 pt-20 md:pt-24 pb-20 lg:px-10">
        <AnimatePresence mode="wait">
          <motion.div
            key={slide}
            initial={{ opacity: 0, x: 60, scale: 0.98 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: -60, scale: 0.98 }}
            transition={{ duration: 0.35, ease: 'easeOut' }}
            className={`w-full max-w-6xl h-full rounded-2xl shadow-2xl overflow-y-auto overscroll-contain
              ${isCover ? 'bg-white/10 backdrop-blur-xl border border-white/25' : 'bg-white'}`}
          >
            <div className="p-6 md:p-10 min-h-full flex flex-col">

              {/* ── 0 · Cover ── */}
              {slide === 0 && (
                <div className="flex-1 flex flex-col items-center justify-center text-center text-white">
                  <Presenter slide={0} dark />
                  <motion.h1 initial={{ opacity: 0, y: 22 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.55, duration: 0.55 }}
                    className="text-4xl md:text-6xl font-bold mb-3 drop-shadow-lg !text-white">
                    Core Conversion
                  </motion.h1>
                  <motion.p initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.75, duration: 0.5 }}
                    className="text-xl md:text-2xl font-semibold text-cyan-100 mb-8">
                    Digital Marketing Services
                  </motion.p>
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1, duration: 0.5 }}
                    className="bg-white/10 border border-white/25 rounded-2xl px-6 py-4 backdrop-blur text-sm text-left">
                    <p className="text-cyan-200 text-xs font-bold uppercase tracking-widest mb-1.5">Prepared by</p>
                    <p className="font-semibold">Core Conversion Digital Marketing Services</p>
                    <p className="text-blue-100">paul@ccoms.ph · (049) 503-4255 · +63 992 298 1422</p>
                  </motion.div>
                </div>
              )}

              {/* ── 1 · Overview ── */}
              {slide === 1 && (
                <div>
                  <Presenter slide={1} />
                  <SlideTitle kicker="Agenda" title="Overview" />
                  <motion.div variants={stagger} initial="hidden" animate="visible" className="max-w-2xl mx-auto w-full space-y-3">
                    {[
                      ['Who We Are', 'Paul, the company, the track record, and the team'],
                      ['Our Services', 'The five disciplines we execute in-house'],
                      ['Our Proof of Result', 'Web development builds and SEO campaign wins'],
                      ['Our Offer', 'Transparent packages and pricing'],
                      ['Contact Information', 'How to reach us'],
                    ].map(([t, d], i) => (
                      <motion.div key={t} variants={item} className="flex items-center gap-4 bg-slate-50 border border-neutral-200 rounded-xl px-5 py-4">
                        <span className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-600 to-cyan-500 text-white font-bold flex items-center justify-center shrink-0">{i + 1}</span>
                        <div>
                          <p className="font-bold text-neutral-900">{t}</p>
                          <p className="text-sm text-neutral-500">{d}</p>
                        </div>
                      </motion.div>
                    ))}
                  </motion.div>
                </div>
              )}

              {/* ── 2 · About Paul ── */}
              {slide === 2 && (
                <div>
                  <Presenter slide={2} />
                  <SlideTitle kicker="Who We Are" title="About Paul" sub="Founder — strategic & technical lead" />
                  <div className="grid lg:grid-cols-3 gap-8 items-start">
                    <div className="lg:col-span-2 space-y-4 text-neutral-600 leading-relaxed">
                      <p>
                        Paul began his journey in digital marketing in <strong className="text-neutral-900">2011</strong>, learning from the
                        ground up: SEO, social media, email marketing, content marketing, and local SEO. Along the way he built a deep
                        technical foundation in web development and backend administration — WordPress and its page builders
                        (Elementor, Divi, Spectra), plus HTML/CSS, Python, PHP, and JavaScript.
                      </p>
                      <p>
                        Today, with over <strong className="text-neutral-900">15 years of hands-on experience</strong>, Paul leads Core
                        Conversion’s strategic and technical direction — now extended into <strong className="text-neutral-900">AI
                        integration</strong>: workflow automation, data processing, and multi-agentic systems.
                      </p>
                      <div className="bg-blue-50 border-l-4 border-blue-600 rounded-r-xl px-5 py-4 text-blue-900 font-medium italic">
                        He is not a manager who oversees people who do the work. He is the person who does the work — and builds the
                        team around that standard.
                      </div>
                    </div>
                    <div className="space-y-3">
                      <img src="/portfolio/paul-avatar.png" alt="John Paul Carrasco" className="w-40 h-40 rounded-2xl object-cover shadow-xl border border-neutral-200 mx-auto" />
                      <div className="grid grid-cols-2 gap-2">
                        {[['15+', 'Years Hands-On'], ['2011', 'Started'], ['18', 'Team Built'], ['AI', 'Integrated Ops']].map(([n, l]) => (
                          <div key={l} className="bg-slate-50 border border-neutral-200 rounded-xl p-3 text-center">
                            <div className="text-xl font-bold text-blue-600">{n}</div>
                            <div className="text-[11px] text-neutral-500 font-medium">{l}</div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* ── 3 · About Us ── */}
              {slide === 3 && (
                <div>
                  <Presenter slide={3} />
                  <SlideTitle kicker="Who We Are" title="About Us" sub="Delivery before everything else." />
                  <div className="grid lg:grid-cols-2 gap-8 items-start pb-4">
                    <div className="flex flex-col gap-5 text-neutral-600 text-sm md:text-[15px] leading-relaxed">
                      <p>
                        Core Conversion began in <strong className="text-neutral-900">2012 as a one-person SEO operation</strong>. By 2015 it
                        had grown into a full brick-and-mortar agency — a team, a business permit, an office — and has since expanded into
                        website development, mobile app development, paid ads management, and the full spectrum of digital marketing.
                      </p>
                      <p>
                        We are <strong className="text-neutral-900">not a volume agency</strong>. We don’t chase quantity of clients at the
                        expense of quality of work. We’re an owner-led, hands-on operation — the person running your account knows the
                        work first-hand, at every level of execution.
                      </p>
                      <p>
                        The industry has too many agencies built by businessmen who outsource everything, follow whatever is trending, and
                        have never personally done the work they’re selling. <strong className="text-neutral-900">We exist as the
                        alternative to that.</strong>
                      </p>
                      <div className="bg-blue-50 border border-blue-200 rounded-xl px-5 py-4 font-medium text-blue-900">
                        Our goal with every client is a long-term business relationship — not a project, not a transaction, but a
                        partnership where we grow alongside you.
                      </div>
                    </div>
                    <div>
                      <img src="/portfolio/team-collage.png" alt="The CCOMS team" className="rounded-2xl shadow-xl border border-neutral-200 w-full h-auto" />
                      <p className="text-xs text-neutral-400 text-center mt-2">The CCOMS team — same office, same standard, since 2015.</p>
                    </div>
                  </div>
                </div>
              )}

              {/* ── 4 · Track Record ── */}
              {slide === 4 && (
                <div>
                  <Presenter slide={4} />
                  <SlideTitle kicker="Who We Are" title="14 Years of Technical Expertise" />
                  <motion.div variants={stagger} initial="hidden" animate="visible" className="grid md:grid-cols-4 gap-4 mt-4">
                    {TIMELINE.map((t, i) => (
                      <motion.div key={t.era} variants={item} className="relative bg-slate-50 border border-neutral-200 rounded-2xl p-5 pt-7">
                        <span className="absolute -top-3 left-5 bg-gradient-to-r from-blue-600 to-cyan-500 text-white text-xs font-bold px-3 py-1 rounded-full shadow">{t.era}</span>
                        <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-700 font-bold flex items-center justify-center mb-3">{i + 1}</div>
                        <p className="text-sm text-neutral-600 leading-relaxed">{t.text}</p>
                      </motion.div>
                    ))}
                  </motion.div>
                </div>
              )}

              {/* ── 5 · The Team ── */}
              {slide === 5 && (
                <div onClick={stop} className="text-center">
                  <Presenter slide={5} />
                  <SlideTitle kicker="Who We Are" title="The Team" sub="18 in-house specialists across five departments." />
                  <div className="flex flex-wrap gap-2 mb-8 justify-center">
                    {TEAM_DEPTS.map(d => (
                      <button key={d.key} onClick={(e) => { e.stopPropagation(); setDept(d.key) }}
                        className={`px-5 py-2.5 rounded-full text-sm font-semibold transition-colors ${dept === d.key ? 'bg-blue-600 text-white' : 'bg-slate-100 text-neutral-600 hover:bg-slate-200'}`}>
                        {d.label}
                      </button>
                    ))}
                  </div>
                  <AnimatePresence mode="wait">
                    <motion.div key={dept} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.22 }}
                      className="flex flex-wrap justify-center gap-5 lg:gap-7">
                      {TEAM_DEPTS.find(d => d.key === dept)!.members.map(m => (
                        <div key={m.slug} className="w-[calc(50%-0.75rem)] sm:w-48 lg:w-56 bg-white border border-neutral-200 rounded-2xl shadow-sm overflow-hidden flex flex-col">
                          <div className="aspect-[4/5] bg-neutral-100 overflow-hidden">
                            <img src={`/portfolio/team/${m.slug}.png`} alt={m.name} loading="lazy" className="w-full h-full object-cover object-center" />
                          </div>
                          <div className="px-3 py-3.5 text-center flex-1 flex flex-col justify-center">
                            <p className="font-bold text-sm text-neutral-900 leading-tight">{m.name}</p>
                            <p className="text-xs text-neutral-500 mt-1">{m.role}</p>
                          </div>
                        </div>
                      ))}
                    </motion.div>
                  </AnimatePresence>
                </div>
              )}

              {/* ── 6 · Services ── */}
              {slide === 6 && (
                <div>
                  <Presenter slide={6} />
                  <SlideTitle kicker="What We Do" title="Our Services" />
                  <motion.div variants={stagger} initial="hidden" animate="visible" className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {SERVICES.map(s => (
                      <motion.div key={s.title} variants={item} className="bg-slate-50 border border-neutral-200 rounded-2xl p-5 hover:border-blue-300 hover:bg-blue-50/40 transition-colors">
                        <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-blue-600 to-cyan-500 flex items-center justify-center mb-3">
                          <s.icon className="w-5 h-5 text-white" />
                        </div>
                        <h3 className="font-bold mb-1.5">{s.title}</h3>
                        <p className="text-sm text-neutral-600 leading-relaxed">{s.desc}</p>
                      </motion.div>
                    ))}
                    <motion.div variants={item} className="bg-gradient-to-br from-blue-600 to-cyan-500 text-white rounded-2xl p-5">
                      <div className="w-11 h-11 rounded-xl bg-white/20 flex items-center justify-center mb-3">
                        <Rocket className="w-5 h-5 text-white" />
                      </div>
                      <h3 className="font-bold mb-1.5 !text-white">Custom Strategy — Mix &amp; Match</h3>
                      <p className="text-sm text-blue-50 leading-relaxed">
                        Need more than one? We blend any of these services into a single custom digital marketing
                        strategy — built around your market, budget, and goals.
                      </p>
                    </motion.div>
                  </motion.div>
                </div>
              )}

              {/* ── 7 · Web Dev Cases ── */}
              {slide === 7 && (
                <div>
                  <Presenter slide={7} />
                  <SlideTitle kicker="Proof of Result" title="Website & Platform Development" sub="Tap any project for the full challenge, solution, and results." />
                  <motion.div variants={stagger} initial="hidden" animate="visible" className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {WEB_CASES.map(c => (
                      <motion.button
                        key={c.title} variants={item}
                        onClick={(e) => { e.stopPropagation(); setWebCase(c) }}
                        className="text-left bg-white border border-neutral-200 rounded-2xl overflow-hidden shadow-sm hover:shadow-xl hover:border-blue-300 hover:-translate-y-1 transition-all group"
                      >
                        <div className="h-32 overflow-hidden bg-neutral-100">
                          <img src={c.image} alt={c.title} loading="lazy" className="w-full h-full object-cover object-top group-hover:scale-105 transition-transform duration-300" />
                        </div>
                        <div className="p-4">
                          <span className="text-[10px] font-bold uppercase tracking-widest text-cyan-600">{c.tag}</span>
                          <h3 className="font-bold text-sm mt-0.5 mb-1.5">{c.title}</h3>
                          <span className="inline-flex items-center gap-1 text-xs font-bold text-blue-600">
                            Open case study <ArrowRight className="w-3 h-3" />
                          </span>
                        </div>
                      </motion.button>
                    ))}
                  </motion.div>
                </div>
              )}

              {/* ── 8 · SEO Cases ── */}
              {slide === 8 && (
                <div>
                  <Presenter slide={8} />
                  <SlideTitle kicker="Proof of Result" title="SEO / Digital Marketing" sub="Before → after, with the strategy that made the difference." />
                  <motion.div variants={stagger} initial="hidden" animate="visible" className="grid md:grid-cols-2 gap-4">
                    {SEO_CASES.map(c => (
                      <motion.div key={c.title} variants={item} onClick={stop} className="bg-slate-50 border border-neutral-200 rounded-2xl p-5 flex flex-col cursor-default">
                        <h3 className="font-bold text-lg mb-1.5">{c.title}</h3>
                        <p className="text-xs text-neutral-500 italic mb-3">“{c.context}”</p>
                        <div className="grid grid-cols-2 gap-3 mb-3 text-xs leading-relaxed">
                          <div className="bg-white border border-red-100 rounded-xl p-3">
                            <span className="font-bold text-red-500 block mb-1">Before</span>
                            <p className="text-neutral-600">{c.before}</p>
                          </div>
                          <div className="bg-white border border-emerald-100 rounded-xl p-3">
                            <span className="font-bold text-emerald-600 block mb-1">After</span>
                            <p className="text-neutral-600">{c.after}</p>
                          </div>
                        </div>
                        <div className="bg-blue-600 text-white rounded-xl p-3.5 text-xs leading-relaxed mb-3">
                          <span className="font-bold flex items-center gap-1 mb-1"><Zap className="w-3.5 h-3.5 text-yellow-300" /> The CComs Strategy</span>
                          {c.strategy}
                        </div>
                        <div className="mt-auto flex gap-2">
                          <button onClick={(e) => { e.stopPropagation(); setProof({ c, i: 0 }) }}
                            className="flex-1 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold py-2 rounded-lg transition-colors">
                            View Ranking Proof
                          </button>
                          {c.highRes && (
                            <a href={c.highRes} target="_blank" rel="noopener noreferrer" onClick={stop}
                              className="flex-1 text-center border border-blue-600 text-blue-600 hover:bg-blue-50 text-xs font-bold py-2 rounded-lg transition-colors">
                              High-Res Proofs
                            </a>
                          )}
                        </div>
                      </motion.div>
                    ))}
                  </motion.div>
                </div>
              )}

              {/* ── 9 · Mobile App ── */}
              {slide === 9 && (
                <div>
                  <Presenter slide={9} />
                  <SlideTitle kicker="Proof of Result" title="Mobile App Development" sub="QR Seal — a client SaaS platform engineered end to end by CCOMS." />
                  <div className="grid lg:grid-cols-2 gap-8 items-start">
                    <div className="space-y-4 text-neutral-600 leading-relaxed text-sm">
                      <p>
                        The QR Seal mobile app is the "Key" in the QR Seal ecosystem — a native companion to the web "Vault." It generates
                        dynamic, brand-styled QR codes in seconds, with full analytics (countries, devices, scan history), premium templates,
                        and SVG/PDF export.
                      </p>
                      <motion.div variants={stagger} initial="hidden" animate="visible" className="grid grid-cols-2 gap-3">
                        {[
                          ['Dynamic QR engine', 'Edit destinations anytime — codes never expire'],
                          ['Full analytics', 'Countries, devices, and scan history per code'],
                          ['AI-branded designs', 'Logos, gradients, shapes & premium templates'],
                          ['Subscription platform', 'Free trial, tiered plans, lifetime option'],
                        ].map(([h, d]) => (
                          <motion.div key={h} variants={item} className="bg-slate-50 border border-neutral-200 rounded-xl p-3.5">
                            <p className="font-bold text-neutral-900 text-xs mb-0.5">{h}</p>
                            <p className="text-xs text-neutral-500">{d}</p>
                          </motion.div>
                        ))}
                      </motion.div>
                    </div>
                    <div className="flex flex-col items-center gap-4" onClick={stop}>
                      <div className="flex gap-3 justify-center">
                        {['qrseal-app-1.png', 'qrseal-app-2.png', 'qrseal-app-3.png'].map(f => (
                          <img key={f} src={`/portfolio/apps/${f}`} alt="QR Seal app screen" loading="lazy"
                            className="w-28 md:w-36 rounded-2xl shadow-xl border border-neutral-200" />
                        ))}
                      </div>
                      <div className="flex items-center gap-4 bg-slate-50 border border-neutral-200 rounded-2xl px-5 py-4">
                        <img src="/portfolio/apps/qrseal-demo-qr.png" alt="Scan to view the QR Seal demo" className="w-24 h-24 rounded-lg" />
                        <div>
                          <p className="font-bold text-neutral-900 text-sm">Try it yourself</p>
                          <p className="text-xs text-neutral-500 leading-relaxed">Scan the QR code with your phone<br />to view the live demo.</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* ── 10 · Our Offer ── */}
              {slide === 10 && (
                <div onClick={stop}>
                  <Presenter slide={10} />
                  <div className="text-center">
                    <SlideTitle kicker="Our Offer" title="Packages & Pricing" />
                    <p className="text-neutral-500 -mt-3 mb-6 max-w-3xl mx-auto text-sm leading-relaxed">
                      {tier === 'dm'
                        ? 'Every business has different growth challenges — some need visibility, some need more qualified inquiries, others need to scale an already successful marketing engine. Instead of forcing every business into identical checklists, Core Conversion builds the right combination of digital marketing services based on your objectives, market, competitors, and current digital maturity.'
                        : 'A condensed look at our engagement options — full feature breakdowns during your call.'}
                    </p>
                    <div className="inline-flex items-center gap-1 p-1 bg-slate-100 rounded-full mb-7 flex-wrap justify-center">
                      <button onClick={(e) => { e.stopPropagation(); setTier('core') }}
                        className={`px-5 py-2 rounded-full text-sm font-semibold transition-colors ${tier === 'core' ? 'bg-gradient-to-r from-blue-600 to-cyan-500 text-white shadow' : 'text-neutral-600'}`}>
                        Web Development
                      </button>
                      <button onClick={(e) => { e.stopPropagation(); setTier('ecom') }}
                        className={`px-5 py-2 rounded-full text-sm font-semibold transition-colors flex items-center gap-1.5 ${tier === 'ecom' ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-white shadow' : 'text-neutral-600'}`}>
                        <ShoppingCart className="w-4 h-4" /> E-commerce
                      </button>
                      <button onClick={(e) => { e.stopPropagation(); setTier('apps') }}
                        className={`px-5 py-2 rounded-full text-sm font-semibold transition-colors flex items-center gap-1.5 ${tier === 'apps' ? 'bg-gradient-to-r from-sky-500 to-blue-700 text-white shadow' : 'text-neutral-600'}`}>
                        <Smartphone className="w-4 h-4" /> Mobile Apps
                      </button>
                      <button onClick={(e) => { e.stopPropagation(); setTier('dm') }}
                        className={`px-5 py-2 rounded-full text-sm font-semibold transition-colors flex items-center gap-1.5 ${tier === 'dm' ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow' : 'text-neutral-600'}`}>
                        <Layers className="w-4 h-4" /> Digital Marketing
                      </button>
                      <button onClick={(e) => { e.stopPropagation(); setTier('meta') }}
                        className={`px-5 py-2 rounded-full text-sm font-semibold transition-colors flex items-center gap-1.5 ${tier === 'meta' ? 'bg-gradient-to-r from-indigo-500 to-purple-600 text-white shadow' : 'text-neutral-600'}`}>
                        <Megaphone className="w-4 h-4" /> Meta Ads
                      </button>
                    </div>
                  </div>
                  <AnimatePresence mode="wait">
                    {tier === 'core' || tier === 'ecom' ? (
                      <motion.div key={tier} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.22 }}
                        className={`grid gap-4 ${tier === 'core' ? 'sm:grid-cols-2 lg:grid-cols-4' : 'sm:grid-cols-2 max-w-2xl mx-auto'}`}>
                        {(tier === 'core' ? CORE_TIERS : ECOM_TIERS).map(t => (
                          <div key={t.name} className="relative bg-white border border-neutral-200 rounded-2xl shadow-sm overflow-hidden flex flex-col">
                            {t.promo && (
                              <span className="absolute top-2 right-2 z-10 bg-yellow-400 text-neutral-900 text-[10px] font-extrabold px-2 py-0.5 rounded-full rotate-6 shadow">{t.promo}</span>
                            )}
                            <div className={`bg-gradient-to-br ${t.grad} text-white text-center px-4 pt-4 pb-3`}>
                              <p className="h-4 text-[9px] font-bold uppercase tracking-widest opacity-90">{t.badge}</p>
                              <h3 className="font-bold text-sm !text-white">{t.name}</h3>
                              <p className="text-2xl font-extrabold mt-0.5">{t.price}</p>
                              <p className="text-[10px] opacity-80">50% DP · 50% on approval</p>
                            </div>
                            <ul className="p-4 space-y-2 text-xs text-neutral-600 flex-1 text-left">
                              {t.bullets.map(b => (
                                <li key={b} className="flex gap-2"><ShieldCheck className="w-3.5 h-3.5 text-emerald-500 shrink-0 mt-0.5" />{b}</li>
                              ))}
                            </ul>
                          </div>
                        ))}
                      </motion.div>
                    ) : tier === 'apps' ? (
                      <motion.div key="apps" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.22 }}>
                        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                          {APP_TIERS.map(t => (
                            <div key={t.name} className="relative bg-white border border-neutral-200 rounded-2xl shadow-sm overflow-hidden flex flex-col">
                              <div className={`bg-gradient-to-br ${t.grad} text-white text-center px-4 pt-3.5 pb-3`}>
                                <p className="h-4 text-[9px] font-bold uppercase tracking-widest opacity-90">{t.badge}</p>
                                <h3 className="font-bold text-sm !text-white">{t.name}</h3>
                                <p className="text-2xl font-extrabold mt-0.5">{t.price}</p>
                                <p className="text-[10px] opacity-80">{t.sub}</p>
                              </div>
                              <div className="flex flex-wrap gap-1.5 justify-center px-3 pt-3">
                                {t.chips.map(c => (
                                  <span key={c} className="text-[10px] font-bold text-blue-700 bg-blue-50 border border-blue-100 rounded-full px-2 py-0.5">{c}</span>
                                ))}
                              </div>
                              <ul className="p-4 space-y-2 text-xs text-neutral-600 flex-1 text-left">
                                {t.bullets.map(b => (
                                  <li key={b} className="flex gap-2"><ShieldCheck className="w-3.5 h-3.5 text-emerald-500 shrink-0 mt-0.5" />{b}</li>
                                ))}
                              </ul>
                            </div>
                          ))}
                        </div>
                      </motion.div>
                    ) : tier === 'dm' ? (
                      <motion.div key="dm" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.22 }}
                        className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 max-w-4xl mx-auto">
                        {DM_TIERS.map(t => (
                          <div key={t.name} className="relative bg-white border border-neutral-200 rounded-2xl shadow-sm overflow-hidden flex flex-col">
                            <div className={`bg-gradient-to-br ${t.grad} text-white text-center px-4 pt-3.5 pb-3.5`}>
                              <p className="h-4 text-[9px] font-bold uppercase tracking-widest opacity-90">{t.badge}</p>
                              <h3 className="font-bold text-sm !text-white">{t.name}</h3>
                              <p className="text-xl font-extrabold mt-0.5 whitespace-nowrap">{t.price}</p>
                              <p className="text-[10px] opacity-80">{t.sub}</p>
                            </div>
                            <p className="px-4 pt-3 text-xs text-neutral-500 italic text-center">{t.desc}</p>
                            <div className="px-4 pt-2.5 pb-1 text-left">
                              <p className="text-[10px] font-bold uppercase tracking-widest text-neutral-400">{t.capLabel}</p>
                            </div>
                            <ul className="px-4 pb-3 space-y-1.5 text-xs text-neutral-600 flex-1 text-left">
                              {t.bullets.map(b => (
                                <li key={b} className="flex gap-2"><ShieldCheck className="w-3.5 h-3.5 text-emerald-500 shrink-0 mt-0.5" />{b}</li>
                              ))}
                            </ul>
                            {t.note && <p className="px-4 py-2.5 bg-slate-50 border-t border-neutral-100 text-[10px] text-neutral-400 text-center">{t.note}</p>}
                          </div>
                        ))}
                      </motion.div>
                    ) : (
                      <motion.div key="meta" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.22 }}
                        className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                        {META_TIERS.map(t => (
                          <div key={t.name} className="relative bg-white border border-neutral-200 rounded-2xl shadow-sm overflow-hidden flex flex-col">
                            <div className={`bg-gradient-to-br ${t.grad} text-white text-center px-4 pt-3.5 pb-3`}>
                              <p className="h-4 text-[9px] font-bold uppercase tracking-widest opacity-90">{t.badge}</p>
                              <h3 className="font-bold text-sm !text-white">{t.name}</h3>
                              <p className="text-[11px] opacity-80 line-through">{t.was}</p>
                              <p className="text-2xl font-extrabold -mt-0.5">{t.price}</p>
                            </div>
                            <div className="flex flex-wrap gap-1.5 justify-center px-3 pt-3">
                              {t.chips.map(c => (
                                <span key={c} className="text-[10px] font-bold text-blue-700 bg-blue-50 border border-blue-100 rounded-full px-2 py-0.5">{c}</span>
                              ))}
                            </div>
                            <ul className="p-4 space-y-2 text-xs text-neutral-600 flex-1 text-left">
                              {t.bullets.map(b => (
                                <li key={b} className="flex gap-2"><ShieldCheck className="w-3.5 h-3.5 text-emerald-500 shrink-0 mt-0.5" />{b}</li>
                              ))}
                            </ul>
                          </div>
                        ))}
                        <div className="bg-slate-50 border border-dashed border-neutral-300 rounded-2xl p-5 flex items-center justify-center text-center">
                          <p className="text-xs text-neutral-500 leading-relaxed">
                            <strong className="text-neutral-700">Note:</strong> Service fee is paid before campaign launch.
                            Meta ad budget is separate and paid directly to Meta.
                          </p>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                  <p className="text-center text-xs text-neutral-400 mt-5">
                    {tier === 'meta'
                      ? 'Clear offers for businesses at every stage — ask us during your call which fits yours.'
                      : tier === 'apps'
                        ? '2-term installment on all builds: 50% downpayment to start · 50% upon completion and your approval.'
                        : tier === 'dm'
                          ? 'Capabilities are modular — the final mix is built around your business assessment and agreed objectives.'
                          : <>2-term installment: 50% downpayment to start · 50% upon completion and your approval. All web packages include 4 CPU · 4GB RAM · 100GB NVMe SSD · CDN. Full comparison at{' '}
                            <a href="/services/website-development" target="_blank" onClick={stop} className="text-blue-600 font-semibold hover:underline">
                              ccoms.ph/services/website-development
                            </a></>}
                  </p>
                </div>
              )}

              {/* ── 11 · Contact ── */}
              {slide === 11 && (
                <div className="flex-1 flex flex-col">
                  <Presenter slide={11} />
                  <div className="flex-1 flex flex-col items-center justify-center">
                    <SlideTitle kicker="Contact Information" title="Get In Touch" />
                    <motion.div variants={stagger} initial="hidden" animate="visible" className="w-full max-w-md space-y-3">
                      <motion.a variants={item} href="mailto:paul@ccoms.ph" onClick={stop}
                        className="flex items-center gap-4 bg-slate-50 hover:bg-blue-50 border border-neutral-200 rounded-2xl px-5 py-4 transition-colors">
                        <span className="w-11 h-11 rounded-xl bg-gradient-to-br from-blue-600 to-cyan-500 flex items-center justify-center"><Mail className="w-5 h-5 text-white" /></span>
                        <div><p className="text-xs text-neutral-400 font-semibold">Email</p><p className="font-bold text-neutral-900">paul@ccoms.ph</p></div>
                      </motion.a>
                      <motion.div variants={item} className="flex items-center gap-4 bg-slate-50 border border-neutral-200 rounded-2xl px-5 py-4">
                        <span className="w-11 h-11 rounded-xl bg-gradient-to-br from-blue-600 to-cyan-500 flex items-center justify-center"><Phone className="w-5 h-5 text-white" /></span>
                        <div>
                          <p className="text-xs text-neutral-400 font-semibold">Phone / Mobile</p>
                          <p className="font-bold text-neutral-900">(049) 503-4255</p>
                          <p className="text-sm text-neutral-600">(0992) 298-1422 · (0961) 706-8549</p>
                        </div>
                      </motion.div>
                      <motion.a variants={item} href="https://calendly.com/ccoms/discovery-call" target="_blank" rel="noopener noreferrer" onClick={stop}
                        className="flex items-center justify-center gap-2 bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-700 hover:to-cyan-600 text-white font-bold rounded-2xl px-5 py-4 transition-colors">
                        <Phone className="w-5 h-5" /> Book a Discovery Call
                      </motion.a>
                      <motion.a variants={item} href="/portfolio/CCOMS-Portfolio.pdf" download="CCOMS-Portfolio.pdf" onClick={stop}
                        className="flex items-center justify-center gap-2 bg-neutral-900 hover:bg-neutral-800 text-white font-bold rounded-2xl px-5 py-3.5 transition-colors">
                        <FileDown className="w-5 h-5" /> Download PDF Portfolio
                      </motion.a>
                      <motion.a variants={item} href="/" onClick={stop}
                        className="flex items-center justify-center gap-2 border-2 border-blue-600 text-blue-600 hover:bg-blue-50 font-bold rounded-2xl px-5 py-3.5 transition-colors">
                        <Globe className="w-5 h-5" /> Visit ccoms.ph
                      </motion.a>
                    </motion.div>

                    <div className="flex flex-row items-stretch justify-center gap-8 md:gap-12 pt-6 flex-wrap">
                      <a href="/" onClick={stop} className="flex flex-col items-center gap-2 bg-slate-50 hover:bg-blue-50 border border-neutral-200 rounded-2xl px-5 py-4 transition-colors">
                        <img src="/portfolio/qr-visit-ccoms.png" alt="Scan to visit ccoms.ph" className="w-28 h-28 rounded-lg" />
                        <div className="text-center"><p className="font-bold text-neutral-900 text-sm">Visit ccoms.ph</p><p className="text-xs text-neutral-500">Scan to browse our site</p></div>
                      </a>
                      <a href="https://calendly.com/ccoms/discovery-call" target="_blank" rel="noopener noreferrer" onClick={stop}
                        className="flex flex-col items-center gap-2 bg-slate-50 hover:bg-blue-50 border border-neutral-200 rounded-2xl px-5 py-4 transition-colors">
                        <img src="/portfolio/qr-book-call.png" alt="Scan to book a call" className="w-28 h-28 rounded-lg" />
                        <div className="text-center"><p className="font-bold text-neutral-900 text-sm">Book a Call</p><p className="text-xs text-neutral-500">Scan to schedule a discovery call</p></div>
                      </a>
                    </div>

                    <p className="text-center text-sm text-neutral-400 italic pt-5">
                      Built for long-term partnerships, not quick client turnover.
                    </p>
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* bottom bar */}
      <div className="absolute bottom-0 inset-x-0 z-40 flex items-center justify-between gap-4 px-5 py-3.5 lg:px-8 pointer-events-none">
        <span className="text-xs text-white/70 drop-shadow">{!isLast && 'Click, tap, or press → to continue'}</span>
        {!isLast && (
          <button onClick={(e) => { e.stopPropagation(); advance() }}
            className="pointer-events-auto inline-flex items-center gap-2 bg-white text-blue-700 hover:bg-blue-50 text-sm font-bold px-5 py-2.5 rounded-xl shadow-xl transition-colors shrink-0">
            {NEXT_LABELS[slide]} <ArrowRight className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* ── Web-dev case modal ── */}
      <AnimatePresence>
        {webCase && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={(e) => { e.stopPropagation(); setWebCase(null) }}
            className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4 cursor-default">
            <motion.div initial={{ scale: 0.95, y: 16 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.95, y: 16 }}
              onClick={stop} className="bg-white rounded-2xl max-w-4xl w-full max-h-[88vh] overflow-y-auto shadow-2xl">
              <div className="relative h-52 bg-neutral-100">
                <img src={webCase.image} alt={webCase.title} className="w-full h-full object-cover object-top" />
                <button onClick={() => setWebCase(null)} className="absolute top-3 right-3 p-2 bg-black/50 hover:bg-black/70 rounded-lg text-white transition-colors"><X className="w-5 h-5" /></button>
              </div>
              <div className="p-6 md:p-8">
                <span className="text-[11px] font-bold uppercase tracking-widest text-cyan-600">{webCase.tag}</span>
                <div className="flex items-center gap-2 mb-5">
                  <h3 className="text-2xl font-bold text-neutral-900">{webCase.title}</h3>
                  {webCase.liveUrl && (
                    <a href={webCase.liveUrl} target="_blank" rel="nofollow noopener noreferrer" className="text-blue-600 hover:text-blue-800">
                      <ExternalLink className="w-5 h-5" />
                    </a>
                  )}
                </div>
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-bold text-neutral-900 mb-2">Challenge</h4>
                    <p className="text-sm text-neutral-600 leading-relaxed mb-5">{webCase.challenge}</p>
                    <h4 className="font-bold text-neutral-900 mb-2 flex items-center gap-1.5"><Star className="w-4 h-4 text-yellow-500" /> Key Results</h4>
                    <ul className="space-y-1.5">
                      {webCase.results.map(r => (
                        <li key={r} className="flex gap-2 text-sm text-neutral-700"><ShieldCheck className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />{r}</li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-bold text-neutral-900 mb-2">Solution</h4>
                    <div className="space-y-2.5">
                      {webCase.solution.map(s => (
                        <div key={s.h} className="bg-slate-50 border border-neutral-200 rounded-xl px-4 py-3">
                          <p className="font-bold text-sm text-neutral-900">{s.h}</p>
                          <p className="text-xs text-neutral-500 leading-relaxed mt-0.5">{s.d}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── SEO proof lightbox ── */}
      <AnimatePresence>
        {proof && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={(e) => { e.stopPropagation(); setProof(null) }}
            className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4 cursor-default">
            <div className="relative max-w-5xl w-full" onClick={stop}>
              <div className="flex items-center justify-between mb-3">
                <div>
                  <h3 className="font-bold text-white">{proof.c.title}</h3>
                  {proof.c.images.length > 1 && <p className="text-xs text-white/60">{proof.i + 1} of {proof.c.images.length}</p>}
                </div>
                <div className="flex items-center gap-2">
                  {proof.c.highRes && (
                    <a href={proof.c.highRes} target="_blank" rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold px-3.5 py-2 rounded-lg transition-colors">
                      View High-Res Proofs <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  )}
                  <button onClick={() => setProof(null)} className="p-2 bg-white/10 hover:bg-white/20 rounded-lg text-white transition-colors"><X className="w-5 h-5" /></button>
                </div>
              </div>
              <div className="relative bg-neutral-900 rounded-2xl overflow-hidden max-h-[75vh] flex items-center justify-center">
                <img src={proof.c.images[proof.i]} alt={`${proof.c.title} proof ${proof.i + 1}`} className="max-h-[75vh] w-auto max-w-full object-contain" />
                {proof.c.images.length > 1 && (
                  <>
                    <button onClick={() => setProof(p => p && { ...p, i: (p.i - 1 + p.c.images.length) % p.c.images.length })}
                      className="absolute left-3 top-1/2 -translate-y-1/2 p-2.5 bg-black/60 hover:bg-black/80 rounded-full text-white transition-colors"><ChevronLeft className="w-5 h-5" /></button>
                    <button onClick={() => setProof(p => p && { ...p, i: (p.i + 1) % p.c.images.length })}
                      className="absolute right-3 top-1/2 -translate-y-1/2 p-2.5 bg-black/60 hover:bg-black/80 rounded-full text-white transition-colors"><ChevronRight className="w-5 h-5" /></button>
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

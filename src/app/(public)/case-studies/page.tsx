'use client'

import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence, useAnimation } from 'framer-motion'
import CTAButtons from '@/components/CTAButtons'
import { Code2, ArrowRight, CheckCircle2, ChevronRight, Cpu, Layout, Globe, Search, Database, Smartphone, Zap, Shield, BarChart3, MapPin, ZoomIn, ChevronLeft, Quote, X, ExternalLink } from 'lucide-react'

interface CaseStudy {
  title: string
  subtitle: string
  category: string
  images: string[]
  objective: string
  highlights: {
    icon: any
    title: string
    description: string
  }[]
  technicalSummary: {
    stack: string[]
    focus: string[]
  }
  type: 'web-dev' | 'seo'
  slug: string
  seoContent?: {
    context: string
    before: string
    strategy: string
    after: string
    quoteTitle: string
    quote: string
  }
  quoteContent?: {
    title: string
    quote: string
  }
  externalProofLink?: string
}

// Enhanced Image Lightbox Modal with Pan & Zoom
function ImageModal({
  images,
  initialIndex,
  onClose
}: {
  images: string[] | null,
  initialIndex: number,
  onClose: () => void
}) {
  const [currentIndex, setCurrentIndex] = useState(initialIndex)
  const [scale, setScale] = useState(1)
  const [isZoomed, setIsZoomed] = useState(false)

  const containerRef = useRef<HTMLDivElement>(null)
  const imgRef = useRef<HTMLImageElement>(null)
  const [baseDims, setBaseDims] = useState({ w: 0, h: 0 })

  const isDragging = useRef(false)
  const lastPos = useRef({ x: 0, y: 0 })

  // Reset index when images change
  useEffect(() => {
    setCurrentIndex(initialIndex)
  }, [initialIndex, images])

  // Reset zoom and dims when index changes
  useEffect(() => {
    setScale(1)
    setIsZoomed(false)
    setBaseDims({ w: 0, h: 0 })
    if (containerRef.current) {
      containerRef.current.scrollTo(0, 0)
    }
  }, [currentIndex])

  useEffect(() => {
    if (images && images.length > 0) {
      document.body.style.overflow = 'hidden'
      const handleEsc = (e: KeyboardEvent) => {
        if (e.key === 'Escape') onClose()
      }
      window.addEventListener('keydown', handleEsc)
      return () => {
        document.body.style.overflow = 'unset'
        window.removeEventListener('keydown', handleEsc)
      }
    }
  }, [images, onClose])

  if (!images || images.length === 0) return null

  const handleNext = (e: React.MouseEvent) => {
    e.stopPropagation()
    setCurrentIndex((prev) => (prev + 1) % images.length)
  }

  const handlePrev = (e: React.MouseEvent) => {
    e.stopPropagation()
    setCurrentIndex((prev) => (prev - 1 + images.length) % images.length)
  }

  const handleWheel = (e: React.WheelEvent) => {
    e.stopPropagation()

    // Capture base dimension exactly before first zoom
    if (scale === 1 && imgRef.current) {
      setBaseDims({
        w: imgRef.current.clientWidth,
        h: imgRef.current.clientHeight
      })
    }

    const zoomSensitivity = 0.002
    const newScale = Math.min(Math.max(1, scale - e.deltaY * zoomSensitivity), 4) // max zoom 4x
    setScale(newScale)
    setIsZoomed(newScale > 1)
  }

  const handlePointerDown = (e: React.PointerEvent) => {
    if (!isZoomed || !containerRef.current) return
    isDragging.current = true
    lastPos.current = { x: e.clientX, y: e.clientY }
    // Capture pointer events to ensure smooth dragging even outside the div momentarily
    if (e.currentTarget instanceof HTMLElement) {
      e.currentTarget.setPointerCapture(e.pointerId)
    }
  }

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isDragging.current || !containerRef.current) return
    const dx = e.clientX - lastPos.current.x
    const dy = e.clientY - lastPos.current.y
    containerRef.current.scrollBy(-dx, -dy)
    lastPos.current = { x: e.clientX, y: e.clientY }
  }

  const handlePointerUp = (e: React.PointerEvent) => {
    isDragging.current = false
    if (e.currentTarget instanceof HTMLElement && e.currentTarget.hasPointerCapture(e.pointerId)) {
      e.currentTarget.releasePointerCapture(e.pointerId)
    }
  }

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[100] flex items-center justify-center bg-neutral-900/90 backdrop-blur-xl p-4 md:p-12 overflow-hidden"
        onClick={onClose}
        onWheel={handleWheel}
      >
        <motion.button
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          className="absolute top-4 right-4 md:top-8 md:right-8 text-white hover:text-blue-400 transition-colors z-[110] bg-neutral-900/50 rounded-full p-2"
          onClick={onClose}
        >
          <X className="w-8 h-8" />
        </motion.button>

        {/* Navigation Arrows for Lightbox */}
        {images.length > 1 && !isZoomed && (
          <>
            <button
              onClick={handlePrev}
              className="absolute left-4 md:left-8 top-1/2 -translate-y-1/2 w-12 h-12 bg-white/10 hover:bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center text-white transition-all shadow-lg z-[110]"
            >
              <ChevronLeft className="w-8 h-8" />
            </button>
            <button
              onClick={handleNext}
              className="absolute right-4 md:right-8 top-1/2 -translate-y-1/2 w-12 h-12 bg-white/10 hover:bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center text-white transition-all shadow-lg z-[110]"
            >
              <ChevronRight className="w-8 h-8" />
            </button>
          </>
        )}

        <div
          className="relative max-w-7xl w-full h-full flex items-center justify-center overflow-hidden"
          onClick={(e) => e.stopPropagation()}
        >
          {isZoomed && (
            <div className="absolute top-4 left-1/2 -translate-x-1/2 bg-neutral-900/80 text-white px-4 py-2 rounded-full text-sm font-medium z-[110] backdrop-blur-md pointer-events-none flex items-center gap-2 shadow-lg">
              <ZoomIn className="w-4 h-4" />
              Grab & Drag to Pan. Scroll to Zoom.
            </div>
          )}

          <div
            ref={containerRef}
            className={`w-full h-full overflow-auto flex items-center justify-center ${isZoomed ? 'cursor-grab active:cursor-grabbing' : 'cursor-default'}`}
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
            onPointerCancel={handlePointerUp}
            style={{ touchAction: 'none' }} // Prevent browser touch actions so we can pan
          >
            <div className="min-w-full min-h-full flex items-center justify-center">
              <AnimatePresence mode="wait">
                <motion.div
                  key={currentIndex}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ type: "spring", stiffness: 300, damping: 30 }}
                  className="flex items-center justify-center p-4 md:p-8"
                >
                  <img
                    ref={imgRef}
                    src={images[currentIndex]}
                    alt="Zoomed view"
                    style={isZoomed && baseDims.w > 0 ? {
                      width: `${baseDims.w * scale}px`,
                      height: `${baseDims.h * scale}px`,
                      maxWidth: 'none',
                      maxHeight: 'none'
                    } : {
                      maxWidth: '100%',
                      maxHeight: '90vh'
                    }}
                    className="object-contain rounded-lg shadow-2xl pointer-events-none select-none transition-all duration-75"
                    draggable={false}
                  />
                </motion.div>
              </AnimatePresence>
            </div>
          </div>

          {images.length > 1 && !isZoomed && (
            <div className="absolute bottom-4 md:bottom-8 left-1/2 -translate-x-1/2 flex gap-2 z-[110]">
              {images.map((_, i) => (
                <div
                  key={i}
                  className={`w-2 h-2 rounded-full transition-all ${i === currentIndex ? 'bg-blue-400 w-4' : 'bg-white/50'}`}
                />
              ))}
            </div>
          )}
        </div>
      </motion.div>
    </AnimatePresence>
  )
}

// Image Carousel Component with Modal Trigger
function ImageCarousel({ images, title, onOpenModal }: { images: string[], title: string, onOpenModal: (index: number) => void }) {
  const [current, setCurrent] = useState(0)

  if (!images || images.length === 0) return null

  const next = (e: React.MouseEvent) => {
    e.stopPropagation()
    setCurrent((prev) => (prev + 1) % images.length)
  }
  const prev = (e: React.MouseEvent) => {
    e.stopPropagation()
    setCurrent((prev) => (prev - 1 + images.length) % images.length)
  }

  return (
    <div className="relative group overflow-hidden rounded-2xl border border-neutral-200 bg-white shadow-2xl transition-all hover:border-blue-300">
      <div
        className="relative aspect-video cursor-zoom-in"
        onClick={() => onOpenModal(current)}
      >
        <AnimatePresence mode="wait">
          <motion.img
            key={current}
            src={images[current]}
            alt={`${title} proof ${current + 1}`}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
            className="w-full h-full object-cover"
          />
        </AnimatePresence>

        {/* Hover Overlay */}
        <div className="absolute inset-0 bg-blue-600/0 group-hover:bg-blue-600/5 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100 duration-300">
          <div className="bg-white/90 backdrop-blur-md px-4 py-2 rounded-full flex items-center gap-2 text-sm font-bold text-blue-600 shadow-xl transform translate-y-4 group-hover:translate-y-0 transition-transform">
            <ZoomIn className="w-4 h-4" />
            Click to Enlarge
          </div>
        </div>
      </div>

      {images.length > 1 && (
        <>
          <button
            onClick={prev}
            className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/80 backdrop-blur-md rounded-full flex items-center justify-center text-neutral-900 opacity-0 group-hover:opacity-100 transition-opacity shadow-lg z-20"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
          <button
            onClick={next}
            className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/80 backdrop-blur-md rounded-full flex items-center justify-center text-neutral-900 opacity-0 group-hover:opacity-100 transition-opacity shadow-lg z-20"
          >
            <ChevronRight className="w-6 h-6" />
          </button>

          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 z-20">
            {images.map((_, i) => (
              <div
                key={i}
                className={`w-2 h-2 rounded-full transition-all ${i === current ? 'bg-blue-600 w-4' : 'bg-neutral-300'}`}
              />
            ))}
          </div>
        </>
      )}
    </div>
  )
}

const caseStudies: CaseStudy[] = [
  // --- WEB DEVELOPMENT CATEGORY ---
  {
    slug: 'ccoms-revamp',
    title: 'CComs Revamp',
    subtitle: 'The Growth OS Framework',
    category: 'Agency Transformation',
    type: 'web-dev',
    images: ['/case-studies/ccoms-hero.png'],
    objective: 'Transform the existing agency site into a high-performance "Growth OS" that serves as the definitive proof-of-concept for the Core Conversion framework.',
    highlights: [
      { icon: Cpu, title: 'Next.js 14 Framework', description: 'Utilizing SSR and SSG for instant data readiness.' },
      { icon: Layout, title: 'AEO/GEO Architecture', description: 'Custom JSON-LD schema for AI search engines.' }
    ],
    technicalSummary: {
      stack: ['Next.js 14', 'Supabase', 'Tailwind CSS', 'GSAP'],
      focus: ['Answer Engine Optimization', 'Performance Engineering']
    },
    quoteContent: {
      title: 'Practicing What We Preach',
      quote: '"Most agencies build digital brochures; our team builds high-velocity search engines. The CComs Revamp is our technical benchmark—a \'Growth OS\' designed to prove that speed and AEO-readiness aren\'t just features, but the foundation of modern search dominance. We didn\'t just build a site; we deployed a framework that invites the crawl and converts the user."'
    }
  },
  {
    slug: 'qr-seal',
    title: 'QR Seal',
    subtitle: 'AI-Enhanced SaaS Platform',
    category: 'SaaS Development',
    type: 'web-dev',
    images: ['/case-studies/qrseal-hero.png'],
    objective: 'Build a robust, AI-enhanced QR code management system prioritizing data ownership, security, and generative design.',
    highlights: [
      { icon: Layout, title: 'AI Integration', description: 'Generative design to transform codes into brand assets.' },
      { icon: Shield, title: 'Private Supabase', description: 'Hardened RLS for absolute data ownership.' }
    ],
    technicalSummary: {
      stack: ['Vite', 'React', 'Replicate AI', 'Lemon Squeezy'],
      focus: ['Data Ownership', 'Generative Design']
    }
  },
  {
    slug: 'pharma-niche-peptides',
    title: 'Pharma Niche: Peptides',
    subtitle: 'Domination in High-K Industries',
    category: 'E-Commerce & Authority',
    type: 'web-dev',
    images: ['/case-studies/ups-hero.png'],
    objective: 'Engineer 1st page rankings and high-performance e-commerce for high-intent keywords in the ultra-competitive research chemical sector.',
    highlights: [
      { icon: BarChart3, title: '#1 For "Peptides for Sale"', description: 'Achieved #1 position for primary high-volume head terms.' },
      { icon: Shield, title: 'Algorithm Shielding', description: 'Built Topical Authority maps that survived multiple Medic and Core updates.' }
    ],
    technicalSummary: {
      stack: ['WooCommerce', 'Topical Mapping', 'Link Engineering'],
      focus: ['Revenue-First Ranking', 'Scientific Content Strategy']
    }
  },
  {
    slug: 'real-estate-niche-gpg',
    title: 'Real Estate Niche: GPG',
    subtitle: 'National Ecosystem authority',
    category: 'Enterprise Solution',
    type: 'web-dev',
    images: ['/case-studies/gpg-hero.png'],
    objective: 'Scale a national real estate brand by creating a multi-brand regional framework that ranks across thousands of location-based keywords.',
    highlights: [
      { icon: Globe, title: 'Nationwide Authority', description: 'Consolidated fragmented domains into a singular, high-DR regional hub.' },
      { icon: MapPin, title: 'Regional Architecture', description: 'Targeted provincial keywords without duplicate content penalties.' }
    ],
    technicalSummary: {
      stack: ['Custom Page Builder', 'Advanced Caching', 'Regional SEO'],
      focus: ['Scalability', 'Geo-Targeting']
    }
  },

  // --- SEO & LOCAL SEO CATEGORY ---
  {
    slug: 'niche-real-estate',
    title: 'Niche: Real Estate',
    subtitle: '',
    category: '',
    type: 'seo',
    images: [
      '/case-studies/proofs/real-estate-proof-1.png'
    ],
    externalProofLink: 'https://photos.app.goo.gl/vguFaErhdJdDVSHPA',
    objective: '',
    highlights: [],
    technicalSummary: { stack: [], focus: [] },
    seoContent: {
      context: 'A high-performing agent trapped at a 200–300 visit-per-month plateau, struggling to break through the "local noise" of established franchises.',
      before: 'The client was "invisible" in high-intent local searches, relying on luck and low-volume traffic that failed to convert into actual sign-ups or listings.',
      strategy: 'Our team performed a Competitor Gap Analysis to identify the exact content the top 1% were using to stay ahead. We then launched a Freshness-First Content Campaign, satisfying Google’s "Freshness" algorithm while optimizing on-page technicals to ensure every pixel was working for the crawl bots.',
      after: 'A complete shift in search presence. Traffic surged as we captured the "top of mind" local intent. The result wasn\'t just higher numbers; it was a direct increase in high-value inquiries and a significant boost in agent sign-ups.',
      quoteTitle: 'CCOMS Engineering Local Dominance',
      quote: '"Most agencies throw blog posts at a local ranking problem and hope for the best. Our team treated this as a technical deficiency in \'freshness\' signals. By aligning the site\'s architecture with Google\'s demand for real-time relevance and out-maneuvering established franchises on a technical level, we didn\'t just get more clicks, we built a lead-generation engine that forced the competition out of the top results."'
    }
  },
  {
    slug: 'niche-pharma',
    title: 'Niche: Pharma',
    subtitle: '',
    category: '',
    type: 'seo',
    images: [
      '/case-studies/proofs/pharma-proof-1.png'
    ],
    externalProofLink: 'https://photos.app.goo.gl/Pk3432QorJvexuMB8',
    objective: '',
    highlights: [],
    technicalSummary: { stack: [], focus: [] },
    seoContent: {
      context: 'A peptides e-commerce site (Exact Match Domain) that was slowly collapsing under the weight of its own success and a quiet, algorithmic penalty.',
      before: 'Despite having no manual actions in Search Console, rankings were in a death spiral. The site was an EMD being used as a weapon against itself, suffering from an Over-Optimization Penalty due to excessive exact-match anchor text and keyword stuffing.',
      strategy: 'Our team executed an Anchor Profile Dilution. We treated the recovery like an ORM project, diversifying the backlink profile with branded and generic anchors while rewording on-page content to restore semantic balance. We maintained steady improvements during the "wait period," preparing the site for the next core update.',
      after: 'Once the next algorithm update rolled in, the penalty was lifted. The site didn\'t just regain its rankings; it dominated "short-tail" competitive terms, restoring organic traffic from near-collapse to a stable, healthy baseline.',
      quoteTitle: 'CCOMS Reverse-Engineering the Algorithm',
      quote: '"When this site was collapsing, other SEOs were guessing; our team was auditing. We identified a lethal over-optimization of the EMD that was triggering an algorithmic suppressor. We didn\'t just \'fix\' the site, we rebalanced its entire digital DNA, diluting toxic anchor patterns and rewriting the content to meet modern semantic standards. We recovered a brand that others said was dead by understanding the math behind the penalty."'
    }
  },
  {
    slug: 'niche-attorneys',
    title: 'Niche: Attorneys',
    subtitle: '',
    category: '',
    type: 'seo',
    images: [
      '/case-studies/proofs/legal-proof-1.png'
    ],
    externalProofLink: 'https://photos.app.goo.gl/5YiBAQQ9pgYLSuAd9',
    objective: '',
    highlights: [],
    technicalSummary: { stack: [], focus: [] },
    seoContent: {
      context: 'Our team took on two of the most expensive and competitive sub-sectors in the legal industry—high-stakes NYC family law and national financial litigation.',
      before: 'The client was being buried in the New York City market by multi-practice conglomerates with massive ad budgets, leaving them invisible for the high-value phrase "prenup lawyer ny." A firm specializing in "structured settlements" was effectively hidden on Page 3, crippled by a weak internal link structure and poor mobile performance that failed Google’s modern standards.',
      strategy: 'Instead of fighting a broad war, we deployed a "Micro-Niche Authority" campaign, building an exhaustive content silo around prenuptial agreements and using advanced Schema to hard-code E-E-A-T signals directly into the site\'s DNA. For the financial sector, our team built a massive, technical "Pillar" ecosystem supported by dozens of AEO-optimized articles designed to answer the complex queries of both human researchers and AI engines.',
      after: 'Our team achieved a Top 3 ranking for "prenup lawyer ny" and pushed the financial litigation site from Page 3 to a Top of Page One national authority for "structured settlement." Both firms now out-rank competitors who have ten times their marketing budget, turning technical excellence into a sustainable lead-generation engine.',
      quoteTitle: 'CCOMS: The Technical Verdict',
      quote: '"Most agencies treat legal SEO like a content problem; we treat it like an architectural one. Whether we are winning a local \'budget war\' in NYC or building a national knowledge ecosystem for financial litigation, our team wins by out-thinking the competition, not out-spending them. We move our clients from the obscurity of the back pages to national dominance by proving to Google, and AI that they aren\'t just lawyers, but the definitive authorities in their space."'
    }
  },
  {
    slug: 'niche-london',
    title: 'Niche: London',
    subtitle: '',
    category: '',
    type: 'seo',
    images: [
      '/case-studies/proofs/escorts-proof-1.jpg'
    ],
    externalProofLink: 'https://photos.app.goo.gl/gAnjpdbexocKxgu27',
    objective: '',
    highlights: [],
    technicalSummary: { stack: [], focus: [] },
    seoContent: {
      context: 'An early-stage CComs project in one of the world\'s most aggressive and competitive "Grey-Hat" niches.',
      before: 'Entrenched competitors had dominated for years using heavy, banner-laden pages and outdated reciprocal linking schemes.',
      strategy: 'We ignored the "old-school" playbook and built a Lightweight HTML/CSS Engine from scratch. We focused on Topical Authority through deep content and a clean, keyword-rich internal linking structure that favored crawl efficiency over reciprocal spam.',
      after: 'We proved that speed and technical architecture beat "old-school" link schemes. The site achieved Page One rankings for the most competitive keywords in the UK, outranking giants by being faster, cleaner, and more relevant.',
      quoteTitle: 'CCOMS\' Technical Authority vs. Legacy Spam',
      quote: '"In a niche built on reciprocal spam and bloated banners, our team took a \'Clean-Code\' approach. We out-ranked established titans by building a faster, lighter, and more logically structured environment. By prioritizing crawl efficiency and content depth over outdated linking tactics, we proved that superior engineering is the ultimate SEO shortcut, even in the most cutthroat markets on the web."'
    }
  }
]

export default function CaseStudiesPage() {
  const [filter, setFilter] = useState<'all' | 'web-dev' | 'seo'>('all')
  const [modalData, setModalData] = useState<{ images: string[], index: number } | null>(null)

  const filteredStudies = caseStudies.filter(study =>
    filter === 'all' || study.type === filter
  )

  const fadeInUp = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0 }
  }

  return (
    <div className="bg-white">
      {modalData && (
        <ImageModal
          images={modalData.images}
          initialIndex={modalData.index}
          onClose={() => setModalData(null)}
        />
      )}

      {/* Hero Section */}
      <section className="relative min-h-[50vh] flex items-center justify-center bg-gradient-to-br from-neutral-50 via-white to-blue-50 pt-32 pb-16 overflow-hidden">
        <div className="absolute inset-0 z-0">
          <div className="absolute top-20 left-10 w-64 h-64 bg-blue-100 rounded-full blur-3xl opacity-50 animate-pulse"></div>
          <div className="absolute bottom-20 right-10 w-96 h-96 bg-cyan-100 rounded-full blur-3xl opacity-50 animate-pulse delay-700"></div>
        </div>

        <div className="container-custom relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            <motion.div
              initial="hidden"
              animate="visible"
              variants={fadeInUp}
              transition={{ duration: 0.6 }}
            >
              <h1 className="text-6xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-neutral-900 via-blue-900 to-cyan-900 bg-clip-text text-transparent text-balance">
                Proof of Execution
              </h1>
            </motion.div>

            <motion.p
              initial="hidden"
              animate="visible"
              variants={fadeInUp}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="text-xl md:text-2xl text-neutral-600 mb-8 leading-relaxed"
            >
              We build technical benchmarks, not just projects. Explore our results across development and SEO.
            </motion.p>

            {/* Category Filter Tabs */}
            <motion.div
              initial="hidden"
              animate="visible"
              variants={fadeInUp}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="flex flex-wrap justify-center gap-4 mb-8"
            >
              {[
                { id: 'all', label: 'All Projects' },
                { id: 'web-dev', label: 'Web Development' },
                { id: 'seo', label: 'SEO & Local SEO' }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setFilter(tab.id as any)}
                  className={`px-8 py-3 rounded-full text-sm font-bold transition-all ${filter === tab.id
                    ? 'bg-blue-600 text-white shadow-xl scale-105'
                    : 'bg-white text-neutral-600 border border-neutral-200 hover:border-blue-300'
                    }`}
                >
                  {tab.label}
                </button>
              ))}
            </motion.div>
          </div>
        </div>
      </section>

      {/* Case Studies List */}
      <section className="py-24">
        <div className="container-custom">
          <div className="space-y-32">
            <AnimatePresence mode="popLayout">
              {filteredStudies.map((study, index) => (
                <motion.div
                  key={study.slug}
                  initial={{ opacity: 0, y: 50 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-100px" }}
                  transition={{ duration: 0.7, ease: "easeOut" }}
                  className={`flex flex-col ${index % 2 === 0 ? 'lg:flex-row' : 'lg:flex-row-reverse'} gap-12 lg:items-start`}
                >
                  {study.type === 'web-dev' ? (
                    // Web Dev Layout (unchanged)
                    <>
                      {/* Gallery/Carousel Side */}
                      <div className="w-full lg:w-1/2">
                        <div className="relative group rounded-2xl overflow-hidden shadow-2xl border border-neutral-200">
                          <ImageCarousel
                            images={study.images}
                            title={study.title}
                            onOpenModal={(imgIndex) => setModalData({ images: study.images, index: imgIndex })}
                          />
                        </div>
                      </div>

                      {/* Content Side */}
                      <div className="w-full lg:w-1/2">
                        <div className="space-y-4">
                          <div>
                            <span className="text-xs font-bold uppercase tracking-widest text-blue-600 mb-1 block">
                              {study.category}
                            </span>
                            <h2 className="text-3xl font-bold text-neutral-900 mb-1">
                              {study.title}
                            </h2>
                            <p className="text-xl font-medium text-neutral-500 italic">
                              {study.subtitle}
                            </p>
                          </div>

                          <p className="text-base text-neutral-600 leading-relaxed border-l-4 border-blue-600 pl-4 py-1">
                            {study.objective}
                          </p>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {study.highlights.map((highlight) => (
                              <div key={highlight.title} className="flex gap-3">
                                <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center text-blue-600">
                                  <highlight.icon className="w-4 h-4" />
                                </div>
                                <div>
                                  <h4 className="text-sm font-bold text-neutral-900 mb-1 leading-tight text-balance">
                                    {highlight.title}
                                  </h4>
                                  <p className="text-xs text-neutral-500">
                                    {highlight.description}
                                  </p>
                                </div>
                              </div>
                            ))}
                          </div>

                          {/* Built-in Quote Block */}
                          {study.quoteContent && (
                            <div className="bg-neutral-900 text-white p-5 rounded-xl relative overflow-hidden mt-2 shadow-lg border border-neutral-800">
                              <Quote className="absolute top-3 left-3 w-8 h-8 text-neutral-800 pointer-events-none" />
                              <div className="relative z-10 pl-6">
                                <h4 className="text-base font-bold text-blue-400 mb-2 border-b border-neutral-800 pb-2">
                                  {study.quoteContent.title}
                                </h4>
                                <p className="text-sm font-medium leading-relaxed italic text-neutral-300">
                                  {study.quoteContent.quote}
                                </p>
                              </div>
                            </div>
                          )}

                          {/* Technical Tag Cloud */}
                          <div className="pt-3 border-t border-neutral-100">
                            <div className="flex flex-wrap gap-2 mb-3">
                              {study.technicalSummary.stack.map(tech => (
                                <span key={tech} className="px-2 py-1 bg-neutral-100 text-neutral-700 text-xs font-semibold rounded-md uppercase tracking-wider">
                                  {tech}
                                </span>
                              ))}
                            </div>
                            <div className="flex items-center gap-2 text-xs font-bold text-blue-600">
                              <ChevronRight className="w-3 h-3" />
                              Focus: {study.technicalSummary.focus.join(' • ')}
                            </div>
                          </div>
                        </div>
                      </div>
                    </>
                  ) : (
                    // SEO Alternating Layout
                    <>
                      {/* SEO External Proof Side */}
                      <div className="w-full lg:w-1/2">
                        {study.externalProofLink ? (
                          <a href={study.externalProofLink} target="_blank" rel="noopener noreferrer" className="block w-full shadow-2xl rounded-2xl overflow-hidden border border-neutral-200 relative group bg-neutral-900/90 text-center">
                            <img src={study.images[0]} alt={study.title} className="w-full h-auto object-cover opacity-100 group-hover:opacity-40 transition-all duration-300" />
                            <div className="absolute inset-0 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
                              <Search className="w-16 h-16 text-white mb-6 drop-shadow-2xl" />
                              <span className="bg-blue-600 text-white px-8 py-4 rounded-full font-bold shadow-2xl flex items-center gap-3 transform translate-y-4 group-hover:translate-y-0 transition-all duration-300 pointer-events-auto hover:bg-blue-500">
                                View High-Res Proofs <ExternalLink className="w-5 h-5" />
                              </span>
                            </div>
                          </a>
                        ) : (
                          <div className="w-full shadow-2xl rounded-2xl overflow-hidden border border-neutral-200">
                            <img src={study.images[0]} alt={study.title} className="w-full h-auto object-cover" />
                          </div>
                        )}
                      </div>

                      {/* SEO Content Side */}
                      <div className="w-full lg:w-1/2 flex flex-col gap-8 lg:sticky lg:top-24">
                        <div>
                          <h2 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-neutral-900 to-neutral-600 bg-clip-text text-transparent mb-4">
                            {study.title}
                          </h2>
                        </div>

                        {/* SEO Story Context Content */}
                        {study.seoContent && (
                          <div className="flex flex-col gap-6 mt-2">

                            <div className="bg-neutral-50 px-6 py-4 rounded-xl border border-neutral-200 shadow-sm border-l-4 border-l-blue-600">
                              <h3 className="text-base font-bold text-neutral-900 mb-1">Context</h3>
                              <p className="text-sm text-neutral-600 leading-relaxed italic">
                                "{study.seoContent.context}"
                              </p>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <div>
                                <h3 className="text-base font-bold text-neutral-900 mb-2 flex items-center gap-2">
                                  <span className="w-6 h-6 rounded-full bg-red-100 flex items-center justify-center text-red-600 text-xs">A</span>
                                  The Before
                                </h3>
                                <p className="text-sm text-neutral-600 leading-relaxed">
                                  {study.seoContent.before}
                                </p>
                              </div>
                              <div>
                                <h3 className="text-base font-bold text-neutral-900 mb-2 flex items-center gap-2">
                                  <span className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 text-xs">B</span>
                                  The After
                                </h3>
                                <p className="text-sm text-neutral-600 leading-relaxed">
                                  {study.seoContent.after}
                                </p>
                              </div>
                            </div>

                            <div className="bg-blue-600 text-white rounded-2xl p-6 shadow-lg relative overflow-hidden">
                              <div className="absolute top-0 right-0 -mt-6 -mr-6 w-32 h-32 bg-white/10 rounded-full blur-2xl"></div>
                              <h3 className="text-lg font-bold mb-2 relative z-10 flex items-center gap-2">
                                <Zap className="w-5 h-5 text-yellow-300" />
                                The CComs Strategy
                              </h3>
                              <p className="text-sm leading-relaxed relative z-10 text-blue-50">
                                {study.seoContent.strategy}
                              </p>
                            </div>

                            <div className="bg-neutral-900 text-white p-6 md:p-8 rounded-2xl relative overflow-hidden shadow-xl border border-neutral-800">
                              <Quote className="absolute top-4 left-4 w-12 h-12 text-neutral-800 pointer-events-none" />
                              <div className="relative z-10 pl-4 md:pl-8">
                                <h4 className="text-xl font-bold text-blue-400 mb-4 border-b border-neutral-800 pb-3">
                                  {study.seoContent.quoteTitle}
                                </h4>
                                <p className="text-sm md:text-base font-medium leading-relaxed italic text-neutral-300">
                                  {study.seoContent.quote}
                                </p>
                              </div>
                            </div>

                          </div>
                        )}
                      </div>
                    </>
                  )}
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="section-padding bg-neutral-900 text-white relative overflow-hidden">
        <div className="absolute inset-0 opacity-10 pointer-events-none">
          <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-blue-500 via-transparent to-transparent"></div>
        </div>

        <div className="container-custom relative z-10 text-center">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeInUp}
            className="max-w-3xl mx-auto"
          >
            <h2 className="text-white text-5xl font-bold mb-6 text-balance">
              If you want these results, book a call.
            </h2>
            <p className="text-xl text-neutral-400 mb-10 leading-relaxed">
              We deliver rankings and codebases that move the bottom line. Let's discuss your next project.
            </p>
            <div className="flex justify-center">
              <a href="https://calendar.app.google/sSZytJFNEdDVeZ8k8" target="_blank" className="bg-gradient-to-r from-blue-600 to-cyan-600 text-white px-8 py-4 rounded-xl font-semibold text-lg hover:shadow-2xl hover:scale-105 transition-all duration-300">
                Book a Call
              </a>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  )
}

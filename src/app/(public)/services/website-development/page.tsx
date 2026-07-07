'use client'

import { useRef, useState, Fragment } from 'react'
import { motion, useInView } from 'framer-motion'
import Link from 'next/link'
import { Code, CheckCircle2, ArrowRight, Zap, Shield, Layers, Globe, Smartphone, BarChart3, Check, X, Star, ShoppingCart } from 'lucide-react'

function AnimatedSection({ children, className = "" }: { children: React.ReactNode, className?: string }) {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: "-100px" })

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 50 }}
      animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 50 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className={className}
    >
      {children}
    </motion.div>
  )
}

export default function WebsiteDevelopmentPage() {
  const services = [
    {
      icon: Code,
      title: 'Custom Web Applications',
      description: 'Built from scratch with modern frameworks and clean architecture',
      color: 'from-blue-600 to-cyan-600'
    },
    {
      icon: Layers,
      title: 'CMS Development',
      description: 'Flexible content management tailored to your workflow',
      color: 'from-green-600 to-emerald-600'
    },
    {
      icon: Zap,
      title: 'Performance Optimization',
      description: 'Lightning-fast load times and Core Web Vitals compliance',
      color: 'from-orange-600 to-red-600'
    },
    {
      icon: Smartphone,
      title: 'Responsive Design',
      description: 'Flawless experience across all devices and screen sizes',
      color: 'from-purple-600 to-pink-600'
    }
  ]

  const features = [
    { icon: Zap, title: 'Lightning Performance', desc: 'Optimized for speed with sub-second load times' },
    { icon: Shield, title: 'Security First', desc: 'Built with modern security best practices' },
    { icon: Globe, title: 'SEO-Ready', desc: 'Search engine optimized from day one' },
    { icon: Layers, title: 'Scalable Architecture', desc: 'Grows with your business needs' },
    { icon: BarChart3, title: 'Analytics Integration', desc: 'Track everything that matters' },
    { icon: Code, title: 'Clean Codebase', desc: 'Maintainable and well-documented code' }
  ]

  const technologies = [
    { name: 'Next.js', desc: 'Modern React framework for production' },
    { name: 'TypeScript', desc: 'Type-safe development' },
    { name: 'Tailwind CSS', desc: 'Utility-first styling' },
    { name: 'Node.js', desc: 'Scalable backend solutions' },
    { name: 'PostgreSQL', desc: 'Reliable database management' },
    { name: 'AWS/Vercel', desc: 'Cloud hosting and deployment' }
  ]

  const process = [
    {
      title: 'Discovery & Planning',
      description: 'We understand your goals, audience, and technical requirements'
    },
    {
      title: 'Design & Architecture',
      description: 'We plan the structure, flow, and technical foundation'
    },
    {
      title: 'Development',
      description: 'We build with clean code, best practices, and continuous testing'
    },
    {
      title: 'Optimization',
      description: 'We fine-tune performance, SEO, and user experience'
    },
    {
      title: 'Launch & Support',
      description: 'We deploy, monitor, and provide ongoing maintenance'
    }
  ]

  const benefits = [
    'Sites that load in under 2 seconds',
    'Mobile-first responsive design',
    'SEO-optimized architecture',
    'Clean, maintainable code',
    'Secure and scalable infrastructure',
    'Analytics and tracking integration',
    'Ongoing support and maintenance',
    'Performance monitoring'
  ]

  // ── Packages & Pricing ──────────────────────────────────────────────
  const [pricingTab, setPricingTab] = useState<'core' | 'ecommerce'>('core')

  const coreTiers = [
    { name: 'Landing Page', price: '₱5,995', badge: '', star: false, promo: '', header: 'bg-gradient-to-br from-slate-600 to-slate-800', solid: 'bg-slate-700 hover:bg-slate-800', highlight: false, highlightBg: '' },
    { name: 'Starter', price: '₱14,995', badge: '', star: false, promo: '', header: 'bg-gradient-to-br from-blue-500 to-blue-600', solid: 'bg-blue-600 hover:bg-blue-700', highlight: false, highlightBg: '' },
    { name: 'Professional', price: '₱24,995', badge: 'MOST POPULAR', star: true, promo: '10%', header: 'bg-gradient-to-br from-cyan-400 to-teal-500', solid: 'bg-cyan-500 hover:bg-cyan-600', highlight: true, highlightBg: 'bg-cyan-50/60' },
    { name: 'Business', price: '₱49,995', badge: 'FULL PACKAGE', star: false, promo: '20%', header: 'bg-gradient-to-br from-purple-600 to-violet-700', solid: 'bg-purple-600 hover:bg-purple-700', highlight: false, highlightBg: '' },
  ]

  const ecomTiers = [
    { name: 'E-commerce Basic', price: '₱15,995', badge: '', star: false, promo: '', header: 'bg-gradient-to-br from-emerald-500 to-teal-600', solid: 'bg-emerald-600 hover:bg-emerald-700', highlight: false, highlightBg: '' },
    { name: 'E-commerce Advanced', price: '₱59,995', badge: 'BEST VALUE', star: true, promo: '', header: 'bg-gradient-to-br from-orange-500 to-red-500', solid: 'bg-orange-500 hover:bg-orange-600', highlight: true, highlightBg: 'bg-orange-50/60' },
  ]

  const coreSections = [
    {
      title: 'Overview',
      rows: [
        { label: 'Pages', values: ['1 Page', 'Up to 5', 'Up to 25', 'Up to 50'] },
        { label: 'Design', values: ['Custom unique layout', 'Template-based', 'Custom unique layouts', 'Fully custom + brand identity'] },
        { label: 'CMS', values: [false, 'Basic', 'Robust CMS', 'Advanced CMS'] },
        { label: 'SEO', values: ['Basic on-page', 'Basic on-page', 'Professional on-page', 'Advanced + Search Console'] },
        { label: 'Custom Logo', values: [false, false, true, true] },
        { label: 'Blog Setup', values: [false, 'Contact Sales', true, true] },
      ],
    },
    {
      title: 'Included',
      rows: [
        { label: 'Responsive Design', values: [true, true, true, true] },
        { label: 'SSL Certificate', values: [true, true, true, true] },
        { label: 'Google Analytics', values: [true, true, true, 'Advanced + Reporting'] },
        { label: 'Google Maps', values: [false, false, true, true] },
        { label: 'Newsletter', values: [false, 'Contact Sales', 'Contact Sales', 'By Request'] },
        { label: 'Live Chat', values: [false, 'Contact Sales', 'Contact Sales', 'By Request'] },
        { label: 'Third-party Integrations', values: ['By Request', 'By Request', 'Up to 3', 'Up to 5'] },
        { label: 'Support/Ticketing', values: ['By Request', 'By Request', 'Contact Sales', 'By Request'] },
      ],
    },
    {
      title: 'Support & Ops',
      rows: [
        { label: 'Email Support', values: [true, true, true, true] },
        { label: 'Priority Support', values: [false, false, true, true] },
        { label: 'Chat Support', values: [false, false, false, true] },
        { label: 'Backups', values: ['Monthly', 'Monthly', 'Weekly', 'Weekly + security'] },
        { label: 'Domain Email', values: ['1 (Free 1 yr)', '5 (Free 1 yr)', '10 (Free 1 yr)', '20 (Free 1 yr)'] },
      ],
    },
    {
      title: 'Hosting',
      rows: [
        { label: 'Hosting', values: ['1 Year', '1 Year', '1 Year', '1 Year + Domain'] },
        { label: '4 CPU / 4GB RAM / 100GB NVMe + CDN', values: [true, true, true, true] },
      ],
    },
  ]

  const ecomSections = [
    {
      title: 'Overview',
      rows: [
        { label: 'Products', values: ['< 50 Products', '≥ 200 Products'] },
        { label: 'Design', values: ['Template-based', 'Custom unique layouts'] },
        { label: 'CMS', values: ['Basic Admin/User', 'Advanced Admin/User'] },
        { label: 'SEO', values: ['Basic E-commerce On-Page', 'Advanced E-commerce On-Page'] },
        { label: 'Custom Logo', values: [false, true] },
        { label: 'Blog Setup', values: [true, true] },
      ],
    },
    {
      title: 'Included',
      rows: [
        { label: 'Responsive Design', values: [true, true] },
        { label: 'SSL Certificate', values: [true, true] },
        { label: 'Google Analytics', values: [true, true] },
        { label: 'Google Maps', values: [true, true] },
        { label: 'Newsletter', values: [true, true] },
        { label: 'Live Chat (Human/AI)', values: ['Contact Sales', true] },
        { label: 'Third-party Integrations', values: ['Contact Sales', 'Up to 5'] },
        { label: 'Support/Ticketing', values: ['Contact Sales', 'Robust'] },
      ],
    },
    {
      title: 'Support & Ops',
      rows: [
        { label: 'Email Support', values: [true, true] },
        { label: 'Priority Support', values: [true, true] },
        { label: 'Chat Support', values: [false, true] },
        { label: 'Backups', values: ['Monthly', 'Weekly + security'] },
        { label: 'Domain Email', values: ['10 (Free 1 yr)', '25 (Free 1 yr)'] },
      ],
    },
    {
      title: 'Hosting',
      rows: [
        { label: 'Hosting', values: ['1 Year + Domain', '1 Year + Domain'] },
        { label: '4 CPU / 4GB RAM / 100GB NVMe + CDN', values: [true, true] },
      ],
    },
  ]

  const pricingTiers = pricingTab === 'core' ? coreTiers : ecomTiers
  const pricingSections = pricingTab === 'core' ? coreSections : ecomSections
  const pricingGrid = pricingTab === 'core'
    ? 'grid grid-cols-[180px_repeat(4,minmax(0,1fr))]'
    : 'grid grid-cols-[180px_repeat(2,minmax(0,1fr))]'
  const pricingMinWidth = pricingTab === 'core' ? 'min-w-[860px]' : 'min-w-[560px]'

  const renderPriceCell = (val: boolean | string) => {
    if (val === true) return <Check className="w-5 h-5 text-emerald-500" strokeWidth={2.5} />
    if (val === false) return <X className="w-5 h-5 text-red-400" strokeWidth={2.5} />
    return <span className="text-sm text-gray-700 font-medium">{val}</span>
  }

  return (
    <div className="relative overflow-hidden">
      <section className="relative min-h-[70vh] flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-cyan-50 pt-32 pb-16 overflow-hidden">
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-20 right-20 w-96 h-96 bg-blue-400 rounded-full mix-blend-multiply filter blur-3xl animate-blob"></div>
          <div className="absolute bottom-20 left-20 w-96 h-96 bg-cyan-400 rounded-full mix-blend-multiply filter blur-3xl animate-blob animation-delay-2000"></div>
        </div>

        <div className="container-custom relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="inline-block mb-6"
            >
              <span className="px-4 py-2 bg-gradient-to-r from-blue-600 to-cyan-600 text-white text-sm font-semibold rounded-full shadow-lg">
                Website Development
              </span>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="text-5xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-gray-900 via-blue-800 to-cyan-800 bg-clip-text text-transparent leading-tight"
            >
              Websites Built to Last
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="text-xl md:text-2xl text-gray-600 mb-8 leading-relaxed"
            >
              Fast, SEO-ready builds engineered for speed, stability, and scalable growth. Custom and CMS solutions that perform.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
            >
              <a href="/contact" className="inline-block bg-gradient-to-r from-blue-600 to-cyan-600 text-white px-8 py-4 rounded-xl font-semibold text-lg hover:shadow-2xl hover:scale-105 transition-all duration-300">
                Start Your Project
              </a>
            </motion.div>
          </div>
        </div>

        <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-white to-transparent"></div>
      </section>

      <section className="py-24 bg-white">
        <div className="container-custom">
          <div className="max-w-5xl mx-auto">
            <AnimatedSection>
              <h2 className="text-4xl md:text-5xl font-bold mb-16 text-gray-900 text-center">
                What We Build
              </h2>
            </AnimatedSection>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {services.map((service, index) => {
                const Icon = service.icon
                return (
                  <AnimatedSection key={index}>
                    <div className="h-full p-8 bg-gradient-to-br from-blue-50 to-cyan-50 rounded-2xl border border-blue-200 hover:border-blue-400 hover:shadow-xl transition-all duration-300 group">
                      <div className={`w-16 h-16 bg-gradient-to-br ${service.color} rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300`}>
                        <Icon className="w-8 h-8 text-white" />
                      </div>
                      <h3 className="text-2xl font-bold text-gray-900 mb-3">{service.title}</h3>
                      <p className="text-gray-600 leading-relaxed text-lg">{service.description}</p>
                    </div>
                  </AnimatedSection>
                )
              })}
            </div>
          </div>
        </div>
      </section>

      <section className="py-24 bg-gradient-to-br from-blue-50 via-white to-cyan-50">
        <div className="container-custom">
          <div className="max-w-6xl mx-auto">
            <AnimatedSection>
              <h2 className="text-4xl md:text-5xl font-bold mb-4 text-gray-900 text-center">
                Built for Performance
              </h2>
              <p className="text-xl text-gray-600 mb-16 text-center">
                Every site we build prioritizes speed, security, and scalability
              </p>
            </AnimatedSection>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {features.map((feature, index) => {
                const Icon = feature.icon
                return (
                  <AnimatedSection key={index}>
                    <div className="h-full p-6 bg-white rounded-2xl border border-gray-200 hover:border-blue-400 hover:shadow-xl transition-all duration-300 group">
                      <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-cyan-600 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                        <Icon className="w-6 h-6 text-white" />
                      </div>
                      <h3 className="text-xl font-bold text-gray-900 mb-2">{feature.title}</h3>
                      <p className="text-gray-600 leading-relaxed">{feature.desc}</p>
                    </div>
                  </AnimatedSection>
                )
              })}
            </div>
          </div>
        </div>
      </section>

      <section className="py-24 bg-white">
        <div className="container-custom">
          <div className="max-w-5xl mx-auto">
            <AnimatedSection>
              <h2 className="text-4xl md:text-5xl font-bold mb-4 text-gray-900 text-center">
                Our Technology Stack
              </h2>
              <p className="text-xl text-gray-600 mb-16 text-center">
                Modern tools and frameworks for production-ready applications
              </p>
            </AnimatedSection>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {technologies.map((tech, index) => (
                <AnimatedSection key={index}>
                  <div className="p-6 bg-gradient-to-br from-blue-50 to-cyan-50 rounded-2xl border border-blue-200 hover:border-blue-400 hover:shadow-lg transition-all duration-300">
                    <h3 className="text-xl font-bold text-gray-900 mb-2">{tech.name}</h3>
                    <p className="text-gray-600">{tech.desc}</p>
                  </div>
                </AnimatedSection>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="py-24 bg-gradient-to-br from-blue-50 via-white to-cyan-50">
        <div className="container-custom">
          <div className="max-w-4xl mx-auto">
            <AnimatedSection>
              <h2 className="text-4xl md:text-5xl font-bold mb-4 text-gray-900 text-center">
                Our Process
              </h2>
              <p className="text-xl text-gray-600 mb-16 text-center">
                From concept to launch and beyond
              </p>
            </AnimatedSection>

            <div className="space-y-6">
              {process.map((step, index) => (
                <AnimatedSection key={index}>
                  <div className="flex items-start gap-6 p-8 bg-white rounded-2xl border border-gray-200 hover:border-blue-400 hover:shadow-xl transition-all duration-300 group">
                    <div className="flex-shrink-0">
                      <div className="w-14 h-14 bg-gradient-to-br from-blue-600 to-cyan-600 rounded-xl flex items-center justify-center text-white font-bold text-xl group-hover:scale-110 transition-transform duration-300">
                        {index + 1}
                      </div>
                    </div>
                    <div className="flex-1">
                      <h3 className="text-2xl font-bold text-gray-900 mb-2">{step.title}</h3>
                      <p className="text-gray-600 leading-relaxed text-lg">{step.description}</p>
                    </div>
                  </div>
                </AnimatedSection>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="py-24 bg-white">
        <div className="container-custom">
          <div className="max-w-4xl mx-auto">
            <AnimatedSection>
              <h2 className="text-4xl md:text-5xl font-bold mb-16 text-gray-900 text-center">
                What You Get
              </h2>
            </AnimatedSection>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {benefits.map((benefit, index) => (
                <AnimatedSection key={index}>
                  <div className="flex items-start gap-4 p-6 bg-gradient-to-r from-blue-50 to-cyan-50 rounded-2xl border border-blue-200 hover:border-blue-400 hover:shadow-lg transition-all duration-300 group">
                    <div className="flex-shrink-0">
                      <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-cyan-600 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                        <CheckCircle2 className="w-6 h-6 text-white" />
                      </div>
                    </div>
                    <p className="text-lg text-gray-700 leading-relaxed pt-1">{benefit}</p>
                  </div>
                </AnimatedSection>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Packages & Pricing */}
      <section className="py-24 bg-slate-50">
        <div className="container-custom">
          <AnimatedSection>
            <h2 className="text-4xl md:text-5xl font-bold mb-3 text-gray-900 text-center">
              Packages &amp; Pricing
            </h2>
            <p className="text-lg text-gray-500 mb-8 text-center">
              Everything you need to launch, grow, and scale — with no hidden fees.
            </p>

            {/* Toggle */}
            <div className="flex justify-center mb-10">
              <div className="inline-flex items-center gap-1 p-1 bg-white border border-gray-200 rounded-full shadow-sm">
                <button
                  onClick={() => setPricingTab('core')}
                  className={`px-5 py-2 rounded-full text-sm font-semibold transition-colors ${
                    pricingTab === 'core'
                      ? 'bg-gradient-to-r from-blue-600 to-cyan-600 text-white shadow'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  Core Packages
                </button>
                <button
                  onClick={() => setPricingTab('ecommerce')}
                  className={`px-5 py-2 rounded-full text-sm font-semibold transition-colors flex items-center gap-1.5 ${
                    pricingTab === 'ecommerce'
                      ? 'bg-gradient-to-r from-emerald-500 to-teal-600 text-white shadow'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  <ShoppingCart className="w-4 h-4" />
                  E-commerce
                </button>
              </div>
            </div>

            {/* Comparison table */}
            <div className="max-w-6xl mx-auto overflow-x-auto pb-2">
              <div className={pricingMinWidth}>
                <div className={`${pricingGrid} bg-white border border-gray-200 rounded-2xl`}>
                  {/* Header row */}
                  <div className="flex items-center px-5 pt-10 pb-4">
                    <span className="text-sm font-medium text-gray-500">Plans</span>
                  </div>
                  {pricingTiers.map((tier) => (
                    <div key={tier.name} className="px-1.5 pt-10 pb-4">
                      <div className={`${tier.header} rounded-2xl shadow-lg p-4 text-white text-center flex flex-col h-full relative`}>
                        {tier.promo && (
                          <div className="absolute -top-2 -right-2 bg-yellow-400 text-gray-900 text-xs font-extrabold px-2.5 py-1 rounded-full shadow-lg ring-2 ring-white rotate-6 animate-pulse">
                            {tier.promo} OFF
                          </div>
                        )}
                        <div className="h-5 flex items-center justify-center gap-1 text-[10px] font-bold uppercase tracking-wider opacity-95">
                          {tier.star && <Star className="w-3 h-3 fill-current" />}
                          {tier.badge}
                        </div>
                        <h3 className="text-base font-bold leading-tight">{tier.name}</h3>
                        <div className="text-2xl font-extrabold mt-1">{tier.price}</div>
                        <div className="text-[11px] opacity-80 mb-3">50% DP · 50% on approval</div>
                        <button className="mt-auto bg-white/20 hover:bg-white/30 text-white text-sm font-semibold py-2 rounded-lg transition-colors">
                          Get Started
                        </button>
                      </div>
                    </div>
                  ))}

                  {/* Feature sections */}
                  {pricingSections.map((section) => (
                    <Fragment key={section.title}>
                      <div className="col-span-full bg-gray-50 px-5 py-2 text-xs font-semibold uppercase tracking-wider text-gray-400 border-y border-gray-100">
                        {section.title}
                      </div>
                      {section.rows.map((row) => (
                        <Fragment key={row.label}>
                          <div className="px-5 py-3.5 text-sm text-gray-600 border-b border-gray-100 flex items-center">
                            {row.label}
                          </div>
                          {row.values.map((val, i) => (
                            <div
                              key={i}
                              className={`px-3 py-3.5 border-b border-gray-100 flex items-center justify-center text-center ${
                                pricingTiers[i].highlight ? pricingTiers[i].highlightBg : ''
                              }`}
                            >
                              {renderPriceCell(val)}
                            </div>
                          ))}
                        </Fragment>
                      ))}
                    </Fragment>
                  ))}

                  {/* Footer button row */}
                  <div className="px-5 py-5" />
                  {pricingTiers.map((tier) => (
                    <div
                      key={tier.name}
                      className={`px-3 py-5 flex justify-center ${tier.highlight ? tier.highlightBg : ''}`}
                    >
                      <a
                        href="/contact"
                        className={`${tier.solid} text-white text-sm font-semibold px-5 py-2 rounded-lg transition-colors`}
                      >
                        Get Started
                      </a>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <p className="text-center text-sm text-gray-400 mt-6">
              2-term installment on all packages: 50% downpayment to start · 50% upon completion and your approval.
              <br />
              All packages include 4 CPU · 4GB RAM · 100GB NVMe SSD · CDN.{' '}
              <Link href="/contact" className="text-blue-600 font-medium hover:text-cyan-600">
                Contact us
              </Link>{' '}
              for hosting upgrades or custom requirements.
            </p>
          </AnimatedSection>
        </div>
      </section>

      <section className="py-24 bg-gradient-to-br from-blue-50 via-white to-cyan-50">
        <div className="container-custom">
          <div className="max-w-4xl mx-auto">
            <AnimatedSection>
              <div className="bg-white rounded-2xl p-8 md:p-12 border border-gray-200 shadow-xl">
                <h2 className="text-3xl md:text-4xl font-bold mb-6 text-gray-900">
                  Technical Excellence Meets Business Goals
                </h2>
                <p className="text-lg text-gray-700 leading-relaxed mb-6">
                  We don't just build websites—we create digital assets that drive business results. Every line of code is written with performance, security, and maintainability in mind.
                </p>
                <p className="text-lg text-gray-700 leading-relaxed mb-6">
                  Our founder, John Paul Carrasco, has 15 years of hands-on experience in web development and SEO. This technical depth ensures your website isn't just beautiful—it's built to rank, convert, and scale.
                </p>
                <Link href="/about" className="inline-flex items-center text-blue-600 font-semibold hover:text-cyan-600 transition-colors text-lg">
                  Learn more about CCOMS <ArrowRight className="ml-2 w-5 h-5" />
                </Link>
              </div>
            </AnimatedSection>
          </div>
        </div>
      </section>

      <section className="py-24 bg-gradient-to-br from-blue-600 via-cyan-600 to-blue-700 text-white relative overflow-hidden">
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-0 left-0 w-full h-full bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxwYXRoIGQ9Ik0zNiAxOGMzLjMxNCAwIDYgMi42ODYgNiA2cy0yLjY4NiA2LTYgNi02LTIuNjg2LTYtNiAyLjY4Ni02IDYtNnoiIHN0cm9rZT0iI2ZmZiIgc3Ryb2tlLXdpZHRoPSIwLjUiIG9wYWNpdHk9IjAuMyIvPjwvZz48L3N2Zz4=')] opacity-30"></div>
        </div>

        <div className="container-custom relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            <AnimatedSection>
              <h2 className="text-4xl md:text-5xl font-bold mb-6 text-white">
                Ready to build something great?
              </h2>

              <p className="text-xl text-blue-100 mb-12 leading-relaxed">
                Let's discuss your project and create a website that drives real business results.
              </p>

              <a href="/contact" className="inline-block bg-white text-blue-600 px-8 py-4 rounded-xl font-semibold text-lg hover:shadow-2xl hover:scale-105 transition-all duration-300">
                Start Your Project
              </a>
            </AnimatedSection>
          </div>
        </div>
      </section>

      <style jsx>{`
        @keyframes blob {
          0% { transform: translate(0px, 0px) scale(1); }
          33% { transform: translate(30px, -50px) scale(1.1); }
          66% { transform: translate(-20px, 20px) scale(0.9); }
          100% { transform: translate(0px, 0px) scale(1); }
        }
        .animate-blob {
          animation: blob 7s infinite;
        }
        .animation-delay-2000 {
          animation-delay: 2s;
        }
      `}</style>
    </div>
  )
}

'use client'

import { useRef, useState } from 'react'
import { motion, useInView } from 'framer-motion'
import Link from 'next/link'
import { Code, CheckCircle2, ArrowRight, Zap, Shield, Layers, Globe, Smartphone, BarChart3, X, Check, Star, ShoppingCart } from 'lucide-react'

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

type CellVal = boolean | string

const coreRows: { label: string; group?: string; vals: CellVal[] }[] = [
  { label: 'Pages', group: 'Overview', vals: ['1 Page', 'Up to 5', 'Up to 25', 'Up to 50'] },
  { label: 'Design', vals: ['Custom unique layout', 'Template-based', 'Custom unique layouts', 'Fully custom + brand identity'] },
  { label: 'CMS', vals: [false, 'Basic', 'Robust CMS', 'Advanced CMS'] },
  { label: 'SEO', vals: ['Basic on-page', 'Basic on-page', 'Professional on-page', 'Advanced + Search Console'] },
  { label: 'Custom Logo', vals: [false, false, false, true] },
  { label: 'Blog Setup', vals: [false, 'Contact Sales', true, true] },
  { label: 'Responsive Design', group: 'Included', vals: [true, true, true, true] },
  { label: 'SSL Certificate', vals: [true, true, true, true] },
  { label: 'Google Analytics', vals: [true, true, true, 'Advanced + Reporting'] },
  { label: 'Google Maps', vals: [false, false, 'Contact Sales', true] },
  { label: 'Newsletter', vals: [false, 'Contact Sales', 'Contact Sales', 'By Request'] },
  { label: 'Live Chat', vals: [false, 'Contact Sales', 'Contact Sales', 'By Request'] },
  { label: 'Third-party Integrations', vals: ['By Request', 'By Request', 'Contact Sales', 'Up to 5'] },
  { label: 'Support/Ticketing', vals: ['By Request', 'By Request', 'Contact Sales', 'By Request'] },
  { label: 'Email Support', group: 'Support & Ops', vals: [true, true, true, true] },
  { label: 'Priority Support', vals: [false, false, true, true] },
  { label: 'Chat Support', vals: [false, false, false, true] },
  { label: 'Backups', vals: ['Monthly', 'Monthly', 'Weekly', 'Weekly + security'] },
  { label: 'Domain Email', vals: ['1 (Free 1 yr)', '5 (Free 1 yr)', '10 (Free 1 yr)', '20 (Free 1 yr)'] },
  { label: 'Hosting', group: 'Hosting', vals: ['1 Year', '1 Year', '1 Year', '1 Year + Domain'] },
  { label: '4 CPU / 4GB RAM / 100GB NVMe + CDN', vals: [true, true, true, true] },
]

const ecomRows: { label: string; group?: string; vals: CellVal[] }[] = [
  { label: 'Products', group: 'Overview', vals: ['< 50 Products', '≥ 200 Products'] },
  { label: 'Design', vals: ['Template-based', 'Custom unique layouts'] },
  { label: 'CMS', vals: ['Basic Admin/User', 'Advanced Admin/User'] },
  { label: 'SEO', vals: ['Basic E-commerce On-Page', 'Advanced E-commerce On-Page'] },
  { label: 'Custom Logo', vals: [false, true] },
  { label: 'Blog Setup', vals: [true, true] },
  { label: 'Responsive Design', group: 'Included', vals: [true, true] },
  { label: 'SSL Certificate', vals: [true, true] },
  { label: 'Google Analytics', vals: [true, true] },
  { label: 'Google Maps', vals: [true, true] },
  { label: 'Newsletter', vals: [true, true] },
  { label: 'Live Chat (Human/AI)', vals: ['Contact Sales', true] },
  { label: 'Third-party Integrations', vals: ['Contact Sales', 'Up to 5'] },
  { label: 'Support/Ticketing', vals: ['Contact Sales', 'Robust'] },
  { label: 'Email Support', group: 'Support & Ops', vals: [true, true] },
  { label: 'Priority Support', vals: [true, true] },
  { label: 'Chat Support', vals: [false, true] },
  { label: 'Backups', vals: ['Monthly', 'Weekly + security'] },
  { label: 'Domain Email', vals: ['10 (Free 1 yr)', '25 (Free 1 yr)'] },
  { label: 'Hosting', group: 'Hosting', vals: ['1 Year + Domain', '1 Year + Domain'] },
  { label: '4 CPU / 4GB RAM / 100GB NVMe + CDN', vals: [true, true] },
]

const corePackages = [
  { name: 'Landing Page', price: '₱2,995', color: 'from-slate-600 to-slate-700', popular: false, badge: null },
  { name: 'Starter', price: '₱4,995', color: 'from-blue-500 to-blue-600', popular: false, badge: null },
  { name: 'Professional', price: '₱7,995', color: 'from-blue-600 to-cyan-500', popular: true, badge: '⭐ Most Popular' },
  { name: 'Enterprise', price: '₱39,995', color: 'from-violet-600 to-purple-700', popular: false, badge: 'Full Package' },
]

const ecomPackages = [
  { name: 'E-commerce Basic', price: '₱15,995', color: 'from-emerald-500 to-teal-600', popular: false, badge: null },
  { name: 'E-commerce Advanced', price: '₱59,995', color: 'from-orange-500 to-rose-600', popular: true, badge: '⭐ Best Value' },
]

function Cell({ val, highlight }: { val: CellVal; highlight: boolean }) {
  const base = highlight ? 'bg-blue-50/60' : ''
  if (val === true) return (
    <td className={`text-center py-3.5 px-3 ${base}`}>
      <Check className="w-5 h-5 text-emerald-500 mx-auto" strokeWidth={3} />
    </td>
  )
  if (val === false) return (
    <td className={`text-center py-3.5 px-3 ${base}`}>
      <X className="w-4 h-4 text-rose-500 mx-auto" strokeWidth={3} />
    </td>
  )
  return (
    <td className={`text-center py-3.5 px-3 text-sm font-semibold text-gray-800 leading-tight ${base}`}>
      {val}
    </td>
  )
}

export default function WebsiteDevelopmentPage() {
  const [activeTab, setActiveTab] = useState<'core' | 'ecommerce'>('core')
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
                  Our founder, John Paul Carrasco, has 14 years of hands-on experience in web development and SEO. This technical depth ensures your website isn't just beautiful—it's built to rank, convert, and scale.
                </p>
                <Link href="/about" className="inline-flex items-center text-blue-600 font-semibold hover:text-cyan-600 transition-colors text-lg">
                  Learn more about CCOMS <ArrowRight className="ml-2 w-5 h-5" />
                </Link>
              </div>
            </AnimatedSection>
          </div>
        </div>
      </section>

      {/* PACKAGES SECTION — hidden until ready for public */}
      <section className="hidden py-24 bg-gradient-to-b from-gray-50 to-white" id="packages">
        <div className="container-custom">
          <AnimatedSection>
            <div className="text-center mb-4">
              <span className="px-4 py-2 bg-gradient-to-r from-blue-600 to-cyan-600 text-white text-sm font-semibold rounded-full shadow-lg">
                Transparent Pricing
              </span>
            </div>
            <h2 className="text-4xl md:text-5xl font-bold mb-4 text-gray-900 text-center">
              Packages & Pricing
            </h2>
            <p className="text-xl text-gray-500 mb-10 text-center max-w-2xl mx-auto">
              Everything you need to launch, grow, and scale — with no hidden fees.
            </p>

            {/* Tab Switcher */}
            <div className="flex justify-center mb-10">
              <div className="inline-flex bg-white border border-gray-200 rounded-2xl p-1.5 gap-1 shadow-sm">
                <button
                  onClick={() => setActiveTab('core')}
                  className={`px-7 py-3 rounded-xl text-sm font-semibold transition-all duration-300 ${activeTab === 'core' ? 'bg-gradient-to-r from-blue-600 to-cyan-600 text-white shadow-md' : 'text-gray-500 hover:text-gray-700'}`}
                >
                  Core Packages
                </button>
                <button
                  onClick={() => setActiveTab('ecommerce')}
                  className={`px-7 py-3 rounded-xl text-sm font-semibold transition-all duration-300 flex items-center gap-2 ${activeTab === 'ecommerce' ? 'bg-gradient-to-r from-emerald-500 to-teal-600 text-white shadow-md' : 'text-gray-500 hover:text-gray-700'}`}
                >
                  <ShoppingCart className="w-4 h-4" /> E-commerce
                </button>
              </div>
            </div>
          </AnimatedSection>

          {/* Core Packages Table */}
          {activeTab === 'core' && (
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.35 }}
              className="overflow-x-auto rounded-3xl border border-gray-200 shadow-xl bg-white"
            >
              <table className="w-full min-w-[700px] border-collapse">
                <thead>
                  <tr>
                    <th className="text-left py-5 px-6 bg-gray-50 text-sm font-semibold text-gray-500 w-[220px] border-b border-gray-200">
                      Plans
                    </th>
                    {corePackages.map((pkg, i) => (
                      <th key={i} className={`py-0 px-3 border-b border-gray-200 ${pkg.popular ? 'relative' : ''}`}>
                        <div className={`bg-gradient-to-br ${pkg.color} text-white px-4 py-5 ${i === 0 ? 'rounded-tl-2xl' : ''} ${i === corePackages.length - 1 ? 'rounded-tr-2xl' : ''}`}>
                          {pkg.badge && (
                            <div className="text-[10px] font-bold tracking-wider uppercase text-white/80 mb-1">{pkg.badge}</div>
                          )}
                          <div className="text-base font-bold">{pkg.name}</div>
                          <div className="text-2xl font-extrabold mt-1">{pkg.price}</div>
                          <div className="text-[10px] text-white/60 mb-3">one-time fee</div>
                          <Link
                            href="/contact"
                            className="inline-block w-full text-center py-2 rounded-xl bg-white/20 hover:bg-white/30 text-white text-xs font-bold transition-all duration-200 border border-white/30 hover:border-white/50"
                          >
                            Get Started
                          </Link>
                        </div>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {coreRows.map((row, ri) => (
                    <>
                      {row.group && (
                        <tr key={`group-${ri}`}>
                          <td colSpan={5} className="py-3 px-6 bg-gray-50 text-xs font-bold text-gray-400 uppercase tracking-widest border-t border-gray-100">
                            {row.group}
                          </td>
                        </tr>
                      )}
                      <tr key={ri} className={`border-t border-gray-100 ${ri % 2 === 0 ? 'bg-white' : 'bg-gray-50/40'} hover:bg-blue-50/30 transition-colors`}>
                        <td className="py-3.5 px-6 text-sm text-gray-600 font-medium">{row.label}</td>
                        {row.vals.map((val, vi) => (
                          <Cell key={vi} val={val} highlight={vi === 2} />
                        ))}
                      </tr>
                    </>
                  ))}
                  <tr className="border-t border-gray-200 bg-gray-50">
                    <td className="py-4 px-6" />
                    {corePackages.map((pkg, i) => (
                      <td key={i} className="py-4 px-3 text-center">
                        <Link
                          href="/contact"
                          className={`inline-block px-4 py-2.5 rounded-xl text-xs font-bold bg-gradient-to-r ${pkg.color} text-white hover:shadow-lg hover:scale-105 transition-all duration-200`}
                        >
                          Get Started
                        </Link>
                      </td>
                    ))}
                  </tr>
                </tbody>
              </table>
            </motion.div>
          )}

          {/* E-commerce Table */}
          {activeTab === 'ecommerce' && (
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.35 }}
              className="overflow-x-auto rounded-3xl border border-gray-200 shadow-xl bg-white max-w-3xl mx-auto"
            >
              <table className="w-full min-w-[500px] border-collapse">
                <thead>
                  <tr>
                    <th className="text-left py-5 px-6 bg-gray-50 text-sm font-semibold text-gray-500 w-[240px] border-b border-gray-200">
                      Plans
                    </th>
                    {ecomPackages.map((pkg, i) => (
                      <th key={i} className="py-0 px-3 border-b border-gray-200">
                        <div className={`bg-gradient-to-br ${pkg.color} text-white px-4 py-5 ${i === 0 ? 'rounded-tl-2xl' : 'rounded-tr-2xl'}`}>
                          {pkg.badge && (
                            <div className="text-[10px] font-bold tracking-wider uppercase text-white/80 mb-1">{pkg.badge}</div>
                          )}
                          <div className="text-base font-bold">{pkg.name}</div>
                          <div className="text-2xl font-extrabold mt-1">{pkg.price}</div>
                          <div className="text-[10px] text-white/60 mb-3">one-time fee</div>
                          <Link
                            href="/contact"
                            className="inline-block w-full text-center py-2 rounded-xl bg-white/20 hover:bg-white/30 text-white text-xs font-bold transition-all duration-200 border border-white/30"
                          >
                            Get Started
                          </Link>
                        </div>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {ecomRows.map((row, ri) => (
                    <>
                      {row.group && (
                        <tr key={`group-${ri}`}>
                          <td colSpan={3} className="py-3 px-6 bg-gray-50 text-xs font-bold text-gray-400 uppercase tracking-widest border-t border-gray-100">
                            {row.group}
                          </td>
                        </tr>
                      )}
                      <tr key={ri} className={`border-t border-gray-100 ${ri % 2 === 0 ? 'bg-white' : 'bg-gray-50/40'} hover:bg-emerald-50/30 transition-colors`}>
                        <td className="py-3.5 px-6 text-sm text-gray-600 font-medium">{row.label}</td>
                        {row.vals.map((val, vi) => (
                          <Cell key={vi} val={val} highlight={vi === 1} />
                        ))}
                      </tr>
                    </>
                  ))}
                  <tr className="border-t border-gray-200 bg-gray-50">
                    <td className="py-4 px-6" />
                    {ecomPackages.map((pkg, i) => (
                      <td key={i} className="py-4 px-3 text-center">
                        <Link
                          href="/contact"
                          className={`inline-block px-5 py-2.5 rounded-xl text-xs font-bold bg-gradient-to-r ${pkg.color} text-white hover:shadow-lg hover:scale-105 transition-all duration-200`}
                        >
                          Get Started
                        </Link>
                      </td>
                    ))}
                  </tr>
                </tbody>
              </table>
            </motion.div>
          )}

          <AnimatedSection>
            <p className="mt-8 text-center text-sm text-gray-400">
              All packages include 4 CPU · 4GB RAM · 100GB NVMe SSD · CDN. &nbsp;
              <Link href="/contact" className="text-blue-600 font-semibold hover:underline">Contact us</Link> for hosting upgrades or custom requirements.
            </p>
          </AnimatedSection>
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

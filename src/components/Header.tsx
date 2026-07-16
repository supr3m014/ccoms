'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Menu, X, ChevronDown } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

const SERVICE_GROUPS = [
  { heading: 'Integrated Growth', items: [
    { href: '/services/digital-marketing-services', label: 'Digital Marketing Services' },
  ] },
  { heading: 'Search & Discovery', items: [
    { href: '/services/seo', label: 'SEO' },
    { href: '/services/local-seo', label: 'Local SEO' },
    { href: '/services/geo', label: 'GEO & AI Search Visibility' },
  ] },
  { heading: 'Platforms & Development', items: [
    { href: '/services/website-development', label: 'Website Development' },
    { href: '/services/mobile-app-development', label: 'Mobile App Development' },
  ] },
  { heading: 'Commercial Creative', items: [
    { href: '/services/ai-ad-commercial-production', label: 'AI Ad & Commercial Production' },
  ] },
]

export default function Header() {
  const [isScrolled, setIsScrolled] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [mobileServicesOpen, setMobileServicesOpen] = useState(false)

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20)
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const closeMobile = () => { setIsMobileMenuOpen(false); setMobileServicesOpen(false) }

  return (
    <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${isScrolled ? 'bg-white shadow-md py-4' : 'bg-white shadow-sm py-4'}`}>
      <nav className="container-custom">
        <div className="flex items-center justify-between">
          <Link href="/" className="flex items-center">
            <img src="/logo.png" alt="Core Conversion" className="h-10 w-auto" />
          </Link>

          {/* Desktop nav */}
          <div className="hidden lg:flex items-center gap-8">
            <Link href="/" className="font-semibold text-gray-700 transition-colors hover:text-blue-600">Home</Link>

            {/* Services dropdown (hover + keyboard focus) */}
            <div className="relative group">
              <Link href="/services" className="flex items-center gap-1 font-semibold text-gray-700 transition-colors group-hover:text-blue-600 group-focus-within:text-blue-600">
                Services <ChevronDown className="w-4 h-4 transition-transform group-hover:rotate-180" />
              </Link>
              <div className="absolute left-1/2 -translate-x-1/2 top-full pt-3 opacity-0 invisible translate-y-1 transition-all duration-150 group-hover:opacity-100 group-hover:visible group-hover:translate-y-0 group-focus-within:opacity-100 group-focus-within:visible group-focus-within:translate-y-0">
                <div className="w-72 bg-white rounded-xl shadow-xl border border-gray-100 p-4">
                  {SERVICE_GROUPS.map((g) => (
                    <div key={g.heading} className="mb-3 last:mb-0">
                      <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-gray-400 mb-1">{g.heading}</p>
                      <div className="flex flex-col">
                        {g.items.map((it) => (
                          <Link key={it.href} href={it.href} className="text-sm text-gray-700 hover:text-blue-600 rounded-md px-1 py-1.5 transition-colors">{it.label}</Link>
                        ))}
                      </div>
                    </div>
                  ))}
                  <Link href="/services" className="block mt-1 pt-3 border-t border-gray-100 text-sm font-semibold text-blue-600 hover:text-blue-700">View all services →</Link>
                </div>
              </div>
            </div>

            <Link href="/case-studies" className="font-semibold text-gray-700 transition-colors hover:text-blue-600">Case Studies</Link>
            <Link href="/blog" className="font-semibold text-gray-700 transition-colors hover:text-blue-600">Blog</Link>
            <Link href="/about" className="font-semibold text-gray-700 transition-colors hover:text-blue-600">About</Link>
            <Link href="/contact" className="font-semibold text-gray-700 transition-colors hover:text-blue-600">Contact</Link>
          </div>

          {/* Right actions */}
          <div className="hidden lg:flex items-center gap-6">
            <Link href="/admin/login" className="text-gray-600 hover:text-blue-600 font-semibold transition-colors">Login</Link>
            <span className="w-px h-6 bg-gray-200" aria-hidden />
            <a href="https://calendly.com/ccoms/discovery-call" target="_blank" rel="noopener noreferrer" className="bg-gradient-to-r from-blue-600 to-cyan-600 text-white px-6 py-3 rounded-xl font-semibold hover:shadow-xl hover:scale-105 transition-all duration-300 inline-block">
              Book a Call
            </a>
          </div>

          <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="lg:hidden p-2 rounded-lg transition-colors hover:bg-gray-100" aria-label="Toggle menu" aria-expanded={isMobileMenuOpen}>
            {isMobileMenuOpen ? <X className="w-6 h-6 text-gray-900" /> : <Menu className="w-6 h-6 text-gray-900" />}
          </button>
        </div>

        {/* Mobile menu */}
        <AnimatePresence>
          {isMobileMenuOpen && (
            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} transition={{ duration: 0.3 }} className="lg:hidden mt-4 pb-4 overflow-hidden">
              <div className="flex flex-col">
                <Link href="/" onClick={closeMobile} className="text-neutral-700 hover:text-blue-600 font-medium transition-colors py-2.5">Home</Link>

                {/* Services expandable */}
                <button onClick={() => setMobileServicesOpen(v => !v)} aria-expanded={mobileServicesOpen} className="flex items-center justify-between text-neutral-700 hover:text-blue-600 font-medium transition-colors py-2.5">
                  Services <ChevronDown className={`w-4 h-4 transition-transform ${mobileServicesOpen ? 'rotate-180' : ''}`} />
                </button>
                {mobileServicesOpen && (
                  <div className="pl-3 pb-1 flex flex-col border-l-2 border-gray-100 ml-1">
                    <Link href="/services" onClick={closeMobile} className="text-sm font-semibold text-blue-600 py-2">All Services</Link>
                    {SERVICE_GROUPS.flatMap(g => g.items).map((it) => (
                      <Link key={it.href} href={it.href} onClick={closeMobile} className="text-sm text-neutral-600 hover:text-blue-600 py-2 transition-colors">{it.label}</Link>
                    ))}
                  </div>
                )}

                <Link href="/case-studies" onClick={closeMobile} className="text-neutral-700 hover:text-blue-600 font-medium transition-colors py-2.5">Case Studies</Link>
                <Link href="/blog" onClick={closeMobile} className="text-neutral-700 hover:text-blue-600 font-medium transition-colors py-2.5">Blog</Link>
                <Link href="/about" onClick={closeMobile} className="text-neutral-700 hover:text-blue-600 font-medium transition-colors py-2.5">About</Link>
                <Link href="/contact" onClick={closeMobile} className="text-neutral-700 hover:text-blue-600 font-medium transition-colors py-2.5">Contact</Link>

                <div className="flex items-center gap-4 mt-3 pt-3 border-t border-gray-100">
                  <Link href="/admin/login" onClick={closeMobile} className="text-gray-600 hover:text-blue-600 font-semibold transition-colors">Login</Link>
                  <a href="https://calendly.com/ccoms/discovery-call" target="_blank" rel="noopener noreferrer" onClick={closeMobile} className="btn btn-primary text-center flex-1">Book a Call</a>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>
    </header>
  )
}

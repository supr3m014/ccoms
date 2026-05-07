'use client'

import { useRef } from 'react'
import { motion, useInView } from 'framer-motion'
import Link from 'next/link'
import { MapPin, CheckCircle2, ArrowRight, Map, Star, Users, TrendingUp, Search, Shield } from 'lucide-react'

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

export default function LocalSEOPage() {
  const targetAudience = [
    'Local businesses that need more qualified leads and foot traffic',
    'Multi-location businesses struggling with consistency across locations',
    'Service providers competing in crowded local markets',
    'Businesses with strong reviews but poor map visibility',
    'Companies losing customers to competitors ranking higher in local search',
    'Franchises needing scalable local SEO management'
  ]

  const services = [
    {
      icon: Map,
      title: 'Google Business Profile',
      description: 'Optimize and manage your GBP for maximum local visibility',
      color: 'from-red-600 to-orange-600'
    },
    {
      icon: MapPin,
      title: 'Multi-Location SEO',
      description: 'Scalable strategies for businesses with multiple locations',
      color: 'from-blue-600 to-cyan-600'
    },
    {
      icon: Star,
      title: 'Review Management',
      description: 'Build credibility with strategic review generation and response',
      color: 'from-yellow-600 to-orange-600'
    },
    {
      icon: Search,
      title: 'Local Citations',
      description: 'Consistent NAP data across directories and platforms',
      color: 'from-green-600 to-emerald-600'
    }
  ]

  const deliverables = [
    {
      category: 'Google Business Profile Optimization',
      items: [
        'Complete profile setup and optimization',
        'Category selection and keyword integration',
        'Photo and video optimization',
        'Post scheduling and management',
        'Q&A monitoring and optimization',
        'Product/service listings'
      ]
    },
    {
      category: 'Local Content Strategy',
      items: [
        'Location-specific landing pages',
        'Local keyword research and mapping',
        'Neighborhood and area targeting',
        'Local link building strategy'
      ]
    },
    {
      category: 'Citation Building & Management',
      items: [
        'NAP consistency audit',
        'Directory submissions',
        'Citation cleanup and correction',
        'Industry-specific listings'
      ]
    },
    {
      category: 'Review & Reputation',
      items: [
        'Review generation strategy',
        'Review monitoring and alerts',
        'Response templates and management',
        'Reputation tracking'
      ]
    }
  ]

  const benefits = [
    'Show up in Google Map Pack for local searches',
    'Increase calls, directions requests, and website visits',
    'Build local authority and trust signals',
    'Outrank competitors in your service area',
    'Get more positive reviews and manage reputation',
    'Track local search performance and ROI',
    'Consistent business information across the web',
    'Mobile-optimized for on-the-go searchers'
  ]

  const process = [
    { title: 'Local Audit', description: 'Analyze your current local presence and competitive landscape' },
    { title: 'Profile Optimization', description: 'Optimize Google Business Profile and key directories' },
    { title: 'Content Development', description: 'Create location-specific content and landing pages' },
    { title: 'Citation Building', description: 'Build and clean up citations across the web' },
    { title: 'Ongoing Management', description: 'Monitor, maintain, and optimize for continued growth' }
  ]

  return (
    <div className="relative overflow-hidden">
      <section className="relative min-h-[70vh] flex items-center justify-center bg-gradient-to-br from-green-50 via-white to-emerald-50 pt-32 pb-16 overflow-hidden">
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-20 right-20 w-96 h-96 bg-green-400 rounded-full mix-blend-multiply filter blur-3xl animate-blob"></div>
          <div className="absolute bottom-20 left-20 w-96 h-96 bg-emerald-400 rounded-full mix-blend-multiply filter blur-3xl animate-blob animation-delay-2000"></div>
        </div>

        <div className="container-custom relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="inline-block mb-6"
            >
              <span className="px-4 py-2 bg-gradient-to-r from-green-600 to-emerald-600 text-white text-sm font-semibold rounded-full shadow-lg">
                Local SEO
              </span>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="text-5xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-gray-900 via-green-800 to-emerald-800 bg-clip-text text-transparent leading-tight"
            >
              Local SEO That Drives Foot Traffic
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="text-xl md:text-2xl text-gray-600 mb-8 leading-relaxed"
            >
              Dominate local search with map visibility, optimized location pages, and credibility signals that turn searches into calls, bookings, and customers.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
            >
              <a href="/contact" className="inline-block bg-gradient-to-r from-green-600 to-emerald-600 text-white px-8 py-4 rounded-xl font-semibold text-lg hover:shadow-2xl hover:scale-105 transition-all duration-300">
                Get Local Visibility
              </a>
            </motion.div>
          </div>
        </div>

        <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-white to-transparent"></div>
      </section>

      <section className="py-24 bg-white">
        <div className="container-custom">
          <div className="max-w-4xl mx-auto">
            <AnimatedSection>
              <h2 className="text-4xl md:text-5xl font-bold mb-8 text-gray-900 text-center">
                Who This Is For
              </h2>
            </AnimatedSection>

            <div className="space-y-4 mt-12">
              {targetAudience.map((item, index) => (
                <AnimatedSection key={index}>
                  <div className="flex items-start gap-4 p-6 bg-gradient-to-r from-green-50 to-emerald-50 rounded-2xl border border-green-200 hover:border-green-400 hover:shadow-lg transition-all duration-300 group">
                    <div className="flex-shrink-0">
                      <div className="w-10 h-10 bg-gradient-to-br from-green-600 to-emerald-600 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                        <CheckCircle2 className="w-6 h-6 text-white" />
                      </div>
                    </div>
                    <p className="text-lg text-gray-700 leading-relaxed pt-1">{item}</p>
                  </div>
                </AnimatedSection>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="py-24 bg-gradient-to-br from-green-50 via-white to-emerald-50">
        <div className="container-custom">
          <div className="max-w-5xl mx-auto">
            <AnimatedSection>
              <h2 className="text-4xl md:text-5xl font-bold mb-16 text-gray-900 text-center">
                Our Local SEO Services
              </h2>
            </AnimatedSection>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {services.map((service, index) => {
                const Icon = service.icon
                return (
                  <AnimatedSection key={index}>
                    <div className="h-full p-8 bg-white rounded-2xl border border-gray-200 hover:border-green-400 hover:shadow-xl transition-all duration-300 group">
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

      <section className="py-24 bg-white">
        <div className="container-custom">
          <div className="max-w-5xl mx-auto">
            <AnimatedSection>
              <h2 className="text-4xl md:text-5xl font-bold mb-4 text-gray-900 text-center">
                What's Included
              </h2>
              <p className="text-xl text-gray-600 mb-16 text-center">
                Complete local SEO management
              </p>
            </AnimatedSection>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {deliverables.map((section, index) => (
                <AnimatedSection key={index}>
                  <div className="h-full p-8 bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl border border-green-200 hover:border-green-400 hover:shadow-xl transition-all duration-300">
                    <h3 className="text-2xl font-bold text-gray-900 mb-6">
                      {section.category}
                    </h3>
                    <ul className="space-y-3">
                      {section.items.map((item, itemIndex) => (
                        <li key={itemIndex} className="flex items-start gap-3">
                          <CheckCircle2 className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                          <span className="text-gray-700 leading-relaxed">{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </AnimatedSection>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="py-24 bg-gradient-to-br from-green-50 via-white to-emerald-50">
        <div className="container-custom">
          <div className="max-w-4xl mx-auto">
            <AnimatedSection>
              <h2 className="text-4xl md:text-5xl font-bold mb-4 text-gray-900 text-center">
                Our Process
              </h2>
              <p className="text-xl text-gray-600 mb-16 text-center">
                Strategic local SEO implementation
              </p>
            </AnimatedSection>

            <div className="space-y-6">
              {process.map((step, index) => (
                <AnimatedSection key={index}>
                  <div className="flex items-start gap-6 p-8 bg-white rounded-2xl border border-gray-200 hover:border-green-400 hover:shadow-xl transition-all duration-300 group">
                    <div className="flex-shrink-0">
                      <div className="w-14 h-14 bg-gradient-to-br from-green-600 to-emerald-600 rounded-xl flex items-center justify-center text-white font-bold text-xl group-hover:scale-110 transition-transform duration-300">
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
                Results You Can Expect
              </h2>
            </AnimatedSection>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {benefits.map((benefit, index) => (
                <AnimatedSection key={index}>
                  <div className="flex items-start gap-4 p-6 bg-gradient-to-r from-green-50 to-emerald-50 rounded-2xl border border-green-200 hover:border-green-400 hover:shadow-lg transition-all duration-300 group">
                    <div className="flex-shrink-0">
                      <div className="w-10 h-10 bg-gradient-to-br from-green-600 to-emerald-600 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
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

      <section className="py-24 bg-gradient-to-br from-green-600 via-emerald-600 to-green-700 text-white relative overflow-hidden">
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-0 left-0 w-full h-full bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxwYXRoIGQ9Ik0zNiAxOGMzLjMxNCAwIDYgMi42ODYgNiA2cy0yLjY4NiA2LTYgNi02LTIuNjg2LTYtNiAyLjY4Ni02IDYtNnoiIHN0cm9rZT0iI2ZmZiIgc3Ryb2tlLXdpZHRoPSIwLjUiIG9wYWNpdHk9IjAuMyIvPjwvZz48L3N2Zz4=')] opacity-30"></div>
        </div>

        <div className="container-custom relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            <AnimatedSection>
              <h2 className="text-4xl md:text-5xl font-bold mb-6 text-white">
                Ready to dominate your local market?
              </h2>

              <p className="text-xl text-green-100 mb-12 leading-relaxed">
                Let's increase your local visibility and drive more customers to your door.
              </p>

              <a href="/contact" className="inline-block bg-white text-green-600 px-8 py-4 rounded-xl font-semibold text-lg hover:shadow-2xl hover:scale-105 transition-all duration-300">
                Get Started
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

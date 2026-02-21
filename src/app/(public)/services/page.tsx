'use client'

import { useRef } from 'react'
import { motion, useInView } from 'framer-motion'
import Link from 'next/link'
import { ArrowRight, Search, Code, Palette, Video, MapPin, Brain, Globe, Smartphone, CheckCircle2, Zap, Target } from 'lucide-react'

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

export default function ServicesPage() {
  const digitalMarketing = [
    {
      icon: Search,
      title: 'Full-Service SEO',
      description: 'Comprehensive SEO covering technical optimization, on-page improvements, content strategy, authority building, and Answer Engine Optimization (AEO)—focused on qualified growth.',
      href: '/services/seo',
      color: 'from-blue-600 to-cyan-600'
    },
    {
      icon: MapPin,
      title: 'Local SEO',
      description: 'Map visibility + local relevance + credibility signals that turn searches into calls, bookings, and foot traffic.',
      href: '/services/local-seo',
      color: 'from-green-600 to-emerald-600'
    },
    {
      icon: Globe,
      title: 'GEO (Generative Engine Optimization)',
      description: 'Make your content discoverable and cite-worthy inside AI-driven search and summary engines.',
      href: '/services/geo',
      color: 'from-orange-600 to-red-600'
    }
  ]

  const development = [
    {
      icon: Code,
      title: 'Website Development',
      description: 'Custom and CMS builds engineered for speed, SEO readiness, stability, and clean scalability.',
      href: '/services/website-development',
      color: 'from-blue-600 to-cyan-600'
    },
    {
      icon: Smartphone,
      title: 'Mobile App Development',
      description: 'Future-proof mobile applications with secure, scalable architecture that supports ongoing feature expansion.',
      href: '/services/mobile-app-development',
      color: 'from-cyan-600 to-teal-600'
    }
  ]

  const creative = [
    {
      icon: Palette,
      title: 'Brand & Marketing Design',
      description: 'Brochures, catalogs, flyers, company profiles, pitch decks, product one-pagers, trade-show graphics, templates, social creatives, web banners, infographics, and brand identity assets—delivered as production-ready digital files.',
      href: '/services/brand-marketing-design',
      color: 'from-pink-600 to-rose-600'
    },
    {
      icon: Video,
      title: 'Video Production',
      description: 'Realistic, high-impact launch films, ad creatives, and animated data visuals—story-led scripts, brand consistency, and clarity that communicates value in seconds.',
      href: '/services/video-production',
      color: 'from-violet-600 to-purple-600'
    }
  ]

  const reasons = [
    { icon: CheckCircle2, text: 'They\'re tired of work being outsourced with no accountability.' },
    { icon: Zap, text: 'They want a technical team that can fix real issues, not just "recommend."' },
    { icon: Target, text: 'They need marketing and development aligned, not separated.' },
    { icon: Search, text: 'They want a tailored plan that matches business goals, not generic templates.' }
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
                Our Services
              </span>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="text-5xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-gray-900 via-blue-800 to-cyan-800 bg-clip-text text-transparent leading-tight"
            >
              Services built for measurable growth
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="text-xl md:text-2xl text-gray-600 leading-relaxed"
            >
              If you've been burned by outsourced agencies and "report-only" marketing, this is your reset. We focus on execution that drives rankings, leads, sales, and long-term market reach.
            </motion.p>
          </div>
        </div>

        <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-white to-transparent"></div>
      </section>

      <section className="py-24 bg-white">
        <div className="container-custom">
          <AnimatedSection>
            <div className="text-center max-w-3xl mx-auto mb-16">
              <h2 className="text-4xl md:text-5xl font-bold mb-6 text-gray-900">
                Choose your path
              </h2>
              <p className="text-xl text-gray-600 leading-relaxed">
                Start with the service—or start with the goal. If you already know what you need, pick a service below. If you're unsure, <Link href="https://calendar.app.google/sSZytJFNEdDVeZ8k8" target="_blank" className="text-blue-600 font-semibold hover:underline">book a call</Link> and we'll recommend the fastest route to measurable improvement.
              </p>
            </div>
          </AnimatedSection>

          <div className="space-y-20">
            <div>
              <AnimatedSection>
                <h2 className="text-3xl md:text-4xl font-bold mb-8 text-gray-900">
                  Digital Marketing
                </h2>
              </AnimatedSection>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {digitalMarketing.map((service, index) => {
                  const Icon = service.icon
                  return (
                    <AnimatedSection key={service.href}>
                      <Link href={service.href}>
                        <div className="group h-full p-8 bg-white rounded-2xl border border-gray-200 hover:border-blue-300 hover:shadow-2xl transition-all duration-300">
                          <div className="flex items-center space-x-4 mb-4">
                            <div className={`w-14 h-14 bg-gradient-to-br ${service.color} rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300`}>
                              <Icon className="w-7 h-7 text-white" />
                            </div>
                            <h3 className="text-2xl font-bold text-gray-900 group-hover:text-blue-600 transition-colors">
                              {service.title}
                            </h3>
                          </div>
                          <p className="text-gray-600 mb-4 leading-relaxed">
                            {service.description}
                          </p>
                          <div className="flex items-center text-blue-600 font-semibold group-hover:translate-x-2 transition-transform">
                            Learn more <ArrowRight className="ml-2 w-5 h-5" />
                          </div>
                        </div>
                      </Link>
                    </AnimatedSection>
                  )
                })}
              </div>
            </div>

            <div>
              <AnimatedSection>
                <h2 className="text-3xl md:text-4xl font-bold mb-8 text-gray-900">
                  Development
                </h2>
              </AnimatedSection>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {development.map((service, index) => {
                  const Icon = service.icon
                  return (
                    <AnimatedSection key={service.href}>
                      <Link href={service.href}>
                        <div className="group h-full p-8 bg-white rounded-2xl border border-gray-200 hover:border-blue-300 hover:shadow-2xl transition-all duration-300">
                          <div className="flex items-center space-x-4 mb-4">
                            <div className={`w-14 h-14 bg-gradient-to-br ${service.color} rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300`}>
                              <Icon className="w-7 h-7 text-white" />
                            </div>
                            <h3 className="text-2xl font-bold text-gray-900 group-hover:text-blue-600 transition-colors">
                              {service.title}
                            </h3>
                          </div>
                          <p className="text-gray-600 mb-4 leading-relaxed">
                            {service.description}
                          </p>
                          <div className="flex items-center text-blue-600 font-semibold group-hover:translate-x-2 transition-transform">
                            Learn more <ArrowRight className="ml-2 w-5 h-5" />
                          </div>
                        </div>
                      </Link>
                    </AnimatedSection>
                  )
                })}
              </div>
            </div>

            <div>
              <AnimatedSection>
                <h2 className="text-3xl md:text-4xl font-bold mb-8 text-gray-900">
                  Creative
                </h2>
              </AnimatedSection>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {creative.map((service, index) => {
                  const Icon = service.icon
                  return (
                    <AnimatedSection key={service.href}>
                      <Link href={service.href}>
                        <div className="group h-full p-8 bg-white rounded-2xl border border-gray-200 hover:border-blue-300 hover:shadow-2xl transition-all duration-300">
                          <div className="flex items-center space-x-4 mb-4">
                            <div className={`w-14 h-14 bg-gradient-to-br ${service.color} rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300`}>
                              <Icon className="w-7 h-7 text-white" />
                            </div>
                            <h3 className="text-2xl font-bold text-gray-900 group-hover:text-blue-600 transition-colors">
                              {service.title}
                            </h3>
                          </div>
                          <p className="text-gray-600 mb-4 leading-relaxed">
                            {service.description}
                          </p>
                          <div className="flex items-center text-blue-600 font-semibold group-hover:translate-x-2 transition-transform">
                            Learn more <ArrowRight className="ml-2 w-5 h-5" />
                          </div>
                        </div>
                      </Link>
                    </AnimatedSection>
                  )
                })}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-24 bg-gradient-to-br from-blue-50 via-white to-cyan-50">
        <div className="container-custom">
          <div className="max-w-4xl mx-auto">
            <AnimatedSection>
              <h2 className="text-4xl md:text-5xl font-bold text-center mb-6 text-gray-900">
                Why people switch to CCOMS
              </h2>
              <p className="text-2xl text-center font-semibold bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent mb-12">
                Because they want results—not promises.
              </p>
            </AnimatedSection>

            <div className="space-y-4">
              {reasons.map((reason, index) => {
                const Icon = reason.icon
                return (
                  <AnimatedSection key={index}>
                    <div className="flex items-start space-x-4 p-6 bg-white rounded-2xl border border-gray-200 hover:border-blue-300 hover:shadow-lg transition-all duration-300 group">
                      <div className="flex-shrink-0">
                        <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-cyan-600 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                          <Icon className="w-5 h-5 text-white" />
                        </div>
                      </div>
                      <p className="text-lg text-gray-700 leading-relaxed pt-1">{reason.text}</p>
                    </div>
                  </AnimatedSection>
                )
              })}
            </div>

            <AnimatedSection className="mt-12 text-center">
              <Link href="/about" className="inline-flex items-center text-blue-600 font-semibold hover:text-cyan-600 transition-colors text-lg">
                Learn more about how we work <ArrowRight className="ml-2 w-5 h-5" />
              </Link>
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
                Tell us the goal. We'll build the path.
              </h2>

              <p className="text-xl text-blue-100 mb-12 leading-relaxed">
                Book a discovery call and we'll identify what's holding you back, what will move the needle fastest, and what a tailored execution plan should look like.
              </p>

              <a href="https://calendar.app.google/sSZytJFNEdDVeZ8k8" target="_blank" className="inline-block bg-white text-blue-600 px-8 py-4 rounded-xl font-semibold text-lg hover:shadow-2xl hover:scale-105 transition-all duration-300">
                Book a Discovery Call
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

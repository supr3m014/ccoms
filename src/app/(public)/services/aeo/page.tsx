'use client'

import { useRef, useEffect } from 'react'
import { motion, useInView } from 'framer-motion'
import Link from 'next/link'
import { Brain, CheckCircle2, ArrowRight, MessageSquare, Target, Zap, BookOpen, FileText } from 'lucide-react'

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

export default function AEOPage() {
  useEffect(() => {
    const meta = document.createElement('meta')
    meta.name = 'robots'
    meta.content = 'noindex, nofollow'
    document.head.appendChild(meta)
    return () => { document.head.removeChild(meta) }
  }, [])

  const whatIsAEO = [
    'ChatGPT, Perplexity, and other AI tools are becoming primary research tools',
    'These tools cite and recommend sources based on content structure',
    'Traditional SEO focuses on rankings—AEO focuses on being the cited answer',
    'Your brand becomes more discoverable when content matches how AI tools surface information'
  ]

  const services = [
    {
      icon: MessageSquare,
      title: 'Conversational Content',
      description: 'Structure content to answer questions naturally and comprehensively',
      color: 'from-violet-600 to-fuchsia-600'
    },
    {
      icon: Target,
      title: 'Entity Optimization',
      description: 'Build clear entity relationships and topical authority',
      color: 'from-blue-600 to-cyan-600'
    },
    {
      icon: FileText,
      title: 'Structured Answers',
      description: 'Format content for snippet and citation capture',
      color: 'from-green-600 to-emerald-600'
    },
    {
      icon: BookOpen,
      title: 'Knowledge Graph',
      description: 'Strengthen connections between concepts and expertise',
      color: 'from-orange-600 to-red-600'
    }
  ]

  const deliverables = [
    {
      category: 'Content Structure',
      items: [
        'Question-driven content frameworks',
        'FAQ schema implementation',
        'Answer-focused page architecture',
        'Natural language optimization'
      ]
    },
    {
      category: 'Entity & Authority Building',
      items: [
        'Entity mapping and relationship building',
        'Expertise demonstration',
        'Topical cluster development',
        'Knowledge base architecture'
      ]
    },
    {
      category: 'Snippet Optimization',
      items: [
        'Featured snippet targeting',
        'People Also Ask optimization',
        'Structured data implementation',
        'Answer box capture strategies'
      ]
    },
    {
      category: 'AI Citation Strategy',
      items: [
        'Content formatting for AI tools',
        'Source credibility signals',
        'Citation-worthy content development',
        'AI-friendly information architecture'
      ]
    }
  ]

  const benefits = [
    'Get cited by ChatGPT and other AI tools',
    'Capture featured snippets and answer boxes',
    'Build brand authority in your domain',
    'Stay ahead of AI-driven search evolution',
    'Increase content discoverability',
    'Position as a trusted information source',
    'Future-proof your content strategy',
    'Drive qualified traffic from answer-seeking users'
  ]

  const process = [
    { title: 'Question Research', description: 'Identify the questions your audience is asking' },
    { title: 'Content Mapping', description: 'Map existing content to answer-driven opportunities' },
    { title: 'Structure Optimization', description: 'Restructure content for answer engine visibility' },
    { title: 'Entity Development', description: 'Build topical authority and clear entity relationships' },
    { title: 'Monitor & Refine', description: 'Track citation rates and optimize based on performance' }
  ]

  return (
    <div className="relative overflow-hidden">
      <section className="relative min-h-[70vh] flex items-center justify-center bg-gradient-to-br from-violet-50 via-white to-fuchsia-50 pt-32 pb-16 overflow-hidden">
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-20 right-20 w-96 h-96 bg-violet-400 rounded-full mix-blend-multiply filter blur-3xl animate-blob"></div>
          <div className="absolute bottom-20 left-20 w-96 h-96 bg-fuchsia-400 rounded-full mix-blend-multiply filter blur-3xl animate-blob animation-delay-2000"></div>
        </div>

        <div className="container-custom relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="inline-block mb-6"
            >
              <span className="px-4 py-2 bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white text-sm font-semibold rounded-full shadow-lg">
                Answer Engine Optimization
              </span>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="text-5xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-gray-900 via-violet-800 to-fuchsia-800 bg-clip-text text-transparent leading-tight"
            >
              AEO: The Future of Search
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="text-xl md:text-2xl text-gray-600 mb-8 leading-relaxed"
            >
              Build content that wins direct answers, snippets, and "best response" placements across modern search experiences and AI tools.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
            >
              <a href="/contact" className="inline-block bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white px-8 py-4 rounded-xl font-semibold text-lg hover:shadow-2xl hover:scale-105 transition-all duration-300">
                Future-Proof Your Content
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
                What Is AEO?
              </h2>
            </AnimatedSection>

            <div className="space-y-4 mt-12">
              {whatIsAEO.map((item, index) => (
                <AnimatedSection key={index}>
                  <div className="flex items-start gap-4 p-6 bg-gradient-to-r from-violet-50 to-fuchsia-50 rounded-2xl border border-violet-200 hover:border-violet-400 hover:shadow-lg transition-all duration-300 group">
                    <div className="flex-shrink-0">
                      <div className="w-10 h-10 bg-gradient-to-br from-violet-600 to-fuchsia-600 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
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

      <section className="py-24 bg-gradient-to-br from-violet-50 via-white to-fuchsia-50">
        <div className="container-custom">
          <div className="max-w-5xl mx-auto">
            <AnimatedSection>
              <h2 className="text-4xl md:text-5xl font-bold mb-16 text-gray-900 text-center">
                Our AEO Services
              </h2>
            </AnimatedSection>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {services.map((service, index) => {
                const Icon = service.icon
                return (
                  <AnimatedSection key={index}>
                    <div className="h-full p-8 bg-white rounded-2xl border border-gray-200 hover:border-violet-400 hover:shadow-xl transition-all duration-300 group">
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
                Comprehensive answer engine optimization
              </p>
            </AnimatedSection>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {deliverables.map((section, index) => (
                <AnimatedSection key={index}>
                  <div className="h-full p-8 bg-gradient-to-br from-violet-50 to-fuchsia-50 rounded-2xl border border-violet-200 hover:border-violet-400 hover:shadow-xl transition-all duration-300">
                    <h3 className="text-2xl font-bold text-gray-900 mb-6">
                      {section.category}
                    </h3>
                    <ul className="space-y-3">
                      {section.items.map((item, itemIndex) => (
                        <li key={itemIndex} className="flex items-start gap-3">
                          <CheckCircle2 className="w-5 h-5 text-violet-600 mt-0.5 flex-shrink-0" />
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

      <section className="py-24 bg-gradient-to-br from-violet-50 via-white to-fuchsia-50">
        <div className="container-custom">
          <div className="max-w-4xl mx-auto">
            <AnimatedSection>
              <h2 className="text-4xl md:text-5xl font-bold mb-4 text-gray-900 text-center">
                Our Process
              </h2>
              <p className="text-xl text-gray-600 mb-16 text-center">
                Strategic answer engine optimization
              </p>
            </AnimatedSection>

            <div className="space-y-6">
              {process.map((step, index) => (
                <AnimatedSection key={index}>
                  <div className="flex items-start gap-6 p-8 bg-white rounded-2xl border border-gray-200 hover:border-violet-400 hover:shadow-xl transition-all duration-300 group">
                    <div className="flex-shrink-0">
                      <div className="w-14 h-14 bg-gradient-to-br from-violet-600 to-fuchsia-600 rounded-xl flex items-center justify-center text-white font-bold text-xl group-hover:scale-110 transition-transform duration-300">
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
                Benefits of AEO
              </h2>
            </AnimatedSection>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {benefits.map((benefit, index) => (
                <AnimatedSection key={index}>
                  <div className="flex items-start gap-4 p-6 bg-gradient-to-r from-violet-50 to-fuchsia-50 rounded-2xl border border-violet-200 hover:border-violet-400 hover:shadow-lg transition-all duration-300 group">
                    <div className="flex-shrink-0">
                      <div className="w-10 h-10 bg-gradient-to-br from-violet-600 to-fuchsia-600 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
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

      <section className="py-24 bg-gradient-to-br from-violet-50 via-white to-fuchsia-50">
        <div className="container-custom">
          <div className="max-w-4xl mx-auto">
            <AnimatedSection>
              <div className="bg-white rounded-2xl p-8 md:p-12 border border-gray-200 shadow-xl">
                <h2 className="text-3xl md:text-4xl font-bold mb-6 text-gray-900">
                  Why AEO Matters Now
                </h2>
                <p className="text-lg text-gray-700 leading-relaxed mb-6">
                  Search is evolving. AI-powered answer engines like ChatGPT, Perplexity, and Google's SGE are changing how people find information. Instead of clicking through search results, users get direct answers with cited sources.
                </p>
                <p className="text-lg text-gray-700 leading-relaxed mb-6">
                  AEO ensures your content is structured, authoritative, and citation-worthy—positioning your brand as the go-to source when AI tools answer questions in your domain.
                </p>
                <Link href="/services/geo" className="inline-flex items-center text-violet-600 font-semibold hover:text-fuchsia-600 transition-colors text-lg">
                  Learn about GEO too <ArrowRight className="ml-2 w-5 h-5" />
                </Link>
              </div>
            </AnimatedSection>
          </div>
        </div>
      </section>

      <section className="py-24 bg-gradient-to-br from-violet-600 via-fuchsia-600 to-violet-700 text-white relative overflow-hidden">
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-0 left-0 w-full h-full bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxwYXRoIGQ9Ik0zNiAxOGMzLjMxNCAwIDYgMi42ODYgNiA2cy0yLjY4NiA2LTYgNi02LTIuNjg2LTYtNiAyLjY4Ni02IDYtNnoiIHN0cm9rZT0iI2ZmZiIgc3Ryb2tlLXdpZHRoPSIwLjUiIG9wYWNpdHk9IjAuMyIvPjwvZz48L3N2Zz4=')] opacity-30"></div>
        </div>

        <div className="container-custom relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            <AnimatedSection>
              <h2 className="text-4xl md:text-5xl font-bold mb-6 text-white">
                Position your brand as the answer
              </h2>

              <p className="text-xl text-violet-100 mb-12 leading-relaxed">
                Let's optimize your content for answer engines and AI citation.
              </p>

              <a href="/contact" className="inline-block bg-white text-violet-600 px-8 py-4 rounded-xl font-semibold text-lg hover:shadow-2xl hover:scale-105 transition-all duration-300">
                Get Started with AEO
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

'use client'

import { useRef } from 'react'
import { motion, useInView } from 'framer-motion'
import Link from 'next/link'
import { Globe, CheckCircle2, ArrowRight, Sparkles, Bot, Network, FileCheck } from 'lucide-react'

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

export default function GEOPage() {
  const whatIsGEO = [
    'Generative AI tools like ChatGPT, Claude, and Perplexity generate responses from multiple sources',
    'GEO ensures your content is structured to be selected, cited, and recommended by these AI engines',
    'Unlike AEO (answer-focused), GEO optimizes for synthesis and multi-source citation patterns',
    'Position your brand where AI-native users discover information'
  ]

  const services = [
    {
      icon: Sparkles,
      title: 'AI-Ready Content',
      description: 'Structure content for AI comprehension and citation',
      color: 'from-pink-600 to-rose-600'
    },
    {
      icon: Bot,
      title: 'Generative Optimization',
      description: 'Optimize for how AI models select and synthesize sources',
      color: 'from-blue-600 to-cyan-600'
    },
    {
      icon: Network,
      title: 'Source Authority',
      description: 'Build signals that position your content as authoritative',
      color: 'from-green-600 to-emerald-600'
    },
    {
      icon: FileCheck,
      title: 'Citation Worthiness',
      description: 'Create content that AI models want to reference',
      color: 'from-orange-600 to-amber-600'
    }
  ]

  const deliverables = [
    {
      category: 'Content Optimization',
      items: [
        'AI-readable content structure',
        'Clear attribution and sourcing',
        'Factual accuracy signals',
        'Comprehensive topic coverage'
      ]
    },
    {
      category: 'Authority Signals',
      items: [
        'Expert authorship markers',
        'Credibility building',
        'Source reputation management',
        'Trust signal optimization'
      ]
    },
    {
      category: 'Technical Implementation',
      items: [
        'Structured data for AI parsing',
        'Schema markup optimization',
        'Metadata enhancement',
        'API-friendly formatting'
      ]
    },
    {
      category: 'Monitoring & Analysis',
      items: [
        'AI citation tracking',
        'Source attribution monitoring',
        'Performance measurement',
        'Continuous optimization'
      ]
    }
  ]

  const benefits = [
    'Get cited by ChatGPT, Claude, and Perplexity',
    'Become a trusted source for AI-generated responses',
    'Capture AI-native search traffic',
    'Build brand presence in conversational AI',
    'Position as authoritative in your niche',
    'Future-proof your content strategy',
    'Drive qualified traffic from AI referrals',
    'Increase brand discovery and awareness'
  ]

  const process = [
    { title: 'Content Audit', description: 'Analyze existing content for AI readability and citation potential' },
    { title: 'Authority Building', description: 'Strengthen credibility signals and expert positioning' },
    { title: 'Structure Optimization', description: 'Format content for AI comprehension and synthesis' },
    { title: 'Implementation', description: 'Deploy technical and content optimizations' },
    { title: 'Track & Refine', description: 'Monitor AI citations and optimize performance' }
  ]

  return (
    <div className="relative overflow-hidden">
      <section className="relative min-h-[70vh] flex items-center justify-center bg-gradient-to-br from-pink-50 via-white to-rose-50 pt-32 pb-16 overflow-hidden">
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-20 right-20 w-96 h-96 bg-pink-400 rounded-full mix-blend-multiply filter blur-3xl animate-blob"></div>
          <div className="absolute bottom-20 left-20 w-96 h-96 bg-rose-400 rounded-full mix-blend-multiply filter blur-3xl animate-blob animation-delay-2000"></div>
        </div>

        <div className="container-custom relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="inline-block mb-6"
            >
              <span className="px-4 py-2 bg-gradient-to-r from-pink-600 to-rose-600 text-white text-sm font-semibold rounded-full shadow-lg">
                Generative Engine Optimization
              </span>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="text-5xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-gray-900 via-pink-800 to-rose-800 bg-clip-text text-transparent leading-tight"
            >
              GEO: AI-Native Discovery
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="text-xl md:text-2xl text-gray-600 mb-8 leading-relaxed"
            >
              Make your brand discoverable and cite-worthy in AI-driven discovery like ChatGPT-style summaries and Perplexity-like engines.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
            >
              <a href="/contact" className="inline-block bg-gradient-to-r from-pink-600 to-rose-600 text-white px-8 py-4 rounded-xl font-semibold text-lg hover:shadow-2xl hover:scale-105 transition-all duration-300">
                Get AI-Ready
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
                What Is GEO?
              </h2>
            </AnimatedSection>

            <div className="space-y-4 mt-12">
              {whatIsGEO.map((item, index) => (
                <AnimatedSection key={index}>
                  <div className="flex items-start gap-4 p-6 bg-gradient-to-r from-pink-50 to-rose-50 rounded-2xl border border-pink-200 hover:border-pink-400 hover:shadow-lg transition-all duration-300 group">
                    <div className="flex-shrink-0">
                      <div className="w-10 h-10 bg-gradient-to-br from-pink-600 to-rose-600 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
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

      <section className="py-24 bg-gradient-to-br from-pink-50 via-white to-rose-50">
        <div className="container-custom">
          <div className="max-w-5xl mx-auto">
            <AnimatedSection>
              <h2 className="text-4xl md:text-5xl font-bold mb-16 text-gray-900 text-center">
                Our GEO Services
              </h2>
            </AnimatedSection>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {services.map((service, index) => {
                const Icon = service.icon
                return (
                  <AnimatedSection key={index}>
                    <div className="h-full p-8 bg-white rounded-2xl border border-gray-200 hover:border-pink-400 hover:shadow-xl transition-all duration-300 group">
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
                Complete generative engine optimization
              </p>
            </AnimatedSection>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {deliverables.map((section, index) => (
                <AnimatedSection key={index}>
                  <div className="h-full p-8 bg-gradient-to-br from-pink-50 to-rose-50 rounded-2xl border border-pink-200 hover:border-pink-400 hover:shadow-xl transition-all duration-300">
                    <h3 className="text-2xl font-bold text-gray-900 mb-6">
                      {section.category}
                    </h3>
                    <ul className="space-y-3">
                      {section.items.map((item, itemIndex) => (
                        <li key={itemIndex} className="flex items-start gap-3">
                          <CheckCircle2 className="w-5 h-5 text-pink-600 mt-0.5 flex-shrink-0" />
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

      <section className="py-24 bg-gradient-to-br from-pink-50 via-white to-rose-50">
        <div className="container-custom">
          <div className="max-w-4xl mx-auto">
            <AnimatedSection>
              <h2 className="text-4xl md:text-5xl font-bold mb-4 text-gray-900 text-center">
                Our Process
              </h2>
              <p className="text-xl text-gray-600 mb-16 text-center">
                Strategic AI optimization
              </p>
            </AnimatedSection>

            <div className="space-y-6">
              {process.map((step, index) => (
                <AnimatedSection key={index}>
                  <div className="flex items-start gap-6 p-8 bg-white rounded-2xl border border-gray-200 hover:border-pink-400 hover:shadow-xl transition-all duration-300 group">
                    <div className="flex-shrink-0">
                      <div className="w-14 h-14 bg-gradient-to-br from-pink-600 to-rose-600 rounded-xl flex items-center justify-center text-white font-bold text-xl group-hover:scale-110 transition-transform duration-300">
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
                Benefits of GEO
              </h2>
            </AnimatedSection>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {benefits.map((benefit, index) => (
                <AnimatedSection key={index}>
                  <div className="flex items-start gap-4 p-6 bg-gradient-to-r from-pink-50 to-rose-50 rounded-2xl border border-pink-200 hover:border-pink-400 hover:shadow-lg transition-all duration-300 group">
                    <div className="flex-shrink-0">
                      <div className="w-10 h-10 bg-gradient-to-br from-pink-600 to-rose-600 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
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

      <section className="py-24 bg-gradient-to-br from-pink-50 via-white to-rose-50">
        <div className="container-custom">
          <div className="max-w-4xl mx-auto">
            <AnimatedSection>
              <div className="bg-white rounded-2xl p-8 md:p-12 border border-gray-200 shadow-xl">
                <h2 className="text-3xl md:text-4xl font-bold mb-6 text-gray-900">
                  GEO vs AEO: What's the Difference?
                </h2>
                <p className="text-lg text-gray-700 leading-relaxed mb-6">
                  AEO focuses on capturing featured snippets and direct answers in traditional search. GEO goes further—optimizing for how generative AI models synthesize and cite multiple sources when creating comprehensive responses.
                </p>
                <p className="text-lg text-gray-700 leading-relaxed mb-6">
                  Think of it this way: AEO gets you the snippet; GEO gets you cited by AI tools that millions use daily for research, decision-making, and discovery.
                </p>
                <Link href="/services/aeo" className="inline-flex items-center text-pink-600 font-semibold hover:text-rose-600 transition-colors text-lg">
                  Learn about AEO too <ArrowRight className="ml-2 w-5 h-5" />
                </Link>
              </div>
            </AnimatedSection>
          </div>
        </div>
      </section>

      <section className="py-24 bg-gradient-to-br from-pink-600 via-rose-600 to-pink-700 text-white relative overflow-hidden">
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-0 left-0 w-full h-full bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxwYXRoIGQ9Ik0zNiAxOGMzLjMxNCAwIDYgMi42ODYgNiA2cy0yLjY4NiA2LTYgNi02LTIuNjg2LTYtNiAyLjY4Ni02IDYtNnoiIHN0cm9rZT0iI2ZmZiIgc3Ryb2tlLXdpZHRoPSIwLjUiIG9wYWNpdHk9IjAuMyIvPjwvZz48L3N2Zz4=')] opacity-30"></div>
        </div>

        <div className="container-custom relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            <AnimatedSection>
              <h2 className="text-4xl md:text-5xl font-bold mb-6 text-white">
                Get cited by AI engines
              </h2>

              <p className="text-xl text-pink-100 mb-12 leading-relaxed">
                Position your brand in the future of AI-driven discovery.
              </p>

              <a href="/contact" className="inline-block bg-white text-pink-600 px-8 py-4 rounded-xl font-semibold text-lg hover:shadow-2xl hover:scale-105 transition-all duration-300">
                Get Started with GEO
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

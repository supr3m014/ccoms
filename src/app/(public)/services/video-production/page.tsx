'use client'

import { useRef } from 'react'
import { motion, useInView } from 'framer-motion'
import { Video, CheckCircle2, ArrowRight, Film, Play, Sparkles, Clapperboard } from 'lucide-react'

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

export default function VideoProductionPage() {
  const services = [
    {
      icon: Film,
      title: 'Brand Films',
      description: 'Cinematic storytelling that captures your brand essence',
      color: 'from-red-600 to-orange-600'
    },
    {
      icon: Play,
      title: 'Ad Creatives',
      description: 'Short-form video ads optimized for conversion',
      color: 'from-blue-600 to-cyan-600'
    },
    {
      icon: Sparkles,
      title: 'Product Demos',
      description: 'Clear, engaging demonstrations of your products',
      color: 'from-green-600 to-emerald-600'
    },
    {
      icon: Clapperboard,
      title: 'Explainer Videos',
      description: 'Animated videos that simplify complex concepts',
      color: 'from-purple-600 to-pink-600'
    }
  ]

  const deliverables = [
    {
      category: 'Pre-Production',
      items: [
        'Concept development',
        'Script writing',
        'Storyboarding',
        'Production planning'
      ]
    },
    {
      category: 'Production',
      items: [
        'Professional filming',
        'AI-enhanced visuals',
        'Motion graphics',
        'Voice-over recording'
      ]
    },
    {
      category: 'Post-Production',
      items: [
        'Video editing',
        'Color grading',
        'Sound design',
        'Visual effects'
      ]
    },
    {
      category: 'Delivery',
      items: [
        'Multiple format exports',
        'Platform optimization',
        'Subtitle creation',
        'Thumbnail design'
      ]
    }
  ]

  const videoTypes = [
    'Launch films and brand videos',
    'Social media ad creatives',
    'Product demonstrations',
    'Explainer and tutorial videos',
    'Customer testimonials',
    'Event coverage',
    'Animated data visualizations',
    'Corporate presentations'
  ]

  const benefits = [
    'Cinematic quality with fast turnaround',
    'AI-enhanced production workflows',
    'Story-led scripts that engage',
    'Platform-optimized deliverables',
    'Brand-consistent visuals',
    'Data-driven creative approach',
    'Multiple format variations',
    'Conversion-focused storytelling'
  ]

  const process = [
    { title: 'Creative Brief', description: 'Define objectives, audience, and creative direction' },
    { title: 'Scripting & Storyboard', description: 'Develop compelling narrative and visual flow' },
    { title: 'Production', description: 'Film, animate, and create visual assets' },
    { title: 'Post-Production', description: 'Edit, enhance, and finalize video' },
    { title: 'Delivery & Optimization', description: 'Export in all required formats and specifications' }
  ]

  const whatWeDo = [
    'Cinematic video production with AI-enhanced workflows',
    'Story-led scripts that communicate value quickly',
    'Brand-consistent visuals across all video content',
    'Multi-platform optimization (social, web, presentations)',
    'Fast iteration cycles for campaign content',
    'Professional quality at accessible rates'
  ]

  return (
    <div className="relative overflow-hidden">
      <section className="relative min-h-[70vh] flex items-center justify-center bg-gradient-to-br from-red-50 via-white to-orange-50 pt-32 pb-16 overflow-hidden">
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-20 right-20 w-96 h-96 bg-red-400 rounded-full mix-blend-multiply filter blur-3xl animate-blob"></div>
          <div className="absolute bottom-20 left-20 w-96 h-96 bg-orange-400 rounded-full mix-blend-multiply filter blur-3xl animate-blob animation-delay-2000"></div>
        </div>

        <div className="container-custom relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="inline-block mb-6"
            >
              <span className="px-4 py-2 bg-gradient-to-r from-red-600 to-orange-600 text-white text-sm font-semibold rounded-full shadow-lg">
                Video Production
              </span>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="text-5xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-gray-900 via-red-800 to-orange-800 bg-clip-text text-transparent leading-tight"
            >
              Video That Tells Your Story
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="text-xl md:text-2xl text-gray-600 mb-8 leading-relaxed"
            >
              Cinematic, AI-supported launch films, ad creatives, and animated visuals that communicate value in seconds. Story-led scripts with brand consistency and clarity.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
            >
              <a href="/contact" className="inline-block bg-gradient-to-r from-red-600 to-orange-600 text-white px-8 py-4 rounded-xl font-semibold text-lg hover:shadow-2xl hover:scale-105 transition-all duration-300">
                Start Your Video Project
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
                What We Create
              </h2>
            </AnimatedSection>

            <div className="space-y-4 mt-12">
              {whatWeDo.map((item, index) => (
                <AnimatedSection key={index}>
                  <div className="flex items-start gap-4 p-6 bg-gradient-to-r from-red-50 to-orange-50 rounded-2xl border border-red-200 hover:border-red-400 hover:shadow-lg transition-all duration-300 group">
                    <div className="flex-shrink-0">
                      <div className="w-10 h-10 bg-gradient-to-br from-red-600 to-orange-600 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
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

      <section className="py-24 bg-gradient-to-br from-red-50 via-white to-orange-50">
        <div className="container-custom">
          <div className="max-w-5xl mx-auto">
            <AnimatedSection>
              <h2 className="text-4xl md:text-5xl font-bold mb-16 text-gray-900 text-center">
                Our Video Services
              </h2>
            </AnimatedSection>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {services.map((service, index) => {
                const Icon = service.icon
                return (
                  <AnimatedSection key={index}>
                    <div className="h-full p-8 bg-white rounded-2xl border border-gray-200 hover:border-red-400 hover:shadow-xl transition-all duration-300 group">
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
                Production Pipeline
              </h2>
              <p className="text-xl text-gray-600 mb-16 text-center">
                From concept to final delivery
              </p>
            </AnimatedSection>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {deliverables.map((section, index) => (
                <AnimatedSection key={index}>
                  <div className="h-full p-8 bg-gradient-to-br from-red-50 to-orange-50 rounded-2xl border border-red-200 hover:border-red-400 hover:shadow-xl transition-all duration-300">
                    <h3 className="text-2xl font-bold text-gray-900 mb-6">
                      {section.category}
                    </h3>
                    <ul className="space-y-3">
                      {section.items.map((item, itemIndex) => (
                        <li key={itemIndex} className="flex items-start gap-3">
                          <CheckCircle2 className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
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

      <section className="py-24 bg-gradient-to-br from-red-50 via-white to-orange-50">
        <div className="container-custom">
          <div className="max-w-5xl mx-auto">
            <AnimatedSection>
              <h2 className="text-4xl md:text-5xl font-bold mb-16 text-gray-900 text-center">
                Video Types We Produce
              </h2>
            </AnimatedSection>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {videoTypes.map((type, index) => (
                <AnimatedSection key={index}>
                  <div className="p-6 bg-white rounded-2xl border border-gray-200 hover:border-red-400 hover:shadow-lg transition-all duration-300 text-center group">
                    <p className="text-lg font-bold text-gray-900 group-hover:text-red-600 transition-colors">{type}</p>
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
              <h2 className="text-4xl md:text-5xl font-bold mb-4 text-gray-900 text-center">
                Our Process
              </h2>
              <p className="text-xl text-gray-600 mb-16 text-center">
                Professional video production workflow
              </p>
            </AnimatedSection>

            <div className="space-y-6">
              {process.map((step, index) => (
                <AnimatedSection key={index}>
                  <div className="flex items-start gap-6 p-8 bg-gradient-to-r from-red-50 to-orange-50 rounded-2xl border border-red-200 hover:border-red-400 hover:shadow-xl transition-all duration-300 group">
                    <div className="flex-shrink-0">
                      <div className="w-14 h-14 bg-gradient-to-br from-red-600 to-orange-600 rounded-xl flex items-center justify-center text-white font-bold text-xl group-hover:scale-110 transition-transform duration-300">
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

      <section className="py-24 bg-gradient-to-br from-red-50 via-white to-orange-50">
        <div className="container-custom">
          <div className="max-w-4xl mx-auto">
            <AnimatedSection>
              <h2 className="text-4xl md:text-5xl font-bold mb-16 text-gray-900 text-center">
                Why Choose Our Video Production
              </h2>
            </AnimatedSection>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {benefits.map((benefit, index) => (
                <AnimatedSection key={index}>
                  <div className="flex items-start gap-4 p-6 bg-white rounded-2xl border border-gray-200 hover:border-red-400 hover:shadow-lg transition-all duration-300 group">
                    <div className="flex-shrink-0">
                      <div className="w-10 h-10 bg-gradient-to-br from-red-600 to-orange-600 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
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

      <section className="py-24 bg-gradient-to-br from-red-600 via-orange-600 to-red-700 text-white relative overflow-hidden">
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-0 left-0 w-full h-full bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxwYXRoIGQ9Ik0zNiAxOGMzLjMxNCAwIDYgMi42ODYgNiA2cy0yLjY4NiA2LTYgNi02LTIuNjg2LTYtNiAyLjY4Ni02IDYtNnoiIHN0cm9rZT0iI2ZmZiIgc3Ryb2tlLXdpZHRoPSIwLjUiIG9wYWNpdHk9IjAuMyIvPjwvZz48L3N2Zz4=')] opacity-30"></div>
        </div>

        <div className="container-custom relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            <AnimatedSection>
              <h2 className="text-4xl md:text-5xl font-bold mb-6 text-white">
                Ready to tell your story?
              </h2>

              <p className="text-xl text-red-100 mb-12 leading-relaxed">
                Let's create video content that engages your audience and drives results.
              </p>

              <a href="/contact" className="inline-block bg-white text-red-600 px-8 py-4 rounded-xl font-semibold text-lg hover:shadow-2xl hover:scale-105 transition-all duration-300">
                Start Your Video Project
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

'use client'

import { useRef } from 'react'
import { motion, useInView } from 'framer-motion'
import { Palette, CheckCircle2, ArrowRight, Sparkles, Image, FileText, Layout, PenTool } from 'lucide-react'

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

export default function BrandMarketingDesignPage() {
  const services = [
    {
      icon: Sparkles,
      title: 'Brand Identity',
      description: 'Logos, color systems, typography, and brand guidelines',
      color: 'from-purple-600 to-fuchsia-600'
    },
    {
      icon: FileText,
      title: 'Marketing Collateral',
      description: 'Brochures, catalogs, pitch decks, and sales materials',
      color: 'from-blue-600 to-cyan-600'
    },
    {
      icon: Image,
      title: 'Digital Assets',
      description: 'Social media graphics, ads, email templates, and web graphics',
      color: 'from-green-600 to-emerald-600'
    },
    {
      icon: Layout,
      title: 'Infographics & Data Viz',
      description: 'Visual storytelling for complex information',
      color: 'from-orange-600 to-red-600'
    }
  ]

  const deliverables = [
    {
      category: 'Brand Identity & Guidelines',
      items: [
        'Logo design and variations',
        'Color palette and typography system',
        'Brand guidelines document',
        'Digital and print specifications'
      ]
    },
    {
      category: 'Print & Digital Collateral',
      items: [
        'Brochures and catalogs',
        'Pitch decks and presentations',
        'Sales sheets and one-pagers',
        'Business cards and stationery'
      ]
    },
    {
      category: 'Social & Digital Graphics',
      items: [
        'Social media templates',
        'Ad creative variations',
        'Email header graphics',
        'Web banners and graphics'
      ]
    },
    {
      category: 'Content Design',
      items: [
        'Infographics',
        'Data visualizations',
        'Icon sets',
        'Illustration packages'
      ]
    }
  ]

  const benefits = [
    'Consistent brand presence across all channels',
    'Production-ready files for print and digital',
    'Scalable design systems',
    'Professional, premium aesthetics',
    'Fast turnaround times',
    'Conversion-focused design',
    'Brand differentiation',
    'Marketing campaign support'
  ]

  const process = [
    { title: 'Discovery & Brief', description: 'Understand your brand, audience, and objectives' },
    { title: 'Concept Development', description: 'Create initial concepts and design direction' },
    { title: 'Design & Refinement', description: 'Develop and refine chosen direction' },
    { title: 'Delivery', description: 'Deliver production-ready files and assets' },
    { title: 'Support', description: 'Ongoing design support and iterations' }
  ]

  const whatWeDo = [
    'Digital-first design for premium brand presence',
    'Marketing assets that support conversion goals',
    'Consistent branding across all touchpoints',
    'Fast iteration and production-ready files',
    'Design that aligns with your business strategy',
    'Professional aesthetics that differentiate your brand'
  ]

  return (
    <div className="relative overflow-hidden">
      <section className="relative min-h-[70vh] flex items-center justify-center bg-gradient-to-br from-purple-50 via-white to-fuchsia-50 pt-32 pb-16 overflow-hidden">
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-20 right-20 w-96 h-96 bg-purple-400 rounded-full mix-blend-multiply filter blur-3xl animate-blob"></div>
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
              <span className="px-4 py-2 bg-gradient-to-r from-purple-600 to-fuchsia-600 text-white text-sm font-semibold rounded-full shadow-lg">
                Brand & Marketing Design
              </span>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="text-5xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-gray-900 via-purple-800 to-fuchsia-800 bg-clip-text text-transparent leading-tight"
            >
              Design That Converts
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="text-xl md:text-2xl text-gray-600 mb-8 leading-relaxed"
            >
              Digital-ready assets that look premium, stay consistent, and support conversion. Brand identity, marketing collateral, social creatives, and infographics—delivered as production-ready files.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
            >
              <a href="/contact" className="inline-block bg-gradient-to-r from-purple-600 to-fuchsia-600 text-white px-8 py-4 rounded-xl font-semibold text-lg hover:shadow-2xl hover:scale-105 transition-all duration-300">
                Start Your Design Project
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
                What We Do
              </h2>
            </AnimatedSection>

            <div className="space-y-4 mt-12">
              {whatWeDo.map((item, index) => (
                <AnimatedSection key={index}>
                  <div className="flex items-start gap-4 p-6 bg-gradient-to-r from-purple-50 to-fuchsia-50 rounded-2xl border border-purple-200 hover:border-purple-400 hover:shadow-lg transition-all duration-300 group">
                    <div className="flex-shrink-0">
                      <div className="w-10 h-10 bg-gradient-to-br from-purple-600 to-fuchsia-600 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
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

      <section className="py-24 bg-gradient-to-br from-purple-50 via-white to-fuchsia-50">
        <div className="container-custom">
          <div className="max-w-5xl mx-auto">
            <AnimatedSection>
              <h2 className="text-4xl md:text-5xl font-bold mb-16 text-gray-900 text-center">
                Our Design Services
              </h2>
            </AnimatedSection>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {services.map((service, index) => {
                const Icon = service.icon
                return (
                  <AnimatedSection key={index}>
                    <div className="h-full p-8 bg-white rounded-2xl border border-gray-200 hover:border-purple-400 hover:shadow-xl transition-all duration-300 group">
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
                What You Get
              </h2>
              <p className="text-xl text-gray-600 mb-16 text-center">
                Complete design deliverables
              </p>
            </AnimatedSection>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {deliverables.map((section, index) => (
                <AnimatedSection key={index}>
                  <div className="h-full p-8 bg-gradient-to-br from-purple-50 to-fuchsia-50 rounded-2xl border border-purple-200 hover:border-purple-400 hover:shadow-xl transition-all duration-300">
                    <h3 className="text-2xl font-bold text-gray-900 mb-6">
                      {section.category}
                    </h3>
                    <ul className="space-y-3">
                      {section.items.map((item, itemIndex) => (
                        <li key={itemIndex} className="flex items-start gap-3">
                          <CheckCircle2 className="w-5 h-5 text-purple-600 mt-0.5 flex-shrink-0" />
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

      <section className="py-24 bg-gradient-to-br from-purple-50 via-white to-fuchsia-50">
        <div className="container-custom">
          <div className="max-w-4xl mx-auto">
            <AnimatedSection>
              <h2 className="text-4xl md:text-5xl font-bold mb-4 text-gray-900 text-center">
                Our Process
              </h2>
              <p className="text-xl text-gray-600 mb-16 text-center">
                From brief to delivery
              </p>
            </AnimatedSection>

            <div className="space-y-6">
              {process.map((step, index) => (
                <AnimatedSection key={index}>
                  <div className="flex items-start gap-6 p-8 bg-white rounded-2xl border border-gray-200 hover:border-purple-400 hover:shadow-xl transition-all duration-300 group">
                    <div className="flex-shrink-0">
                      <div className="w-14 h-14 bg-gradient-to-br from-purple-600 to-fuchsia-600 rounded-xl flex items-center justify-center text-white font-bold text-xl group-hover:scale-110 transition-transform duration-300">
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
                Why Our Design Works
              </h2>
            </AnimatedSection>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {benefits.map((benefit, index) => (
                <AnimatedSection key={index}>
                  <div className="flex items-start gap-4 p-6 bg-gradient-to-r from-purple-50 to-fuchsia-50 rounded-2xl border border-purple-200 hover:border-purple-400 hover:shadow-lg transition-all duration-300 group">
                    <div className="flex-shrink-0">
                      <div className="w-10 h-10 bg-gradient-to-br from-purple-600 to-fuchsia-600 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
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

      <section className="py-24 bg-gradient-to-br from-purple-600 via-fuchsia-600 to-purple-700 text-white relative overflow-hidden">
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-0 left-0 w-full h-full bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxwYXRoIGQ9Ik0zNiAxOGMzLjMxNCAwIDYgMi42ODYgNiA2cy0yLjY4NiA2LTYgNi02LTIuNjg2LTYtNiAyLjY4Ni02IDYtNnoiIHN0cm9rZT0iI2ZmZiIgc3Ryb2tlLXdpZHRoPSIwLjUiIG9wYWNpdHk9IjAuMyIvPjwvZz48L3N2Zz4=')] opacity-30"></div>
        </div>

        <div className="container-custom relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            <AnimatedSection>
              <h2 className="text-4xl md:text-5xl font-bold mb-6 text-white">
                Ready to elevate your brand?
              </h2>

              <p className="text-xl text-purple-100 mb-12 leading-relaxed">
                Let's create design assets that differentiate your brand and drive results.
              </p>

              <a href="/contact" className="inline-block bg-white text-purple-600 px-8 py-4 rounded-xl font-semibold text-lg hover:shadow-2xl hover:scale-105 transition-all duration-300">
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

'use client'

import { useRef } from 'react'
import { motion, useInView } from 'framer-motion'
import Link from 'next/link'
import { Code, CheckCircle2, ArrowRight, Zap, Shield, Layers, Globe, Smartphone, BarChart3 } from 'lucide-react'

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

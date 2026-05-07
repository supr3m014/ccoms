'use client'

import { useEffect } from 'react'
import { motion, useAnimation } from 'framer-motion'
import { useInView } from 'framer-motion'
import { useRef } from 'react'
import CTAButtons from '@/components/CTAButtons'
import { Target, Shield, TrendingUp, Users, Code, Zap, CheckCircle2, Award, Sparkles } from 'lucide-react'

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

export default function AboutPage() {
  const principles = [
    {
      icon: Shield,
      title: 'No Outsourcing',
      description: 'Every project is handled by our core team. No middlemen, no delegation to strangers. You work directly with the people executing the work.'
    },
    {
      icon: Target,
      title: 'Execution-First',
      description: 'We don\'t just plan and recommend. We build, fix, ship, and optimize. Results come from consistent execution, not endless strategy documents.'
    },
    {
      icon: TrendingUp,
      title: 'Measurable Outcomes',
      description: 'Every engagement is tied to business outcomes—rankings, leads, sales, and pipeline. We report what matters, not vanity metrics.'
    },
    {
      icon: Users,
      title: 'Long-Term Partnerships',
      description: 'We build relationships that compound over time. Clients stay because execution stays consistent and results keep improving.'
    }
  ]

  const differentiators = [
    { text: 'Technical oversight at every level—from code to DNS to performance', icon: Code },
    { text: 'Direct involvement in strategy and execution', icon: Award },
    { text: 'Transparent reporting focused on business impact', icon: CheckCircle2 },
    { text: 'Aligned incentives—we succeed when you grow', icon: TrendingUp },
    { text: 'Cross-functional capability (SEO + dev + creative under one roof)', icon: Sparkles }
  ]

  const timeline = [
    { year: '2010', title: 'Foundation', desc: 'Started with hands-on SEO and technical execution' },
    { year: '2015', title: 'Expansion', desc: 'Grew capabilities into full-stack development and creative' },
    { year: '2020', title: 'Innovation', desc: 'Pioneered AEO/GEO optimization strategies' },
    { year: '2024', title: 'Today', desc: 'Trusted partner for businesses demanding accountable execution' }
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
                Built by Practitioners
              </span>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="text-5xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-gray-900 via-blue-800 to-cyan-800 bg-clip-text text-transparent leading-tight"
            >
              Results, Not Decks
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="text-xl md:text-2xl text-gray-600 leading-relaxed"
            >
              No outsourcing. No guessing. Just accountable execution that compounds over time.
            </motion.p>
          </div>
        </div>

        <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-white to-transparent"></div>
      </section>

      <section className="py-24 bg-white relative overflow-hidden">
        <div className="container-custom relative z-10">
          <div className="max-w-4xl mx-auto">
            <AnimatedSection>
              <h2 className="text-4xl md:text-5xl font-bold mb-8 text-gray-900">
                The Story Behind CCOMS
              </h2>
            </AnimatedSection>

            <AnimatedSection>
              <div className="bg-gradient-to-br from-gray-50 to-blue-50 p-8 md:p-12 rounded-3xl border border-gray-200">
                <div className="prose prose-lg max-w-none">
                  <p className="text-lg md:text-xl text-gray-700 leading-relaxed mb-6">
                    I'm <strong className="text-gray-900">John Paul Carrasco</strong>, founder of Core Conversion Digital Marketing Services (CCOMS). I've spent 14 years doing hands-on SEO and technical execution—down to code, performance, tracking, hosting, domains, and DNS.
                  </p>
                  <p className="text-lg md:text-xl text-gray-700 leading-relaxed mb-6">
                    That technical depth matters because most "agencies" break down when real technical work is required. They outsource the hard stuff, lose accountability, and deliver half-finished work.
                  </p>
                  <p className="text-lg md:text-xl text-gray-700 leading-relaxed mb-6">
                    CCOMS was built differently. We stay involved, we stay accountable, and we build long-term relationships—because results compound when the same team consistently ships improvements.
                  </p>
                  <p className="text-lg md:text-xl text-gray-700 leading-relaxed">
                    If you've been burned by agencies that sold confidence but delivered confusion, <strong className="text-blue-600">you're exactly who we're built for</strong>.
                  </p>
                </div>
              </div>
            </AnimatedSection>

            <AnimatedSection className="mt-12">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                <div className="text-center p-6 bg-white rounded-2xl border border-blue-200 shadow-lg">
                  <div className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent mb-2">14</div>
                  <div className="text-sm text-gray-600">Years Experience</div>
                </div>
                <div className="text-center p-6 bg-white rounded-2xl border border-blue-200 shadow-lg">
                  <div className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent mb-2">100%</div>
                  <div className="text-sm text-gray-600">Hands-On</div>
                </div>
                <div className="text-center p-6 bg-white rounded-2xl border border-blue-200 shadow-lg">
                  <div className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent mb-2">0</div>
                  <div className="text-sm text-gray-600">Outsourcing</div>
                </div>
                <div className="text-center p-6 bg-white rounded-2xl border border-blue-200 shadow-lg">
                  <div className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent mb-2">∞</div>
                  <div className="text-sm text-gray-600">Client Retention</div>
                </div>
              </div>
            </AnimatedSection>
          </div>
        </div>
      </section>

      <section className="py-24 bg-gradient-to-br from-gray-900 via-blue-900 to-gray-900 text-white relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 left-0 w-full h-full bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxwYXRoIGQ9Ik0zNiAxOGMzLjMxNCAwIDYgMi42ODYgNiA2cy0yLjY4NiA2LTYgNi02LTIuNjg2LTYtNiAyLjY4Ni02IDYtNnoiIHN0cm9rZT0iIzAwQkNENCIgc3Ryb2tlLXdpZHRoPSIwLjUiIG9wYWNpdHk9IjAuMyIvPjwvZz48L3N2Zz4=')] opacity-30"></div>
        </div>

        <div className="container-custom relative z-10">
          <AnimatedSection>
            <h2 className="text-4xl md:text-5xl font-bold mb-4 text-center text-white">
              Our Journey
            </h2>
            <p className="text-xl text-center text-blue-200 mb-16 max-w-3xl mx-auto">
              14 years of consistent execution and evolution
            </p>
          </AnimatedSection>

          <div className="max-w-5xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
              {timeline.map((item, index) => (
                <AnimatedSection key={index}>
                  <div className="relative">
                    <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20 h-full hover:bg-white/15 transition-all duration-300">
                      <div className="text-4xl font-bold bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent mb-3">
                        {item.year}
                      </div>
                      <h3 className="text-xl font-bold text-white mb-2">{item.title}</h3>
                      <p className="text-gray-300 text-sm leading-relaxed">{item.desc}</p>
                    </div>
                  </div>
                </AnimatedSection>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="py-24 bg-gradient-to-br from-blue-50 via-white to-cyan-50 relative overflow-hidden">
        <div className="container-custom relative z-10">
          <AnimatedSection>
            <h2 className="text-4xl md:text-5xl font-bold mb-6 text-center text-gray-900">
              Our Principles
            </h2>
            <p className="text-xl text-center text-gray-600 mb-16 max-w-3xl mx-auto">
              The foundation of everything we do
            </p>
          </AnimatedSection>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto">
            {principles.map((principle, index) => {
              const Icon = principle.icon
              return (
                <AnimatedSection key={index}>
                  <div className="group h-full">
                    <div className="h-full p-8 bg-white rounded-2xl border border-gray-200 hover:border-blue-300 hover:shadow-2xl transition-all duration-300">
                      <div className="flex items-start space-x-4">
                        <div className="flex-shrink-0">
                          <div className="w-14 h-14 bg-gradient-to-br from-blue-600 to-cyan-600 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                            <Icon className="w-7 h-7 text-white" />
                          </div>
                        </div>
                        <div>
                          <h3 className="text-xl font-bold text-gray-900 mb-3">
                            {principle.title}
                          </h3>
                          <p className="text-gray-600 leading-relaxed">
                            {principle.description}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </AnimatedSection>
              )
            })}
          </div>
        </div>
      </section>

      <section className="py-24 bg-white relative overflow-hidden">
        <div className="container-custom relative z-10">
          <div className="max-w-4xl mx-auto">
            <AnimatedSection>
              <h2 className="text-4xl md:text-5xl font-bold mb-12 text-gray-900">
                What Makes CCOMS Different
              </h2>
            </AnimatedSection>

            <div className="space-y-4">
              {differentiators.map((item, index) => {
                const Icon = item.icon
                return (
                  <AnimatedSection key={index}>
                    <div className="flex items-start space-x-4 p-6 bg-gradient-to-r from-gray-50 to-blue-50 rounded-2xl border border-gray-200 hover:border-blue-300 hover:shadow-lg transition-all duration-300 group">
                      <div className="flex-shrink-0">
                        <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-cyan-600 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                          <Icon className="w-5 h-5 text-white" />
                        </div>
                      </div>
                      <p className="text-lg text-gray-700 leading-relaxed pt-1">{item.text}</p>
                    </div>
                  </AnimatedSection>
                )
              })}
            </div>
          </div>
        </div>
      </section>

      <section className="py-24 bg-gradient-to-br from-blue-50 via-white to-cyan-50 relative overflow-hidden">
        <div className="container-custom relative z-10">
          <div className="max-w-4xl mx-auto">
            <AnimatedSection>
              <h2 className="text-4xl md:text-5xl font-bold mb-8 text-gray-900">
                How Engagements Start
              </h2>
            </AnimatedSection>

            <AnimatedSection>
              <div className="bg-white p-8 md:p-12 rounded-3xl border border-gray-200 shadow-xl mb-8">
                <div className="prose prose-lg max-w-none">
                  <p className="text-lg text-gray-700 leading-relaxed mb-6">
                    Every engagement begins with a <strong className="text-blue-600">discovery call</strong>. We'll discuss your business goals, current challenges, and what success looks like for you.
                  </p>
                  <p className="text-lg text-gray-700 leading-relaxed mb-6">
                    From there, we'll identify what's blocking growth, what will move the needle fastest, and what a tailored execution plan should look like.
                  </p>
                  <p className="text-lg text-gray-700 leading-relaxed">
                    No templates. No one-size-fits-all packages. Just a custom roadmap built around your specific situation and goals.
                  </p>
                </div>
              </div>
            </AnimatedSection>

            <AnimatedSection>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center p-6 bg-gradient-to-br from-blue-600 to-cyan-600 rounded-2xl text-white">
                  <div className="text-3xl font-bold mb-2">1</div>
                  <div className="text-sm font-semibold">Discovery Call</div>
                </div>
                <div className="text-center p-6 bg-gradient-to-br from-blue-600 to-cyan-600 rounded-2xl text-white">
                  <div className="text-3xl font-bold mb-2">2</div>
                  <div className="text-sm font-semibold">Custom Roadmap</div>
                </div>
                <div className="text-center p-6 bg-gradient-to-br from-blue-600 to-cyan-600 rounded-2xl text-white">
                  <div className="text-3xl font-bold mb-2">3</div>
                  <div className="text-sm font-semibold">Consistent Execution</div>
                </div>
              </div>
            </AnimatedSection>

            <AnimatedSection className="mt-12">
              <CTAButtons className="flex justify-center" />
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
                Ready to work with a team that owns outcomes?
              </h2>

              <p className="text-xl text-blue-100 mb-12 leading-relaxed">
                Book a discovery call and experience what accountable execution looks like.
              </p>

              <CTAButtons className="flex justify-center" />
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

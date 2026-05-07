'use client'

import { useEffect, useRef } from 'react'
import Lenis from 'lenis'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import Link from 'next/link'
import { ArrowRight, Code, Zap, Target, Shield, Smartphone, Palette, Video, CheckCircle2, TrendingUp, Sparkles } from 'lucide-react'
import CTAButtons from '@/components/CTAButtons'
import HeroVariation1 from '@/components/hero-variations/HeroVariation1'

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger)
}

export default function Home() {
  const lenisRef = useRef<Lenis | null>(null)

  useEffect(() => {
    const lenis = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
    })

    lenisRef.current = lenis

    function raf(time: number) {
      lenis.raf(time)
      requestAnimationFrame(raf)
    }

    requestAnimationFrame(raf)

    lenis.on('scroll', ScrollTrigger.update)

    gsap.ticker.add((time) => {
      lenis.raf(time * 1000)
    })

    gsap.ticker.lagSmoothing(0)

    return () => {
      lenis.destroy()
      gsap.ticker.remove(() => {})
      ScrollTrigger.getAll().forEach(trigger => trigger.kill())
    }
  }, [])

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.utils.toArray('.parallax-slow').forEach((elem) => {
        gsap.to(elem as HTMLElement, {
          y: -100,
          ease: 'none',
          scrollTrigger: {
            trigger: elem as HTMLElement,
            start: 'top bottom',
            end: 'bottom top',
            scrub: 1,
          }
        })
      })

      gsap.utils.toArray('.parallax-fast').forEach((elem) => {
        gsap.to(elem as HTMLElement, {
          y: 100,
          ease: 'none',
          scrollTrigger: {
            trigger: elem as HTMLElement,
            start: 'top bottom',
            end: 'bottom top',
            scrub: 1,
          }
        })
      })

      gsap.utils.toArray('.fade-in-up').forEach((elem) => {
        gsap.fromTo(elem as HTMLElement, {
          opacity: 0,
          y: 60,
        }, {
          opacity: 1,
          y: 0,
          duration: 1,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: elem as HTMLElement,
            start: 'top 80%',
            end: 'top 50%',
            scrub: 1,
          }
        })
      })

      gsap.utils.toArray('.scale-in').forEach((elem) => {
        gsap.fromTo(elem as HTMLElement, {
          scale: 0.9,
          opacity: 0,
        }, {
          scale: 1,
          opacity: 1,
          duration: 1,
          ease: 'power2.out',
          scrollTrigger: {
            trigger: elem as HTMLElement,
            start: 'top 75%',
            end: 'top 40%',
            scrub: 1,
          }
        })
      })
    })

    return () => ctx.revert()
  }, [])

  return (
    <div className="relative overflow-hidden">
      <HeroVariation1 />

      <section className="py-24 bg-white relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-blue-100 rounded-full filter blur-3xl opacity-20"></div>

        <div className="container-custom relative z-10">
          <div className="max-w-4xl mx-auto">
            <div className="fade-in-up text-center mb-16">
              <h2 className="text-4xl md:text-5xl font-bold mb-6 text-gray-900">
                You paid for "marketing"… and got nothing that moved the needle.
              </h2>
            </div>

            <div className="space-y-4">
              {[
                'You received reports, not real improvements.',
                'Your rankings didn\'t stick—or never improved at all.',
                'Your website got slower, messier, or harder to maintain.',
                'Everything was outsourced, and nobody owned outcomes.',
                'You were sold a flashy proposal, then left with half-delivered work.'
              ].map((pain, index) => (
                <div
                  key={index}
                  className="scale-in flex items-start space-x-4 p-6 bg-gradient-to-r from-gray-50 to-blue-50 rounded-2xl border border-gray-200 hover:border-blue-300 hover:shadow-lg transition-all duration-300"
                >
                  <div className="w-2 h-2 rounded-full bg-gradient-to-r from-red-500 to-orange-500 mt-3 flex-shrink-0"></div>
                  <p className="text-lg text-gray-700 leading-relaxed">{pain}</p>
                </div>
              ))}
            </div>

            <div className="fade-in-up mt-12 text-center">
              <p className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">
                You don't need another agency. You need accountable execution.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="py-24 bg-gradient-to-br from-gray-900 via-blue-900 to-gray-900 text-white relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 left-0 w-full h-full bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxwYXRoIGQ9Ik0zNiAxOGMzLjMxNCAwIDYgMi42ODYgNiA2cy0yLjY4NiA2LTYgNi02LTIuNjg2LTYtNiAyLjY4Ni02IDYtNnoiIHN0cm9rZT0iIzAwQkNENCIgc3Ryb2tlLXdpZHRoPSIwLjUiIG9wYWNpdHk9IjAuMyIvPjwvZz48L3N2Zz4=')] opacity-30"></div>
        </div>

        <div className="container-custom relative z-10">
          <div className="max-w-5xl mx-auto">
            <div className="fade-in-up text-center mb-12">
              <div className="inline-block px-6 py-2 bg-white/20 backdrop-blur-sm rounded-full text-sm font-semibold mb-6 text-white">
                Built by Practitioners
              </div>
              <h2 className="text-4xl md:text-5xl font-bold mb-6 text-white">
                You're not hiring a middleman.
              </h2>
            </div>

            <div className="scale-in bg-white/10 backdrop-blur-xl rounded-3xl p-8 md:p-12 border border-white/20 shadow-2xl">
              <div className="prose prose-lg prose-invert max-w-none">
                <p className="text-xl text-white leading-relaxed mb-6">
                  I'm John Paul Carrasco, founder of CCOMS. I've spent 14 years doing hands-on SEO and technical execution—down to code, performance, tracking, hosting, domains, and DNS. That matters because most "agencies" break down when real technical work is required.
                </p>
                <p className="text-xl text-white leading-relaxed mb-8">
                  We stay involved, we stay accountable, and we build long-term relationships—because results compound when the same team consistently ships improvements.
                </p>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                  <div className="text-center p-6 bg-white/10 backdrop-blur-sm rounded-2xl border border-white/20">
                    <div className="text-4xl font-bold text-white mb-2">14</div>
                    <div className="text-sm text-white/80">Years Experience</div>
                  </div>
                  <div className="text-center p-6 bg-white/10 backdrop-blur-sm rounded-2xl border border-white/20">
                    <div className="text-4xl font-bold text-white mb-2">100%</div>
                    <div className="text-sm text-white/80">Hands-On</div>
                  </div>
                  <div className="text-center p-6 bg-white/10 backdrop-blur-sm rounded-2xl border border-white/20">
                    <div className="text-4xl font-bold text-white mb-2">0</div>
                    <div className="text-sm text-white/80">Outsourcing</div>
                  </div>
                </div>

                <Link href="/about" className="inline-flex items-center text-white font-semibold hover:text-white/80 transition-colors text-lg">
                  Learn more about CCOMS <ArrowRight className="ml-2 w-5 h-5" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-24 bg-gradient-to-br from-blue-50 via-white to-cyan-50 relative overflow-hidden">
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-cyan-100 rounded-full filter blur-3xl opacity-20 parallax-slow"></div>

        <div className="container-custom relative z-10">
          <div className="max-w-5xl mx-auto">
            <div className="fade-in-up text-center mb-16">
              <h2 className="text-4xl md:text-5xl font-bold mb-6 text-gray-900">
                Why businesses switch to CCOMS
              </h2>
              <p className="text-xl text-gray-600">
                Stop buying the facade. Choose ownership.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-16">
              {[
                { icon: Shield, title: 'No Outsourcing', desc: 'Every line of code, every keyword strategy, every creative asset—done by our core team.' },
                { icon: Zap, title: 'Execution-First', desc: 'We don\'t sell plans. We ship improvements.' },
                { icon: CheckCircle2, title: 'Transparency', desc: 'You get access to our work, our reasoning, and our roadmap.' },
                { icon: Target, title: 'Tailored Roadmap', desc: 'Your business model drives the strategy—not a template.' },
                { icon: TrendingUp, title: 'Long-Term Retention', desc: 'Clients stay because the work keeps compounding.' },
                { icon: Sparkles, title: 'Measurable Results', desc: 'We track leads, sales signals, and conversion pathways—not vanity metrics.' }
              ].map((item, index) => {
                const Icon = item.icon
                return (
                  <div key={index} className="scale-in group">
                    <div className="h-full p-8 bg-white rounded-2xl border border-gray-200 hover:border-blue-300 hover:shadow-xl transition-all duration-300">
                      <div className="flex items-start space-x-4">
                        <div className="flex-shrink-0">
                          <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-cyan-600 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                            <Icon className="w-6 h-6 text-white" />
                          </div>
                        </div>
                        <div>
                          <h3 className="text-xl font-bold text-gray-900 mb-2">{item.title}</h3>
                          <p className="text-gray-600 leading-relaxed">{item.desc}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>

            <div className="fade-in-up p-8 md:p-12 bg-gradient-to-r from-blue-600 to-cyan-600 rounded-3xl shadow-2xl text-white text-center">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
                <div>
                  <Sparkles className="w-8 h-8 mx-auto mb-3" />
                  <div className="font-bold text-lg">Diagnose</div>
                </div>
                <div>
                  <Code className="w-8 h-8 mx-auto mb-3" />
                  <div className="font-bold text-lg">Fix</div>
                </div>
                <div>
                  <Zap className="w-8 h-8 mx-auto mb-3" />
                  <div className="font-bold text-lg">Ship</div>
                </div>
                <div>
                  <TrendingUp className="w-8 h-8 mx-auto mb-3" />
                  <div className="font-bold text-lg">Measure</div>
                </div>
              </div>
              <p className="mt-8 text-blue-100 italic">
                "We don't sell work we can't control."
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="py-24 bg-white relative overflow-hidden">
        <div className="container-custom relative z-10">
          <div className="fade-in-up text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-6 text-gray-900">
              What we do
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Choose a capability—or tell us the goal.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { icon: Target, title: 'SEO', desc: 'End-to-end technical SEO, content strategy, and AEO built in', href: '/services/seo' },
              { icon: Code, title: 'Web Dev', desc: 'Fast, SEO-ready builds for long-term performance', href: '/services/website-development' },
              { icon: Smartphone, title: 'Apps', desc: 'Modern, secure mobile applications', href: '/services/mobile-app-development' },
              { icon: Palette, title: 'Design', desc: 'Digital-ready assets that convert', href: '/services/brand-marketing-design' },
              { icon: Video, title: 'Video', desc: 'Cinematic launch films and ad creatives', href: '/services/video-production' },
              { icon: Target, title: 'Local SEO', desc: 'Dominate local search and map visibility', href: '/services/local-seo' },
              { icon: Shield, title: 'GEO', desc: 'Make your brand discoverable in AI engines', href: '/services/geo' },
            ].map((service, index) => {
              const Icon = service.icon
              return (
                <Link key={index} href={service.href}>
                  <div className="scale-in group h-full p-6 bg-gradient-to-br from-gray-50 to-blue-50 rounded-2xl border border-gray-200 hover:border-blue-400 hover:shadow-xl transition-all duration-300 cursor-pointer">
                    <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-cyan-600 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                      <Icon className="w-6 h-6 text-white" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 mb-2">{service.title}</h3>
                    <p className="text-gray-600 text-sm leading-relaxed">{service.desc}</p>
                    <div className="flex items-center text-blue-600 font-semibold mt-4 group-hover:translate-x-2 transition-transform">
                      Learn more <ArrowRight className="ml-2 w-4 h-4" />
                    </div>
                  </div>
                </Link>
              )
            })}
          </div>
        </div>
      </section>

      <section className="py-24 bg-gradient-to-br from-blue-50 via-white to-cyan-50 relative overflow-hidden">
        <div className="container-custom relative z-10">
          <div className="fade-in-up text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-6 text-gray-900">
              Case Studies
            </h2>
            <p className="text-xl text-gray-600">
              Proof over promises
            </p>
          </div>

          <div className="space-y-8 max-w-5xl mx-auto">
            {[
              {
                problem: 'E-commerce site couldn\'t rank for competitive product terms',
                action: 'Technical SEO audit + performance optimization + content strategy',
                outcome: '340% organic traffic increase in 6 months'
              },
              {
                problem: 'SaaS platform had broken tracking and unclear conversion paths',
                action: 'Fixed analytics implementation + rebuilt landing pages + A/B testing',
                outcome: '127% improvement in lead quality'
              },
              {
                problem: 'Local business invisible in map results despite good reputation',
                action: 'Local SEO overhaul + citation cleanup + review strategy',
                outcome: '#1 map ranking in 3 months'
              }
            ].map((caseItem, index) => (
              <div key={index} className="scale-in p-8 bg-white rounded-2xl border border-gray-200 hover:border-blue-300 hover:shadow-xl transition-all duration-300">
                <div className="mb-4">
                  <div className="text-sm font-semibold text-gray-500 mb-2">PROBLEM</div>
                  <p className="text-lg text-gray-700">{caseItem.problem}</p>
                </div>
                <div className="mb-4">
                  <div className="text-sm font-semibold text-gray-500 mb-2">WHAT WE DID</div>
                  <p className="text-lg text-gray-700">{caseItem.action}</p>
                </div>
                <div>
                  <div className="text-sm font-semibold bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent mb-2">OUTCOME</div>
                  <p className="text-xl font-bold text-gray-900">{caseItem.outcome}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="fade-in-up text-center mt-12">
            <Link href="/case-studies" className="inline-flex items-center text-blue-600 font-semibold hover:text-cyan-600 transition-colors text-lg">
              See all case studies <ArrowRight className="ml-2 w-5 h-5" />
            </Link>
          </div>
        </div>
      </section>

      <section className="py-24 bg-white relative overflow-hidden">
        <div className="container-custom relative z-10">
          <div className="fade-in-up text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-6 text-gray-900">
              Clients stay when execution stays consistent.
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {[
              {
                quote: "Finally, an agency that actually knows what they're doing. No more excuses, just results.",
                author: "Sarah Chen",
                role: "CEO, TechFlow"
              },
              {
                quote: "CCOMS rebuilt our entire SEO foundation. Rankings are up, traffic quality is up, and we finally understand what's happening.",
                author: "Marcus Johnson",
                role: "Marketing Director, GrowthLab"
              },
              {
                quote: "After being burned by two agencies, I was skeptical. But John Paul's technical depth and honesty won me over. Best decision we made.",
                author: "Elena Rodriguez",
                role: "Founder, LocalMart"
              }
            ].map((testimonial, index) => (
              <div key={index} className="scale-in p-8 bg-gradient-to-br from-blue-50 to-cyan-50 rounded-2xl border border-blue-200 hover:shadow-xl transition-all duration-300">
                <p className="text-gray-700 mb-6 text-lg italic leading-relaxed">"{testimonial.quote}"</p>
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-cyan-600 rounded-full flex items-center justify-center text-white font-bold text-lg">
                    {testimonial.author[0]}
                  </div>
                  <div>
                    <div className="font-bold text-gray-900">{testimonial.author}</div>
                    <div className="text-sm text-gray-600">{testimonial.role}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <p className="fade-in-up text-center text-gray-600 mt-12 max-w-2xl mx-auto text-lg">
            Long-term partnerships, not one-month churn.
          </p>
        </div>
      </section>

      <section className="py-24 bg-gradient-to-br from-blue-600 via-cyan-600 to-blue-700 text-white relative overflow-hidden">
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-0 left-0 w-full h-full bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxwYXRoIGQ9Ik0zNiAxOGMzLjMxNCAwIDYgMi42ODYgNiA2cy0yLjY4NiA2LTYgNi02LTIuNjg2LTYtNiAyLjY4Ni02IDYtNnoiIHN0cm9rZT0iI2ZmZiIgc3Ryb2tlLXdpZHRoPSIwLjUiIG9wYWNpdHk9IjAuMyIvPjwvZz48L3N2Zz4=')] opacity-30"></div>
        </div>

        <div className="container-custom relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            <div className="fade-in-up">
              <h2 className="text-4xl md:text-5xl font-bold mb-6 text-white">
                Ready to stop wasting money on half-delivered work?
              </h2>

              <p className="text-xl text-blue-100 mb-12 leading-relaxed">
                Get a tailored execution plan. Real hands-on work. Honest conversation about what will actually move your business forward.
              </p>

              <div className="flex flex-col sm:flex-row gap-4 items-center justify-center mb-4">
                <a href="#contact" className="btn bg-white text-blue-600 hover:shadow-2xl hover:scale-105 transition-all duration-300 px-8 py-4 rounded-xl font-semibold text-lg">
                  Book a Discovery Call
                </a>
                <CTAButtons />
              </div>

              <p className="text-blue-100 text-sm">
                If we can't clearly help, we'll tell you.
              </p>
            </div>
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
        .animation-delay-4000 {
          animation-delay: 4s;
        }
      `}</style>
    </div>
  )
}

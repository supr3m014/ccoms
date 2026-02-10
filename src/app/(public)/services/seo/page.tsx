'use client'

import { useRef } from 'react'
import { motion, useInView } from 'framer-motion'
import Link from 'next/link'
import { CheckCircle2, ArrowRight, TrendingUp, Search, BarChart3, Target, Zap, Shield } from 'lucide-react'

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

export default function SEOPage() {
  const targetAudience = [
    'You\'ve paid for SEO before and saw little to no improvement',
    'Rankings were volatile, traffic was irrelevant, or conversions didn\'t improve',
    'Your site has technical issues nobody fixed (speed, indexing, tracking, structure)',
    'Your agency kept "planning" while output stayed thin',
    'You suspect work was outsourced and nobody owned the outcome',
    'You\'re ready for consistent execution tied to measurable business results'
  ]

  const problemsFixed = [
    { title: 'Slow Performance', desc: 'Pages that suppress rankings and conversions' },
    { title: 'Indexing Issues', desc: 'Pages not being crawled or understood correctly' },
    { title: 'Weak Architecture', desc: 'Confusing categories and messy internal links' },
    { title: 'Poor Intent Match', desc: 'Content that targets keywords but doesn\'t convert' },
    { title: 'Duplicate Content', desc: 'Thin pages that dilute authority' },
    { title: 'Tracking Gaps', desc: 'Can\'t scale what you can\'t measure correctly' }
  ]

  const deliverables = [
    {
      icon: Search,
      category: 'Technical SEO Foundation',
      items: [
        'Full technical audit (crawl, indexability, architecture, performance)',
        'Core Web Vitals and speed roadmap (prioritized fixes)',
        'Structured data / schema alignment',
        'Fixes for duplicates, cannibalization, thin pages',
        'Clean URL structure guidance',
        'Tracking integrity check'
      ]
    },
    {
      icon: Target,
      category: 'On-Page SEO & Answer Optimization',
      items: [
        'Keyword + intent mapping per page',
        'On-page optimization (titles, headings, internal linking)',
        'Content upgrades for depth and conversion',
        'SERP CTR improvements',
        'Answer Engine Optimization (AEO) for AI tools like ChatGPT',
        'FAQ schema and structured answers for featured snippets'
      ]
    },
    {
      icon: BarChart3,
      category: 'Content Strategy',
      items: [
        'Topic strategy built around your offers',
        'Content briefs for execution',
        'Cluster strategy for authority building',
        'Editorial workflow support',
        'Entity optimization for AI discoverability'
      ]
    },
    {
      icon: TrendingUp,
      category: 'Authority Building',
      items: [
        'Link strategy focused on relevance and trust',
        'Content-led authority building',
        'Brand signals that improve trust over time',
        'Citation-worthy content for AI tool references'
      ]
    }
  ]

  const workflow = [
    { title: 'Discovery + diagnosis', description: 'We align on business goals and identify what\'s blocking growth fastest.' },
    { title: 'Fix foundations', description: 'Technical and structural work gets handled before "content volume" begins.' },
    { title: 'Build growth assets', description: 'We improve key pages, publish the right content, and strengthen internal linking.' },
    { title: 'Scale authority', description: 'We build credibility with a strategy that matches your niche and risk tolerance.' },
    { title: 'Refine and compound', description: 'SEO wins stack when execution is consistent. We optimize what\'s working.' }
  ]

  const faqs = [
    {
      question: 'Do you guarantee #1 rankings?',
      answer: 'No—anyone who guarantees positions is selling you a fantasy. What we do guarantee is disciplined execution, transparent reporting, and a strategy built around measurable business outcomes.'
    },
    {
      question: 'How long until we see results?',
      answer: 'It depends on competition, your site\'s starting condition, and how much needs fixing. The right way to think about SEO is: foundations first, then compounding growth.'
    },
    {
      question: 'Do you only do SEO, or can you fix the site too?',
      answer: 'We\'re technical. If the problem is the website (speed, structure, implementation), we can handle it—or coordinate tightly with your dev team so execution doesn\'t stall.',
      link: '/services/website-development',
      linkText: 'Website Development →'
    },
    {
      question: 'What if we\'ve been burned before?',
      answer: 'That\'s exactly who we\'re built for. We\'ll show you what\'s broken, what matters most, and what will actually be shipped—so you\'re not paying for "plans" and hoping.'
    },
    {
      question: 'Do you outsource?',
      answer: 'We don\'t sell work we can\'t control. Execution stays accountable and aligned with your goals.'
    },
    {
      question: 'Can you help with AI visibility too (AEO/GEO)?',
      answer: 'Yes. Answer Engine Optimization (AEO) is built into our SEO services—we structure content so AI tools like ChatGPT cite your brand. For Generative Engine Optimization (GEO), we offer specialized strategies to ensure your brand appears in AI-generated content and recommendations.',
      link: '/services/geo',
      linkText: 'Learn about GEO →'
    }
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
                Full-Service SEO
              </span>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="text-5xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-gray-900 via-blue-800 to-cyan-800 bg-clip-text text-transparent leading-tight"
            >
              SEO That Actually Moves the Needle
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="text-xl md:text-2xl text-gray-600 mb-6 leading-relaxed"
            >
              If you've been burned by agencies that sell confidence and outsource execution, this is your reset. We run hands-on SEO that fixes real issues, builds real authority, and turns visibility into revenue.
            </motion.p>

            <motion.p
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="text-lg text-gray-700 mb-8"
            >
              Technical and accountable—SEO built around your business goals, including Answer Engine Optimization (AEO) for AI tools.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
            >
              <a href="/contact" className="inline-block bg-gradient-to-r from-blue-600 to-cyan-600 text-white px-8 py-4 rounded-xl font-semibold text-lg hover:shadow-2xl hover:scale-105 transition-all duration-300">
                Book a Discovery Call
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
                This is for businesses that want growth—not another report
              </h2>
            </AnimatedSection>

            <div className="space-y-4 mt-12">
              {targetAudience.map((item, index) => (
                <AnimatedSection key={index}>
                  <div className="flex items-start gap-4 p-6 bg-gradient-to-r from-blue-50 to-cyan-50 rounded-2xl border border-blue-200 hover:border-blue-400 hover:shadow-lg transition-all duration-300 group">
                    <div className="flex-shrink-0">
                      <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-cyan-600 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
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

      <section className="py-24 bg-gradient-to-br from-blue-50 via-white to-cyan-50">
        <div className="container-custom">
          <div className="max-w-5xl mx-auto">
            <AnimatedSection>
              <h2 className="text-4xl md:text-5xl font-bold mb-4 text-gray-900 text-center">
                The problems we fix
              </h2>
              <p className="text-2xl text-center font-semibold bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent mb-12">
                The stuff most agencies avoid
              </p>
            </AnimatedSection>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {problemsFixed.map((problem, index) => (
                <AnimatedSection key={index}>
                  <div className="group h-full p-6 bg-white rounded-2xl border border-gray-200 hover:border-blue-400 hover:shadow-xl transition-all duration-300">
                    <div className="w-12 h-12 bg-gradient-to-br from-red-500 to-orange-500 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                      <Shield className="w-6 h-6 text-white" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 mb-2">{problem.title}</h3>
                    <p className="text-gray-600 leading-relaxed">{problem.desc}</p>
                  </div>
                </AnimatedSection>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="py-24 bg-white">
        <div className="container-custom">
          <div className="max-w-5xl mx-auto">
            <AnimatedSection>
              <h2 className="text-4xl md:text-5xl font-bold mb-4 text-gray-900 text-center">
                What's included
              </h2>
              <p className="text-xl text-gray-600 mb-16 text-center">
                Real deliverables, not vague promises
              </p>
            </AnimatedSection>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {deliverables.map((section, index) => {
                const Icon = section.icon
                return (
                  <AnimatedSection key={index}>
                    <div className="h-full p-8 bg-gradient-to-br from-blue-50 to-cyan-50 rounded-2xl border border-blue-200 hover:border-blue-400 hover:shadow-xl transition-all duration-300">
                      <div className="flex items-center gap-4 mb-6">
                        <div className="w-14 h-14 bg-gradient-to-br from-blue-600 to-cyan-600 rounded-xl flex items-center justify-center">
                          <Icon className="w-7 h-7 text-white" />
                        </div>
                        <h3 className="text-2xl font-bold text-gray-900">
                          {section.category}
                        </h3>
                      </div>
                      <ul className="space-y-3">
                        {section.items.map((item, itemIndex) => (
                          <li key={itemIndex} className="flex items-start gap-3">
                            <CheckCircle2 className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                            <span className="text-gray-700 leading-relaxed">{item}</span>
                          </li>
                        ))}
                      </ul>
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
          <div className="max-w-4xl mx-auto">
            <AnimatedSection>
              <h2 className="text-4xl md:text-5xl font-bold mb-4 text-gray-900 text-center">
                How we work
              </h2>
              <p className="text-xl text-gray-600 mb-16 text-center">
                Tailored, not templated
              </p>
            </AnimatedSection>

            <div className="space-y-6">
              {workflow.map((step, index) => (
                <AnimatedSection key={index}>
                  <div className="flex items-start gap-6 p-8 bg-white rounded-2xl border border-gray-200 hover:border-blue-400 hover:shadow-xl transition-all duration-300 group">
                    <div className="flex-shrink-0">
                      <div className="w-14 h-14 bg-gradient-to-br from-blue-600 to-cyan-600 rounded-xl flex items-center justify-center text-white font-bold text-xl group-hover:scale-110 transition-transform duration-300">
                        {index + 1}
                      </div>
                    </div>
                    <div className="flex-1">
                      <h3 className="text-2xl font-bold text-gray-900 mb-2">
                        {step.title}
                      </h3>
                      <p className="text-gray-600 leading-relaxed text-lg">{step.description}</p>
                    </div>
                  </div>
                </AnimatedSection>
              ))}
            </div>

            <AnimatedSection className="mt-12">
              <p className="text-2xl font-semibold text-center bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">
                No one-size-fits-all. Just a roadmap built for your business.
              </p>
            </AnimatedSection>
          </div>
        </div>
      </section>

      <section className="py-24 bg-white">
        <div className="container-custom">
          <div className="max-w-4xl mx-auto">
            <AnimatedSection>
              <h2 className="text-4xl md:text-5xl font-bold mb-6 text-gray-900">
                Why CCOMS
              </h2>
              <p className="text-xl text-gray-600 mb-8">
                You're hiring people who do the work—not people who outsource it.
              </p>
            </AnimatedSection>

            <AnimatedSection>
              <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-2xl p-8 md:p-12 border border-blue-200">
                <p className="text-lg text-gray-700 leading-relaxed mb-6">
                  I'm John Paul Carrasco, founder of CCOMS. I've spent 14 years doing hands-on SEO and technical execution—down to code, hosting, domains, DNS, and performance. That technical depth matters because SEO breaks when strategy is separated from implementation.
                </p>
                <p className="text-lg text-gray-700 leading-relaxed mb-6">
                  We're built for long-term partnerships, not one-month churn. Clients stay because execution stays consistent—and results compound.
                </p>
                <Link href="/about" className="inline-flex items-center text-blue-600 font-semibold hover:text-cyan-600 transition-colors text-lg">
                  Learn more about CCOMS <ArrowRight className="ml-2 w-5 h-5" />
                </Link>
              </div>
            </AnimatedSection>
          </div>
        </div>
      </section>

      <section className="py-24 bg-gradient-to-br from-blue-50 via-white to-cyan-50">
        <div className="container-custom">
          <div className="max-w-3xl mx-auto">
            <AnimatedSection>
              <h2 className="text-4xl font-bold mb-12 text-center text-gray-900">
                Frequently Asked Questions
              </h2>
            </AnimatedSection>

            <div className="space-y-6">
              {faqs.map((faq, index) => (
                <AnimatedSection key={index}>
                  <div className="bg-white p-6 md:p-8 rounded-2xl border border-gray-200 hover:border-blue-400 hover:shadow-lg transition-all duration-300">
                    <h3 className="text-xl font-bold text-gray-900 mb-3">
                      {faq.question}
                    </h3>
                    <p className="text-gray-700 leading-relaxed mb-3">{faq.answer}</p>
                    {faq.link && (
                      <Link href={faq.link} className="text-blue-600 font-semibold hover:text-cyan-600 transition-colors">
                        {faq.linkText}
                      </Link>
                    )}
                  </div>
                </AnimatedSection>
              ))}
            </div>
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
                Done paying for half-delivered SEO?
              </h2>

              <p className="text-xl text-blue-100 mb-12 leading-relaxed">
                Book a discovery call and we'll map a tailored plan that targets growth you can measure.
              </p>

              <a href="/contact" className="inline-block bg-white text-blue-600 px-8 py-4 rounded-xl font-semibold text-lg hover:shadow-2xl hover:scale-105 transition-all duration-300">
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

'use client'

import Link from 'next/link'
import { ArrowRight, Zap, Target, TrendingUp } from 'lucide-react'

export default function HeroVariation3() {
  return (
    <section className="relative min-h-screen bg-white overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(59,130,246,0.1),transparent_50%),radial-gradient(circle_at_70%_60%,rgba(6,182,212,0.1),transparent_50%)]"></div>

      <div className="container-custom relative z-10 py-20">
        <div className="grid lg:grid-cols-12 gap-8 items-center min-h-[calc(100vh-10rem)]">
          <div className="lg:col-span-7 space-y-6">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-50 to-cyan-50 border border-blue-200 rounded-full">
              <Zap className="w-4 h-4 text-blue-600" />
              <span className="text-sm font-semibold text-blue-900">No Outsourcing • No Guesswork • Just Results</span>
            </div>

            <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold text-gray-900 leading-[1.1]">
              Tired of agencies that{' '}
              <span className="relative inline-block">
                <span className="relative z-10 bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">
                  overpromise
                </span>
                <svg className="absolute -bottom-2 left-0 w-full" height="12" viewBox="0 0 300 12" fill="none">
                  <path d="M2 10C100 2 200 2 298 10" stroke="#0ea5e9" strokeWidth="3" strokeLinecap="round"/>
                </svg>
              </span>
              {' '}and underdeliver?
            </h1>

            <p className="text-xl text-gray-600 leading-relaxed max-w-2xl">
              Core Conversion is a technical-first digital marketing agency. We specialize in rescuing businesses from broken strategies and delivering measurable growth through hands-on execution.
            </p>

            <div className="grid sm:grid-cols-3 gap-4 pt-4">
              {[
                { icon: Target, label: 'Technical SEO', desc: 'Done right' },
                { icon: Zap, label: 'Web Dev', desc: 'Fast & clean' },
                { icon: TrendingUp, label: 'Real Growth', desc: 'Not vanity metrics' }
              ].map((item, index) => {
                const Icon = item.icon
                return (
                  <div key={index} className="flex items-start gap-3 p-4 bg-gradient-to-br from-blue-50 to-cyan-50 rounded-xl border border-blue-100">
                    <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-cyan-600 rounded-lg flex items-center justify-center flex-shrink-0">
                      <Icon className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <div className="font-bold text-gray-900 text-sm">{item.label}</div>
                      <div className="text-xs text-gray-600">{item.desc}</div>
                    </div>
                  </div>
                )
              })}
            </div>

            <div className="flex flex-col sm:flex-row gap-4 pt-4">
              <Link
                href="/contact"
                className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-gradient-to-r from-blue-600 to-cyan-600 text-white rounded-xl font-bold text-lg shadow-lg hover:shadow-2xl hover:scale-105 transition-all duration-300"
              >
                Book Your Free Discovery Call
                <ArrowRight className="w-5 h-5" />
              </Link>

              <Link
                href="/services"
                className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-white border-2 border-gray-300 text-gray-900 rounded-xl font-bold text-lg hover:border-blue-600 transition-all duration-300"
              >
                Explore Services
              </Link>
            </div>

            <p className="text-sm text-gray-500 pt-2">
              Talk directly with founder John Paul Carrasco. No sales scripts. No bait-and-switch.
            </p>
          </div>

          <div className="lg:col-span-5 relative">
            <div className="relative">
              <div className="aspect-[4/5] rounded-3xl overflow-hidden shadow-2xl">
                <img
                  src="https://images.pexels.com/photos/3184291/pexels-photo-3184291.jpeg?auto=compress&cs=tinysrgb&w=800"
                  alt="Team collaborating on digital marketing strategy"
                  className="w-full h-full object-cover"
                />
              </div>

              <div className="absolute -bottom-8 -left-8 bg-white rounded-2xl shadow-2xl p-6 max-w-xs">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Organic Traffic</span>
                    <span className="text-sm font-bold text-green-600">↑ 340%</span>
                  </div>
                  <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-blue-600 to-cyan-600 rounded-full" style={{ width: '85%' }}></div>
                  </div>
                  <div className="flex items-center justify-between text-xs text-gray-500">
                    <span>Jan 2024</span>
                    <span>Dec 2024</span>
                  </div>
                </div>
              </div>

              <div className="absolute -top-8 -right-8 bg-gradient-to-br from-blue-600 to-cyan-600 text-white rounded-2xl shadow-2xl p-6 max-w-[200px]">
                <div className="text-center">
                  <div className="text-4xl font-bold mb-1">98%</div>
                  <div className="text-sm text-blue-100">Client Retention Rate</div>
                </div>
              </div>

              <div className="absolute top-1/2 -left-12 w-24 h-24 bg-gradient-to-br from-cyan-400 to-blue-600 rounded-full opacity-20 blur-2xl"></div>
              <div className="absolute bottom-1/4 -right-12 w-32 h-32 bg-gradient-to-br from-blue-400 to-cyan-600 rounded-full opacity-20 blur-2xl"></div>
            </div>
          </div>
        </div>

        <div className="mt-20 pt-12 border-t border-gray-200">
          <div className="grid grid-cols-2 md:grid-cols-5 gap-8 items-center opacity-60">
            <div className="flex items-center justify-center">
              <div className="text-center">
                <div className="font-bold text-gray-400 text-lg mb-1">GOOGLE</div>
                <div className="text-xs text-gray-400">Certified Partner</div>
              </div>
            </div>
            <div className="flex items-center justify-center">
              <div className="text-center">
                <div className="font-bold text-gray-400 text-lg mb-1">AWS</div>
                <div className="text-xs text-gray-400">Cloud Expert</div>
              </div>
            </div>
            <div className="flex items-center justify-center">
              <div className="text-center">
                <div className="font-bold text-gray-400 text-lg mb-1">SHOPIFY</div>
                <div className="text-xs text-gray-400">Plus Partner</div>
              </div>
            </div>
            <div className="flex items-center justify-center">
              <div className="text-center">
                <div className="font-bold text-gray-400 text-lg mb-1">META</div>
                <div className="text-xs text-gray-400">Business Partner</div>
              </div>
            </div>
            <div className="flex items-center justify-center">
              <div className="text-center">
                <div className="font-bold text-gray-400 text-lg mb-1">SEMRUSH</div>
                <div className="text-xs text-gray-400">Agency Partner</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

'use client'

import Link from 'next/link'
import { ArrowRight, Play } from 'lucide-react'

export default function HeroVariation1() {
  return (
    <section className="relative min-h-screen flex items-center bg-white overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-slate-50 via-blue-50/30 to-cyan-50/50"></div>

      <div className="absolute inset-0 opacity-5">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#0ea5e9_1px,transparent_1px),linear-gradient(to_bottom,#0ea5e9_1px,transparent_1px)] bg-[size:4rem_4rem]"></div>
      </div>

      <div className="container-custom relative z-10 py-32">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-8">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-50 border border-blue-200 rounded-full">
              <div className="w-2 h-2 bg-blue-600 rounded-full animate-pulse"></div>
              <span className="text-sm font-semibold text-blue-900">Operators, Not Salesmen</span>
            </div>

            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 leading-tight">
              Stop paying for{' '}
              <span className="bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent inline-block pb-1">
                guesswork
              </span>
              .<br className="hidden sm:block" /> Get execution.
            </h1>

            <p className="text-xl text-gray-600 leading-relaxed max-w-xl">
              Core Conversion rebuilds what broken agencies destroyed. We deliver technical SEO, web development, and digital strategy that actually moves metrics—not just reports.
            </p>

            <div className="flex flex-col sm:flex-row gap-4">
              <Link
                href="/contact"
                className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-gradient-to-r from-blue-600 to-cyan-600 text-white rounded-xl font-semibold text-lg shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300"
              >
                Start Your Free Audit
                <ArrowRight className="w-5 h-5" />
              </Link>

              <Link
                href="/services"
                className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-white border-2 border-gray-300 text-gray-900 rounded-xl font-semibold text-lg hover:border-blue-600 hover:text-blue-600 transition-all duration-300"
              >
                <Play className="w-5 h-5" />
                See How We Work
              </Link>
            </div>

            <div className="flex items-center gap-8 pt-4">
              <div>
                <div className="text-3xl font-bold text-gray-900">14+</div>
                <div className="text-sm text-gray-600">Years Experience</div>
              </div>
              <div className="w-px h-12 bg-gray-300"></div>
              <div>
                <div className="text-3xl font-bold text-gray-900">100%</div>
                <div className="text-sm text-gray-600">Hands-On Work</div>
              </div>
              <div className="w-px h-12 bg-gray-300"></div>
              <div>
                <div className="text-3xl font-bold text-gray-900">0</div>
                <div className="text-sm text-gray-600">Outsourcing</div>
              </div>
            </div>
          </div>

          <div className="relative">
            <div className="relative z-10 rounded-2xl overflow-hidden shadow-2xl bg-gradient-to-br from-gray-900 to-gray-800">
              <div className="aspect-[4/3] p-8">
                <div className="h-full flex flex-col">
                  <div className="flex items-center justify-between mb-6">
                    <div className="text-white">
                      <div className="text-sm font-medium text-gray-400 mb-1">Analytics Dashboard</div>
                      <div className="text-2xl font-bold">Performance Overview</div>
                    </div>
                    <div className="flex gap-2">
                      <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                      <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                      <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                    </div>
                  </div>

                  <div className="flex-1 flex items-end gap-3">
                    <div className="flex-1 bg-gradient-to-t from-blue-600 to-blue-400 rounded-t-lg" style={{ height: '45%' }}>
                      <div className="text-white text-center pt-2 text-xs font-semibold">Jan</div>
                    </div>
                    <div className="flex-1 bg-gradient-to-t from-blue-600 to-blue-400 rounded-t-lg" style={{ height: '55%' }}>
                      <div className="text-white text-center pt-2 text-xs font-semibold">Feb</div>
                    </div>
                    <div className="flex-1 bg-gradient-to-t from-blue-600 to-blue-400 rounded-t-lg" style={{ height: '70%' }}>
                      <div className="text-white text-center pt-2 text-xs font-semibold">Mar</div>
                    </div>
                    <div className="flex-1 bg-gradient-to-t from-cyan-600 to-cyan-400 rounded-t-lg" style={{ height: '85%' }}>
                      <div className="text-white text-center pt-2 text-xs font-semibold">Apr</div>
                    </div>
                    <div className="flex-1 bg-gradient-to-t from-cyan-600 to-cyan-400 rounded-t-lg" style={{ height: '92%' }}>
                      <div className="text-white text-center pt-2 text-xs font-semibold">May</div>
                    </div>
                    <div className="flex-1 bg-gradient-to-t from-green-600 to-green-400 rounded-t-lg" style={{ height: '100%' }}>
                      <div className="text-white text-center pt-2 text-xs font-semibold">Jun</div>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-4 mt-6">
                    <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3">
                      <div className="text-xs text-gray-400">Visitors</div>
                      <div className="text-xl font-bold text-white">125.4K</div>
                    </div>
                    <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3">
                      <div className="text-xs text-gray-400">Conversion</div>
                      <div className="text-xl font-bold text-white">8.2%</div>
                    </div>
                    <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3">
                      <div className="text-xs text-gray-400">Revenue</div>
                      <div className="text-xl font-bold text-white">$84K</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="absolute -bottom-6 -right-6 w-full h-full bg-gradient-to-br from-blue-600 to-cyan-600 rounded-2xl -z-10"></div>

            <div className="absolute top-8 -left-8 bg-white rounded-2xl shadow-xl p-6 max-w-xs">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                  <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                  </svg>
                </div>
                <div>
                  <div className="text-2xl font-bold text-gray-900">+340%</div>
                  <div className="text-sm text-gray-600">Traffic Growth</div>
                </div>
              </div>
            </div>

            <div className="absolute bottom-8 -right-8 bg-white rounded-2xl shadow-xl p-6 max-w-xs">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                  <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div>
                  <div className="text-sm text-gray-600">Page Load Speed</div>
                  <div className="text-2xl font-bold text-gray-900">0.8s</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

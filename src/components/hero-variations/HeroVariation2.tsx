'use client'

import Link from 'next/link'
import { CheckCircle, ArrowRight } from 'lucide-react'

export default function HeroVariation2() {
  return (
    <section className="relative min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-gray-900 text-white overflow-hidden">
      <div className="absolute inset-0">
        <img
          src="https://images.pexels.com/photos/3183150/pexels-photo-3183150.jpeg?auto=compress&cs=tinysrgb&w=1920"
          alt="Professional team working on digital strategy"
          className="w-full h-full object-cover opacity-20"
        />
        <div className="absolute inset-0 bg-gradient-to-br from-gray-900/95 via-blue-900/95 to-gray-900/95"></div>
      </div>

      <div className="absolute inset-0 opacity-30">
        <div className="absolute top-20 left-10 w-72 h-72 bg-blue-500 rounded-full mix-blend-multiply filter blur-3xl animate-blob"></div>
        <div className="absolute top-40 right-10 w-72 h-72 bg-cyan-500 rounded-full mix-blend-multiply filter blur-3xl animate-blob animation-delay-2000"></div>
        <div className="absolute -bottom-8 left-1/2 w-72 h-72 bg-blue-600 rounded-full mix-blend-multiply filter blur-3xl animate-blob animation-delay-4000"></div>
      </div>

      <div className="container-custom relative z-10 py-32">
        <div className="max-w-5xl mx-auto">
          <div className="text-center space-y-8">
            <div className="inline-flex items-center gap-2 px-5 py-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full">
              <span className="text-sm font-semibold text-white">Trusted by Growth-Focused Businesses</span>
            </div>

            <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold leading-tight">
              Your agency burned you.
              <br />
              <span className="bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
                We'll rebuild it right.
              </span>
            </h1>

            <p className="text-xl md:text-2xl text-blue-100 max-w-3xl mx-auto leading-relaxed">
              If you've been promised growth but got nothing but reports and excuses, you're in the right place. We actually do the work—technical SEO, web development, content strategy, and conversion optimization. No middlemen.
            </p>

            <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto pt-8">
              {[
                'No outsourcing—ever',
                'Real technical execution',
                'Transparent communication'
              ].map((item, index) => (
                <div key={index} className="flex items-center gap-3 text-left">
                  <CheckCircle className="w-6 h-6 text-cyan-400 flex-shrink-0" />
                  <span className="text-lg text-white font-medium">{item}</span>
                </div>
              ))}
            </div>

            <div className="flex flex-col sm:flex-row gap-4 items-center justify-center pt-4">
              <Link
                href="/contact"
                className="inline-flex items-center gap-2 px-10 py-5 bg-white text-blue-900 rounded-xl font-bold text-lg shadow-2xl hover:scale-105 transition-all duration-300"
              >
                Get Your Free Audit
                <ArrowRight className="w-5 h-5" />
              </Link>

              <Link
                href="/case-studies"
                className="inline-flex items-center gap-2 px-10 py-5 bg-white/10 backdrop-blur-sm border-2 border-white/30 text-white rounded-xl font-bold text-lg hover:bg-white/20 transition-all duration-300"
              >
                See Proof
              </Link>
            </div>

            <div className="pt-12">
              <div className="inline-flex items-center gap-6 p-6 bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10">
                <img
                  src="https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg?auto=compress&cs=tinysrgb&w=150"
                  alt="John Paul Carrasco, Founder"
                  className="w-16 h-16 rounded-full object-cover border-2 border-cyan-400"
                />
                <div className="text-left">
                  <div className="font-bold text-white text-lg">Talk to the founder directly</div>
                  <div className="text-blue-200">John Paul Carrasco • 14 years experience</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-4xl mx-auto mt-20">
          <div className="text-center">
            <div className="text-4xl md:text-5xl font-bold text-white mb-2">14+</div>
            <div className="text-sm text-blue-200">Years Experience</div>
          </div>
          <div className="text-center">
            <div className="text-4xl md:text-5xl font-bold text-white mb-2">50+</div>
            <div className="text-sm text-blue-200">Sites Launched</div>
          </div>
          <div className="text-center">
            <div className="text-4xl md:text-5xl font-bold text-white mb-2">340%</div>
            <div className="text-sm text-blue-200">Avg. Traffic Growth</div>
          </div>
          <div className="text-center">
            <div className="text-4xl md:text-5xl font-bold text-white mb-2">100%</div>
            <div className="text-sm text-blue-200">Client Satisfaction</div>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes blob {
          0%, 100% { transform: translate(0px, 0px) scale(1); }
          33% { transform: translate(30px, -50px) scale(1.1); }
          66% { transform: translate(-20px, 20px) scale(0.9); }
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
    </section>
  )
}

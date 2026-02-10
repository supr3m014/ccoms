'use client'

import { useState, FormEvent, useRef } from 'react'
import { motion, useInView } from 'framer-motion'
import { createClient } from '@supabase/supabase-js'
import CTAButtons from '@/components/CTAButtons'
import { Mail, Phone, MapPin, Send, CheckCircle2, AlertCircle } from 'lucide-react'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

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

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    company: '',
    message: ''
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsSubmitting(true)
    setError(null)

    try {
      const { error: submitError } = await supabase
        .from('contact_submissions')
        .insert([
          {
            name: formData.name,
            email: formData.email,
            phone: formData.phone || null,
            company: formData.company || null,
            message: formData.message,
            status: 'new'
          }
        ])

      if (submitError) throw submitError

      setIsSubmitted(true)
      setFormData({ name: '', email: '', phone: '', company: '', message: '' })

      setTimeout(() => {
        setIsSubmitted(false)
      }, 5000)
    } catch (err) {
      console.error('Error submitting form:', err)
      setError('Something went wrong. Please try again or email us directly.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="relative overflow-hidden">
      <section className="relative min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-cyan-50 pt-32 pb-16 overflow-hidden">
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-20 right-20 w-96 h-96 bg-blue-400 rounded-full mix-blend-multiply filter blur-3xl animate-blob"></div>
          <div className="absolute bottom-20 left-20 w-96 h-96 bg-cyan-400 rounded-full mix-blend-multiply filter blur-3xl animate-blob animation-delay-2000"></div>
        </div>

        <div className="container-custom relative z-10">
          <div className="max-w-5xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="text-center mb-12"
            >
              <div className="inline-block mb-6">
                <span className="px-4 py-2 bg-gradient-to-r from-blue-600 to-cyan-600 text-white text-sm font-semibold rounded-full shadow-lg">
                  Get in Touch
                </span>
              </div>

              <h1 className="text-5xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-gray-900 via-blue-800 to-cyan-800 bg-clip-text text-transparent leading-tight">
                Let's talk about real growth
              </h1>

              <p className="text-xl md:text-2xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
                If you've been burned before, you're not alone. Let's discuss how accountable execution can drive measurable results for your business.
              </p>
            </motion.div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
              <AnimatedSection>
                <div className="bg-white p-8 md:p-10 rounded-3xl border border-gray-200 shadow-xl">
                  <h2 className="text-2xl md:text-3xl font-bold mb-6 text-gray-900">
                    Send us a message
                  </h2>

                  {isSubmitted ? (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="bg-gradient-to-br from-green-50 to-emerald-50 border border-green-200 rounded-2xl p-8 text-center"
                    >
                      <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-emerald-500 rounded-full flex items-center justify-center mx-auto mb-4">
                        <CheckCircle2 className="w-8 h-8 text-white" />
                      </div>
                      <h3 className="text-2xl font-bold text-gray-900 mb-2">
                        Message received!
                      </h3>
                      <p className="text-gray-600 text-lg">
                        We'll get back to you within 24 hours.
                      </p>
                    </motion.div>
                  ) : (
                    <form onSubmit={handleSubmit} className="space-y-6">
                      {error && (
                        <motion.div
                          initial={{ opacity: 0, y: -10 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-start space-x-3"
                        >
                          <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                          <p className="text-red-800 text-sm">{error}</p>
                        </motion.div>
                      )}

                      <div>
                        <label
                          htmlFor="name"
                          className="block text-sm font-semibold text-gray-700 mb-2"
                        >
                          Name *
                        </label>
                        <input
                          type="text"
                          id="name"
                          required
                          value={formData.name}
                          onChange={(e) =>
                            setFormData({ ...formData, name: e.target.value })
                          }
                          className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all bg-white"
                          placeholder="John Doe"
                        />
                      </div>

                      <div>
                        <label
                          htmlFor="email"
                          className="block text-sm font-semibold text-gray-700 mb-2"
                        >
                          Email *
                        </label>
                        <input
                          type="email"
                          id="email"
                          required
                          value={formData.email}
                          onChange={(e) =>
                            setFormData({ ...formData, email: e.target.value })
                          }
                          className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all bg-white"
                          placeholder="you@company.com"
                        />
                      </div>

                      <div>
                        <label
                          htmlFor="phone"
                          className="block text-sm font-semibold text-gray-700 mb-2"
                        >
                          Phone
                        </label>
                        <input
                          type="tel"
                          id="phone"
                          value={formData.phone}
                          onChange={(e) =>
                            setFormData({ ...formData, phone: e.target.value })
                          }
                          className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all bg-white"
                          placeholder="+63 992 298 1422"
                        />
                      </div>

                      <div>
                        <label
                          htmlFor="company"
                          className="block text-sm font-semibold text-gray-700 mb-2"
                        >
                          Company
                        </label>
                        <input
                          type="text"
                          id="company"
                          value={formData.company}
                          onChange={(e) =>
                            setFormData({ ...formData, company: e.target.value })
                          }
                          className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all bg-white"
                          placeholder="Your Company"
                        />
                      </div>

                      <div>
                        <label
                          htmlFor="message"
                          className="block text-sm font-semibold text-gray-700 mb-2"
                        >
                          Message *
                        </label>
                        <textarea
                          id="message"
                          required
                          rows={6}
                          value={formData.message}
                          onChange={(e) =>
                            setFormData({ ...formData, message: e.target.value })
                          }
                          className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all resize-none bg-white"
                          placeholder="Tell us about your goals and challenges..."
                        />
                      </div>

                      <button
                        type="submit"
                        disabled={isSubmitting}
                        className="w-full bg-gradient-to-r from-blue-600 to-cyan-600 text-white py-4 px-6 rounded-xl font-semibold hover:shadow-2xl hover:scale-105 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 flex items-center justify-center space-x-2"
                      >
                        {isSubmitting ? (
                          <>
                            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                            <span>Sending...</span>
                          </>
                        ) : (
                          <>
                            <Send className="w-5 h-5" />
                            <span>Send Message</span>
                          </>
                        )}
                      </button>
                    </form>
                  )}
                </div>
              </AnimatedSection>

              <div className="space-y-8">
                <AnimatedSection>
                  <div className="bg-gradient-to-br from-gray-50 to-blue-50 p-8 rounded-3xl border border-gray-200">
                    <h2 className="text-2xl font-bold mb-4 text-gray-900">
                      Or book a discovery call
                    </h2>
                    <p className="text-gray-600 mb-6 leading-relaxed">
                      Prefer to talk directly? Schedule a discovery call and we'll discuss your goals, challenges, and how we can help.
                    </p>
                    <CTAButtons showMicrocopy={false} />
                  </div>
                </AnimatedSection>

                <AnimatedSection>
                  <div className="bg-white p-8 rounded-3xl border border-gray-200 shadow-xl">
                    <h3 className="text-xl font-bold mb-6 text-gray-900">Contact Information</h3>

                    <div className="space-y-6">
                      <div className="flex items-start space-x-4">
                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-600 to-cyan-600 flex items-center justify-center flex-shrink-0">
                          <Mail className="w-6 h-6 text-white" />
                        </div>
                        <div>
                          <p className="font-semibold text-gray-900 mb-1">Email</p>
                          <a
                            href="mailto:hello@ccoms.ph"
                            className="text-blue-600 hover:text-cyan-600 transition-colors"
                          >
                            hello@ccoms.ph
                          </a>
                        </div>
                      </div>

                      <div className="flex items-start space-x-4">
                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-600 to-cyan-600 flex items-center justify-center flex-shrink-0">
                          <Phone className="w-6 h-6 text-white" />
                        </div>
                        <div>
                          <p className="font-semibold text-gray-900 mb-1">Phone</p>
                          <a
                            href="tel:+639922981422"
                            className="text-blue-600 hover:text-cyan-600 transition-colors"
                          >
                            +63 992 298 1422
                          </a>
                        </div>
                      </div>

                      <div className="flex items-start space-x-4">
                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-600 to-cyan-600 flex items-center justify-center flex-shrink-0">
                          <MapPin className="w-6 h-6 text-white" />
                        </div>
                        <div>
                          <p className="font-semibold text-gray-900 mb-1">Location</p>
                          <p className="text-gray-600">Binan City, Laguna, Philippines</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </AnimatedSection>

                <AnimatedSection>
                  <div className="bg-gradient-to-br from-blue-600 to-cyan-600 p-8 rounded-3xl text-white">
                    <h3 className="text-xl font-bold mb-3">Response Time</h3>
                    <p className="text-blue-100 text-lg mb-4">
                      We typically respond within 24 hours on business days.
                    </p>
                    <p className="text-blue-100 text-sm">
                      For urgent matters, please mention it in your message and we'll prioritize accordingly.
                    </p>
                  </div>
                </AnimatedSection>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-24 bg-white">
        <div className="container-custom">
          <AnimatedSection>
            <div className="max-w-4xl mx-auto text-center">
              <h2 className="text-4xl md:text-5xl font-bold mb-6 text-gray-900">
                What happens after you reach out?
              </h2>
              <p className="text-xl text-gray-600 mb-16">
                No sales scripts. Just honest conversation about what will actually move your business forward.
              </p>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div className="p-8 bg-gradient-to-br from-gray-50 to-blue-50 rounded-2xl border border-gray-200">
                  <div className="w-14 h-14 bg-gradient-to-br from-blue-600 to-cyan-600 rounded-xl flex items-center justify-center text-white font-bold text-2xl mx-auto mb-4">
                    1
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-3">We Respond</h3>
                  <p className="text-gray-600">
                    Within 24 hours, you'll hear from us directly—no automated responses.
                  </p>
                </div>

                <div className="p-8 bg-gradient-to-br from-gray-50 to-blue-50 rounded-2xl border border-gray-200">
                  <div className="w-14 h-14 bg-gradient-to-br from-blue-600 to-cyan-600 rounded-xl flex items-center justify-center text-white font-bold text-2xl mx-auto mb-4">
                    2
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-3">Discovery Call</h3>
                  <p className="text-gray-600">
                    We'll discuss your challenges, goals, and current situation in detail.
                  </p>
                </div>

                <div className="p-8 bg-gradient-to-br from-gray-50 to-blue-50 rounded-2xl border border-gray-200">
                  <div className="w-14 h-14 bg-gradient-to-br from-blue-600 to-cyan-600 rounded-xl flex items-center justify-center text-white font-bold text-2xl mx-auto mb-4">
                    3
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-3">Custom Roadmap</h3>
                  <p className="text-gray-600">
                    If we're a fit, we'll create a tailored execution plan for your business.
                  </p>
                </div>
              </div>
            </div>
          </AnimatedSection>
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

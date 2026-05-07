'use client'

import { useState, FormEvent } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X } from 'lucide-react'

interface AuditPopupProps {
  isOpen: boolean
  onClose: () => void
}

export default function AuditPopup({ isOpen, onClose }: AuditPopupProps) {
  const [formData, setFormData] = useState({
    websiteUrl: '',
    email: '',
    goal: '',
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsSubmitting(true)

    await new Promise(resolve => setTimeout(resolve, 1000))

    setIsSubmitting(false)
    setIsSubmitted(true)

    setTimeout(() => {
      onClose()
      setIsSubmitted(false)
      setFormData({ websiteUrl: '', email: '', goal: '' })
    }, 2000)
  }

  const goals = [
    'Rankings',
    'Leads',
    'Sales',
    'Speed',
    'AI visibility',
    'Unsure',
  ]

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/50 z-50 backdrop-blur-sm"
          />

          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ duration: 0.2 }}
              className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-8 relative"
            >
              <button
                onClick={onClose}
                className="absolute top-4 right-4 text-neutral-400 hover:text-neutral-900 transition-colors"
                aria-label="Close"
              >
                <X className="w-6 h-6" />
              </button>

              {isSubmitted ? (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="text-center py-8"
                >
                  <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg
                      className="w-8 h-8 text-green-600"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                  </div>
                  <h3 className="text-2xl font-bold text-neutral-900 mb-2">
                    Thank you!
                  </h3>
                  <p className="text-neutral-600">
                    We'll send you a prioritized action list shortly.
                  </p>
                </motion.div>
              ) : (
                <>
                  <h2 className="text-2xl font-bold text-neutral-900 mb-2">
                    Get a Free Website Audit
                  </h2>
                  <p className="text-neutral-600 mb-6">
                    We'll send a prioritized action list. If we can't clearly move the needle, we'll tell you.
                  </p>

                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                      <label
                        htmlFor="websiteUrl"
                        className="block text-sm font-medium text-neutral-700 mb-1"
                      >
                        Website URL
                      </label>
                      <input
                        type="url"
                        id="websiteUrl"
                        required
                        value={formData.websiteUrl}
                        onChange={(e) =>
                          setFormData({ ...formData, websiteUrl: e.target.value })
                        }
                        className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all"
                        placeholder="https://yourwebsite.com"
                      />
                    </div>

                    <div>
                      <label
                        htmlFor="email"
                        className="block text-sm font-medium text-neutral-700 mb-1"
                      >
                        Email
                      </label>
                      <input
                        type="email"
                        id="email"
                        required
                        value={formData.email}
                        onChange={(e) =>
                          setFormData({ ...formData, email: e.target.value })
                        }
                        className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all"
                        placeholder="you@company.com"
                      />
                    </div>

                    <div>
                      <label
                        htmlFor="goal"
                        className="block text-sm font-medium text-neutral-700 mb-1"
                      >
                        What's your main goal?
                      </label>
                      <select
                        id="goal"
                        required
                        value={formData.goal}
                        onChange={(e) =>
                          setFormData({ ...formData, goal: e.target.value })
                        }
                        className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all"
                      >
                        <option value="">Select a goal</option>
                        {goals.map((goal) => (
                          <option key={goal} value={goal}>
                            {goal}
                          </option>
                        ))}
                      </select>
                    </div>

                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full btn btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isSubmitting ? 'Submitting...' : 'Get My Free Audit'}
                    </button>
                  </form>
                </>
              )}
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  )
}

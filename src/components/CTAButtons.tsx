'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import AuditPopup from './AuditPopup'

interface CTAButtonsProps {
  className?: string
  showMicrocopy?: boolean
}

export default function CTAButtons({ className = '', showMicrocopy = true }: CTAButtonsProps) {
  const [isAuditPopupOpen, setIsAuditPopupOpen] = useState(false)

  return (
    <div className={className}>
      <motion.button
        onClick={() => setIsAuditPopupOpen(true)}
        className="bg-white text-blue-600 border-2 border-blue-600 hover:bg-blue-50 px-8 py-4 rounded-xl font-semibold text-lg hover:shadow-xl hover:scale-105 transition-all duration-300"
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        Get a Free Website Audit
      </motion.button>

      <AuditPopup
        isOpen={isAuditPopupOpen}
        onClose={() => setIsAuditPopupOpen(false)}
      />
    </div>
  )
}

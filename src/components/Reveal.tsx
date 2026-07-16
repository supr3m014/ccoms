'use client'

import { motion, useReducedMotion } from 'framer-motion'

// Editorial reveal used across service/company pages.
// Respects prefers-reduced-motion (renders final state, no transform) — sitewide §15/§20.
// Easing = cubic-bezier(0.22,1,0.36,1) — the sitewide "confident deceleration".
export function Reveal({
  children,
  className = '',
  delay = 0,
  y = 24,
}: {
  children: React.ReactNode
  className?: string
  delay?: number
  y?: number
}) {
  const reduce = useReducedMotion()
  if (reduce) return <div className={className}>{children}</div>
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-70px' }}
      transition={{ duration: 0.72, ease: [0.22, 1, 0.36, 1], delay }}
    >
      {children}
    </motion.div>
  )
}

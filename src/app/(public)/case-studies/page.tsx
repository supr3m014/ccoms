'use client'

import { motion } from 'framer-motion'
import CTAButtons from '@/components/CTAButtons'

export default function CaseStudiesPage() {
  const fadeInUp = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  }

  const staggerContainer = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  }

  return (
    <>
      <section className="relative min-h-[70vh] flex items-center justify-center bg-gradient-to-br from-primary-50 via-white to-secondary-50 pt-32 pb-16">
        <div className="container-custom">
          <div className="max-w-4xl mx-auto text-center">
            <motion.h1
              initial="hidden"
              animate="visible"
              variants={fadeInUp}
              transition={{ duration: 0.6 }}
              className="mb-6"
            >
              Proof Over Promises
            </motion.h1>

            <motion.p
              initial="hidden"
              animate="visible"
              variants={fadeInUp}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="text-xl md:text-2xl text-neutral-600 mb-8"
            >
              Real work. Real outcomes. See how we've helped businesses achieve measurable growth.
            </motion.p>

            <motion.div
              initial="hidden"
              animate="visible"
              variants={fadeInUp}
              transition={{ duration: 0.6, delay: 0.3 }}
            >
              <CTAButtons className="flex justify-center" />
            </motion.div>
          </div>
        </div>
      </section>

      <section className="section-padding bg-white">
        <div className="container-custom">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={staggerContainer}
            className="max-w-4xl mx-auto text-center"
          >
            <motion.div
              variants={fadeInUp}
              className="bg-neutral-50 border border-neutral-200 rounded-xl p-12"
            >
              <h2 className="text-2xl font-bold text-neutral-900 mb-4">
                Case Studies Coming Soon
              </h2>
              <p className="text-lg text-neutral-600 mb-6">
                We're currently working with our clients to document their success stories. Check back soon to see detailed case studies showcasing our work and the results we've achieved.
              </p>
              <p className="text-neutral-600">
                In the meantime, book a discovery call to discuss how we can help your business achieve similar results.
              </p>
            </motion.div>
          </motion.div>
        </div>
      </section>

      <section className="section-padding bg-gradient-to-br from-primary-600 to-primary-800 text-white">
        <div className="container-custom">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={staggerContainer}
            className="max-w-3xl mx-auto text-center"
          >
            <motion.h2 variants={fadeInUp} className="text-white mb-6">
              If you want this kind of execution, book a discovery call.
            </motion.h2>

            <motion.p variants={fadeInUp} className="text-xl text-primary-100 mb-8">
              Let's discuss your goals and create a tailored plan to achieve measurable growth.
            </motion.p>

            <motion.div variants={fadeInUp}>
              <CTAButtons className="flex justify-center" showMicrocopy={false} />
            </motion.div>
          </motion.div>
        </div>
      </section>
    </>
  )
}

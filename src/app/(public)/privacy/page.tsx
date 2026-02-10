'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'

export default function PrivacyPage() {
  return (
    <div className="relative overflow-hidden bg-white">
      <section className="relative min-h-[40vh] flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-cyan-50 pt-32 pb-16">
        <div className="container-custom relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            <motion.h1
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="text-5xl md:text-6xl font-bold mb-6 text-gray-900"
            >
              Privacy Policy
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="text-xl text-gray-600"
            >
              Last updated: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
            </motion.p>
          </div>
        </div>
      </section>

      <section className="py-16">
        <div className="container-custom">
          <div className="max-w-4xl mx-auto prose prose-lg">
            <h2>1. Introduction</h2>
            <p>
              Core Conversion Digital Marketing Services ("we," "our," or "us") respects your privacy and is committed to protecting your personal data. This privacy policy explains how we collect, use, and safeguard your information when you visit our website or use our services.
            </p>

            <h2>2. Information We Collect</h2>
            <h3>2.1 Information You Provide</h3>
            <p>We collect information that you voluntarily provide to us, including:</p>
            <ul>
              <li>Name and contact information (email address, phone number)</li>
              <li>Company name and website</li>
              <li>Messages and communications you send us</li>
              <li>Information provided during discovery calls or consultations</li>
            </ul>

            <h3>2.2 Automatically Collected Information</h3>
            <p>When you visit our website, we may automatically collect:</p>
            <ul>
              <li>IP address and browser information</li>
              <li>Pages visited and time spent on our site</li>
              <li>Referral source and exit pages</li>
              <li>Device and operating system information</li>
            </ul>

            <h2>3. How We Use Your Information</h2>
            <p>We use the information we collect to:</p>
            <ul>
              <li>Respond to your inquiries and provide customer support</li>
              <li>Deliver our digital marketing services</li>
              <li>Send you updates, newsletters, and marketing communications (with your consent)</li>
              <li>Improve our website and services</li>
              <li>Analyze usage patterns and optimize user experience</li>
              <li>Comply with legal obligations</li>
            </ul>

            <h2>4. Information Sharing and Disclosure</h2>
            <p>We do not sell, trade, or rent your personal information to third parties. We may share your information only in the following circumstances:</p>
            <ul>
              <li><strong>Service Providers:</strong> With trusted third-party vendors who assist us in operating our website and delivering our services</li>
              <li><strong>Legal Requirements:</strong> When required by law or to protect our rights and safety</li>
              <li><strong>Business Transfers:</strong> In connection with a merger, acquisition, or sale of assets</li>
            </ul>

            <h2>5. Data Security</h2>
            <p>
              We implement appropriate technical and organizational measures to protect your personal data against unauthorized access, alteration, disclosure, or destruction. However, no method of transmission over the Internet is 100% secure, and we cannot guarantee absolute security.
            </p>

            <h2>6. Your Rights</h2>
            <p>You have the right to:</p>
            <ul>
              <li>Access the personal information we hold about you</li>
              <li>Request correction of inaccurate or incomplete data</li>
              <li>Request deletion of your personal data</li>
              <li>Object to or restrict our processing of your data</li>
              <li>Withdraw consent for marketing communications at any time</li>
            </ul>
            <p>
              To exercise these rights, please contact us at <a href="mailto:hello@ccoms.ph">hello@ccoms.ph</a>.
            </p>

            <h2>7. Cookies and Tracking Technologies</h2>
            <p>
              We use cookies and similar tracking technologies to enhance your experience on our website. You can control cookie settings through your browser preferences. Note that disabling cookies may affect website functionality.
            </p>

            <h2>8. Third-Party Links</h2>
            <p>
              Our website may contain links to third-party websites. We are not responsible for the privacy practices or content of these external sites. We encourage you to review their privacy policies.
            </p>

            <h2>9. Children's Privacy</h2>
            <p>
              Our services are not directed to individuals under the age of 18. We do not knowingly collect personal information from children. If you believe we have inadvertently collected such information, please contact us immediately.
            </p>

            <h2>10. International Data Transfers</h2>
            <p>
              Your information may be transferred to and processed in countries other than your own. We ensure appropriate safeguards are in place to protect your data in accordance with this privacy policy.
            </p>

            <h2>11. Changes to This Privacy Policy</h2>
            <p>
              We may update this privacy policy from time to time. We will notify you of any material changes by posting the updated policy on our website with a revised "Last updated" date.
            </p>

            <h2>12. Contact Us</h2>
            <p>If you have any questions or concerns about this privacy policy or our data practices, please contact us:</p>
            <ul className="list-none">
              <li><strong>Email:</strong> <a href="mailto:hello@ccoms.ph">hello@ccoms.ph</a></li>
              <li><strong>Phone:</strong> <a href="tel:+639922981422">+63 992 298 1422</a></li>
              <li><strong>Address:</strong> Binan City, Laguna, Philippines 4024</li>
            </ul>

            <div className="mt-12 p-6 bg-gradient-to-br from-blue-50 to-cyan-50 rounded-2xl border border-blue-200">
              <p className="text-gray-900 font-semibold mb-2">Questions about your data?</p>
              <p className="text-gray-700 mb-4">
                We're committed to transparency and protecting your privacy. If you have any concerns, we're here to help.
              </p>
              <Link
                href="/contact"
                className="inline-block bg-gradient-to-r from-blue-600 to-cyan-600 text-white px-6 py-3 rounded-lg font-semibold hover:shadow-xl hover:scale-105 transition-all duration-300"
              >
                Get in Touch
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}

'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'

export default function TermsPage() {
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
              Terms of Service
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
            <h2>1. Agreement to Terms</h2>
            <p>
              By accessing or using the services of Core Conversion Digital Marketing Services ("CCOMS," "we," "our," or "us"), you agree to be bound by these Terms of Service. If you do not agree to these terms, please do not use our services.
            </p>

            <h2>2. Services</h2>
            <p>
              CCOMS provides digital marketing services including but not limited to:
            </p>
            <ul>
              <li>Search Engine Optimization (SEO)</li>
              <li>Answer Engine Optimization (AEO)</li>
              <li>Generative Engine Optimization (GEO)</li>
              <li>Local SEO</li>
              <li>Website Development</li>
              <li>Mobile App Development</li>
              <li>Brand Marketing & Design</li>
              <li>Video Production</li>
            </ul>
            <p>
              Specific services, deliverables, timelines, and pricing will be outlined in individual service agreements or statements of work.
            </p>

            <h2>3. Service Agreements</h2>
            <h3>3.1 Scope of Work</h3>
            <p>
              Each engagement will be governed by a separate service agreement detailing the specific scope, deliverables, timelines, and compensation. These agreements supplement and are incorporated into these Terms of Service.
            </p>

            <h3>3.2 Changes to Scope</h3>
            <p>
              Any changes to the agreed scope of work must be requested in writing and approved by both parties. Additional charges may apply for scope changes.
            </p>

            <h2>4. Client Responsibilities</h2>
            <p>To facilitate effective service delivery, clients agree to:</p>
            <ul>
              <li>Provide timely access to necessary accounts, credentials, and information</li>
              <li>Respond to requests for feedback and approvals within agreed timeframes</li>
              <li>Ensure all provided content and materials do not infringe on third-party rights</li>
              <li>Make timely payments according to agreed terms</li>
              <li>Maintain professional and respectful communication</li>
            </ul>

            <h2>5. Payment Terms</h2>
            <h3>5.1 Pricing</h3>
            <p>
              Service fees will be specified in individual service agreements. Unless otherwise stated, all prices are in Philippine Pesos (PHP) or US Dollars (USD).
            </p>

            <h3>5.2 Payment Schedule</h3>
            <p>
              Payment terms will be outlined in each service agreement. Standard terms include monthly retainers or project-based payments with deposits required upfront.
            </p>

            <h3>5.3 Late Payments</h3>
            <p>
              Late payments may result in suspension of services. We reserve the right to charge interest on overdue invoices at a rate of 1.5% per month or the maximum rate permitted by law, whichever is lower.
            </p>

            <h3>5.4 Refunds</h3>
            <p>
              Due to the nature of digital marketing services, refunds are evaluated on a case-by-case basis. Work completed prior to cancellation is non-refundable.
            </p>

            <h2>6. Intellectual Property</h2>
            <h3>6.1 Client Content</h3>
            <p>
              Clients retain all rights to content, materials, and intellectual property they provide to us. By providing such materials, clients grant us a license to use them solely for the purpose of delivering agreed services.
            </p>

            <h3>6.2 Deliverables</h3>
            <p>
              Upon full payment, clients own the final deliverables created specifically for them (e.g., website designs, custom content). However, CCOMS retains ownership of our proprietary methods, processes, tools, and pre-existing intellectual property.
            </p>

            <h3>6.3 Portfolio Rights</h3>
            <p>
              We reserve the right to showcase completed work in our portfolio and marketing materials unless otherwise agreed in writing.
            </p>

            <h2>7. Confidentiality</h2>
            <p>
              Both parties agree to keep confidential any proprietary information shared during the course of the engagement. This obligation continues after the termination of services.
            </p>

            <h2>8. Performance and Results</h2>
            <h3>8.1 No Guarantees</h3>
            <p>
              While we employ industry best practices and work diligently to achieve results, we cannot guarantee specific rankings, traffic levels, or business outcomes. Digital marketing results depend on numerous factors beyond our control, including algorithm changes, competition, and market conditions.
            </p>

            <h3>8.2 Reporting</h3>
            <p>
              We provide regular reporting on work completed and performance metrics. The frequency and format of reporting will be specified in individual service agreements.
            </p>

            <h2>9. Term and Termination</h2>
            <h3>9.1 Service Period</h3>
            <p>
              The term of services will be specified in each service agreement. Unless otherwise stated, services continue on a month-to-month basis after the initial term.
            </p>

            <h3>9.2 Termination</h3>
            <p>
              Either party may terminate services with 30 days written notice. Clients remain responsible for payment of all services rendered through the termination date.
            </p>

            <h3>9.3 Immediate Termination</h3>
            <p>
              We reserve the right to immediately terminate services if a client:
            </p>
            <ul>
              <li>Fails to make timely payments</li>
              <li>Violates these terms</li>
              <li>Engages in abusive or unprofessional conduct</li>
              <li>Requests illegal or unethical practices</li>
            </ul>

            <h2>10. Limitation of Liability</h2>
            <p>
              CCOMS shall not be liable for any indirect, incidental, special, consequential, or punitive damages resulting from the use or inability to use our services. Our total liability shall not exceed the total fees paid by the client in the 12 months preceding the claim.
            </p>

            <h2>11. Warranties and Disclaimers</h2>
            <p>
              We warrant that services will be performed with reasonable care and skill. However, services are provided "as is" without any other warranties, express or implied, including warranties of merchantability or fitness for a particular purpose.
            </p>

            <h2>12. Indemnification</h2>
            <p>
              Clients agree to indemnify and hold harmless CCOMS from any claims, damages, or expenses arising from:
            </p>
            <ul>
              <li>Content or materials provided by the client</li>
              <li>Client's use of deliverables in violation of applicable laws</li>
              <li>Breach of these terms by the client</li>
            </ul>

            <h2>13. Third-Party Services</h2>
            <p>
              We may use third-party tools and services to deliver our services (e.g., hosting providers, analytics platforms). We are not responsible for the performance or policies of these third parties.
            </p>

            <h2>14. Force Majeure</h2>
            <p>
              Neither party shall be liable for delays or failures in performance resulting from circumstances beyond their reasonable control, including but not limited to natural disasters, government actions, or internet service disruptions.
            </p>

            <h2>15. Governing Law</h2>
            <p>
              These terms shall be governed by and construed in accordance with the laws of the Philippines. Any disputes arising from these terms or our services shall be resolved in the courts of Laguna, Philippines.
            </p>

            <h2>16. Modifications</h2>
            <p>
              We reserve the right to modify these Terms of Service at any time. Material changes will be communicated to active clients. Continued use of our services after modifications constitutes acceptance of the updated terms.
            </p>

            <h2>17. Entire Agreement</h2>
            <p>
              These Terms of Service, together with any service agreements and statements of work, constitute the entire agreement between the parties and supersede all prior agreements and understandings.
            </p>

            <h2>18. Contact Information</h2>
            <p>For questions about these Terms of Service, please contact us:</p>
            <ul className="list-none">
              <li><strong>Email:</strong> <a href="mailto:hello@ccoms.ph">hello@ccoms.ph</a></li>
              <li><strong>Phone:</strong> <a href="tel:+639922981422">+63 992 298 1422</a></li>
              <li><strong>Address:</strong> Binan City, Laguna, Philippines 4024</li>
            </ul>

            <div className="mt-12 p-6 bg-gradient-to-br from-blue-50 to-cyan-50 rounded-2xl border border-blue-200">
              <p className="text-gray-900 font-semibold mb-2">Ready to get started?</p>
              <p className="text-gray-700 mb-4">
                Let's discuss how we can help drive measurable growth for your business.
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

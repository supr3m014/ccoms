'use client'

import Link from 'next/link'
import { Construction } from 'lucide-react'

export default function CaseStudiesManagement() {
  return (
    <div className="p-8">
      <div className="flex items-center justify-center min-h-[600px]">
        <div className="text-center">
          <Construction className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Case Studies Management</h2>
          <p className="text-gray-600 mb-6">This feature is coming soon</p>
          <Link
            href="/admin"
            className="inline-block bg-gradient-to-r from-blue-600 to-cyan-600 text-white px-6 py-3 rounded-lg font-semibold hover:shadow-xl hover:scale-105 transition-all duration-300"
          >
            Back to Dashboard
          </Link>
        </div>
      </div>
    </div>
  )
}

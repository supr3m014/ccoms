'use client'

import { BarChart2, ExternalLink, FileDown } from 'lucide-react'

export default function ReportsPage() {
  return (
    <div className="p-6 lg:p-8 max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Report Center</h1>
        <p className="text-sm text-gray-500 mt-1">Access your SEO analytics, campaign performance, and deliverable reports</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          <div className="w-12 h-12 bg-emerald-50 rounded-xl flex items-center justify-center mb-4">
            <BarChart2 className="w-6 h-6 text-emerald-600" />
          </div>
          <h2 className="font-bold text-gray-900 mb-2">SEO Monthly Analytics</h2>
          <p className="text-sm text-gray-500 mb-4">Keyword rankings, organic traffic, and backlink reports updated monthly.</p>
          <div className="space-y-2">
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
              <span className="text-sm text-gray-700 font-medium">April 2026 Report</span>
              <div className="flex gap-2">
                <button className="flex items-center gap-1.5 text-xs px-3 py-1.5 bg-emerald-100 text-emerald-700 rounded-lg font-semibold hover:bg-emerald-200 transition-colors">
                  <ExternalLink className="w-3.5 h-3.5" /> View
                </button>
                <button className="flex items-center gap-1.5 text-xs px-3 py-1.5 bg-gray-100 text-gray-700 rounded-lg font-semibold hover:bg-gray-200 transition-colors">
                  <FileDown className="w-3.5 h-3.5" /> PDF
                </button>
              </div>
            </div>
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
              <span className="text-sm text-gray-700 font-medium">March 2026 Report</span>
              <div className="flex gap-2">
                <button className="flex items-center gap-1.5 text-xs px-3 py-1.5 bg-emerald-100 text-emerald-700 rounded-lg font-semibold hover:bg-emerald-200 transition-colors">
                  <ExternalLink className="w-3.5 h-3.5" /> View
                </button>
                <button className="flex items-center gap-1.5 text-xs px-3 py-1.5 bg-gray-100 text-gray-700 rounded-lg font-semibold hover:bg-gray-200 transition-colors">
                  <FileDown className="w-3.5 h-3.5" /> PDF
                </button>
              </div>
            </div>
          </div>
          <p className="text-xs text-gray-400 mt-3">Reports are uploaded by the 5th of each month</p>
        </div>

        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          <div className="w-12 h-12 bg-purple-50 rounded-xl flex items-center justify-center mb-4">
            <BarChart2 className="w-6 h-6 text-purple-600" />
          </div>
          <h2 className="font-bold text-gray-900 mb-2">AI Video Performance</h2>
          <p className="text-sm text-gray-500 mb-4">Views, engagement rate, and conversion tracking for your video campaigns.</p>
          <div className="flex items-center justify-center h-24 bg-gray-50 rounded-xl">
            <p className="text-sm text-gray-400">No video campaigns active</p>
          </div>
        </div>
      </div>

      <div className="bg-blue-50 border border-blue-100 rounded-2xl p-4 text-sm text-blue-700">
        New reports are shared here each month. You'll receive an email notification when a new report is available.
      </div>
    </div>
  )
}

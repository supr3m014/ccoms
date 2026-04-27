'use client'

import { useState } from 'react'
import { Download, RefreshCw } from 'lucide-react'
import { useToast } from '@/contexts/ToastContext'

export default function SitemapsPage() {
  const { showToast } = useToast()
  const [generating, setGenerating] = useState(false)

  const generateSitemap = () => {
    setGenerating(true)
    setTimeout(() => {
      setGenerating(false)
      showToast('Sitemap generated successfully!', 'success')
    }, 2000)
  }

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">XML Sitemaps</h1>
        <p className="text-gray-600">Manage your XML sitemaps for search engines</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="font-semibold text-gray-900 mb-2">Main Sitemap</h3>
          <p className="text-sm text-gray-600 mb-4">sitemap.xml</p>
          <div className="flex gap-2">
            <button
              onClick={generateSitemap}
              disabled={generating}
              className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white px-4 py-2 rounded-lg font-semibold transition-colors flex items-center gap-2"
            >
              <RefreshCw className={`w-4 h-4 ${generating ? 'animate-spin' : ''}`} />
              {generating ? 'Generating...' : 'Regenerate'}
            </button>
            <a
              href="/sitemap.xml"
              target="_blank"
              className="border border-gray-300 hover:bg-gray-50 text-gray-700 px-4 py-2 rounded-lg font-semibold transition-colors flex items-center gap-2"
            >
              <Download className="w-4 h-4" />
              Download
            </a>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="font-semibold text-gray-900 mb-2">Blog Sitemap</h3>
          <p className="text-sm text-gray-600 mb-4">sitemap-blog.xml</p>
          <div className="flex gap-2">
            <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-semibold transition-colors flex items-center gap-2">
              <RefreshCw className="w-4 h-4" />
              Regenerate
            </button>
            <a
              href="/sitemap-blog.xml"
              target="_blank"
              className="border border-gray-300 hover:bg-gray-50 text-gray-700 px-4 py-2 rounded-lg font-semibold transition-colors flex items-center gap-2"
            >
              <Download className="w-4 h-4" />
              Download
            </a>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="font-semibold text-gray-900 mb-4">Sitemap Settings</h3>
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <input type="checkbox" id="auto-generate" defaultChecked className="rounded" />
            <label htmlFor="auto-generate" className="text-sm text-gray-700">
              Auto-generate sitemap when content is published
            </label>
          </div>
          <div className="flex items-center gap-3">
            <input type="checkbox" id="include-images" defaultChecked className="rounded" />
            <label htmlFor="include-images" className="text-sm text-gray-700">
              Include images in sitemap
            </label>
          </div>
          <div className="flex items-center gap-3">
            <input type="checkbox" id="ping-search-engines" defaultChecked className="rounded" />
            <label htmlFor="ping-search-engines" className="text-sm text-gray-700">
              Ping search engines on sitemap update
            </label>
          </div>
        </div>
      </div>

      <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h3 className="font-semibold text-blue-900 mb-2">Submit to Search Engines:</h3>
        <ul className="text-sm text-blue-800 space-y-2">
          <li>• Google: <a href="https://search.google.com/search-console" target="_blank" className="underline">Google Search Console</a></li>
          <li>• Bing: <a href="https://www.bing.com/webmasters" target="_blank" className="underline">Bing Webmaster Tools</a></li>
        </ul>
      </div>
    </div>
  )
}

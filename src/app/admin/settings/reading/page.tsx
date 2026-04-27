'use client'

import { useState } from 'react'
import { Save } from 'lucide-react'
import { useToast } from '@/contexts/ToastContext'

export default function ReadingSettingsPage() {
  const { showToast } = useToast()
  const [postsPerPage, setPostsPerPage] = useState('10')
  const [feedItems, setFeedItems] = useState('10')
  const [feedContent, setFeedContent] = useState('summary')
  const [searchVisibility, setSearchVisibility] = useState(true)

  const handleSave = () => {
    showToast('Reading settings saved successfully!', 'success')
  }

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Reading Settings</h1>
        <p className="text-gray-600">Configure how your content is displayed</p>
      </div>

      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="space-y-8">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Blog Pages Display</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Blog pages show at most
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    value={postsPerPage}
                    onChange={(e) => setPostsPerPage(e.target.value)}
                    min="1"
                    max="100"
                    className="w-24 px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <span className="text-sm text-gray-600">posts</span>
                </div>
              </div>
            </div>
          </div>

          <div className="pt-6 border-t border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Syndication Feeds</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Syndication feeds show the most recent
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    value={feedItems}
                    onChange={(e) => setFeedItems(e.target.value)}
                    min="1"
                    max="50"
                    className="w-24 px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <span className="text-sm text-gray-600">items</span>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  For each post in a feed, include
                </label>
                <div className="space-y-2">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="feed_content"
                      value="full"
                      checked={feedContent === 'full'}
                      onChange={(e) => setFeedContent(e.target.value)}
                      className="text-blue-600"
                    />
                    <span className="text-sm text-gray-700">Full text</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="feed_content"
                      value="summary"
                      checked={feedContent === 'summary'}
                      onChange={(e) => setFeedContent(e.target.value)}
                      className="text-blue-600"
                    />
                    <span className="text-sm text-gray-700">Summary</span>
                  </label>
                </div>
              </div>
            </div>
          </div>

          <div className="pt-6 border-t border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Search Engine Visibility</h3>
            <label className="flex items-start gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={searchVisibility}
                onChange={(e) => setSearchVisibility(e.target.checked)}
                className="mt-1 rounded"
              />
              <div>
                <span className="text-sm font-medium text-gray-700">
                  Discourage search engines from indexing this site
                </span>
                <p className="text-xs text-gray-500 mt-1">
                  It is up to search engines to honor this request.
                </p>
              </div>
            </label>
          </div>

          <div className="pt-6 border-t border-gray-200 flex gap-2">
            <button
              onClick={handleSave}
              className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-semibold transition-colors"
            >
              <Save className="w-4 h-4" />
              Save Changes
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

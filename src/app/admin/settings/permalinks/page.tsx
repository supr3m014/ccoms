'use client'

import { useState } from 'react'
import { Save } from 'lucide-react'
import { useToast } from '@/contexts/ToastContext'

export default function PermalinksSettingsPage() {
  const { showToast } = useToast()
  const [structure, setStructure] = useState('post-name')
  const [customStructure, setCustomStructure] = useState('')
  const [categoryBase, setCategoryBase] = useState('category')
  const [tagBase, setTagBase] = useState('tag')

  const handleSave = () => {
    showToast('Permalink settings saved successfully!', 'success')
  }

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Permalink Settings</h1>
        <p className="text-gray-600">Configure your site URL structure</p>
      </div>

      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="space-y-8">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Permalink Structure</h3>
            <p className="text-sm text-gray-600 mb-6">
              Choose how your post URLs are formatted. Readable, SEO-friendly URLs are recommended.
            </p>

            <div className="space-y-3">
              <label className="flex items-start gap-3 cursor-pointer">
                <input
                  type="radio"
                  name="structure"
                  value="plain"
                  checked={structure === 'plain'}
                  onChange={(e) => setStructure(e.target.value)}
                  className="mt-1"
                />
                <div>
                  <span className="text-sm font-medium text-gray-700">Plain</span>
                  <p className="text-xs text-gray-500 mt-1">https://coreconversion.com/?p=123</p>
                </div>
              </label>

              <label className="flex items-start gap-3 cursor-pointer">
                <input
                  type="radio"
                  name="structure"
                  value="day-name"
                  checked={structure === 'day-name'}
                  onChange={(e) => setStructure(e.target.value)}
                  className="mt-1"
                />
                <div>
                  <span className="text-sm font-medium text-gray-700">Day and name</span>
                  <p className="text-xs text-gray-500 mt-1">https://coreconversion.com/2026/01/19/sample-post/</p>
                </div>
              </label>

              <label className="flex items-start gap-3 cursor-pointer">
                <input
                  type="radio"
                  name="structure"
                  value="month-name"
                  checked={structure === 'month-name'}
                  onChange={(e) => setStructure(e.target.value)}
                  className="mt-1"
                />
                <div>
                  <span className="text-sm font-medium text-gray-700">Month and name</span>
                  <p className="text-xs text-gray-500 mt-1">https://coreconversion.com/2026/01/sample-post/</p>
                </div>
              </label>

              <label className="flex items-start gap-3 cursor-pointer">
                <input
                  type="radio"
                  name="structure"
                  value="numeric"
                  checked={structure === 'numeric'}
                  onChange={(e) => setStructure(e.target.value)}
                  className="mt-1"
                />
                <div>
                  <span className="text-sm font-medium text-gray-700">Numeric</span>
                  <p className="text-xs text-gray-500 mt-1">https://coreconversion.com/archives/123</p>
                </div>
              </label>

              <label className="flex items-start gap-3 cursor-pointer">
                <input
                  type="radio"
                  name="structure"
                  value="post-name"
                  checked={structure === 'post-name'}
                  onChange={(e) => setStructure(e.target.value)}
                  className="mt-1"
                />
                <div>
                  <span className="text-sm font-medium text-gray-700">Post name (Recommended)</span>
                  <p className="text-xs text-gray-500 mt-1">https://coreconversion.com/sample-post/</p>
                </div>
              </label>

              <div className="flex items-start gap-3">
                <input
                  type="radio"
                  name="structure"
                  value="custom"
                  checked={structure === 'custom'}
                  onChange={(e) => setStructure(e.target.value)}
                  className="mt-3"
                />
                <div className="flex-1">
                  <span className="text-sm font-medium text-gray-700">Custom Structure</span>
                  <input
                    type="text"
                    value={customStructure}
                    onChange={(e) => setCustomStructure(e.target.value)}
                    placeholder="/%postname%/"
                    className="w-full mt-2 px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Available tags: %year%, %monthnum%, %day%, %hour%, %minute%, %second%, %post_id%, %postname%, %category%
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="pt-6 border-t border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Optional</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Category base
                </label>
                <input
                  type="text"
                  value={categoryBase}
                  onChange={(e) => setCategoryBase(e.target.value)}
                  className="w-full max-w-md px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="category"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Leave blank to use default (category)
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tag base
                </label>
                <input
                  type="text"
                  value={tagBase}
                  onChange={(e) => setTagBase(e.target.value)}
                  className="w-full max-w-md px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="tag"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Leave blank to use default (tag)
                </p>
              </div>
            </div>
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

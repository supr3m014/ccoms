'use client'

import { useState } from 'react'
import { Save } from 'lucide-react'
import { useToast } from '@/contexts/ToastContext'

export default function MediaSettingsPage() {
  const { showToast } = useToast()
  const [thumbnailWidth, setThumbnailWidth] = useState('150')
  const [thumbnailHeight, setThumbnailHeight] = useState('150')
  const [mediumWidth, setMediumWidth] = useState('300')
  const [mediumHeight, setMediumHeight] = useState('300')
  const [largeWidth, setLargeWidth] = useState('1024')
  const [largeHeight, setLargeHeight] = useState('1024')
  const [organizeByDate, setOrganizeByDate] = useState(true)

  const handleSave = () => {
    showToast('Media settings saved successfully!', 'success')
  }

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Media Settings</h1>
        <p className="text-gray-600">Configure image sizes and upload organization</p>
      </div>

      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="space-y-8">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Image Sizes</h3>
            <p className="text-sm text-gray-600 mb-6">
              The sizes listed below determine the maximum dimensions in pixels to use when adding an image to the Media Library.
            </p>

            <div className="space-y-6">
              <div>
                <h4 className="font-medium text-gray-900 mb-3">Thumbnail size</h4>
                <div className="flex items-center gap-4">
                  <div>
                    <label className="block text-xs text-gray-600 mb-1">Width</label>
                    <input
                      type="number"
                      value={thumbnailWidth}
                      onChange={(e) => setThumbnailWidth(e.target.value)}
                      className="w-24 px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-600 mb-1">Height</label>
                    <input
                      type="number"
                      value={thumbnailHeight}
                      onChange={(e) => setThumbnailHeight(e.target.value)}
                      className="w-24 px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
              </div>

              <div>
                <h4 className="font-medium text-gray-900 mb-3">Medium size</h4>
                <div className="flex items-center gap-4">
                  <div>
                    <label className="block text-xs text-gray-600 mb-1">Max Width</label>
                    <input
                      type="number"
                      value={mediumWidth}
                      onChange={(e) => setMediumWidth(e.target.value)}
                      className="w-24 px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-600 mb-1">Max Height</label>
                    <input
                      type="number"
                      value={mediumHeight}
                      onChange={(e) => setMediumHeight(e.target.value)}
                      className="w-24 px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
              </div>

              <div>
                <h4 className="font-medium text-gray-900 mb-3">Large size</h4>
                <div className="flex items-center gap-4">
                  <div>
                    <label className="block text-xs text-gray-600 mb-1">Max Width</label>
                    <input
                      type="number"
                      value={largeWidth}
                      onChange={(e) => setLargeWidth(e.target.value)}
                      className="w-24 px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-600 mb-1">Max Height</label>
                    <input
                      type="number"
                      value={largeHeight}
                      onChange={(e) => setLargeHeight(e.target.value)}
                      className="w-24 px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="pt-6 border-t border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Uploading Files</h3>
            <label className="flex items-start gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={organizeByDate}
                onChange={(e) => setOrganizeByDate(e.target.checked)}
                className="mt-1 rounded"
              />
              <div>
                <span className="text-sm font-medium text-gray-700">
                  Organize my uploads into month- and year-based folders
                </span>
                <p className="text-xs text-gray-500 mt-1">
                  Files will be organized into folders like /2026/01/
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

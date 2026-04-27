'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { Grid3x3, List, Upload, Search, Image as ImageIcon, FileText, X, Copy, ExternalLink } from 'lucide-react'
import { useToast } from '@/contexts/ToastContext'
import { useConfirm } from '@/contexts/ConfirmContext'

interface Media {
  id: string
  filename: string
  file_url: string
  file_type: string
  file_size: number
  created_at: string
}

export default function MediaLibraryPage() {
  const { showToast } = useToast()
  const { showConfirm } = useConfirm()
  const [media, setMedia] = useState<Media[]>([])
  const [loading, setLoading] = useState(true)
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [filter, setFilter] = useState('all')
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedMedia, setSelectedMedia] = useState<string[]>([])
  const [previewItem, setPreviewItem] = useState<Media | null>(null)

  useEffect(() => {
    fetchMedia()
  }, [filter])

  const fetchMedia = async () => {
    try {
      let query = supabase
        .from('media')
        .select('*')
        .order('created_at', { ascending: false })

      if (filter !== 'all') {
        query = query.eq('file_type', filter)
      }

      const { data, error } = await query
      if (error) throw error
      setMedia(data || [])
    } catch (error) {
      console.error('Error fetching media:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleBulkDelete = async () => {
    if (selectedMedia.length === 0) {
      showToast('Please select media to delete', 'warning')
      return
    }

    const ok = await showConfirm(`Delete ${selectedMedia.length} item(s)?`, { destructive: true })
    if (!ok) return

    try {
      const { error } = await supabase
        .from('media')
        .delete()
        .in('id', selectedMedia)

      if (error) throw error
      setSelectedMedia([])
      fetchMedia()
    } catch (error) {
      console.error('Error deleting media:', error)
    }
  }

  const filteredMedia = media.filter(m =>
    m.filename.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const formatFileSize = (bytes: number) => {
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i]
  }

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files || files.length === 0) return

    for (const file of Array.from(files)) {
      try {
        const formData = new FormData()
        formData.append('file', file)
        const uploadRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL}?action=upload`, {
          method: 'POST',
          body: formData,
        })
        const uploadData = await uploadRes.json()
        if (uploadData.error) throw new Error(uploadData.error)

        const fileType = file.type.startsWith('image/') ? 'image' :
          file.type.startsWith('video/') ? 'video' :
          file.type.startsWith('audio/') ? 'audio' : 'document'

        const { error } = await supabase.from('media').insert([{
          filename: file.name,
          file_url: uploadData.url,
          file_type: fileType,
          file_size: file.size,
        }])
        if (error) throw error
      } catch (error) {
        console.error('Error uploading file:', error)
        showToast(`Failed to upload ${file.name}`, 'error')
      }
    }

    fetchMedia()
    e.target.value = ''
  }

  return (
    <div className="p-8">

      {/* Image Preview Modal */}
      {previewItem && (
        <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={() => setPreviewItem(null)} />
          <div className="relative bg-white rounded-2xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-hidden animate-fadeIn">
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-200">
              <h3 className="font-semibold text-gray-900 truncate pr-4">{previewItem.filename}</h3>
              <button onClick={() => setPreviewItem(null)} className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors shrink-0">
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>
            <div className="bg-gray-100 flex items-center justify-center" style={{ minHeight: '300px', maxHeight: '60vh' }}>
              {previewItem.file_type === 'image' ? (
                <img src={previewItem.file_url} alt={previewItem.filename} className="max-w-full max-h-full object-contain" />
              ) : (
                <div className="text-center p-12">
                  <FileText className="w-20 h-20 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600">{previewItem.filename}</p>
                </div>
              )}
            </div>
            <div className="px-5 py-4 bg-gray-50 flex items-center justify-between text-sm text-gray-600">
              <div className="space-y-1">
                <p><span className="font-medium">Size:</span> {formatFileSize(previewItem.file_size)}</p>
                <p><span className="font-medium">Type:</span> {previewItem.file_type}</p>
                <p><span className="font-medium">Uploaded:</span> {new Date(previewItem.created_at).toLocaleString()}</p>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => { navigator.clipboard.writeText(previewItem.file_url); showToast('URL copied!', 'success') }}
                  className="flex items-center gap-1.5 px-3 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-xs font-medium"
                >
                  <Copy className="w-3.5 h-3.5" /> Copy URL
                </button>
                <a href={previewItem.file_url} target="_blank" rel="noopener noreferrer"
                  className="flex items-center gap-1.5 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-xs font-medium">
                  <ExternalLink className="w-3.5 h-3.5" /> Open
                </a>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="mb-8 flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900">Media Library</h1>
        <label className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-semibold transition-colors cursor-pointer flex items-center gap-2">
          <Upload className="w-4 h-4" />
          Add Media File
          <input
            type="file"
            multiple
            onChange={handleFileUpload}
            className="hidden"
            accept="image/*,video/*,audio/*,.pdf,.doc,.docx"
          />
        </label>
      </div>

      <div className="bg-white rounded-lg shadow-md p-4 mb-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded text-sm"
            >
              <option value="all">All Media</option>
              <option value="image">Images</option>
              <option value="video">Videos</option>
              <option value="audio">Audio</option>
              <option value="document">Documents</option>
            </select>
            <select className="px-3 py-2 border border-gray-300 rounded text-sm">
              <option value="all">All Dates</option>
            </select>
            <button
              onClick={handleBulkDelete}
              className="px-4 py-2 border border-gray-300 rounded text-sm hover:bg-gray-50"
            >
              Bulk Delete
            </button>
          </div>

          <div className="flex items-center gap-2">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search media..."
              className="px-3 py-2 border border-gray-300 rounded text-sm w-64"
            />
            <button className="p-2 border border-gray-300 rounded hover:bg-gray-50">
              <Search className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2 border rounded ${viewMode === 'grid' ? 'bg-blue-50 border-blue-500' : 'border-gray-300'}`}
            >
              <Grid3x3 className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-2 border rounded ${viewMode === 'list' ? 'bg-blue-50 border-blue-500' : 'border-gray-300'}`}
            >
              <List className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="bg-white rounded-lg shadow-md p-12 text-center text-gray-500">
          Loading media...
        </div>
      ) : filteredMedia.length === 0 ? (
        <div className="bg-white rounded-lg shadow-md p-12 text-center">
          <ImageIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No media files</h3>
          <p className="text-gray-600">Upload media through the page/post editor</p>
        </div>
      ) : viewMode === 'grid' ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          {filteredMedia.map((item) => (
            <div
              key={item.id}
              className={`bg-white rounded-lg shadow-md overflow-hidden cursor-pointer transition-all hover:shadow-lg group relative ${
                selectedMedia.includes(item.id) ? 'ring-2 ring-blue-500' : ''
              }`}
              onClick={() => setPreviewItem(item)}
            >
              {/* Selection checkbox */}
              <div className="absolute top-2 left-2 z-10">
                <input
                  type="checkbox"
                  checked={selectedMedia.includes(item.id)}
                  onChange={(e) => {
                    e.stopPropagation()
                    if (e.target.checked) {
                      setSelectedMedia([...selectedMedia, item.id])
                    } else {
                      setSelectedMedia(selectedMedia.filter(id => id !== item.id))
                    }
                  }}
                  onClick={(e) => e.stopPropagation()}
                  className="w-4 h-4 rounded opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                />
              </div>
              <div className="aspect-square bg-gray-100 flex items-center justify-center overflow-hidden">
                {item.file_type === 'image' ? (
                  <img src={item.file_url} alt={item.filename} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200" />
                ) : (
                  <FileText className="w-12 h-12 text-gray-400" />
                )}
              </div>
              <div className="p-3">
                <p className="text-sm font-medium text-gray-900 truncate">{item.filename}</p>
                <p className="text-xs text-gray-500">{formatFileSize(item.file_size)}</p>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left">
                  <input type="checkbox" className="rounded" />
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">File</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Size</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredMedia.map((item) => (
                <tr key={item.id} className="hover:bg-gray-50 cursor-pointer" onClick={() => setPreviewItem(item)}>
                  <td className="px-6 py-4" onClick={(e) => e.stopPropagation()}>
                    <input
                      type="checkbox"
                      checked={selectedMedia.includes(item.id)}
                      onChange={(e) => setSelectedMedia(e.target.checked ? [...selectedMedia, item.id] : selectedMedia.filter(id => id !== item.id))}
                      className="rounded"
                    />
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-gray-100 rounded flex items-center justify-center overflow-hidden">
                        {item.file_type === 'image' ? (
                          <img src={item.file_url} alt={item.filename} className="w-full h-full object-cover rounded" />
                        ) : (
                          <FileText className="w-6 h-6 text-gray-400" />
                        )}
                      </div>
                      <span className="font-medium text-gray-900">{item.filename}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">{item.file_type}</td>
                  <td className="px-6 py-4 text-sm text-gray-600">{formatFileSize(item.file_size)}</td>
                  <td className="px-6 py-4 text-sm text-gray-600">
                    {new Date(item.created_at).toLocaleDateString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}

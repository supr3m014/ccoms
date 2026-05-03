'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { Grid3x3, List, Upload, Search, Image as ImageIcon, FileText } from 'lucide-react'

interface Media {
  id: string
  filename: string
  file_url: string
  file_type: string
  file_size: number
  created_at: string
}

export default function MediaLibraryPage() {
  const [media, setMedia] = useState<Media[]>([])
  const [loading, setLoading] = useState(true)
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [filter, setFilter] = useState('all')
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedMedia, setSelectedMedia] = useState<string[]>([])

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
      alert('Please select media to delete')
      return
    }

    if (!confirm(`Delete ${selectedMedia.length} item(s)?`)) return

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
      const fileUrl = URL.createObjectURL(file)
      const fileType = file.type.startsWith('image/') ? 'image' :
                      file.type.startsWith('video/') ? 'video' :
                      file.type.startsWith('audio/') ? 'audio' : 'document'

      try {
        const { error } = await supabase
          .from('media')
          .insert([{
            filename: file.name,
            file_url: fileUrl,
            file_type: fileType,
            file_size: file.size
          }])

        if (error) throw error
      } catch (error) {
        console.error('Error uploading file:', error)
      }
    }

    fetchMedia()
    e.target.value = ''
  }

  return (
    <div className="p-8">
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
              className={`bg-white rounded-lg shadow-md overflow-hidden cursor-pointer transition-all ${
                selectedMedia.includes(item.id) ? 'ring-2 ring-blue-500' : ''
              }`}
              onClick={() => {
                if (selectedMedia.includes(item.id)) {
                  setSelectedMedia(selectedMedia.filter(id => id !== item.id))
                } else {
                  setSelectedMedia([...selectedMedia, item.id])
                }
              }}
            >
              <div className="aspect-square bg-gray-100 flex items-center justify-center">
                {item.file_type === 'image' ? (
                  <img src={item.file_url} alt={item.filename} className="w-full h-full object-cover" />
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
                <tr key={item.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <input type="checkbox" className="rounded" />
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-gray-100 rounded flex items-center justify-center">
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

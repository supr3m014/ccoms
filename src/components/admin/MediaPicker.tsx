'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { X, Upload, Image as ImageIcon, FileText, Check, Loader2 } from 'lucide-react'

interface MediaItem {
  id: string
  filename: string
  file_url: string
  file_type: string
  file_size: number
}

interface MediaPickerProps {
  onSelect: (url: string) => void
  onClose: () => void
}

function formatFileSize(bytes: number) {
  const k = 1024
  const sizes = ['B', 'KB', 'MB']
  const i = Math.min(Math.floor(Math.log(bytes || 1) / Math.log(k)), 2)
  return (bytes / Math.pow(k, i)).toFixed(1) + ' ' + sizes[i]
}

export default function MediaPicker({ onSelect, onClose }: MediaPickerProps) {
  const [tab, setTab] = useState<'library' | 'upload'>('library')
  const [media, setMedia] = useState<MediaItem[]>([])
  const [loading, setLoading] = useState(true)
  const [selected, setSelected] = useState<string | null>(null)
  const [uploading, setUploading] = useState(false)
  const [dragActive, setDragActive] = useState(false)

  useEffect(() => {
    supabase.from('media').select('*').order('created_at', { ascending: false }).then(({ data }) => {
      setMedia(data || [])
      setLoading(false)
    })
  }, [])

  const handleFileUpload = async (files: FileList | null) => {
    if (!files || files.length === 0) return
    setUploading(true)

    for (const file of Array.from(files)) {
      const formData = new FormData()
      formData.append('file', file)

      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}?action=upload`, {
          method: 'POST',
          body: formData,
        })
        const data = await res.json()
        if (data.error) throw new Error(data.error)

        const fileType = file.type.startsWith('image/') ? 'image' :
          file.type.startsWith('video/') ? 'video' :
          file.type.startsWith('audio/') ? 'audio' : 'document'

        await supabase.from('media').insert([{
          filename: file.name,
          file_url: data.url,
          file_type: fileType,
          file_size: file.size,
        }])
      } catch (err) {
        console.error('Upload failed:', err)
      }
    }

    // Reload library
    const { data } = await supabase.from('media').select('*').order('created_at', { ascending: false })
    setMedia(data || [])
    setUploading(false)
    setTab('library')
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setDragActive(false)
    handleFileUpload(e.dataTransfer.files)
  }

  const confirmSelection = () => {
    if (!selected) return
    const item = media.find(m => m.file_url === selected)
    if (item) onSelect(item.file_url)
  }

  return (
    <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[85vh] flex flex-col animate-fadeIn overflow-hidden">

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 shrink-0">
          <div className="flex gap-2">
            <button onClick={() => setTab('library')}
              className={`px-4 py-2 rounded-lg text-sm font-semibold transition-colors ${tab === 'library' ? 'bg-blue-600 text-white' : 'text-gray-600 hover:bg-gray-100'}`}>
              Media Library
            </button>
            <button onClick={() => setTab('upload')}
              className={`px-4 py-2 rounded-lg text-sm font-semibold transition-colors ${tab === 'upload' ? 'bg-blue-600 text-white' : 'text-gray-600 hover:bg-gray-100'}`}>
              Upload New
            </button>
          </div>
          <button onClick={onClose} className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors">
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-6">
          {tab === 'library' ? (
            loading ? (
              <div className="flex items-center justify-center h-48 text-gray-400">
                <Loader2 className="w-8 h-8 animate-spin mr-2" /> Loading media...
              </div>
            ) : media.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-48 text-gray-400">
                <ImageIcon className="w-12 h-12 mb-3" />
                <p>No media yet. Upload some files first.</p>
              </div>
            ) : (
              <div className="grid grid-cols-4 gap-3">
                {media.filter(m => m.file_type === 'image').map(item => (
                  <button key={item.id} onClick={() => setSelected(item.file_url)}
                    className={`relative rounded-xl overflow-hidden border-2 transition-all ${selected === item.file_url ? 'border-blue-500 shadow-lg' : 'border-transparent hover:border-gray-300'}`}>
                    <div className="aspect-square bg-gray-100">
                      <img src={item.file_url} alt={item.filename}
                        className="w-full h-full object-cover"
                        onError={e => { (e.target as HTMLImageElement).style.display = 'none' }} />
                    </div>
                    <div className="absolute bottom-0 left-0 right-0 bg-black/60 px-2 py-1">
                      <p className="text-white text-xs truncate">{item.filename}</p>
                    </div>
                    {selected === item.file_url && (
                      <div className="absolute top-2 right-2 w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
                        <Check className="w-4 h-4 text-white" />
                      </div>
                    )}
                  </button>
                ))}
              </div>
            )
          ) : (
            <div
              onDragEnter={e => { e.preventDefault(); setDragActive(true) }}
              onDragLeave={e => { e.preventDefault(); setDragActive(false) }}
              onDragOver={e => { e.preventDefault() }}
              onDrop={handleDrop}
              className={`border-2 border-dashed rounded-2xl p-16 text-center transition-colors ${dragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-300 bg-gray-50 hover:border-gray-400'}`}>
              {uploading ? (
                <div className="flex flex-col items-center gap-3 text-gray-500">
                  <Loader2 className="w-10 h-10 animate-spin text-blue-500" />
                  <p>Uploading...</p>
                </div>
              ) : (
                <>
                  <Upload className="w-10 h-10 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-700 font-semibold mb-1">Drag files here or click to browse</p>
                  <p className="text-gray-400 text-sm mb-4">Supports JPG, PNG, GIF, WebP, SVG</p>
                  <label className="inline-block cursor-pointer bg-blue-600 hover:bg-blue-700 text-white px-6 py-2.5 rounded-xl font-semibold text-sm transition-colors">
                    Choose Files
                    <input type="file" multiple accept="image/*,video/*,audio/*,.pdf,.doc,.docx"
                      onChange={e => handleFileUpload(e.target.files)}
                      className="hidden" />
                  </label>
                </>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        {tab === 'library' && (
          <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex items-center justify-between shrink-0">
            <p className="text-sm text-gray-500">
              {selected ? '1 image selected' : 'Click an image to select it'}
            </p>
            <div className="flex gap-3">
              <button onClick={onClose} className="px-5 py-2.5 border border-gray-300 text-gray-700 rounded-xl font-semibold hover:bg-gray-100 transition-colors text-sm">Cancel</button>
              <button onClick={confirmSelection} disabled={!selected}
                className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white rounded-xl font-semibold transition-colors text-sm">
                Use Selected Image
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

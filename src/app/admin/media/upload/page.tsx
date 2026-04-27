'use client'

import { useState } from 'react'
import { supabase } from '@/lib/supabase'
import { Upload, Loader2, CheckCircle, XCircle, ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import { useToast } from '@/contexts/ToastContext'

interface UploadProgress {
  filename: string
  progress: number
  status: 'uploading' | 'success' | 'error'
  error?: string
}

export default function UploadMediaPage() {
  const { showToast } = useToast()
  const [files, setFiles] = useState<File[]>([])
  const [uploading, setUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState<Map<string, UploadProgress>>(new Map())
  const [dragActive, setDragActive] = useState(false)

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i]
  }

  const getFileType = (filename: string) => {
    const ext = filename.split('.').pop()?.toLowerCase()
    if (!ext) return 'file'
    if (['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(ext)) return 'image'
    if (['pdf'].includes(ext)) return 'pdf'
    if (['doc', 'docx', 'txt'].includes(ext)) return 'document'
    return 'file'
  }

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true)
    } else if (e.type === 'dragleave') {
      setDragActive(false)
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)
    const droppedFiles = Array.from(e.dataTransfer.files)
    addFiles(droppedFiles)
  }

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      addFiles(Array.from(e.target.files))
    }
  }

  const addFiles = (newFiles: File[]) => {
    // Filter by max 100MB per file
    const validFiles = newFiles.filter(f => {
      if (f.size > 100 * 1024 * 1024) {
        showToast(`${f.name} is too large (max 100MB)`, 'error')
        return false
      }
      return true
    })
    setFiles(prev => [...prev, ...validFiles])
  }

  const removeFile = (filename: string) => {
    setFiles(prev => prev.filter(f => f.name !== filename))
  }

  const uploadFiles = async () => {
    if (files.length === 0) {
      showToast('Please select files to upload', 'warning')
      return
    }

    setUploading(true)
    const newProgress = new Map()

    for (const file of files) {
      newProgress.set(file.name, {
        filename: file.name,
        progress: 0,
        status: 'uploading' as const
      })
    }
    setUploadProgress(newProgress)

    let successCount = 0
    for (const file of files) {
      try {
        // Update progress to 30%
        setUploadProgress(prev => {
          const m = new Map(prev); const it = m.get(file.name)
          if (it) { it.progress = 30; m.set(file.name, it) }; return m
        })

        // Actually upload the file to the PHP server
        const formData = new FormData()
        formData.append('file', file)
        const uploadRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL}?action=upload`, {
          method: 'POST',
          body: formData,
        })
        const uploadData = await uploadRes.json()
        if (uploadData.error) throw new Error(uploadData.error)

        setUploadProgress(prev => {
          const m = new Map(prev); const it = m.get(file.name)
          if (it) { it.progress = 70; m.set(file.name, it) }; return m
        })

        const { error } = await supabase.from('media').insert([{
          filename: file.name,
          file_url: uploadData.url,
          file_type: getFileType(file.name),
          file_size: file.size,
        }])
        if (error) throw error

        setUploadProgress(prev => {
          const newMap = new Map(prev)
          newMap.set(file.name, {
            filename: file.name,
            progress: 100,
            status: 'success'
          })
          return newMap
        })
        successCount++
      } catch (error: any) {
        setUploadProgress(prev => {
          const newMap = new Map(prev)
          newMap.set(file.name, {
            filename: file.name,
            progress: 100,
            status: 'error',
            error: error.message || 'Upload failed'
          })
          return newMap
        })
      }
    }

    setUploading(false)
    if (successCount === files.length) {
      showToast('All files uploaded successfully!', 'success')
      setFiles([])
      setUploadProgress(new Map())
    }
  }

  return (
    <div className="p-8">
      <Link
        href="/admin/media"
        className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 mb-4"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Media Library
      </Link>

      <h1 className="text-3xl font-bold text-gray-900 mb-2">Upload Media</h1>
      <p className="text-gray-600 mb-8">Add images, documents, and other files to your media library</p>

      <div className="grid grid-cols-3 gap-8">
        {/* Upload Area */}
        <div className="col-span-2">
          <div
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
            className={`border-2 border-dashed rounded-lg p-12 text-center cursor-pointer transition ${
              dragActive
                ? 'border-blue-500 bg-blue-50'
                : 'border-gray-300 bg-gray-50 hover:border-gray-400'
            }`}
          >
            <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h2 className="text-lg font-semibold text-gray-900 mb-2">Drag files here to upload</h2>
            <p className="text-sm text-gray-600 mb-4">or</p>
            <label className="inline-block">
              <input
                type="file"
                multiple
                onChange={handleFileInput}
                className="hidden"
                disabled={uploading}
              />
              <span className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium cursor-pointer inline-block transition">
                Select Files
              </span>
            </label>
            <p className="text-xs text-gray-500 mt-4">Max 100MB per file</p>
          </div>

          {/* Upload Progress */}
          {uploadProgress.size > 0 && (
            <div className="mt-8 space-y-4">
              <h3 className="font-semibold text-gray-900">Upload Status</h3>
              {Array.from(uploadProgress.values()).map((item) => (
                <div key={item.filename} className="bg-white rounded-lg p-4 border border-gray-200">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-gray-900">{item.filename}</span>
                    {item.status === 'success' && (
                      <CheckCircle className="w-5 h-5 text-green-500" />
                    )}
                    {item.status === 'error' && (
                      <XCircle className="w-5 h-5 text-red-500" />
                    )}
                    {item.status === 'uploading' && (
                      <Loader2 className="w-5 h-5 text-blue-500 animate-spin" />
                    )}
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full transition-all ${
                        item.status === 'success'
                          ? 'bg-green-500'
                          : item.status === 'error'
                          ? 'bg-red-500'
                          : 'bg-blue-500'
                      }`}
                      style={{ width: `${item.progress}%` }}
                    />
                  </div>
                  {item.error && (
                    <p className="text-xs text-red-600 mt-2">{item.error}</p>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* File List */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="font-semibold text-gray-900 mb-4">Files to Upload ({files.length})</h3>
          {files.length === 0 ? (
            <p className="text-sm text-gray-500 text-center py-8">No files selected</p>
          ) : (
            <div className="space-y-3 mb-6 max-h-96 overflow-y-auto">
              {files.map((file) => (
                <div key={file.name} className="flex items-center justify-between p-3 bg-gray-50 rounded">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">{file.name}</p>
                    <p className="text-xs text-gray-500">{formatFileSize(file.size)}</p>
                  </div>
                  <button
                    onClick={() => removeFile(file.name)}
                    className="ml-2 text-red-600 hover:text-red-800 text-sm"
                  >
                    Remove
                  </button>
                </div>
              ))}
            </div>
          )}

          <button
            onClick={uploadFiles}
            disabled={uploading || files.length === 0}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-semibold transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {uploading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Uploading...
              </>
            ) : (
              <>
                <Upload className="w-4 h-4" />
                Upload Files
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  )
}

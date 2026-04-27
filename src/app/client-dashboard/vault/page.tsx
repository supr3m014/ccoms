'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { useClientAuth } from '@/contexts/ClientAuthContext'
import { Upload, Download, FileText, Image, Film, Music, FolderOpen, Loader2, Trash2, ExternalLink } from 'lucide-react'
import { useToast } from '@/contexts/ToastContext'
import { useConfirm } from '@/contexts/ConfirmContext'

interface VaultFile {
  id: string
  file_name: string
  file_url: string
  file_size: number
  file_type: string
  upload_type: 'client_upload' | 'final_deliverable'
  uploaded_by: 'client' | 'admin'
  description: string | null
  created_at: string
}

function formatSize(bytes: number) {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

function FileIcon({ type }: { type: string }) {
  if (type === 'image') return <Image className="w-6 h-6 text-blue-500" />
  if (type === 'video') return <Film className="w-6 h-6 text-purple-500" />
  if (type === 'audio') return <Music className="w-6 h-6 text-green-500" />
  return <FileText className="w-6 h-6 text-gray-500" />
}

export default function VaultPage() {
  const { client } = useClientAuth()
  const { showToast } = useToast()
  const { showConfirm } = useConfirm()
  const [files, setFiles] = useState<VaultFile[]>([])
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState(false)
  const [activeTab, setActiveTab] = useState<'my_uploads' | 'deliverables'>('my_uploads')
  const [dragActive, setDragActive] = useState(false)

  useEffect(() => {
    if (client) fetchFiles()
  }, [client])

  const fetchFiles = async () => {
    const { data } = await supabase
      .from('vault_files')
      .select('*')
      .eq('client_id', client!.id)
      .order('created_at', { ascending: false })
    setFiles(data || [])
    setLoading(false)
  }

  const uploadFiles = async (fileList: FileList) => {
    setUploading(true)
    for (const file of Array.from(fileList)) {
      try {
        const formData = new FormData()
        formData.append('file', file)
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}?action=upload`, { method: 'POST', body: formData })
        const data = await res.json()
        if (data.error) throw new Error(data.error)

        const fileType = file.type.startsWith('image/') ? 'image' : file.type.startsWith('video/') ? 'video' : file.type.startsWith('audio/') ? 'audio' : 'document'
        await supabase.from('vault_files').insert([{
          client_id: client!.id,
          file_name: file.name,
          file_url: data.url,
          file_size: file.size,
          file_type: fileType,
          upload_type: 'client_upload',
          uploaded_by: 'client',
        }])
        showToast(`${file.name} uploaded`, 'success')
      } catch (err: any) {
        showToast(`Failed to upload ${file.name}: ${err.message}`, 'error')
      }
    }
    await fetchFiles()
    setUploading(false)
  }

  const deleteFile = async (id: string, name: string) => {
    const ok = await showConfirm(`Delete "${name}"?`, { destructive: true })
    if (!ok) return
    await supabase.from('vault_files').delete().eq('id', id)
    setFiles(prev => prev.filter(f => f.id !== id))
    showToast('File deleted', 'success')
  }

  const myUploads = files.filter(f => f.upload_type === 'client_upload')
  const deliverables = files.filter(f => f.upload_type === 'final_deliverable')
  const displayFiles = activeTab === 'my_uploads' ? myUploads : deliverables

  return (
    <div className="p-6 lg:p-8 max-w-5xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Material Vault</h1>
        <p className="text-sm text-gray-500 mt-1">Share your brand assets with our team and download your final deliverables</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-gray-200">
        <button onClick={() => setActiveTab('my_uploads')}
          className={`flex items-center gap-2 px-5 py-3 font-semibold text-sm border-b-2 transition-colors -mb-px ${activeTab === 'my_uploads' ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}>
          <Upload className="w-4 h-4" /> My Uploads
          <span className="px-2 py-0.5 bg-gray-100 text-gray-600 rounded-full text-xs font-medium">{myUploads.length}</span>
        </button>
        <button onClick={() => setActiveTab('deliverables')}
          className={`flex items-center gap-2 px-5 py-3 font-semibold text-sm border-b-2 transition-colors -mb-px ${activeTab === 'deliverables' ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}>
          <Download className="w-4 h-4" /> Final Deliverables
          <span className="px-2 py-0.5 bg-gray-100 text-gray-600 rounded-full text-xs font-medium">{deliverables.length}</span>
        </button>
      </div>

      {/* Upload zone (only for my_uploads tab) */}
      {activeTab === 'my_uploads' && (
        <div
          onDragEnter={e => { e.preventDefault(); setDragActive(true) }}
          onDragLeave={e => { e.preventDefault(); setDragActive(false) }}
          onDragOver={e => e.preventDefault()}
          onDrop={e => { e.preventDefault(); setDragActive(false); uploadFiles(e.dataTransfer.files) }}
          className={`border-2 border-dashed rounded-2xl p-10 text-center transition-colors ${dragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-200 bg-gray-50 hover:border-blue-300 hover:bg-blue-50/50'}`}>
          {uploading ? (
            <div className="flex flex-col items-center gap-3">
              <Loader2 className="w-10 h-10 animate-spin text-blue-600" />
              <p className="text-gray-600 font-medium">Uploading files...</p>
            </div>
          ) : (
            <>
              <FolderOpen className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-700 font-semibold mb-1">Drag files here to upload</p>
              <p className="text-sm text-gray-400 mb-4">Logos, brand docs, reference images — anything our team needs</p>
              <label className="inline-block cursor-pointer">
                <span className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-semibold text-sm transition-colors">
                  Choose Files
                </span>
                <input type="file" multiple className="hidden"
                  onChange={e => { if (e.target.files) uploadFiles(e.target.files) }} />
              </label>
            </>
          )}
        </div>
      )}

      {/* Files grid */}
      {loading ? (
        <div className="flex justify-center py-12"><Loader2 className="w-8 h-8 animate-spin text-blue-600" /></div>
      ) : displayFiles.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center">
          {activeTab === 'my_uploads' ? (
            <>
              <Upload className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-600 font-medium">No files uploaded yet</p>
              <p className="text-gray-400 text-sm mt-1">Upload your logos, brand documents, and assets above</p>
            </>
          ) : (
            <>
              <Download className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-600 font-medium">No deliverables ready yet</p>
              <p className="text-gray-400 text-sm mt-1">Your final files (MP4s, PDFs, design assets) will appear here when ready</p>
            </>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {displayFiles.map(file => (
            <div key={file.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 hover:shadow-md transition-shadow">
              <div className="flex items-start gap-3">
                <div className="w-12 h-12 bg-gray-50 rounded-xl flex items-center justify-center shrink-0">
                  <FileIcon type={file.file_type} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-gray-800 text-sm truncate">{file.file_name}</p>
                  <p className="text-xs text-gray-400">{formatSize(file.file_size)} · {new Date(file.created_at).toLocaleDateString('en-PH')}</p>
                  {file.description && <p className="text-xs text-gray-500 mt-1 line-clamp-2">{file.description}</p>}
                </div>
              </div>
              <div className="flex items-center gap-2 mt-3 pt-3 border-t border-gray-50">
                <a href={file.file_url} target="_blank" rel="noopener noreferrer"
                  className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 bg-blue-50 text-blue-600 hover:bg-blue-100 rounded-xl text-xs font-semibold transition-colors">
                  <ExternalLink className="w-3.5 h-3.5" />
                  {activeTab === 'deliverables' ? 'Download' : 'View'}
                </a>
                {file.uploaded_by === 'client' && (
                  <button onClick={() => deleteFile(file.id, file.file_name)}
                    className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-colors">
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { useClientAuth } from '@/contexts/ClientAuthContext'
import { BarChart2, ExternalLink, FileDown, FileText, Loader2, Image, Film } from 'lucide-react'

interface Report {
  id: string
  file_name: string
  file_url: string
  file_size: number
  file_type: string
  description: string | null
  created_at: string
}

function formatSize(bytes: number) {
  if (!bytes) return '—'
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

function FileIcon({ type, name }: { type: string; name: string }) {
  if (type === 'image') return <Image className="w-5 h-5 text-blue-500" />
  if (type === 'video') return <Film className="w-5 h-5 text-purple-500" />
  return <FileText className="w-5 h-5 text-gray-500" />
}

export default function ReportsPage() {
  const { client } = useClientAuth()
  const [reports, setReports] = useState<Report[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!client) return
    supabase
      .from('vault_files')
      .select('*')
      .eq('client_id', client.id)
      .eq('upload_type', 'final_deliverable')
      .order('created_at', { ascending: false })
      .then(({ data }) => {
        setReports(data || [])
        setLoading(false)
      })
  }, [client])

  const grouped = reports.reduce<Record<string, Report[]>>((acc, r) => {
    const month = new Date(r.created_at).toLocaleDateString('en-PH', { month: 'long', year: 'numeric', timeZone: 'Asia/Manila' })
    if (!acc[month]) acc[month] = []
    acc[month].push(r)
    return acc
  }, {})

  return (
    <div className="p-6 lg:p-8 max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Report Center</h1>
        <p className="text-sm text-gray-500 mt-1">Your SEO analytics, campaign performance, and final deliverables from Core Conversion</p>
      </div>

      {loading ? (
        <div className="flex justify-center py-12"><Loader2 className="w-8 h-8 animate-spin text-blue-600" /></div>
      ) : reports.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center">
          <BarChart2 className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-600 font-semibold">No reports yet</p>
          <p className="text-gray-400 text-sm mt-2">Reports and deliverables will appear here as our team completes them. You'll receive a notification when new files are ready.</p>
        </div>
      ) : (
        <div className="space-y-6">
          {Object.entries(grouped).map(([month, files]) => (
            <div key={month} className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
              <div className="px-6 py-4 bg-gray-50 border-b border-gray-100">
                <h2 className="font-bold text-gray-800">{month}</h2>
                <p className="text-xs text-gray-400">{files.length} file{files.length !== 1 ? 's' : ''}</p>
              </div>
              <div className="divide-y divide-gray-50">
                {files.map(report => (
                  <div key={report.id} className="px-6 py-4 flex items-center gap-4 hover:bg-gray-50 transition-colors">
                    <div className="w-10 h-10 bg-gray-100 rounded-xl flex items-center justify-center shrink-0">
                      <FileIcon type={report.file_type} name={report.file_name} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-gray-900 text-sm truncate">
                        {report.description || report.file_name}
                      </p>
                      <p className="text-xs text-gray-400 mt-0.5">
                        {report.file_name} · {formatSize(report.file_size)} ·{' '}
                        {new Date(report.created_at).toLocaleDateString('en-PH', { timeZone: 'Asia/Manila', month: 'short', day: 'numeric' })}
                      </p>
                    </div>
                    <div className="flex gap-2 shrink-0">
                      <a href={report.file_url} target="_blank" rel="noopener noreferrer"
                        className="flex items-center gap-1.5 px-3 py-2 bg-blue-50 text-blue-600 hover:bg-blue-100 rounded-xl text-xs font-semibold transition-colors">
                        <ExternalLink className="w-3.5 h-3.5" /> View
                      </a>
                      <a href={report.file_url} download={report.file_name}
                        className="flex items-center gap-1.5 px-3 py-2 bg-gray-100 text-gray-700 hover:bg-gray-200 rounded-xl text-xs font-semibold transition-colors">
                        <FileDown className="w-3.5 h-3.5" /> Download
                      </a>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="bg-blue-50 border border-blue-100 rounded-2xl p-4 text-sm text-blue-700">
        <strong>When to expect reports:</strong> Monthly SEO reports are uploaded by the 5th of each month. Project deliverables are uploaded as they are completed. You'll receive a notification when new files are ready.
      </div>
    </div>
  )
}

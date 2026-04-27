'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { useToast } from '@/contexts/ToastContext'
import { useConfirm } from '@/contexts/ConfirmContext'
import { BarChart2, Trash2, ExternalLink, Upload, Loader2 } from 'lucide-react'

interface Client { id: string; client_id: string; name: string }
interface Report {
  id: string
  client_id: string
  file_name: string
  file_url: string
  description: string | null
  upload_type: string
  created_at: string
  client?: Client
}

export default function AdminReportsPage() {
  const { showToast } = useToast()
  const { showConfirm } = useConfirm()
  const [reports, setReports] = useState<Report[]>([])
  const [clients, setClients] = useState<Client[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [form, setForm] = useState({ client_id: '', description: '', month: '' })
  const [file, setFile] = useState<File | null>(null)

  useEffect(() => { fetchData() }, [])

  const fetchData = async () => {
    const [{ data: rData }, { data: cData }] = await Promise.all([
      supabase.from('vault_files').select('*').eq('upload_type', 'final_deliverable').order('created_at', { ascending: false }),
      supabase.from('clients').select('id, client_id, name').eq('status', 'active').order('name'),
    ])
    const clientMap = new Map((cData || []).map((c: Client) => [c.id, c]))
    setReports((rData || []).map((r: any) => ({ ...r, client: clientMap.get(r.client_id) })))
    setClients(cData || [])
    setLoading(false)
  }

  const uploadReport = async () => {
    if (!form.client_id || !file) { showToast('Select a client and file', 'warning'); return }
    setUploading(true)
    try {
      const formData = new FormData()
      formData.append('file', file)
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}?action=upload`, { method: 'POST', body: formData })
      const data = await res.json()
      if (data.error) throw new Error(data.error)

      const desc = form.description.trim() || (form.month ? `Report — ${form.month}` : file.name)
      await supabase.from('vault_files').insert([{
        client_id: form.client_id,
        file_name: file.name,
        file_url: data.url,
        file_size: file.size,
        file_type: 'document',
        upload_type: 'final_deliverable',
        uploaded_by: 'admin',
        description: desc,
      }])

      // Notify client
      await supabase.from('client_notifications').insert([{
        client_id: form.client_id,
        type: 'new_report',
        message: `A new report is available for download: "${desc}"`,
        link: '/client-dashboard/vault',
      }])

      setForm({ client_id: '', description: '', month: '' })
      setFile(null)
      setShowForm(false)
      fetchData()
      showToast('Report uploaded and client notified', 'success')
    } catch (err: any) {
      showToast(err.message || 'Upload failed', 'error')
    }
    setUploading(false)
  }

  const deleteReport = async (id: string, name: string) => {
    const ok = await showConfirm(`Delete report "${name}"?`, { destructive: true })
    if (!ok) return
    await supabase.from('vault_files').delete().eq('id', id)
    setReports(prev => prev.filter(r => r.id !== id))
    showToast('Report deleted', 'success')
  }

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-1">Client Reports</h1>
          <p className="text-gray-500">Upload and manage deliverables for clients (PDFs, reports, assets)</p>
        </div>
        <button onClick={() => setShowForm(v => !v)}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl font-semibold transition-colors">
          <Upload className="w-4 h-4" /> Upload Report
        </button>
      </div>

      {showForm && (
        <div className="bg-white rounded-2xl border border-blue-200 shadow-sm p-6 mb-6 space-y-4">
          <h2 className="font-bold text-gray-900">Upload New Report / Deliverable</h2>
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Client *</label>
              <select value={form.client_id} onChange={e => setForm(f => ({ ...f, client_id: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                <option value="">Select client...</option>
                {clients.map(c => <option key={c.id} value={c.id}>{c.name} ({c.client_id})</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Month (for reports)</label>
              <input type="month" value={form.month} onChange={e => setForm(f => ({ ...f, month: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
              <input value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                placeholder="e.g. April 2026 SEO Report" className="w-full px-3 py-2 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
          </div>
          <label className={`flex items-center gap-3 border-2 border-dashed rounded-xl p-4 cursor-pointer transition-colors ${file ? 'border-green-400 bg-green-50' : 'border-gray-300 hover:border-blue-400'}`}>
            <Upload className={`w-6 h-6 ${file ? 'text-green-500' : 'text-gray-400'}`} />
            <div>
              <p className="text-sm font-medium text-gray-700">{file ? file.name : 'Click to choose file'}</p>
              <p className="text-xs text-gray-400">PDF, ZIP, images accepted</p>
            </div>
            <input type="file" className="hidden" onChange={e => setFile(e.target.files?.[0] || null)} />
          </label>
          <div className="flex gap-3">
            <button onClick={uploadReport} disabled={!form.client_id || !file || uploading}
              className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white rounded-xl font-semibold text-sm transition-colors">
              {uploading ? <><Loader2 className="w-4 h-4 animate-spin" />Uploading...</> : 'Upload & Notify Client'}
            </button>
            <button onClick={() => setShowForm(false)} className="px-5 py-2.5 border border-gray-300 text-gray-700 rounded-xl font-semibold text-sm hover:bg-gray-50">Cancel</button>
          </div>
        </div>
      )}

      {loading ? (
        <div className="flex justify-center py-12"><Loader2 className="w-8 h-8 animate-spin text-blue-600" /></div>
      ) : reports.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center">
          <BarChart2 className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-600 font-medium">No reports uploaded yet</p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Client</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">File</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Description</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Uploaded</th>
                <th className="px-6 py-3 text-right text-xs font-semibold text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {reports.map(r => (
                <tr key={r.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4">
                    <p className="font-semibold text-gray-900 text-sm">{(r as any).client?.name || 'Unknown'}</p>
                    <p className="text-xs text-gray-400">{(r as any).client?.client_id}</p>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-700 font-mono">{r.file_name}</td>
                  <td className="px-6 py-4 text-sm text-gray-600">{r.description || '—'}</td>
                  <td className="px-6 py-4 text-sm text-gray-500">
                    {new Date(r.created_at).toLocaleDateString('en-PH', { month: 'short', day: 'numeric', year: 'numeric' })}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <a href={r.file_url} target="_blank" rel="noopener noreferrer"
                        className="flex items-center gap-1.5 text-xs text-blue-600 font-semibold hover:text-blue-700">
                        <ExternalLink className="w-3.5 h-3.5" /> View
                      </a>
                      <button onClick={() => deleteReport(r.id, r.file_name)}
                        className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
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

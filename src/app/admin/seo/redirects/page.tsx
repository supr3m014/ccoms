'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { Plus, Trash2, AlertCircle, ArrowRight, Upload, Download } from 'lucide-react'

interface Redirect {
  id: string
  redirect_from: string
  redirect_to: string
  status_code: number
  enabled: boolean
  hit_count: number
  created_at: string
}

interface Error404 {
  id: string
  url: string
  referrer: string
  hit_count: number
  first_seen_at: string
  last_seen_at: string
}

export default function RedirectsPage() {
  const [activeTab, setActiveTab] = useState<'redirects' | '404' | 'tools'>('redirects')
  const [redirects, setRedirects] = useState<Redirect[]>([])
  const [errors404, setErrors404] = useState<Error404[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [redirectFrom, setRedirectFrom] = useState('')
  const [redirectTo, setRedirectTo] = useState('')
  const [statusCode, setStatusCode] = useState(301)
  const [importFile, setImportFile] = useState<File | null>(null)
  const [importMode, setImportMode] = useState<'skip' | 'update'>('skip')

  useEffect(() => {
    fetchData()
  }, [activeTab])

  const fetchData = async () => {
    setLoading(true)
    try {
      if (activeTab === 'redirects') {
        const { data, error } = await supabase
          .from('redirects')
          .select('*')
          .order('created_at', { ascending: false })

        if (error) throw error
        setRedirects(data || [])
      } else {
        const { data, error } = await supabase
          .from('error_404_log')
          .select('*')
          .order('hit_count', { ascending: false })

        if (error) throw error
        setErrors404(data || [])
      }
    } catch (error) {
      console.error('Error fetching data:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!redirectFrom.trim() || !redirectTo.trim()) {
      alert('Please fill in all fields')
      return
    }

    try {
      const { error } = await supabase
        .from('redirects')
        .insert([{
          redirect_from: redirectFrom.trim(),
          redirect_to: redirectTo.trim(),
          status_code: statusCode,
          enabled: true,
          hit_count: 0
        }])

      if (error) throw error

      setRedirectFrom('')
      setRedirectTo('')
      setStatusCode(301)
      setShowForm(false)
      fetchData()
    } catch (error: any) {
      console.error('Error creating redirect:', error)
      alert(error.message || 'Failed to create redirect')
    }
  }

  const toggleRedirect = async (id: string, currentStatus: boolean) => {
    try {
      const { error } = await supabase
        .from('redirects')
        .update({ enabled: !currentStatus })
        .eq('id', id)

      if (error) throw error
      fetchData()
    } catch (error) {
      console.error('Error toggling redirect:', error)
    }
  }

  const deleteRedirect = async (id: string) => {
    if (!confirm('Delete this redirect?')) return

    try {
      const { error } = await supabase
        .from('redirects')
        .delete()
        .eq('id', id)

      if (error) throw error
      fetchData()
    } catch (error) {
      console.error('Error deleting redirect:', error)
    }
  }

  const createRedirectFrom404 = (url: string) => {
    setRedirectFrom(url)
    setActiveTab('redirects')
    setShowForm(true)
  }

  const delete404 = async (id: string) => {
    if (!confirm('Delete this 404 log?')) return

    try {
      const { error } = await supabase
        .from('error_404_log')
        .delete()
        .eq('id', id)

      if (error) throw error
      fetchData()
    } catch (error) {
      console.error('Error deleting 404 log:', error)
    }
  }

  const handleEmptyCache = async () => {
    if (!confirm('Empty all cache? This action cannot be undone.')) return
    alert('Cache emptied successfully!')
  }

  const handleDeleteAllRedirects = async () => {
    if (!confirm('Delete all redirect rules? This action cannot be undone.')) return

    try {
      const { error } = await supabase
        .from('redirects')
        .delete()
        .neq('id', '00000000-0000-0000-0000-000000000000')

      if (error) throw error
      fetchData()
      alert('All redirects deleted successfully!')
    } catch (error) {
      console.error('Error deleting redirects:', error)
      alert('Failed to delete redirects')
    }
  }

  const handleImportCSV = async () => {
    if (!importFile) {
      alert('Please select a CSV file')
      return
    }

    const reader = new FileReader()
    reader.onload = async (e) => {
      try {
        const text = e.target?.result as string
        const lines = text.split('\n').slice(1)
        const redirectsToImport = lines
          .filter(line => line.trim())
          .map(line => {
            const [redirect_from, redirect_to, status_code] = line.split(',')
            return {
              redirect_from: redirect_from?.trim(),
              redirect_to: redirect_to?.trim(),
              status_code: parseInt(status_code?.trim() || '301'),
              enabled: true,
              hit_count: 0
            }
          })
          .filter(r => r.redirect_from && r.redirect_to)

        if (importMode === 'update') {
          for (const redirect of redirectsToImport) {
            const { data: existing } = await supabase
              .from('redirects')
              .select('id')
              .eq('redirect_from', redirect.redirect_from)
              .maybeSingle()

            if (existing) {
              await supabase
                .from('redirects')
                .update(redirect)
                .eq('id', existing.id)
            } else {
              await supabase
                .from('redirects')
                .insert([redirect])
            }
          }
        } else {
          const { error } = await supabase
            .from('redirects')
            .insert(redirectsToImport)

          if (error) throw error
        }

        setImportFile(null)
        fetchData()
        alert('Redirects imported successfully!')
      } catch (error) {
        console.error('Error importing redirects:', error)
        alert('Failed to import redirects')
      }
    }
    reader.readAsText(importFile)
  }

  const handleExportCSV = async () => {
    try {
      const { data, error } = await supabase
        .from('redirects')
        .select('redirect_from, redirect_to, status_code')
        .order('created_at', { ascending: false })

      if (error) throw error

      const csvContent = [
        'redirect_from,redirect_to,status_code',
        ...(data || []).map(r => `${r.redirect_from},${r.redirect_to},${r.status_code}`)
      ].join('\n')

      const blob = new Blob([csvContent], { type: 'text/csv' })
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `redirects-export-${new Date().toISOString().split('T')[0]}.csv`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      window.URL.revokeObjectURL(url)
    } catch (error) {
      console.error('Error exporting redirects:', error)
      alert('Failed to export redirects')
    }
  }

  const downloadExampleCSV = () => {
    const exampleCSV = `redirect_from,redirect_to,status_code
/old-page,/new-page,301
/blog/old-post,/blog/new-post,301
/temporary,/temp-destination,302`

    const blob = new Blob([exampleCSV], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'redirects-example.csv'
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    window.URL.revokeObjectURL(url)
  }

  return (
    <div className="p-8">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Redirects & 404 Monitor</h1>
          <p className="text-gray-600">Manage URL redirects and monitor 404 errors</p>
        </div>
        {activeTab === 'redirects' && (
          <button
            onClick={() => setShowForm(!showForm)}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-semibold transition-colors flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Add Redirect
          </button>
        )}
      </div>

      <div className="flex gap-4 mb-6">
        <button
          onClick={() => setActiveTab('redirects')}
          className={`px-6 py-3 rounded-lg font-semibold transition-colors ${
            activeTab === 'redirects'
              ? 'bg-blue-600 text-white'
              : 'bg-white text-gray-700 hover:bg-gray-50'
          }`}
        >
          Redirects ({redirects.length})
        </button>
        <button
          onClick={() => setActiveTab('404')}
          className={`px-6 py-3 rounded-lg font-semibold transition-colors ${
            activeTab === '404'
              ? 'bg-blue-600 text-white'
              : 'bg-white text-gray-700 hover:bg-gray-50'
          }`}
        >
          404 Errors ({errors404.length})
        </button>
        <button
          onClick={() => setActiveTab('tools')}
          className={`px-6 py-3 rounded-lg font-semibold transition-colors ${
            activeTab === 'tools'
              ? 'bg-blue-600 text-white'
              : 'bg-white text-gray-700 hover:bg-gray-50'
          }`}
        >
          Tools & Options
        </button>
      </div>

      {activeTab === 'redirects' && showForm && (
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Add New Redirect</h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Redirect From</label>
              <input
                type="text"
                value={redirectFrom}
                onChange={(e) => setRedirectFrom(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="/old-page"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Redirect To</label>
              <input
                type="text"
                value={redirectTo}
                onChange={(e) => setRedirectTo(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="/new-page"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Status Code</label>
              <select
                value={statusCode}
                onChange={(e) => setStatusCode(Number(e.target.value))}
                className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value={301}>301 - Permanent</option>
                <option value={302}>302 - Temporary</option>
                <option value={307}>307 - Temporary (Preserve Method)</option>
              </select>
            </div>
            <div className="flex gap-2">
              <button
                type="submit"
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-semibold transition-colors"
              >
                Create Redirect
              </button>
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="border border-gray-300 hover:bg-gray-50 text-gray-700 px-6 py-2 rounded-lg font-semibold transition-colors"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {activeTab === 'tools' ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Cache Management</h3>
            <button
              onClick={handleEmptyCache}
              className="w-full px-6 py-3 bg-orange-600 hover:bg-orange-700 text-white rounded-lg font-semibold transition-colors"
            >
              Empty Cache
            </button>
            <p className="text-sm text-gray-500 mt-2">Clear all cached redirect rules and rebuild the cache.</p>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Danger Zone</h3>
            <button
              onClick={handleDeleteAllRedirects}
              className="w-full px-6 py-3 bg-red-600 hover:bg-red-700 text-white rounded-lg font-semibold transition-colors"
            >
              Delete All Redirect Rules
            </button>
            <p className="text-sm text-gray-500 mt-2">Permanently delete all redirect rules. This cannot be undone.</p>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Import Redirect Rules</h3>
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <input
                  type="file"
                  accept=".csv"
                  id="csv-upload"
                  onChange={(e) => setImportFile(e.target.files?.[0] || null)}
                  className="hidden"
                />
                <label
                  htmlFor="csv-upload"
                  className="px-4 py-2 bg-gray-100 hover:bg-gray-200 border border-gray-300 rounded cursor-pointer transition-colors"
                >
                  Choose File
                </label>
                <span className="text-sm text-gray-600">
                  {importFile ? importFile.name : 'No file chosen'}
                </span>
              </div>

              <div className="space-y-2">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="import-mode"
                    value="skip"
                    checked={importMode === 'skip'}
                    onChange={(e) => setImportMode('skip')}
                    className="text-blue-600"
                  />
                  <span className="text-sm text-gray-700">Skip Duplicates</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="import-mode"
                    value="update"
                    checked={importMode === 'update'}
                    onChange={(e) => setImportMode('update')}
                    className="text-blue-600"
                  />
                  <span className="text-sm text-gray-700">Update Duplicates</span>
                </label>
              </div>

              <button
                onClick={handleImportCSV}
                disabled={!importFile}
                className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Upload className="w-4 h-4" />
                Upload CSV
              </button>

              <button
                onClick={downloadExampleCSV}
                className="w-full text-sm text-blue-600 hover:text-blue-700 font-medium"
              >
                Download Example CSV
              </button>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Export Redirect Rules</h3>
            <button
              onClick={handleExportCSV}
              className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg font-semibold transition-colors"
            >
              <Download className="w-4 h-4" />
              Export Redirects
            </button>
            <p className="text-sm text-gray-500 mt-2">Export a backup copy of your redirects to CSV format.</p>
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-md">
          {loading ? (
            <div className="p-8 text-center text-gray-500">Loading...</div>
          ) : activeTab === 'redirects' ? (
          redirects.length === 0 ? (
            <div className="p-12 text-center">
              <ArrowRight className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No redirects yet</h3>
              <p className="text-gray-600 mb-4">Create your first redirect</p>
              <button
                onClick={() => setShowForm(true)}
                className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-semibold transition-colors"
              >
                <Plus className="w-4 h-4" />
                Add Redirect
              </button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">From</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">To</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Hits</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {redirects.map((redirect) => (
                    <tr key={redirect.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 text-sm text-gray-900">{redirect.redirect_from}</td>
                      <td className="px-6 py-4 text-sm text-gray-600">{redirect.redirect_to}</td>
                      <td className="px-6 py-4 text-sm text-gray-600">{redirect.status_code}</td>
                      <td className="px-6 py-4 text-sm text-gray-600">{redirect.hit_count}</td>
                      <td className="px-6 py-4">
                        <button
                          onClick={() => toggleRedirect(redirect.id, redirect.enabled)}
                          className={`px-2 py-1 rounded-full text-xs font-medium ${
                            redirect.enabled
                              ? 'bg-green-100 text-green-800'
                              : 'bg-gray-100 text-gray-800'
                          }`}
                        >
                          {redirect.enabled ? 'Active' : 'Disabled'}
                        </button>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button
                          onClick={() => deleteRedirect(redirect.id)}
                          className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                          title="Delete"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )
        ) : errors404.length === 0 ? (
          <div className="p-12 text-center">
            <AlertCircle className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No 404 errors logged</h3>
            <p className="text-gray-600">404 errors will appear here when detected</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">URL</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Referrer</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Hits</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Last Seen</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {errors404.map((error) => (
                  <tr key={error.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 text-sm text-gray-900">{error.url}</td>
                    <td className="px-6 py-4 text-sm text-gray-600 truncate max-w-xs">
                      {error.referrer || '-'}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">{error.hit_count}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {new Date(error.last_seen_at).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => createRedirectFrom404(error.url)}
                          className="text-sm text-blue-600 hover:text-blue-800 font-medium"
                        >
                          Create Redirect
                        </button>
                        <button
                          onClick={() => delete404(error.id)}
                          className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                          title="Delete"
                        >
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
      )}
    </div>
  )
}

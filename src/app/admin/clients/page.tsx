'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { useToast } from '@/contexts/ToastContext'
import { useConfirm } from '@/contexts/ConfirmContext'
import {
  UserCircle, Plus, CheckCircle, Search, Trash2,
  X, Loader2, Copy, Mail, ExternalLink, RefreshCw
} from 'lucide-react'
import Link from 'next/link'

interface Client {
  id: string
  client_id: string
  name: string
  email: string
  phone: string | null
  business_name: string | null
  status: 'pending_verification' | 'active' | 'suspended'
  first_login_completed: number
  created_at: string
}

const STATUS_COLORS: Record<string, string> = {
  pending_verification: 'bg-yellow-100 text-yellow-700',
  active: 'bg-green-100 text-green-700',
  suspended: 'bg-red-100 text-red-700',
}

export default function ClientsPage() {
  const { showToast } = useToast()
  const { showConfirm } = useConfirm()
  const [clients, setClients] = useState<Client[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [search, setSearch] = useState('')
  const [showNewClient, setShowNewClient] = useState(false)
  const [approvingId, setApprovingId] = useState<string | null>(null)
  const [emailingId, setEmailingId] = useState<string | null>(null)
  const [newForm, setNewForm] = useState({
    name: '', email: '', phone: '', business_name: '',
    service_type: 'seo', service_name: '', amount: '', payment_type: 'recurring'
  })
  const [creating, setCreating] = useState(false)
  const [lastCreated, setLastCreated] = useState<{ email: string; tempPass: string; clientId: string } | null>(null)

  useEffect(() => { fetchClients() }, [])

  const fetchClients = async () => {
    setError('')
    try {
      const { data, error: err } = await supabase
        .from('clients')
        .select('*')
        .order('created_at', { ascending: false })
      if (err) throw err
      setClients(data || [])
    } catch (e: any) {
      setError(e.message || 'Failed to load clients. Check that XAMPP is running.')
    } finally {
      setLoading(false)
    }
  }

  const approveClient = async (client: Client) => {
    setApprovingId(client.id)
    try {
      const tempPass = Math.random().toString(36).slice(-6).toUpperCase() +
        Math.random().toString(36).slice(-6) + '!'
      const res = await fetch('/api/clients/approve', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ client_id: client.id, temp_password: tempPass }),
      })
      const data = await res.json()
      if (data.error) throw new Error(data.error)

      await supabase.from('payments')
        .update({ status: 'verified', verified_at: new Date().toISOString().slice(0, 19).replace('T', ' ') })
        .eq('client_id', client.id).eq('status', 'pending')

      showToast(`✅ ${client.name} activated as ${data.client_id} — Welcome email sent!`, 'success')
      setLastCreated({ email: client.email, tempPass: data.temp_password, clientId: data.client_id })
      fetchClients()
    } catch (err: any) {
      showToast(err.message || 'Failed to approve', 'error')
    }
    setApprovingId(null)
  }

  const emailCredentials = async (client: Client) => {
    if (client.status !== 'active') {
      showToast('Approve the client first before emailing credentials', 'warning')
      return
    }
    setEmailingId(client.id)
    try {
      // Generate a reset/re-send email (sends current portal link + support instructions)
      const res = await fetch('/api/clients/email-credentials', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ client_id: client.id }),
      })
      const data = await res.json()
      if (data.error) throw new Error(data.error)
      showToast(`Access email sent to ${client.email}`, 'success')
    } catch (err: any) {
      showToast(err.message || 'Failed to send email', 'error')
    }
    setEmailingId(null)
  }

  const createClient = async () => {
    if (!newForm.name.trim() || !newForm.email.trim()) {
      showToast('Name and email are required', 'warning'); return
    }
    setCreating(true)
    try {
      const clientId = crypto.randomUUID()
      const { error: insertErr } = await supabase.from('clients').insert([{
        id: clientId,
        client_id: 'PENDING',
        name: newForm.name.trim(),
        email: newForm.email.toLowerCase().trim(),
        phone: newForm.phone.trim() || null,
        business_name: newForm.business_name.trim() || null,
        password: '$2y$10$pending_hash_placeholder_value00',
        status: 'pending_verification',
      }])
      if (insertErr) throw insertErr

      if (newForm.service_name.trim()) {
        await supabase.from('orders').insert([{
          client_id: clientId,
          service_type: newForm.service_type,
          service_name: newForm.service_name.trim(),
          status: 'pending_verification',
          payment_type: newForm.payment_type,
          amount: newForm.amount ? parseFloat(newForm.amount) : null,
        }])
      }

      setNewForm({ name: '', email: '', phone: '', business_name: '', service_type: 'seo', service_name: '', amount: '', payment_type: 'recurring' })
      setShowNewClient(false)
      await fetchClients()
      showToast('Client created — click "Approve & Activate" once payment is received', 'success')
    } catch (err: any) {
      showToast(err.message || 'Failed to create client', 'error')
    }
    setCreating(false)
  }

  const deleteClient = async (id: string, name: string) => {
    const ok = await showConfirm(`Delete client "${name}"? All their data will be permanently deleted.`, { destructive: true, title: 'Delete Client' })
    if (!ok) return
    const { error: delErr } = await supabase.from('clients').delete().eq('id', id)
    if (delErr) { showToast('Failed to delete', 'error'); return }
    setClients(prev => prev.filter(c => c.id !== id))
    showToast('Client deleted', 'success')
  }

  const copyCredentials = (email: string, tempPass: string, clientId: string) => {
    navigator.clipboard.writeText(
      `Portal: ${window.location.origin}/client-dashboard/login\nClient ID: ${clientId}\nEmail: ${email}\nPassword: ${tempPass}`
    )
    showToast('Login details copied to clipboard', 'success')
  }

  const filtered = clients.filter(c =>
    !search ||
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    c.email.toLowerCase().includes(search.toLowerCase()) ||
    c.client_id.toLowerCase().includes(search.toLowerCase()) ||
    (c.business_name || '').toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="p-8">
      {/* Success banner */}
      {lastCreated && (
        <div className="mb-6 bg-green-50 border border-green-200 rounded-2xl p-5">
          <div className="flex items-start justify-between">
            <div>
              <p className="font-bold text-green-800 mb-1">✅ Client Activated — {lastCreated.clientId}</p>
              <p className="text-sm text-green-700">
                Email: <strong>{lastCreated.email}</strong> · Temp Password: <strong className="font-mono">{lastCreated.tempPass}</strong>
              </p>
              <p className="text-xs text-green-600 mt-1">A welcome email has been sent. Share these credentials via WhatsApp/Viber as backup.</p>
            </div>
            <button onClick={() => setLastCreated(null)} className="p-1 text-green-600 hover:text-green-800"><X className="w-4 h-4" /></button>
          </div>
          <button onClick={() => copyCredentials(lastCreated.email, lastCreated.tempPass, lastCreated.clientId)}
            className="mt-3 flex items-center gap-1.5 text-sm text-green-700 font-semibold hover:text-green-900">
            <Copy className="w-4 h-4" /> Copy login details
          </button>
        </div>
      )}

      {/* New Client Modal */}
      {showNewClient && (
        <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setShowNewClient(false)} />
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg animate-fadeIn overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
              <h3 className="font-bold text-gray-900 text-lg">Add New Client</h3>
              <button onClick={() => setShowNewClient(false)} className="p-1.5 hover:bg-gray-100 rounded-lg">
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>
            <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Full Name *</label>
                  <input value={newForm.name} onChange={e => setNewForm(f => ({ ...f, name: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="Juan dela Cruz" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email *</label>
                  <input type="email" value={newForm.email} onChange={e => setNewForm(f => ({ ...f, email: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="juan@business.ph" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                  <input value={newForm.phone} onChange={e => setNewForm(f => ({ ...f, phone: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="+63 917 000 0000" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Business Name</label>
                  <input value={newForm.business_name} onChange={e => setNewForm(f => ({ ...f, business_name: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="ABC Corp" />
                </div>
              </div>
              <hr className="border-gray-200" />
              <p className="text-xs text-gray-400 font-semibold uppercase tracking-wider">Service (optional)</p>
              <div className="grid grid-cols-2 gap-4">
                <select value={newForm.service_type} onChange={e => setNewForm(f => ({ ...f, service_type: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                  <option value="seo">SEO</option>
                  <option value="web_dev">Web Development</option>
                  <option value="brand_design">Brand Design</option>
                  <option value="ai_video">AI Video</option>
                  <option value="other">Other</option>
                </select>
                <select value={newForm.payment_type} onChange={e => setNewForm(f => ({ ...f, payment_type: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                  <option value="recurring">Monthly Recurring</option>
                  <option value="one_off">One-off</option>
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <input value={newForm.service_name} onChange={e => setNewForm(f => ({ ...f, service_name: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="Package name" />
                <input type="number" value={newForm.amount} onChange={e => setNewForm(f => ({ ...f, amount: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="Amount ₱" />
              </div>
            </div>
            <div className="px-6 py-4 bg-gray-50 flex gap-3 justify-end">
              <button onClick={() => setShowNewClient(false)} className="px-5 py-2.5 border border-gray-300 text-gray-700 rounded-xl font-semibold text-sm hover:bg-gray-100">Cancel</button>
              <button onClick={createClient} disabled={creating}
                className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white rounded-xl font-semibold text-sm">
                {creating ? <Loader2 className="w-4 h-4 animate-spin" /> : null} Create Client
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-1">All Clients</h1>
          <p className="text-gray-500 text-sm">
            {clients.filter(c => c.status === 'active').length} active ·
            {clients.filter(c => c.status === 'pending_verification').length} pending verification
          </p>
        </div>
        <div className="flex gap-2">
          <button onClick={fetchClients} className="p-2.5 border border-gray-300 rounded-xl text-gray-500 hover:bg-gray-50 transition-colors">
            <RefreshCw className="w-4 h-4" />
          </button>
          <button onClick={() => setShowNewClient(true)}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl font-semibold transition-colors">
            <Plus className="w-4 h-4" /> Add Client
          </button>
        </div>
      </div>

      {/* Search */}
      <div className="relative mb-6">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input type="text" value={search} onChange={e => setSearch(e.target.value)}
          placeholder="Search by name, email, client ID, or business..."
          className="w-full pl-11 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white" />
      </div>

      {/* Error */}
      {error && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm">
          ⚠️ {error}
        </div>
      )}

      {/* Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        {loading ? (
          <div className="p-12 text-center">
            <Loader2 className="w-8 h-8 animate-spin mx-auto mb-3 text-blue-600" />
            <p className="text-gray-500 text-sm">Loading clients from database...</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="p-12 text-center">
            <UserCircle className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-600 font-medium">{search ? 'No clients match your search' : 'No clients yet'}</p>
            <p className="text-gray-400 text-sm mt-1">Click "Add Client" to create the first one</p>
          </div>
        ) : (
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Client</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">ID</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Status</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Intake</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Joined</th>
                <th className="px-6 py-3 text-right text-xs font-semibold text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filtered.map(client => (
                <tr key={client.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-full flex items-center justify-center text-sm font-bold text-white shrink-0">
                        {client.name.charAt(0)}
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900 text-sm">{client.name}</p>
                        <p className="text-xs text-gray-500">{client.email}</p>
                        {client.business_name && <p className="text-xs text-gray-400">{client.business_name}</p>}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <code className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded font-mono">{client.client_id}</code>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-col gap-1.5">
                      <span className={`inline-flex text-xs px-2.5 py-1 rounded-full font-semibold w-fit ${STATUS_COLORS[client.status]}`}>
                        {client.status.replace('_', ' ')}
                      </span>
                      {client.status === 'pending_verification' && (
                        <button onClick={() => approveClient(client)} disabled={approvingId === client.id}
                          className="flex items-center gap-1 text-xs text-green-700 font-semibold hover:text-green-900 w-fit">
                          {approvingId === client.id ? <Loader2 className="w-3 h-3 animate-spin" /> : <CheckCircle className="w-3 h-3" />}
                          Approve & Activate
                        </button>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`text-xs px-2 py-1 rounded-full font-medium ${client.first_login_completed ? 'bg-green-50 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                      {client.first_login_completed ? '✓ Done' : 'Pending'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">
                    {new Date(client.created_at).toLocaleDateString('en-PH', { month: 'short', day: 'numeric', year: 'numeric' })}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <Link href={`/admin/clients/${client.id}`}
                        className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        title="View client details">
                        <ExternalLink className="w-4 h-4" />
                      </Link>
                      <button onClick={() => emailCredentials(client)} disabled={emailingId === client.id || client.status !== 'active'}
                        className="p-1.5 text-gray-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors disabled:opacity-40"
                        title="Email portal access to client">
                        {emailingId === client.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Mail className="w-4 h-4" />}
                      </button>
                      <button onClick={() => deleteClient(client.id, client.name)}
                        className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        title="Delete client">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}

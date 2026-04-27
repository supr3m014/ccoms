'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { useToast } from '@/contexts/ToastContext'
import { useConfirm } from '@/contexts/ConfirmContext'
import {
  UserCircle, Plus, CheckCircle, Clock, Search, Trash2,
  X, Loader2, Copy
} from 'lucide-react'

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
  const [search, setSearch] = useState('')
  const [showNewClient, setShowNewClient] = useState(false)
  const [approvingId, setApprovingId] = useState<string | null>(null)
  const [newForm, setNewForm] = useState({
    name: '', email: '', phone: '', business_name: '',
    service_type: 'seo', service_name: '', amount: '',
    payment_type: 'recurring'
  })
  const [creating, setCreating] = useState(false)
  const [lastCreated, setLastCreated] = useState<{ email: string; tempPass: string; clientId: string } | null>(null)

  useEffect(() => { fetchClients() }, [])

  const fetchClients = async () => {
    const { data, error } = await supabase.from('clients').select('*').order('created_at', { ascending: false })
    if (!error) setClients(data || [])
    setLoading(false)
  }

  const approveClient = async (client: Client) => {
    setApprovingId(client.id)
    try {
      const tempPass = Math.random().toString(36).slice(-8) + Math.random().toString(36).slice(-4).toUpperCase()

      // Use Next.js API route which handles approval + welcome email
      const res = await fetch('/api/clients/approve', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ client_id: client.id, temp_password: tempPass }),
      })
      const data = await res.json()
      if (data.error) throw new Error(data.error)

      // Update payments to verified
      await supabase.from('payments')
        .update({ status: 'verified', verified_at: new Date().toISOString().slice(0, 19).replace('T', ' ') })
        .eq('client_id', client.id)
        .eq('status', 'pending')

      showToast(`Client approved! ID: ${data.client_id} · Welcome email sent`, 'success')
      setLastCreated({ email: client.email, tempPass: data.temp_password, clientId: data.client_id })
      fetchClients()
    } catch (err: any) {
      showToast(err.message || 'Failed to approve', 'error')
    }
    setApprovingId(null)
  }

  const createClient = async () => {
    if (!newForm.name.trim() || !newForm.email.trim()) { showToast('Name and email are required', 'warning'); return }
    setCreating(true)
    try {
      const clientId = crypto.randomUUID()
      await supabase.from('clients').insert([{
        id: clientId,
        client_id: 'PENDING',
        name: newForm.name.trim(),
        email: newForm.email.toLowerCase().trim(),
        phone: newForm.phone.trim() || null,
        business_name: newForm.business_name.trim() || null,
        password: '$2y$10$placeholder',
        status: 'pending_verification',
      }])

      // Create order if service specified
      if (newForm.service_type && newForm.service_name) {
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
      fetchClients()
      showToast('Client created — approve payment to activate their account', 'success')
    } catch (err: any) {
      showToast(err.message || 'Failed to create client', 'error')
    }
    setCreating(false)
  }

  const deleteClient = async (id: string, name: string) => {
    const ok = await showConfirm(`Delete client "${name}"? All their data (orders, files, messages) will be permanently deleted.`, { destructive: true, title: 'Delete Client' })
    if (!ok) return
    await supabase.from('clients').delete().eq('id', id)
    setClients(prev => prev.filter(c => c.id !== id))
    showToast('Client deleted', 'success')
  }

  const filtered = clients.filter(c =>
    !search || c.name.toLowerCase().includes(search.toLowerCase()) ||
    c.email.toLowerCase().includes(search.toLowerCase()) ||
    c.client_id.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="p-8">
      {/* Success banner after approval */}
      {lastCreated && (
        <div className="mb-6 bg-green-50 border border-green-200 rounded-2xl p-5">
          <div className="flex items-start justify-between">
            <div>
              <p className="font-bold text-green-800 mb-1">✅ Client Activated!</p>
              <p className="text-sm text-green-700">
                Client ID: <strong>{lastCreated.clientId}</strong> | Email: <strong>{lastCreated.email}</strong> | Temp Password: <strong className="font-mono">{lastCreated.tempPass}</strong>
              </p>
              <p className="text-xs text-green-600 mt-1">Send these credentials to the client via email or WhatsApp.</p>
            </div>
            <button onClick={() => setLastCreated(null)} className="p-1 text-green-600 hover:text-green-800"><X className="w-4 h-4" /></button>
          </div>
          <button onClick={() => { navigator.clipboard.writeText(`Client ID: ${lastCreated.clientId}\nEmail: ${lastCreated.email}\nTemporary Password: ${lastCreated.tempPass}\nPortal: ${window.location.origin}/client-dashboard`); showToast('Copied!', 'success') }}
            className="mt-3 flex items-center gap-1.5 text-sm text-green-700 font-semibold hover:text-green-900">
            <Copy className="w-4 h-4" /> Copy login details
          </button>
        </div>
      )}

      {/* Create client modal */}
      {showNewClient && (
        <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setShowNewClient(false)} />
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg animate-fadeIn overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
              <h3 className="font-bold text-gray-900 text-lg">Add New Client</h3>
              <button onClick={() => setShowNewClient(false)} className="p-1.5 hover:bg-gray-100 rounded-lg"><X className="w-5 h-5 text-gray-500" /></button>
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
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Service</label>
                  <select value={newForm.service_type} onChange={e => setNewForm(f => ({ ...f, service_type: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                    <option value="seo">SEO</option>
                    <option value="web_dev">Web Development</option>
                    <option value="brand_design">Brand Design</option>
                    <option value="ai_video">AI Video</option>
                    <option value="other">Other</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Billing</label>
                  <select value={newForm.payment_type} onChange={e => setNewForm(f => ({ ...f, payment_type: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                    <option value="recurring">Monthly Recurring</option>
                    <option value="one_off">One-off</option>
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Package Name</label>
                  <input value={newForm.service_name} onChange={e => setNewForm(f => ({ ...f, service_name: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="SEO Monthly Package" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Amount (₱)</label>
                  <input type="number" value={newForm.amount} onChange={e => setNewForm(f => ({ ...f, amount: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="15000" />
                </div>
              </div>
            </div>
            <div className="px-6 py-4 bg-gray-50 flex gap-3 justify-end">
              <button onClick={() => setShowNewClient(false)} className="px-5 py-2.5 border border-gray-300 text-gray-700 rounded-xl font-semibold text-sm hover:bg-gray-100">Cancel</button>
              <button onClick={createClient} disabled={creating}
                className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white rounded-xl font-semibold text-sm transition-colors">
                {creating ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                Create Client
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-1">All Clients</h1>
          <p className="text-gray-500">{clients.filter(c => c.status === 'active').length} active · {clients.filter(c => c.status === 'pending_verification').length} pending</p>
        </div>
        <button onClick={() => setShowNewClient(true)}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl font-semibold transition-colors">
          <Plus className="w-4 h-4" /> Add Client
        </button>
      </div>

      {/* Search */}
      <div className="relative mb-6">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input type="text" value={search} onChange={e => setSearch(e.target.value)}
          placeholder="Search by name, email, or client ID..."
          className="w-full pl-11 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white" />
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-gray-500"><Loader2 className="w-8 h-8 animate-spin mx-auto mb-3 text-blue-600" />Loading clients...</div>
        ) : filtered.length === 0 ? (
          <div className="p-12 text-center">
            <UserCircle className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-600 font-medium">No clients found</p>
          </div>
        ) : (
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Client</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">ID</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Status</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Onboarded</th>
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
                  <td className="px-6 py-4"><code className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded">{client.client_id}</code></td>
                  <td className="px-6 py-4">
                    <div className="flex flex-col gap-1">
                      <span className={`inline-flex text-xs px-2.5 py-1 rounded-full font-semibold w-fit ${STATUS_COLORS[client.status]}`}>
                        {client.status.replace('_', ' ')}
                      </span>
                      {client.status === 'pending_verification' && (
                        <button onClick={() => approveClient(client)} disabled={approvingId === client.id}
                          className="flex items-center gap-1 text-xs text-green-700 font-semibold hover:text-green-900 transition-colors">
                          {approvingId === client.id ? <Loader2 className="w-3 h-3 animate-spin" /> : <CheckCircle className="w-3 h-3" />}
                          Approve & Activate
                        </button>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`text-xs px-2 py-1 rounded-full font-medium ${client.first_login_completed ? 'bg-green-50 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                      {client.first_login_completed ? '✓ Complete' : 'Pending'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">
                    {new Date(client.created_at).toLocaleDateString('en-PH', { month: 'short', day: 'numeric', year: 'numeric' })}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button onClick={() => deleteClient(client.id, client.name)}
                        className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors">
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

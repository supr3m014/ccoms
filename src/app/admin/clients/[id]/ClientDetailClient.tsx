'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { useToast } from '@/contexts/ToastContext'
import { useConfirm } from '@/contexts/ConfirmContext'
import Link from 'next/link'
import {
  ArrowLeft, User, CreditCard, FolderOpen, Key, MessageCircle,
  CheckCircle, Clock, AlertCircle, Eye, EyeOff, Loader2,
  ExternalLink, Mail, Download, Lock, RefreshCw
} from 'lucide-react'

interface Client {
  id: string; client_id: string; name: string; email: string;
  phone: string | null; business_name: string | null;
  status: string; first_login_completed: number; created_at: string
}
interface Order {
  id: string; service_type: string; service_name: string;
  status: string; payment_type: string; amount: number | null; created_at: string
}
interface Task {
  id: string; order_id: string; title: string; status: string;
  is_checked: number; deadline: string | null
}
interface Payment {
  id: string; amount: number | null; payment_method: string;
  status: string; proof_url: string | null; verified_at: string | null; created_at: string
}
interface VaultFile {
  id: string; file_name: string; file_url: string; file_size: number;
  file_type: string; upload_type: string; description: string | null; created_at: string
}
interface Credential {
  id: string; label: string; username: string | null;
  password_encrypted: string | null; url: string | null; notes: string | null
}

const STATUS_COLORS: Record<string, string> = {
  pending_verification: 'bg-yellow-100 text-yellow-700',
  active: 'bg-green-100 text-green-700',
  suspended: 'bg-red-100 text-red-700',
}
const TASK_COLORS: Record<string, string> = {
  not_started: 'text-gray-400', in_progress: 'text-blue-500',
  waiting_on_client: 'text-yellow-500', done: 'text-green-500',
}

function formatSize(b: number) {
  if (!b) return ''
  if (b < 1024 * 1024) return `${(b / 1024).toFixed(0)} KB`
  return `${(b / (1024 * 1024)).toFixed(1)} MB`
}

const BRIDGE = process.env.NEXT_PUBLIC_API_URL!
const bridgePost = async (action: string, body: any) => {
  const res = await fetch(`${BRIDGE}?action=${action}`, {
    method: 'POST', headers: { 'Content-Type': 'application/json' },
    credentials: 'include', body: JSON.stringify(body),
  })
  return res.json()
}

export default function ClientDetailClient({ id }: { id: string }) {
  const router = useRouter()
  const { showToast } = useToast()
  const { showConfirm } = useConfirm()

  const [client, setClient] = useState<Client | null>(null)
  const [orders, setOrders] = useState<Order[]>([])
  const [tasks, setTasks] = useState<Task[]>([])
  const [payments, setPayments] = useState<Payment[]>([])
  const [files, setFiles] = useState<VaultFile[]>([])
  const [credentials, setCredentials] = useState<Credential[]>([])
  const [decrypted, setDecrypted] = useState<Record<string, string>>({})
  const [showPass, setShowPass] = useState<Set<string>>(new Set())
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<'orders' | 'payments' | 'vault' | 'credentials' | 'messages'>('orders')
  const [sending, setSending] = useState(false)

  useEffect(() => { if (id) loadAll() }, [id])

  const loadAll = async () => {
    setLoading(true)
    try {
      const [clientRes, ordersRes, paymentsRes, filesRes, credsRes] = await Promise.all([
        supabase.from('clients').select('*').eq('id', id).single(),
        supabase.from('orders').select('*').eq('client_id', id).order('created_at', { ascending: false }),
        supabase.from('payments').select('*').eq('client_id', id).order('created_at', { ascending: false }),
        supabase.from('vault_files').select('*').eq('client_id', id).order('created_at', { ascending: false }),
        supabase.from('client_credentials').select('*').eq('client_id', id),
      ])
      setClient(clientRes.data)
      setOrders(ordersRes.data || [])
      setPayments(paymentsRes.data || [])
      setFiles(filesRes.data || [])
      setCredentials(credsRes.data || [])

      if (ordersRes.data && ordersRes.data.length > 0) {
        const allTasks: Task[] = []
        for (const oid of ordersRes.data.map((o: Order) => o.id)) {
          const { data } = await supabase.from('tasks').select('*').eq('order_id', oid).order('sort_order')
          allTasks.push(...(data || []))
        }
        setTasks(allTasks)
      }
    } catch (e) { console.error(e) }
    setLoading(false)
  }

  const revealPassword = async (credId: string, encryptedPass: string | null) => {
    if (!encryptedPass) return
    const s = new Set(showPass)
    if (s.has(credId)) { s.delete(credId) }
    else {
      s.add(credId)
      if (!decrypted[credId]) {
        const data = await bridgePost('vault-decrypt', { value: encryptedPass })
        setDecrypted(prev => ({ ...prev, [credId]: data.result || '(error)' }))
      }
    }
    setShowPass(s)
  }

  const emailCredentials = async () => {
    if (!client) return
    setSending(true)
    try {
      const data = await bridgePost('client-email-creds', { client_id: client.id })
      if (data.error) throw new Error(data.error)
      showToast(`Access email sent to ${client.email}`, 'success')
    } catch (e: any) { showToast(e.message || 'Failed to send', 'error') }
    setSending(false)
  }

  const approveClient = async () => {
    if (!client) return
    const tempPass = Math.random().toString(36).slice(-6).toUpperCase() + Math.random().toString(36).slice(-6) + '!'
    const data = await bridgePost('client-approve', { client_id: client.id, temp_password: tempPass })
    if (data.error) { showToast(data.error, 'error'); return }
    showToast(`Activated as ${data.client_id} — Portal access ready!`, 'success')
    loadAll()
  }

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
    </div>
  )
  if (!client) return (
    <div className="p-8 text-center">
      <p className="text-gray-600">Client not found</p>
      <Link href="/admin/clients" className="text-blue-600 hover:underline mt-2 block">← Back to clients</Link>
    </div>
  )

  const clientUploads = files.filter(f => f.upload_type === 'client_upload')
  const deliverables = files.filter(f => f.upload_type === 'final_deliverable')

  const tabs = [
    { key: 'orders', label: 'Orders & Tasks', count: orders.length },
    { key: 'payments', label: 'Payments', count: payments.length },
    { key: 'vault', label: 'Files', count: files.length },
    { key: 'credentials', label: 'Credentials Vault', count: credentials.length },
  ] as const

  return (
    <div className="p-8 max-w-6xl mx-auto">
      <div className="mb-6">
        <Link href="/admin/clients" className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700 mb-4 w-fit">
          <ArrowLeft className="w-4 h-4" /> Back to All Clients
        </Link>
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-2xl flex items-center justify-center text-2xl font-bold text-white">
              {client.name.charAt(0)}
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{client.name}</h1>
              <p className="text-gray-500 text-sm">{client.email} · {client.phone || 'No phone'}</p>
              {client.business_name && <p className="text-gray-400 text-sm">{client.business_name}</p>}
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className={`px-3 py-1.5 rounded-full text-sm font-semibold ${STATUS_COLORS[client.status]}`}>
              {client.status.replace('_', ' ')}
            </span>
            <code className="text-sm bg-gray-100 text-gray-700 px-3 py-1.5 rounded-lg font-mono">{client.client_id}</code>
            {client.status === 'active' && (
              <button onClick={emailCredentials} disabled={sending}
                className="flex items-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-sm font-semibold transition-colors disabled:opacity-50">
                {sending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Mail className="w-4 h-4" />}
                Email Portal Access
              </button>
            )}
            {client.status === 'pending_verification' && (
              <button onClick={approveClient}
                className="flex items-center gap-1.5 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-xl text-sm font-semibold transition-colors">
                <CheckCircle className="w-4 h-4" /> Approve & Activate
              </button>
            )}
            <button onClick={loadAll} className="p-2 border border-gray-300 rounded-xl text-gray-500 hover:bg-gray-50">
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-2xl border border-gray-100 p-4">
          <p className="text-xs text-gray-400 mb-1">Client ID</p>
          <p className="font-bold text-gray-900 font-mono">{client.client_id}</p>
        </div>
        <div className="bg-white rounded-2xl border border-gray-100 p-4">
          <p className="text-xs text-gray-400 mb-1">Active Orders</p>
          <p className="font-bold text-gray-900">{orders.filter(o => o.status === 'active').length}</p>
        </div>
        <div className="bg-white rounded-2xl border border-gray-100 p-4">
          <p className="text-xs text-gray-400 mb-1">Intake Form</p>
          <p className={`font-bold text-sm ${client.first_login_completed ? 'text-green-600' : 'text-yellow-600'}`}>
            {client.first_login_completed ? '✓ Completed' : '⏳ Pending'}
          </p>
        </div>
        <div className="bg-white rounded-2xl border border-gray-100 p-4">
          <p className="text-xs text-gray-400 mb-1">Member Since</p>
          <p className="font-bold text-gray-900 text-sm">
            {new Date(client.created_at).toLocaleDateString('en-PH', { month: 'short', day: 'numeric', year: 'numeric' })}
          </p>
        </div>
      </div>

      <div className="flex gap-1 border-b border-gray-200 mb-6 overflow-x-auto">
        {tabs.map(tab => (
          <button key={tab.key} onClick={() => setActiveTab(tab.key as any)}
            className={`flex items-center gap-2 px-5 py-3 font-semibold text-sm border-b-2 transition-colors whitespace-nowrap -mb-px ${activeTab === tab.key ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}>
            {tab.label}
            <span className="px-2 py-0.5 bg-gray-100 text-gray-600 rounded-full text-xs">{tab.count}</span>
          </button>
        ))}
      </div>

      {activeTab === 'orders' && (
        <div className="space-y-4">
          {orders.length === 0 ? (
            <div className="bg-white rounded-2xl border border-gray-100 p-8 text-center text-gray-500">No orders yet</div>
          ) : orders.map(order => {
            const orderTasks = tasks.filter(t => t.order_id === order.id)
            const done = orderTasks.filter(t => t.is_checked).length
            const pct = orderTasks.length ? Math.round((done / orderTasks.length) * 100) : 0
            return (
              <div key={order.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <p className="font-bold text-gray-900">{order.service_name || order.service_type}</p>
                    <p className="text-xs text-gray-400">{order.payment_type === 'recurring' ? 'Monthly' : 'One-off'}{order.amount ? ` · ₱${order.amount.toLocaleString()}` : ''}</p>
                  </div>
                  <span className={`text-xs px-2.5 py-1 rounded-full font-semibold ${order.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>
                    {order.status.replace('_', ' ')}
                  </span>
                </div>
                {orderTasks.length > 0 && (
                  <>
                    <div className="flex items-center justify-between text-xs text-gray-500 mb-1.5">
                      <span>{done}/{orderTasks.length} tasks done</span>
                      <span className="font-semibold">{pct}%</span>
                    </div>
                    <div className="w-full bg-gray-100 rounded-full h-2 mb-3">
                      <div className="h-2 rounded-full bg-blue-500 transition-all" style={{ width: `${pct}%` }} />
                    </div>
                    <div className="space-y-1.5 max-h-48 overflow-y-auto">
                      {orderTasks.map(task => (
                        <div key={task.id} className="flex items-center gap-2.5">
                          {task.is_checked ? <CheckCircle className="w-4 h-4 text-green-500 shrink-0" /> :
                            task.status === 'waiting_on_client' ? <AlertCircle className="w-4 h-4 text-yellow-500 shrink-0" /> :
                            task.status === 'in_progress' ? <Clock className="w-4 h-4 text-blue-500 shrink-0" /> :
                            <Clock className="w-4 h-4 text-gray-300 shrink-0" />}
                          <span className={`text-sm ${task.is_checked ? 'line-through text-gray-400' : 'text-gray-700'}`}>{task.title}</span>
                          {task.deadline && <span className="text-xs text-gray-400 ml-auto">📅 {task.deadline}</span>}
                        </div>
                      ))}
                    </div>
                  </>
                )}
                <Link href="/admin/clients/orders" className="mt-3 flex items-center gap-1 text-xs text-blue-600 hover:text-blue-700 font-semibold">
                  Manage tasks in Order Manager →
                </Link>
              </div>
            )
          })}
        </div>
      )}

      {activeTab === 'payments' && (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          {payments.length === 0 ? (
            <div className="p-8 text-center text-gray-500">No payment records</div>
          ) : (
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Date</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Method</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Amount</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Status</th>
                  <th className="px-6 py-3 text-right text-xs font-semibold text-gray-500 uppercase">Receipt</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {payments.map(p => (
                  <tr key={p.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 text-sm text-gray-700">{new Date(p.created_at).toLocaleDateString('en-PH')}</td>
                    <td className="px-6 py-4 text-sm text-gray-700 capitalize">{p.payment_method.replace('_', ' ')}</td>
                    <td className="px-6 py-4 text-sm font-bold text-gray-900">{p.amount ? `₱${p.amount.toLocaleString()}` : '—'}</td>
                    <td className="px-6 py-4">
                      <span className={`text-xs px-2.5 py-1 rounded-full font-semibold ${p.status === 'verified' ? 'bg-green-100 text-green-700' : p.status === 'rejected' ? 'bg-red-100 text-red-700' : 'bg-yellow-100 text-yellow-700'}`}>
                        {p.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      {p.proof_url && (
                        <a href={p.proof_url} target="_blank" rel="noopener noreferrer" className="text-xs text-blue-600 font-semibold hover:underline flex items-center justify-end gap-1">
                          <ExternalLink className="w-3.5 h-3.5" /> View
                        </a>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}

      {activeTab === 'vault' && (
        <div className="space-y-4">
          {[{ label: '📤 Client Uploads', items: clientUploads }, { label: '📥 Final Deliverables', items: deliverables }].map(section => (
            <div key={section.label} className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
              <div className="px-5 py-3 bg-gray-50 border-b border-gray-100">
                <h3 className="font-semibold text-gray-800 text-sm">{section.label} ({section.items.length})</h3>
              </div>
              {section.items.length === 0 ? (
                <div className="px-5 py-6 text-center text-sm text-gray-400">No files yet</div>
              ) : (
                <div className="divide-y divide-gray-50">
                  {section.items.map(f => (
                    <div key={f.id} className="px-5 py-3 flex items-center gap-3">
                      <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center shrink-0">
                        <FolderOpen className="w-4 h-4 text-gray-500" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-800 truncate">{f.description || f.file_name}</p>
                        <p className="text-xs text-gray-400">{f.file_name} · {formatSize(f.file_size)}</p>
                      </div>
                      <a href={f.file_url} target="_blank" rel="noopener noreferrer"
                        className="flex items-center gap-1 text-xs text-blue-600 font-semibold hover:underline shrink-0">
                        <Download className="w-3.5 h-3.5" /> Open
                      </a>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {activeTab === 'credentials' && (
        <div className="space-y-3">
          <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-3 text-sm text-yellow-700">
            🔒 Passwords are AES-256 encrypted. Click the eye icon to decrypt and view.
          </div>
          {credentials.length === 0 ? (
            <div className="bg-white rounded-2xl border border-gray-100 p-8 text-center text-gray-500">
              No credentials stored by this client yet
            </div>
          ) : credentials.map(cred => (
            <div key={cred.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
              <div className="flex items-start gap-3">
                <Lock className="w-5 h-5 text-gray-400 mt-0.5 shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-gray-900 text-sm">{cred.label}</p>
                  {cred.url && (
                    <a href={cred.url} target="_blank" rel="noopener noreferrer" className="text-xs text-blue-600 hover:underline flex items-center gap-1 mt-0.5">
                      <ExternalLink className="w-3 h-3" />{cred.url}
                    </a>
                  )}
                  {cred.username && <p className="text-sm text-gray-600 mt-1">Username: <span className="font-mono font-semibold">{cred.username}</span></p>}
                  {cred.password_encrypted && (
                    <div className="flex items-center gap-2 mt-1">
                      <p className="text-sm text-gray-600">Password: <span className="font-mono font-semibold">{showPass.has(cred.id) ? (decrypted[cred.id] || '…decrypting') : '••••••••'}</span></p>
                      <button onClick={() => revealPassword(cred.id, cred.password_encrypted)} className="text-gray-400 hover:text-gray-700 transition-colors">
                        {showPass.has(cred.id) ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  )}
                  {cred.notes && <p className="text-xs text-gray-400 mt-1 italic">{cred.notes}</p>}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

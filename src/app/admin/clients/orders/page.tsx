'use client'

// Orders & Tasks — Firestore `orders` with an embedded task checklist per
// order. Statuses follow the client-portal blueprint lifecycle.

import { useState, useEffect } from 'react'
import {
  collection, query, orderBy, onSnapshot, addDoc, updateDoc, deleteDoc, doc, serverTimestamp,
} from 'firebase/firestore'
import { getDb } from '@/lib/firebase'
import {
  fetchClients, peso, ORDER_STATUS_STYLE, SERVICE_TYPES,
  type Order, type OrderStatus, type OrderTask, type Client,
} from '@/lib/clients'
import { Plus, Briefcase, ChevronDown, ChevronUp, Trash2, X, Loader2, Save, CheckSquare } from 'lucide-react'

const EMPTY_FORM = {
  client_id: '', service_type: SERVICE_TYPES[0] as string, service_name: '',
  payment_type: 'recurring' as 'one_off' | 'recurring', amount: '', start_date: '',
}

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([])
  const [clients, setClients] = useState<Client[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<'all' | OrderStatus>('all')
  const [expanded, setExpanded] = useState<string | null>(null)
  const [showNew, setShowNew] = useState(false)
  const [form, setForm] = useState(EMPTY_FORM)
  const [saving, setSaving] = useState(false)
  const [newTask, setNewTask] = useState('')
  const [notice, setNotice] = useState('')

  useEffect(() => {
    fetchClients().then(setClients).catch(() => {})
    const q = query(collection(getDb(), 'orders'), orderBy('created_at', 'desc'))
    return onSnapshot(q, (snap) => {
      setOrders(snap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<Order, 'id'>) })))
      setLoading(false)
    }, () => setLoading(false))
  }, [])

  const create = async (e: React.FormEvent) => {
    e.preventDefault()
    const client = clients.find((c) => c.id === form.client_id)
    if (!client) { setNotice('Pick a client first (create one under All Clients).'); return }
    setSaving(true); setNotice('')
    try {
      await addDoc(collection(getDb(), 'orders'), {
        client_id: client.id,
        client_name: client.name,
        service_type: form.service_type,
        service_name: form.service_name.trim() || form.service_type,
        status: 'pending_verification',
        payment_type: form.payment_type,
        amount: Number(form.amount) || 0,
        start_date: form.start_date,
        tasks: [],
        created_at: serverTimestamp(),
        updated_at: serverTimestamp(),
      })
      setForm(EMPTY_FORM); setShowNew(false)
    } catch { setNotice('Could not create the order.') }
    setSaving(false)
  }

  const setStatus = (o: Order, status: OrderStatus) =>
    updateDoc(doc(getDb(), 'orders', o.id), { status, updated_at: serverTimestamp() })

  const saveTasks = (o: Order, tasks: OrderTask[]) =>
    updateDoc(doc(getDb(), 'orders', o.id), { tasks, updated_at: serverTimestamp() })

  const addTask = (o: Order) => {
    const title = newTask.trim()
    if (!title) return
    saveTasks(o, [...(o.tasks || []), { id: Date.now().toString(36), title, done: false }])
    setNewTask('')
  }

  const remove = async (o: Order) => {
    if (!confirm(`Delete the order “${o.service_name}” for ${o.client_name}?`)) return
    await deleteDoc(doc(getDb(), 'orders', o.id))
  }

  const shown = orders.filter((o) => filter === 'all' || o.status === filter)
  const doneCount = (o: Order) => (o.tasks || []).filter((t) => t.done).length

  return (
    <div className="p-8 max-w-5xl">
      <div className="mb-6 flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-1">Orders &amp; Tasks</h1>
          <p className="text-gray-600 text-sm">{orders.filter(o => o.status === 'active').length} active order{orders.filter(o => o.status === 'active').length !== 1 ? 's' : ''} · {orders.length} total</p>
        </div>
        <button onClick={() => setShowNew(!showNew)}
          className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded-lg font-semibold text-sm">
          <Plus className="w-4 h-4" /> New Order
        </button>
      </div>

      {notice && <p className="mb-4 text-sm text-red-600">{notice}</p>}

      {showNew && (
        <form onSubmit={create} className="bg-white border border-gray-200 rounded-xl p-5 mb-6">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold text-gray-900">Create Order</h3>
            <button type="button" onClick={() => setShowNew(false)} className="p-1 text-gray-400 hover:bg-gray-100 rounded"><X className="w-4 h-4" /></button>
          </div>
          <div className="grid md:grid-cols-2 gap-3">
            <select required value={form.client_id} onChange={(e) => setForm({ ...form, client_id: e.target.value })}
              className="border border-gray-200 rounded-lg px-3 py-2 text-sm bg-white">
              <option value="">Select client *</option>
              {clients.filter(c => c.status !== 'archived').map((c) => <option key={c.id} value={c.id}>{c.name} ({c.client_number})</option>)}
            </select>
            <select value={form.service_type} onChange={(e) => setForm({ ...form, service_type: e.target.value })}
              className="border border-gray-200 rounded-lg px-3 py-2 text-sm bg-white">
              {SERVICE_TYPES.map((s) => <option key={s} value={s}>{s}</option>)}
            </select>
            <input value={form.service_name} onChange={(e) => setForm({ ...form, service_name: e.target.value })}
              placeholder="Order name (e.g. SEO Retainer — 6 months)" className="border border-gray-200 rounded-lg px-3 py-2 text-sm md:col-span-2" />
            <select value={form.payment_type} onChange={(e) => setForm({ ...form, payment_type: e.target.value as 'one_off' | 'recurring' })}
              className="border border-gray-200 rounded-lg px-3 py-2 text-sm bg-white">
              <option value="recurring">Recurring (monthly)</option>
              <option value="one_off">One-off</option>
            </select>
            <input type="number" min="0" step="0.01" value={form.amount} onChange={(e) => setForm({ ...form, amount: e.target.value })}
              placeholder="Amount (PHP)" className="border border-gray-200 rounded-lg px-3 py-2 text-sm" />
            <label className="text-xs text-gray-500 md:col-span-2">Start date
              <input type="date" value={form.start_date} onChange={(e) => setForm({ ...form, start_date: e.target.value })}
                className="mt-1 block border border-gray-200 rounded-lg px-3 py-2 text-sm" />
            </label>
          </div>
          <button type="submit" disabled={saving}
            className="mt-4 inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white px-5 py-2 rounded-lg font-semibold text-sm">
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />} Create Order
          </button>
        </form>
      )}

      <div className="mb-4 flex gap-1 bg-gray-100 p-1 rounded-xl w-fit flex-wrap">
        {(['all', 'pending_verification', 'active', 'paused', 'completed', 'cancelled'] as const).map((f) => (
          <button key={f} onClick={() => setFilter(f)}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold capitalize transition-colors ${filter === f ? 'bg-white shadow text-gray-900' : 'text-gray-500 hover:text-gray-700'}`}>
            {f.replace('_', ' ')}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="bg-white rounded-lg shadow-md p-12 text-center text-gray-500">Loading…</div>
      ) : shown.length === 0 ? (
        <div className="bg-white rounded-lg shadow-md p-12 text-center">
          <Briefcase className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500">{orders.length === 0 ? 'No orders yet.' : 'Nothing matches the filter.'}</p>
        </div>
      ) : (
        <div className="space-y-2">
          {shown.map((o) => (
            <div key={o.id} className="bg-white border border-gray-200 rounded-xl overflow-hidden">
              <div className="flex items-center gap-3 p-4 cursor-pointer hover:bg-gray-50" onClick={() => setExpanded(expanded === o.id ? null : o.id)}>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-semibold text-sm text-gray-900">{o.service_name}</span>
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium capitalize ${ORDER_STATUS_STYLE[o.status]}`}>{o.status.replace('_', ' ')}</span>
                    <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">{o.payment_type === 'recurring' ? 'recurring' : 'one-off'}</span>
                  </div>
                  <p className="text-xs text-gray-500 mt-0.5">
                    {o.client_name} · {peso(o.amount)}{o.payment_type === 'recurring' ? '/mo' : ''}
                    {o.start_date ? ` · starts ${o.start_date}` : ''}
                    {(o.tasks || []).length > 0 && ` · tasks ${doneCount(o)}/${o.tasks.length}`}
                  </p>
                </div>
                {expanded === o.id ? <ChevronUp className="w-4 h-4 text-gray-400" /> : <ChevronDown className="w-4 h-4 text-gray-400" />}
              </div>

              {expanded === o.id && (
                <div className="border-t border-gray-100 px-4 pb-4">
                  <div className="flex gap-2 py-3 flex-wrap">
                    {(['pending_verification', 'active', 'paused', 'completed', 'cancelled'] as const).map((s) => (
                      <button key={s} onClick={() => setStatus(o, s)}
                        className={`text-xs px-3 py-1 rounded-full font-medium border capitalize transition-colors ${o.status === s ? ORDER_STATUS_STYLE[s] + ' border-transparent' : 'border-gray-200 text-gray-500 hover:bg-gray-50'}`}>
                        {s.replace('_', ' ')}
                      </button>
                    ))}
                    <button onClick={() => remove(o)} className="ml-auto text-xs text-red-500 hover:text-red-700 flex items-center gap-1"><Trash2 className="w-3.5 h-3.5" /> Delete</button>
                  </div>

                  <div className="bg-gray-50 rounded-xl p-3">
                    <p className="text-xs font-semibold text-gray-600 mb-2 flex items-center gap-1"><CheckSquare className="w-3.5 h-3.5" /> Task checklist</p>
                    {(o.tasks || []).length === 0 && <p className="text-xs text-gray-400 mb-2">No tasks yet.</p>}
                    <div className="space-y-1 mb-2">
                      {(o.tasks || []).map((t) => (
                        <label key={t.id} className="flex items-center gap-2 text-sm cursor-pointer group">
                          <input type="checkbox" checked={t.done}
                            onChange={() => saveTasks(o, o.tasks.map((x) => x.id === t.id ? { ...x, done: !x.done } : x))}
                            className="w-4 h-4" />
                          <span className={t.done ? 'line-through text-gray-400' : 'text-gray-800'}>{t.title}</span>
                          <button onClick={(e) => { e.preventDefault(); saveTasks(o, o.tasks.filter((x) => x.id !== t.id)) }}
                            className="opacity-0 group-hover:opacity-100 text-red-400 hover:text-red-600"><X className="w-3.5 h-3.5" /></button>
                        </label>
                      ))}
                    </div>
                    <div className="flex gap-2">
                      <input value={expanded === o.id ? newTask : ''} onChange={(e) => setNewTask(e.target.value)}
                        onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addTask(o) } }}
                        placeholder="Add a task and press Enter" className="flex-1 border border-gray-200 rounded-lg px-3 py-1.5 text-xs" />
                      <button onClick={() => addTask(o)} className="border border-gray-200 rounded-lg px-2.5 hover:bg-white"><Plus className="w-3.5 h-3.5 text-gray-500" /></button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

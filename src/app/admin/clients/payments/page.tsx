'use client'

// Payments — record incoming payments and verify/reject them (the blueprint's
// payment-verification step). Firestore `payments`.

import { useState, useEffect } from 'react'
import {
  collection, query, orderBy, onSnapshot, addDoc, updateDoc, deleteDoc, doc, serverTimestamp,
} from 'firebase/firestore'
import { getDb } from '@/lib/firebase'
import {
  fetchClients, peso, PAYMENT_STATUS_STYLE,
  type Payment, type PaymentStatus, type Client,
} from '@/lib/clients'
import { Plus, CreditCard, Check, Ban, Trash2, X, Loader2, Save } from 'lucide-react'

const METHODS = [
  { value: 'gcash', label: 'GCash' },
  { value: 'bank_transfer', label: 'Bank Transfer' },
  { value: 'card', label: 'Card' },
  { value: 'cash', label: 'Cash' },
  { value: 'other', label: 'Other' },
] as const

const EMPTY_FORM = { client_id: '', amount: '', method: 'gcash' as Payment['method'], reference: '', paid_at: '', notes: '' }

export default function PaymentsPage() {
  const [payments, setPayments] = useState<Payment[]>([])
  const [clients, setClients] = useState<Client[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<'all' | PaymentStatus>('all')
  const [showNew, setShowNew] = useState(false)
  const [form, setForm] = useState(EMPTY_FORM)
  const [saving, setSaving] = useState(false)
  const [notice, setNotice] = useState('')

  useEffect(() => {
    fetchClients().then(setClients).catch(() => {})
    const q = query(collection(getDb(), 'payments'), orderBy('created_at', 'desc'))
    return onSnapshot(q, (snap) => {
      setPayments(snap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<Payment, 'id'>) })))
      setLoading(false)
    }, () => setLoading(false))
  }, [])

  const create = async (e: React.FormEvent) => {
    e.preventDefault()
    const client = clients.find((c) => c.id === form.client_id)
    if (!client) { setNotice('Pick a client first.'); return }
    setSaving(true); setNotice('')
    try {
      await addDoc(collection(getDb(), 'payments'), {
        client_id: client.id,
        client_name: client.name,
        amount: Number(form.amount) || 0,
        method: form.method,
        reference: form.reference.trim(),
        status: 'pending_verification',
        notes: form.notes.trim(),
        paid_at: form.paid_at,
        created_at: serverTimestamp(),
      })
      setForm(EMPTY_FORM); setShowNew(false)
    } catch { setNotice('Could not record the payment.') }
    setSaving(false)
  }

  const setStatus = (p: Payment, status: PaymentStatus) =>
    updateDoc(doc(getDb(), 'payments', p.id), { status, ...(status === 'verified' && { verified_at: serverTimestamp() }) })

  const remove = async (p: Payment) => {
    if (!confirm(`Delete this ${peso(p.amount)} payment record for ${p.client_name}?`)) return
    await deleteDoc(doc(getDb(), 'payments', p.id))
  }

  const shown = payments.filter((p) => filter === 'all' || p.status === filter)
  const verifiedTotal = payments.filter((p) => p.status === 'verified').reduce((s, p) => s + (p.amount || 0), 0)

  return (
    <div className="p-8 max-w-5xl">
      <div className="mb-6 flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-1">Payments</h1>
          <p className="text-gray-600 text-sm">
            {peso(verifiedTotal)} verified · {payments.filter(p => p.status === 'pending_verification').length} awaiting verification
          </p>
        </div>
        <button onClick={() => setShowNew(!showNew)}
          className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded-lg font-semibold text-sm">
          <Plus className="w-4 h-4" /> Record Payment
        </button>
      </div>

      {notice && <p className="mb-4 text-sm text-red-600">{notice}</p>}

      {showNew && (
        <form onSubmit={create} className="bg-white border border-gray-200 rounded-xl p-5 mb-6">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold text-gray-900">Record Payment</h3>
            <button type="button" onClick={() => setShowNew(false)} className="p-1 text-gray-400 hover:bg-gray-100 rounded"><X className="w-4 h-4" /></button>
          </div>
          <div className="grid md:grid-cols-2 gap-3">
            <select required value={form.client_id} onChange={(e) => setForm({ ...form, client_id: e.target.value })}
              className="border border-gray-200 rounded-lg px-3 py-2 text-sm bg-white">
              <option value="">Select client *</option>
              {clients.filter(c => c.status !== 'archived').map((c) => <option key={c.id} value={c.id}>{c.name} ({c.client_number})</option>)}
            </select>
            <input required type="number" min="0.01" step="0.01" value={form.amount} onChange={(e) => setForm({ ...form, amount: e.target.value })}
              placeholder="Amount (PHP) *" className="border border-gray-200 rounded-lg px-3 py-2 text-sm" />
            <select value={form.method} onChange={(e) => setForm({ ...form, method: e.target.value as Payment['method'] })}
              className="border border-gray-200 rounded-lg px-3 py-2 text-sm bg-white">
              {METHODS.map((m) => <option key={m.value} value={m.value}>{m.label}</option>)}
            </select>
            <input value={form.reference} onChange={(e) => setForm({ ...form, reference: e.target.value })}
              placeholder="Reference number" className="border border-gray-200 rounded-lg px-3 py-2 text-sm" />
            <label className="text-xs text-gray-500">Paid on
              <input type="date" value={form.paid_at} onChange={(e) => setForm({ ...form, paid_at: e.target.value })}
                className="mt-1 block w-full border border-gray-200 rounded-lg px-3 py-2 text-sm" />
            </label>
            <input value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })}
              placeholder="Notes" className="border border-gray-200 rounded-lg px-3 py-2 text-sm" />
          </div>
          <button type="submit" disabled={saving}
            className="mt-4 inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white px-5 py-2 rounded-lg font-semibold text-sm">
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />} Save Payment
          </button>
        </form>
      )}

      <div className="mb-4 flex gap-1 bg-gray-100 p-1 rounded-xl w-fit">
        {(['all', 'pending_verification', 'verified', 'rejected'] as const).map((f) => (
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
          <CreditCard className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500">{payments.length === 0 ? 'No payments recorded yet.' : 'Nothing matches the filter.'}</p>
        </div>
      ) : (
        <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-600">CLIENT</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-600">AMOUNT</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-600 hidden md:table-cell">METHOD / REF</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-600">STATUS</th>
                <th className="text-right px-4 py-3 text-xs font-semibold text-gray-600">ACTIONS</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {shown.map((p) => (
                <tr key={p.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3">
                    <p className="font-medium text-gray-900">{p.client_name}</p>
                    <p className="text-xs text-gray-400">{p.paid_at || p.created_at?.toDate().toLocaleDateString()}</p>
                  </td>
                  <td className="px-4 py-3 font-semibold text-gray-900">{peso(p.amount)}</td>
                  <td className="px-4 py-3 hidden md:table-cell text-xs text-gray-500 capitalize">
                    {p.method.replace('_', ' ')}{p.reference ? ` · ${p.reference}` : ''}
                  </td>
                  <td className="px-4 py-3">
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium capitalize ${PAYMENT_STATUS_STYLE[p.status]}`}>{p.status.replace('_', ' ')}</span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-1">
                      {p.status !== 'verified' && (
                        <button onClick={() => setStatus(p, 'verified')} title="Verify"
                          className="p-1.5 rounded hover:bg-green-50 text-green-600"><Check className="w-4 h-4" /></button>
                      )}
                      {p.status !== 'rejected' && (
                        <button onClick={() => setStatus(p, 'rejected')} title="Reject"
                          className="p-1.5 rounded hover:bg-orange-50 text-orange-500"><Ban className="w-4 h-4" /></button>
                      )}
                      <button onClick={() => remove(p)} title="Delete"
                        className="p-1.5 rounded hover:bg-red-50 text-red-400 hover:text-red-600"><Trash2 className="w-4 h-4" /></button>
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

'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { useClientAuth } from '@/contexts/ClientAuthContext'
import { CreditCard, CheckCircle, Clock, XCircle, Upload, Loader2 } from 'lucide-react'
import { useToast } from '@/contexts/ToastContext'

interface Payment {
  id: string
  amount: number | null
  payment_method: string
  status: 'pending' | 'verified' | 'rejected'
  proof_url: string | null
  notes: string | null
  verified_at: string | null
  created_at: string
}

const STATUS_CONFIG = {
  pending: { label: 'Pending Verification', color: 'bg-yellow-100 text-yellow-700', icon: Clock },
  verified: { label: 'Paid', color: 'bg-green-100 text-green-700', icon: CheckCircle },
  rejected: { label: 'Rejected', color: 'bg-red-100 text-red-700', icon: XCircle },
}

const METHOD_LABELS: Record<string, string> = {
  gcash: 'GCash', paymaya: 'PayMaya', qr_ph: 'QR PH', bank_transfer: 'Bank Transfer', other: 'Other'
}

export default function BillingPage() {
  const { client } = useClientAuth()
  const { showToast } = useToast()
  const [payments, setPayments] = useState<Payment[]>([])
  const [loading, setLoading] = useState(true)
  const [showUpload, setShowUpload] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [form, setForm] = useState({ amount: '', method: 'gcash', notes: '' })
  const [proofFile, setProofFile] = useState<File | null>(null)

  useEffect(() => {
    if (client) fetchPayments()
  }, [client])

  const fetchPayments = async () => {
    const { data } = await supabase.from('payments').select('*').eq('client_id', client!.id).order('created_at', { ascending: false })
    setPayments(data || [])
    setLoading(false)
  }

  const submitPayment = async () => {
    if (!proofFile) { showToast('Please upload proof of payment', 'warning'); return }
    setUploading(true)
    try {
      const formData = new FormData()
      formData.append('file', proofFile)
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}?action=upload`, { method: 'POST', body: formData })
      const uploadData = await res.json()
      if (uploadData.error) throw new Error(uploadData.error)

      await supabase.from('payments').insert([{
        client_id: client!.id,
        amount: form.amount ? parseFloat(form.amount) : null,
        payment_method: form.method,
        status: 'pending',
        proof_url: uploadData.url,
        notes: form.notes.trim() || null,
      }])

      showToast('Payment submitted for verification. We\'ll process within 24 hours.', 'success')
      setShowUpload(false)
      setForm({ amount: '', method: 'gcash', notes: '' })
      setProofFile(null)
      fetchPayments()
    } catch (err: any) {
      showToast(err.message || 'Failed to submit', 'error')
    }
    setUploading(false)
  }

  return (
    <div className="p-6 lg:p-8 max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Billing & Payments</h1>
          <p className="text-sm text-gray-500 mt-1">Your payment history and verification status</p>
        </div>
        <button onClick={() => setShowUpload(v => !v)}
          className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-semibold text-sm transition-colors">
          <Upload className="w-4 h-4" /> Submit Payment
        </button>
      </div>

      {/* Submit payment form */}
      {showUpload && (
        <div className="bg-white rounded-2xl border border-blue-200 shadow-sm p-6 space-y-4">
          <h2 className="font-bold text-gray-900">Submit Proof of Payment</h2>
          <p className="text-sm text-gray-500">Upload your GCash screenshot, Maya receipt, or bank transfer confirmation. We verify within 24 hours.</p>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Amount (₱)</label>
              <input type="number" value={form.amount} onChange={e => setForm(f => ({ ...f, amount: e.target.value }))}
                placeholder="e.g. 15000" className="w-full px-3 py-2.5 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Payment Method</label>
              <select value={form.method} onChange={e => setForm(f => ({ ...f, method: e.target.value }))}
                className="w-full px-3 py-2.5 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                {Object.entries(METHOD_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Proof of Payment <span className="text-red-500">*</span></label>
            <label className={`flex flex-col items-center justify-center border-2 border-dashed rounded-xl p-6 cursor-pointer transition-colors ${proofFile ? 'border-green-400 bg-green-50' : 'border-gray-300 hover:border-blue-400 hover:bg-blue-50'}`}>
              {proofFile ? (
                <><CheckCircle className="w-8 h-8 text-green-500 mb-2" /><p className="text-sm font-medium text-green-700">{proofFile.name}</p></>
              ) : (
                <><Upload className="w-8 h-8 text-gray-400 mb-2" /><p className="text-sm text-gray-600">Click to upload screenshot</p><p className="text-xs text-gray-400 mt-1">PNG, JPG, or PDF</p></>
              )}
              <input type="file" accept="image/*,.pdf" className="hidden" onChange={e => setProofFile(e.target.files?.[0] || null)} />
            </label>
          </div>

          <textarea value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))}
            placeholder="Optional: reference number, notes..." rows={2}
            className="w-full px-3 py-2.5 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none" />

          <div className="flex gap-3">
            <button onClick={submitPayment} disabled={!proofFile || uploading}
              className="flex items-center gap-2 px-6 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white rounded-xl font-semibold text-sm transition-colors">
              {uploading ? <><Loader2 className="w-4 h-4 animate-spin" />Submitting...</> : 'Submit for Verification'}
            </button>
            <button onClick={() => setShowUpload(false)} className="px-6 py-2.5 border border-gray-300 text-gray-700 rounded-xl font-semibold text-sm hover:bg-gray-50 transition-colors">Cancel</button>
          </div>
        </div>
      )}

      {/* Payment history */}
      {loading ? (
        <div className="flex justify-center py-12"><Loader2 className="w-8 h-8 animate-spin text-blue-600" /></div>
      ) : payments.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center">
          <CreditCard className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-600 font-medium">No payment records yet</p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100 bg-gray-50">
            <h2 className="font-bold text-gray-900">Payment History</h2>
          </div>
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
              {payments.map(p => {
                const cfg = STATUS_CONFIG[p.status]
                const Icon = cfg.icon
                return (
                  <tr key={p.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 text-sm text-gray-700">{new Date(p.created_at).toLocaleDateString('en-PH', { month: 'short', day: 'numeric', year: 'numeric' })}</td>
                    <td className="px-6 py-4 text-sm text-gray-700">{METHOD_LABELS[p.payment_method] || p.payment_method}</td>
                    <td className="px-6 py-4 text-sm font-semibold text-gray-900">{p.amount ? `₱${p.amount.toLocaleString()}` : '—'}</td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full ${cfg.color}`}>
                        <Icon className="w-3.5 h-3.5" />{cfg.label}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      {p.proof_url && (
                        <a href={p.proof_url} target="_blank" rel="noopener noreferrer" className="text-xs text-blue-600 hover:text-blue-700 font-medium">View</a>
                      )}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}

      <div className="bg-blue-50 border border-blue-200 rounded-2xl p-4 text-sm text-blue-700">
        <strong>Payment methods:</strong> GCash, Maya/PayMaya, QR PH, or Bank Transfer. Payment verification is manual and may take up to 24 hours. You will receive an email confirmation once verified.
      </div>
    </div>
  )
}

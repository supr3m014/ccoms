'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { useToast } from '@/contexts/ToastContext'
import { CheckCircle, XCircle, Clock, Eye, ExternalLink, Loader2 } from 'lucide-react'

interface Payment {
  id: string
  client_id: string
  amount: number | null
  payment_method: string
  status: 'pending' | 'verified' | 'rejected'
  proof_url: string | null
  notes: string | null
  verified_at: string | null
  created_at: string
  client?: { name: string; email: string; client_id: string }
}

const METHOD_LABELS: Record<string, string> = {
  gcash: 'GCash', paymaya: 'PayMaya', qr_ph: 'QR PH', bank_transfer: 'Bank Transfer', other: 'Other'
}

export default function PaymentsPage() {
  const { showToast } = useToast()
  const [payments, setPayments] = useState<Payment[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<'pending' | 'verified' | 'rejected' | 'all'>('pending')
  const [processing, setProcessing] = useState<string | null>(null)

  useEffect(() => { fetchPayments() }, [filter])

  const fetchPayments = async () => {
    setLoading(true)
    try {
      let query = supabase.from('payments').select('*').order('created_at', { ascending: false })
      if (filter !== 'all') query = query.eq('status', filter)
      const { data: paymentsData } = await query

      if (paymentsData && paymentsData.length > 0) {
        const { data: clientsData } = await supabase.from('clients').select('id, name, email, client_id')
        const clientMap = new Map((clientsData || []).map((c: any) => [c.id, c]))
        const enriched = paymentsData.map((p: any) => ({ ...p, client: clientMap.get(p.client_id) }))
        setPayments(enriched)
      } else {
        setPayments([])
      }
    } catch (e) { console.error(e) }
    finally { setLoading(false) }
  }

  const updateStatus = async (paymentId: string, clientId: string, status: 'verified' | 'rejected') => {
    setProcessing(paymentId)
    try {
      const now = new Date().toISOString().slice(0, 19).replace('T', ' ')
      await supabase.from('payments').update({ status, verified_at: status === 'verified' ? now : null }).eq('id', paymentId)

      if (status === 'verified') {
        // Activate the client if this is their first verified payment
        const { data: client } = await supabase.from('clients').select('status').eq('id', clientId).single()
        if (client?.status === 'pending_verification') {
          // Need to go through the full approval flow
          showToast('Payment verified. Go to All Clients to approve and activate this client\'s account.', 'info')
        } else {
          showToast('Payment verified', 'success')
        }
      } else {
        showToast('Payment rejected', 'success')
      }

      fetchPayments()
    } catch (e) {
      showToast('Failed to update payment', 'error')
    }
    setProcessing(null)
  }

  const pendingCount = payments.filter(p => p.status === 'pending').length

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Payment Verification Hub</h1>
        <p className="text-gray-500">Review and approve proof-of-payment submissions from clients</p>
      </div>

      {/* Filter tabs */}
      <div className="flex gap-2 mb-6">
        {(['pending', 'verified', 'rejected', 'all'] as const).map(f => (
          <button key={f} onClick={() => setFilter(f)}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl font-semibold text-sm transition-colors capitalize ${filter === f ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>
            {f === 'pending' && pendingCount > 0 && <span className="bg-red-500 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center">{pendingCount}</span>}
            {f}
          </button>
        ))}
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        {loading ? (
          <div className="p-12 text-center"><Loader2 className="w-8 h-8 animate-spin mx-auto text-blue-600" /></div>
        ) : payments.length === 0 ? (
          <div className="p-12 text-center">
            <CheckCircle className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500">No {filter !== 'all' ? filter : ''} payments</p>
          </div>
        ) : (
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Client</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Method</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Amount</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Submitted</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Receipt</th>
                <th className="px-6 py-3 text-right text-xs font-semibold text-gray-500 uppercase">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {payments.map(p => (
                <tr key={p.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4">
                    <p className="font-semibold text-gray-900 text-sm">{(p as any).client?.name || 'Unknown'}</p>
                    <p className="text-xs text-gray-500">{(p as any).client?.email}</p>
                    <code className="text-xs text-gray-400">{(p as any).client?.client_id}</code>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-700">{METHOD_LABELS[p.payment_method] || p.payment_method}</td>
                  <td className="px-6 py-4 text-sm font-bold text-gray-900">{p.amount ? `₱${p.amount.toLocaleString()}` : '—'}</td>
                  <td className="px-6 py-4 text-sm text-gray-600">
                    {new Date(p.created_at).toLocaleDateString('en-PH', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                  </td>
                  <td className="px-6 py-4">
                    {p.proof_url ? (
                      <a href={p.proof_url} target="_blank" rel="noopener noreferrer"
                        className="flex items-center gap-1.5 text-xs text-blue-600 hover:text-blue-700 font-semibold">
                        <ExternalLink className="w-3.5 h-3.5" /> View Receipt
                      </a>
                    ) : <span className="text-xs text-gray-400">No receipt</span>}
                  </td>
                  <td className="px-6 py-4 text-right">
                    {p.status === 'pending' ? (
                      <div className="flex items-center justify-end gap-2">
                        <button onClick={() => updateStatus(p.id, p.client_id, 'verified')}
                          disabled={processing === p.id}
                          className="flex items-center gap-1.5 px-3 py-1.5 bg-green-600 hover:bg-green-700 text-white rounded-lg text-xs font-semibold transition-colors disabled:opacity-50">
                          {processing === p.id ? <Loader2 className="w-3 h-3 animate-spin" /> : <CheckCircle className="w-3.5 h-3.5" />}
                          Approve
                        </button>
                        <button onClick={() => updateStatus(p.id, p.client_id, 'rejected')}
                          disabled={processing === p.id}
                          className="flex items-center gap-1.5 px-3 py-1.5 bg-red-100 hover:bg-red-200 text-red-700 rounded-lg text-xs font-semibold transition-colors disabled:opacity-50">
                          <XCircle className="w-3.5 h-3.5" /> Reject
                        </button>
                      </div>
                    ) : (
                      <span className={`text-xs px-2.5 py-1 rounded-full font-semibold ${p.status === 'verified' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                        {p.status}
                      </span>
                    )}
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

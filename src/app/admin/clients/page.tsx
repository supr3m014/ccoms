'use client'

// All Clients — Firestore CRUD with an inline editor drawer. This replaces a
// placeholder stub; clients created here feed Orders, Payments, Messages and
// Reports & Files.

import { useState, useEffect } from 'react'
import {
  collection, query, orderBy, onSnapshot, addDoc, updateDoc, doc, serverTimestamp,
} from 'firebase/firestore'
import { getDb } from '@/lib/firebase'
import { nextClientNumber, type Client, type ClientStatus } from '@/lib/clients'
import { Plus, Search, Users, Pencil, X, Save, Loader2, Archive } from 'lucide-react'

const STATUS_STYLE: Record<ClientStatus, string> = {
  active: 'bg-green-100 text-green-700',
  paused: 'bg-yellow-100 text-yellow-700',
  archived: 'bg-gray-100 text-gray-500',
}

const EMPTY_FORM = { name: '', company: '', email: '', phone: '', status: 'active' as ClientStatus, notes: '' }

export default function AllClientsPage() {
  const [clients, setClients] = useState<Client[]>([])
  const [loading, setLoading] = useState(true)
  const [term, setTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<'all' | ClientStatus>('all')
  const [editing, setEditing] = useState<Client | 'new' | null>(null)
  const [form, setForm] = useState(EMPTY_FORM)
  const [saving, setSaving] = useState(false)
  const [notice, setNotice] = useState('')

  useEffect(() => {
    const q = query(collection(getDb(), 'clients'), orderBy('created_at', 'desc'))
    return onSnapshot(q, (snap) => {
      setClients(snap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<Client, 'id'>) })))
      setLoading(false)
    }, () => setLoading(false))
  }, [])

  const open = (c: Client | 'new') => {
    setEditing(c)
    setForm(c === 'new' ? EMPTY_FORM : { name: c.name, company: c.company, email: c.email, phone: c.phone, status: c.status, notes: c.notes })
  }

  const save = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true); setNotice('')
    try {
      if (editing === 'new') {
        const client_number = await nextClientNumber()
        await addDoc(collection(getDb(), 'clients'), {
          client_number, ...form,
          email: form.email.trim().toLowerCase(),
          created_at: serverTimestamp(), updated_at: serverTimestamp(),
        })
      } else if (editing) {
        await updateDoc(doc(getDb(), 'clients', editing.id), {
          ...form, email: form.email.trim().toLowerCase(), updated_at: serverTimestamp(),
        })
      }
      setEditing(null)
    } catch { setNotice('Save failed — please try again.') }
    setSaving(false)
  }

  const archive = async (c: Client) => {
    if (!confirm(`Archive ${c.name}? They disappear from the default view but nothing is deleted.`)) return
    await updateDoc(doc(getDb(), 'clients', c.id), { status: 'archived', updated_at: serverTimestamp() })
  }

  const shown = clients
    .filter((c) => statusFilter === 'all' ? c.status !== 'archived' : c.status === statusFilter)
    .filter((c) => {
      const t = term.trim().toLowerCase()
      return !t || [c.name, c.company, c.email, c.client_number].some((v) => (v || '').toLowerCase().includes(t))
    })

  return (
    <div className="p-8">
      <div className="mb-6 flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-1">All Clients</h1>
          <p className="text-gray-600 text-sm">{clients.filter(c => c.status === 'active').length} active · {clients.length} total</p>
        </div>
        <button onClick={() => open('new')}
          className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded-lg font-semibold text-sm">
          <Plus className="w-4 h-4" /> Add Client
        </button>
      </div>

      {notice && <p className="mb-4 text-sm text-red-600">{notice}</p>}

      <div className="mb-4 flex items-center gap-3 flex-wrap">
        <div className="flex gap-1 bg-gray-100 p-1 rounded-xl w-fit">
          {(['all', 'active', 'paused', 'archived'] as const).map((f) => (
            <button key={f} onClick={() => setStatusFilter(f)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold capitalize transition-colors ${statusFilter === f ? 'bg-white shadow text-gray-900' : 'text-gray-500 hover:text-gray-700'}`}>
              {f}
            </button>
          ))}
        </div>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input value={term} onChange={(e) => setTerm(e.target.value)} placeholder="Search clients…"
            className="pl-9 pr-3 py-2 rounded-lg border border-gray-200 text-sm focus:border-gray-400 outline-none w-64" />
        </div>
      </div>

      {loading ? (
        <div className="bg-white rounded-lg shadow-md p-12 text-center text-gray-500">Loading…</div>
      ) : shown.length === 0 ? (
        <div className="bg-white rounded-lg shadow-md p-12 text-center">
          <Users className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500">{clients.length === 0 ? 'No clients yet — add your first.' : 'Nothing matches the filter.'}</p>
        </div>
      ) : (
        <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-600">CLIENT</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-600 hidden md:table-cell">CONTACT</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-600">STATUS</th>
                <th className="text-right px-4 py-3 text-xs font-semibold text-gray-600">ACTIONS</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {shown.map((c) => (
                <tr key={c.id} className="hover:bg-gray-50 cursor-pointer" onClick={() => open(c)}>
                  <td className="px-4 py-3">
                    <p className="font-medium text-gray-900">{c.name}</p>
                    <p className="text-xs text-gray-500">{c.client_number}{c.company ? ` · ${c.company}` : ''}</p>
                  </td>
                  <td className="px-4 py-3 hidden md:table-cell">
                    <p className="text-xs text-gray-600">{c.email}</p>
                    <p className="text-xs text-gray-400">{c.phone}</p>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium capitalize ${STATUS_STYLE[c.status]}`}>{c.status}</span>
                  </td>
                  <td className="px-4 py-3" onClick={(e) => e.stopPropagation()}>
                    <div className="flex items-center justify-end gap-1">
                      <button onClick={() => open(c)} title="Edit" className="p-1.5 rounded hover:bg-gray-100 text-gray-500"><Pencil className="w-4 h-4" /></button>
                      {c.status !== 'archived' && (
                        <button onClick={() => archive(c)} title="Archive" className="p-1.5 rounded hover:bg-gray-100 text-gray-500"><Archive className="w-4 h-4" /></button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Editor drawer */}
      {editing && (
        <div className="fixed inset-0 z-50 flex justify-end bg-black/30" onClick={() => setEditing(null)}>
          <div className="w-full max-w-md bg-white h-full overflow-y-auto p-6 shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-xl font-bold text-gray-900">{editing === 'new' ? 'Add Client' : `Edit ${editing.client_number}`}</h2>
              <button onClick={() => setEditing(null)} className="p-1.5 rounded hover:bg-gray-100 text-gray-400"><X className="w-5 h-5" /></button>
            </div>
            <form onSubmit={save} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Name *</label>
                <input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Company</label>
                <input value={form.company} onChange={(e) => setForm({ ...form, company: e.target.value })}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email *</label>
                <input required type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                <input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                <select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value as ClientStatus })}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm bg-white capitalize">
                  {(['active', 'paused', 'archived'] as const).map((s) => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Notes <span className="text-gray-400 font-normal">(internal)</span></label>
                <textarea rows={4} value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm resize-none focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
              <button type="submit" disabled={saving}
                className="w-full inline-flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white px-5 py-2.5 rounded-lg font-semibold text-sm">
                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                {editing === 'new' ? 'Create Client' : 'Save Changes'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

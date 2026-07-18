'use client'

// Add User — creates a real Firebase Auth account through the adminUsers
// Cloud Function. Granting admin here is what unlocks the back panel.

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { usersOp } from '@/lib/admin-users'
import { UserPlus, Loader2, Shield } from 'lucide-react'

export default function AddUserPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [displayName, setDisplayName] = useState('')
  const [password, setPassword] = useState('')
  const [admin, setAdmin] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true); setError('')
    const r = await usersOp('create', { email, password, displayName, admin })
    if (r.ok) { router.push('/admin/users'); return }
    setError(r.message)
    setSaving(false)
  }

  return (
    <div className="p-8 max-w-xl">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-1">Add User</h1>
        <p className="text-gray-600 text-sm">Creates a real account. Only accounts marked as admin can open this panel.</p>
      </div>

      <form onSubmit={submit} className="bg-white border border-gray-200 rounded-xl p-6 space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Email *</label>
          <input required type="email" value={email} onChange={(e) => setEmail(e.target.value)}
            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Display name</label>
          <input value={displayName} onChange={(e) => setDisplayName(e.target.value)}
            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Password * <span className="text-gray-400 font-normal">(at least 8 characters)</span></label>
          <input required type="password" minLength={8} value={password} onChange={(e) => setPassword(e.target.value)}
            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
        </div>
        <label className="flex items-start gap-3 p-3 rounded-lg border border-gray-200 cursor-pointer hover:bg-gray-50">
          <input type="checkbox" checked={admin} onChange={(e) => setAdmin(e.target.checked)} className="w-4 h-4 mt-0.5" />
          <span>
            <span className="flex items-center gap-1.5 text-sm font-semibold text-gray-900"><Shield className="w-4 h-4 text-blue-600" /> Admin access</span>
            <span className="text-xs text-gray-500">Full access to this back panel — leads, support, content, everything.</span>
          </span>
        </label>

        {error && <p className="text-sm text-red-600">{error}</p>}

        <button type="submit" disabled={saving}
          className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white px-6 py-2.5 rounded-lg font-semibold text-sm">
          {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <UserPlus className="w-4 h-4" />} Create User
        </button>
      </form>
    </div>
  )
}

'use client'

// All Users — real Firebase Auth accounts via the adminUsers Cloud Function.
// Admin badge = the custom claim that gates the whole back panel.

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useAuth } from '@/contexts/AuthContext'
import { usersOp, type ManagedUser } from '@/lib/admin-users'
import { Plus, Shield, ShieldOff, KeyRound, Trash2, Ban, CheckCircle2, UserCircle, Copy, Check } from 'lucide-react'

export default function AllUsersPage() {
  const { user: me } = useAuth()
  const [users, setUsers] = useState<ManagedUser[]>([])
  const [loading, setLoading] = useState(true)
  const [busy, setBusy] = useState<string | null>(null)
  const [notice, setNotice] = useState('')
  const [resetLink, setResetLink] = useState<{ email: string; link: string } | null>(null)
  const [copiedLink, setCopiedLink] = useState(false)

  const load = async () => {
    const r = await usersOp<{ users: ManagedUser[] }>('list')
    if (r.ok) setUsers(r.data.users)
    else setNotice(r.message)
    setLoading(false)
  }
  useEffect(() => { load() }, [])

  const run = async (uid: string, op: string, args: Record<string, unknown>, confirmMsg?: string) => {
    if (confirmMsg && !confirm(confirmMsg)) return
    setBusy(uid); setNotice('')
    const r = await usersOp(op, args)
    if (!r.ok) setNotice(r.message)
    await load()
    setBusy(null)
  }

  const makeResetLink = async (u: ManagedUser) => {
    setBusy(u.uid); setNotice('')
    const r = await usersOp<{ link: string }>('resetLink', { email: u.email })
    if (r.ok) setResetLink({ email: u.email, link: r.data.link })
    else setNotice(r.message)
    setBusy(null)
  }

  const isMe = (u: ManagedUser) => u.email.toLowerCase() === (me?.email || '').toLowerCase()

  return (
    <div className="p-8 max-w-5xl">
      <div className="mb-6 flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-1">All Users</h1>
          <p className="text-gray-600 text-sm">{users.length} account{users.length !== 1 ? 's' : ''} · admins can access this panel</p>
        </div>
        <Link href="/admin/users/new"
          className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded-lg font-semibold text-sm">
          <Plus className="w-4 h-4" /> Add User
        </Link>
      </div>

      {notice && <p className="mb-4 text-sm text-red-600">{notice}</p>}

      {resetLink && (
        <div className="mb-4 bg-blue-50 border border-blue-200 rounded-xl p-4 text-sm">
          <p className="font-semibold text-blue-900 mb-1">Password reset link for {resetLink.email}</p>
          <p className="text-blue-800 text-xs mb-2 break-all">{resetLink.link}</p>
          <div className="flex gap-2">
            <button onClick={async () => { await navigator.clipboard.writeText(resetLink.link); setCopiedLink(true); setTimeout(() => setCopiedLink(false), 1500) }}
              className="inline-flex items-center gap-1 bg-blue-600 text-white px-3 py-1.5 rounded text-xs font-semibold">
              {copiedLink ? <><Check className="w-3 h-3" /> Copied</> : <><Copy className="w-3 h-3" /> Copy link</>}
            </button>
            <button onClick={() => setResetLink(null)} className="text-xs text-blue-700 underline">Dismiss</button>
          </div>
          <p className="text-[11px] text-blue-600 mt-2">Send it to the user however you like — it lets them set a new password.</p>
        </div>
      )}

      {loading ? (
        <div className="bg-white rounded-lg shadow-md p-12 text-center text-gray-500">Loading…</div>
      ) : users.length === 0 ? (
        <div className="bg-white rounded-lg shadow-md p-12 text-center">
          <UserCircle className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500">{notice || 'No accounts found.'}</p>
        </div>
      ) : (
        <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-600">USER</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-600">ROLE</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-600 hidden md:table-cell">LAST SIGN-IN</th>
                <th className="text-right px-4 py-3 text-xs font-semibold text-gray-600">ACTIONS</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {users.map((u) => (
                <tr key={u.uid} className={`hover:bg-gray-50 ${u.disabled ? 'opacity-50' : ''}`}>
                  <td className="px-4 py-3">
                    <p className="font-medium text-gray-900">{u.displayName || u.email}{isMe(u) && <span className="ml-2 text-[11px] text-blue-600 font-semibold">(you)</span>}</p>
                    <p className="text-xs text-gray-500">{u.email}{u.disabled && <span className="ml-2 text-red-500 font-semibold">disabled</span>}</p>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full font-medium ${u.admin ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-600'}`}>
                      {u.admin ? <Shield className="w-3 h-3" /> : null}{u.admin ? 'Admin' : 'No access'}
                    </span>
                  </td>
                  <td className="px-4 py-3 hidden md:table-cell text-xs text-gray-500">
                    {u.lastSignIn ? new Date(u.lastSignIn).toLocaleDateString() : 'never'}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-1">
                      <button disabled={busy === u.uid} title={u.admin ? 'Remove admin access' : 'Grant admin access'}
                        onClick={() => run(u.uid, 'setAdmin', { uid: u.uid, admin: !u.admin },
                          u.admin ? `Remove admin access from ${u.email}?` : `Grant ${u.email} full admin access?`)}
                        className="p-1.5 rounded hover:bg-gray-100 text-gray-500 disabled:opacity-40">
                        {u.admin ? <ShieldOff className="w-4 h-4" /> : <Shield className="w-4 h-4" />}
                      </button>
                      <button disabled={busy === u.uid} title="Password reset link" onClick={() => makeResetLink(u)}
                        className="p-1.5 rounded hover:bg-gray-100 text-gray-500 disabled:opacity-40"><KeyRound className="w-4 h-4" /></button>
                      {!isMe(u) && (
                        <>
                          <button disabled={busy === u.uid} title={u.disabled ? 'Re-enable account' : 'Disable account'}
                            onClick={() => run(u.uid, 'setDisabled', { uid: u.uid, disabled: !u.disabled },
                              u.disabled ? undefined : `Disable ${u.email}? They will not be able to sign in.`)}
                            className="p-1.5 rounded hover:bg-gray-100 text-gray-500 disabled:opacity-40">
                            {u.disabled ? <CheckCircle2 className="w-4 h-4" /> : <Ban className="w-4 h-4" />}
                          </button>
                          <button disabled={busy === u.uid} title="Delete account"
                            onClick={() => run(u.uid, 'delete', { uid: u.uid }, `Permanently delete ${u.email}? This cannot be undone.`)}
                            className="p-1.5 rounded hover:bg-red-50 text-red-400 hover:text-red-600 disabled:opacity-40"><Trash2 className="w-4 h-4" /></button>
                        </>
                      )}
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

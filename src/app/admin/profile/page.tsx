'use client'

// Profile — the signed-in admin's own account: display name and password.

import { useState, useEffect } from 'react'
import { updateProfile, sendPasswordResetEmail } from 'firebase/auth'
import { getFirebaseAuth } from '@/lib/firebase'
import { useAuth } from '@/contexts/AuthContext'
import { UserCircle, Save, KeyRound, Loader2, LogOut } from 'lucide-react'

export default function ProfilePage() {
  const { user, signOut } = useAuth()
  const [displayName, setDisplayName] = useState('')
  const [saving, setSaving] = useState(false)
  const [sendingReset, setSendingReset] = useState(false)
  const [notice, setNotice] = useState('')

  useEffect(() => {
    setDisplayName(getFirebaseAuth().currentUser?.displayName || '')
  }, [user])

  const saveName = async (e: React.FormEvent) => {
    e.preventDefault()
    const current = getFirebaseAuth().currentUser
    if (!current) return
    setSaving(true); setNotice('')
    try {
      await updateProfile(current, { displayName: displayName.trim() })
      setNotice('Name updated.')
    } catch { setNotice('Could not update your name — please try again.') }
    setSaving(false)
  }

  const sendReset = async () => {
    const email = user?.email
    if (!email) return
    setSendingReset(true); setNotice('')
    try {
      await sendPasswordResetEmail(getFirebaseAuth(), email)
      setNotice(`Password reset email sent to ${email} — open it and follow the link.`)
    } catch { setNotice('Could not send the reset email — please try again.') }
    setSendingReset(false)
  }

  return (
    <div className="p-8 max-w-xl">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-1">Profile</h1>
        <p className="text-gray-600 text-sm">Your own account.</p>
      </div>

      {notice && <p className="mb-4 text-sm text-gray-700">{notice}</p>}

      <div className="bg-white border border-gray-200 rounded-xl p-6 mb-4">
        <div className="flex items-center gap-4 mb-5">
          <div className="w-14 h-14 bg-blue-100 rounded-full flex items-center justify-center">
            <UserCircle className="w-8 h-8 text-blue-600" />
          </div>
          <div>
            <p className="font-bold text-gray-900">{user?.email}</p>
            <p className="text-xs text-blue-600 font-semibold">Administrator</p>
          </div>
        </div>

        <form onSubmit={saveName} className="space-y-3">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Display name</label>
            <input value={displayName} onChange={(e) => setDisplayName(e.target.value)}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
          <button type="submit" disabled={saving}
            className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white px-5 py-2 rounded-lg font-semibold text-sm">
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />} Save
          </button>
        </form>
      </div>

      <div className="bg-white border border-gray-200 rounded-xl p-6 mb-4">
        <h3 className="font-semibold text-gray-900 mb-1 flex items-center gap-2"><KeyRound className="w-4 h-4 text-gray-500" /> Change password</h3>
        <p className="text-xs text-gray-500 mb-3">For safety, password changes go through an email link.</p>
        <button onClick={sendReset} disabled={sendingReset}
          className="inline-flex items-center gap-2 border border-gray-300 hover:bg-gray-50 disabled:opacity-50 text-gray-700 px-4 py-2 rounded-lg font-semibold text-sm">
          {sendingReset ? <Loader2 className="w-4 h-4 animate-spin" /> : <KeyRound className="w-4 h-4" />}
          Email me a reset link
        </button>
      </div>

      <button onClick={() => signOut()}
        className="inline-flex items-center gap-2 text-sm font-semibold text-red-600 hover:text-red-700">
        <LogOut className="w-4 h-4" /> Sign out
      </button>
    </div>
  )
}

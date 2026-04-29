'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { useClientAuth } from '@/contexts/ClientAuthContext'
import { useToast } from '@/contexts/ToastContext'
import { useConfirm } from '@/contexts/ConfirmContext'
import { User, Lock, Key, Plus, Trash2, Eye, EyeOff, Loader2 } from 'lucide-react'

interface Credential {
  id: string
  label: string
  username: string | null
  password_encrypted: string | null
  url: string | null
  notes: string | null
}

export default function SettingsPage() {
  const { client } = useClientAuth()
  const { showToast } = useToast()
  const { showConfirm } = useConfirm()
  const [credentials, setCredentials] = useState<Credential[]>([])
  const [showPasswords, setShowPasswords] = useState<Set<string>>(new Set())
  const [newCred, setNewCred] = useState({ label: '', username: '', password: '', url: '', notes: '' })
  const [showNewCred, setShowNewCred] = useState(false)
  const [savingCred, setSavingCred] = useState(false)

  useEffect(() => {
    if (client) fetchCredentials()
  }, [client])

  const fetchCredentials = async () => {
    const { data } = await supabase.from('client_credentials').select('*').eq('client_id', client!.id).order('created_at')
    setCredentials(data || [])
  }

  const saveCredential = async () => {
    if (!newCred.label.trim()) { showToast('Label is required', 'warning'); return }
    setSavingCred(true)
    try {
      // Encrypt password via server-side API route
      let encryptedPass: string | null = null
      if (newCred.password.trim()) {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}?action=vault-encrypt`, {
          method: 'POST', headers: { 'Content-Type': 'application/json' },
          credentials: 'include', body: JSON.stringify({ value: newCred.password.trim() }),
        })
        const data = await res.json()
        encryptedPass = data.result
      }
      await supabase.from('client_credentials').insert([{
        client_id: client!.id,
        label: newCred.label.trim(),
        username: newCred.username.trim() || null,
        password_encrypted: encryptedPass,
        url: newCred.url.trim() || null,
        notes: newCred.notes.trim() || null,
      }])
      setNewCred({ label: '', username: '', password: '', url: '', notes: '' })
      setShowNewCred(false)
      fetchCredentials()
      showToast('Credential saved and encrypted', 'success')
    } catch { showToast('Failed to save', 'error') }
    setSavingCred(false)
  }

  const deleteCredential = async (id: string, label: string) => {
    const ok = await showConfirm(`Delete "${label}" from the vault?`, { destructive: true })
    if (!ok) return
    await supabase.from('client_credentials').delete().eq('id', id)
    setCredentials(prev => prev.filter(c => c.id !== id))
    showToast('Credential removed', 'success')
  }

  const [decryptedPasswords, setDecryptedPasswords] = useState<Record<string, string>>({})

  const toggleShow = async (id: string, encryptedPass: string | null) => {
    const s = new Set(showPasswords)
    if (s.has(id)) {
      s.delete(id)
    } else {
      s.add(id)
      // Decrypt on first reveal
      if (encryptedPass && !decryptedPasswords[id]) {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}?action=vault-decrypt`, {
          method: 'POST', headers: { 'Content-Type': 'application/json' },
          credentials: 'include', body: JSON.stringify({ value: encryptedPass }),
        })
        const data = await res.json()
        setDecryptedPasswords(prev => ({ ...prev, [id]: data.result }))
      }
    }
    setShowPasswords(s)
  }

  return (
    <div className="p-6 lg:p-8 max-w-3xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Settings</h1>

      {/* Profile */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
        <div className="flex items-center gap-3 mb-5">
          <User className="w-5 h-5 text-gray-500" />
          <h2 className="font-bold text-gray-900">Profile Information</h2>
        </div>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div><p className="text-gray-400 mb-1">Client ID</p><p className="font-semibold text-gray-800">{client?.client_id}</p></div>
          <div><p className="text-gray-400 mb-1">Name</p><p className="font-semibold text-gray-800">{client?.name}</p></div>
          <div><p className="text-gray-400 mb-1">Email</p><p className="font-semibold text-gray-800">{client?.email}</p></div>
          <div><p className="text-gray-400 mb-1">Phone</p><p className="font-semibold text-gray-800">{client?.phone || '—'}</p></div>
          <div className="col-span-2"><p className="text-gray-400 mb-1">Business</p><p className="font-semibold text-gray-800">{client?.business_name || '—'}</p></div>
        </div>
        <p className="text-xs text-gray-400 mt-4">To update your profile details, please contact support@ccoms.ph</p>
      </div>

      {/* Credentials Vault */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-3">
            <Key className="w-5 h-5 text-gray-500" />
            <div>
              <h2 className="font-bold text-gray-900">Credentials Vault</h2>
              <p className="text-xs text-gray-400 mt-0.5">Securely share your WP/FTP/hosting logins with our team</p>
            </div>
          </div>
          <button onClick={() => setShowNewCred(v => !v)}
            className="flex items-center gap-1.5 px-3 py-2 bg-blue-600 text-white rounded-xl text-sm font-semibold hover:bg-blue-700 transition-colors">
            <Plus className="w-4 h-4" /> Add
          </button>
        </div>

        {showNewCred && (
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 space-y-3 mb-5">
            <h3 className="font-semibold text-gray-800 text-sm">Add New Credential</h3>
            <input value={newCred.label} onChange={e => setNewCred(f => ({ ...f, label: e.target.value }))}
              placeholder="Label (e.g. WordPress Admin) *" className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
            <div className="grid grid-cols-2 gap-3">
              <input value={newCred.username} onChange={e => setNewCred(f => ({ ...f, username: e.target.value }))}
                placeholder="Username" className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
              <input type="password" value={newCred.password} onChange={e => setNewCred(f => ({ ...f, password: e.target.value }))}
                placeholder="Password" className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
            <input value={newCred.url} onChange={e => setNewCred(f => ({ ...f, url: e.target.value }))}
              placeholder="URL (e.g. https://site.com/wp-admin)" className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
            <textarea value={newCred.notes} onChange={e => setNewCred(f => ({ ...f, notes: e.target.value }))}
              placeholder="Notes (optional)" rows={2} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none" />
            <div className="flex gap-2">
              <button onClick={saveCredential} disabled={savingCred}
                className="flex items-center gap-1.5 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-semibold hover:bg-blue-700 transition-colors disabled:opacity-50">
                {savingCred ? <Loader2 className="w-4 h-4 animate-spin" /> : null} Save
              </button>
              <button onClick={() => setShowNewCred(false)} className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg text-sm hover:bg-gray-50">Cancel</button>
            </div>
          </div>
        )}

        {credentials.length === 0 ? (
          <div className="text-center py-8">
            <Lock className="w-10 h-10 text-gray-300 mx-auto mb-2" />
            <p className="text-sm text-gray-500">No credentials stored yet</p>
            <p className="text-xs text-gray-400 mt-1">Add your WordPress, FTP, or hosting logins so our team can access them securely</p>
          </div>
        ) : (
          <div className="space-y-3">
            {credentials.map(cred => (
              <div key={cred.id} className="flex items-start gap-3 p-4 bg-gray-50 rounded-xl">
                <Lock className="w-4 h-4 text-gray-400 mt-0.5 shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-gray-800 text-sm">{cred.label}</p>
                  {cred.url && <a href={cred.url} target="_blank" rel="noopener noreferrer" className="text-xs text-blue-600 hover:underline truncate block">{cred.url}</a>}
                  {cred.username && <p className="text-xs text-gray-600 mt-1">User: {cred.username}</p>}
                  {cred.password_encrypted && (
                    <div className="flex items-center gap-2 mt-1">
                      <p className="text-xs text-gray-600">Pass: {showPasswords.has(cred.id) ? (decryptedPasswords[cred.id] || '•••decrypting•••') : '••••••••'}</p>
                      <button onClick={() => toggleShow(cred.id, cred.password_encrypted)} className="text-gray-400 hover:text-gray-600">
                        {showPasswords.has(cred.id) ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                  )}
                  {cred.notes && <p className="text-xs text-gray-500 mt-1 italic">{cred.notes}</p>}
                </div>
                <button onClick={() => deleteCredential(cred.id, cred.label)}
                  className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors shrink-0">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        )}

        <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-xl text-xs text-yellow-700">
          🔒 Credentials are stored securely and only accessible to the Core Conversion team working on your project.
        </div>
      </div>
    </div>
  )
}

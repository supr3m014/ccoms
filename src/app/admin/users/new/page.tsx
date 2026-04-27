'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Save, ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import { useToast } from '@/contexts/ToastContext'

export default function NewUserPage() {
  const router = useRouter()
  const { showToast } = useToast()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [role, setRole] = useState('admin')
  const [saving, setSaving] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!email || !password) {
      showToast('Please fill in all required fields', 'warning')
      return
    }

    if (password.length < 6) {
      showToast('Password must be at least 6 characters', 'warning')
      return
    }

    if (!email.includes('@')) {
      showToast('Please enter a valid email address', 'warning')
      return
    }

    setSaving(true)

    try {
      // Send to PHP bridge sign-up endpoint which handles bcrypt hashing
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}?action=sign-up`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          email: email.toLowerCase(),
          password,
          role
        })
      })

      const data = await response.json()

      if (!response.ok || data.error) {
        throw new Error(data.error?.message || data.error || 'Failed to create user')
      }

      showToast('User created successfully!', 'success')
      router.push('/admin/users')
    } catch (error: any) {
      console.error('Error creating user:', error)
      showToast(error.message || 'Failed to create user', 'error')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="p-8">
      <Link
        href="/admin/users"
        className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 mb-4"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Users
      </Link>
      <h1 className="text-3xl font-bold text-gray-900 mb-2">Add New User</h1>
      <p className="text-gray-600 mb-8">Create a new admin user account</p>

      <div className="max-w-2xl">
        <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-md p-6">
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email Address <span className="text-red-500">*</span>
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="user@example.com"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Password <span className="text-red-500">*</span>
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Minimum 6 characters"
              />
              <p className="text-xs text-gray-500 mt-1">Minimum 6 characters, will be securely hashed</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Role
              </label>
              <select
                value={role}
                onChange={(e) => setRole(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="admin">Administrator</option>
                <option value="editor">Editor</option>
                <option value="author">Author</option>
              </select>
              <p className="text-xs text-gray-500 mt-1">Select the role for this user</p>
            </div>

            <div className="pt-6 border-t border-gray-200 flex gap-2">
              <button
                type="submit"
                disabled={saving}
                className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Save className="w-4 h-4" />
                {saving ? 'Creating...' : 'Create User'}
              </button>
              <Link
                href="/admin/users"
                className="px-6 py-2 border border-gray-300 rounded-lg font-semibold hover:bg-gray-50 transition-colors"
              >
                Cancel
              </Link>
            </div>
          </div>
        </form>
      </div>
    </div>
  )
}

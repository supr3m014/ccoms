'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { Plus, Edit2, Trash2, Copy, ArrowLeft, Save, Loader2 } from 'lucide-react'
import Link from 'next/link'
import { useToast } from '@/contexts/ToastContext'
import { useConfirm } from '@/contexts/ConfirmContext'

interface Macro {
  id: string
  title: string
  content: string
  shorthand: string
}

const SETTINGS_KEY = 'support_macros'

export default function ResponseMacrosPage() {
  const { showToast } = useToast()
  const { showConfirm } = useConfirm()
  const [macros, setMacros] = useState<Macro[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState({ title: '', content: '', shorthand: '' })
  const [editing, setEditing] = useState<string | null>(null)

  useEffect(() => { fetchMacros() }, [])

  const fetchMacros = async () => {
    try {
      const { data, error } = await supabase
        .from('site_settings')
        .select('value')
        .eq('key', SETTINGS_KEY)
        .maybeSingle()

      if (error) throw error

      if (data?.value) {
        const list = Array.isArray(data.value) ? data.value : []
        setMacros(list)
      } else {
        // Seed defaults
        const defaults: Macro[] = [
          { id: '1', title: 'Thank You for Contacting', shorthand: '/thanks', content: 'Thank you for reaching out to Core Conversion! We appreciate your interest and will get back to you as soon as possible.' },
          { id: '2', title: 'Demo Request Follow-up', shorthand: '/demo', content: "We'd love to schedule a demo with you. Please let us know your availability and preferred time zone." },
          { id: '3', title: 'Pricing Inquiry', shorthand: '/pricing', content: 'We offer flexible pricing plans tailored to your business needs. Please contact our sales team for a custom quote.' },
        ]
        setMacros(defaults)
        await persistMacros(defaults)
      }
    } catch (e) {
      console.error('fetchMacros', e)
    } finally {
      setLoading(false)
    }
  }

  const persistMacros = async (list: Macro[]) => {
    await supabase
      .from('site_settings')
      .upsert({ key: SETTINGS_KEY, value: list }, { onConflict: 'key' })
  }

  const handleSave = async () => {
    if (!form.title.trim() || !form.content.trim() || !form.shorthand.trim()) {
      showToast('Please fill in all fields', 'warning'); return
    }
    setSaving(true)

    let updated: Macro[]
    if (editing) {
      updated = macros.map(m => m.id === editing ? { ...m, ...form } : m)
    } else {
      updated = [...macros, { id: Date.now().toString(), ...form }]
    }

    try {
      await persistMacros(updated)
      setMacros(updated)
      setForm({ title: '', content: '', shorthand: '' })
      setEditing(null)
      showToast(editing ? 'Macro updated' : 'Macro added', 'success')
    } catch {
      showToast('Failed to save macro', 'error')
    }
    setSaving(false)
  }

  const handleDelete = async (id: string) => {
    const ok = await showConfirm('Delete this macro?', { destructive: true })
    if (!ok) return
    const updated = macros.filter(m => m.id !== id)
    try {
      await persistMacros(updated)
      setMacros(updated)
    } catch {
      showToast('Failed to delete', 'error')
    }
  }

  const handleEdit = (macro: Macro) => {
    setForm({ title: macro.title, content: macro.content, shorthand: macro.shorthand })
    setEditing(macro.id)
  }

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text)
    showToast('Copied to clipboard!', 'success')
  }

  const cancelEdit = () => {
    setEditing(null)
    setForm({ title: '', content: '', shorthand: '' })
  }

  return (
    <div className="p-8">
      <Link href="/admin/support" className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 mb-4">
        <ArrowLeft className="w-4 h-4" />Back to Support
      </Link>
      <h1 className="text-3xl font-bold text-gray-900 mb-2">Response Macros</h1>
      <p className="text-gray-600 mb-8">Pre-written reply templates — saved to database</p>

      <div className="grid grid-cols-3 gap-8">
        {/* Form */}
        <div className="col-span-1">
          <div className="bg-white rounded-xl shadow-md p-6 sticky top-6">
            <h2 className="text-lg font-bold text-gray-900 mb-4">{editing ? 'Edit Macro' : 'New Macro'}</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Title <span className="text-red-500">*</span></label>
                <input type="text" value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g. Thank You" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Shorthand <span className="text-red-500">*</span></label>
                <input type="text" value={form.shorthand} onChange={e => setForm(f => ({ ...f, shorthand: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono"
                  placeholder="/thanks" />
                <p className="text-xs text-gray-400 mt-1">Type this shorthand in chat to insert</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Content <span className="text-red-500">*</span></label>
                <textarea value={form.content} onChange={e => setForm(f => ({ ...f, content: e.target.value }))} rows={5}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                  placeholder="Enter the response text..." />
              </div>
              <div className="flex gap-2">
                <button onClick={handleSave} disabled={saving}
                  className="flex-1 flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white px-4 py-2 rounded-lg text-sm font-semibold transition-colors">
                  {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                  {editing ? 'Update' : 'Save Macro'}
                </button>
                {editing && (
                  <button onClick={cancelEdit} className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg text-sm font-semibold hover:bg-gray-50 transition-colors">
                    Cancel
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Macro list */}
        <div className="col-span-2 space-y-4">
          {loading ? (
            <div className="bg-white rounded-xl shadow-md p-12 text-center text-gray-500">Loading macros...</div>
          ) : macros.length === 0 ? (
            <div className="bg-white rounded-xl shadow-md p-12 text-center text-gray-500">No macros yet. Create your first one.</div>
          ) : macros.map(macro => (
            <div key={macro.id} className="bg-white rounded-xl shadow-md p-5">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h3 className="font-bold text-gray-900">{macro.title}</h3>
                  <code className="text-xs text-blue-600 bg-blue-50 px-2 py-0.5 rounded mt-0.5 inline-block">{macro.shorthand}</code>
                </div>
                <div className="flex gap-1">
                  <button onClick={() => handleCopy(macro.content)} title="Copy text"
                    className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
                    <Copy className="w-4 h-4" />
                  </button>
                  <button onClick={() => handleEdit(macro)} title="Edit"
                    className="p-2 text-gray-500 hover:text-yellow-600 hover:bg-yellow-50 rounded-lg transition-colors">
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button onClick={() => handleDelete(macro.id)} title="Delete"
                    className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
              <p className="text-sm text-gray-600 leading-relaxed whitespace-pre-wrap">{macro.content}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

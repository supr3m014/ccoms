'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { Plus, Save, Trash2, Zap } from 'lucide-react'

interface Macro { id: string; title: string; shorthand: string; content: string; created_at: string }

export default function MacrosPage() {
  const [macros, setMacros] = useState<Macro[]>([])
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState<Macro | null>(null)
  const [saving, setSaving] = useState(false)
  const [title, setTitle] = useState('')
  const [shorthand, setShorthand] = useState('')
  const [content, setContent] = useState('')

  const fetchMacros = async () => {
    const { data } = await supabase.from('site_settings').select('*').eq('key', 'chat_macros').maybeSingle()
    const list: Macro[] = data?.value ? JSON.parse(JSON.stringify(data.value)) : []
    setMacros(Array.isArray(list) ? list : [])
    setLoading(false)
  }
  useEffect(() => { fetchMacros() }, [])

  const saveMacros = async (list: Macro[]) => {
    await supabase.from('site_settings').upsert({ key: 'chat_macros', value: list as any }, { onConflict: 'key' })
  }

  const startNew = () => {
    setEditing(null); setTitle(''); setShorthand(''); setContent('')
  }

  const selectMacro = (m: Macro) => {
    setEditing(m); setTitle(m.title); setShorthand(m.shorthand); setContent(m.content)
  }

  const save = async (e: React.FormEvent) => {
    e.preventDefault(); setSaving(true)
    let updated: Macro[]
    if (editing) {
      updated = macros.map(m => m.id === editing.id ? { ...m, title, shorthand: shorthand.startsWith('/') ? shorthand : '/' + shorthand, content } : m)
    } else {
      const id = Date.now().toString()
      updated = [...macros, { id, title, shorthand: shorthand.startsWith('/') ? shorthand : '/' + shorthand, content, created_at: new Date().toISOString() }]
    }
    await saveMacros(updated)
    setMacros(updated)
    startNew()
    setSaving(false)
  }

  const deleteMacro = async (id: string) => {
    if (!confirm('Delete this macro?')) return
    const updated = macros.filter(m => m.id !== id)
    await saveMacros(updated)
    setMacros(updated)
    if (editing?.id === id) startNew()
  }

  return (
    <div className="p-6 max-w-4xl">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Response Macros</h1>
          <p className="text-sm text-gray-500 mt-0.5">Saved reply templates. Type the shorthand in the chat to insert.</p>
        </div>
        <button onClick={startNew} className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-xl text-sm font-semibold transition-colors">
          <Plus className="w-4 h-4" /> New Macro
        </button>
      </div>

      <div className="flex gap-6">
        {/* Macro list */}
        <div className="w-60 shrink-0 space-y-1">
          {loading && <p className="text-gray-400 text-sm py-4 text-center">Loading…</p>}
          {macros.map(m => (
            <div
              key={m.id}
              onClick={() => selectMacro(m)}
              className={`p-3 rounded-xl cursor-pointer border transition-colors ${editing?.id === m.id ? 'bg-blue-50 border-blue-200' : 'bg-white border-gray-200 hover:bg-gray-50'}`}
            >
              <div className="flex items-center justify-between">
                <p className="font-semibold text-sm text-gray-900 truncate">{m.title}</p>
                <button onClick={e => { e.stopPropagation(); deleteMacro(m.id) }} className="p-1 text-red-400 hover:text-red-600 shrink-0">
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
              <p className="text-xs font-mono text-blue-600 mt-0.5">{m.shorthand}</p>
            </div>
          ))}
          {!loading && macros.length === 0 && <p className="text-gray-400 text-xs text-center py-4">No macros yet</p>}
        </div>

        {/* Editor */}
        <div className="flex-1 bg-white border border-gray-200 rounded-xl p-5">
          <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Zap className="w-4 h-4 text-blue-600" />
            {editing ? 'Edit Macro' : 'New Macro'}
          </h3>
          <form onSubmit={save} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">Title</label>
              <input required value={title} onChange={e => setTitle(e.target.value)} placeholder="e.g. Thank You Reply" className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">Shorthand <span className="text-gray-400 font-normal">(type this in chat to trigger)</span></label>
              <input required value={shorthand} onChange={e => setShorthand(e.target.value)} placeholder="/thanks" className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">Content</label>
              <textarea required value={content} onChange={e => setContent(e.target.value)} rows={5} placeholder="The full reply text…" className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none" />
            </div>
            <div className="flex gap-2">
              <button type="submit" disabled={saving} className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white px-4 py-2 rounded-xl text-sm font-semibold">
                <Save className="w-4 h-4" />{saving ? 'Saving…' : editing ? 'Update Macro' : 'Save Macro'}
              </button>
              {editing && <button type="button" onClick={startNew} className="px-4 py-2 border border-gray-200 rounded-xl text-sm text-gray-600 hover:bg-gray-50">New</button>}
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}

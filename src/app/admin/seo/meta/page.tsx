'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { Search, Save } from 'lucide-react'
import { useToast } from '@/contexts/ToastContext'

interface MetaItem {
  id: string
  title: string
  meta_title: string | null
  meta_description: string | null
  type: 'page' | 'post'
  published_at: string | null
  updated_at: string
  slug: string
}

export default function SEOMetaPage() {
  const { showToast } = useToast()
  const [items, setItems] = useState<MetaItem[]>([])
  const [filteredItems, setFilteredItems] = useState<MetaItem[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all')
  const [searchTerm, setSearchTerm] = useState('')
  const [editedItems, setEditedItems] = useState<Record<string, { meta_title: string; meta_description: string }>>({})
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    fetchAllMeta()
  }, [])

  useEffect(() => {
    filterAndSearch()
  }, [items, filter, searchTerm])

  const fetchAllMeta = async () => {
    try {
      const [pagesResult, postsResult] = await Promise.all([
        supabase.from('pages').select('id, title, slug, meta_title, meta_description, published_at, updated_at').order('updated_at', { ascending: false }),
        supabase.from('posts').select('id, title, slug, meta_title, meta_description, published_at, updated_at').order('updated_at', { ascending: false })
      ])

      const pagesData = (pagesResult.data || []).map(p => ({ ...p, type: 'page' as const }))
      const postsData = (postsResult.data || []).map(p => ({ ...p, type: 'post' as const }))

      const allItems = [...pagesData, ...postsData].sort((a, b) =>
        new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime()
      )

      setItems(allItems)
    } catch (error) {
      console.error('Error fetching meta data:', error)
    } finally {
      setLoading(false)
    }
  }

  const filterAndSearch = () => {
    let filtered = items

    if (filter !== 'all') {
      filtered = filtered.filter(item => item.type === filter)
    }

    if (searchTerm) {
      filtered = filtered.filter(item =>
        item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.slug.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    setFilteredItems(filtered)
  }

  const handleMetaChange = (id: string, field: 'meta_title' | 'meta_description', value: string) => {
    setEditedItems(prev => ({
      ...prev,
      [id]: {
        ...prev[id],
        [field]: value
      }
    }))
  }

  const handleSaveRow = async (item: MetaItem) => {
    const edited = editedItems[item.id]
    if (!edited) return

    setSaving(true)
    try {
      const table = item.type === 'page' ? 'pages' : 'posts'
      const { error } = await supabase
        .from(table)
        .update({
          meta_title: edited.meta_title,
          meta_description: edited.meta_description,
          updated_at: new Date().toISOString()
        })
        .eq('id', item.id)

      if (error) throw error

      setItems(items.map(i => i.id === item.id ? {
        ...i,
        meta_title: edited.meta_title,
        meta_description: edited.meta_description,
        updated_at: new Date().toISOString()
      } : i))

      const newEdited = { ...editedItems }
      delete newEdited[item.id]
      setEditedItems(newEdited)

      showToast('Meta data saved successfully!', 'success')
    } catch (error) {
      console.error('Error saving meta:', error)
      showToast('Failed to save meta data', 'error')
    } finally {
      setSaving(false)
    }
  }

  const handleSaveAll = async () => {
    if (Object.keys(editedItems).length === 0) {
      showToast('No changes to save', 'warning')
      return
    }

    setSaving(true)
    try {
      const updatePromises = Object.entries(editedItems).map(([id, data]) => {
        const item = items.find(i => i.id === id)
        if (!item) return Promise.resolve()

        const table = item.type === 'page' ? 'pages' : 'posts'
        return supabase
          .from(table)
          .update({
            meta_title: data.meta_title,
            meta_description: data.meta_description,
            updated_at: new Date().toISOString()
          })
          .eq('id', id)
      })

      await Promise.all(updatePromises)

      setItems(items.map(item => {
        if (editedItems[item.id]) {
          return {
            ...item,
            meta_title: editedItems[item.id].meta_title,
            meta_description: editedItems[item.id].meta_description,
            updated_at: new Date().toISOString()
          }
        }
        return item
      }))

      setEditedItems({})
      showToast('All changes saved successfully!', 'success')
    } catch (error) {
      console.error('Error saving all meta:', error)
      showToast('Failed to save changes', 'error')
    } finally {
      setSaving(false)
    }
  }

  const getDisplayValue = (item: MetaItem, field: 'meta_title' | 'meta_description') => {
    if (editedItems[item.id]?.[field] !== undefined) {
      return editedItems[item.id][field]
    }
    return item[field] || ''
  }

  const formatDate = (date: string | null) => {
    if (!date) return '-'
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Meta Management</h1>
        <p className="text-gray-600">Manage meta titles and descriptions for all pages and posts</p>
      </div>

      <div className="bg-white rounded-lg shadow-md">
        <div className="p-4 border-b border-gray-200 flex items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded text-sm"
            >
              <option value="all">All Types</option>
              <option value="page">Pages</option>
              <option value="post">Posts</option>
            </select>
          </div>
          <div className="flex items-center gap-2">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by title or slug..."
              className="px-3 py-2 border border-gray-300 rounded text-sm w-64"
            />
            <button className="p-2 border border-gray-300 rounded hover:bg-gray-50">
              <Search className="w-4 h-4" />
            </button>
          </div>
        </div>

        {loading ? (
          <div className="p-12 text-center text-gray-500">Loading meta data...</div>
        ) : filteredItems.length === 0 ? (
          <div className="p-12 text-center text-gray-500">No items found</div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-1/5">
                      Title
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-1/4">
                      Meta Title
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-1/4">
                      Meta Description
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-24">
                      Published
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-24">
                      Last Updated
                    </th>
                    <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider w-20">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {filteredItems.map((item) => (
                    <tr key={item.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3">
                        <div>
                          <div className="font-medium text-gray-900 text-sm">{item.title}</div>
                          <div className="text-xs text-gray-500">
                            {item.type === 'page' ? 'Page' : 'Post'} • /{item.slug}
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <input
                          type="text"
                          value={getDisplayValue(item, 'meta_title')}
                          onChange={(e) => handleMetaChange(item.id, 'meta_title', e.target.value)}
                          placeholder={item.title}
                          className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                        />
                      </td>
                      <td className="px-4 py-3">
                        <textarea
                          value={getDisplayValue(item, 'meta_description')}
                          onChange={(e) => handleMetaChange(item.id, 'meta_description', e.target.value)}
                          placeholder="Enter meta description..."
                          rows={2}
                          className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 resize-none"
                        />
                      </td>
                      <td className="px-4 py-3 text-xs text-gray-600">
                        {formatDate(item.published_at)}
                      </td>
                      <td className="px-4 py-3 text-xs text-gray-600">
                        {formatDate(item.updated_at)}
                      </td>
                      <td className="px-4 py-3 text-center">
                        <button
                          onClick={() => handleSaveRow(item)}
                          disabled={!editedItems[item.id] || saving}
                          className="px-3 py-1 text-sm bg-blue-600 hover:bg-blue-700 text-white rounded disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                          Save
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="p-4 border-t border-gray-200 flex justify-end">
              <button
                onClick={handleSaveAll}
                disabled={Object.keys(editedItems).length === 0 || saving}
                className="flex items-center gap-2 px-6 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Save className="w-4 h-4" />
                Save All Changes ({Object.keys(editedItems).length})
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  )
}

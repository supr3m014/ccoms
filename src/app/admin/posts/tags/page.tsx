'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { Search } from 'lucide-react'
import { useToast } from '@/contexts/ToastContext'
import { useConfirm } from '@/contexts/ConfirmContext'

interface TagType {
  id: string
  name: string
  slug: string
  created_at: string
}

export default function PostTagsPage() {
  const { showToast } = useToast()
  const { showConfirm } = useConfirm()
  const [tags, setTags] = useState<TagType[]>([])
  const [loading, setLoading] = useState(true)
  const [name, setName] = useState('')
  const [slug, setSlug] = useState('')
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedTags, setSelectedTags] = useState<string[]>([])

  useEffect(() => {
    fetchTags()
  }, [])

  const fetchTags = async () => {
    try {
      const { data, error } = await supabase
        .from('tags')
        .select('*')
        .eq('type', 'post')
        .order('name')

      if (error) throw error
      setTags(data || [])
    } catch (error) {
      console.error('Error fetching tags:', error)
    } finally {
      setLoading(false)
    }
  }

  const generateSlug = (text: string) => {
    return text
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-+|-+$/g, '')
  }

  const handleNameChange = (value: string) => {
    setName(value)
    if (!slug || slug === generateSlug(name)) {
      setSlug(generateSlug(value))
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!name.trim()) {
      showToast('Please enter a tag name', 'warning')
      return
    }

    try {
      const tagData = {
        name: name.trim(),
        slug: slug || generateSlug(name),
        type: 'post'
      }

      const { error } = await supabase
        .from('tags')
        .insert([tagData])

      if (error) throw error

      setName('')
      setSlug('')
      fetchTags()
      showToast('Tag added successfully!', 'success')
    } catch (error: any) {
      console.error('Error saving tag:', error)
      showToast(error.message || 'Failed to save tag', 'error')
    }
  }

  const handleDelete = async (id: string) => {
    const ok = await showConfirm('Are you sure you want to delete this tag?', { destructive: true })
    if (!ok) return

    try {
      const { error } = await supabase
        .from('tags')
        .delete()
        .eq('id', id)

      if (error) throw error
      fetchTags()
      setSelectedTags(selectedTags.filter(tagId => tagId !== id))
    } catch (error) {
      console.error('Error deleting tag:', error)
      showToast('Failed to delete tag', 'error')
    }
  }

  const handleBulkDelete = async () => {
    if (selectedTags.length === 0) {
      showToast('Please select tags to delete', 'warning')
      return
    }

    const ok = await showConfirm(`Are you sure you want to delete ${selectedTags.length} tag(s)?`, { destructive: true })
    if (!ok) return

    try {
      const { error } = await supabase
        .from('tags')
        .delete()
        .in('id', selectedTags)

      if (error) throw error
      fetchTags()
      setSelectedTags([])
    } catch (error) {
      console.error('Error deleting tags:', error)
      showToast('Failed to delete tags', 'error')
    }
  }

  const toggleSelectAll = () => {
    if (selectedTags.length === filteredTags.length) {
      setSelectedTags([])
    } else {
      setSelectedTags(filteredTags.map(tag => tag.id))
    }
  }

  const filteredTags = tags.filter(tag =>
    tag.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    tag.slug.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Tags</h1>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
        <div className="lg:col-span-2">
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Add New Tag</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Name</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => handleNameChange(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Tag name"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Slug</label>
                <input
                  type="text"
                  value={slug}
                  onChange={(e) => setSlug(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="tag-slug"
                />
              </div>
              <button
                type="submit"
                className="w-full bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-semibold transition-colors"
              >
                Add Tag
              </button>
            </form>
          </div>
        </div>

        <div className="lg:col-span-3">
          <div className="bg-white rounded-lg shadow-md">
            <div className="p-4 border-b border-gray-200 flex items-center justify-between gap-4">
              <div className="flex items-center gap-2">
                <select className="px-3 py-2 border border-gray-300 rounded text-sm">
                  <option value="">Bulk Actions</option>
                  <option value="delete">Delete</option>
                </select>
                <button
                  onClick={handleBulkDelete}
                  className="px-4 py-2 border border-gray-300 rounded text-sm hover:bg-gray-50"
                >
                  Apply
                </button>
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search tags"
                  className="px-3 py-2 border border-gray-300 rounded text-sm w-64"
                />
                <button className="px-4 py-2 bg-blue-600 text-white rounded text-sm hover:bg-blue-700 flex items-center gap-2">
                  <Search className="w-4 h-4" />
                  Search Tag
                </button>
              </div>
            </div>

            {loading ? (
              <div className="p-8 text-center text-gray-500">Loading tags...</div>
            ) : filteredTags.length === 0 ? (
              <div className="p-8 text-center text-gray-500">No tags found</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left">
                        <input
                          type="checkbox"
                          checked={selectedTags.length === filteredTags.length && filteredTags.length > 0}
                          onChange={toggleSelectAll}
                          className="rounded"
                        />
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Slug</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Count</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {filteredTags.map((tag) => (
                      <tr key={tag.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4">
                          <input
                            type="checkbox"
                            checked={selectedTags.includes(tag.id)}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setSelectedTags([...selectedTags, tag.id])
                              } else {
                                setSelectedTags(selectedTags.filter(id => id !== tag.id))
                              }
                            }}
                            className="rounded"
                          />
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-4">
                            <span className="font-medium text-gray-900">{tag.name}</span>
                            <button
                              onClick={() => handleDelete(tag.id)}
                              className="text-red-600 hover:text-red-800 text-sm"
                            >
                              Delete
                            </button>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-600">{tag.slug}</td>
                        <td className="px-6 py-4 text-sm text-gray-600">0</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

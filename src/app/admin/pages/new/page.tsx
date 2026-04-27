'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import { Save, Eye, Globe, Upload, X, Images } from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import { useToast } from '@/contexts/ToastContext'
import MediaPicker from '@/components/admin/MediaPicker'

interface Category { id: string; name: string }
interface Tag { id: string; name: string }

export default function NewPagePage() {
  const router = useRouter()
  const { user } = useAuth()
  const { showToast } = useToast()
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [slug, setSlug] = useState('')
  const [slugTouched, setSlugTouched] = useState(false)
  const [status, setStatus] = useState('draft')
  const [visibility, setVisibility] = useState('public')
  const [metaTitle, setMetaTitle] = useState('')
  const [metaDescription, setMetaDescription] = useState('')
  const [saving, setSaving] = useState(false)
  const [categories, setCategories] = useState<Category[]>([])
  const [tags, setTags] = useState<Tag[]>([])
  const [selectedCategories, setSelectedCategories] = useState<string[]>([])
  const [selectedTags, setSelectedTags] = useState<string[]>([])
  const [featuredImage, setFeaturedImage] = useState('')
  const [showMediaPicker, setShowMediaPicker] = useState(false)

  useEffect(() => {
    supabase.from('categories').select('id, name').eq('type', 'page').order('name').then(({ data }) => setCategories(data || []))
    supabase.from('tags').select('id, name').eq('type', 'page').order('name').then(({ data }) => setTags(data || []))
  }, [])

  const generateSlug = (text: string) =>
    text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '')

  const handleTitleChange = (value: string) => {
    setTitle(value)
    if (!slugTouched) setSlug(generateSlug(value))
  }

  const handleSave = async (newStatus: string = status) => {
    if (!title.trim()) { showToast('Please enter a title', 'warning'); return }
    setSaving(true)
    try {
      const { error } = await supabase.from('pages').insert([{
        title: title.trim(),
        slug: slug || generateSlug(title),
        content: content.trim(),
        status: newStatus,
        visibility,
        meta_title: metaTitle || title,
        meta_description: metaDescription,
        author_id: user?.id,
        published_at: newStatus === 'published' ? new Date().toISOString() : null,
      }])
      if (error) throw error
      showToast(`Page ${newStatus === 'published' ? 'published' : 'saved'} successfully!`, 'success')
      router.push('/admin/pages')
    } catch (error: any) {
      showToast(error.message || 'Failed to save page', 'error')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="p-8">
      {showMediaPicker && (
        <MediaPicker onSelect={url => { setFeaturedImage(url); setShowMediaPicker(false) }} onClose={() => setShowMediaPicker(false)} />
      )}

      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Add New Page</h1>
        <p className="text-gray-600">Create a new website page</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-lg shadow-md p-6">
            <input type="text" value={title} onChange={e => handleTitleChange(e.target.value)}
              placeholder="Enter page title..."
              className="w-full text-3xl font-bold border-none outline-none placeholder-gray-300 mb-4" />
            <div className="mb-4">
              <label className="text-sm text-gray-500 font-medium">Slug:</label>
              <div className="flex items-center mt-1 border border-gray-300 rounded focus-within:ring-2 focus-within:ring-blue-500 overflow-hidden">
                <span className="px-3 py-2 bg-gray-50 text-gray-400 text-sm border-r border-gray-300 shrink-0">/</span>
                <input type="text" value={slug}
                  onChange={e => { setSlug(e.target.value); setSlugTouched(true) }}
                  placeholder="page-slug"
                  className="flex-1 px-3 py-2 focus:outline-none text-sm" />
              </div>
            </div>
            <textarea value={content} onChange={e => setContent(e.target.value)}
              placeholder="Write your page content here..."
              className="w-full h-96 p-4 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none" />
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="font-semibold text-gray-900 mb-4">SEO Settings</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Meta Title</label>
                <input type="text" value={metaTitle} onChange={e => setMetaTitle(e.target.value)}
                  placeholder={title || "Enter meta title"}
                  className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Meta Description</label>
                <textarea value={metaDescription} onChange={e => setMetaDescription(e.target.value)}
                  placeholder="Enter meta description"
                  className="w-full h-20 p-3 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none" />
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="font-semibold text-gray-900 mb-4">Publish</h3>
            <div className="space-y-4">
              <div>
                <label className="text-sm text-gray-700 mb-2 block">Status</label>
                <select value={status} onChange={e => setStatus(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500">
                  <option value="draft">Draft</option>
                  <option value="pending_review">Pending Review</option>
                  <option value="published">Published</option>
                </select>
              </div>
              <div>
                <label className="flex items-center gap-2 text-sm text-gray-700 mb-2"><Globe className="w-4 h-4" />Visibility</label>
                <select value={visibility} onChange={e => setVisibility(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500">
                  <option value="public">Public</option>
                  <option value="password_protected">Password Protected</option>
                  <option value="private">Private</option>
                </select>
              </div>
            </div>
            <div className="mt-6 pt-6 border-t border-gray-200 space-y-2">
              <button onClick={() => handleSave('draft')} disabled={saving}
                className="w-full flex items-center justify-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50">
                <Save className="w-4 h-4" /> Save Draft
              </button>
              <button onClick={() => handleSave('published')} disabled={saving}
                className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors disabled:opacity-50">
                <Eye className="w-4 h-4" /> {saving ? 'Saving...' : 'Publish'}
              </button>
            </div>
          </div>

          {/* Featured Image */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="font-semibold text-gray-900 mb-4">Featured Image</h3>
            {featuredImage ? (
              <div className="relative">
                <img src={featuredImage} alt="Featured" className="w-full h-40 object-cover rounded-lg" />
                <button onClick={() => setFeaturedImage('')}
                  className="absolute top-2 right-2 p-1 bg-red-600 text-white rounded-full hover:bg-red-700">
                  <X className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="border-2 border-dashed border-gray-300 rounded-lg overflow-hidden">
                <button onClick={() => setShowMediaPicker(true)}
                  className="w-full py-6 flex flex-col items-center gap-2 hover:bg-blue-50 hover:border-blue-400 transition-colors text-gray-500 hover:text-blue-600">
                  <Images className="w-8 h-8" />
                  <span className="text-sm font-medium">Choose from Media Library</span>
                </button>
                <div className="border-t border-dashed border-gray-300">
                  <label className="w-full py-4 flex flex-col items-center gap-1 cursor-pointer hover:bg-gray-50 transition-colors text-gray-400">
                    <Upload className="w-5 h-5" />
                    <span className="text-xs">Or upload from computer</span>
                    <input type="file" accept="image/*"
                      onChange={async e => {
                        const file = e.target.files?.[0]
                        if (!file) return
                        const formData = new FormData()
                        formData.append('file', file)
                        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}?action=upload`, { method: 'POST', body: formData })
                        const data = await res.json()
                        if (data.url) {
                          await supabase.from('media').insert([{ filename: file.name, file_url: data.url, file_type: 'image', file_size: file.size }])
                          setFeaturedImage(data.url)
                        }
                      }}
                      className="hidden" />
                  </label>
                </div>
              </div>
            )}
          </div>

          {/* Categories */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="font-semibold text-gray-900 mb-4">Categories</h3>
            <div className="space-y-2 max-h-48 overflow-y-auto">
              {categories.map(cat => (
                <label key={cat.id} className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" checked={selectedCategories.includes(cat.id)}
                    onChange={e => setSelectedCategories(e.target.checked ? [...selectedCategories, cat.id] : selectedCategories.filter(id => id !== cat.id))}
                    className="rounded" />
                  <span className="text-sm text-gray-700">{cat.name}</span>
                </label>
              ))}
              {categories.length === 0 && <p className="text-sm text-gray-500">No categories yet</p>}
            </div>
          </div>

          {/* Tags */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="font-semibold text-gray-900 mb-4">Tags</h3>
            <div className="space-y-2 max-h-48 overflow-y-auto">
              {tags.map(tag => (
                <label key={tag.id} className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" checked={selectedTags.includes(tag.id)}
                    onChange={e => setSelectedTags(e.target.checked ? [...selectedTags, tag.id] : selectedTags.filter(id => id !== tag.id))}
                    className="rounded" />
                  <span className="text-sm text-gray-700">{tag.name}</span>
                </label>
              ))}
              {tags.length === 0 && <p className="text-sm text-gray-500">No tags yet</p>}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

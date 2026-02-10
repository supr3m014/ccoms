'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import { Save, Eye, Calendar, Lock, Globe, Upload, X, Plus } from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'

interface Category {
  id: string
  name: string
}

interface Tag {
  id: string
  name: string
}

export default function NewPostPage() {
  const router = useRouter()
  const { user } = useAuth()
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [excerpt, setExcerpt] = useState('')
  const [slug, setSlug] = useState('')
  const [status, setStatus] = useState('draft')
  const [visibility, setVisibility] = useState('public')
  const [commentsEnabled, setCommentsEnabled] = useState(true)
  const [metaTitle, setMetaTitle] = useState('')
  const [metaDescription, setMetaDescription] = useState('')
  const [saving, setSaving] = useState(false)
  const [categories, setCategories] = useState<Category[]>([])
  const [tags, setTags] = useState<Tag[]>([])
  const [selectedCategories, setSelectedCategories] = useState<string[]>([])
  const [selectedTags, setSelectedTags] = useState<string[]>([])
  const [featuredImage, setFeaturedImage] = useState('')
  const [scheduledDate, setScheduledDate] = useState('')
  const [scheduledTime, setScheduledTime] = useState('')
  const [showAddCategory, setShowAddCategory] = useState(false)
  const [newCategoryName, setNewCategoryName] = useState('')
  const [showAddTag, setShowAddTag] = useState(false)
  const [newTagName, setNewTagName] = useState('')

  useEffect(() => {
    fetchCategories()
    fetchTags()
  }, [])

  const fetchCategories = async () => {
    const { data } = await supabase
      .from('categories')
      .select('id, name')
      .eq('type', 'post')
      .order('name')
    if (data) setCategories(data)
  }

  const fetchTags = async () => {
    const { data } = await supabase
      .from('tags')
      .select('id, name')
      .eq('type', 'post')
      .order('name')
    if (data) setTags(data)
  }

  const handleAddCategory = async () => {
    if (!newCategoryName.trim()) return

    try {
      const { data, error } = await supabase
        .from('categories')
        .insert([{ name: newCategoryName.trim(), type: 'post' }])
        .select()

      if (error) throw error

      if (data && data[0]) {
        setCategories([...categories, data[0]])
        setSelectedCategories([...selectedCategories, data[0].id])
        setNewCategoryName('')
        setShowAddCategory(false)
      }
    } catch (error) {
      console.error('Error adding category:', error)
      alert('Failed to add category')
    }
  }

  const handleAddTag = async () => {
    if (!newTagName.trim()) return

    try {
      const { data, error } = await supabase
        .from('tags')
        .insert([{ name: newTagName.trim(), type: 'post' }])
        .select()

      if (error) throw error

      if (data && data[0]) {
        setTags([...tags, data[0]])
        setSelectedTags([...selectedTags, data[0].id])
        setNewTagName('')
        setShowAddTag(false)
      }
    } catch (error) {
      console.error('Error adding tag:', error)
      alert('Failed to add tag')
    }
  }

  const removeTag = (tagId: string) => {
    setSelectedTags(selectedTags.filter(id => id !== tagId))
  }

  const generateSlug = (text: string) => {
    return text
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '')
  }

  const handleTitleChange = (value: string) => {
    setTitle(value)
    if (!slug) {
      setSlug(generateSlug(value))
    }
  }

  const handleSave = async (newStatus: string = status) => {
    if (!title.trim()) {
      alert('Please enter a title')
      return
    }

    if (newStatus === 'scheduled' && (!scheduledDate || !scheduledTime)) {
      alert('Please set a scheduled date and time')
      return
    }

    setSaving(true)

    try {
      let publishedAt = null
      if (newStatus === 'published') {
        publishedAt = new Date().toISOString()
      } else if (newStatus === 'scheduled' && scheduledDate && scheduledTime) {
        publishedAt = new Date(`${scheduledDate}T${scheduledTime}`).toISOString()
      }

      const postData = {
        title: title.trim(),
        slug: slug || generateSlug(title),
        content: content.trim(),
        excerpt: excerpt.trim(),
        status: newStatus,
        visibility,
        comments_enabled: commentsEnabled,
        meta_title: metaTitle || title,
        meta_description: metaDescription || excerpt,
        author_id: user?.id,
        published_at: publishedAt,
      }

      const { data, error } = await supabase
        .from('posts')
        .insert([postData])
        .select()

      if (error) throw error

      alert(`Post ${newStatus === 'published' ? 'published' : newStatus === 'scheduled' ? 'scheduled' : 'saved'} successfully!`)
      router.push('/admin/posts')
    } catch (error: any) {
      console.error('Error saving post:', error)
      alert(error.message || 'Failed to save post')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Add New Post</h1>
        <p className="text-gray-600">Create a new blog post</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-lg shadow-md p-6">
            <input
              type="text"
              value={title}
              onChange={(e) => handleTitleChange(e.target.value)}
              placeholder="Enter post title..."
              className="w-full text-3xl font-bold border-none outline-none placeholder-gray-300 mb-4"
            />

            <div className="mb-4">
              <label className="text-sm text-gray-600">Slug:</label>
              <input
                type="text"
                value={slug}
                onChange={(e) => setSlug(e.target.value)}
                placeholder="post-slug"
                className="w-full mt-1 px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Write your post content here..."
              className="w-full h-96 p-4 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
            />
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="font-semibold text-gray-900 mb-4">Excerpt</h3>
            <textarea
              value={excerpt}
              onChange={(e) => setExcerpt(e.target.value)}
              placeholder="Write a short excerpt..."
              className="w-full h-24 p-3 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
            />
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="font-semibold text-gray-900 mb-4">SEO Settings</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Meta Title</label>
                <input
                  type="text"
                  value={metaTitle}
                  onChange={(e) => setMetaTitle(e.target.value)}
                  placeholder={title || "Enter meta title"}
                  className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Meta Description</label>
                <textarea
                  value={metaDescription}
                  onChange={(e) => setMetaDescription(e.target.value)}
                  placeholder="Enter meta description"
                  className="w-full h-20 p-3 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                />
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="font-semibold text-gray-900 mb-4">Publish</h3>

            <div className="space-y-4">
              <div>
                <label className="flex items-center gap-2 text-sm text-gray-700 mb-2">
                  <Calendar className="w-4 h-4" />
                  Status
                </label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="draft">Draft</option>
                  <option value="pending_review">Pending Review</option>
                  <option value="scheduled">Scheduled</option>
                  <option value="published">Published</option>
                </select>
              </div>

              {status === 'scheduled' && (
                <>
                  <div>
                    <label className="block text-sm text-gray-700 mb-2">Scheduled Date</label>
                    <input
                      type="date"
                      value={scheduledDate}
                      onChange={(e) => setScheduledDate(e.target.value)}
                      min={new Date().toISOString().split('T')[0]}
                      className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-700 mb-2">Scheduled Time</label>
                    <input
                      type="time"
                      value={scheduledTime}
                      onChange={(e) => setScheduledTime(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </>
              )}

              <div>
                <label className="flex items-center gap-2 text-sm text-gray-700 mb-2">
                  <Globe className="w-4 h-4" />
                  Visibility
                </label>
                <select
                  value={visibility}
                  onChange={(e) => setVisibility(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="public">Public</option>
                  <option value="password_protected">Password Protected</option>
                  <option value="private">Private</option>
                </select>
              </div>

              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={commentsEnabled}
                  onChange={(e) => setCommentsEnabled(e.target.checked)}
                  className="rounded border-gray-300"
                />
                <span className="text-sm text-gray-700">Enable comments</span>
              </label>
            </div>

            <div className="mt-6 pt-6 border-t border-gray-200 space-y-2">
              <button
                onClick={() => handleSave('draft')}
                disabled={saving}
                className="w-full flex items-center justify-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
              >
                <Save className="w-4 h-4" />
                Save Draft
              </button>
              <button
                onClick={() => handleSave('published')}
                disabled={saving}
                className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors disabled:opacity-50"
              >
                <Eye className="w-4 h-4" />
                Publish
              </button>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="font-semibold text-gray-900 mb-4">Featured Image</h3>
            {featuredImage ? (
              <div className="relative">
                <img src={featuredImage} alt="Featured" className="w-full h-40 object-cover rounded" />
                <button
                  onClick={() => setFeaturedImage('')}
                  className="absolute top-2 right-2 p-1 bg-red-600 text-white rounded-full hover:bg-red-700"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <label className="block w-full h-40 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-blue-500 transition-colors">
                <div className="flex flex-col items-center justify-center h-full">
                  <Upload className="w-8 h-8 text-gray-400 mb-2" />
                  <span className="text-sm text-gray-600">Upload Image</span>
                </div>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    const file = e.target.files?.[0]
                    if (file) {
                      setFeaturedImage(URL.createObjectURL(file))
                    }
                  }}
                  className="hidden"
                />
              </label>
            )}
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-gray-900">Categories</h3>
              <button
                onClick={() => setShowAddCategory(!showAddCategory)}
                className="text-sm text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1"
              >
                <Plus className="w-4 h-4" />
                Add Category
              </button>
            </div>

            {showAddCategory && (
              <div className="mb-4 p-3 bg-gray-50 rounded border border-gray-200">
                <input
                  type="text"
                  value={newCategoryName}
                  onChange={(e) => setNewCategoryName(e.target.value)}
                  placeholder="Category name"
                  className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 mb-2"
                  onKeyPress={(e) => e.key === 'Enter' && handleAddCategory()}
                />
                <div className="flex gap-2">
                  <button
                    onClick={handleAddCategory}
                    className="px-3 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700"
                  >
                    Add
                  </button>
                  <button
                    onClick={() => {
                      setShowAddCategory(false)
                      setNewCategoryName('')
                    }}
                    className="px-3 py-1 border border-gray-300 rounded text-sm hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}

            <div className="space-y-2 max-h-48 overflow-y-auto">
              {categories.map((cat) => (
                <label key={cat.id} className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={selectedCategories.includes(cat.id)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setSelectedCategories([...selectedCategories, cat.id])
                      } else {
                        setSelectedCategories(selectedCategories.filter(id => id !== cat.id))
                      }
                    }}
                    className="rounded"
                  />
                  <span className="text-sm text-gray-700">{cat.name}</span>
                </label>
              ))}
              {categories.length === 0 && (
                <p className="text-sm text-gray-500">No categories available</p>
              )}
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-gray-900">Tags</h3>
              <button
                onClick={() => setShowAddTag(!showAddTag)}
                className="text-sm text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1"
              >
                <Plus className="w-4 h-4" />
                Add Tag
              </button>
            </div>

            {showAddTag && (
              <div className="mb-4 p-3 bg-gray-50 rounded border border-gray-200">
                <input
                  type="text"
                  value={newTagName}
                  onChange={(e) => setNewTagName(e.target.value)}
                  placeholder="Tag name"
                  className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 mb-2"
                  onKeyPress={(e) => e.key === 'Enter' && handleAddTag()}
                />
                <div className="flex gap-2">
                  <button
                    onClick={handleAddTag}
                    className="px-3 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700"
                  >
                    Add
                  </button>
                  <button
                    onClick={() => {
                      setShowAddTag(false)
                      setNewTagName('')
                    }}
                    className="px-3 py-1 border border-gray-300 rounded text-sm hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}

            {selectedTags.length > 0 && (
              <div className="mb-4 flex flex-wrap gap-2">
                {selectedTags.map(tagId => {
                  const tag = tags.find(t => t.id === tagId)
                  if (!tag) return null
                  return (
                    <div
                      key={tagId}
                      className="flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-sm"
                    >
                      <span>{tag.name}</span>
                      <button
                        onClick={() => removeTag(tagId)}
                        className="hover:bg-blue-200 rounded-full p-0.5 transition-colors"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  )
                })}
              </div>
            )}

            <div className="space-y-2 max-h-48 overflow-y-auto">
              {tags.map((tag) => (
                <label key={tag.id} className="flex items-center gap-2 cursor-pointer">
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
                  <span className="text-sm text-gray-700">{tag.name}</span>
                </label>
              ))}
              {tags.length === 0 && (
                <p className="text-sm text-gray-500">No tags available</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

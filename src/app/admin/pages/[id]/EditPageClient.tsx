'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { ArrowLeft, Save, Images, X, Upload } from 'lucide-react'
import Link from 'next/link'
import { useToast } from '@/contexts/ToastContext'
import MediaPicker from '@/components/admin/MediaPicker'

interface PageData {
    id: string
    title: string
    slug: string
    content: string
    excerpt: string
    status: string
    visibility: string
    meta_title: string
    meta_description: string
    og_image: string | null
    published_at: string | null
}

export default function EditPageClient({ id }: { id: string }) {
    const router = useRouter()
    const { showToast } = useToast()
    const [loading, setLoading] = useState(true)
    const [showMediaPicker, setShowMediaPicker] = useState(false)
    const [saving, setSaving] = useState(false)
    const [formData, setFormData] = useState<PageData>({
        id: '',
        title: '',
        slug: '',
        content: '',
        excerpt: '',
        status: 'draft',
        visibility: 'public',
        meta_title: '',
        meta_description: '',
        og_image: null,
        published_at: null
    })

    useEffect(() => {
        fetchPage()
    }, [id])

    const fetchPage = async () => {
        try {
            const { data, error } = await supabase
                .from('pages')
                .select('*')
                .eq('id', id)
                .single()

            if (error) throw error
            if (data) setFormData(data)
        } catch (error) {
            console.error('Error fetching page:', error)
            showToast('Failed to load page', 'error')
        } finally {
            setLoading(false)
        }
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setSaving(true)

        try {
            const updateData: any = {
                title: formData.title,
                slug: formData.slug,
                content: formData.content,
                excerpt: formData.excerpt,
                status: formData.status,
                visibility: formData.visibility,
                meta_title: formData.meta_title,
                meta_description: formData.meta_description,
                og_image: formData.og_image,
                updated_at: new Date().toISOString()
            }

            if (formData.status === 'published' && !formData.published_at) {
                updateData.published_at = new Date().toISOString()
            }

            const { error } = await supabase
                .from('pages')
                .update(updateData)
                .eq('id', id)

            if (error) throw error

            showToast('Page updated successfully!', 'success')
            router.push('/admin/pages')
        } catch (error) {
            console.error('Error updating page:', error)
            showToast('Failed to update page', 'error')
        } finally {
            setSaving(false)
        }
    }

    if (loading) {
        return (
            <div className="p-8">
                <div className="text-center text-gray-500">Loading page...</div>
            </div>
        )
    }

    return (
        <div className="p-8">
            {showMediaPicker && (
                <MediaPicker
                    onSelect={url => { setFormData(f => ({ ...f, og_image: url })); setShowMediaPicker(false) }}
                    onClose={() => setShowMediaPicker(false)}
                />
            )}
            <div className="mb-8">
                <Link
                    href="/admin/pages"
                    className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4"
                >
                    <ArrowLeft className="w-4 h-4" />
                    Back to Pages
                </Link>
                <h1 className="text-3xl font-bold text-gray-900">Edit Page</h1>
            </div>

            <form onSubmit={handleSubmit} className="max-w-4xl">
                <div className="bg-white rounded-lg shadow-md p-6 mb-6">
                    <h2 className="text-xl font-semibold text-gray-900 mb-4">Page Details</h2>

                    <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Title <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="text"
                            value={formData.title}
                            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            required
                        />
                    </div>

                    <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Slug <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="text"
                            value={formData.slug}
                            onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            required
                        />
                        <p className="text-sm text-gray-500 mt-1">URL: /{formData.slug}</p>
                    </div>

                    <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Content <span className="text-red-500">*</span>
                        </label>
                        <textarea
                            value={formData.content}
                            onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent h-64"
                            required
                        />
                    </div>

                    <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Excerpt
                        </label>
                        <textarea
                            value={formData.excerpt}
                            onChange={(e) => setFormData({ ...formData, excerpt: e.target.value })}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent h-24"
                            placeholder="Short description of the page"
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4 mb-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Status
                            </label>
                            <select
                                value={formData.status}
                                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            >
                                <option value="draft">Draft</option>
                                <option value="published">Published</option>
                                <option value="pending_review">Pending Review</option>
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Visibility
                            </label>
                            <select
                                value={formData.visibility}
                                onChange={(e) => setFormData({ ...formData, visibility: e.target.value })}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            >
                                <option value="public">Public</option>
                                <option value="private">Private</option>
                                <option value="password_protected">Password Protected</option>
                            </select>
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-lg shadow-md p-6 mb-6">
                    <h2 className="text-xl font-semibold text-gray-900 mb-4">SEO Settings</h2>

                    <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Meta Title
                        </label>
                        <input
                            type="text"
                            value={formData.meta_title}
                            onChange={(e) => setFormData({ ...formData, meta_title: e.target.value })}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            placeholder="Leave empty to use page title"
                        />
                    </div>

                    <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Meta Description
                        </label>
                        <textarea
                            value={formData.meta_description}
                            onChange={(e) => setFormData({ ...formData, meta_description: e.target.value })}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent h-24"
                            placeholder="Brief description for search engines (150-160 characters)"
                        />
                        <p className="text-sm text-gray-500 mt-1">
                            {formData.meta_description.length} / 160 characters
                        </p>
                    </div>

                    <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-700 mb-2">Featured / OG Image</label>
                        {formData.og_image ? (
                            <div className="relative">
                                <img src={formData.og_image} alt="OG" className="w-full h-36 object-cover rounded-lg border border-gray-200" />
                                <button onClick={() => setFormData(f => ({ ...f, og_image: null }))}
                                    className="absolute top-2 right-2 p-1 bg-red-600 text-white rounded-full hover:bg-red-700">
                                    <X className="w-4 h-4" />
                                </button>
                            </div>
                        ) : (
                            <div className="border-2 border-dashed border-gray-300 rounded-lg overflow-hidden">
                                <button onClick={() => setShowMediaPicker(true)}
                                    className="w-full py-5 flex flex-col items-center gap-2 hover:bg-blue-50 transition-colors text-gray-500 hover:text-blue-600">
                                    <Images className="w-7 h-7" />
                                    <span className="text-sm font-medium">Choose from Media Library</span>
                                </button>
                            </div>
                        )}
                    </div>
                </div>

                <div className="flex items-center gap-4">
                    <button
                        type="submit"
                        disabled={saving}
                        className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        <Save className="w-4 h-4" />
                        {saving ? 'Saving...' : 'Save Changes'}
                    </button>
                    <Link
                        href="/admin/pages"
                        className="text-gray-600 hover:text-gray-900 font-semibold"
                    >
                        Cancel
                    </Link>
                </div>
            </form>
        </div>
    )
}

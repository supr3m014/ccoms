'use client'

// Shared blog post editor — used by /admin/posts/new and /admin/posts/[id].
// Writes to Firestore `blog_posts`; the public /blog pages read the same
// collection, so Publish makes a post live immediately (localhost and live).

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import {
  collection, doc, addDoc, updateDoc, deleteDoc, getDoc, setDoc,
  serverTimestamp, Timestamp,
} from 'firebase/firestore'
import { getDb } from '@/lib/firebase'
import { slugify, slugTaken, fetchPostById, type BlogPost, type PostStatus } from '@/lib/blog'
import { Save, Trash2, Eye, X, Plus, Loader2, ExternalLink } from 'lucide-react'

// All known categories/tags live in one doc the pickers read; the
// Categories/Tags admin pages manage the same doc.
export const TAXONOMY_DOC = ['blog_config', 'taxonomy'] as const

interface Props {
  postId?: string // absent = new post
}

export default function PostEditor({ postId }: Props) {
  const router = useRouter()
  const [loading, setLoading] = useState(Boolean(postId))
  const [missing, setMissing] = useState(false)
  const [saving, setSaving] = useState(false)
  const [statusMsg, setStatusMsg] = useState('')

  const [title, setTitle] = useState('')
  const [slug, setSlug] = useState('')
  const [slugTouched, setSlugTouched] = useState(false)
  const [excerpt, setExcerpt] = useState('')
  const [content, setContent] = useState('')
  const [featuredImage, setFeaturedImage] = useState('')
  const [author, setAuthor] = useState('CCOMS')
  const [status, setStatus] = useState<PostStatus>('draft')
  const [commentsEnabled, setCommentsEnabled] = useState(true)
  const [metaTitle, setMetaTitle] = useState('')
  const [metaDescription, setMetaDescription] = useState('')
  const [publishedAt, setPublishedAt] = useState<Timestamp | null>(null)

  const [allCategories, setAllCategories] = useState<string[]>([])
  const [allTags, setAllTags] = useState<string[]>([])
  const [categories, setCategories] = useState<string[]>([])
  const [tags, setTags] = useState<string[]>([])
  const [newCategory, setNewCategory] = useState('')
  const [newTag, setNewTag] = useState('')

  useEffect(() => {
    getDoc(doc(getDb(), ...TAXONOMY_DOC)).then((snap) => {
      const d = snap.exists() ? snap.data() : {}
      setAllCategories(Array.isArray(d.categories) ? d.categories : [])
      setAllTags(Array.isArray(d.tags) ? d.tags : [])
    }).catch(() => {})
  }, [])

  useEffect(() => {
    if (!postId) return
    fetchPostById(postId).then((p) => {
      if (!p) { setMissing(true); setLoading(false); return }
      setTitle(p.title); setSlug(p.slug); setSlugTouched(true)
      setExcerpt(p.excerpt); setContent(p.content)
      setFeaturedImage(p.featured_image || ''); setAuthor(p.author || 'CCOMS')
      setStatus(p.status); setCommentsEnabled(p.comments_enabled !== false)
      setMetaTitle(p.meta_title || ''); setMetaDescription(p.meta_description || '')
      setCategories(p.categories || []); setTags(p.tags || [])
      setPublishedAt(p.published_at)
      setLoading(false)
    }).catch(() => { setMissing(true); setLoading(false) })
  }, [postId])

  const onTitle = (v: string) => {
    setTitle(v)
    if (!slugTouched) setSlug(slugify(v))
  }

  const addTaxonomy = async (kind: 'categories' | 'tags', raw: string) => {
    const value = raw.trim()
    if (!value) return
    const list = kind === 'categories' ? allCategories : allTags
    if (!list.includes(value)) {
      const next = [...list, value].sort()
      await setDoc(doc(getDb(), ...TAXONOMY_DOC), { [kind]: next }, { merge: true })
      kind === 'categories' ? setAllCategories(next) : setAllTags(next)
    }
    if (kind === 'categories') { if (!categories.includes(value)) setCategories([...categories, value]); setNewCategory('') }
    else { if (!tags.includes(value)) setTags([...tags, value]); setNewTag('') }
  }

  const save = async (nextStatus?: PostStatus) => {
    const finalStatus = nextStatus ?? status
    const finalSlug = slugify(slug || title)
    if (!title.trim() || !finalSlug) { setStatusMsg('A title (and slug) is required.'); return }
    if (finalStatus === 'published' && !content.trim()) { setStatusMsg('Write some content before publishing.'); return }
    setSaving(true); setStatusMsg('')
    try {
      if (await slugTaken(finalSlug, postId)) {
        setStatusMsg(`The slug “${finalSlug}” is already used by another post.`)
        setSaving(false)
        return
      }
      const base = {
        title: title.trim(),
        slug: finalSlug,
        excerpt: excerpt.trim(),
        content,
        featured_image: featuredImage.trim(),
        author: author.trim() || 'CCOMS',
        status: finalStatus,
        categories,
        tags,
        comments_enabled: commentsEnabled,
        meta_title: metaTitle.trim(),
        meta_description: metaDescription.trim(),
        updated_at: serverTimestamp(),
        // First publish stamps the date; republishimg keeps the original.
        published_at: finalStatus === 'published' ? (publishedAt ?? Timestamp.now()) : publishedAt,
      }
      if (postId) {
        await updateDoc(doc(getDb(), 'blog_posts', postId), base)
      } else {
        const ref = await addDoc(collection(getDb(), 'blog_posts'), { ...base, created_at: serverTimestamp() })
        router.replace(`/admin/posts/${ref.id}`)
      }
      setStatus(finalStatus)
      setSlug(finalSlug)
      if (finalStatus === 'published' && !publishedAt) setPublishedAt(Timestamp.now())
      setStatusMsg(finalStatus === 'published' ? 'Published — the post is live.' : 'Draft saved.')
    } catch (err) {
      console.error(err); setStatusMsg('Save failed — please try again.')
    }
    setSaving(false)
  }

  const remove = async () => {
    if (!postId || !confirm('Delete this post permanently?')) return
    await deleteDoc(doc(getDb(), 'blog_posts', postId))
    router.push('/admin/posts')
  }

  if (loading) return <div className="p-8 text-gray-500">Loading…</div>
  if (missing) return <div className="p-8 text-gray-500">Post not found. <button onClick={() => router.push('/admin/posts')} className="text-blue-600 underline">Back to posts</button></div>

  const chip = (v: string, on: boolean, toggle: () => void) => (
    <button key={v} type="button" onClick={toggle}
      className={`px-3 py-1 rounded-full text-xs font-semibold border transition-colors ${on ? 'bg-blue-600 text-white border-blue-600' : 'border-gray-300 text-gray-600 hover:bg-gray-50'}`}>
      {v}
    </button>
  )

  return (
    <div className="p-8 max-w-6xl">
      <div className="mb-6 flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-1">{postId ? 'Edit Post' : 'Create New Post'}</h1>
          <p className="text-gray-600 text-sm">
            {status === 'published'
              ? <>Live at <a className="text-blue-600 inline-flex items-center gap-1" href={`/blog/read?slug=${slug}`} target="_blank" rel="noreferrer">/blog/read?slug={slug} <ExternalLink className="w-3 h-3" /></a></>
              : 'Draft — not visible on the site until published.'}
          </p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          {postId && (
            <button onClick={remove} className="inline-flex items-center gap-2 border border-red-200 text-red-600 hover:bg-red-50 px-4 py-2 rounded-lg font-semibold text-sm">
              <Trash2 className="w-4 h-4" /> Delete
            </button>
          )}
          <button onClick={() => save('draft')} disabled={saving}
            className="inline-flex items-center gap-2 border border-gray-300 hover:bg-gray-50 disabled:opacity-50 text-gray-700 px-4 py-2 rounded-lg font-semibold text-sm">
            <Save className="w-4 h-4" /> Save Draft
          </button>
          <button onClick={() => save('published')} disabled={saving}
            className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white px-5 py-2 rounded-lg font-semibold text-sm">
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Eye className="w-4 h-4" />}
            {status === 'published' ? 'Update' : 'Publish'}
          </button>
        </div>
      </div>

      {statusMsg && <p className="mb-4 text-sm text-gray-700">{statusMsg}</p>}

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Main column */}
        <div className="lg:col-span-2 space-y-4">
          <input value={title} onChange={(e) => onTitle(e.target.value)} placeholder="Post title"
            className="w-full text-2xl font-bold px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500" />
          <div className="flex items-center gap-2 text-sm">
            <span className="text-gray-500 shrink-0">Slug:</span>
            <input value={slug} onChange={(e) => { setSlug(e.target.value); setSlugTouched(true) }}
              className="flex-1 px-3 py-1.5 border border-gray-200 rounded font-mono text-xs focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
          <textarea value={excerpt} onChange={(e) => setExcerpt(e.target.value)} rows={2}
            placeholder="Excerpt — the summary shown on the blog index and in search results"
            className="w-full px-4 py-3 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none" />
          <textarea value={content} onChange={(e) => setContent(e.target.value)} rows={22}
            placeholder="Write your post… Plain paragraphs work; basic HTML (<h2>, <p>, <ul>, <a>, <img>) is rendered as-is."
            className="w-full px-4 py-3 border border-gray-300 rounded-xl text-sm leading-relaxed focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono" />
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          <div className="bg-white border border-gray-200 rounded-xl p-4 space-y-3">
            <h3 className="font-semibold text-gray-900 text-sm">Publishing</h3>
            <label className="block text-xs text-gray-600">Author
              <input value={author} onChange={(e) => setAuthor(e.target.value)}
                className="mt-1 w-full px-3 py-2 border border-gray-200 rounded text-sm" />
            </label>
            <label className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
              <input type="checkbox" checked={commentsEnabled} onChange={(e) => setCommentsEnabled(e.target.checked)} className="w-4 h-4" />
              Allow comments
            </label>
            <p className="text-xs text-gray-400">
              Status: <span className={`font-semibold ${status === 'published' ? 'text-green-600' : 'text-gray-600'}`}>{status}</span>
              {publishedAt && <> · first published {publishedAt.toDate().toLocaleDateString()}</>}
            </p>
          </div>

          <div className="bg-white border border-gray-200 rounded-xl p-4 space-y-2">
            <h3 className="font-semibold text-gray-900 text-sm">Featured image</h3>
            <input value={featuredImage} onChange={(e) => setFeaturedImage(e.target.value)}
              placeholder="https://… (upload in Media Library, then paste the URL)"
              className="w-full px-3 py-2 border border-gray-200 rounded text-xs" />
            {featuredImage && <img src={featuredImage} alt="preview" className="rounded-lg border border-gray-100 max-h-36 w-full object-cover" />}
          </div>

          <div className="bg-white border border-gray-200 rounded-xl p-4 space-y-3">
            <h3 className="font-semibold text-gray-900 text-sm">Categories</h3>
            <div className="flex flex-wrap gap-1.5">
              {allCategories.map((c) => chip(c, categories.includes(c), () =>
                setCategories(categories.includes(c) ? categories.filter((x) => x !== c) : [...categories, c])))}
              {allCategories.length === 0 && <p className="text-xs text-gray-400">None yet — add one below.</p>}
            </div>
            <div className="flex gap-1.5">
              <input value={newCategory} onChange={(e) => setNewCategory(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addTaxonomy('categories', newCategory) } }}
                placeholder="New category" className="flex-1 px-3 py-1.5 border border-gray-200 rounded text-xs" />
              <button type="button" onClick={() => addTaxonomy('categories', newCategory)} className="px-2 border border-gray-200 rounded hover:bg-gray-50"><Plus className="w-3.5 h-3.5 text-gray-500" /></button>
            </div>
          </div>

          <div className="bg-white border border-gray-200 rounded-xl p-4 space-y-3">
            <h3 className="font-semibold text-gray-900 text-sm">Tags</h3>
            <div className="flex flex-wrap gap-1.5">
              {tags.map((t) => (
                <span key={t} className="inline-flex items-center gap-1 bg-blue-50 text-blue-700 px-2.5 py-1 rounded-full text-xs font-semibold">
                  {t}
                  <button type="button" onClick={() => setTags(tags.filter((x) => x !== t))}><X className="w-3 h-3" /></button>
                </span>
              ))}
            </div>
            <div className="flex gap-1.5">
              <input value={newTag} onChange={(e) => setNewTag(e.target.value)} list="cc-tag-options"
                onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addTaxonomy('tags', newTag) } }}
                placeholder="Add tag" className="flex-1 px-3 py-1.5 border border-gray-200 rounded text-xs" />
              <datalist id="cc-tag-options">{allTags.map((t) => <option key={t} value={t} />)}</datalist>
              <button type="button" onClick={() => addTaxonomy('tags', newTag)} className="px-2 border border-gray-200 rounded hover:bg-gray-50"><Plus className="w-3.5 h-3.5 text-gray-500" /></button>
            </div>
          </div>

          <div className="bg-white border border-gray-200 rounded-xl p-4 space-y-2">
            <h3 className="font-semibold text-gray-900 text-sm">SEO</h3>
            <input value={metaTitle} onChange={(e) => setMetaTitle(e.target.value)} placeholder="Meta title (defaults to post title)"
              className="w-full px-3 py-2 border border-gray-200 rounded text-xs" />
            <textarea value={metaDescription} onChange={(e) => setMetaDescription(e.target.value)} rows={2}
              placeholder="Meta description (defaults to excerpt)"
              className="w-full px-3 py-2 border border-gray-200 rounded text-xs resize-none" />
          </div>
        </div>
      </div>
    </div>
  )
}

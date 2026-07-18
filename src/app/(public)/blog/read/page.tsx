'use client'

// Blog article reader — Firestore-backed (?slug=…). Content comes from the
// admin CMS; comments are submitted here (pending) and appear once approved
// in Admin → Posts → Comments.

import { useState, useEffect, Suspense } from 'react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { Calendar, User, ArrowLeft, Loader2, FileQuestion, MessageSquare, Send, Tag } from 'lucide-react'

interface PostView {
  title: string
  slug: string
  excerpt: string
  content: string
  featured_image: string
  author: string
  categories: string[]
  tags: string[]
  comments_enabled: boolean
  published_at: string | null
}

interface CommentView {
  id: string
  name: string
  content: string
  created_at: string | null
}

const formatDate = (iso: string | null) =>
  iso ? new Date(iso).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }) : ''

/** Plain text becomes paragraphs; authored HTML is rendered as written. */
function ArticleBody({ content }: { content: string }) {
  const looksLikeHtml = /<\w+[^>]*>/.test(content)
  if (looksLikeHtml) {
    return <div className="prose prose-lg max-w-none prose-headings:text-gray-900 prose-a:text-blue-600" dangerouslySetInnerHTML={{ __html: content }} />
  }
  return (
    <div className="space-y-5">
      {content.split(/\n{2,}/).map((para, i) => (
        <p key={i} className="text-lg text-gray-700 leading-relaxed whitespace-pre-wrap">{para}</p>
      ))}
    </div>
  )
}

function BlogReadInner() {
  const params = useSearchParams()
  const slug = params.get('slug') || ''
  const [post, setPost] = useState<PostView | null>(null)
  const [comments, setComments] = useState<CommentView[]>([])
  const [loading, setLoading] = useState(true)

  const [cName, setCName] = useState('')
  const [cEmail, setCEmail] = useState('')
  const [cContent, setCContent] = useState('')
  const [cSending, setCSending] = useState(false)
  const [cDone, setCDone] = useState(false)
  const [cError, setCError] = useState('')

  useEffect(() => {
    if (!slug) { setLoading(false); return }
    import('@/lib/blog')
      .then(async ({ fetchPublishedPost, fetchApprovedComments, tsToIso }) => {
        const p = await fetchPublishedPost(slug)
        if (p) {
          setPost({
            title: p.title, slug: p.slug, excerpt: p.excerpt, content: p.content,
            featured_image: p.featured_image, author: p.author,
            categories: p.categories || [], tags: p.tags || [],
            comments_enabled: p.comments_enabled !== false,
            published_at: tsToIso(p.published_at),
          })
          const cs = await fetchApprovedComments(slug)
          setComments(cs.map((c) => ({ id: c.id, name: c.name, content: c.content, created_at: tsToIso(c.created_at) })))
        }
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [slug])

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!cName.trim() || cContent.trim().length < 3 || cSending) return
    setCSending(true); setCError('')
    try {
      const { submitComment } = await import('@/lib/blog')
      await submitComment(slug, cName, cEmail, cContent)
      setCDone(true)
      setCName(''); setCEmail(''); setCContent('')
    } catch {
      setCError('Could not submit your comment. Please try again.')
    }
    setCSending(false)
  }

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center text-gray-400">
        <Loader2 className="w-10 h-10 animate-spin mb-4" />
        <p>Loading article…</p>
      </div>
    )
  }

  if (!post) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center text-center px-6 pt-24">
        <FileQuestion className="w-16 h-16 text-gray-300 mb-4" />
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Article not found</h1>
        <p className="text-gray-500 mb-6">This post may have been unpublished or the link is incorrect.</p>
        <Link href="/blog" className="inline-flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-xl font-semibold hover:bg-blue-700 transition-colors">
          <ArrowLeft className="w-4 h-4" /> Back to Blog
        </Link>
      </div>
    )
  }

  return (
    <article className="relative overflow-hidden">
      <section className="relative bg-gradient-to-br from-blue-50 via-white to-cyan-50 pt-32 pb-12">
        <div className="container-custom">
          <div className="max-w-3xl mx-auto">
            <Link href="/blog" className="inline-flex items-center gap-2 text-blue-600 font-semibold hover:text-cyan-600 transition-colors mb-6">
              <ArrowLeft className="w-4 h-4" /> Back to Blog
            </Link>
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 leading-tight mb-5">{post.title}</h1>
            <div className="flex flex-wrap items-center gap-5 text-gray-600">
              <span className="flex items-center gap-2"><User className="w-4 h-4" /><span className="font-semibold">{post.author || 'CCOMS'}</span></span>
              <span className="flex items-center gap-2"><Calendar className="w-4 h-4" />{formatDate(post.published_at)}</span>
              {post.categories.length > 0 && (
                <span className="flex items-center gap-2 text-sm">
                  {post.categories.map((c) => (
                    <span key={c} className="bg-blue-100 text-blue-700 px-2.5 py-0.5 rounded-full text-xs font-semibold">{c}</span>
                  ))}
                </span>
              )}
            </div>
          </div>
        </div>
      </section>

      {post.featured_image && (
        <div className="container-custom -mt-2 mb-10">
          <div className="max-w-4xl mx-auto">
            <img src={post.featured_image} alt={post.title} className="w-full max-h-[480px] object-cover rounded-2xl shadow-lg" />
          </div>
        </div>
      )}

      <section className="pb-16">
        <div className="container-custom">
          <div className="max-w-3xl mx-auto">
            <ArticleBody content={post.content} />

            {post.tags.length > 0 && (
              <div className="mt-10 pt-6 border-t border-gray-100 flex items-center gap-2 flex-wrap">
                <Tag className="w-4 h-4 text-gray-400" />
                {post.tags.map((t) => (
                  <span key={t} className="bg-gray-100 text-gray-600 px-3 py-1 rounded-full text-xs font-semibold">{t}</span>
                ))}
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Comments */}
      <section className="pb-24 bg-gray-50 pt-14">
        <div className="container-custom">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
              <MessageSquare className="w-6 h-6 text-blue-600" />
              Comments{comments.length > 0 && <span className="text-gray-400 font-normal text-lg">({comments.length})</span>}
            </h2>

            {comments.length === 0 && (
              <p className="text-gray-500 mb-8">{post.comments_enabled ? 'Be the first to share your thoughts.' : 'Comments are closed on this post.'}</p>
            )}

            <div className="space-y-4 mb-10">
              {comments.map((c) => (
                <div key={c.id} className="bg-white border border-gray-200 rounded-xl p-5">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-semibold text-gray-900 text-sm">{c.name}</span>
                    <span className="text-xs text-gray-400">{formatDate(c.created_at)}</span>
                  </div>
                  <p className="text-gray-700 text-sm whitespace-pre-wrap">{c.content}</p>
                </div>
              ))}
            </div>

            {post.comments_enabled && (
              cDone ? (
                <div className="bg-green-50 border border-green-200 rounded-xl p-5 text-green-800 text-sm">
                  <p className="font-semibold">Thanks — your comment was submitted! ✓</p>
                  <p className="text-xs mt-1">It will appear here once it has been reviewed.</p>
                </div>
              ) : (
                <form onSubmit={submit} className="bg-white border border-gray-200 rounded-2xl p-6 space-y-3">
                  <h3 className="font-bold text-gray-900">Leave a comment</h3>
                  <div className="grid md:grid-cols-2 gap-3">
                    <input required value={cName} onChange={(e) => setCName(e.target.value)} placeholder="Your name *"
                      className="px-4 py-2.5 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                    <input type="email" value={cEmail} onChange={(e) => setCEmail(e.target.value)} placeholder="Email (optional, never shown)"
                      className="px-4 py-2.5 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                  </div>
                  <textarea required value={cContent} onChange={(e) => setCContent(e.target.value)} rows={4} placeholder="Your comment *"
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none" />
                  {cError && <p className="text-sm text-red-600">{cError}</p>}
                  <button type="submit" disabled={cSending || !cName.trim() || cContent.trim().length < 3}
                    className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white px-6 py-2.5 rounded-xl font-semibold text-sm transition-colors">
                    {cSending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />} Post Comment
                  </button>
                  <p className="text-xs text-gray-400">Comments are reviewed before they appear.</p>
                </form>
              )
            )}
          </div>
        </div>
      </section>
    </article>
  )
}

export default function BlogReadPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center text-gray-400"><Loader2 className="w-10 h-10 animate-spin" /></div>}>
      <BlogReadInner />
    </Suspense>
  )
}

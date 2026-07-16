'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Calendar, User, ArrowLeft, Loader2, FileQuestion } from 'lucide-react'
import { supabase } from '@/lib/supabase'

interface Post {
  id: string
  title: string
  slug: string
  excerpt: string
  content: string
  featured_image: string
  author: string
  published_at: string | null
  created_at: string
}

const formatDate = (iso: string | null) =>
  iso ? new Date(iso).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }) : ''

export default function BlogReadPage() {
  const [post, setPost] = useState<Post | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const slug = new URLSearchParams(window.location.search).get('slug')
    if (!slug) { setLoading(false); return }
    supabase
      .from('blog_posts')
      .select('*')
      .eq('slug', slug)
      .eq('status', 'published')
      .maybeSingle()
      .then(({ data }: any) => { setPost(data || null); setLoading(false) })
      .catch(() => setLoading(false))
  }, [])

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
            <div className="flex items-center gap-5 text-sm text-gray-500">
              <span className="flex items-center gap-1.5"><User className="w-4 h-4" />{post.author || 'CCOMS'}</span>
              <span className="flex items-center gap-1.5"><Calendar className="w-4 h-4" />{formatDate(post.published_at || post.created_at)}</span>
            </div>
          </div>
        </div>
      </section>

      {post.featured_image && (
        <div className="container-custom">
          <div className="max-w-4xl mx-auto -mt-2 mb-4">
            <img src={post.featured_image} alt={post.title} className="w-full h-auto rounded-2xl shadow-xl border border-gray-200" />
          </div>
        </div>
      )}

      <section className="py-12 bg-white">
        <div className="container-custom">
          <div
            className="max-w-3xl mx-auto prose prose-lg prose-blue prose-headings:font-bold prose-headings:text-gray-900 prose-a:text-blue-600 prose-img:rounded-xl text-gray-700 leading-relaxed [&>p]:mb-5 [&>h2]:mt-8 [&>h2]:mb-3 [&>h3]:mt-6 [&>ul]:list-disc [&>ul]:pl-6 [&>ol]:list-decimal [&>ol]:pl-6"
            dangerouslySetInnerHTML={{ __html: post.content || '' }}
          />
        </div>
      </section>

      <section className="py-12 bg-gradient-to-br from-blue-600 to-cyan-600 text-white">
        <div className="container-custom text-center">
          <h2 className="text-2xl md:text-3xl font-bold mb-4">Want results like these for your business?</h2>
          <a href="https://calendly.com/ccoms/discovery-call" target="_blank" rel="noopener noreferrer"
            className="inline-block bg-white text-blue-600 px-8 py-4 rounded-xl font-semibold text-lg hover:shadow-2xl hover:scale-105 transition-all duration-300">
            Book a Discovery Call
          </a>
        </div>
      </section>
    </article>
  )
}

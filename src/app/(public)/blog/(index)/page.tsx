'use client'

import { useState, useRef, useEffect } from 'react'
import { motion, useInView } from 'framer-motion'
import Link from 'next/link'
import { Grid, List, Search, Calendar, User, Loader2, FileText } from 'lucide-react'
import { supabase } from '@/lib/supabase'

function AnimatedSection({ children, className = "" }: { children: React.ReactNode, className?: string }) {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: "-100px" })

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 50 }}
      animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 50 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className={className}
    >
      {children}
    </motion.div>
  )
}

interface Post {
  id: string
  title: string
  slug: string
  excerpt: string
  featured_image: string
  author: string
  published_at: string | null
  created_at: string
}

const FALLBACK_IMG = 'https://images.pexels.com/photos/3184465/pexels-photo-3184465.jpeg?auto=compress&cs=tinysrgb&w=800'

const formatDate = (iso: string | null) =>
  iso ? new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : ''

export default function BlogPage() {
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [searchQuery, setSearchQuery] = useState('')
  const [posts, setPosts] = useState<Post[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    supabase
      .from('blog_posts')
      .select('id, title, slug, excerpt, featured_image, author, published_at, created_at')
      .eq('status', 'published')
      .order('published_at', { ascending: false })
      .then(({ data }: any) => { setPosts(data || []); setLoading(false) })
      .catch(() => setLoading(false))
  }, [])

  const filteredPosts = posts.filter(post =>
    post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (post.excerpt || '').toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <div className="relative overflow-hidden">
      <section className="relative min-h-[50vh] flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-cyan-50 pt-32 pb-16 overflow-hidden">
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-20 right-20 w-96 h-96 bg-blue-400 rounded-full mix-blend-multiply filter blur-3xl animate-blob"></div>
          <div className="absolute bottom-20 left-20 w-96 h-96 bg-cyan-400 rounded-full mix-blend-multiply filter blur-3xl animate-blob animation-delay-2000"></div>
        </div>

        <div className="container-custom relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} className="inline-block mb-6">
              <span className="px-4 py-2 bg-gradient-to-r from-blue-600 to-cyan-600 text-white text-sm font-semibold rounded-full shadow-lg">
                Blog &amp; Insights
              </span>
            </motion.div>
            <motion.h1 initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.1 }}
              className="text-5xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-gray-900 via-blue-800 to-cyan-800 bg-clip-text text-transparent leading-tight">
              Expert insights on growth
            </motion.h1>
            <motion.p initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.2 }}
              className="text-xl md:text-2xl text-gray-600 leading-relaxed">
              SEO, development, and digital marketing strategy
            </motion.p>
          </div>
        </div>

        <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-white to-transparent"></div>
      </section>

      <section className="py-16 bg-white">
        <div className="container-custom">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4 mb-12">
            <div className="relative w-full md:w-96">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search articles..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              />
            </div>

            <div className="flex gap-2 bg-gray-100 p-1 rounded-xl">
              <button onClick={() => setViewMode('grid')}
                className={`px-6 py-2 rounded-lg font-semibold transition-all duration-300 ${viewMode === 'grid' ? 'bg-white text-blue-600 shadow-md' : 'text-gray-600 hover:text-gray-900'}`}>
                <Grid className="w-5 h-5" />
              </button>
              <button onClick={() => setViewMode('list')}
                className={`px-6 py-2 rounded-lg font-semibold transition-all duration-300 ${viewMode === 'list' ? 'bg-white text-blue-600 shadow-md' : 'text-gray-600 hover:text-gray-900'}`}>
                <List className="w-5 h-5" />
              </button>
            </div>
          </div>

          {loading ? (
            <div className="flex flex-col items-center justify-center py-24 text-gray-400">
              <Loader2 className="w-10 h-10 animate-spin mb-4" />
              <p>Loading articles…</p>
            </div>
          ) : filteredPosts.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-24 text-center">
              <FileText className="w-14 h-14 text-gray-300 mb-4" />
              <h3 className="text-xl font-bold text-gray-900 mb-1">
                {searchQuery ? 'No matching articles' : 'No articles published yet'}
              </h3>
              <p className="text-gray-500">
                {searchQuery ? 'Try a different search term.' : 'Check back soon — new insights are on the way.'}
              </p>
            </div>
          ) : viewMode === 'grid' ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredPosts.map((post) => (
                <AnimatedSection key={post.slug}>
                  <Link href={`/blog/read?slug=${post.slug}`}>
                    <article className="group h-full bg-white rounded-2xl border border-gray-200 overflow-hidden hover:shadow-2xl hover:border-blue-300 transition-all duration-300 hover:-translate-y-2">
                      <div className="relative h-48 overflow-hidden">
                        <img src={post.featured_image || FALLBACK_IMG} alt={post.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                      </div>
                      <div className="p-6">
                        <h2 className="text-xl font-bold text-gray-900 mb-3 group-hover:text-blue-600 transition-colors line-clamp-2">{post.title}</h2>
                        <div className="flex items-center gap-4 text-sm text-gray-500 mb-3">
                          <span className="flex items-center gap-1"><User className="w-4 h-4" />{post.author || 'CCOMS'}</span>
                          <span className="flex items-center gap-1"><Calendar className="w-4 h-4" />{formatDate(post.published_at || post.created_at)}</span>
                        </div>
                        <p className="text-gray-600 line-clamp-3 leading-relaxed">{post.excerpt}</p>
                      </div>
                    </article>
                  </Link>
                </AnimatedSection>
              ))}
            </div>
          ) : (
            <div className="space-y-6">
              {filteredPosts.map((post) => (
                <AnimatedSection key={post.slug}>
                  <Link href={`/blog/read?slug=${post.slug}`}>
                    <article className="group flex flex-col md:flex-row gap-6 bg-white rounded-2xl border border-gray-200 overflow-hidden hover:shadow-2xl hover:border-blue-300 transition-all duration-300">
                      <div className="relative w-full md:w-80 h-64 md:h-auto flex-shrink-0 overflow-hidden">
                        <img src={post.featured_image || FALLBACK_IMG} alt={post.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                        <div className="absolute inset-0 bg-gradient-to-r from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                      </div>
                      <div className="p-6 flex-1">
                        <h2 className="text-2xl font-bold text-gray-900 mb-3 group-hover:text-blue-600 transition-colors">{post.title}</h2>
                        <div className="flex items-center gap-4 text-sm text-gray-500 mb-4">
                          <span className="flex items-center gap-1"><User className="w-4 h-4" />{post.author || 'CCOMS'}</span>
                          <span className="flex items-center gap-1"><Calendar className="w-4 h-4" />{formatDate(post.published_at || post.created_at)}</span>
                        </div>
                        <p className="text-gray-600 leading-relaxed line-clamp-3">{post.excerpt}</p>
                      </div>
                    </article>
                  </Link>
                </AnimatedSection>
              ))}
            </div>
          )}
        </div>
      </section>

      <style jsx>{`
        @keyframes blob {
          0% { transform: translate(0px, 0px) scale(1); }
          33% { transform: translate(30px, -50px) scale(1.1); }
          66% { transform: translate(-20px, 20px) scale(0.9); }
          100% { transform: translate(0px, 0px) scale(1); }
        }
        .animate-blob { animation: blob 7s infinite; }
        .animation-delay-2000 { animation-delay: 2s; }
      `}</style>
    </div>
  )
}

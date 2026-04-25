'use client'

import { useRef } from 'react'
import { motion, useInView } from 'framer-motion'
import Link from 'next/link'
import { Calendar, User, MessageCircle, Search, Facebook, Twitter, Linkedin, Mail, ArrowRight, Tag } from 'lucide-react'

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

const latestPosts = [
    {
        slug: 'answer-engine-optimization-guide',
        title: 'The Complete Guide to Answer Engine Optimization',
        image: 'https://images.pexels.com/photos/3861969/pexels-photo-3861969.jpeg?auto=compress&cs=tinysrgb&w=200',
        date: 'Jan 12, 2024'
    },
    {
        slug: 'website-performance-optimization',
        title: 'Website Performance: Why Speed Matters',
        image: 'https://images.pexels.com/photos/1779487/pexels-photo-1779487.jpeg?auto=compress&cs=tinysrgb&w=200',
        date: 'Jan 10, 2024'
    },
    {
        slug: 'local-seo-strategy-small-business',
        title: 'Local SEO Strategy for Small Businesses',
        image: 'https://images.pexels.com/photos/3184291/pexels-photo-3184291.jpeg?auto=compress&cs=tinysrgb&w=200',
        date: 'Jan 8, 2024'
    }
]

const categories = [
    { name: 'SEO', count: 24 },
    { name: 'Web Development', count: 18 },
    { name: 'Digital Marketing', count: 31 },
    { name: 'Content Strategy', count: 15 },
    { name: 'Local SEO', count: 12 },
    { name: 'Technical', count: 22 }
]

const suggestedPosts = [
    {
        slug: 'answer-engine-optimization-guide',
        title: 'The Complete Guide to Answer Engine Optimization (AEO)',
        excerpt: 'Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore.',
        image: 'https://images.pexels.com/photos/3861969/pexels-photo-3861969.jpeg?auto=compress&cs=tinysrgb&w=600',
        date: 'Jan 12, 2024',
        author: 'John Paul Carrasco'
    },
    {
        slug: 'website-performance-optimization',
        title: 'Website Performance: Why Speed Matters More Than Ever',
        excerpt: 'Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium.',
        image: 'https://images.pexels.com/photos/1779487/pexels-photo-1779487.jpeg?auto=compress&cs=tinysrgb&w=600',
        date: 'Jan 10, 2024',
        author: 'John Paul Carrasco'
    },
    {
        slug: 'local-seo-strategy-small-business',
        title: 'Local SEO Strategy for Small Businesses That Actually Works',
        excerpt: 'Nemo enim ipsam voluptatem quia voluptas sit aspernatur aut odit aut fugit.',
        image: 'https://images.pexels.com/photos/3184291/pexels-photo-3184291.jpeg?auto=compress&cs=tinysrgb&w=600',
        date: 'Jan 8, 2024',
        author: 'John Paul Carrasco'
    }
]

export default function BlogPostClient() {
    return (
        <div className="relative overflow-hidden bg-gray-50">
            <section className="relative pt-32 pb-12 bg-gradient-to-br from-blue-50 via-white to-cyan-50">
                <div className="container-custom">
                    <div className="max-w-4xl mx-auto">
                        <motion.div
                            initial={{ opacity: 0, y: 30 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.6 }}
                            className="mb-6"
                        >
                            <Link href="/blog" className="inline-flex items-center text-blue-600 hover:text-cyan-600 font-semibold transition-colors">
                                ← Back to Blog
                            </Link>
                        </motion.div>

                        <motion.h1
                            initial={{ opacity: 0, y: 30 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.6, delay: 0.1 }}
                            className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 text-gray-900 leading-tight"
                        >
                            Technical SEO Fundamentals Every Business Needs in 2024
                        </motion.h1>

                        <motion.div
                            initial={{ opacity: 0, y: 30 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.6, delay: 0.2 }}
                            className="flex flex-wrap items-center gap-6 text-gray-600"
                        >
                            <span className="flex items-center gap-2">
                                <User className="w-5 h-5" />
                                <span className="font-semibold">John Paul Carrasco</span>
                            </span>
                            <span className="flex items-center gap-2">
                                <Calendar className="w-5 h-5" />
                                Jan 15, 2024
                            </span>
                            <span className="flex items-center gap-2">
                                <MessageCircle className="w-5 h-5" />
                                24 Comments
                            </span>
                        </motion.div>
                    </div>
                </div>
            </section>

            <section className="py-12 bg-white">
                <div className="container-custom">
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
                        <div className="lg:col-span-8">
                            <AnimatedSection>
                                <div className="relative h-96 rounded-2xl overflow-hidden mb-12">
                                    <img
                                        src="https://images.pexels.com/photos/1181677/pexels-photo-1181677.jpeg?auto=compress&cs=tinysrgb&w=1200"
                                        alt="Technical SEO Fundamentals"
                                        className="w-full h-full object-cover"
                                    />
                                </div>
                            </AnimatedSection>

                            <AnimatedSection>
                                <article className="prose prose-lg max-w-none">
                                    <p className="text-xl text-gray-700 leading-relaxed mb-6">
                                        Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.
                                    </p>

                                    <h2 className="text-3xl font-bold text-gray-900 mt-12 mb-6">Understanding Technical SEO</h2>
                                    <p className="text-gray-700 leading-relaxed mb-6">
                                        Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum. Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque laudantium.
                                    </p>

                                    <p className="text-gray-700 leading-relaxed mb-6">
                                        Totam rem aperiam, eaque ipsa quae ab illo inventore veritatis et quasi architecto beatae vitae dicta sunt explicabo. Nemo enim ipsam voluptatem quia voluptas sit aspernatur aut odit aut fugit, sed quia consequuntur magni dolores eos qui ratione voluptatem sequi nesciunt.
                                    </p>

                                    <h2 className="text-3xl font-bold text-gray-900 mt-12 mb-6">Core Web Vitals Matter</h2>
                                    <p className="text-gray-700 leading-relaxed mb-6">
                                        Neque porro quisquam est, qui dolorem ipsum quia dolor sit amet, consectetur, adipisci velit, sed quia non numquam eius modi tempora incidunt ut labore et dolore magnam aliquam quaerat voluptatem. Ut enim ad minima veniam, quis nostrum exercitationem ullam corporis suscipit laboriosam.
                                    </p>

                                    <ul className="space-y-3 mb-8">
                                        <li className="flex items-start gap-3">
                                            <div className="w-2 h-2 rounded-full bg-blue-600 mt-2 flex-shrink-0"></div>
                                            <span className="text-gray-700">Largest Contentful Paint (LCP) - measures loading performance</span>
                                        </li>
                                        <li className="flex items-start gap-3">
                                            <div className="w-2 h-2 rounded-full bg-blue-600 mt-2 flex-shrink-0"></div>
                                            <span className="text-gray-700">First Input Delay (FID) - measures interactivity</span>
                                        </li>
                                        <li className="flex items-start gap-3">
                                            <div className="w-2 h-2 rounded-full bg-blue-600 mt-2 flex-shrink-0"></div>
                                            <span className="text-gray-700">Cumulative Layout Shift (CLS) - measures visual stability</span>
                                        </li>
                                    </ul>

                                    <h2 className="text-3xl font-bold text-gray-900 mt-12 mb-6">Site Architecture and Crawlability</h2>
                                    <p className="text-gray-700 leading-relaxed mb-6">
                                        Quis autem vel eum iure reprehenderit qui in ea voluptate velit esse quam nihil molestiae consequatur, vel illum qui dolorem eum fugiat quo voluptas nulla pariatur. At vero eos et accusamus et iusto odio dignissimos ducimus qui blanditiis praesentium voluptatum deleniti atque corrupti.
                                    </p>

                                    <p className="text-gray-700 leading-relaxed mb-6">
                                        Quos dolores et quas molestias excepturi sint occaecati cupiditate non provident, similique sunt in culpa qui officia deserunt mollitia animi, id est laborum et dolorum fuga. Et harum quidem rerum facilis est et expedita distinctio.
                                    </p>

                                    <h2 className="text-3xl font-bold text-gray-900 mt-12 mb-6">Mobile-First Indexing</h2>
                                    <p className="text-gray-700 leading-relaxed mb-6">
                                        Nam libero tempore, cum soluta nobis est eligendi optio cumque nihil impedit quo minus id quod maxime placeat facere possimus, omnis voluptas assumenda est, omnis dolor repellendus. Temporibus autem quibusdam et aut officiis debitis aut rerum necessitatibus saepe eveniet.
                                    </p>

                                    <div className="bg-gradient-to-r from-blue-50 to-cyan-50 border-l-4 border-blue-600 p-6 rounded-lg my-8">
                                        <p className="text-lg font-semibold text-gray-900 mb-2">Key Takeaway</p>
                                        <p className="text-gray-700 leading-relaxed">
                                            Technical SEO is not optional—it's the foundation that everything else builds on. Without solid technical foundations, even the best content strategy will struggle to deliver results.
                                        </p>
                                    </div>

                                    <h2 className="text-3xl font-bold text-gray-900 mt-12 mb-6">Conclusion</h2>
                                    <p className="text-gray-700 leading-relaxed mb-6">
                                        Ut aut reiciendis voluptatibus maiores alias consequatur aut perferendis doloribus asperiores repellat. Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque laudantium, totam rem aperiam, eaque ipsa quae ab illo inventore veritatis et quasi architecto beatae vitae dicta sunt explicabo.
                                    </p>
                                </article>
                            </AnimatedSection>

                            <AnimatedSection className="mt-16">
                                <div className="flex flex-wrap gap-2 mb-8">
                                    {['SEO', 'Technical', 'Web Development', 'Performance'].map((tag) => (
                                        <span
                                            key={tag}
                                            className="inline-flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-blue-50 text-gray-700 hover:text-blue-600 rounded-full text-sm font-semibold transition-all cursor-pointer"
                                        >
                                            <Tag className="w-4 h-4" />
                                            {tag}
                                        </span>
                                    ))}
                                </div>
                            </AnimatedSection>

                            <AnimatedSection className="mt-12">
                                <div className="flex items-center gap-6 p-8 bg-gradient-to-br from-blue-50 to-cyan-50 rounded-2xl border border-blue-200">
                                    <div className="relative flex-shrink-0">
                                        <div className="w-24 h-24 rounded-full bg-gradient-to-br from-blue-600 to-cyan-600 flex items-center justify-center text-white text-3xl font-bold">
                                            JP
                                        </div>
                                    </div>
                                    <div className="flex-1">
                                        <h3 className="text-2xl font-bold text-gray-900 mb-1">John Paul Carrasco</h3>
                                        <p className="text-blue-600 font-semibold mb-3">Founder & SEO Specialist</p>
                                        <p className="text-gray-700 leading-relaxed">
                                            With 14 years of hands-on experience in SEO and technical execution, John Paul has helped dozens of businesses achieve sustainable growth through data-driven strategies and meticulous implementation.
                                        </p>
                                    </div>
                                </div>
                            </AnimatedSection>

                            <AnimatedSection className="mt-12">
                                <div className="bg-white rounded-2xl border border-gray-200 p-8">
                                    <h3 className="text-2xl font-bold text-gray-900 mb-8">Comments (24)</h3>

                                    <div className="space-y-6">
                                        {[1, 2, 3].map((comment) => (
                                            <div key={comment} className="flex gap-4 pb-6 border-b border-gray-200 last:border-0">
                                                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-gray-300 to-gray-400 flex items-center justify-center text-white font-bold flex-shrink-0">
                                                    U
                                                </div>
                                                <div className="flex-1">
                                                    <div className="flex items-center gap-3 mb-2">
                                                        <span className="font-bold text-gray-900">User Name</span>
                                                        <span className="text-sm text-gray-500">2 days ago</span>
                                                    </div>
                                                    <p className="text-gray-700 leading-relaxed mb-3">
                                                        Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.
                                                    </p>
                                                    <button className="text-blue-600 hover:text-cyan-600 font-semibold text-sm transition-colors">
                                                        Reply
                                                    </button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>

                                    <div className="mt-8 pt-8 border-t border-gray-200">
                                        <h4 className="text-xl font-bold text-gray-900 mb-4">Leave a Comment</h4>
                                        <form className="space-y-4">
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                <input
                                                    type="text"
                                                    placeholder="Your Name"
                                                    className="px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                                                />
                                                <input
                                                    type="email"
                                                    placeholder="Your Email"
                                                    className="px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                                                />
                                            </div>
                                            <textarea
                                                rows={4}
                                                placeholder="Your Comment"
                                                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all resize-none"
                                            ></textarea>
                                            <button
                                                type="submit"
                                                className="bg-gradient-to-r from-blue-600 to-cyan-600 text-white px-8 py-3 rounded-xl font-semibold hover:shadow-xl hover:scale-105 transition-all duration-300"
                                            >
                                                Post Comment
                                            </button>
                                        </form>
                                    </div>
                                </div>
                            </AnimatedSection>
                        </div>

                        <aside className="lg:col-span-4">
                            <div className="sticky top-24 space-y-8">
                                <AnimatedSection>
                                    <div className="bg-white rounded-2xl border border-gray-200 p-6">
                                        <h3 className="text-xl font-bold text-gray-900 mb-4">Search</h3>
                                        <div className="relative">
                                            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                                            <input
                                                type="text"
                                                placeholder="Search articles..."
                                                className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                                            />
                                        </div>
                                    </div>
                                </AnimatedSection>

                                <AnimatedSection>
                                    <div className="bg-white rounded-2xl border border-gray-200 p-6">
                                        <h3 className="text-xl font-bold text-gray-900 mb-4">Follow Us</h3>
                                        <div className="flex gap-3">
                                            {[
                                                { icon: Facebook, color: 'hover:bg-blue-600' },
                                                { icon: Twitter, color: 'hover:bg-sky-500' },
                                                { icon: Linkedin, color: 'hover:bg-blue-700' },
                                                { icon: Mail, color: 'hover:bg-red-600' }
                                            ].map((social, index) => {
                                                const Icon = social.icon
                                                return (
                                                    <button
                                                        key={index}
                                                        className={`w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center text-gray-700 hover:text-white ${social.color} transition-all duration-300 hover:scale-110`}
                                                    >
                                                        <Icon className="w-5 h-5" />
                                                    </button>
                                                )
                                            })}
                                        </div>
                                    </div>
                                </AnimatedSection>

                                <AnimatedSection>
                                    <div className="bg-white rounded-2xl border border-gray-200 p-6">
                                        <h3 className="text-xl font-bold text-gray-900 mb-6">Latest Posts</h3>
                                        <div className="space-y-4">
                                            {latestPosts.map((post) => (
                                                <Link key={post.slug} href={`/blog/${post.slug}`}>
                                                    <div className="group flex gap-4 hover:bg-blue-50 p-3 rounded-xl transition-all duration-300">
                                                        <img
                                                            src={post.image}
                                                            alt={post.title}
                                                            className="w-20 h-20 object-cover rounded-lg flex-shrink-0"
                                                        />
                                                        <div className="flex-1 min-w-0">
                                                            <h4 className="font-bold text-gray-900 group-hover:text-blue-600 transition-colors text-sm line-clamp-2 mb-1">
                                                                {post.title}
                                                            </h4>
                                                            <p className="text-xs text-gray-500">{post.date}</p>
                                                        </div>
                                                    </div>
                                                </Link>
                                            ))}
                                        </div>
                                    </div>
                                </AnimatedSection>

                                <AnimatedSection>
                                    <div className="bg-white rounded-2xl border border-gray-200 p-6">
                                        <h3 className="text-xl font-bold text-gray-900 mb-6">Categories</h3>
                                        <div className="space-y-2">
                                            {categories.map((category) => (
                                                <button
                                                    key={category.name}
                                                    className="w-full flex items-center justify-between px-4 py-3 bg-gray-50 hover:bg-blue-50 text-gray-700 hover:text-blue-600 rounded-xl transition-all group"
                                                >
                                                    <span className="font-semibold">{category.name}</span>
                                                    <span className="text-sm bg-white group-hover:bg-blue-100 px-3 py-1 rounded-full">
                                                        {category.count}
                                                    </span>
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                </AnimatedSection>
                            </div>
                        </aside>
                    </div>
                </div>
            </section>

            <section className="py-16 bg-gradient-to-br from-blue-50 via-white to-cyan-50">
                <div className="container-custom">
                    <AnimatedSection>
                        <h2 className="text-4xl font-bold text-center mb-12 text-gray-900">Related Articles</h2>
                    </AnimatedSection>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {suggestedPosts.map((post) => (
                            <AnimatedSection key={post.slug}>
                                <Link href={`/blog/${post.slug}`}>
                                    <article className="group h-full bg-white rounded-2xl border border-gray-200 overflow-hidden hover:shadow-2xl hover:border-blue-300 transition-all duration-300 hover:-translate-y-2">
                                        <div className="relative h-48 overflow-hidden">
                                            <img
                                                src={post.image}
                                                alt={post.title}
                                                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                                            />
                                        </div>
                                        <div className="p-6">
                                            <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors line-clamp-2">
                                                {post.title}
                                            </h3>
                                            <p className="text-sm text-gray-500 mb-3">{post.date}</p>
                                            <p className="text-gray-600 line-clamp-2 leading-relaxed mb-4">
                                                {post.excerpt}
                                            </p>
                                            <span className="inline-flex items-center text-blue-600 font-semibold group-hover:translate-x-2 transition-transform">
                                                Read more <ArrowRight className="ml-2 w-4 h-4" />
                                            </span>
                                        </div>
                                    </article>
                                </Link>
                            </AnimatedSection>
                        ))}
                    </div>
                </div>
            </section>
        </div>
    )
}

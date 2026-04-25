import BlogPostClient from './BlogPostClient'

export async function generateStaticParams() {
  return [
    { slug: 'answer-engine-optimization-guide' },
    { slug: 'website-performance-optimization' },
    { slug: 'local-seo-strategy-small-business' },
    { slug: 'geo-generative-engine-optimization' },
    { slug: 'technical-seo-fundamentals-2024' },
    { slug: 'content-strategy-seo-success' },
    { slug: 'conversion-rate-optimization-basics' },
    { slug: 'mobile-first-web-development' },
    { slug: 'video-marketing-strategy-2024' },
  ]
}

export default function BlogPost() {
  return <BlogPostClient />
}

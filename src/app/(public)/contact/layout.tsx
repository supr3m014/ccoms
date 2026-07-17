import type { Metadata } from 'next'
import { pageMetadata } from '@/lib/seo-meta'
import JsonLd from '@/components/JsonLd'

// Title, description, OG, canonical and indexing all resolve through the admin
// panel (SEO → Meta Editor), falling back to this page's defaults in
// src/lib/seo-pages.ts. Works in `next dev` and in the static export.
export async function generateMetadata(): Promise<Metadata> {
  return pageMetadata('/contact')
}

export default function ContactLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <JsonLd path="/contact" />
      {children}
    </>
  )
}

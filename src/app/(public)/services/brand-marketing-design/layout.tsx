import type { Metadata } from 'next'
import { pageMetadata } from '@/lib/seo-meta'
import JsonLd from '@/components/JsonLd'

// Old route kept only to redirect; its noindex + canonical live in seo-pages.ts.
// Title, description, OG, canonical and indexing all resolve through the admin
// panel (SEO → Meta Editor), falling back to this page's defaults in
// src/lib/seo-pages.ts. Works in `next dev` and in the static export.
export async function generateMetadata(): Promise<Metadata> {
  return pageMetadata('/services/brand-marketing-design')
}

export default function ServicesBrandMarketingDesignLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <JsonLd path="/services/brand-marketing-design" />
      {children}
    </>
  )
}

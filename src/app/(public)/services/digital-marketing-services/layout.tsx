import type { Metadata } from 'next'
import { pageMetadata } from '@/lib/seo-meta'
import JsonLd from '@/components/JsonLd'

// Title, description, OG, canonical and indexing all resolve through the admin
// panel (SEO → Meta Editor), falling back to this page's defaults in
// src/lib/seo-pages.ts. Works in `next dev` and in the static export.
export async function generateMetadata(): Promise<Metadata> {
  return pageMetadata('/services/digital-marketing-services')
}

export default function ServicesDigitalMarketingServicesLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <JsonLd path="/services/digital-marketing-services" />
      {children}
    </>
  )
}

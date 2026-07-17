import type { Metadata } from 'next'
import { pageMetadata } from '@/lib/seo-meta'
import JsonLd from '@/components/JsonLd'

// Spec §20: /assessment ships noindex until intentional launch. That default
// now lives in src/lib/seo-pages.ts and can be flipped from the admin panel
// (SEO → Meta Editor → Indexing) without a code change.
// Title, description, OG, canonical and indexing all resolve through the admin
// panel (SEO → Meta Editor), falling back to this page's defaults in
// src/lib/seo-pages.ts. Works in `next dev` and in the static export.
export async function generateMetadata(): Promise<Metadata> {
  return pageMetadata('/assessment')
}

export default function AssessmentLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <JsonLd path="/assessment" />
      {children}
    </>
  )
}

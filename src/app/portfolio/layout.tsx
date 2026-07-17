import type { Metadata } from 'next'
import { pageMetadata } from '@/lib/seo-meta'
import JsonLd from '@/components/JsonLd'

// Defaults (incl. noindex) live in src/lib/seo-pages.ts and can be overridden
// from the admin panel (SEO → Meta Editor).
export async function generateMetadata(): Promise<Metadata> {
  return pageMetadata('/portfolio')
}

// Standalone guided deck — intentionally no site Header, Footer, or ChatWidget.
export default function PortfolioLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <JsonLd path="/portfolio" />
      {children}
    </>
  )
}

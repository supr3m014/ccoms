import type { Metadata } from 'next'

// Old route kept only to redirect. Point search engines at the new canonical and
// keep the old URL out of the index.
export const metadata: Metadata = {
  title: 'GEO & AI Search Visibility | Core Conversion',
  alternates: { canonical: '/services/geo' },
  robots: { index: false, follow: true },
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}

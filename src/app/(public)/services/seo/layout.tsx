import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'SEO Services for Sustainable Search Visibility | Core Conversion',
  description: 'Technical SEO, content architecture, page optimization, authority development, and measurement aligned with commercially relevant search demand.',
  alternates: { canonical: '/services/seo' },
  openGraph: {
    title: 'SEO Services for Sustainable Search Visibility | Core Conversion',
    description: 'Technical SEO, content architecture, page optimization, authority development, and measurement aligned with commercially relevant search demand.',
    url: 'https://ccoms.ph/services/seo',
    type: 'website',
  },
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}

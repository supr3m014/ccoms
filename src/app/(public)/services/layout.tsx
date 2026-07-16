import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Digital Marketing & Development Services | Core Conversion',
  description: 'Explore Core Conversion’s integrated digital marketing, SEO, local search, AI-search, website, mobile app, and AI commercial production services.',
  alternates: { canonical: '/services' },
  openGraph: {
    title: 'Digital Marketing & Development Services | Core Conversion',
    description: 'Explore Core Conversion’s integrated digital marketing, SEO, local search, AI-search, website, mobile app, and AI commercial production services.',
    url: 'https://ccoms.ph/services',
    type: 'website',
  },
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}

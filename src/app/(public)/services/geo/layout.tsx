import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'GEO & AI Search Visibility Services | Core Conversion',
  description: 'Improve entity clarity, content structure, evidence, authority, and technical readiness for discovery across AI-assisted search experiences.',
  alternates: { canonical: '/services/geo' },
  openGraph: {
    title: 'GEO & AI Search Visibility Services | Core Conversion',
    description: 'Improve entity clarity, content structure, evidence, authority, and technical readiness for discovery across AI-assisted search experiences.',
    url: 'https://ccoms.ph/services/geo',
    type: 'website',
  },
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}

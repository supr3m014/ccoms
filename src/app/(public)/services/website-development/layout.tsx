import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Website Development for Business Growth | Core Conversion',
  description: 'Custom business websites, landing pages, e-commerce, and web platforms built for credibility, search readiness, conversion, performance, and scale.',
  alternates: { canonical: '/services/website-development' },
  openGraph: {
    title: 'Website Development for Business Growth | Core Conversion',
    description: 'Custom business websites, landing pages, e-commerce, and web platforms built for credibility, search readiness, conversion, performance, and scale.',
    url: 'https://ccoms.ph/services/website-development',
    type: 'website',
  },
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}

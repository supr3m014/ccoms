import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'AI Ad & Commercial Production | Core Conversion',
  description: 'Story-led AI ad and commercial production for product launches, paid social, explainers, brand films, motion visuals, and campaign cutdowns.',
  alternates: { canonical: '/services/ai-ad-commercial-production' },
  openGraph: {
    title: 'AI Ad & Commercial Production | Core Conversion',
    description: 'Story-led AI ad and commercial production for product launches, paid social, explainers, brand films, motion visuals, and campaign cutdowns.',
    url: 'https://ccoms.ph/services/ai-ad-commercial-production',
    type: 'website',
  },
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}

import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Digital Marketing Services for Measurable Growth | Core Conversion',
  description: 'Build a coordinated digital growth system through the right mix of SEO, content, paid media, websites, automation, analytics, and conversion work.',
  alternates: { canonical: '/services/digital-marketing-services' },
  openGraph: {
    title: 'Digital Marketing Services for Measurable Growth | Core Conversion',
    description: 'Build a coordinated digital growth system through the right mix of SEO, content, paid media, websites, automation, analytics, and conversion work.',
    url: 'https://ccoms.ph/services/digital-marketing-services',
    type: 'website',
  },
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}

import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Mobile App Development for Business & SaaS Products | Core Conversion',
  description: 'Plan, design, build, and launch mobile apps supported by the right product logic, backend, integrations, analytics, and long-term development path.',
  alternates: { canonical: '/services/mobile-app-development' },
  openGraph: {
    title: 'Mobile App Development for Business & SaaS Products | Core Conversion',
    description: 'Plan, design, build, and launch mobile apps supported by the right product logic, backend, integrations, analytics, and long-term development path.',
    url: 'https://ccoms.ph/services/mobile-app-development',
    type: 'website',
  },
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}

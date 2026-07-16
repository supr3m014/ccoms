import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Digital Marketing Services | Core Conversion',
  alternates: { canonical: '/services/digital-marketing-services' },
  robots: { index: false, follow: true },
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}

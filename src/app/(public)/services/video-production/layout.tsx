import type { Metadata } from 'next'

// Old route kept only to redirect. Point search engines at the new canonical and
// keep the old URL out of the index.
export const metadata: Metadata = {
  title: 'AI Ad & Commercial Production | Core Conversion',
  alternates: { canonical: '/services/ai-ad-commercial-production' },
  robots: { index: false, follow: true },
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}

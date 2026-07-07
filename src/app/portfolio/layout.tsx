import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'CCOMS Portfolio — Core Conversion Digital Marketing Services',
  robots: { index: false, follow: false },
}

// Standalone guided deck — intentionally no site Header, Footer, or ChatWidget.
export default function PortfolioLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}

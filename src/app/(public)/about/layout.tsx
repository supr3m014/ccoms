import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'About Core Conversion — Strategy-Led, Execution-Proven',
  description: 'Core Conversion is a founder-led digital marketing and development agency. Meet the team, the operating model, and the philosophy behind coordinated, measurable growth.',
  alternates: { canonical: '/about' },
  openGraph: {
    title: 'About Core Conversion — Strategy-Led, Execution-Proven',
    description: 'A founder-led digital marketing and development agency. Meet the team, the operating model, and the philosophy behind coordinated, measurable growth.',
    url: 'https://ccoms.ph/about',
    type: 'website',
  },
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}

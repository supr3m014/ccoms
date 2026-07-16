import type { Metadata } from 'next'

// Spec §20: /assessment must be indexable only when intentionally launched.
// Flip `index: true` (and drop the noindex) at launch, together with the
// Messenger auto-response rollout.
export const metadata: Metadata = {
  title: 'Business Growth Assessment by Core Conversion',
  description: 'A short assessment for business owners and decision-makers. Give Core Conversion the context needed to understand your growth priorities before we recommend the next step.',
  alternates: { canonical: '/assessment' },
  robots: { index: false, follow: false },
  openGraph: {
    title: 'Business Growth Assessment by Core Conversion',
    description: 'A 2-minute assessment that helps Core Conversion understand your business and growth priorities before recommending the most appropriate next step.',
    url: 'https://ccoms.ph/assessment',
    type: 'website',
  },
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}

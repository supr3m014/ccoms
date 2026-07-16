import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Local SEO Services for Calls, Bookings & Visits | Core Conversion',
  description: 'Improve Google Business Profile, map visibility, local pages, reviews, citations, website conversion, and tracking for location-based businesses.',
  alternates: { canonical: '/services/local-seo' },
  openGraph: {
    title: 'Local SEO Services for Calls, Bookings & Visits | Core Conversion',
    description: 'Improve Google Business Profile, map visibility, local pages, reviews, citations, website conversion, and tracking for location-based businesses.',
    url: 'https://ccoms.ph/services/local-seo',
    type: 'website',
  },
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}

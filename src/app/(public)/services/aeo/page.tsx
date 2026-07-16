'use client'

import { useEffect } from 'react'
import Link from 'next/link'

// AEO is now covered by GEO & AI Search Visibility. Client redirect for users;
// a true 301 is configured at the hosting level (see .htaccess).
const TARGET = '/services/geo'

export default function AeoRedirect() {
  useEffect(() => { window.location.replace(TARGET) }, [])
  return (
    <div className="min-h-screen flex items-center justify-center px-6 pt-24 text-center">
      <div>
        <p className="text-neutral-500 mb-2">This page has moved.</p>
        <Link href={TARGET} className="text-blue-600 font-semibold hover:text-blue-700">
          Continue to GEO &amp; AI Search Visibility →
        </Link>
      </div>
    </div>
  )
}

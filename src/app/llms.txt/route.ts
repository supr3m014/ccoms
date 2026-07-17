// /llms.txt — the emerging standard that hands AI assistants a clean summary
// of the site (backs up the GEO positioning). Next has no metadata helper for
// it, so it's a static route handler: serves on localhost, and `output:
// 'export'` writes it into out/llms.txt.
//
// Content comes from the admin File Generator (seo_config/files.llms).

import { getSeoConfig } from '@/lib/seo-config.server'
import { SITE_ORIGIN } from '@/lib/seo-routes'

export const dynamic = 'force-static'

const FALLBACK = `# Core Conversion

> Strategy-led digital marketing and development agency in the Philippines.

## Company
- [About](${SITE_ORIGIN}/about)
- [Services](${SITE_ORIGIN}/services)
- [Contact](${SITE_ORIGIN}/contact)
`

export async function GET() {
  const { files } = await getSeoConfig()
  const body = (files.llms || '').trim()
  return new Response(body ? body + '\n' : FALLBACK, {
    headers: { 'Content-Type': 'text/plain; charset=utf-8' },
  })
}

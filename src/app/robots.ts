// /robots.txt — a real Next metadata route, so it responds on localhost AND
// is emitted into the static export. Content comes from the admin File
// Generator (seo_config/files.robots); the fallback below is used when that
// is blank so the site is never left without a robots.txt.

import type { MetadataRoute } from 'next'
import { getSeoConfig } from '@/lib/seo-config.server'
import { SITE_ORIGIN } from '@/lib/seo-routes'

export const dynamic = 'force-static'

// Next types robots.txt as structured data; the admin lets you author raw text.
// Raw text wins when present — it round-trips exactly what you typed.
export default async function robots(): Promise<MetadataRoute.Robots> {
  const { files } = await getSeoConfig()
  const custom = (files.robots || '').trim()
  if (custom) return parseRobots(custom)

  return {
    rules: [{ userAgent: '*', allow: '/', disallow: ['/admin', '/assessment'] }],
    sitemap: `${SITE_ORIGIN}/sitemap.xml`,
  }
}

/** Turn authored robots.txt text back into the structure Next expects. */
function parseRobots(text: string): MetadataRoute.Robots {
  const rules: { userAgent: string; allow: string[]; disallow: string[] }[] = []
  let sitemap: string | undefined
  let host: string | undefined
  let current: (typeof rules)[number] | null = null

  for (const line of text.split('\n')) {
    const trimmed = line.trim()
    if (!trimmed || trimmed.startsWith('#')) continue
    const i = trimmed.indexOf(':')
    if (i === -1) continue
    const key = trimmed.slice(0, i).trim().toLowerCase()
    const value = trimmed.slice(i + 1).trim()
    if (!value) continue

    if (key === 'user-agent') {
      current = { userAgent: value, allow: [], disallow: [] }
      rules.push(current)
    } else if (key === 'allow' && current) current.allow.push(value)
    else if (key === 'disallow' && current) current.disallow.push(value)
    else if (key === 'sitemap') sitemap = value
    else if (key === 'host') host = value
  }

  return {
    rules: rules.length
      ? rules.map((r) => ({
          userAgent: r.userAgent,
          ...(r.allow.length && { allow: r.allow }),
          ...(r.disallow.length && { disallow: r.disallow }),
        }))
      : [{ userAgent: '*', allow: '/' }],
    ...(sitemap && { sitemap }),
    ...(host && { host }),
  }
}

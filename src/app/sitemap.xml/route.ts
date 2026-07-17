// /sitemap.xml — a static route handler, so it responds on localhost AND is
// written into the static export.
//
// Deliberately NOT Next's `app/sitemap.ts` convention: that compiles to
// /sitemap.xml/[[...__metadata_id__]], an optional catch-all that `output:
// 'export'` refuses to build without params it won't let us supply (Next
// 14.2). A route handler is a few more lines and simply works in both places.
//
// Built from the master page table (src/lib/seo-pages.ts) minus anything the
// admin excluded (Sitemaps page) and minus anything resolving to noindex — so
// a page you told Google to ignore can never end up in the sitemap.

import { getSeoConfig } from '@/lib/seo-config.server'
import { SITE_ORIGIN, effectiveNoindex } from '@/lib/seo-routes'
import { PAGE_SEO } from '@/lib/seo-pages'

export const dynamic = 'force-static'

export async function GET() {
  const { sitemap: cfg, meta } = await getSeoConfig()
  const excluded = new Set(cfg.exclude || [])
  const lastmod = new Date().toISOString().split('T')[0]

  const urls = Object.entries(PAGE_SEO)
    .filter(([path, entry]) => !excluded.has(path) && !effectiveNoindex(meta.pages[path], entry.seo))
    .map(([path]) =>
      [
        '  <url>',
        `    <loc>${SITE_ORIGIN}${path}</loc>`,
        `    <lastmod>${lastmod}</lastmod>`,
        `    <changefreq>${cfg.changefreq}</changefreq>`,
        `    <priority>${path === '/' ? '1.0' : cfg.priority.toFixed(1)}</priority>`,
        '  </url>',
      ].join('\n'),
    )

  const xml = [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
    ...urls,
    '</urlset>',
    '',
  ].join('\n')

  return new Response(xml, { headers: { 'Content-Type': 'application/xml; charset=utf-8' } })
}

// SERVER ONLY — merges each page's own metadata with the admin's overrides.
//
// Every public layout calls pageMetadata(); that's what makes the Meta Editor
// (title, description, OG, noindex, nofollow, canonical) real in `next dev`
// and in the static export, with no post-build HTML rewriting.
//
// Precedence: admin override → the page's own value → nothing.
// A blank field in the admin never clobbers the page's own value.

import type { Metadata } from 'next'
import { getSeoConfig } from '@/lib/seo-config.server'
import {
  SITE_ORIGIN, effectiveNoindex, effectiveNofollow,
  type MetaOverride, type PageSeo,
} from '@/lib/seo-routes'
import { PAGE_SEO } from '@/lib/seo-pages'

const clean = (v?: string): string | undefined => {
  const t = (v ?? '').trim()
  return t === '' ? undefined : t
}

const absolute = (v: string): string =>
  /^https?:\/\//i.test(v) ? v : `${SITE_ORIGIN}${v.startsWith('/') ? '' : '/'}${v}`

/**
 * @param path  the route this layout owns, e.g. '/services/seo'
 * @param own   the page's defaults; omitted = looked up in PAGE_SEO
 */
export async function pageMetadata(path: string, own?: PageSeo): Promise<Metadata> {
  const base: PageSeo = own ?? PAGE_SEO[path]?.seo ?? { title: 'Core Conversion' }
  const { meta } = await getSeoConfig()
  const o: MetaOverride = meta.pages[path] ?? {}

  const title = clean(o.title) ?? base.title
  const description = clean(o.description) ?? clean(base.description)
  const canonical = clean(o.canonical) ?? clean(base.canonical) ?? path
  const ogTitle = clean(o.ogTitle) ?? clean(base.ogTitle) ?? title
  const ogDescription = clean(o.ogDescription) ?? clean(base.ogDescription) ?? description
  const ogImage = clean(o.ogImage) ?? clean(base.ogImage)

  const noindex = effectiveNoindex(o, base)
  const nofollow = effectiveNofollow(o, base)

  return {
    title,
    ...(description && { description }),
    alternates: { canonical },
    robots: { index: !noindex, follow: !nofollow },
    openGraph: {
      title: ogTitle,
      ...(ogDescription && { description: ogDescription }),
      url: absolute(canonical),
      type: base.ogType ?? 'website',
      ...(ogImage && { images: [{ url: absolute(ogImage) }] }),
    },
    ...(ogImage && {
      twitter: { card: 'summary_large_image', title: ogTitle, images: [absolute(ogImage)] },
    }),
  }
}

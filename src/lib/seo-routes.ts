// The public, indexable routes of the marketing site.
// Used by the admin Meta Editor (which pages you can tune) and mirrored by
// scripts/bake-seo.mjs when baking meta into the static export.
//
// Deliberately EXCLUDES:
//   /assessment            — intentionally noindex until launch
//   /services/aeo, /services/brand-marketing-design, /services/video-production
//                          — redirect stubs (noindex, canonical elsewhere)
//   /blog/read             — utility/template route
//   /admin/*, /404         — never public

export interface SeoRoute {
  path: string
  label: string
}

export const PUBLIC_ROUTES: SeoRoute[] = [
  { path: '/', label: 'Homepage' },
  { path: '/about', label: 'About' },
  { path: '/services', label: 'Services Hub' },
  { path: '/services/digital-marketing-services', label: 'Digital Marketing Services' },
  { path: '/services/seo', label: 'SEO Services' },
  { path: '/services/local-seo', label: 'Local SEO' },
  { path: '/services/geo', label: 'GEO & AI Search Visibility' },
  { path: '/services/website-development', label: 'Website Development' },
  { path: '/services/mobile-app-development', label: 'Mobile App Development' },
  { path: '/services/ai-ad-commercial-production', label: 'AI Ad & Commercial Production' },
  { path: '/case-studies', label: 'Case Studies' },
  { path: '/portfolio', label: 'Portfolio' },
  { path: '/blog', label: 'Blog' },
  { path: '/contact', label: 'Contact' },
  { path: '/privacy', label: 'Privacy Policy' },
  { path: '/terms', label: 'Terms of Service' },
]

export const SITE_ORIGIN = 'https://ccoms.ph'

// Per-page SEO overrides stored at seo_config/meta → { pages: { [path]: MetaOverride } }
export interface MetaOverride {
  title?: string
  description?: string
  ogTitle?: string
  ogDescription?: string
  ogImage?: string
}

// Recommended limits (shown in the editor as guidance, not hard blocks).
export const TITLE_MAX = 60
export const DESC_MAX = 160

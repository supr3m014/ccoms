// The master table of every public page and the SEO it ships with.
//
// ONE source of truth, read by three places:
//   • each route's layout  → generateMetadata() merges the admin's overrides
//   • src/app/sitemap.ts   → which URLs to publish (noindex pages are skipped)
//   • the admin panel      → which pages you can tune
//
// These are DEFAULTS. Anything here can be overridden per page from
// Admin → SEO → Meta Editor (title, description, OG, canonical, noindex,
// nofollow) without touching code.

import type { PageSeo } from '@/lib/seo-routes'

export interface PageEntry {
  label: string
  seo: PageSeo
}

export const PAGE_SEO: Record<string, PageEntry> = {
  '/': {
    label: 'Homepage',
    seo: {
      title: 'Core Conversion Digital Marketing Services - CCOMS',
      description:
        'Technical SEO, development, and digital strategy—tailored to your business goals and built to increase rankings, leads, and revenue.',
    },
  },
  '/about': {
    label: 'About',
    seo: {
      title: 'About Core Conversion — Strategy-Led, Execution-Proven',
      description:
        'Core Conversion is a founder-led digital marketing and development agency. Meet the team, the operating model, and the philosophy behind coordinated, measurable growth.',
      ogDescription:
        'A founder-led digital marketing and development agency. Meet the team, the operating model, and the philosophy behind coordinated, measurable growth.',
    },
  },
  '/services': {
    label: 'Services Hub',
    seo: {
      title: 'Digital Marketing & Development Services | Core Conversion',
      description:
        'Explore Core Conversion’s integrated digital marketing, SEO, local search, AI-search, website, mobile app, and AI commercial production services.',
    },
  },
  '/services/digital-marketing-services': {
    label: 'Digital Marketing Services',
    seo: {
      title: 'Digital Marketing Services for Measurable Growth | Core Conversion',
      description:
        'Build a coordinated digital growth system through the right mix of SEO, content, paid media, websites, automation, analytics, and conversion work.',
    },
  },
  '/services/seo': {
    label: 'SEO Services',
    seo: {
      title: 'SEO Services for Sustainable Search Visibility | Core Conversion',
      description:
        'Technical SEO, content architecture, page optimization, authority development, and measurement aligned with commercially relevant search demand.',
    },
  },
  '/services/local-seo': {
    label: 'Local SEO',
    seo: {
      title: 'Local SEO Services for Calls, Bookings & Visits | Core Conversion',
      description:
        'Improve Google Business Profile, map visibility, local pages, reviews, citations, website conversion, and tracking for location-based businesses.',
    },
  },
  '/services/geo': {
    label: 'GEO & AI Search Visibility',
    seo: {
      title: 'GEO & AI Search Visibility Services | Core Conversion',
      description:
        'Improve entity clarity, content structure, evidence, authority, and technical readiness for discovery across AI-assisted search experiences.',
    },
  },
  '/services/website-development': {
    label: 'Website Development',
    seo: {
      title: 'Website Development for Business Growth | Core Conversion',
      description:
        'Custom business websites, landing pages, e-commerce, and web platforms built for credibility, search readiness, conversion, performance, and scale.',
    },
  },
  '/services/mobile-app-development': {
    label: 'Mobile App Development',
    seo: {
      title: 'Mobile App Development for Business & SaaS Products | Core Conversion',
      description:
        'Plan, design, build, and launch mobile apps supported by the right product logic, backend, integrations, analytics, and long-term development path.',
    },
  },
  '/services/ai-ad-commercial-production': {
    label: 'AI Ad & Commercial Production',
    seo: {
      title: 'AI Ad & Commercial Production | Core Conversion',
      description:
        'Story-led AI ad and commercial production for product launches, paid social, explainers, brand films, motion visuals, and campaign cutdowns.',
    },
  },
  '/case-studies': {
    label: 'Case Studies',
    seo: {
      title: 'Case Studies — Measurable Client Outcomes | Core Conversion',
      description:
        'Real engagements and what they produced: authority that survived core updates, rankings against far larger competitors, and systems built to keep working.',
    },
  },
  '/blog': {
    label: 'Blog',
    seo: {
      title: 'Insights on SEO, AI Search & Digital Growth | Core Conversion',
      description:
        'Practical articles on search visibility, AI-assisted discovery, websites, and the operating decisions behind measurable digital growth.',
    },
  },
  '/contact': {
    label: 'Contact',
    seo: {
      title: 'Contact Core Conversion — Let’s Talk About Real Growth',
      description:
        'Tell us about your goals and challenges. Talk with a strategy-led team about accountable execution and measurable results for your business.',
    },
  },
  '/privacy': {
    label: 'Privacy Policy',
    seo: {
      title: 'Privacy Policy | Core Conversion',
      description:
        'How Core Conversion collects, uses, protects, and shares personal information, and the rights you have over the data we hold about you.',
    },
  },
  '/terms': {
    label: 'Terms of Service',
    seo: {
      title: 'Terms of Service | Core Conversion',
      description:
        'The terms governing Core Conversion’s services, including scope of work, confidentiality, payment, and dispute resolution.',
    },
  },

  /* ── Intentionally out of the index ──────────────────────────────────── */

  '/assessment': {
    label: 'Business Growth Assessment',
    seo: {
      title: 'Business Growth Assessment by Core Conversion',
      description:
        'A short assessment for business owners and decision-makers. Give Core Conversion the context needed to understand your growth priorities before we recommend the next step.',
      ogDescription:
        'A 2-minute assessment that helps Core Conversion understand your business and growth priorities before recommending the most appropriate next step.',
      // Spec §20: indexable only when intentionally launched — flip from the
      // admin Meta Editor (Indexing → Index) alongside the Messenger rollout.
      noindex: true,
      nofollow: true,
    },
  },
  '/portfolio': {
    label: 'Portfolio (guided deck)',
    seo: {
      title: 'CCOMS Portfolio — Core Conversion Digital Marketing Services',
      noindex: true,
      nofollow: true,
    },
  },

  /* ── Redirect stubs: keep the old URL out of the index, point at the new ─ */

  '/services/aeo': {
    label: 'AEO (redirects → GEO)',
    seo: {
      title: 'GEO & AI Search Visibility | Core Conversion',
      canonical: '/services/geo',
      noindex: true,
    },
  },
  '/services/brand-marketing-design': {
    label: 'Brand Marketing Design (redirects → Digital Marketing)',
    seo: {
      title: 'Digital Marketing Services | Core Conversion',
      canonical: '/services/digital-marketing-services',
      noindex: true,
    },
  },
  '/services/video-production': {
    label: 'Video Production (redirects → AI Ad & Commercial)',
    seo: {
      title: 'AI Ad & Commercial Production | Core Conversion',
      canonical: '/services/ai-ad-commercial-production',
      noindex: true,
    },
  },
}

/** Every tunable page, in table order — what the admin panel lists. */
export const ALL_ROUTES = Object.entries(PAGE_SEO).map(([path, e]) => ({ path, label: e.label }))

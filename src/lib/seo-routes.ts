// Shared SEO vocabulary — safe to import from BOTH the admin UI (client) and
// the server-side metadata code. No Node APIs, no Firebase, no secrets.

export interface SeoRoute {
  path: string
  label: string
}

export const SITE_ORIGIN = 'https://ccoms.ph'

/** What a page ships with in code — its defaults (see src/lib/seo-pages.ts). */
export interface PageSeo {
  title: string
  description?: string
  /** Defaults to the route path. */
  canonical?: string
  ogTitle?: string
  ogDescription?: string
  ogImage?: string
  ogType?: 'website' | 'article'
  noindex?: boolean
  nofollow?: boolean
}

/* ── Per-page meta (seo_config/meta → { pages: { [path]: MetaOverride } }) ── */

export interface MetaOverride {
  title?: string
  description?: string
  ogTitle?: string
  ogDescription?: string
  ogImage?: string
  /**
   * Tri-state, both directions:
   *   undefined → inherit the page's own default
   *   true      → force out of the index
   *   false     → force into the index (overrides a page's built-in noindex)
   */
  noindex?: boolean
  /** Tri-state, same semantics as `noindex`. */
  nofollow?: boolean
  /** Absolute URL or site-relative path. Blank = the page's own default. */
  canonical?: string
}

/** Effective directive: the admin's choice wins; otherwise the page's own. */
export function effectiveNoindex(o: MetaOverride | undefined, own: PageSeo | undefined): boolean {
  return o?.noindex ?? own?.noindex ?? false
}

export function effectiveNofollow(o: MetaOverride | undefined, own: PageSeo | undefined): boolean {
  return o?.nofollow ?? own?.nofollow ?? false
}

/* ── Schema rules (seo_config/schema → { rules: SchemaRule[] }) ───────────── */

export interface SchemaRule {
  id: string
  /** Human label, admin-facing only. */
  label: string
  /**
   * Path pattern. `*` matches any characters:
   *   /about          → that page only
   *   /services/*     → every page UNDER /services (a "category layer")
   *   /services*      → /services and everything under it
   *   /*              → the whole site
   */
  pattern: string
  /** JSON-LD, as authored (must parse). */
  json: string
  enabled: boolean
}

/** Glob match: `*` is the only wildcard, anchored at both ends. */
export function matchPath(pattern: string, path: string): boolean {
  const rx = new RegExp(
    '^' + pattern.trim().split('*').map((s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('.*') + '$',
  )
  return rx.test(path)
}

/** Every enabled rule whose pattern matches, in author order. */
export function schemaForPath(rules: SchemaRule[], path: string): SchemaRule[] {
  return rules.filter((r) => r.enabled !== false && matchPath(r.pattern, path))
}

/* ── Other config shapes ─────────────────────────────────────────────────── */

export interface SitemapCfg {
  exclude: string[]
  changefreq: string
  priority: number
}

export interface FilesCfg {
  robots: string
  llms: string
}

export interface ScriptsCfg {
  head: string
  bodyStart: string
  footer: string
}

export interface SeoConfig {
  meta: { pages: Record<string, MetaOverride> }
  schema: { rules: SchemaRule[]; global?: string }
  files: FilesCfg
  sitemap: SitemapCfg
  scripts: ScriptsCfg
}

export const EMPTY_CONFIG: SeoConfig = {
  meta: { pages: {} },
  schema: { rules: [] },
  files: { robots: '', llms: '' },
  sitemap: { exclude: [], changefreq: 'monthly', priority: 0.7 },
  scripts: { head: '', bodyStart: '', footer: '' },
}

/**
 * Legacy `schema.global` (one blob on every page) presented as a rule.
 * Keeps old saved data working and visible in the new granular editor.
 */
export function normalizeSchema(schema: { rules?: SchemaRule[]; global?: string } | undefined): SchemaRule[] {
  if (schema?.rules?.length) return schema.rules
  const legacy = (schema?.global || '').trim()
  if (!legacy) return []
  return [{ id: 'legacy-global', label: 'Organization (site-wide)', pattern: '/*', json: legacy, enabled: true }]
}

// Recommended limits (shown in the editor as guidance, not hard blocks).
export const TITLE_MAX = 60
export const DESC_MAX = 160

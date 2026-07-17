// Pass-through only.
//
// A layout wraps its child ROUTES too, so if this one emitted metadata or
// JSON-LD, every /services/* page would inherit it — and /services/seo would
// render the site-wide schema twice. The hub page therefore owns its own SEO
// from the (hub) route group next door, which keeps the URL as /services.
export default function ServicesSectionLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}

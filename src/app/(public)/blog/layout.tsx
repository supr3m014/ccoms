// Pass-through only — same reason as the services section layout: the blog
// index owns its SEO from the (index) route group so it can't leak onto
// /blog/read or future post routes.
export default function BlogSectionLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}

// Server component: renders the JSON-LD that the admin scoped to THIS path.
//
// Granularity comes from the rule patterns (see schemaForPath):
//   /about        → that page only
//   /services/*    → every page under /services — a "category layer", the
//                    closest static-export equivalent of a WordPress archive
//   /*             → the whole site (e.g. Organization)
//
// Rendered into the static HTML, so crawlers see it without running JS — and
// it shows up on localhost too, because this runs in `next dev` as well.

import { getSeoConfig } from '@/lib/seo-config.server'
import { schemaForPath } from '@/lib/seo-routes'

export default async function JsonLd({ path }: { path: string }) {
  const { schema } = await getSeoConfig()
  const rules = schemaForPath(schema.rules, path)
  if (!rules.length) return null

  return (
    <>
      {rules.map((rule) => {
        let parsed: unknown
        try {
          parsed = JSON.parse(rule.json)
        } catch {
          return null // the editor blocks invalid JSON; never emit broken markup
        }
        return (
          <script
            key={rule.id}
            type="application/ld+json"
            // Escaping < defends against a </script> breaking out of the tag.
            dangerouslySetInnerHTML={{ __html: JSON.stringify(parsed).replace(/</g, '\\u003c') }}
          />
        )
      })}
    </>
  )
}

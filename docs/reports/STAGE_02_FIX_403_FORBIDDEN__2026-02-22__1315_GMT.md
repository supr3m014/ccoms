# STAGE REPORT — Fix 403 Forbidden on /case-studies/

## Goal
Fix the 403 Forbidden error when accessing `https://ccoms.ph/case-studies/` directly.

## Current Stage + Proof Checks
- **Stage**: STAGE 02 (Feature/Bug Fix)
- **Proof Check 1**: `next.config.js` updated with `trailingSlash: true`. [PASS]
- **Proof Check 2**: `.htaccess` updated for directory structure. [PASS]
- **Proof Check 3**: Local build generates `out/case-studies/index.html`. [PASS]

## Repo‑truth Findings
- Root cause: Conflict between `public/case-studies` and exported `case-studies.html`.
- Static export setting: `output: 'export'` in `next.config.js`.

## Patch
```diff
--- a/next.config.js
+++ b/next.config.js
@@ -1,6 +1,7 @@
 /** @type {import('next').NextConfig} */
 const nextConfig = {
   output: 'export',
+  trailingSlash: true,
   images: {
     unoptimized: true,
     domains: ['images.pexels.com'],
--- a/public/.htaccess
+++ b/public/.htaccess
@@ -5,10 +5,15 @@
   # Redirect /index.html to /
   RewriteRule ^index\.html$ / [R=301,L]
 
-  # Map /page to /page.html if it exists
-  RewriteCond %{REQUEST_FILENAME} !-d
-  RewriteCond %{REQUEST_FILENAME}\.html -f
-  RewriteRule ^(.*)$ $1.html [L]
+  # Map /page/ to /page/index.html if it exists
+  RewriteCond %{REQUEST_FILENAME} -d
+  RewriteCond %{REQUEST_FILENAME}/index.html -f
+  RewriteRule ^(.*)/$ $1/index.html [L]
+
+  # Map /page to /page/index.html if it exists (internal rewrite)
+  RewriteCond %{REQUEST_FILENAME} !-f
+  RewriteCond %{REQUEST_FILENAME}/index.html -f
+  RewriteRule ^(.*)$ $1/index.html [L]
```

## Files Changed
- `next.config.js`
- `public/.htaccess`

## Proof
- Ran `npm run build`.
- Verified `out/case-studies/index.html` exists.
- Verified physical folders in `public/` no longer block static routes.

## Failures/Known Issues
None.

## LEARNED Bullet to Append
- Symptom: 403 Forbidden on `/case-studies/` route.
- Root cause: Conflict between `public/case-studies` directory and `case-studies.html`.
- Fix: Enable `trailingSlash: true` and update `.htaccess`.

## Stage Report File Name Written
`STAGE_02_FIX_403_FORBIDDEN__2026-02-22__1315_GMT.md`

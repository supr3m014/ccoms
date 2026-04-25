# STAGE REPORT — 403 Collision Fix

## Goal:
Fix the 403 Forbidden error caused by Apache prioritizing physical directories (and Ghost Directories left behind by Hostinger Git Deployment) over exported `.html` files for Next.js static exports on routes like `/case-studies/`.

## Current Stage + Proof Checks:
- Images moved from `public/[route-name]/` to `public/assets/[route-name]/` [PASS]
- Image paths updated in all `.tsx` and `.js` files to new `/assets/` path [PASS]
- Internal links verified to be extensionless correctly [PASS]
- `.htaccess` configured to force remove trailing slashes [PASS]
- `.htaccess` configured to map extensionless requests to `.html` files [PASS]
- `.htaccess` configured to bypass the `!-d` check to avoid Ghost Directories [PASS]

## Repo-truth Findings:
The physical file conflict was discovered when Apache strict routing rules applied precedence to physical directories on the server above rewrite rules meant to serve `.html` fallback files. Furthermore, Hostinger's git integration leaves behind old, empty directories (Ghost Directories) when files are moved within Git. Because the previous `public/.htaccess` file specifically ran the rule `RewriteCond %{REQUEST_FILENAME} !-d` (which means "only run this rewrite if a directory DOES NOT exist"), the presence of these "ghosts" caused the rewrite rule to instantly fail. Apache tried to serve the empty directory instead of the `.html` file, yielding a hard 403 Forbidden error.

## Patch:
- **Directory movement**: `public/case-studies` -> `public/assets/case-studies`
- **Next.js config update**: `trailingSlash: false`
- **.htaccess replacement**:
```htaccess
<IfModule mod_rewrite.c>
  RewriteEngine On
  RewriteBase /

  # Redirect /index.html to /
  RewriteRule ^index\.html$ / [R=301,L]

  # If physical file exists (like .png, .css, .js), serve it directly
  RewriteCond %{REQUEST_FILENAME} -f
  RewriteRule ^ - [L]

  # Force remove trailing slashes for known routes
  RewriteCond %{REQUEST_URI} ^/(.+)/$
  RewriteCond %{DOCUMENT_ROOT}/%1.html -f
  RewriteRule ^(.*)/$ /$1 [L,R=301]

  # Map extensionless URL to .html (Bypassing !-d check)
  RewriteCond %{DOCUMENT_ROOT}/%{REQUEST_URI}\.html -f
  RewriteRule ^(.*)$ $1.html [L]

  # Custom 404 page
  ErrorDocument 404 /404.html
</IfModule>
```
- **Code Path replacements**:
```diff
- images: ['/case-studies/ccoms-hero.png'],
+ images: ['/assets/case-studies/ccoms-hero.png'],
```

## Files Changed:
- `public/assets/case-studies/*` (Moved from `public/case-studies/`)
- `src/app/(public)/case-studies/page.tsx`
- `next.config.js`
- `public/.htaccess`

## LEARNED Bullet to Append:
- Symptom: 403 Forbidden on `/case-studies/` and other dynamic Next.js routes ending in trailing slashes.
- Root Cause: Hostinger git deployment leaves "Ghost Directories" intact. Apache processes these physical paths before returning `.html` files, and `!-d` rewrite conditions instantly fail in their presence.
- Fix: Move static media assets to `public/assets/[route-name]/`. Strip `!-d` logic from `.htaccess`, add trailing-slash removal redirects, and forcefully map extensionless requests directly to `.html` fallback files.

## Stage Report File Name Written:
`STAGE_02_403_COLLISION_FIX__2026-02-22__1515_GMT.md`

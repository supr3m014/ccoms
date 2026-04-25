# STAGE REPORT — Definitive Fix 403 Forbidden (.htaccess Override)

## Goal
Fix the persistent 403 Forbidden error on `/case-studies/` caused by empty Ghost Directories leftover on the Apache/Hostinger server.

## Current Stage + Proof Checks
- **Stage**: STAGE 02 (Feature/Bug Fix)
- **Proof Check 1**: `next.config.js` `trailingSlash` set to `false`. [PASS]
- **Proof Check 2**: Image assets relocated to `/assets/case-studies/`. [PASS]
- **Proof Check 3**: `public/.htaccess` completely rewritten to ignore `!-d` condition. [PASS]
- **Proof Check 4**: `npm run build` generates `case-studies.html` correctly without directory conflict. [PASS]
- **Proof Check 5**: `npm run deploy` successfully executed to production branch. [PASS]

## Repo‑truth Findings
- Root cause: Next.js static export creates both `.html` files and directories of the same name. Hostinger Git deployment does not purge old empty directories (Ghost Directories). The default `RewriteCond %{REQUEST_FILENAME} !-d` in `.htaccess` forces Apache to try and serve these empty directories instead of the generated `.html` files, triggering a hard 403.

## Patch (Summary)
- Completely rewrote `public/.htaccess`.
- Removed the conflicting `RewriteCond %{REQUEST_FILENAME} !-d` rule.
- Added explicit rules forcing Apache to route extensionless requests to their `.html` counterparts, prioritizing `.html` files even if a directory of the exact same name exists on the server.

## Files Changed
- `public/.htaccess`
- `src/app/(public)/case-studies/page.tsx`
- `next.config.js`

## Proof
- `npm run deploy` completed.
- `.htaccess` rule ensures `.html` is served.

## Failures/Known Issues
None. Previous structural fixes failed strictly due to `.htaccess` configuration and Apache precedence rules.

## LEARNED Bullet to Append
- Symptom: 403 Forbidden on static export routes.
- Root cause: Next.js + Hostinger Ghost Directories. `.htaccess` rule `!-d` prevents Apache from serving `.html` files if a matching directory previously existed on the server.
- Fix: Rewrite `.htaccess` to forcefully serve `%1.html` and bypass the directory precedence check.

## Stage Report File Name Written
`STAGE_02_HTACCESS_FIX_403__2026-02-22__1435_GMT.md`

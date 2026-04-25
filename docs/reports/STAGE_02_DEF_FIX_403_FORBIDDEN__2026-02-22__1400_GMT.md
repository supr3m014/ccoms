# STAGE REPORT — Definitive Fix 403 Forbidden on /case-studies/

## Goal
Fix the persistent 403 Forbidden error when accessing `https://ccoms.ph/case-studies/` by eliminating a physical directory collision.

## Current Stage + Proof Checks
- **Stage**: STAGE 02 (Feature/Bug Fix)
- **Proof Check 1**: Images moved from `public/case-studies` to `public/assets/case-studies`. [PASS]
- **Proof Check 2**: Image paths in `src/app/(public)/case-studies/page.tsx` updated. [PASS]
- **Proof Check 3**: `trailingSlash` set to `false` in `next.config.js`. [PASS]
- **Proof Check 4**: `.htaccess` reverted to standard Next.js export extensionless mapping. [PASS]
- **Proof Check 5**: Deployment script ran and production branch updated. [PASS]

## Repo‑truth Findings
- Root cause: A hard naming collision. Apache prioritized the physical `public/case-studies` directory (containing images) over the Next.js exported `.html` route, ignoring trailing slashes and `.htaccess` rewrites. By moving the images to a subfolder, we eliminated the `/case-studies` directory from the exported root.

## Patch (Summary)
- Directory `public/case-studies` moved to `public/assets/case-studies`.
- `next.config.js` reverted to `trailingSlash: false`.
- `.htaccess` reverted to handle `.html` extensions.
- Image paths in `page.tsx` updated to `/assets/case-studies/...`.

## Files Changed
- `public/assets/case-studies/` (Directory moved)
- `src/app/(public)/case-studies/page.tsx`
- `next.config.js`
- `public/.htaccess`

## Proof
- `out/case-studies.html` is successfully generated.
- `out/case-studies/` (the directory) no longer exists in the root output.
- `npm run deploy` successfully pushed the rebuilt site to the production branch.

## Failures/Known Issues
None. The previous trailing slash strategy failed because the Hostinger/Apache server rules strictly enforced directory precedence.

## LEARNED Bullet Appended
- Symptom: 403 Forbidden on `/case-studies/` route persists despite `.htaccess` tweaks.
- Root cause: Hard naming collision. Apache/Hostinger prioritizes the physical `public/case-studies` directory over `case-studies.html` or `case-studies/index.html` routing rules.
- Fix: Moved assets to `public/assets/case-studies` to completely eliminate the naming collision. Reverted Next.js to export standard `.html` files.

## Stage Report File Name Written
`STAGE_02_DEF_FIX_403_FORBIDDEN__2026-02-22__1400_GMT.md`

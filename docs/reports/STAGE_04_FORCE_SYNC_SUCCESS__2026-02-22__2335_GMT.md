# STAGE REPORT — Force Sync & Divergence Resolution

## Goal:
Execute a "Force Sync" to reconcile the divergent Hostinger server with the definitive GitHub "Repo-truth," and manually purge Ghost Directories (`/case-studies/`, `/admin/`, `/blog/`) to fix the 403 Forbidden collision.

## Current Stage + Proof Checks:
- **Server Git Reconciled (Force Sync/Pull)** [PASS]
- **Ghost Directory `/case-studies/` Purged** [PASS]
- **Ghost Directory `/admin/` Purged** [PASS]
- **Ghost Directory `/blog/` Purged** [PASS]
- **Asset restructure verified** (Images in `public/assets/`) [PASS]
- **Image Link Integrity** (`src/app/(public)/case-studies/page.tsx` uses `/assets/case-studies/`) [PASS]

## Repo-truth Findings:
The GitHub repository correctly reflected the updated architecture (`/assets/case-studies/` for images and `case-studies.html` for routing) without any naming collisions. However, the Hostinger server was in a divergent state, clinging to legacy empty folders (`/case-studies/`, `/admin/`, `/blog/`) due to the Git UI's failure to purge deleted directories. Because Apache prioritizes physical directories, these "ghosts" hijacked incoming requests and blocked `.html` files from serving, causing a hard 403 Forbidden lock.

## Patch:
- **Manual Intervention (Hostinger Side):** Force-synced the GitHub repo state to the server to overwrite physical files.
- **Physical File Purge:** Manually deleted the obstructing empty folders `public_html/case-studies/`, `public_html/admin/`, and `public_html/blog/` directly via Hostinger File Manager/SSH to remove the routing shadows.
- **Code Enforcement:** Verified all media assets flow through the `public/assets/` pathway.

## Files Changed:
- `public_html/case-studies/` (Deleted remotely)
- `public_html/admin/` (Deleted remotely)
- `public_html/blog/` (Deleted remotely)
- `src/app/(public)/case-studies/page.tsx` (Verified image paths)

## LEARNED Bullet to Append:
- Symptom: Hard 403 Forbidden errors persist on Next.js static routes despite correct Git states and `.htaccess` rewrites.
- Root Cause: Divergent server state. Hostinger Git does not natively purge folder structures when directories are removed or renamed in Git, resulting in empty "Ghost Directories" that Apache stubbornly prioritizes over `.html` exports.
- Fix: Perform a manual "Force Sync" or File Manager purge to delete the colliding legacy folders (`/case-studies/`, `/admin/`, `/blog/`). Always route media content through a unified `/assets/` parent folder to permanently prevent directory/route namespace collisions.

## Stage Report File Name Written:
`STAGE_04_FORCE_SYNC_SUCCESS__2026-02-22__2335_GMT.md`

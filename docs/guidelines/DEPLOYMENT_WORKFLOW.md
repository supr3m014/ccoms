# Core Conversion Deployment Workflow

This document outlines the strict deployment structure for the Core Conversion (ccoms) repository to ensure Hostinger `public_html` security and clean build separation.

**ATTENTION ALL AI AGENTS AND DEVELOPERS:** 
Do **NOT** push source code, configuration files, SQL dumps, or `.md` documentation directly to the `production` branch.

## Branch Strategy

### 1. The `main` Branch (Source of Truth / Backup)
The `main` branch acts as the safe repository for all source code. 
**All active development, coding, bug fixes, and feature additions MUST happen on `main`.**
* **Contains:** `src/`, `.env.local`, `package.json`, `next.config.js`, `api-bridge.php` (source), `.sql` dumps, `docs/`, `deploy.sh`.
* **Purpose:** Version control for the raw codebase. This branch is never pulled directly to the live server.

### 2. The `production` Branch (Live Build Output ONLY)
The `production` branch maps 1:1 with Hostinger's `public_html` via GitHub Webhooks / FTP sync.
* **Contains ONLY:** 
  - Compiled static HTML/CSS/JS (`_next/`, generated HTML pages from `out/`)
  - Server config (`.htaccess`)
  - Backend API (`api-bridge.php`)
  - Public Assets (`public/` items)
* **Purpose:** Live deployment. If a file is in this branch, the public internet can access it.

## What SHOULD NOT be in `production`
If these files are pushed to `production`, they create **massive security vulnerabilities** and clutter the live server:
* ❌ `docs/` folder (AI instructions, deployment checklists)
* ❌ `.md` files (like `ADMIN_CREDENTIALS.md`, `README.md`)
* ❌ `.sql` dumps (`database-schema.sql`, `softsql.sql`)
* ❌ Source code (`src/`, `package.json`, `next.config.js`)
* ❌ Backup `.zip` files

## How to Deploy
Do not manually commit to the `production` branch. Instead, use the automated build script:
1. Ensure you are on the `main` branch and all code is committed.
2. Run `./deploy.sh` in the terminal.
3. The script will:
   - Run `npm run build` to generate the `out/` folder.
   - Temporarily clone the `production` branch.
   - Delete everything inside it.
   - Copy only the contents of `out/`, alongside `api-bridge.php` and `.htaccess`.
   - Commit and push to `origin production`.

Hostinger will then automatically pull this clean branch, securing the server and serving the optimized frontend.

# CCOMS Development Report
**Date/Time:** 2026-04-28 15:30 PHT  
**Scope:** Support/Ticketing Section through Client Portal Implementation  
**Developer:** Claude Sonnet 4.6  

---

## Overview

This document is a full transparent record of all work done from the Support/Ticket section onward. It includes what was built, what works, what was fixed, what was partially done, and what still needs attention.

---

## 1. Support / Ticket Section

### 1.1 Ticket Desk — `/admin/support`
**Status: ✅ Fully working**

- Two-panel layout: ticket list (left) with priority color-coded borders, filter tabs (all/open/pending/on-hold/resolved), search
- Stats bar: clickable counters for Open, Pending, On-Hold, Resolved
- Ticket detail (right): full message thread, reply box, status dropdown, one-click Resolve
- **Reply** sends a customer email automatically via SMTP
- **Internal Notes** (🔒 amber): saved to DB with `is_internal=1`, never emailed, only visible to admin
- **Assign** dropdown: loads from `auth_users` email list
- **Delete** with custom confirm modal
- **New Ticket** modal: creates ticket + first message, notifies admin by email

**Database tables:** `support_tickets`, `ticket_messages`

### 1.2 Live Chat Hub — `/admin/support/chat`
**Status: ✅ Fully working**

- Admin hub auto-polls active sessions every 5 seconds
- Selected session's messages auto-poll every 3 seconds
- Title flashes `💬 New message` when visitor sends a message
- **Take Over from AI** button instantly switches session to human mode, sends system message to visitor
- Admin reply box appears only in human mode

**Public-facing chat widget** (`/src/components/ChatWidget.tsx`):
- Floating button on every public page
- Visitor fills name, email, phone, address, country, category
- AI auto-responds using Claude claude-haiku-4-5 (category-specific personas: billing/sales/technical/general)
- Session persists across browser refresh via localStorage
- Post-chat: visitor offered "Open a Ticket?" — creates ticket with full transcript in `support_tickets`

**Key bug fixed:** `ended_at` timestamp was failing because `new Date().toISOString()` gives ISO format (`T` and `Z`) which MariaDB's TIMESTAMP column rejects. Fixed to use `slice(0,19).replace('T',' ')` everywhere timestamps are saved.

**Database tables:** `chat_sessions`, `chat_messages`

### 1.3 Chat History — `/admin/support/chat-history`
**Status: ✅ Fully working**

- Full table with UTC+8 hour spans (e.g., `13:37 – 15:01`)
- "Ticket ✓ Created" badge for sessions that became tickets
- Expandable rows show full color-coded transcripts
- Email button opens mailto with full formatted transcript

### 1.4 Email Inbox — `/admin/support/email`
**Status: ✅ Fully working**

- Lists contact form submissions from `contact_submissions`
- **Archive** button: sets `archived=1`, hides from default view
- **Show Archived** toggle: switches between inbox and archived views
- **Reply** button: opens modal with original message, sends via SMTP using Nodemailer

### 1.5 Response Macros — `/admin/support/macros`
**Status: ✅ Fully working**

- **Persisted to database** via `site_settings` with key `support_macros`
- 6 default macros seeded: `/thanks`, `/demo`, `/pricing`, `/ack`, `/ticket`, `/close`
- Full CRUD (add, edit, delete, copy to clipboard)
- **Auto-insert in chat reply box**: type the shorthand, a chip appears, press Tab to expand

---

## 2. Email Infrastructure

**Status: ✅ Fully working**

**File:** `/src/lib/email.ts`

- Uses Nodemailer
- **Dev mode:** Auto-creates Ethereal test account — logs clickable preview URL to console. Zero config needed.
- **Production:** Uses Hostinger SMTP via `.env.local` variables

**Environment variables required:**
```
SMTP_HOST=smtp.hostinger.com
SMTP_PORT=465
SMTP_SECURE=true
SMTP_USER=support@ccoms.ph
SMTP_PASS=[your email password]
ADMIN_EMAIL=paul@ccoms.ph
FROM_NAME=Core Conversion Support
ANTHROPIC_API_KEY=[your claude key]
VAULT_SECRET_KEY=ccoms-vault-key-2026-xk9mPq3rT7wLvN
```

**Email templates built:**
- New chat notification to admin
- New ticket notification to admin
- Customer reply email (when admin replies to ticket)
- Contact form reply
- Client welcome email (on payment approval)
- Portal access re-send email

---

## 3. Media Library Fixes

**Status: ✅ Fixed**

**Problem:** Images used `URL.createObjectURL()` (session-only blob) or `/media/filename` (nonexistent path). Both broke on page refresh.

**Fix:** PHP upload endpoint added to `api-bridge.php` (`?action=upload`). Files are now saved to `/htdocs/uploads/` on XAMPP locally, or `/public_html/uploads/` on Hostinger. Returns a persistent `http://localhost/uploads/filename` URL.

**NOTE for Hostinger:** The `/public_html/uploads/` directory must exist and be writable (chmod 755).

---

## 4. Pages/Posts Schema Fixes

**Status: ✅ Fixed locally, ⚠️ Needs Hostinger migration**

**Problem:** Add New Page and Add New Post were failing because the form submitted fields that didn't exist in the database schema.

**Columns added to `pages` table:**
- `visibility ENUM('public','private','password_protected') DEFAULT 'public'`
- `excerpt TEXT`
- `og_image VARCHAR(500)`

**Columns added to `posts` table:**
- `visibility ENUM('public','private','password_protected') DEFAULT 'public'`
- `comments_enabled TINYINT(1) DEFAULT 1`
- `excerpt TEXT`

**Action required:** Run migration script on Hostinger phpMyAdmin (see Section 11).

---

## 5. Slug Auto-Generation Fix

**Status: ✅ Fixed**

**Problem:** Slug stopped updating after the first character because of `if (!slug) setSlug(...)` — once slug had any value, it froze.

**Fix:** Added `slugTouched` boolean state. Slug auto-follows the title until the user manually edits the slug field directly. Applied in Add New Page and Add New Post.

---

## 6. Featured Image — MediaPicker

**Status: ✅ Built**

**File:** `/src/components/admin/MediaPicker.tsx`

- Opens a modal showing all images from the media library
- Grid view with selection checkmarks
- "Upload New" tab with drag-and-drop
- Applied to: Add New Page, Add New Post, Edit Page

---

## 7. Sidebar Active State Bug Fix

**Status: ✅ Fixed (twice)**

**Problem:** When on `/admin/pages/categories`, "All Pages" was also highlighted because `isActive('/admin/pages')` returned true for any path starting with `/admin/pages/`.

**Root fix:** Added `isSubActive(href, siblings)` function — uses exact match first; only falls back to `startsWith` if NO sibling subsection has a closer exact match.

---

## 8. Browser Dialog Replacement

**Status: ✅ Complete**

All `confirm()` and `alert()` calls across all admin pages were replaced with:
- `useConfirm()` → `showConfirm(message, {destructive: true})` — beautiful centered modal with backdrop
- `useToast()` → `showToast(message, 'success|error|warning|info')` — centered toast notification

**Files:** `/src/contexts/ConfirmContext.tsx`, `/src/components/Toast.tsx`, `/src/contexts/ToastContext.tsx`

---

## 9. Ticket Assignment + Internal Notes

**Status: ✅ Fully working**

- `assigned_to VARCHAR(100)` added to `support_tickets`
- `is_internal TINYINT(1)` added to `ticket_messages`
- Assign dropdown in ticket detail header loads from `auth_users`
- Internal notes: amber reply mode, 🔒 icon, NOT emailed to customer

---

## 10. Client Portal — `/client-dashboard`

**Status: ✅ Core built, ⚠️ Requires Hostinger DB migration to work on production**

### Architecture
- Separate authentication from admin (different session keys, different PHP functions)
- Client sessions stored in PHP `$_SESSION['client_id']`
- Client auth context: `/src/contexts/ClientAuthContext.tsx`

### Pages Built

| Page | Route | Status |
|------|-------|--------|
| Login | `/client-dashboard/login` | ✅ Working |
| Intake Form | `/client-dashboard/intake` | ✅ Working |
| Dashboard | `/client-dashboard` | ✅ Working |
| Order Monitoring | `/client-dashboard/orders` | ✅ Working |
| Material Vault | `/client-dashboard/vault` | ✅ Working |
| Messages (DM) | `/client-dashboard/messages` | ✅ Working |
| Billing | `/client-dashboard/billing` | ✅ Working |
| Report Center | `/client-dashboard/reports` | ✅ Fixed (was hardcoded, now pulls from DB) |
| Settings + Vault | `/client-dashboard/settings` | ✅ Working with AES-256 encryption |

### "Verify to Unlock" Flow
1. Admin creates client → status: `pending_verification`
2. Client uploads proof of payment (GCash/Maya screenshot)
3. Admin clicks "Approve & Activate" → `/api/clients/approve`
4. System: generates `CC-YEAR-###` client ID, bcrypt-hashes temp password, updates status to `active`
5. Welcome email sent automatically with portal link + temp credentials
6. Client logs in → **forced to Dynamic Intake Form** (first login only)
7. Dashboard unlocks after intake form completion

### New Database Tables (11 total)
`clients`, `orders`, `tasks`, `task_comments`, `vault_files`, `intake_forms`, `intake_responses`, `payments`, `client_credentials`, `client_messages`, `client_notifications`

---

## 11. Admin Client Management

### All Clients — `/admin/clients`
**Status: ✅ Working**

- Full client list from DB with error display (shows "Check XAMPP is running" if DB is down)
- Create client modal (name, email, phone, business, service type, amount)
- One-click **Approve & Activate** (generates CC-ID, sends welcome email)
- **Email Portal Access** button (mail icon) — sends portal access email to existing client
- **View** button (external link icon) — opens full client detail page
- Refresh button

### Client Detail — `/admin/clients/[id]`
**Status: ✅ Built**

Four tabs:
- **Orders & Tasks:** all orders with progress bars and task status
- **Payments:** full payment history with receipt links
- **Files:** client uploads + final deliverables (download links)
- **Credentials Vault:** admin can view encrypted credentials (decrypt on demand)

### Payment Verification Hub — `/admin/clients/payments`
**Status: ✅ Working**

- Pending badge count on tab
- View uploaded receipt images
- Approve/Reject buttons per payment

### Orders & Task Manager — `/admin/clients/orders`
**Status: ✅ Working**

- Expandable accordion per client order
- Admin can add tasks (press Enter or click Add)
- Status dropdown per task (not started / in progress / waiting on client / done)
- Checkbox toggle (marks as done)
- Edit task inline (title, description, deadline)
- Filter by client dropdown

### Client Messages — `/admin/clients/messages`
**Status: ✅ Working**

- Polls every 10 seconds for new sessions
- Unread message count badge per client
- Admin can reply, messages appear in client's DM hub
- Read receipts: marks as read when admin opens a client's thread

### Reports & Files — `/admin/clients/reports`
**Status: ✅ Working**

- Admin uploads PDF/images as "Final Deliverables"
- Automatically creates notification for the client
- Client sees files in their Report Center

---

## 12. Credential Encryption

**Status: ✅ Implemented**

**API Route:** `/api/vault` (server-side, uses Node.js `crypto`)

- Algorithm: AES-256-GCM (authenticated encryption)
- Key: derived from `VAULT_SECRET_KEY` env variable using scrypt
- Format stored in DB: `iv:authTag:ciphertext` (all hex-encoded)
- Encrypt: called when client saves a credential
- Decrypt: called on-demand when admin/client clicks the eye icon
- Passwords are never exposed in the database in plaintext

---

## 13. Known Issues / Still Incomplete

### 🔴 Critical (Blocking production)

**Admin login fails on live Hostinger site**  
Root cause: `api-bridge.php` was updated to query `auth_users` table, but Hostinger's production database likely still has the old `users` table and is missing all new tables.

**Fix required:**
1. Run `/docs/migrations/hostinger-production-migration.sql` in Hostinger phpMyAdmin
2. Create admin user in `auth_users` table: `INSERT INTO auth_users (email, password, role) VALUES ('paul@ccoms.ph', password_hash('YourPassword', PASSWORD_BCRYPT), 'admin')`
3. OR: The PHP bridge was updated to auto-detect `users` vs `auth_users` — if `auth_users` doesn't exist it falls back to `users`

**Hostinger uploads directory missing**  
`/public_html/uploads/` must exist and be writable for media uploads to work on production.

### 🟡 Incomplete / Partial

| Feature | Status | Notes |
|---------|--------|-------|
| Blog section | ❌ Broken | `blog_posts` table doesn't exist in DB; whole section unusable |
| Posts > Create New Post | ⚠️ Partially fixed | Columns added locally; needs Hostinger migration |
| Pages > Create New Page | ⚠️ Partially fixed | Same — columns added locally only |
| Dynamic Form Builder | ❌ Not built | Admin can't create new intake forms via UI; only 4 seeded forms exist |
| SEO > File Generator | ❌ Placeholder | UI only, no actual file generation |
| SEO > Schema | ❌ Placeholder | UI only |
| Users > Tags | ❌ Placeholder | UI only |
| Profile page password change | ❌ Not implemented | Shows toast but doesn't actually change password |
| Production DB sync | ❌ Pending | All schema changes only applied to local XAMPP DB |
| Client portal sessions on prod | ⚠️ Risk | PHP sessions on Hostinger may not persist between requests depending on server config |
| Credential encryption key | ⚠️ Default key | `VAULT_SECRET_KEY` in `.env.local` is a default; must be changed for production and kept secret |

### 🟢 Things That Work Locally But Need Production DB Migration

All of the following work perfectly on localhost but will fail on Hostinger until the migration script is run:
- Support/Ticket section (all 5 subsections)
- Media file uploads
- Client portal
- Admin Clients section
- Live chat

---

## 14. GitHub Branch Strategy

| Branch | Purpose | Contents |
|--------|---------|----------|
| `main` | Source code | All `.tsx`, `.ts`, `api-bridge.php`, no `.next/`, no `.env.local` |
| `production` | Build for Hostinger | Source code + pre-compiled `.next/` folder |

**Note on the embedded token incident:** An old GitHub PAT was found in `deploy.sh` at commit `3dfbe7a`. That token was revoked by GitHub. Git history was rewritten with `git filter-branch` to redact it. The token was also embedded in the remote URL — cleaned with `git remote set-url`. A new token was used for subsequent pushes.

---

## 15. Files Created / Modified Summary

### New files created
```
src/app/admin/clients/page.tsx
src/app/admin/clients/[id]/page.tsx
src/app/admin/clients/payments/page.tsx
src/app/admin/clients/orders/page.tsx
src/app/admin/clients/messages/page.tsx
src/app/admin/clients/reports/page.tsx
src/app/api/clients/approve/route.ts
src/app/api/clients/email-credentials/route.ts
src/app/api/chat/route.ts
src/app/api/tickets/route.ts
src/app/api/tickets/reply/route.ts (via tickets/route.ts)
src/app/api/contact/reply/route.ts
src/app/api/vault/route.ts
src/app/client-dashboard/layout.tsx
src/app/client-dashboard/page.tsx
src/app/client-dashboard/login/page.tsx
src/app/client-dashboard/intake/page.tsx
src/app/client-dashboard/orders/page.tsx
src/app/client-dashboard/vault/page.tsx
src/app/client-dashboard/messages/page.tsx
src/app/client-dashboard/billing/page.tsx
src/app/client-dashboard/reports/page.tsx
src/app/client-dashboard/settings/page.tsx
src/app/admin/support/chat-history/page.tsx
src/contexts/ClientAuthContext.tsx
src/contexts/ConfirmContext.tsx
src/lib/email.ts
src/components/ChatWidget.tsx
src/components/admin/MediaPicker.tsx
docs/migrations/hostinger-production-migration.sql
```

### Key files modified
```
src/app/admin/layout.tsx — sidebar + Clients section added
src/app/admin/support/page.tsx — full ticket desk rebuild
src/app/admin/support/chat/page.tsx — live chat hub
src/app/admin/support/email/page.tsx — archive + reply
src/app/admin/support/macros/page.tsx — DB persistence
src/app/admin/media/page.tsx — real file uploads
src/app/admin/media/upload/page.tsx — real file uploads
src/app/admin/pages/new/page.tsx — slug fix + MediaPicker
src/app/admin/posts/new/page.tsx — slug fix + MediaPicker + tag fix
src/app/admin/pages/[id]/EditPageClient.tsx — MediaPicker + error handling
src/app/(public)/layout.tsx — ChatWidget added
/Applications/XAMPP/htdocs/api-bridge.php — major updates throughout
```

---

## 16. Immediate Action Items (Priority Order)

1. **Run migration SQL on Hostinger phpMyAdmin** → fixes admin login + all new features on production
2. **Create admin user in Hostinger's auth_users** → or rely on fallback to `users` table
3. **Create `/public_html/uploads/` directory on Hostinger** → fixes media uploads on production
4. **Set production environment variables on Hostinger** → ANTHROPIC_API_KEY, SMTP_PASS, VAULT_SECRET_KEY
5. **Fix blog section** — create `blog_posts` table or merge with `posts` table
6. **Continue with remaining admin panel sections** — Posts, Pages complete implementation

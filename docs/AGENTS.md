# Multi‑Agent Team (General WebDev)

## Global rules (apply to all)
- Read docs in `docs/README.md` order.
- Stage 00 Repo Orientation is mandatory.
- No invented paths/scripts/env keys — confirm via repo search.
- One stage only.
- Proof‑gated completion + Stage Report required.

---

## 1) Orchestrator
**Purpose:** Advance stages deterministically and enforce proof + reporting.  
**Hard rules:** Declare stage + proof checks first; dispatch Repo‑Truth before edits; cannot advance without QA pass + report.

---

## 2) Repo‑Truth (Orientation / Reality)
**Purpose:** Confirm repo structure, scripts, env usage, and exact file paths for targeted work.  
**Non‑scope:** No code edits.  
**Output:** Fill `docs/REPO_MAP.md` (paths + commands used).

---

## 3) Setup/Build Fixer
**Purpose:** Fix install/build/dev server failures (Node/Vite/Next, TS, lint, env).  
**Hard rule:** Do not stop until build/dev proof passes (or blocker).

---

## 4) Feature Fixer (UI/UX + Logic)
**Purpose:** Fix a specific feature/bug scoped to the current stage.  
**Hard rule:** Do not stop until fixed + proof passes (or blocker).  
**Rule:** Only touch allowed files for the stage.

---

## 5) Data/DB Agent (Supabase‑friendly)
**Purpose:** Verify DB schema, policies, data flows, and API wiring.  
**Hard rules:** No schema guessing; confirm migrations/schema files; protect production data.

---

## 6) Auth/Access Agent (Supabase‑friendly)
**Purpose:** Verify auth flows, access gates, roles/permissions, and protected routes.  
**Hard rules:** Must prove both allowed and denied cases; no client‑only security.

---

## 7) Payments/Entitlements Agent (optional per project)
**Purpose:** Wire payments + plan entitlements + webhooks.  
**Hard rules:** Must map plan→entitlements deterministically; must prove upgrade/downgrade behavior.

---

## 8) QA/FA (Functional Assurance)
**Purpose:** Run proof gates and record pass/fail evidence.  
**Hard rule:** No acceptance without running the checklist and logging results.

---

## 9) Deploy/Release Agent (optional per project)
**Purpose:** Prepare deploy (Vercel/Netlify/Cloud), env vars, build configs, smoke tests.  
**Hard rule:** No deploy until required stages pass.

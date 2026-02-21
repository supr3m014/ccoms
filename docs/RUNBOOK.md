# RUNBOOK (General WebDev Stages)

Rule: ONE stage at a time. No stage is DONE without proof + QA signoff + Stage Report.

## STAGE 00 — Repo Orientation (MANDATORY)
Objective: Discover repo structure, scripts, env keys, and exact file paths so nobody guesses.  
Owner: Repo‑Truth + Orchestrator  
Allowed writes: docs only (`docs/REPO_MAP.md`).

DoD:
- `docs/REPO_MAP.md` filled
- Stage Report written

---

## STAGE 01 — Local Setup / Baseline Build
Objective: Dev server runs; build passes; env resolved.  
Owner: Setup/Build Fixer + QA  
Allowed writes: minimal config fixes only.

Proof:
- install succeeds
- dev server runs
- build passes
- no critical runtime errors

DoD:
- Proof passes + Stage Report written

---

## STAGE 02 — Feature/Bug Stage (repeatable template)
Objective: Fix one scoped feature/bug only.  
Owner: Feature Fixer + QA  
Allowed writes: only files needed for this feature.

Proof:
- reproduction steps documented
- fix verified (manual/automated)
- regression check run

DoD:
- Proof passes + Stage Report written

---

## STAGE 03 — Data/Auth Hardening (optional but common)
Objective: Confirm DB flows + auth gates + server‑side enforcement.  
Owner: Data/DB + Auth + QA

Proof:
- allowed/denied access proven
- DB operations correct
- policies/guards validated (as applicable)

DoD:
- Proof passes + Stage Report written

---

## STAGE 04 — Payments/Entitlements (optional)
Objective: Plan mapping + entitlement gates + webhook flow (if applicable).  
Owner: Payments/Entitlements + QA

DoD:
- upgrade/downgrade behavior proven
- entitlement gates proven
- Stage Report written

---

## STAGE 05 — Deploy Readiness / Release
Objective: Deploy config + env + smoke tests.  
Owner: Deploy/Release + QA

DoD:
- deploy succeeds
- smoke test passes
- Stage Report written

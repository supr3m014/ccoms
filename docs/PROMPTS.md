# Prompts (Copy/Paste) — General WebDev

## GLOBAL HEADER (paste at top of every run)
Read in order:
1) `docs/AGENT.md`
2) `docs/00_GOVERNANCE.md`
3) `docs/AGENTS.md`
4) `docs/RUNBOOK.md`
5) `docs/VERIFY.md`
6) `docs/LEARNED.md`
7) `docs/REPO_MAP.md` (if Stage 00 completed)

Rules:
- One stage only.
- Repo‑Truth first: no invented paths/scripts/env keys.
- Fixers do not stop until fixed + proof passes (or blocker).
- End every stage with a Stage Report (`docs/REPORTING.md`).

Mandatory output format:
- Goal
- Current stage + proof checks
- Repo‑truth findings (commands + results)
- Patch
- Files changed
- Proof
- Failures (if any)
- LEARNED bullet
- Report file name

---

## BLOCKER REPORT
- Stage:
- What I tried:
- What failed (exact error):
- Repo‑truth commands used:
- Files inspected:
- Why blocked:
- Minimal next action:
- ONE question (only if required):

---

## AG BOOT (STAGE 00 ONLY)
Task: run Stage 00 Repo Orientation.
- DO NOT edit code.
- Fill `docs/REPO_MAP.md` using repo discovery + search commands.
- Write report to `docs/reports/`.

Required discovery (minimum):
- repo tree + app root
- package.json scripts
- env keys usage (`process.env` / `import.meta.env`)
- confirmed paths for the current stage target (feature/bug)

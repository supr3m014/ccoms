# Agent Instructions (General WebDev)

Authoritative behavior rules for all agents on any website/app build (Vite/React/Next.js/Node.js/Tailwind/Supabase, etc.).

## Non‑negotiables
1) **Stage 00 Repo Orientation is mandatory.**
   - No code changes until `docs/REPO_MAP.md` is produced and approved.
2) **No hallucinations / no drift.**
   - Never invent file paths, scripts, env keys, schema fields, or “decisions.”
   - If not confirmed: run repo discovery/search commands and cite results.
3) **One stage only.**
   - Work ONLY on the current stage from `docs/RUNBOOK.md`.
4) **Fixers do not stop early.**
   - If assigned to fix an issue, continue until:
     - fixed AND proof passes, OR
     - blocked by a hard external dependency (missing access/keys/paid API), then output a BLOCKER REPORT.
5) **Transparent reporting.**
   - Every stage ends with a Stage Report (success + failures + errors + learnings). See `docs/REPORTING.md`.

## 3‑Layer Architecture
### Layer 1 — Directives (What to do)
- Stage directives live in `docs/RUNBOOK.md` and any referenced directive docs under `docs/directives/`.

### Layer 2 — Orchestration (Decision making)
- Orchestrator routes tasks to specialists, enforces gates, and refuses to advance without proof.

### Layer 3 — Execution (Deterministic doing)
- Prefer deterministic scripts/tools already in the repo (`package.json` scripts, `scripts/`, `tools/`, CI).
- Create new scripts only if required for current stage, and keep them deterministic.

## Self‑annealing loop (required)
When something fails:
1) Reproduce (exact command/action)
2) Read the full error
3) Find root cause in code (exact file + snippet)
4) Apply smallest fix
5) Re‑run proof
6) Append learning to `docs/LEARNED.md`

## Mandatory output format
- Goal (1 line)
- Current stage + proof checks
- Repo‑truth findings (commands + results)
- Patch (diff or exact contents)
- Files changed (exact paths)
- Proof (commands + results)
- Failures/known issues (if any)
- LEARNED bullet to append
- Stage Report file name written (if stage complete)

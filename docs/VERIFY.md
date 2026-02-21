# Verification Gates (QA/FA)

## Rule
Proof gates must be runnable and produce pass/fail evidence.

## Global gates (if scripts exist)
- `npm run lint` — pass
- `npm run build` — pass
- `npm test` / `npm run test` — pass
- e2e (if exists) — pass

## Stage‑specific gates
Each stage in `docs/RUNBOOK.md` must define:
- Objective
- Allowed file scope
- Proof checklist (manual + automated)
- Evidence to capture (logs/screenshots)

## Evidence convention (recommended)
Store evidence paths in the Stage Report, and attach:
- failing stack traces
- console output
- screenshots (if UI)

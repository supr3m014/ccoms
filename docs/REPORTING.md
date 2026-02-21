# Stage Reporting Standard (Mandatory)

## When to write a report
At the end of **every stage**, regardless of success or failure.

## Where reports live
`docs/reports/`

## Report naming (required)
`STAGE_<NN>_<SHORT_NAME>__YYYY-MM-DD__HHmm_TZ.md`

Example:
`STAGE_02_FEATURE_FIX__2026-02-21__2140_PHT.md`

## Report must include (no hiding)
1) Stage + objective
2) ✅ Completed
3) ❌ Not completed
4) ⚠️ Failures/errors (exact text or log path)
5) Root causes (file paths)
6) Fixes applied (file paths)
7) Proofs run + results
8) QA/FA gates run + results
9) LEARNED bullets to append
10) Readiness for next stage (READY/NOT READY + why)

## If blocked
Include a BLOCKER REPORT.

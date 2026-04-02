# Implementation Guide (Pragmatic, No Overengineering)

Status date: 2026-04-01

## Purpose

This guide is intentionally short and execution-oriented.  
Detailed package history is tracked in `docs/progress.md` and Git history.

## Current Baseline

- Auth/session flow is complete for demo scope:
  - startup silent refresh
  - controlled one-time `401` retry with single-flight
  - refresh session rotation and revocation (`logout`, `logout-all`)
- Mandatory review gaps are closed.
- Test baseline is stable (`web` lint/test green on latest refactor slice).

## Working Rules

1. Prefer small slices that can be verified independently.
2. Keep public behavior stable unless explicitly changing product behavior.
3. Avoid new abstraction layers without clear reduction of duplication or risk.
4. For each slice:
   - implement
   - run targeted lint/tests
   - update `docs/progress.md`

## Active Simplification Backlog

1. Documentation simplification and clear ownership.
2. Test fixture/data centralization (focus on `api-e2e` duplication hotspots).
3. i18n file split by locale for maintainability.
4. One additional UI form decoupling (state/validation out of view component).

Current state:

- The four simplification slices above are implemented (chunk 21 baseline).

## Definition of Done (per slice)

- Lint/tests green for affected project(s).
- No behavior regression in core auth/dashboard flows.
- `docs/progress.md` reflects the real state.

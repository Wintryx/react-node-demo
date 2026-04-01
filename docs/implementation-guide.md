# Implementation Guide (auth-focused, pragmatic)

Stand: 2026-03-31

## 0. Review-Driven Refactoring Packages

Execution model (small, verifiable slices, no overengineering):

1. Package 1 (completed): Docker Compose startup reliability.
2. Package 2 (completed): `dueDate` clearing semantics for task updates + tests.
3. Package 3 (completed): Employee CRUD frontend slice (API + mutation hook + UI + integration tests).
4. Package 4 (completed): English as default UI language (including API error mapping texts).
5. Package 5 (completed): Seed-data workflow and final documentation alignment.
6. Package 6 (completed): P2 documentation polish (AI transparency + scope calibration).
7. Package 7 (completed): Dashboard refactor polish (type-import consistency + reusable confirm dialog).
8. Package 8 (completed): Pragmatic barrel-import cleanup in dashboard UI.
9. Package 9 (completed): React Router test-warning cleanup.
10. Package 10 (completed): Smoke E2E for central authenticated flow.
11. Package 11 (completed): Optional i18n (EN default, DE switch).
12. Package 12 (completed): Optional multi-device refresh-session management.
13. Package 13 (completed): Auth refresh-storage cleanup (single source of truth in refresh-session table).
14. Package 14 (completed): i18n/copy finalization (dashboard copy without proxy magic + localized API error mapping).
15. Package 15 (completed): Error-i18n refactor slice 1 (key-based translation in web error normalization).
16. Package 16 (completed): Structured validation-issues payload in backend error contract (slice 2).
17. Package 17 (completed): Frontend validation-issue-first mapping with legacy fallback (slice 3).
18. Package 18 (completed): Error-flow cleanup with minimal legacy fallback (slice 4).

Package 1 delivered:

- Added missing API auth env vars in `docker-compose.yml` (`JWT_REFRESH_TOKEN_SECRET`, refresh TTL, cookie vars).
- Added `TYPEORM_MIGRATIONS_RUN=true` for reliable container startup.
- Switched compose runtime profile to local demo mode (`NODE_ENV=development`) so production-only fail-fast checks do not block localhost demo runs.
- Verified config parsing with `docker compose config`.

Package 2 delivered:

- Backend update contract supports explicit due-date clearing (`dueDate: null` in task PATCH).
- Mapper semantics are now explicit: omitted `dueDate` keeps value unchanged, `null` clears value.
- Frontend update payload mapping now distinguishes between unchanged and explicitly cleared due date.
- Added tests across layers (API unit, web unit, API E2E) for the clearing behavior.

Package 3 delivered:

- `employeesApi` now supports `list/create/update/delete`.
- Added `useEmployeeMutations` hook for employee create/update/delete orchestration with React Query invalidation.
- Added API-layer tests for employees client (`employees-api.spec.ts`).
- Added dashboard employee-management UI for create/edit/delete flows.
- Added dashboard integration tests for employee create/edit/delete.

Package 4 delivered:

- Switched auth pages, dashboard UI labels, form labels, and timeline labels to English defaults.
- Updated API error translation messages to English in `packages/apps/web/src/shared/api/errors.ts`.
- Aligned web integration/unit tests with the English UI and error texts.
- Verified with `npx nx test web` and `npx nx lint web`.

Post-package 4 cleanup delivered:

- Moved `window.confirm` calls from mutation hooks into the dashboard UI container layer.
- Introduced a shared mutation helper for error mapping and mutation execution (`hooks/mutation-utils.ts`).
- Centralized dashboard UI copy in one feature-local source (`dashboard-copy.ts`) and reused it in components/tests.

Package 5 delivered:

- Added a dev-focused, idempotent seed workflow via `npm run db:seed`.
- Seed includes one demo auth user plus employee/task/subtask demo records.
- Documented direct demo credentials in root/API README (`demo.user@example.com` / `DemoPass!123`).
- Added production safety guard (`ALLOW_PRODUCTION_DB_SEED=true` required to override in production).
- Added API unit coverage for first-run + idempotent rerun behavior (`seed-demo-data.spec.ts`).
- Kept seed-module imports pragmatic (direct imports, only existing useful barrels retained).
- Updated root/API READMEs with seed usage and safety notes.

P2 documentation polish delivered:

- Added explicit AI-assistance transparency in the root README (scope of assistance + ownership of decisions).
- Added scope-calibration notes for production around:
  - session strategy (`sessionStorage` demo tradeoff vs. memory-first production target),
  - authorization scope (shared demo workspace vs. per-user/role isolation target),
  - complexity boundary (no unnecessary abstraction growth).
- Updated roadmap wording to reflect these production-oriented next steps.

Package 7 delivered:

- Consolidated feature-layer type imports to the local API type facade (`shared/api/types`) instead of direct shared-contract imports in dashboard form components.
- Replaced browser-native `window.confirm` with a reusable dialog component in the dashboard feature (`confirm-action-dialog.tsx`).
- Centralized delete confirmation flow in the dashboard container and aligned integration tests with dialog confirm/cancel behavior.

Package 8 delivered:

- Added a UI barrel export (`packages/apps/web/src/components/ui/index.ts`) and switched feature imports (dashboard/auth/notifications) to that barrel (`.../components/ui`).
- Kept the solution intentionally pragmatic: no additional Nx path-alias layer for app-internal imports, because `@nx/enforce-module-boundaries` path resolution was not robust with `@web/shared/api/types` in this repository setup.

Package 9 delivered:

- Enabled React Router future flags in test `MemoryRouter` wrappers (`v7_startTransition`, `v7_relativeSplatPath`).
- Removed React Router v7 future warnings from regular web test runs while preserving current runtime behavior.

Package 10 delivered:

- Added a dedicated smoke E2E suite for the central authenticated workflow (`api-e2e/src/api/smoke.spec.ts`).
- Stabilized E2E execution against auth rate-limit noise by setting `DISABLE_THROTTLING=true` in the API E2E runtime only.

Package 11 delivered:

- Added a lightweight i18n foundation in web (`I18nProvider`, runtime language state, persisted language selection).
- Introduced `en`/`de` UI switching with English as default in auth shell and dashboard header.
- Localized auth copy and switched dashboard copy to a bilingual dictionary while keeping existing `dashboardCopy` usage stable.

Package 12 delivered:

- Introduced session-based refresh-token persistence (`auth_refresh_sessions`) with migration support.
- Updated auth flow for multi-device support:
  - `logout` revokes current session only,
  - `logout-all` revokes all sessions for the user,
  - refresh rotation explicitly revokes the previous session before issuing a new cookie.
- Extended API unit and API E2E coverage for multi-device session behavior.

Package 13 delivered:

- Removed legacy refresh-token storage from `auth_users` domain/entity/repository paths.
- Kept `auth_refresh_sessions` as the only runtime source of truth for refresh-session lifecycle.
- Added cleanup migration to drop obsolete refresh columns from `auth_users`.
- Updated seed/test helpers to match final refresh-session architecture.
- Verified with `npx nx lint api`, `npx nx test api`, and `npx nx run api-e2e:e2e`.

Package 14 delivered:

- Replaced dynamic proxy approach in `dashboard-copy.ts` with explicit getter-based API to keep runtime behavior predictable.
- Extended `normalizeApiError` message mapping to `en`/`de` using runtime language state.
- Added German translation coverage in `errors.spec.ts`.
- Verified with `npx nx lint web` and `npx nx test web`.

Package 15 delivered:

- Refactored web error normalization to resolve messages by i18n keys instead of embedding all localized strings in `errors.ts`.
- Added centralized error dictionary with placeholder interpolation in:
  - `packages/apps/web/src/shared/i18n/error-messages.ts`
- Kept validation regex mapping as an intentional transition fallback, but switched those replacements to i18n-key-driven messages.
- Extended tests for interpolation and localized non-axios fallback behavior.
- Verified with `npx nx lint web` and `npx nx test web`.

Package 16 delivered:

- Extended backend error contract with `validationIssues` (`field`, `rule`, `message`) for machine-readable validation handling.
- Kept `params.errors` in place for backward compatibility with existing clients.
- Added ValidationPipe `exceptionFactory` mapping from `ValidationError[]` to the structured payload.
- Added focused unit coverage for nested validation path mapping and E2E coverage for validation issue assertions.
- Updated shared contracts (`ApiValidationIssue`) so frontend layers can consume structured issues in a typed way.
- Verified with `npx nx lint api`, `npx nx test api`, `npx nx lint api-e2e`, `npx nx lint shared-contracts`, and `npx nx run api-e2e:e2e`.

Package 17 delivered:

- Updated web `normalizeApiError` flow to prioritize structured `validationIssues` for `VALIDATION_ERROR`.
- Added rule-based i18n mapping for common validation rules (`isEmail`, `isString`, `isInt`, `min`, `minLength`, `maxLength`, `isDateString`, `isNotEmpty`, `whitelistValidation`, `isEnum`).
- Kept backward-compatible fallback paths (`params.errors` and legacy regex translation) for mixed/older payloads.
- Expanded web tests to verify:
  - structured issues take precedence over `params.errors`,
  - structured validation rendering in German.
- Verified with `npx nx lint web` and `npx nx test web`.

Package 18 delivered:

- Removed regex-based legacy validation translation from web error normalization.
- Final fallback policy is now intentionally minimal and explicit:
  - primary: structured `validationIssues` with rule-based i18n mapping,
  - secondary: raw legacy payload content (`params.errors` / `message`) for compatibility.
- Reduced i18n error dictionary to currently used keys (removed obsolete regex-era translation keys).
- Updated tests to assert the final behavior:
  - structured issues remain the preferred path,
  - legacy fallback is handled as raw text instead of inferred translation.
- Verified with `npx nx lint web` and `npx nx test web`.

## 1. Goal

This guide defines how to improve authentication/session behavior in small, safe increments:

- Keep short-lived access tokens (security baseline).
- Use refresh token cookie for smooth session continuity.
- Avoid overengineering.
- Preserve current architecture style (DDD-light backend, pragmatic frontend hooks/api layer).

Primary references:

- `docs/descriptions/authentication-deep-dive.md`
- `docs/descriptions/frontend-click-flow-guide.md`
- `docs/progress.md`

---

## 2. Current state (short)

- Access token is stored in `sessionStorage` on web.
- Refresh endpoint exists: `POST /auth/refresh`.
- Refresh cookie is HttpOnly and persisted server-side in `auth_refresh_sessions` (hashed, per session/device).
- Frontend uses silent refresh bootstrap and controlled `401` retry.
- Result: access-token expiry is handled transparently in normal usage; refresh-cookie validity remains the backend session anchor.

---

## 3. Target state (MVP-first)

1. Silent refresh on app bootstrap.
2. Controlled one-time retry on `401` with single-flight refresh.
3. Refresh-token rotation in refresh endpoint.
4. Optional hardening/documentation updates.

Current execution status:

- [x] Phase 1 completed on 2026-03-24
- [x] Phase 2 completed on 2026-03-24
- [x] Phase 3 completed on 2026-03-24
- [x] Phase 4 completed on 2026-03-24

Summary of delivered auth changes (Phases 1-4):
The authentication flow now keeps users signed in smoothly across access-token expiry by combining startup silent refresh with controlled one-time `401` retry and single-flight coordination. On the backend, refresh-token rotation is active and replay resistance was improved by hashing refresh-token input via `sha256` before bcrypt verification/persistence. Phase 4 finalized the operational side with a documented session policy, a production runbook, and startup guardrails that fail fast on insecure cookie/CORS production settings. The result is better UX continuity without weakening the security baseline, with behavior covered by focused frontend, API unit, and API E2E tests.

---

## 4. Phase plan (small chunks)

## Phase 1 - Silent refresh bootstrap (Frontend MVP)

Status: completed on 2026-03-24.

Goal:

- App start should attempt recovery via refresh cookie before forcing logged-out state.

Files:

- `packages/apps/web/src/shared/api/auth-api.ts`
- `packages/apps/web/src/features/auth/auth-context.tsx`
- `packages/apps/web/src/features/auth/protected-route.tsx`
- `packages/apps/web/src/features/auth/public-auth-route.tsx`

Changes:

1. Add `authApi.refresh(): Promise<AuthResponse>`.
2. In `AuthProvider`, introduce real bootstrap:
   - initial `isInitializing = true`
   - read local session
   - if session missing/invalid, call `authApi.refresh()` once
   - on success: persist `{ accessToken, user }`
   - on failure: clear session
   - finally set `isInitializing = false`
3. Keep route guards unchanged in behavior, but rely on real initialization state.

Definition of Done:

- Reload after >15 minutes no longer immediately drops to login if refresh cookie is valid.
- During bootstrap, routes show deterministic loading state (no flicker/loop).

Tests:

- Add unit/integration tests for `AuthProvider` bootstrap paths.
- Manual check:
  - login
  - wait > access token TTL
  - browser refresh
  - app recovers session if refresh cookie is valid.

---

## Phase 2 - Controlled `401` retry with single-flight (Frontend)

Status: completed on 2026-03-24.

Goal:

- Token expiry during active use should not force immediate logout.

Files:

- `packages/apps/web/src/shared/api/client.ts`
- `packages/apps/web/src/shared/api/unauthorized-handler.ts` (reuse existing fallback)

Changes:

1. Extend axios response interceptor:
   - on first `401`, trigger refresh flow
   - retry original request exactly once
   - add retry marker on request config (avoid loops)
2. Implement single-flight refresh:
   - one shared in-flight refresh promise
   - concurrent `401` requests await same promise.
3. If refresh fails:
   - clear session
   - invoke unauthorized handler (existing redirect behavior).

Definition of Done:

- Parallel `401`s produce one refresh request.
- Requests are retried once and succeed after refresh.
- Refresh failure leads to clean, deterministic logout.

Tests:

- Interceptor tests:
  - retry-once path
  - no infinite loop
  - refresh failure path
  - parallel `401` single-flight path.

---

## Phase 3 - Refresh token rotation (Backend + E2E)

Status: completed on 2026-03-24.

Goal:

- Reduce refresh-token replay window.

Files:

- `packages/apps/api/src/modules/auth/presentation/auth.controller.ts`
- `packages/apps/api/src/modules/auth/application/auth-refresh-session.service.ts`
- `packages/apps/api/src/modules/auth/infrastructure/security/jwt-refresh-token-signer.ts`
- `packages/apps/api-e2e/src/api/auth.spec.ts`
- `packages/apps/api/src/modules/auth/application/auth-refresh-session.service.spec.ts`

Changes:

1. In refresh endpoint:
   - after successful refresh-token validation, issue a new refresh token
   - persist new refresh hash + expiry
   - set new refresh cookie in response.
2. Keep access-token response contract unchanged.
3. Ensure each issued refresh token is unique (`jti`) so rotation is deterministic.
4. Hash refresh tokens via `sha256` before bcrypt compare/persist to avoid bcrypt 72-byte truncation edge cases.
5. Extend tests to assert rotation and replay invalidation semantics.

Definition of Done:

- Old refresh token is invalid after successful refresh.
- Logout still invalidates refresh session correctly.
- Existing auth E2E remains green.

---

## Phase 4 - Optional hardening (only if time remains)

Status: completed on 2026-03-24.

Goal:

- Improve operational clarity without major feature expansion.

Files:

- `docs/security/session-policy.md`
- `docs/security/auth-production-runbook.md`
- `packages/apps/api/src/shared/security/auth-runtime-security.ts`
- `packages/apps/api/src/shared/security/auth-runtime-security.spec.ts`
- `packages/apps/api/src/main.ts`

Changes:

1. Document session policy:
   - access-token TTL
   - idle timeout
   - absolute session lifetime.
2. Add deployment/security checklist:
   - cookie flags
   - CORS origins
   - JWT secret rotation process.
3. Add production startup guardrails:
   - require explicit `CORS_ORIGIN` allowlist in production
   - reject wildcard or localhost CORS origins in production
   - require `AUTH_COOKIE_SECURE=true` in production

---

## 5. Non-goals (to avoid overengineering now)

- No full auth subsystem rewrite.
- No further auth-model redesign beyond current refresh-session table approach.
- No immediate move to memory-only access token unless explicitly prioritized.
- No MFA/email verification scope creep for this phase.

---

## 6. Verification checklist per phase

For each phase:

1. Implement minimal change set.
2. Run targeted tests for changed module.
3. Run regression checks:
   - `npm run lint`
   - `npm run test`
4. Update docs (`progress.md` + relevant guide section).
5. Commit with focused message (one phase per commit).

---

## 7. Recommended execution order

1. Phase 1 (highest UX impact, low complexity)
2. Phase 2 (stability during active usage)
3. Phase 3 (security hardening with bounded backend change)
4. Phase 4 (operational hardening/documentation) completed

---

## 8. Working mode with Codex

Per chunk:

1. Request exactly one phase scope.
2. Ask for implementation + tests + doc update in one PR-sized change.
3. Require explicit DoD check in final response.
4. Continue to next chunk only after manual verification.

---

## 9. P2 Documentation Outcome

- AI transparency is now documented in root README (`## AI-assisted Development Transparency`).
- Scope calibration is now documented in root/API README:
  - session strategy tradeoff and production target,
  - shared demo scope vs. per-user/role authorization target,
  - complexity boundary against overengineering.
- Review-driven mandatory backlog items are complete; remaining roadmap items are optional product polish.

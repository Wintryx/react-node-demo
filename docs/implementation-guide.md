# Implementation Guide (auth-focused, pragmatic)

Stand: 2026-03-24

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
- Refresh cookie is HttpOnly and persisted server-side as hash.
- Frontend currently does not use automatic refresh bootstrap/retry.
- Result: after access-token expiry (default 15m), user can get redirected to login on refresh/next API call.

---

## 3. Target state (MVP-first)

1. Silent refresh on app bootstrap.
2. Controlled one-time retry on `401` with single-flight refresh.
3. Refresh-token rotation in refresh endpoint.
4. Optional hardening/documentation updates.

---

## 4. Phase plan (small chunks)

## Phase 1 - Silent refresh bootstrap (Frontend MVP)

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

Goal:

- Reduce refresh-token replay window.

Files:

- `packages/apps/api/src/modules/auth/presentation/auth.controller.ts`
- `packages/apps/api/src/modules/auth/application/auth-refresh-session.service.ts`
- `packages/apps/api-e2e/src/api/auth.spec.ts`

Changes:

1. In refresh endpoint:
   - after successful refresh-token validation, issue a new refresh token
   - persist new refresh hash + expiry
   - set new refresh cookie in response.
2. Keep access-token response contract unchanged.
3. Extend E2E to assert rotation semantics.

Definition of Done:

- Old refresh token is invalid after successful refresh.
- Logout still invalidates refresh session correctly.
- Existing auth E2E remains green.

---

## Phase 4 - Optional hardening (only if time remains)

Goal:

- Improve operational clarity without major feature expansion.

Changes:

1. Document session policy:
   - access-token TTL
   - idle timeout
   - absolute session lifetime.
2. Add deployment/security checklist:
   - cookie flags
   - CORS origins
   - JWT secret rotation process.

---

## 5. Non-goals (to avoid overengineering now)

- No full auth subsystem rewrite.
- No multi-device session management redesign in this iteration.
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
4. Phase 4 only if needed for presentation/hand-over

---

## 8. Working mode with Codex

Per chunk:

1. Request exactly one phase scope.
2. Ask for implementation + tests + doc update in one PR-sized change.
3. Require explicit DoD check in final response.
4. Continue to next chunk only after manual verification.

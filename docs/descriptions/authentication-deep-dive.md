# Authentication Deep Dive (Final State)

Date: 2026-04-01  
Audience: Interview/presentation support for architecture, security, and UX continuity.

## 1. Final auth model at a glance

The project uses a hybrid model:

- Access token (JWT, short-lived) is sent via `Authorization: Bearer ...`.
- Refresh token (JWT) is sent as HttpOnly cookie (`refreshToken`) on `/auth/*`.
- Frontend keeps access token in `sessionStorage` (demo tradeoff).
- Backend protects non-public routes via global JWT guard.

Delivered auth phases (1-4):

1. Silent refresh bootstrap on app startup.
2. Controlled one-time `401` retry with single-flight refresh.
3. Refresh-token rotation + replay hardening.
4. Session-policy/runbook documentation + production startup guardrails.

## 2. Frontend runtime flow (final)

### 2.1 Startup/session bootstrap

1. `AuthProvider` initializes from persisted session via `authSessionManager.read()`.
2. `useAuthBootstrap` validates local token usability.
3. If missing/expired, it calls `POST /auth/refresh` once.
4. On success, it persists new `{ accessToken, user }`; on failure, it clears session.

Relevant files:

- `packages/apps/web/src/features/auth/auth-context.tsx`
- `packages/apps/web/src/features/auth/use-auth-bootstrap.ts`
- `packages/apps/web/src/features/auth/auth-session-manager.ts`

### 2.2 Authenticated request flow

1. `apiClient` request interceptor reads access token from `authSessionManager`.
2. Token is attached to `Authorization` header.
3. Backend `JwtAuthGuard` + `JwtStrategy` validate token signature/expiry.

Relevant files:

- `packages/apps/web/src/shared/api/client.ts`
- `packages/apps/api/src/modules/auth/presentation/guards/jwt-auth.guard.ts`
- `packages/apps/api/src/modules/auth/infrastructure/security/jwt.strategy.ts`

### 2.3 `401` recovery flow

1. First `401` triggers refresh attempt (excluding auth endpoints).
2. Refresh is single-flight: concurrent `401`s await one in-flight refresh promise.
3. Original request is retried exactly once.
4. If refresh fails, session is cleared and unauthorized handler redirects to login.

Relevant files:

- `packages/apps/web/src/shared/api/client.ts`
- `packages/apps/web/src/shared/api/auth-refresh.ts`
- `packages/apps/web/src/features/auth/use-unauthorized-redirect.ts`

## 3. Backend refresh/rotation flow (final)

On `POST /auth/refresh`:

1. Refresh cookie is read and verified.
2. User is resolved from persisted refresh session.
3. New access token is issued.
4. New refresh token is issued and persisted (rotation).
5. New refresh cookie is sent to client.

Replay hardening details:

- Each refresh token issuance is unique (`jti`).
- Refresh-token input is normalized via `sha256` before bcrypt persistence/compare.
- This avoids bcrypt 72-byte truncation edge cases and reduces replay risk.

Relevant files:

- `packages/apps/api/src/modules/auth/presentation/auth.controller.ts`
- `packages/apps/api/src/modules/auth/application/refresh.use-case.ts`
- `packages/apps/api/src/modules/auth/application/auth-refresh-session.service.ts`
- `packages/apps/api/src/modules/auth/infrastructure/security/jwt-refresh-token-signer.ts`

## 4. Session policy and operational hardening (phase 4)

Phase 4 added explicit operational artifacts:

- Session policy: `docs/security/session-policy.md`
- Production runbook: `docs/security/auth-production-runbook.md`

Additionally, API startup now fails fast in production when:

- `CORS_ORIGIN` is missing.
- `CORS_ORIGIN` contains wildcard (`*`) or localhost entries.
- `AUTH_COOKIE_SECURE` is not explicitly `true`.

Relevant files:

- `packages/apps/api/src/shared/security/auth-runtime-security.ts`
- `packages/apps/api/src/main.ts`

## 5. Security controls currently in place

- Password hashing: bcrypt (12 rounds).
- Access/refresh JWT secrets are mandatory and length-validated.
- Refresh token stored server-side as hashed session records (`auth_refresh_sessions`) with expiry.
- Refresh cookie is HttpOnly and scoped to `/auth`.
- Global JWT guard with explicit `@Public()` endpoints.
- Auth endpoint throttling.
- `helmet` + restricted CORS policy.
- Structured error contract for deterministic client handling.

## 6. Known tradeoffs and next hardening options

Current accepted tradeoffs:

- Access token in `sessionStorage` is a demo pragmatism.
- No MFA/email-verification flow in scope.

Potential future steps:

- Session inventory endpoint for user-facing "active devices" visibility.
- Memory-only access-token strategy with refresh-cookie-first model.
- CSRF token strategy for cookie-auth sensitive operations.
- MFA and anomaly detection for higher assurance deployments.

## 7. Final interview summary (30 seconds)

"The app now has full session continuity: startup silent refresh, controlled one-time `401` retry with single-flight, and backend refresh-token rotation with replay hardening. Security baseline is enforced through JWT guard, strict validation, hashed refresh persistence, throttling, and cookie/CORS hardening. Operationally, we documented explicit session policy and production runbook and added fail-fast startup guardrails for insecure production auth config."

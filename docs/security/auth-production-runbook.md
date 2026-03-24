# Auth Production Runbook

Last updated: 2026-03-24

## Goal

Provide a practical checklist for secure production deployment and operation of authentication/session handling.

## Required Environment Configuration

- `NODE_ENV=production`
- `CORS_ORIGIN`:
  - must be explicitly configured
  - comma-separated allowlist
  - must not contain `*`
  - must not contain localhost origins
- `AUTH_COOKIE_SECURE=true`
- `AUTH_COOKIE_SAME_SITE`:
  - allowed values: `lax`, `strict`, `none`
  - if `none`, `AUTH_COOKIE_SECURE=true` is mandatory
- `JWT_ACCESS_TOKEN_SECRET` and `JWT_REFRESH_TOKEN_SECRET`:
  - required
  - minimum length: 32 characters

## Runtime Guardrails (implemented)

At API startup in production:

- fail fast if `CORS_ORIGIN` is missing
- fail fast if `CORS_ORIGIN` contains wildcard (`*`)
- fail fast if `CORS_ORIGIN` contains localhost/127.0.0.1
- fail fast if `AUTH_COOKIE_SECURE` is not explicitly `true`

Relevant code:

- `packages/apps/api/src/main.ts`
- `packages/apps/api/src/shared/security/auth-runtime-security.ts`

## Cookie and CORS Checklist (Pre-Deploy)

- Verify refresh cookie flags in response:
  - `HttpOnly` enabled
  - `Secure` enabled
  - `SameSite` matches deployment model
  - cookie path scoped to `/auth`
- Verify CORS:
  - only trusted frontend origins in allowlist
  - `credentials: true` only with explicit origin allowlist
  - no wildcard origin in production

## Secret Rotation Procedure

1. Generate new strong secrets for:
   - `JWT_ACCESS_TOKEN_SECRET`
   - `JWT_REFRESH_TOKEN_SECRET`
2. Roll out secrets via secret manager/CI variables (never commit secrets).
3. Deploy API with new secrets.
4. Validate:
   - login works
   - refresh works
   - protected endpoints work with newly issued access token
5. Monitor auth error rates (`401`, refresh failures) for post-deploy anomalies.
6. If rollback is needed, revert secret values and redeploy.

Operational note:

- Rotating JWT secrets invalidates existing tokens signed with old secrets; plan deployment windows and communication accordingly.

## Post-Deploy Verification

- Smoke-check:
  - `POST /auth/login`
  - `POST /auth/refresh`
  - protected endpoint access with access token
  - `POST /auth/logout`
- Confirm no unexpected spikes in:
  - `AUTH_REFRESH_TOKEN_INVALID`
  - `UNAUTHORIZED`
  - CORS-related browser failures

## Incident Response Quick Actions

- Suspected token theft:
  - rotate JWT secrets
  - force re-authentication
  - audit refresh-token and unauthorized error patterns
- Misconfigured CORS or cookie flags:
  - rollback to last known-good env settings
  - redeploy with corrected allowlist/flags

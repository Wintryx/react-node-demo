# Session Policy

Last updated: 2026-04-01

## Objective

Define a clear, predictable, and secure session lifecycle for this project.

## Session Model

- Access token:
  - Transport: `Authorization: Bearer <token>`
  - Lifetime: `15m` (`JWT_ACCESS_TOKEN_EXPIRES_IN`)
  - Storage (web): `sessionStorage` (demo tradeoff)
- Refresh token:
  - Transport: HttpOnly cookie (`refreshToken`)
  - Lifetime: `7d` (`JWT_REFRESH_TOKEN_EXPIRES_IN`)
  - Server persistence: hashed in `auth_refresh_sessions` (per session/device)
  - Rotation: enabled on every successful `POST /auth/refresh`

## Timeouts

- Idle timeout:
  - Enforced effectively by refresh-token lifetime and rotation.
  - If no refresh happens within refresh-token validity window, session expires.
- Absolute timeout:
  - Current implementation does not enforce a separate hard absolute session cap beyond refresh-token validity.
  - For stricter production requirements, introduce a dedicated absolute session lifetime field and validation.

## User Experience Rules

- App startup:
  - If local access token is missing/expired, frontend attempts `POST /auth/refresh` once.
  - If refresh succeeds, user remains signed in.
  - If refresh fails, session is cleared and user is treated as logged out.
- During active usage:
  - First `401` triggers one controlled refresh attempt (single-flight for concurrent requests).
  - Original request is retried once.
  - On refresh failure, session is cleared and unauthorized flow redirects to login.
- Logout:
  - `POST /auth/logout` clears refresh cookie and invalidates persisted refresh session server-side.
  - `POST /auth/logout-all` clears refresh cookie and revokes all persisted refresh sessions for the current user.

## Security Notes

- Refresh-token replay window is reduced by:
  - refresh-token rotation on every refresh
  - replay invalidation of previous token
- Refresh-token hash input is normalized with `sha256` before bcrypt, preventing bcrypt 72-byte truncation edge cases.
- Access token remains short-lived (`15m`) as baseline exposure control.

## Future Hardening Options

- Add explicit absolute session lifetime (for example `maxSessionAge`).
- Add "session about to expire" UX hint in frontend.
- Move access token from `sessionStorage` to memory-only strategy if scope and complexity allow.

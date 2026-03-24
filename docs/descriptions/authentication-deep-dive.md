# Authentication Deep Dive

Date: 2026-03-24  
Audience: Presentation/interview support for architecture, security, and UX/performance discussion.

## 1. High-level overview

This project uses a **hybrid token model**:

- **Access token (JWT)** is returned by `POST /auth/login` and `POST /auth/register`.
- **Refresh token (JWT)** is issued as an **HttpOnly cookie** (`refreshToken`) on auth endpoints.
- Frontend currently stores the access token in `sessionStorage` and sends it as `Authorization: Bearer ...`.
- Backend validates bearer tokens via a global JWT guard.

Important practical behavior:

- "I stay logged in after browser refresh" works because the access token is restored from `sessionStorage` in the same browser tab/session.
- The backend refresh flow exists (`POST /auth/refresh`), but the frontend currently does not call it automatically.

## 2. End-to-end flow (what happens in code)

### 2.1 Register flow

1. User submits register form in `web/src/features/auth/register-page.tsx` (`onSubmit`).
2. `useAuth().register(...)` is called from `web/src/features/auth/auth-context.tsx`.
3. `authApi.register(...)` sends `POST /auth/register` in `web/src/shared/api/auth-api.ts`.
4. Backend `AuthController.register(...)` in `api/src/modules/auth/presentation/auth.controller.ts`:
   - executes `RegisterUseCase.execute(...)`
   - issues refresh cookie via `issueRefreshTokenCookie(...)`
   - returns `AuthResponse` with `accessToken`.
5. Frontend persists `{ accessToken, user }` via `writeAuthSession(...)` in `web/src/features/auth/auth-storage.ts`.
6. User is navigated to `/app`.

### 2.2 Login flow

1. User submits login form in `web/src/features/auth/login-page.tsx`.
2. `authApi.login(...)` calls `POST /auth/login`.
3. Backend `AuthController.login(...)`:
   - executes `LoginUseCase.execute(...)`
   - sets refresh cookie
   - returns bearer access token payload.
4. Frontend stores session in `sessionStorage`.
5. Route guard (`ProtectedRoute`) allows `/app` because `isAuthenticated === true`.

### 2.3 Authenticated API request flow

1. API request is made with `apiClient` (`web/src/shared/api/client.ts`).
2. Request interceptor reads `sessionStorage` via `readAuthSession()`.
3. If token exists, interceptor sets `Authorization` header.
4. Backend global `JwtAuthGuard` (`api/src/modules/auth/presentation/guards/jwt-auth.guard.ts`) enforces auth for non-public routes.
5. `JwtStrategy` validates signature + expiry (`api/src/modules/auth/infrastructure/security/jwt.strategy.ts`).

### 2.4 Unauthorized handling flow (401)

1. Backend returns `401`.
2. Frontend Axios response interceptor:
   - clears stored session
   - triggers `notifyUnauthorized()`.
3. `AuthProvider` has registered a handler (`setUnauthorizedHandler`) and redirects user to `/login` (except when already on auth pages).

### 2.5 Logout flow

1. User clicks sign out (`DashboardHeader` -> `onSignOut` -> `useAuth().logout()`).
2. Frontend calls `POST /auth/logout` (best effort) and clears local session immediately.
3. Backend `AuthController.logout(...)`:
   - resolves refresh token from cookie
   - clears DB refresh token hash via `LogoutUseCase`
   - clears refresh cookie.

### 2.6 Refresh token flow (backend exists)

Backend supports `POST /auth/refresh`:

- Reads refresh cookie.
- `RefreshUseCase.execute(...)` validates token and returns a new access token.

Current frontend state:

- No `authApi.refresh()` usage in app startup or interceptor retry path.
- So refresh cookie capability is present server-side, but not yet fully leveraged in web UX.

## 3. Why login survives browser refresh

Main reason:

- `AuthProvider` initializes state from `readAuthSession()` (session storage).

Consequence:

- Refreshing the page in the same tab keeps the user authenticated.
- Closing the tab usually clears session storage (browser-dependent restore behavior can vary).
- There is no startup "silent refresh" from refresh cookie yet.

## 4. Security controls already implemented

### 4.1 Credential and input hardening

- DTO validation with `ValidationPipe` (`transform`, `whitelist`, `forbidNonWhitelisted`) in `api/src/main.ts`.
- `RegisterDto` enforces:
  - valid email
  - password length (10..128)
  - complexity regex (upper/lower/number/special).
- Frontend mirrors password policy in `web/src/features/auth/password-rules.ts`.

### 4.2 Password and token security

- Password hashing with bcrypt (12 rounds) in `BcryptPasswordHasher`.
- Access and refresh JWT secrets are required and minimum-length validated (`>= 32`) in `jwt-config.ts`.
- Access token expiry configurable (`JWT_ACCESS_TOKEN_EXPIRES_IN`, default `15m`).
- Refresh token expiry configurable (`JWT_REFRESH_TOKEN_EXPIRES_IN`, default `7d`).

### 4.3 Refresh token handling

- Refresh token is set in HttpOnly cookie (not readable by JS).
- Cookie options:
  - `httpOnly: true`
  - `sameSite` configurable (default `lax`)
  - `secure` configurable / forced in production
  - `path: /auth` (scoped).
- Refresh token is hashed in DB (`refreshTokenHash`) and checked against expiry (`refreshTokenExpiresAt`).
- Logout clears DB hash and browser cookie.

### 4.4 API surface protection

- Global JWT guard via `APP_GUARD` + `JwtAuthGuard`.
- Explicit `@Public()` for anonymous endpoints.
- Rate limiting:
  - global throttler in `AppModule`
  - stricter auth endpoint limits via `@Throttle(...)`.
- `helmet()` enabled in `main.ts`.
- CORS restricted to configured origin list (`CORS_ORIGIN`) with credentials enabled.

### 4.5 Error contract

- Unified API error shape using `ApiExceptionFilter`.
- `JwtAuthGuard.handleRequest()` returns structured unauthorized payloads.
- Frontend translates API error codes to user-facing messages (`web/src/shared/api/errors.ts`).

## 5. Security considerations still worth discussing

These are not necessarily bugs, but strong talking points for "next hardening steps":

1. Access token in `sessionStorage` is still exposed to XSS if script injection happens.
2. Frontend does not auto-refresh access token using refresh cookie, so session recovery is not maximized.
3. Refresh token is not rotated on each refresh call (token replay window can be reduced with rotation + reuse detection).
4. CSRF protections are mostly based on SameSite; for sensitive cookie-auth actions, adding CSRF token strategy is stronger.
5. Access token revocation is stateless; immediate revoke before expiry is not supported.
6. Current design stores one refresh hash per user; multi-device session semantics should be decided explicitly.
7. Production operations should include secret rotation policy and incident response plan.
8. Optional advanced controls: MFA, email verification, suspicious login detection, audit logs.

## 6. UX flow and performance improvements for auth

### 6.1 Biggest UX win: startup silent refresh

Goal: users remain signed in smoothly even after access-token expiry or after browser restart (if refresh cookie remains valid).

Suggested approach:

1. Add `authApi.refresh()` in `web/src/shared/api/auth-api.ts`.
2. In `AuthProvider`, set `isInitializing=true` initially.
3. On app startup:
   - if no valid access token (or token likely expired), call `/auth/refresh` once.
   - if success, persist new access token and user.
   - if failure, clear session and continue as logged-out.
4. Set `isInitializing=false` only after this bootstrap step.

Result:

- Better continuity, less forced re-login, cleaner protected-route behavior.

### 6.2 Better 401 recovery

- Implement interceptor logic:
  - on first 401, try `/auth/refresh`
  - retry original request once
  - if refresh fails, logout redirect.
- Add request queueing to avoid parallel refresh storms.

### 6.3 Storage strategy discussion

- Option A (current): access token in `sessionStorage` (good UX, moderate risk if XSS).
- Option B (safer): keep access token in memory only + rely on refresh cookie.
- Option C: configurable "Remember me" behavior with explicit user choice and clear security explanation.

### 6.4 Perceived performance refinements

- Prefetch core dashboard queries immediately after successful login/register.
- Show one global auth-bootstrap loading state instead of route-by-route transitions.
- Use optimistic UI and clearer loading feedback on auth actions when network is slow.

## 7. File/function reference map

### 7.1 Frontend auth

- `packages/apps/web/src/features/auth/auth-context.tsx`
  - `AuthProvider`, `login`, `register`, `logout`, unauthorized redirect setup.
- `packages/apps/web/src/features/auth/auth-storage.ts`
  - `readAuthSession`, `writeAuthSession`, `clearAuthSession`.
- `packages/apps/web/src/features/auth/protected-route.tsx`
  - `ProtectedRoute` decision gate.
- `packages/apps/web/src/features/auth/public-auth-route.tsx`
  - `PublicAuthRoute` redirect for already-authenticated users.
- `packages/apps/web/src/features/auth/login-page.tsx`
  - form submit + navigate after success.
- `packages/apps/web/src/features/auth/register-page.tsx`
  - form validation + register submit.

### 7.2 Frontend API/auth plumbing

- `packages/apps/web/src/shared/api/auth-api.ts`
  - `register`, `login`, `logout`.
- `packages/apps/web/src/shared/api/client.ts`
  - Axios instance, auth header injection, 401 handling.
- `packages/apps/web/src/shared/api/unauthorized-handler.ts`
  - global callback registration (`setUnauthorizedHandler`, `notifyUnauthorized`).
- `packages/apps/web/src/app/app.tsx`
  - route-level auth gating with protected/public wrappers.

### 7.3 Backend auth entry and policies

- `packages/apps/api/src/modules/auth/presentation/auth.controller.ts`
  - `register`, `login`, `refresh`, `logout`
  - cookie creation and cookie clearing.
- `packages/apps/api/src/modules/auth/presentation/guards/jwt-auth.guard.ts`
  - global auth enforcement + structured unauthorized errors.
- `packages/apps/api/src/modules/auth/infrastructure/security/jwt.strategy.ts`
  - bearer JWT validation.
- `packages/apps/api/src/modules/auth/presentation/decorators/public.decorator.ts`
  - opt-out marker for public endpoints.

### 7.4 Backend auth business + persistence

- `packages/apps/api/src/modules/auth/application/register.use-case.ts`
- `packages/apps/api/src/modules/auth/application/login.use-case.ts`
- `packages/apps/api/src/modules/auth/application/refresh.use-case.ts`
- `packages/apps/api/src/modules/auth/application/logout.use-case.ts`
- `packages/apps/api/src/modules/auth/application/auth-refresh-session.service.ts`
  - issue refresh token, resolve user by token, clear token.
- `packages/apps/api/src/modules/auth/infrastructure/persistence/typeorm-auth.repository.ts`
  - user lookup/create, refresh token hash persistence.
- `packages/apps/api/src/modules/auth/infrastructure/persistence/auth-user.orm-entity.ts`
  - DB schema (`refreshTokenHash`, `refreshTokenExpiresAt`).
- `packages/apps/api/src/shared/persistence/migrations/20260317134500-auth-refresh-token.migration.ts`
  - migration adding refresh token columns.

### 7.5 Backend platform security setup

- `packages/apps/api/src/main.ts`
  - `helmet`, CORS, validation pipe, global exception filter, Swagger gating.
- `packages/apps/api/src/app/app.module.ts`
  - `ThrottlerModule` defaults.
- `packages/apps/api/src/modules/auth/infrastructure/security/jwt-config.ts`
  - required secret checks.

## 8. Testing evidence relevant to auth

- `packages/apps/api-e2e/src/api/auth.spec.ts` validates:
  - register/login success
  - duplicate email conflict
  - refresh with cookie
  - refresh missing-cookie failure
  - logout invalidates refresh token
  - protected endpoint authorization behavior.
- Frontend tests:
  - `web/src/features/auth/auth-storage.spec.ts`
  - `web/src/shared/api/unauthorized-handler.spec.ts`.

## 9. 30-second interview summary

"Authentication is JWT-based with short-lived access tokens and HttpOnly refresh cookies. Protected APIs are enforced globally by a JWT guard, public auth endpoints are explicitly marked with `@Public`, and auth routes are throttled. Passwords are bcrypt-hashed and refresh tokens are stored hashed in the database. On the frontend, auth state is restored from session storage, which is why refresh in the same browser session keeps users logged in. The biggest next step is implementing silent refresh and token-rotation-aware refresh handling to improve both security posture and user continuity."

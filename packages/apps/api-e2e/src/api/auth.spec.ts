import axios from 'axios';
import { AxiosResponseHeaders, RawAxiosResponseHeaders } from 'axios';

import { AuthResponse, EmployeeResponse } from './support/api-types';
import { AuthContext, createAuthContext } from './support/auth-helpers';
import { buildAuthPayload, buildUniqueSuffix } from './support/fixtures';
import { expectHttpError, expectHttpErrorCode } from './support/http-assertions';

describe('Auth API', () => {
  let authContext: AuthContext;

  const getSetCookieHeaders = (
    headers: AxiosResponseHeaders | Partial<RawAxiosResponseHeaders>,
  ): string[] => {
    const setCookieHeader = headers['set-cookie'];
    if (!setCookieHeader) {
      return [];
    }

    if (Array.isArray(setCookieHeader)) {
      return setCookieHeader;
    }

    return [setCookieHeader];
  };

  const extractRefreshCookie = (
    headers: AxiosResponseHeaders | Partial<RawAxiosResponseHeaders>,
  ): string => {
    const refreshCookie = getSetCookieHeaders(headers).find((cookie) =>
      cookie.startsWith('refreshToken='),
    );
    if (!refreshCookie) {
      throw new Error('Expected refreshToken cookie in response headers.');
    }

    return refreshCookie.split(';')[0];
  };

  const refreshWithCookie = (refreshCookie: string) =>
    axios.post<AuthResponse>(
      '/auth/refresh',
      {},
      {
        headers: {
          Cookie: refreshCookie,
        },
      },
    );

  beforeAll(async () => {
    authContext = await createAuthContext();
  });

  it('registers a new user and returns bearer token response', async () => {
    const payload = buildAuthPayload(buildUniqueSuffix());
    const res = await axios.post<AuthResponse>('/auth/register', payload);

    expect(res.status).toBe(201);
    expect(res.data.tokenType).toBe('Bearer');
    expect(res.data.accessToken.length).toBeGreaterThan(20);
    expect(res.data.user.email).toBe(payload.email.toLowerCase());
    expect(extractRefreshCookie(res.headers)).toContain('refreshToken=');
  });

  it('returns 409 for duplicate email (case-insensitive)', async () => {
    const duplicateError = await expectHttpError(
      axios.post('/auth/register', {
        ...authContext.credentials,
        email: authContext.credentials.email.toUpperCase(),
      }),
      409,
    );
    expectHttpErrorCode(duplicateError, 'AUTH_EMAIL_ALREADY_EXISTS');
  });

  it('logs in an existing user', async () => {
    const loginRes = await axios.post<AuthResponse>('/auth/login', authContext.credentials);
    expect(loginRes.status).toBe(200);
    expect(loginRes.data.accessToken.length).toBeGreaterThan(20);
    expect(loginRes.data.user.email).toBe(authContext.credentials.email.toLowerCase());
  });

  it('refreshes access token with refresh cookie', async () => {
    const loginRes = await axios.post<AuthResponse>('/auth/login', authContext.credentials);
    const refreshCookie = extractRefreshCookie(loginRes.headers);
    const refreshRes = await refreshWithCookie(refreshCookie);

    expect(refreshRes.status).toBe(200);
    expect(refreshRes.data.accessToken.length).toBeGreaterThan(20);
    expect(refreshRes.data.user.email).toBe(authContext.credentials.email.toLowerCase());
    expect(extractRefreshCookie(refreshRes.headers)).toContain('refreshToken=');
  });

  it('rotates refresh token and rejects the previous refresh cookie', async () => {
    const loginRes = await axios.post<AuthResponse>('/auth/login', authContext.credentials);
    const firstRefreshCookie = extractRefreshCookie(loginRes.headers);

    const firstRefreshRes = await refreshWithCookie(firstRefreshCookie);
    expect(firstRefreshRes.status).toBe(200);
    const rotatedRefreshCookie = extractRefreshCookie(firstRefreshRes.headers);
    expect(rotatedRefreshCookie).not.toBe(firstRefreshCookie);

    const replayRes = await axios.post(
      '/auth/refresh',
      {},
      {
        headers: {
          Cookie: firstRefreshCookie,
        },
        validateStatus: () => true,
      },
    );
    expect(replayRes.status).toBe(401);
    expect(replayRes.data?.code).toBe('AUTH_REFRESH_TOKEN_INVALID');

    const secondRefreshRes = await refreshWithCookie(rotatedRefreshCookie);
    expect(secondRefreshRes.status).toBe(200);
    expect(secondRefreshRes.data.user.email).toBe(authContext.credentials.email.toLowerCase());
  });

  it('returns 401 when refresh cookie is missing', async () => {
    const refreshError = await expectHttpError(axios.post('/auth/refresh'), 401);
    expectHttpErrorCode(refreshError, 'AUTH_REFRESH_TOKEN_INVALID');
  });

  it('logs out and invalidates refresh cookie token', async () => {
    const loginRes = await axios.post<AuthResponse>('/auth/login', authContext.credentials);
    const refreshCookie = extractRefreshCookie(loginRes.headers);

    const logoutRes = await axios.post(
      '/auth/logout',
      {},
      {
        headers: {
          Cookie: refreshCookie,
        },
      },
    );
    expect(logoutRes.status).toBe(204);

    const refreshError = await expectHttpError(
      axios.post(
        '/auth/refresh',
        {},
        {
          headers: {
            Cookie: refreshCookie,
          },
        },
      ),
      401,
    );
    expectHttpErrorCode(refreshError, 'AUTH_REFRESH_TOKEN_INVALID');
  });

  it('returns 401 for invalid credentials', async () => {
    const invalidCredentialsError = await expectHttpError(
      axios.post('/auth/login', {
        email: authContext.credentials.email,
        password: 'WrongPassword!1',
      }),
      401,
    );
    expectHttpErrorCode(invalidCredentialsError, 'AUTH_INVALID_CREDENTIALS');
  });

  it('blocks protected endpoints without access token', async () => {
    const unauthorizedError = await expectHttpError(axios.get('/employees'), 401);
    expectHttpErrorCode(unauthorizedError, 'UNAUTHORIZED');
  });

  it('allows protected endpoints with access token', async () => {
    const res = await authContext.client.get<EmployeeResponse[]>('/employees');

    expect(res.status).toBe(200);
    expect(Array.isArray(res.data)).toBe(true);
  });
});

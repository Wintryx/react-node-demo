import axios from 'axios';

import { AuthResponse, EmployeeResponse } from './support/api-types';
import { AuthContext, createAuthContext } from './support/auth-helpers';
import { buildAuthPayload, buildUniqueSuffix } from './support/fixtures';
import { expectHttpError, expectHttpErrorCode } from './support/http-assertions';

describe('Auth API', () => {
  let authContext: AuthContext;

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

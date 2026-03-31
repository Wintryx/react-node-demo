import { assertAuthRuntimeSecurity } from './auth-runtime-security';

describe('auth-runtime-security', () => {
  const validProductionConfig = {
    nodeEnv: 'production',
    corsOrigin: 'https://app.example.com,https://admin.example.com',
    authCookieSecure: 'true',
    authCookieSameSite: 'lax',
  };

  it('passes for valid non-production settings', () => {
    expect(() =>
      assertAuthRuntimeSecurity({
        nodeEnv: 'development',
        corsOrigin: undefined,
        authCookieSecure: 'false',
        authCookieSameSite: 'lax',
      }),
    ).not.toThrow();
  });

  it('passes for valid production settings', () => {
    expect(() => assertAuthRuntimeSecurity(validProductionConfig)).not.toThrow();
  });

  it('fails in production when CORS_ORIGIN is missing', () => {
    expect(() =>
      assertAuthRuntimeSecurity({
        ...validProductionConfig,
        corsOrigin: undefined,
      }),
    ).toThrow('CORS_ORIGIN must be explicitly configured in production');
  });

  it('fails in production when CORS_ORIGIN contains wildcard', () => {
    expect(() =>
      assertAuthRuntimeSecurity({
        ...validProductionConfig,
        corsOrigin: 'https://app.example.com,*',
      }),
    ).toThrow('CORS_ORIGIN must not contain "*" in production.');
  });

  it('fails in production when CORS_ORIGIN contains localhost', () => {
    expect(() =>
      assertAuthRuntimeSecurity({
        ...validProductionConfig,
        corsOrigin: 'https://app.example.com,http://localhost:4200',
      }),
    ).toThrow('CORS_ORIGIN must not contain localhost/127.0.0.1 entries in production.');
  });

  it('fails in production when AUTH_COOKIE_SECURE is not true', () => {
    expect(() =>
      assertAuthRuntimeSecurity({
        ...validProductionConfig,
        authCookieSecure: 'false',
      }),
    ).toThrow('AUTH_COOKIE_SECURE must be set to "true" in production.');
  });
});

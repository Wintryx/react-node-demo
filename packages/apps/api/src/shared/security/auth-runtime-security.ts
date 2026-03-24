interface AuthRuntimeSecurityInput {
  nodeEnv: string | undefined;
  corsOrigin: string | undefined;
  authCookieSecure: string | undefined;
  authCookieSameSite: string | undefined;
}

const isProductionEnvironment = (nodeEnv: string | undefined): boolean =>
  (nodeEnv ?? '').trim().toLowerCase() === 'production';

const parseCorsOrigins = (rawOrigins: string | undefined): string[] =>
  (rawOrigins ?? '')
    .split(',')
    .map((origin) => origin.trim())
    .filter((origin) => origin.length > 0);

const normalizeCookieSameSite = (
  sameSite: string | undefined,
): 'lax' | 'strict' | 'none' =>
  (sameSite ?? '').trim().toLowerCase() === 'strict'
    ? 'strict'
    : (sameSite ?? '').trim().toLowerCase() === 'none'
      ? 'none'
      : 'lax';

export const assertAuthRuntimeSecurity = (input: AuthRuntimeSecurityInput): void => {
  if (!isProductionEnvironment(input.nodeEnv)) {
    return;
  }

  const parsedOrigins = parseCorsOrigins(input.corsOrigin);
  if (parsedOrigins.length === 0) {
    throw new Error(
      'CORS_ORIGIN must be explicitly configured in production (comma-separated allowlist).',
    );
  }

  if (parsedOrigins.some((origin) => origin === '*')) {
    throw new Error('CORS_ORIGIN must not contain "*" in production.');
  }

  if (parsedOrigins.some((origin) => /localhost|127\.0\.0\.1/i.test(origin))) {
    throw new Error(
      'CORS_ORIGIN must not contain localhost/127.0.0.1 entries in production.',
    );
  }

  if ((input.authCookieSecure ?? '').trim().toLowerCase() !== 'true') {
    throw new Error('AUTH_COOKIE_SECURE must be set to "true" in production.');
  }

  const sameSite = normalizeCookieSameSite(input.authCookieSameSite);
  if (sameSite === 'none' && (input.authCookieSecure ?? '').trim().toLowerCase() !== 'true') {
    throw new Error('AUTH_COOKIE_SAME_SITE=none requires AUTH_COOKIE_SECURE=true.');
  }
};

import { AuthSession } from './auth-storage';

const ACCESS_TOKEN_EXPIRY_SKEW_MS = 5_000;

interface JwtPayload {
  exp?: number;
}

const parseJwtPayload = (accessToken: string): JwtPayload | null => {
  const [, payloadPart] = accessToken.split('.');
  if (!payloadPart) {
    return null;
  }

  try {
    const normalizedPayload = payloadPart.replace(/-/g, '+').replace(/_/g, '/');
    const paddingLength = (4 - (normalizedPayload.length % 4)) % 4;
    const paddedPayload = `${normalizedPayload}${'='.repeat(paddingLength)}`;

    return JSON.parse(window.atob(paddedPayload)) as JwtPayload;
  } catch {
    return null;
  }
};

export const isSessionUsable = (session: AuthSession | null): session is AuthSession => {
  if (!session?.accessToken || !session.user?.email) {
    return false;
  }

  const payload = parseJwtPayload(session.accessToken);
  if (!payload || typeof payload.exp !== 'number') {
    return false;
  }

  const expiresAtMs = payload.exp * 1000;
  return expiresAtMs > Date.now() + ACCESS_TOKEN_EXPIRY_SKEW_MS;
};

export interface RefreshTokenPayload {
  sub: number;
  email: string;
  jti?: string;
}

export interface RefreshTokenResult {
  refreshToken: string;
  expiresIn: string;
  expiresAt: Date;
  sessionId: string;
}

export const REFRESH_TOKEN_SIGNER = Symbol('REFRESH_TOKEN_SIGNER');

export interface RefreshTokenSigner {
  sign(payload: RefreshTokenPayload): Promise<RefreshTokenResult>;
  verify(refreshToken: string): Promise<RefreshTokenPayload | null>;
}

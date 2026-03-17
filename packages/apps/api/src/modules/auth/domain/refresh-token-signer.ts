export interface RefreshTokenPayload {
  sub: number;
  email: string;
}

export interface RefreshTokenResult {
  refreshToken: string;
  expiresIn: string;
  expiresAt: Date;
}

export const REFRESH_TOKEN_SIGNER = Symbol('REFRESH_TOKEN_SIGNER');

export interface RefreshTokenSigner {
  sign(payload: RefreshTokenPayload): Promise<RefreshTokenResult>;
  verify(refreshToken: string): Promise<RefreshTokenPayload | null>;
}

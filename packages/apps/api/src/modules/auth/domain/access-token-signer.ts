export interface AccessTokenPayload {
  sub: number;
  email: string;
}

export interface AccessTokenResult {
  accessToken: string;
  expiresIn: string;
}

export const ACCESS_TOKEN_SIGNER = Symbol('ACCESS_TOKEN_SIGNER');

export interface AccessTokenSigner {
  sign(payload: AccessTokenPayload): Promise<AccessTokenResult>;
}

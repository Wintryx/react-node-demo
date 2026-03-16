import { AccessTokenResult } from '../domain/access-token-signer';
import { AuthUser } from '../domain/auth.model';

export interface AuthResponse {
  accessToken: string;
  tokenType: 'Bearer';
  expiresIn: string;
  user: {
    id: number;
    email: string;
    createdAt: string;
  };
}

export const toAuthResponse = (user: AuthUser, tokenResult: AccessTokenResult): AuthResponse => ({
  accessToken: tokenResult.accessToken,
  tokenType: 'Bearer',
  expiresIn: tokenResult.expiresIn,
  user: {
    id: user.id,
    email: user.email,
    createdAt: user.createdAt.toISOString(),
  },
});

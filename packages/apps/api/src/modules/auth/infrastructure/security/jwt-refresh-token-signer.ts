import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';

import { getJwtRefreshTokenSecret } from './jwt-config';
import {
  RefreshTokenPayload,
  RefreshTokenResult,
  RefreshTokenSigner,
} from '../../domain/refresh-token-signer';

@Injectable()
export class JwtRefreshTokenSigner implements RefreshTokenSigner {
  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  async sign(payload: RefreshTokenPayload): Promise<RefreshTokenResult> {
    const secret = getJwtRefreshTokenSecret(this.configService);
    const expiresIn = this.configService.get<string>('JWT_REFRESH_TOKEN_EXPIRES_IN') ?? '7d';
    const expiresInSeconds = this.parseExpiresInToSeconds(expiresIn);
    const refreshToken = await this.jwtService.signAsync(payload, {
      secret,
      expiresIn: expiresInSeconds,
    });
    const expiresAt = new Date(Date.now() + expiresInSeconds * 1000);

    return {
      refreshToken,
      expiresIn,
      expiresAt,
    };
  }

  async verify(refreshToken: string): Promise<RefreshTokenPayload | null> {
    const secret = getJwtRefreshTokenSecret(this.configService);
    try {
      const payload = await this.jwtService.verifyAsync<RefreshTokenPayload>(refreshToken, {
        secret,
      });
      return payload;
    } catch {
      return null;
    }
  }

  private parseExpiresInToSeconds(value: string): number {
    const parsed = /^(\d+)([smhd])?$/i.exec(value.trim());
    if (!parsed) {
      return 7 * 24 * 60 * 60;
    }

    const amount = Number(parsed[1]);
    const unit = parsed[2]?.toLowerCase() ?? 's';

    if (unit === 'm') {
      return amount * 60;
    }
    if (unit === 'h') {
      return amount * 60 * 60;
    }
    if (unit === 'd') {
      return amount * 60 * 60 * 24;
    }
    return amount;
  }
}

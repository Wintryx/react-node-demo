import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';

import { AccessTokenPayload, AccessTokenResult, AccessTokenSigner } from '../../domain/access-token-signer';

@Injectable()
export class JwtAccessTokenSigner implements AccessTokenSigner {
  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  async sign(payload: AccessTokenPayload): Promise<AccessTokenResult> {
    const expiresIn = this.configService.get<string>('JWT_ACCESS_TOKEN_EXPIRES_IN') ?? '15m';
    const accessToken = await this.jwtService.signAsync(payload, {
      expiresIn: this.parseExpiresInToSeconds(expiresIn),
    });
    return {
      accessToken,
      expiresIn,
    };
  }

  private parseExpiresInToSeconds(value: string): number {
    const parsed = /^(\d+)([smhd])?$/i.exec(value.trim());
    if (!parsed) {
      return 900;
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

import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';

import { getJwtAccessTokenSecret } from './jwt-config';

interface JwtAccessTokenPayload {
  sub: number;
  email: string;
}

export interface AuthenticatedRequestUser {
  userId: number;
  email: string;
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private readonly configService: ConfigService) {
    const jwtSecret = getJwtAccessTokenSecret(configService);

    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: jwtSecret,
    });
  }

  validate(payload: JwtAccessTokenPayload): AuthenticatedRequestUser {
    return {
      userId: payload.sub,
      email: payload.email,
    };
  }
}

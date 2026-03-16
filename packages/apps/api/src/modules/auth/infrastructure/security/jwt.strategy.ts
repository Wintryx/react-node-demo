import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';

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
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get<string>('JWT_ACCESS_TOKEN_SECRET') ?? 'change-me',
    });
  }

  validate(payload: JwtAccessTokenPayload): AuthenticatedRequestUser {
    return {
      userId: payload.sub,
      email: payload.email,
    };
  }
}

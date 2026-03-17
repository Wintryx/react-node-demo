import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { APP_GUARD } from '@nestjs/core';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { TypeOrmModule } from '@nestjs/typeorm';

import { AuthRefreshSessionService } from './application/auth-refresh-session.service';
import { LoginUseCase } from './application/login.use-case';
import { LogoutUseCase } from './application/logout.use-case';
import { RefreshUseCase } from './application/refresh.use-case';
import { RegisterUseCase } from './application/register.use-case';
import { ACCESS_TOKEN_SIGNER } from './domain/access-token-signer';
import { AUTH_REPOSITORY } from './domain/auth.repository';
import { PASSWORD_HASHER } from './domain/password-hasher';
import { REFRESH_TOKEN_SIGNER } from './domain/refresh-token-signer';
import { AuthUserOrmEntity } from './infrastructure/persistence/auth-user.orm-entity';
import { TypeOrmAuthRepository } from './infrastructure/persistence/typeorm-auth.repository';
import { BcryptPasswordHasher } from './infrastructure/security/bcrypt-password-hasher';
import { JwtAccessTokenSigner } from './infrastructure/security/jwt-access-token-signer';
import { getJwtAccessTokenSecret, getJwtRefreshTokenSecret } from './infrastructure/security/jwt-config';
import { JwtRefreshTokenSigner } from './infrastructure/security/jwt-refresh-token-signer';
import { JwtStrategy } from './infrastructure/security/jwt.strategy';
import { AuthController } from './presentation/auth.controller';
import { JwtAuthGuard } from './presentation/guards/jwt-auth.guard';

@Module({
  imports: [
    TypeOrmModule.forFeature([AuthUserOrmEntity]),
    PassportModule.register({
      defaultStrategy: 'jwt',
    }),
    JwtModule.registerAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        const accessTokenSecret = getJwtAccessTokenSecret(configService);
        getJwtRefreshTokenSecret(configService);

        return {
          secret: accessTokenSecret,
        };
      },
    }),
  ],
  controllers: [AuthController],
  providers: [
    RegisterUseCase,
    LoginUseCase,
    RefreshUseCase,
    LogoutUseCase,
    AuthRefreshSessionService,
    JwtStrategy,
    {
      provide: AUTH_REPOSITORY,
      useClass: TypeOrmAuthRepository,
    },
    {
      provide: PASSWORD_HASHER,
      useClass: BcryptPasswordHasher,
    },
    {
      provide: ACCESS_TOKEN_SIGNER,
      useClass: JwtAccessTokenSigner,
    },
    {
      provide: REFRESH_TOKEN_SIGNER,
      useClass: JwtRefreshTokenSigner,
    },
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
  ],
})
export class AuthModule {}

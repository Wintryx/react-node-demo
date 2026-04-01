import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Post,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBody,
  ApiConflictResponse,
  ApiCreatedResponse,
  ApiNoContentResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  ApiTooManyRequestsResponse,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { Throttle, ThrottlerGuard } from '@nestjs/throttler';
import { Request, Response, CookieOptions } from 'express';

import { getCookieValue } from './cookie-utils';
import { ApiValidationBodyBadRequestResponse } from '../../../shared/docs/swagger-responses';
import { AuthRefreshSessionService } from '../application/auth-refresh-session.service';
import { AuthResponse } from '../application/auth-response.mapper';
import { LoginUseCase } from '../application/login.use-case';
import { LogoutUseCase } from '../application/logout.use-case';
import { RefreshUseCase } from '../application/refresh.use-case';
import { RegisterUseCase } from '../application/register.use-case';
import { Public } from './decorators/public.decorator';
import { AuthResponseDto, LoginDto, RegisterDto } from './dto';

const isThrottlingDisabled = process.env.DISABLE_THROTTLING === 'true';
const registerThrottleLimit = isThrottlingDisabled ? 10_000 : 5;
const loginThrottleLimit = isThrottlingDisabled ? 10_000 : 10;
const refreshThrottleLimit = isThrottlingDisabled ? 10_000 : 30;
const logoutThrottleLimit = isThrottlingDisabled ? 10_000 : 30;

@ApiTags('auth')
@Controller('auth')
@UseGuards(ThrottlerGuard)
export class AuthController {
  private static readonly REFRESH_TOKEN_COOKIE_NAME = 'refreshToken';

  constructor(
    private readonly registerUseCase: RegisterUseCase,
    private readonly loginUseCase: LoginUseCase,
    private readonly refreshUseCase: RefreshUseCase,
    private readonly logoutUseCase: LogoutUseCase,
    private readonly authRefreshSessionService: AuthRefreshSessionService,
  ) {}

  @ApiOperation({
    summary: 'Register user',
    description: 'Creates a new user account and returns an access token.',
  })
  @ApiBody({
    description: 'Registration payload.',
    type: RegisterDto,
    required: true,
    examples: {
      default: {
        summary: 'Valid registration request',
        value: {
          email: 'candidate@example.com',
          password: 'StrongPassword!1',
        },
      },
    },
  })
  @ApiCreatedResponse({
    description: 'Registers a user and returns a JWT access token.',
    type: AuthResponseDto,
  })
  @ApiValidationBodyBadRequestResponse()
  @ApiConflictResponse({ description: 'A user with the given email already exists.' })
  @ApiTooManyRequestsResponse({ description: 'Too many register attempts.' })
  @Public()
  @Post('register')
  @Throttle({
    default: {
      limit: registerThrottleLimit,
      ttl: 60_000,
    },
  })
  async register(
    @Body() dto: RegisterDto,
    @Res({ passthrough: true }) response: Response,
  ): Promise<AuthResponse> {
    const authResponse = await this.registerUseCase.execute(dto);
    await this.issueRefreshTokenCookie(response, authResponse.user.id, authResponse.user.email);
    return authResponse;
  }

  @ApiOperation({
    summary: 'Login user',
    description: 'Authenticates user credentials and returns an access token.',
  })
  @ApiBody({
    description: 'Login payload.',
    type: LoginDto,
    required: true,
    examples: {
      default: {
        summary: 'Valid login request',
        value: {
          email: 'candidate@example.com',
          password: 'StrongPassword!1',
        },
      },
    },
  })
  @ApiOkResponse({
    description: 'Authenticates user credentials and returns a JWT access token.',
    type: AuthResponseDto,
  })
  @ApiValidationBodyBadRequestResponse()
  @ApiUnauthorizedResponse({ description: 'Invalid email or password.' })
  @ApiTooManyRequestsResponse({ description: 'Too many login attempts.' })
  @Public()
  @Post('login')
  @HttpCode(HttpStatus.OK)
  @Throttle({
    default: {
      limit: loginThrottleLimit,
      ttl: 60_000,
    },
  })
  async login(
    @Body() dto: LoginDto,
    @Res({ passthrough: true }) response: Response,
  ): Promise<AuthResponse> {
    const authResponse = await this.loginUseCase.execute(dto);
    await this.issueRefreshTokenCookie(response, authResponse.user.id, authResponse.user.email);
    return authResponse;
  }

  @ApiOperation({
    summary: 'Refresh access token',
    description:
      'Uses the HttpOnly refresh token cookie to issue a new JWT access token without re-entering credentials.',
  })
  @ApiOkResponse({
    description: 'Returns a new access token for a valid refresh token cookie.',
    type: AuthResponseDto,
  })
  @ApiUnauthorizedResponse({ description: 'Refresh token is missing or invalid.' })
  @ApiTooManyRequestsResponse({ description: 'Too many refresh attempts.' })
  @Public()
  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  @Throttle({
    default: {
      limit: refreshThrottleLimit,
      ttl: 60_000,
    },
  })
  async refresh(
    @Req() request: Request,
    @Res({ passthrough: true }) response: Response,
  ): Promise<AuthResponse> {
    const authResponse = await this.refreshUseCase.execute(this.readRefreshToken(request));
    await this.issueRefreshTokenCookie(response, authResponse.user.id, authResponse.user.email);
    return authResponse;
  }

  @ApiOperation({
    summary: 'Logout user',
    description:
      'Clears refresh token cookie and invalidates the persisted refresh token for the current session.',
  })
  @ApiNoContentResponse({ description: 'Logout completed and refresh token cookie cleared.' })
  @ApiTooManyRequestsResponse({ description: 'Too many logout attempts.' })
  @Public()
  @Post('logout')
  @HttpCode(HttpStatus.NO_CONTENT)
  @Throttle({
    default: {
      limit: logoutThrottleLimit,
      ttl: 60_000,
    },
  })
  async logout(
    @Req() request: Request,
    @Res({ passthrough: true }) response: Response,
  ): Promise<void> {
    await this.logoutUseCase.execute(this.readRefreshToken(request));
    response.clearCookie(
      AuthController.REFRESH_TOKEN_COOKIE_NAME,
      this.createRefreshCookieOptions(),
    );
  }

  @ApiOperation({
    summary: 'Logout from all devices',
    description: 'Revokes all refresh sessions for the authenticated user and clears refresh cookie.',
  })
  @ApiNoContentResponse({ description: 'All refresh sessions were revoked and refresh cookie cleared.' })
  @ApiTooManyRequestsResponse({ description: 'Too many logout attempts.' })
  @Public()
  @Post('logout-all')
  @HttpCode(HttpStatus.NO_CONTENT)
  @Throttle({
    default: {
      limit: logoutThrottleLimit,
      ttl: 60_000,
    },
  })
  async logoutAll(
    @Req() request: Request,
    @Res({ passthrough: true }) response: Response,
  ): Promise<void> {
    await this.logoutUseCase.executeAll(this.readRefreshToken(request));
    response.clearCookie(
      AuthController.REFRESH_TOKEN_COOKIE_NAME,
      this.createRefreshCookieOptions(),
    );
  }

  private readRefreshToken(request: Request): string | undefined {
    return getCookieValue(request.headers.cookie, AuthController.REFRESH_TOKEN_COOKIE_NAME);
  }

  private async issueRefreshTokenCookie(
    response: Response,
    userId: number,
    email: string,
  ): Promise<void> {
    const refreshToken = await this.authRefreshSessionService.issueForUser({
      id: userId,
      email,
    });

    response.cookie(
      AuthController.REFRESH_TOKEN_COOKIE_NAME,
      refreshToken.refreshToken,
      this.createRefreshCookieOptions(refreshToken.expiresAt),
    );
  }

  private createRefreshCookieOptions(expiresAt?: Date): CookieOptions {
    const sameSite = this.resolveCookieSameSite(process.env.AUTH_COOKIE_SAME_SITE);
    const secure = process.env.AUTH_COOKIE_SECURE === 'true' || process.env.NODE_ENV === 'production';

    return {
      httpOnly: true,
      secure,
      sameSite,
      path: '/auth',
      ...(expiresAt
        ? {
            maxAge: Math.max(0, expiresAt.getTime() - Date.now()),
            expires: expiresAt,
          }
        : {}),
    };
  }

  private resolveCookieSameSite(
    value: string | undefined,
  ): 'lax' | 'strict' | 'none' {
    const normalized = value?.trim().toLowerCase();
    if (normalized === 'strict' || normalized === 'none' || normalized === 'lax') {
      return normalized;
    }

    return 'lax';
  }
}

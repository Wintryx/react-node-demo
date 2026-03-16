import { Body, Controller, HttpCode, HttpStatus, Post, UseGuards } from '@nestjs/common';
import {
  ApiCreatedResponse,
  ApiOkResponse,
  ApiTags,
  ApiTooManyRequestsResponse,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { Throttle, ThrottlerGuard } from '@nestjs/throttler';

import { AuthResponse } from '../application/auth-response.mapper';
import { LoginUseCase } from '../application/login.use-case';
import { RegisterUseCase } from '../application/register.use-case';
import { Public } from './decorators/public.decorator';
import { AuthResponseDto } from './dto/auth-response.dto';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';

@ApiTags('auth')
@Controller('auth')
@UseGuards(ThrottlerGuard)
export class AuthController {
  constructor(
    private readonly registerUseCase: RegisterUseCase,
    private readonly loginUseCase: LoginUseCase,
  ) {}

  @ApiCreatedResponse({
    description: 'Registers a user and returns a JWT access token.',
    type: AuthResponseDto,
  })
  @ApiTooManyRequestsResponse({ description: 'Too many register attempts.' })
  @Public()
  @Post('register')
  @Throttle({
    default: {
      limit: 5,
      ttl: 60_000,
    },
  })
  register(@Body() dto: RegisterDto): Promise<AuthResponse> {
    return this.registerUseCase.execute(dto);
  }

  @ApiOkResponse({
    description: 'Authenticates user credentials and returns a JWT access token.',
    type: AuthResponseDto,
  })
  @ApiUnauthorizedResponse({ description: 'Invalid email or password.' })
  @ApiTooManyRequestsResponse({ description: 'Too many login attempts.' })
  @Public()
  @Post('login')
  @HttpCode(HttpStatus.OK)
  @Throttle({
    default: {
      limit: 10,
      ttl: 60_000,
    },
  })
  login(@Body() dto: LoginDto): Promise<AuthResponse> {
    return this.loginUseCase.execute(dto);
  }
}

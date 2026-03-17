import { Body, Controller, HttpCode, HttpStatus, Post, UseGuards } from '@nestjs/common';
import {
  ApiBody,
  ApiBadRequestResponse,
  ApiConflictResponse,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  ApiTooManyRequestsResponse,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { Throttle, ThrottlerGuard } from '@nestjs/throttler';

import { AuthResponse } from '../application/auth-response.mapper';
import { LoginUseCase } from '../application/login.use-case';
import { RegisterUseCase } from '../application/register.use-case';
import { Public } from './decorators/public.decorator';
import { AuthResponseDto, LoginDto, RegisterDto } from './dto';

@ApiTags('auth')
@Controller('auth')
@UseGuards(ThrottlerGuard)
export class AuthController {
  constructor(
    private readonly registerUseCase: RegisterUseCase,
    private readonly loginUseCase: LoginUseCase,
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
  @ApiBadRequestResponse({ description: 'Validation failed for the request body.' })
  @ApiConflictResponse({ description: 'A user with the given email already exists.' })
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
  @ApiBadRequestResponse({ description: 'Validation failed for the request body.' })
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

import { ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { AuthGuard } from '@nestjs/passport';
import { Observable } from 'rxjs';

import { ApiErrorCode } from '../../../../shared/errors/api-error-code';
import { createApiErrorPayload } from '../../../../shared/errors/api-error.helpers';
import { IS_PUBLIC_KEY } from '../decorators/public.decorator';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  constructor(private readonly reflector: Reflector) {
    super();
  }

  canActivate(context: ExecutionContext): boolean | Promise<boolean> | Observable<boolean> {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (isPublic) {
      return true;
    }

    return super.canActivate(context);
  }

  // Ensure auth guard failures always use the structured API error contract.
  handleRequest<TUser>(
    error: unknown,
    user: TUser | false,
    _info: unknown,
    _context: ExecutionContext,
    _status: unknown,
  ): TUser {
    if (error || !user) {
      throw new UnauthorizedException(
        createApiErrorPayload(ApiErrorCode.UNAUTHORIZED, 'Unauthorized.'),
      );
    }

    return user;
  }
}

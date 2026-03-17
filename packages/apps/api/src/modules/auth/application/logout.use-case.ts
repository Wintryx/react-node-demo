import { Injectable } from '@nestjs/common';

import { AuthRefreshSessionService } from './auth-refresh-session.service';

@Injectable()
export class LogoutUseCase {
  constructor(private readonly authRefreshSessionService: AuthRefreshSessionService) {}

  async execute(refreshToken: string | undefined): Promise<void> {
    if (!refreshToken) {
      return;
    }

    const user = await this.authRefreshSessionService.resolveUserByRefreshToken(refreshToken);
    if (!user) {
      return;
    }

    await this.authRefreshSessionService.clearForUser(user.id);
  }
}

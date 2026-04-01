import { Injectable } from '@nestjs/common';

import { AuthRefreshSessionService } from './auth-refresh-session.service';

@Injectable()
export class LogoutUseCase {
  constructor(private readonly authRefreshSessionService: AuthRefreshSessionService) {}

  async execute(refreshToken: string | undefined): Promise<void> {
    if (!refreshToken) {
      return;
    }

    const refreshSession = await this.authRefreshSessionService.resolveRefreshSession(refreshToken);
    if (!refreshSession) {
      return;
    }

    await this.authRefreshSessionService.revokeRefreshSession(
      refreshSession.user.id,
      refreshSession.sessionId,
    );
  }

  async executeAll(refreshToken: string | undefined): Promise<void> {
    if (!refreshToken) {
      return;
    }

    const refreshSession = await this.authRefreshSessionService.resolveRefreshSession(refreshToken);
    if (!refreshSession) {
      return;
    }

    await this.authRefreshSessionService.clearForUser(refreshSession.user.id);
  }
}

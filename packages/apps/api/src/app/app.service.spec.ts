import { Test } from '@nestjs/testing';

import { AppService } from './app.service';

describe('AppService', () => {
  let service: AppService;

  beforeAll(async () => {
    const app = await Test.createTestingModule({
      providers: [AppService],
    }).compile();

    service = app.get<AppService>(AppService);
  });

  describe('getHealth', () => {
    it('should return healthy status with timestamp', () => {
      const result = service.getHealth();

      expect(result.status).toBe('ok');
      expect(result.timestamp).toEqual(expect.any(String));
      expect(Number.isNaN(Date.parse(result.timestamp))).toBe(false);
    });
  });
});

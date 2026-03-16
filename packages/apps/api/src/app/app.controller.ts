import { Controller, Get } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';

import { AppService } from './app.service';
import { Public } from '../modules/auth/presentation/decorators/public.decorator';

@ApiTags('health')
@Controller('health')
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Public()
  @Get()
  getHealth() {
    return this.appService.getHealth();
  }
}

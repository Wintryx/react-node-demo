import { Controller, Get } from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';

import { AppService } from './app.service';
import { HealthResponseDto } from './dto/health-response.dto';
import { Public } from '../modules/auth/presentation/decorators/public.decorator';

@ApiTags('health')
@Controller('health')
export class AppController {
  constructor(private readonly appService: AppService) {}

  @ApiOperation({
    summary: 'Health check',
    description: 'Returns the service status and the response timestamp.',
  })
  @ApiOkResponse({
    description: 'Health check completed successfully.',
    type: HealthResponseDto,
  })
  @Public()
  @Get()
  getHealth(): HealthResponseDto {
    return this.appService.getHealth();
  }
}

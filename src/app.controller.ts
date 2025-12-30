import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { AppService } from '@/app.service';
import { AppConfigService } from '@/config/app-config.service';

@ApiTags('App')
@Controller()
export class AppController {
  constructor(
    private readonly appService: AppService,
    private readonly configService: AppConfigService,
  ) {}

  @Get()
  @ApiOperation({ summary: 'Hello World' })
  @ApiResponse({ status: 200, description: 'Returns hello message' })
  getHello(): string {
    return this.appService.getHello();
  }

  @Get('config')
  @ApiOperation({ summary: 'Get application config' })
  @ApiResponse({
    status: 200,
    description: 'Returns application configuration',
  })
  getConfig(): Record<string, unknown> {
    const { port, env } = this.configService.app;
    const { prefix, version } = this.configService.api;

    return {
      port,
      env,
      apiPrefix: prefix,
      apiVersion: version,
    };
  }
}

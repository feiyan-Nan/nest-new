import { Controller, Get } from '@nestjs/common';
import { AppService } from '@/app.service';
import { AppConfigService } from '@/config/app-config.service';

@Controller()
export class AppController {
  constructor(
    private readonly appService: AppService,
    private readonly configService: AppConfigService,
  ) {}

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

  @Get('config')
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

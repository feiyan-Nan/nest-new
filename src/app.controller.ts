import {
  Controller,
  Get,
  HttpException,
  HttpStatus,
  Logger,
  LoggerService,
  NotFoundException,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { AppService } from '@/app.service';
import { AppConfigService } from '@/config/app-config.service';
import { Public } from '@/modules/auth/decorators/public.decorator';
import { WinstonLoggerService } from './logger';

@ApiTags('App')
@Controller()
export class AppController {
  private readonly logger1 = new Logger();
  constructor(
    private readonly appService: AppService,
    private readonly configService: AppConfigService,
    private readonly logger: WinstonLoggerService,
  ) {}

  @Public()
  @Get()
  @ApiOperation({ summary: 'Hello World' })
  @ApiResponse({ status: 200, description: 'Returns hello message' })
  getHello(): string {
    this.logger1.log('hello world243455');
    this.logger.log('nihoa', 'AppController', { name: 'feiyan' });
    // throw new HttpException('Not Found', HttpStatus.NOT_FOUND);
    return this.appService.getHello();
  }

  @Public()
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

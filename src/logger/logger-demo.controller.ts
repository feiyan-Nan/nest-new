import { Controller, Get, Inject } from '@nestjs/common';
import type { LoggerService } from '@nestjs/common';
import { WINSTON_MODULE_NEST_PROVIDER } from 'nest-winston';
import { LoggerDemoService } from './logger-demo.service';
import { AutoContextDemoService } from './auto-context-demo.service';
import { WinstonLoggerService } from './winston-logger.service';

@Controller('logger-demo')
export class LoggerDemoController {
  constructor(private readonly logger: WinstonLoggerService) {
    this.logger.setContext(LoggerDemoController.name);
  }

  @Get('test')
  testLogger() {
    this.logger.log('Test log from controller', { testId: 12 });
    return { message: 'Logger test completed' };
  }
}

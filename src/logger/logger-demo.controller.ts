import { Controller, Get } from '@nestjs/common';
import { LoggerDemoService } from './logger-demo.service';
import { WinstonLoggerService } from './winston-logger.service';

@Controller('logger-demo')
export class LoggerDemoController {
  private readonly context = LoggerDemoController.name;

  constructor(
    private readonly logger: WinstonLoggerService,
    private readonly loggerDemoService: LoggerDemoService,
  ) {}

  @Get('test')
  testLogger() {
    this.logger.log('Test log from controller', this.context, { testId: 12 });
    return {
      message: 'Logger test completed',
      requestId: this.logger.getRequestId(),
    };
  }

  @Get('levels')
  testLevels() {
    this.loggerDemoService.demonstrateLevels();
    return {
      message: 'Log levels demonstration completed',
      requestId: this.logger.getRequestId(),
    };
  }

  @Get('structured')
  testStructuredLogging() {
    this.loggerDemoService.demonstrateStructuredLogging();
    return {
      message: 'Structured logging demonstration completed',
      requestId: this.logger.getRequestId(),
    };
  }

  @Get('error')
  testErrorLogging() {
    this.loggerDemoService.demonstrateErrorLogging();
    return {
      message: 'Error logging demonstration completed',
      requestId: this.logger.getRequestId(),
    };
  }

  @Get('tracking')
  testRequestTracking() {
    this.loggerDemoService.demonstrateRequestTracking();
    return {
      message: 'Request tracking demonstration completed',
      requestId: this.logger.getRequestId(),
      ip: this.logger.getRequestContext('ip'),
      userAgent: this.logger.getRequestContext('userAgent'),
    };
  }
}

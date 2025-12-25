import { Controller, Get } from '@nestjs/common';
import { WinstonLoggerService } from './winston-logger.service';
import { AutoContextDemoService } from './auto-context-demo.service';

@Controller('auto-context-demo')
export class AutoContextDemoController {
  private readonly context = AutoContextDemoController.name;

  constructor(
    private readonly logger: WinstonLoggerService,
    private readonly autoContextDemoService: AutoContextDemoService,
  ) {}

  @Get('test')
  testAutoContext() {
    this.logger.log('Testing auto context in controller', this.context);

    this.logger.debug('This is a debug message', this.context);

    this.logger.warn('This is a warning message', this.context);

    const requestId = this.logger.getRequestId();

    return {
      message: 'Auto context test completed',
      requestId,
      tip: 'Check console and log files - all logs automatically include the class name and request ID!',
    };
  }

  @Get('service')
  testServiceAutoContext() {
    this.logger.log('Testing service with auto context', this.context);
    this.autoContextDemoService.demonstrateAutoContext();

    return {
      message: 'Service auto context test completed',
      requestId: this.logger.getRequestId(),
      tip: 'Check logs - context and request ID are automatically tracked!',
    };
  }

  @Get('user/:id')
  processUser() {
    const userId = 1001;
    this.logger.log('User endpoint called', this.context, { userId });
    this.autoContextDemoService.processUser(userId);

    return {
      message: 'User processed',
      userId,
      requestId: this.logger.getRequestId(),
    };
  }
}

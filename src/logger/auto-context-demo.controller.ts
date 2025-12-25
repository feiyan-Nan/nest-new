import { Controller, Get } from '@nestjs/common';
import { WinstonLoggerService } from './winston-logger.service';
import { AutoContextDemoService } from './auto-context-demo.service';

@Controller('auto-context-demo')
export class AutoContextDemoController {
  constructor(
    private readonly logger: WinstonLoggerService,
    private readonly autoContextDemoService: AutoContextDemoService,
  ) {
    // 控制器也可以自动设置 context
    this.logger.setContext(AutoContextDemoController.name);
  }

  @Get('test')
  testAutoContext() {
    this.logger.log('Testing auto context in controller');

    this.logger.debug('This is a debug message');

    this.logger.warn('This is a warning message');

    return {
      message: 'Auto context test completed',
      tip: 'Check console and log files - all logs automatically include the class name!',
    };
  }

  @Get('service')
  testServiceAutoContext() {
    this.logger.log('Testing service with auto context');
    this.autoContextDemoService.demonstrateAutoContext();

    return {
      message: 'Service auto context test completed',
      tip: 'Check logs - context is automatically set!',
    };
  }

  @Get('user/:id')
  processUser() {
    const userId = 1001;
    this.logger.log('User endpoint called', { userId });
    this.autoContextDemoService.processUser(userId);

    return {
      message: 'User processed',
      userId,
    };
  }
}

import { Injectable, Inject } from '@nestjs/common';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';
import { Logger } from 'winston';

@Injectable()
export class LoggerDemoService {
  constructor(
    @Inject(WINSTON_MODULE_PROVIDER)
    private readonly logger: Logger,
  ) {}

  demonstrateLevels() {
    this.logger.debug('Debug log message', {
      context: LoggerDemoService.name,
      userId: 123,
      action: 'demonstrateLevels',
    });

    this.logger.info('Info log message', {
      context: LoggerDemoService.name,
      requestId: 'req-456',
    });

    this.logger.warn('Warning log message', {
      context: LoggerDemoService.name,
      warning: 'This is a warning',
    });

    this.logger.error('Error log message', {
      context: LoggerDemoService.name,
      error: 'Something went wrong',
      stack: new Error().stack,
    });
  }

  demonstrateStructuredLogging() {
    const userId = 1001;
    const userName = 'John Doe';
    const action = 'login';

    this.logger.info('User login', {
      context: LoggerDemoService.name,
      userId,
      userName,
      action,
      timestamp: new Date().toISOString(),
      metadata: {
        ip: '192.168.1.1',
        userAgent: 'Mozilla/5.0',
      },
    });
  }

  demonstrateErrorLogging() {
    try {
      throw new Error('Simulated error for demonstration');
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      const errorStack = error instanceof Error ? error.stack : undefined;

      this.logger.error('Caught an error', {
        context: LoggerDemoService.name,
        errorMessage1: errorMessage,
        errorStack,
        additionalInfo: {
          userId: 999,
          action: 'processData',
        },
      });
    }
  }

  demonstrateChildLogger() {
    const requestLogger = this.logger.child({
      context: LoggerDemoService.name,
    });

    requestLogger.info('Processing user request', {
      requestId: 'req-789',
      userId: 555,
    });

    requestLogger.info('Request validated', {
      context: LoggerDemoService.name,
    });

    requestLogger.info('Request completed', {
      context: LoggerDemoService.name,
    });
  }
}

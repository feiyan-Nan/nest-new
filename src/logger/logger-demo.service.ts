import { Injectable } from '@nestjs/common';
import { WinstonLoggerService } from './winston-logger.service';

@Injectable()
export class LoggerDemoService {
  private readonly context = LoggerDemoService.name;

  constructor(private readonly logger: WinstonLoggerService) {}

  demonstrateLevels() {
    this.logger.debug('Debug log message', this.context, {
      userId: 123,
      action: 'demonstrateLevels',
    });

    this.logger.log('Info log message', this.context, {
      requestId: this.logger.getRequestId(),
    });

    this.logger.warn('Warning log message', this.context, {
      warning: 'This is a warning',
    });

    this.logger.error('Error log message', this.context, {
      error: 'Something went wrong',
      stack: new Error().stack,
    });
  }

  demonstrateStructuredLogging() {
    const userId = 1001;
    const userName = 'John Doe';
    const action = 'login';

    this.logger.log('User login', this.context, {
      userId,
      userName,
      action,
      timestamp: new Date().toISOString(),
      metadata: {
        ip: this.logger.getRequestContext('ip'),
        userAgent: this.logger.getRequestContext('userAgent'),
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

      this.logger.error('Caught an error', this.context, {
        errorMessage1: errorMessage,
        errorStack,
        additionalInfo: {
          userId: 999,
          action: 'processData',
        },
      });
    }
  }

  demonstrateRequestTracking() {
    const requestId = this.logger.getRequestId();
    const ip = this.logger.getRequestContext('ip');
    const userAgent = this.logger.getRequestContext('userAgent');

    this.logger.log('Request tracking info', this.context, {
      requestId,
      ip,
      userAgent,
    });
  }
}

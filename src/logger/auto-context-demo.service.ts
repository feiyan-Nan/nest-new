import { Injectable } from '@nestjs/common';
import { WinstonLoggerService } from './winston-logger.service';

@Injectable()
export class AutoContextDemoService {
  constructor(private readonly logger: WinstonLoggerService) {
    // 在构造函数中自动设置类名作为 context
    this.logger.setContext(AutoContextDemoService.name);
  }

  demonstrateAutoContext() {
    // 现在所有日志都会自动包含 context: 'AutoContextDemoService'
    // 不需要每次都手动传 context 了！
    this.logger.log('This log automatically includes context');

    this.logger.debug('Debug message with auto context', {
      userId: 123,
      action: 'demo',
    });

    this.logger.warn('Warning with auto context', {
      warningType: 'rate_limit',
    });

    this.logger.error('Error with auto context', {
      errorCode: 'ERR_001',
      details: 'Something went wrong',
    });
  }

  processUser(userId: number) {
    // 所有日志自动带上类名
    this.logger.log('Processing user', { userId });

    this.logger.debug('Fetching user data', { userId });

    this.logger.log('User processed successfully', {
      userId,
      status: 'completed',
    });
  }

  async processOrder(orderId: string) {
    this.logger.log('Starting order processing', { orderId });

    try {
      // 业务逻辑...
      this.logger.debug('Validating order', { orderId });

      this.logger.log('Order processed successfully', {
        orderId,
        status: 'success',
      });
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';

      this.logger.error('Failed to process order', {
        orderId,
        error: errorMessage,
      });

      throw error;
    }
  }
}

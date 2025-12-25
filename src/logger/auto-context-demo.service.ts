import { Injectable } from '@nestjs/common';
import { WinstonLoggerService } from './winston-logger.service';

@Injectable()
export class AutoContextDemoService {
  private readonly context = AutoContextDemoService.name;

  constructor(private readonly logger: WinstonLoggerService) {}

  demonstrateAutoContext() {
    this.logger.log('This log automatically includes context', this.context);

    this.logger.debug('Debug message with auto context', this.context, {
      userId: 123,
      action: 'demo',
    });

    this.logger.warn('Warning with auto context', this.context, {
      warningType: 'rate_limit',
    });

    this.logger.error('Error with auto context', this.context, {
      errorCode: 'ERR_001',
      details: 'Something went wrong',
    });

    const requestId = this.logger.getRequestId();
    this.logger.log(`Current request ID: ${requestId}`, this.context);
  }

  processUser(userId: number) {
    this.logger.log('Processing user', this.context, { userId });

    this.logger.debug('Fetching user data', this.context, { userId });

    this.logger.log('User processed successfully', this.context, {
      userId,
      status: 'completed',
    });
  }

  processOrder(orderId: string) {
    this.logger.log('Starting order processing', this.context, { orderId });

    try {
      this.logger.debug('Validating order', this.context, { orderId });

      this.logger.log('Order processed successfully', this.context, {
        orderId,
        status: 'success',
      });
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';

      this.logger.error('Failed to process order', this.context, {
        orderId,
        error: errorMessage,
      });

      throw error;
    }
  }
}

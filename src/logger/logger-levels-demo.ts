import { Injectable, Inject } from '@nestjs/common';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';
import { Logger } from 'winston';

@Injectable()
export class LoggerLevelsDemo {
  constructor(
    @Inject(WINSTON_MODULE_PROVIDER)
    private readonly logger: Logger,
  ) {}

  demonstrateAllLevels() {
    // 0. error - 最高优先级，系统错误
    this.logger.error('Database connection failed', {
      context: 'LoggerLevelsDemo',
      error: 'ECONNREFUSED',
      host: 'localhost:3306',
    });

    // 1. warn - 警告，不影响功能但需注意
    this.logger.warn('API rate limit approaching', {
      context: 'LoggerLevelsDemo',
      current: 950,
      limit: 1000,
    });

    // 2. info - 常规信息，记录重要操作
    this.logger.info('User logged in successfully', {
      context: 'LoggerLevelsDemo',
      userId: 1001,
      username: 'john_doe',
    });

    // 3. http - HTTP 请求日志
    this.logger.http('GET /api/users/1001', {
      context: 'LoggerLevelsDemo',
      method: 'GET',
      url: '/api/users/1001',
      status: 200,
      duration: 45,
    });

    // 4. verbose - 详细信息
    this.logger.verbose('Processing payment workflow', {
      context: 'LoggerLevelsDemo',
      step: 'validate_payment',
      orderId: 'ORD-12345',
    });

    // 5. debug - 调试信息
    this.logger.debug('Checking user permissions', {
      context: 'LoggerLevelsDemo',
      userId: 1001,
      requiredRole: 'admin',
      userRoles: ['user', 'moderator'],
    });

    // 6. silly - 最详细的调试信息
    this.logger.silly('Loop iteration details', {
      context: 'LoggerLevelsDemo',
      iteration: 15,
      arrayLength: 100,
      currentValue: 'test',
    });
  }

  // 实际业务场景示例
  async processOrder(orderId: string) {
    // info: 记录业务操作
    this.logger.info('Starting order processing', {
      context: 'processOrder',
      orderId,
    });

    try {
      // debug: 记录调试信息
      this.logger.debug('Validating order data', {
        context: 'processOrder',
        orderId,
      });

      // verbose: 记录详细步骤
      this.logger.verbose('Fetching order from database', {
        context: 'processOrder',
        orderId,
      });

      // info: 记录成功操作
      this.logger.info('Order processed successfully', {
        context: 'processOrder',
        orderId,
        status: 'completed',
      });
    } catch (error) {
      // error: 记录错误
      this.logger.error('Failed to process order', {
        context: 'processOrder',
        orderId,
        error: error instanceof Error ? error.message : 'Unknown error',
      });
      throw error;
    }
  }

  // 性能监控示例
  async monitorPerformance() {
    const startTime = Date.now();

    // verbose: 记录性能相关信息
    this.logger.verbose('Performance monitoring started', {
      context: 'monitorPerformance',
      startTime,
    });

    // ... 执行业务逻辑 ...

    const duration = Date.now() - startTime;

    if (duration > 1000) {
      // warn: 性能警告
      this.logger.warn('Slow operation detected', {
        context: 'monitorPerformance',
        duration,
        threshold: 1000,
      });
    } else {
      // debug: 性能调试信息
      this.logger.debug('Operation completed within threshold', {
        context: 'monitorPerformance',
        duration,
      });
    }
  }
}

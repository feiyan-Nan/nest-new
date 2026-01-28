import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';
import { Request, Response } from 'express';
import * as requestIp from 'request-ip';
import { WinstonLoggerService } from '@/logger/winston-logger.service';

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  constructor(private readonly logger: WinstonLoggerService) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest<Request>();
    const response = context.switchToHttp().getResponse<Response>();

    const method = request.method;
    const url = request.url;

    // 排除高频路径，不记录日志
    const excludePaths = [
      '/health', // 健康检查
      '/metrics', // 监控指标
      '/favicon.ico', // 网站图标
      '/robots.txt', // 爬虫协议
      '/static/', // 静态资源
      '/public/', // 公共资源
      '/assets/', // 前端资源
      '/uploads/', // 上传文件
      '/_next/', // Next.js 资源（如果使用）
      '/socket.io/', // WebSocket（如果使用）
    ];

    if (excludePaths.some((path) => url.startsWith(path))) {
      return next.handle();
    }
    const headers = (request.headers as Record<string, string>) || {};
    const body = (request.body as Record<string, unknown>) || {};
    const query = (request.query as Record<string, unknown>) || {};
    const params = (request.params as Record<string, unknown>) || {};
    const ip = requestIp.getClientIp(request);

    const userAgent = headers['user-agent'] || 'Unknown';
    const startTime = Date.now();

    // 记录请求信息
    this.logger.log(`→ [${method}] ${url}`, 'HTTP Request', {
      method,
      url,
      ip,
      userAgent,
      query: Object.keys(query).length > 0 ? query : undefined,
      params: Object.keys(params).length > 0 ? params : undefined,
      body:
        method !== 'GET' && method !== 'HEAD' && Object.keys(body).length > 0
          ? this.sanitizeBody(body)
          : undefined,
    });

    return next.handle().pipe(
      tap(() => {
        const duration = Date.now() - startTime;
        const statusCode = response.statusCode;

        this.logger.log(
          `← [${method}] ${url} ${statusCode} ${duration}ms`,
          'HTTP Response',
          {
            method,
            url,
            statusCode,
            duration: `${duration}ms`,
          },
        );
      }),
      catchError((error: unknown) => {
        const duration = Date.now() - startTime;
        const statusCode = response.statusCode || 500;

        const errorMessage =
          error instanceof Error ? error.message : String(error);
        const errorStack = error instanceof Error ? error.stack : undefined;

        this.logger.error(
          `✗ [${method}] ${url} ${statusCode} ${duration}ms - ${errorMessage}`,
          'HTTP Error',
          {
            method,
            url,
            statusCode,
            duration: `${duration}ms`,
            error: errorMessage,
            stack: errorStack,
          },
        );

        throw error;
      }),
    );
  }

  /**
   * 过滤敏感信息（如密码）
   */
  private sanitizeBody(body: Record<string, unknown>): Record<string, unknown> {
    if (!body || typeof body !== 'object') {
      return body;
    }

    const sanitized = { ...body };
    const sensitiveFields = [
      'password',
      'token',
      'secret',
      'apiKey',
      'authorization',
      'creditCard',
    ];

    for (const field of sensitiveFields) {
      if (field in sanitized) {
        sanitized[field] = '***REDACTED***';
      }
    }

    return sanitized;
  }
}

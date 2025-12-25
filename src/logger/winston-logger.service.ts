import { Inject, Injectable } from '@nestjs/common';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';
import { ClsService } from 'nestjs-cls';
import { Logger } from 'winston';
import { RequestClsStore } from './types/cls-store.interface';

@Injectable()
export class WinstonLoggerService {
  constructor(
    @Inject(WINSTON_MODULE_PROVIDER)
    private readonly logger: Logger,
    private readonly cls: ClsService<RequestClsStore>,
  ) {}

  private getContextLogger(context?: string): Logger {
    const requestId = this.cls.getId();
    return this.logger.child({
      context,
      requestId,
    });
  }

  log(message: string, context?: string, meta?: Record<string, any>) {
    this.getContextLogger(context).info(message, meta);
  }

  error(message: string, context?: string, meta?: Record<string, any>) {
    this.getContextLogger(context).error(message, meta);
  }

  warn(message: string, context?: string, meta?: Record<string, any>) {
    this.getContextLogger(context).warn(message, meta);
  }

  debug(message: string, context?: string, meta?: Record<string, any>) {
    this.getContextLogger(context).debug(message, meta);
  }

  verbose(message: string, context?: string, meta?: Record<string, any>) {
    this.getContextLogger(context).verbose(message, meta);
  }

  http(message: string, context?: string, meta?: Record<string, any>) {
    this.getContextLogger(context).http(message, meta);
  }

  silly(message: string, context?: string, meta?: Record<string, any>) {
    this.getContextLogger(context).silly(message, meta);
  }

  getRequestId(): string | undefined {
    return this.cls.getId();
  }

  getRequestContext<K extends keyof RequestClsStore>(
    key: K,
  ): RequestClsStore[K] | undefined {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
    return this.cls.get(key) as RequestClsStore[K] | undefined;
  }
}

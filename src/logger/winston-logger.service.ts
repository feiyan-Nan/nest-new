import { Inject, Injectable, Scope } from '@nestjs/common';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';
import { Logger } from 'winston';

@Injectable({ scope: Scope.TRANSIENT })
export class WinstonLoggerService {
  private contextLogger: Logger;
  private context: string = 'Application';

  constructor(
    @Inject(WINSTON_MODULE_PROVIDER)
    private readonly logger: Logger,
  ) {
    this.contextLogger = this.logger;
  }

  setContext(context: string) {
    this.context = context;
    this.contextLogger = this.logger.child({ context });
  }

  log(message: string, meta?: Record<string, any>) {
    this.contextLogger.info(message, meta);
  }

  error(message: string, meta?: Record<string, any>) {
    this.contextLogger.error(message, meta);
  }

  warn(message: string, meta?: Record<string, any>) {
    this.contextLogger.warn(message, meta);
  }

  debug(message: string, meta?: Record<string, any>) {
    this.contextLogger.debug(message, meta);
  }

  verbose(message: string, meta?: Record<string, any>) {
    this.contextLogger.verbose(message, meta);
  }

  http(message: string, meta?: Record<string, any>) {
    this.contextLogger.http(message, meta);
  }

  silly(message: string, meta?: Record<string, any>) {
    this.contextLogger.silly(message, meta);
  }
}

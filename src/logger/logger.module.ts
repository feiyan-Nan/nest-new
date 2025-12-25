import { Module } from '@nestjs/common';
import { WinstonModule } from 'nest-winston';
import { winstonConfig } from './winston.config';
import { WinstonLoggerService } from './winston-logger.service';

@Module({
  imports: [WinstonModule.forRoot(winstonConfig)],
  providers: [WinstonLoggerService],
  exports: [WinstonModule, WinstonLoggerService],
})
export class LoggerModule {}

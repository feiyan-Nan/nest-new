import { Module } from '@nestjs/common';
import { WinstonModule } from 'nest-winston';
import { createWinstonConfig } from './winston.config';
import { WinstonLoggerService } from './winston-logger.service';
import { AppConfigService } from '@/config/app-config.service';

@Module({
  imports: [
    WinstonModule.forRootAsync({
      inject: [AppConfigService],
      useFactory: (configService: AppConfigService) => {
        const appName = configService.app.name;
        return createWinstonConfig(appName);
      },
    }),
  ],
  providers: [WinstonLoggerService],
  exports: [WinstonModule, WinstonLoggerService],
})
export class LoggerModule {}

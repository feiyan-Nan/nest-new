import { NestFactory } from '@nestjs/core';
import { LoggerService, VersioningType } from '@nestjs/common';
import compression from 'compression';
import { constants } from 'node:zlib';
import { WINSTON_MODULE_NEST_PROVIDER } from 'nest-winston';
import { AppModule } from '@/app.module';
import { AppConfigService } from '@/config/app-config.service';
import { HttpExceptionFilter } from '@/common/filters/http-exception.filter';
import { WinstonLoggerService } from '@/logger/winston-logger.service';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    bufferLogs: true,
  });

  app.useLogger(app.get(WINSTON_MODULE_NEST_PROVIDER));

  const winstonLoggerService = app.get(WinstonLoggerService);
  app.useGlobalFilters(new HttpExceptionFilter(winstonLoggerService));

  const configService = app.get(AppConfigService);
  const { port } = configService.app;
  const compressionConfig = configService.compression;

  if (compressionConfig.enabled) {
    app.use(
      compression({
        threshold: compressionConfig.threshold,
        brotli: {
          params: {
            [constants.BROTLI_PARAM_QUALITY]: compressionConfig.brotliQuality,
          },
        },
      }),
    );
  }

  // Set global prefix
  app.setGlobalPrefix('api');

  // Enable URI Versioning
  app.enableVersioning({
    type: VersioningType.URI,
  });

  await app.listen(port);

  const logger = app.get<LoggerService>(WINSTON_MODULE_NEST_PROVIDER);
  logger.log(`Application is running on: http://localhost:${port}`);
}

bootstrap().catch((error: unknown) => {
  if (
    error &&
    typeof error === 'object' &&
    'code' in error &&
    error.code === 'EADDRINUSE'
  ) {
    console.error('\n❌ Port is already in use!');
    console.error('💡 Run: pnpm run shut\n');
  } else {
    console.error('Failed to start application:', error);
  }
  process.exit(1);
});

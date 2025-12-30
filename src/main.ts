import { NestFactory } from '@nestjs/core';
import { LoggerService, VersioningType } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
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

  const apiConfig = configService.api;
  // Set global prefix
  app.setGlobalPrefix(apiConfig.prefix);

  // Enable URI Versioning
  app.enableVersioning({
    type: VersioningType.URI,
  });

  // Setup Swagger
  const swaggerConfig = configService.swagger;
  if (swaggerConfig.enabled) {
    const documentConfig = new DocumentBuilder()
      .setTitle(swaggerConfig.title)
      .setDescription(swaggerConfig.description)
      .setVersion(swaggerConfig.version)
      .setContact(
        '小破孩',
        'https://github.com/feiyan-Nan',
        '3328921305@qq.com',
      )
      .addBearerAuth()
      .build();
    const document = SwaggerModule.createDocument(app, documentConfig);
    SwaggerModule.setup(swaggerConfig.path, app, document);
  }

  await app.listen(port);

  const logger = app.get<LoggerService>(WINSTON_MODULE_NEST_PROVIDER);
  logger.log(
    `Application is running on: http://localhost:${port}/${apiConfig.prefix}`,
  );
  if (swaggerConfig.enabled) {
    logger.log(`Swagger docs: http://localhost:${port}/${swaggerConfig.path}`);
  }
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

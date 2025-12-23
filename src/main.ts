import { NestFactory } from '@nestjs/core';
import { Logger } from '@nestjs/common';
import compression from 'compression';
import { constants } from 'node:zlib';
import { AppModule } from '@/app.module';
import { AppConfigService } from '@/config/app-config.service';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
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

  await app.listen(port);

  const logger = new Logger('Bootstrap');
  logger.log(`Application is running on: http://localhost:${port}`);
}

bootstrap().catch((error) => {
  const logger = new Logger('Bootstrap');
  logger.error('Failed to start application', error);
  process.exit(1);
});

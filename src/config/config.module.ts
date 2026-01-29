import { Global, Module } from '@nestjs/common';
import { ConfigModule as NestConfigModule } from '@nestjs/config';
import { AppConfigService } from './app-config.service';
import {
  appConfig,
  databaseConfig,
  jwtConfig,
  apiConfig,
  corsConfig,
  compressionConfig,
  scheduleConfig,
  swaggerConfig,
  redisConfig,
  mongodbConfig,
} from './configs';

@Global()
@Module({
  imports: [
    NestConfigModule.forRoot({
      load: [
        appConfig,
        databaseConfig,
        jwtConfig,
        apiConfig,
        corsConfig,
        compressionConfig,
        scheduleConfig,
        swaggerConfig,
        redisConfig,
        mongodbConfig,
      ],
      cache: true,
    }),
  ],
  providers: [AppConfigService],
  exports: [AppConfigService],
})
export class AppConfigModule {}

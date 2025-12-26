import {
  Module,
  NestModule,
  MiddlewareConsumer,
  ClassSerializerInterceptor,
} from '@nestjs/common';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { ClsModule, ClsService, ClsStore } from 'nestjs-cls';
import { Request } from 'express';
import { AppController } from '@/app.controller';
import { AppService } from '@/app.service';
import { AppConfigModule } from '@/config/config.module';
import { ProvidersModule } from '@/examples/providers-demo.module';
import { DatabaseModule } from '@/database/database.module';
import { LoggerModule } from '@/logger';
import { LoggerDemoModule } from '@/logger/logger-demo.module';
import { CorsMiddleware } from '@/common/middleware/cors.middleware';
import { TransformInterceptor } from '@/common/interceptors/transform.interceptor';
import { LoggingInterceptor } from '@/common/interceptors/logging.interceptor';

@Module({
  imports: [
    ClsModule.forRoot({
      global: true,
      middleware: {
        mount: true,
        generateId: true,
        idGenerator: (req: Request): string => {
          const requestId = req.headers['x-request-id'];
          return typeof requestId === 'string'
            ? requestId
            : `${Date.now()}-${Math.random().toString(36).substring(2, 15)}`;
        },
        setup: (cls: ClsService<ClsStore>, req: Request) => {
          cls.set('ip', req.ip || req.socket?.remoteAddress || '');
          cls.set('userAgent', req.headers['user-agent'] || '');
        },
      },
    }),
    AppConfigModule,
    LoggerModule,
    DatabaseModule,
    ProvidersModule,
    LoggerDemoModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_INTERCEPTOR,
      useClass: LoggingInterceptor,
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: ClassSerializerInterceptor,
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: TransformInterceptor,
    },
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(CorsMiddleware).forRoutes('*');
  }
}

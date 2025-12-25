import { Module, NestModule, MiddlewareConsumer } from '@nestjs/common';
import { AppController } from '@/app.controller';
import { AppService } from '@/app.service';
import { AppConfigModule } from '@/config/config.module';
import { ProvidersModule } from '@/examples/providers-demo.module';
import { DatabaseModule } from '@/database/database.module';
import { LoggerModule } from '@/logger';
import { LoggerDemoModule } from '@/logger/logger-demo.module';
import { CorsMiddleware } from '@/common/middleware/cors.middleware';

@Module({
  imports: [
    AppConfigModule,
    LoggerModule,
    DatabaseModule,
    ProvidersModule,
    LoggerDemoModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(CorsMiddleware).forRoutes('*');
  }
}

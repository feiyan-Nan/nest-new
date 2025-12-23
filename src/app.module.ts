import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AppConfigModule } from '@/config/config.module';
import { ProvidersModule } from '@/examples/providers-demo.module';

@Module({
  imports: [AppConfigModule, ProvidersModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}

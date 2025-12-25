import { Module } from '@nestjs/common';
import { LoggerModule } from '@/logger';
import { LoggerDemoService } from './logger-demo.service';
import { LoggerDemoController } from './logger-demo.controller';
import { AutoContextDemoService } from './auto-context-demo.service';
import { AutoContextDemoController } from './auto-context-demo.controller';

@Module({
  imports: [LoggerModule],
  controllers: [LoggerDemoController, AutoContextDemoController],
  providers: [LoggerDemoService, AutoContextDemoService],
})
export class LoggerDemoModule {}

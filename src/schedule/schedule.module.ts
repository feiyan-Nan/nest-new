import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { TasksService } from './tasks.service';
import { LoggerModule } from '@/logger';

@Module({
  imports: [ScheduleModule.forRoot(), LoggerModule],
  providers: [TasksService],
  exports: [TasksService],
})
export class ScheduleTasksModule {}

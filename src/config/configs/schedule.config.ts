import { registerAs } from '@nestjs/config';
import { getConfig } from '../yaml-loader';

export interface IScheduleConfig {
  enabled: boolean;
  cleanupLogs: {
    enabled: boolean;
    cron: string;
    retentionDays: number;
  };
  healthCheck: {
    enabled: boolean;
    cron: string;
  };
}

export default registerAs(
  'schedule',
  (): IScheduleConfig => ({
    enabled: getConfig<boolean>('schedule.enabled', true),
    cleanupLogs: {
      enabled: getConfig<boolean>('schedule.cleanup.enabled', true),
      cron: getConfig<string>('schedule.cleanup.cron', '0 0 * * *'),
      retentionDays: getConfig<number>('schedule.cleanup.retention', 30),
    },
    healthCheck: {
      enabled: getConfig<boolean>('schedule.health.enabled', true),
      cron: getConfig<string>('schedule.health.cron', '0 * * * *'),
    },
  }),
);

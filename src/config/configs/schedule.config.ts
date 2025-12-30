import { registerAs } from '@nestjs/config';
import { createNamespaceConfig } from '../yaml-loader';

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

export default registerAs('schedule', (): IScheduleConfig => {
  const getScheduleConfig = createNamespaceConfig('schedule');

  return {
    enabled: getScheduleConfig<boolean>('enabled', true),
    cleanupLogs: {
      enabled: getScheduleConfig<boolean>('cleanup.enabled', true),
      cron: getScheduleConfig<string>('cleanup.cron', '0 0 * * *'),
      retentionDays: getScheduleConfig<number>('cleanup.retention', 30),
    },
    healthCheck: {
      enabled: getScheduleConfig<boolean>('health.enabled', true),
      cron: getScheduleConfig<string>('health.cron', '0 * * * *'),
    },
  };
});

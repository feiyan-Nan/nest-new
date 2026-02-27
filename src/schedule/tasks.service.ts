import { Injectable } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { AppConfigService } from '@/config/app-config.service';
import { DataSource } from 'typeorm';
import { CronExpression } from '@nestjs/schedule/dist/enums/cron-expression.enum';
import { WinstonLoggerService } from '@/logger';

@Injectable()
export class TasksService {
  private readonly context = TasksService.name;

  constructor(
    private readonly configService: AppConfigService,
    private readonly dataSource: DataSource,
    private readonly logger: WinstonLoggerService,
  ) {}

  @Cron('0 0 * * *', {
    name: 'cleanup-old-logs',
    timeZone: 'Asia/Shanghai',
  })
  async handleCleanupOldLogs() {
    const config = this.configService.schedule;

    if (!config.enabled || !config.cleanupLogs.enabled) {
      return;
    }

    const startTime = Date.now();
    this.logger.log('Starting cleanup old logs task...', this.context);

    try {
      const retentionDays = config.cleanupLogs.retentionDays;
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - retentionDays);

      const result: { affectedRows: number } = await this.dataSource.query(
        `DELETE FROM logs WHERE created_at < ?`,
        [cutoffDate],
      );

      const duration = Date.now() - startTime;
      this.logger.log(
        `Cleanup old logs completed in ${duration}ms, affected rows: ${result.affectedRows || 0}`,
        this.context,
      );
    } catch (error) {
      const err = error instanceof Error ? error : new Error(String(error));
      this.logger.error(
        `Cleanup old logs task failed: ${err.message}`,
        this.context,
        { stack: err.stack },
      );
    }
  }

  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT, {
    name: 'health-check',
    timeZone: 'Asia/Shanghai',
  })
  async handleHealthCheck() {
    const config = this.configService.schedule;

    if (!config.enabled || !config.healthCheck.enabled) {
      return;
    }

    const startTime = Date.now();
    this.logger.log('Starting health check task...', this.context);

    try {
      const dbHealthy = await this.checkDatabaseConnection();

      if (!dbHealthy) {
        this.logger.warn('Database connection check failed', this.context);
      }

      const duration = Date.now() - startTime;
      this.logger.log(
        `Health check completed in ${duration}ms, status: ${dbHealthy ? 'healthy' : 'unhealthy'}`,
        this.context,
      );
    } catch (error) {
      const err = error instanceof Error ? error : new Error(String(error));
      this.logger.error(
        `Health check task failed: ${err.message}`,
        this.context,
        { stack: err.stack },
      );
    }
  }

  private async checkDatabaseConnection(): Promise<boolean> {
    try {
      await this.dataSource.query('SELECT 1');
      return true;
    } catch (error) {
      const err = error instanceof Error ? error : new Error(String(error));
      this.logger.error(
        `Database connection check failed: ${err.message}`,
        this.context,
        { stack: err.stack },
      );
      return false;
    }
  }
}

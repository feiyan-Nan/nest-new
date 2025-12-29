import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { AppConfigService } from '@/config/app-config.service';
import { DataSource } from 'typeorm';
import { CronExpression } from '@nestjs/schedule/dist/enums/cron-expression.enum';

@Injectable()
export class TasksService {
  private readonly logger = new Logger(TasksService.name);

  constructor(
    private readonly configService: AppConfigService,
    private readonly dataSource: DataSource,
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
    this.logger.log('Starting cleanup old logs task...');

    try {
      const retentionDays = config.cleanupLogs.retentionDays;
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - retentionDays);

      const result = await this.dataSource.query(
        `DELETE FROM logs WHERE created_at < ?`,
        [cutoffDate],
      );

      const duration = Date.now() - startTime;
      this.logger.log(
        `Cleanup old logs completed in ${duration}ms, affected rows: ${result.affectedRows || 0}`,
      );
    } catch (error) {
      this.logger.error(
        `Cleanup old logs task failed: ${error.message}`,
        error.stack,
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
    this.logger.log('Starting health check task...');

    try {
      const dbHealthy = await this.checkDatabaseConnection();

      if (!dbHealthy) {
        this.logger.warn('Database connection check failed');
      }

      const duration = Date.now() - startTime;
      this.logger.log(
        `Health check completed in ${duration}ms, status: ${dbHealthy ? 'healthy' : 'unhealthy'}`,
      );
    } catch (error) {
      this.logger.error(
        `Health check task failed: ${error.message}`,
        error.stack,
      );
    }
  }

  private async checkDatabaseConnection(): Promise<boolean> {
    try {
      await this.dataSource.query('SELECT 1');
      return true;
    } catch (error) {
      this.logger.error(
        `Database connection check failed: ${error.message}`,
        error.stack,
      );
      return false;
    }
  }
}

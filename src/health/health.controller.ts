import { Controller, Get } from '@nestjs/common';
import {
  HealthCheck,
  HealthCheckService,
  HttpHealthIndicator,
  TypeOrmHealthIndicator,
  DiskHealthIndicator,
} from '@nestjs/terminus';

@Controller('health')
export class HealthController {
  constructor(
    private readonly health: HealthCheckService,
    private readonly http: HttpHealthIndicator,
    private readonly typeorm: TypeOrmHealthIndicator,
    private readonly disk: DiskHealthIndicator,
  ) {}

  @Get()
  @HealthCheck()
  check() {
    return this.health.check([
      // 检查数据库连接
      () => this.typeorm.pingCheck('database', { timeout: 1500 }),
      // 检查应用本身
      () => this.http.pingCheck('nestjs', 'http://localhost:3000'),
      // 检查磁盘空间（使用超过 80% 时报错）
      () =>
        this.disk.checkStorage('disk', { path: '/', thresholdPercent: 0.8 }),
    ]);
  }

  @Get('live')
  @HealthCheck()
  live() {
    // Liveness 探针 - 检查应用是否运行
    return this.health.check([
      () =>
        this.http.pingCheck('nestjs-live', 'http://localhost:3000', {
          timeout: 800,
        }),
    ]);
  }

  @Get('ready')
  @HealthCheck()
  ready() {
    // Readiness 探针 - 检查应用是否准备好处理请求
    return this.health.check([
      () => this.typeorm.pingCheck('database', { timeout: 1500 }),
      () =>
        this.disk.checkStorage('disk', { path: '/', thresholdPercent: 0.8 }),
    ]);
  }

  @Get('startup')
  @HealthCheck()
  startup() {
    // Startup 探针 - 检查应用启动是否完成
    return this.health.check([
      () =>
        this.http.pingCheck('nestjs-startup', 'http://localhost:3000', {
          timeout: 1000,
        }),
    ]);
  }
}

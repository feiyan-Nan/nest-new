import { Controller, Get } from '@nestjs/common';
import {
  HealthCheck,
  HealthCheckService,
  HttpHealthIndicator,
  TypeOrmHealthIndicator,
  DiskHealthIndicator,
} from '@nestjs/terminus';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { Public } from '@/modules/auth/decorators/public.decorator';

@ApiTags('Health')
@Controller('health')
export class HealthController {
  constructor(
    private readonly health: HealthCheckService,
    private readonly http: HttpHealthIndicator,
    private readonly typeorm: TypeOrmHealthIndicator,
    private readonly disk: DiskHealthIndicator,
  ) {}

  @Public()
  @Get()
  @HealthCheck()
  @ApiOperation({ summary: 'Full health check' })
  @ApiResponse({ status: 200, description: 'Returns overall health status' })
  @ApiResponse({ status: 503, description: 'Service unavailable' })
  check() {
    return this.health.check([
      () => this.typeorm.pingCheck('database', { timeout: 1500 }),
      () => this.http.pingCheck('nestjs', 'http://localhost:3000'),
      () =>
        this.disk.checkStorage('disk', { path: '/', thresholdPercent: 0.8 }),
    ]);
  }

  @Public()
  @Get('live')
  @HealthCheck()
  @ApiOperation({ summary: 'Liveness probe' })
  @ApiResponse({ status: 200, description: 'Application is running' })
  @ApiResponse({ status: 503, description: 'Application is not running' })
  live() {
    return this.health.check([
      () =>
        this.http.pingCheck('nestjs-live', 'http://localhost:3000', {
          timeout: 800,
        }),
    ]);
  }

  @Public()
  @Get('ready')
  @HealthCheck()
  @ApiOperation({ summary: 'Readiness probe' })
  @ApiResponse({ status: 200, description: 'Application is ready' })
  @ApiResponse({ status: 503, description: 'Application is not ready' })
  ready() {
    return this.health.check([
      () => this.typeorm.pingCheck('database', { timeout: 1500 }),
      () =>
        this.disk.checkStorage('disk', { path: '/', thresholdPercent: 0.8 }),
    ]);
  }

  @Public()
  @Get('startup')
  @HealthCheck()
  @ApiOperation({ summary: 'Startup probe' })
  @ApiResponse({ status: 200, description: 'Application started successfully' })
  @ApiResponse({ status: 503, description: 'Application startup failed' })
  startup() {
    return this.health.check([
      () =>
        this.http.pingCheck('nestjs-startup', 'http://localhost:3000', {
          timeout: 1000,
        }),
    ]);
  }
}

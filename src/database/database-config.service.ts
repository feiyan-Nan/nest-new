import { Injectable } from '@nestjs/common';
import { TypeOrmModuleOptions, TypeOrmOptionsFactory } from '@nestjs/typeorm';
import { AppConfigService } from '@/config/app-config.service';

@Injectable()
export class DatabaseConfigService implements TypeOrmOptionsFactory {
  constructor(private readonly appConfigService: AppConfigService) {}

  createTypeOrmOptions(): TypeOrmModuleOptions {
    const config = this.databaseConfig;
    return {
      type: config.type,
      host: config.host,
      port: config.port,
      username: config.username,
      password: config.password,
      database: config.database,
      synchronize: config.synchronize,
      logging: config.logging,
      entities: [__dirname + '/**/*.entity{.ts,.js}'],
      // 连接池配置
      extra: {
        connectionLimit: config.pool.connectionLimit,
        queueLimit: config.pool.queueLimit,
        waitForConnections: config.pool.waitForConnections,
        connectionTimeoutMillis: config.pool.connectionTimeoutMillis,
      },
      // TypeORM 连接池配置
      poolSize: config.pool.connectionLimit,
      acquireTimeout: config.pool.acquireTimeout,
      connectTimeout: config.pool.connectionTimeoutMillis,
      maxQueryExecutionTime: config.pool.maxQueryExecutionTime,
    } as TypeOrmModuleOptions;
  }

  get databaseConfig() {
    return this.appConfigService.database;
  }
}

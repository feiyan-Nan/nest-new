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
        connectionLimit: config.pool.connectionLimit as number,
        queueLimit: config.pool.queueLimit as number,
        waitForConnections: config.pool.waitForConnections as boolean,
        connectionTimeoutMillis: config.pool.connectionTimeoutMillis as number,
      },
      // TypeORM 连接池配置
      poolSize: config.pool.connectionLimit as number,
      acquireTimeout: config.pool.acquireTimeout as number,
      connectTimeout: config.pool.connectionTimeoutMillis as number,
      maxQueryExecutionTime: config.pool.maxQueryExecutionTime as number,
    } as TypeOrmModuleOptions;
  }

  get databaseConfig() {
    return this.appConfigService.database;
  }
}

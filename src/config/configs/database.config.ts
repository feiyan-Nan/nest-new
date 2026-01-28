import { registerAs } from '@nestjs/config';
import { createNamespaceConfig } from '../yaml-loader';

export type DatabaseType =
  | 'mysql'
  | 'postgres'
  | 'sqlite'
  | 'mariadb'
  | 'mssql'
  | 'oracle';

export interface IConnectionPoolConfig {
  connectionLimit: number;
  queueLimit: number;
  waitForConnections: boolean;
  connectionTimeoutMillis: number;
  acquireTimeout: number;
  idleTimeoutMillis: number;
  maxQueryExecutionTime: number;
}

export interface IDatabaseConfig {
  type: DatabaseType;
  host: string;
  port: number;
  username: string;
  password: string;
  database: string;
  synchronize: boolean;
  logging: boolean;
  pool: IConnectionPoolConfig;
}

export default registerAs('database', (): IDatabaseConfig => {
  const getDbConfig = createNamespaceConfig('database');
  const getPoolConfig = createNamespaceConfig('database.pool');

  return {
    type: getDbConfig<DatabaseType>('type', 'mysql'),
    host: getDbConfig<string>('host', 'localhost'),
    port: getDbConfig<number>('port', 3306),
    username: getDbConfig<string>('username', 'root'),
    password: getDbConfig<string>('password', ''),
    database: getDbConfig<string>('name', 'nest_db'),
    synchronize: getDbConfig<boolean>('sync', false),
    logging: getDbConfig<boolean>('logging', false),
    pool: {
      connectionLimit: getPoolConfig<number>('connectionLimit', 10),
      queueLimit: getPoolConfig<number>('queueLimit', 0),
      waitForConnections: getPoolConfig<boolean>('waitForConnections', true),
      connectionTimeoutMillis: getPoolConfig<number>('connectionTimeoutMillis', 2000),
      acquireTimeout: getPoolConfig<number>('acquireTimeout', 30000),
      idleTimeoutMillis: getPoolConfig<number>('idleTimeoutMillis', 60000),
      maxQueryExecutionTime: getPoolConfig<number>('maxQueryExecutionTime', 60000),
    },
  };
});

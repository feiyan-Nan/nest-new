import { registerAs } from '@nestjs/config';
import { createNamespaceConfig } from '../yaml-loader';

export type DatabaseType =
  | 'mysql'
  | 'postgres'
  | 'sqlite'
  | 'mariadb'
  | 'mssql'
  | 'oracle';

export interface IDatabaseConfig {
  type: DatabaseType;
  host: string;
  port: number;
  username: string;
  password: string;
  database: string;
  synchronize: boolean;
  logging: boolean;
}

export default registerAs('database', (): IDatabaseConfig => {
  const getDbConfig = createNamespaceConfig('database');

  return {
    type: getDbConfig<DatabaseType>('type', 'mysql'),
    host: getDbConfig<string>('host', 'localhost'),
    port: getDbConfig<number>('port', 3306),
    username: getDbConfig<string>('username', 'root'),
    password: getDbConfig<string>('password', ''),
    database: getDbConfig<string>('name', 'nest_db'),
    synchronize: getDbConfig<boolean>('sync', false),
    logging: getDbConfig<boolean>('logging', false),
  };
});

import { registerAs } from '@nestjs/config';
import { getConfig } from '../yaml-loader';

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
  migrationsPath: string;
}

export default registerAs(
  'database',
  (): IDatabaseConfig => ({
    type: getConfig<DatabaseType>('database.type', 'mysql'),
    host: getConfig<string>('database.host', 'localhost'),
    port: getConfig<number>('database.port', 3306),
    username: getConfig<string>('database.username', 'root'),
    password: getConfig<string>('database.password', ''),
    database: getConfig<string>('database.name', 'nest_db'),
    synchronize: getConfig<boolean>('database.sync', false),
    logging: getConfig<boolean>('database.logging', false),
    migrationsPath: getConfig<string>(
      'database.migrations',
      'src/database/migrations',
    ),
  }),
);

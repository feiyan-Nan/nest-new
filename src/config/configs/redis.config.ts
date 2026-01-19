import { registerAs } from '@nestjs/config';
import { createNamespaceConfig } from '../yaml-loader';

export interface IRedisConfig {
  host: string;
  port: number;
  password?: string;
  db: number;
  keyPrefix: string;
  ttl: number;
}

export default registerAs('redis', (): IRedisConfig => {
  const getRedisConfig = createNamespaceConfig('redis');

  return {
    host: getRedisConfig<string>('host', 'localhost'),
    port: getRedisConfig<number>('port', 6379),
    password: getRedisConfig<string>('password', ''),
    db: getRedisConfig<number>('db', 0),
    keyPrefix: getRedisConfig<string>('keyPrefix', 'nest:'),
    ttl: getRedisConfig<number>('ttl', 3600),
  };
});

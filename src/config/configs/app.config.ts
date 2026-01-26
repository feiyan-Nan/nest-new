import { registerAs } from '@nestjs/config';
import { createNamespaceConfig } from '../yaml-loader';

export interface IAppConfig {
  env: string;
  port: number;
  name: string;
}

export default registerAs('app', (): IAppConfig => {
  const getAppConfig = createNamespaceConfig('app');

  return {
    env: getAppConfig<string>('env', 'development'),
    port: getAppConfig<number>('port', 3000),
    name: getAppConfig<string>('name', 'NestApp'),
  };
});

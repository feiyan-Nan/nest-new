import { registerAs } from '@nestjs/config';
import { getConfig } from '../yaml-loader';

export interface IAppConfig {
  env: string;
  port: number;
}

export default registerAs(
  'app',
  (): IAppConfig => ({
    env: getConfig<string>('app.env', 'development'),
    port: getConfig<number>('app.port', 3000),
  }),
);

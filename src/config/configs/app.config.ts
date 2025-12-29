import { registerAs } from '@nestjs/config';
import { getConfig } from '../yaml-loader';

export interface IAppConfig {
  nodeEnv: string;
  port: number;
}

export default registerAs(
  'app',
  (): IAppConfig => ({
    nodeEnv: getConfig<string>('app.env', 'development'),
    port: getConfig<number>('app.port', 3000),
  }),
);

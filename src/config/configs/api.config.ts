import { registerAs } from '@nestjs/config';
import { getConfig } from '../yaml-loader';

export interface IApiConfig {
  prefix: string;
  version: string;
}

export default registerAs(
  'api',
  (): IApiConfig => ({
    prefix: getConfig<string>('api.prefix', 'api'),
    version: getConfig<string>('api.version', 'v1'),
  }),
);

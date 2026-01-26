import { registerAs } from '@nestjs/config';
import { createNamespaceConfig } from '../yaml-loader';

export interface IApiConfig {
  prefix: string;
  version: number;
}

export default registerAs('api', (): IApiConfig => {
  const getApiConfig = createNamespaceConfig('api');

  return {
    prefix: getApiConfig<string>('prefix', 'api'),
    version: getApiConfig<number>('version', 1),
  };
});

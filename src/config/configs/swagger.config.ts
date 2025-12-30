import { registerAs } from '@nestjs/config';
import { createNamespaceConfig } from '../yaml-loader';

export interface ISwaggerConfig {
  enabled: boolean;
  title: string;
  description: string;
  version: string;
  path: string;
}

export default registerAs('swagger', (): ISwaggerConfig => {
  const getSwaggerConfig = createNamespaceConfig('swagger');

  return {
    enabled: getSwaggerConfig<boolean>('enabled', true),
    title: getSwaggerConfig<string>('title', 'API'),
    description: getSwaggerConfig<string>('description', 'API Documentation'),
    version: getSwaggerConfig<string>('version', '1.0'),
    path: getSwaggerConfig<string>('path', 'docs'),
  };
});

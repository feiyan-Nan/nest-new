import { registerAs } from '@nestjs/config';
import { getConfig } from '../yaml-loader';

export interface ISwaggerConfig {
  enabled: boolean;
  title: string;
  description: string;
  version: string;
  path: string;
}

export default registerAs(
  'swagger',
  (): ISwaggerConfig => ({
    enabled: getConfig<boolean>('swagger.enabled', true),
    title: getConfig<string>('swagger.title', 'API'),
    description: getConfig<string>('swagger.description', 'API Documentation'),
    version: getConfig<string>('swagger.version', '1.0'),
    path: getConfig<string>('swagger.path', 'docs'),
  }),
);

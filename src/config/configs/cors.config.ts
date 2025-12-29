import { registerAs } from '@nestjs/config';
import { getConfig } from '../yaml-loader';

export interface ICorsConfig {
  enabled: boolean;
  origin: string | string[] | RegExp | RegExp[];
  methods?: string | string[];
  allowedHeaders?: string | string[];
  exposedHeaders?: string | string[];
  credentials?: boolean;
  maxAge?: number;
  includePaths?: string[];
  excludePaths?: string[];
}

export default registerAs(
  'cors',
  (): ICorsConfig => ({
    enabled: getConfig<boolean>('cors.enabled', false),
    origin: getConfig<string | string[]>('cors.origin', '*'),
    methods: getConfig<string>(
      'cors.methods',
      'GET,HEAD,PUT,PATCH,POST,DELETE',
    ),
    allowedHeaders: getConfig<string>('cors.headers', '*'),
    exposedHeaders: getConfig<string>('cors.exposedHeaders'),
    credentials: getConfig<boolean>('cors.credentials', false),
    maxAge: getConfig<number>('cors.maxAge', 3600),
    includePaths: getConfig<string[]>('cors.includePaths'),
    excludePaths: getConfig<string[]>('cors.excludePaths'),
  }),
);

import { registerAs } from '@nestjs/config';
import { createNamespaceConfig } from '../yaml-loader';

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

export default registerAs('cors', (): ICorsConfig => {
  const getCorsConfig = createNamespaceConfig('cors');

  return {
    enabled: getCorsConfig<boolean>('enabled', false),
    origin: getCorsConfig<string | string[]>('origin', '*'),
    methods: getCorsConfig<string>('methods', 'GET,HEAD,PUT,PATCH,POST,DELETE'),
    allowedHeaders: getCorsConfig<string>('headers', '*'),
    exposedHeaders: getCorsConfig<string>('exposedHeaders'),
    credentials: getCorsConfig<boolean>('credentials', false),
    maxAge: getCorsConfig<number>('maxAge', 3600),
    includePaths: getCorsConfig<string[]>('includePaths'),
    excludePaths: getCorsConfig<string[]>('excludePaths'),
  };
});

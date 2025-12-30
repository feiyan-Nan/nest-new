import { registerAs } from '@nestjs/config';
import { createNamespaceConfig } from '../yaml-loader';

export interface ICompressionConfig {
  enabled: boolean;
  threshold: number;
  brotliQuality: number;
}

export default registerAs('compression', (): ICompressionConfig => {
  const getCompressionConfig = createNamespaceConfig('compression');

  return {
    enabled: getCompressionConfig<boolean>('enabled', false),
    threshold: getCompressionConfig<number>('threshold', 1024),
    brotliQuality: getCompressionConfig<number>('quality', 4),
  };
});

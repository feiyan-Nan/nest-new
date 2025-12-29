import { registerAs } from '@nestjs/config';
import { getConfig } from '../yaml-loader';

export interface ICompressionConfig {
  enabled: boolean;
  threshold: number;
  brotliQuality: number;
}

export default registerAs(
  'compression',
  (): ICompressionConfig => ({
    enabled: getConfig<boolean>('compression.enabled', false),
    threshold: getConfig<number>('compression.threshold', 1024),
    brotliQuality: getConfig<number>('compression.quality', 4),
  }),
);

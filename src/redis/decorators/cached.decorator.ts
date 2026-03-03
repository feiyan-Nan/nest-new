import { applyDecorators, UseInterceptors } from '@nestjs/common';
import { Cacheable, CacheOptions } from './cacheable.decorator';
import { CacheInterceptor } from '../interceptors/cache.interceptor';

export const Cached = (options: CacheOptions) =>
  applyDecorators(UseInterceptors(CacheInterceptor), Cacheable(options));

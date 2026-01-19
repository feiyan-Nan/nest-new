import { SetMetadata } from '@nestjs/common';

export const CACHE_KEY_METADATA = 'cache:key';
export const CACHE_TTL_METADATA = 'cache:ttl';

export interface CacheOptions {
  key?: string;
  ttl?: number;
}

export const Cacheable = (options?: CacheOptions) => {
  return (
    target: object,
    propertyKey: string,
    descriptor: PropertyDescriptor,
  ) => {
    if (options?.key) {
      SetMetadata(CACHE_KEY_METADATA, options.key)(
        target,
        propertyKey,
        descriptor,
      );
    }
    if (options?.ttl !== undefined) {
      SetMetadata(CACHE_TTL_METADATA, options.ttl)(
        target,
        propertyKey,
        descriptor,
      );
    }
    return descriptor;
  };
};

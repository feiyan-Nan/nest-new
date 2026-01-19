import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable, of } from 'rxjs';
import { tap } from 'rxjs/operators';
import { Reflector } from '@nestjs/core';
import { RedisService } from '../redis.service';
import {
  CACHE_KEY_METADATA,
  CACHE_TTL_METADATA,
} from '../decorators/cacheable.decorator';

@Injectable()
export class CacheInterceptor implements NestInterceptor {
  constructor(
    private readonly redisService: RedisService,
    private readonly reflector: Reflector,
  ) {}

  async intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Promise<Observable<unknown>> {
    const cacheKey = this.reflector.get<string>(
      CACHE_KEY_METADATA,
      context.getHandler(),
    );
    const ttl = this.reflector.get<number>(
      CACHE_TTL_METADATA,
      context.getHandler(),
    );

    if (!cacheKey) {
      return next.handle();
    }

    const request = context.switchToHttp().getRequest<{
      params?: Record<string, string>;
      query?: Record<string, string>;
      body?: Record<string, unknown>;
    }>();
    const key = this.generateKey(cacheKey, request);

    const cachedValue = await this.redisService.get<unknown>(key);
    if (cachedValue !== null) {
      return of(cachedValue);
    }

    // 缓存操作不会阻塞响应返回，客户端不需要等待 Redis 写入完成
    return next.handle().pipe(
      tap((response) => {
        void this.redisService.set(key, response, ttl);
      }),
    );
  }

  private generateKey(
    baseKey: string,
    request: {
      params?: Record<string, string>;
      query?: Record<string, string>;
      body?: Record<string, unknown>;
    },
  ): string {
    const params = request.params ?? {};
    const query = request.query ?? {};
    const body = request.body ?? {};

    let key = baseKey;
    key = key.replace(
      /:(\w+)/g,
      (_match, param: string) => params[param] ?? '',
    );

    if (Object.keys(query).length > 0) {
      const queryString = new URLSearchParams(query).toString();
      key += `?${queryString}`;
    }

    if (Object.keys(body).length > 0) {
      const bodyHash = JSON.stringify(body);
      key += `#${bodyHash}`;
    }

    return key;
  }
}

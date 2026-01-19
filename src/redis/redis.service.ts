import { Injectable, OnModuleDestroy, Logger } from '@nestjs/common';
import Redis from 'ioredis';
import { AppConfigService } from '../config/app-config.service';

@Injectable()
export class RedisService implements OnModuleDestroy {
  private readonly logger = new Logger(RedisService.name);
  private readonly client: Redis;
  private readonly defaultTTL: number;
  private readonly keyPrefix: string;

  constructor(private readonly configService: AppConfigService) {
    const redisConfig = this.configService.redis;

    this.client = new Redis({
      host: redisConfig.host,
      port: redisConfig.port,
      password: redisConfig.password || undefined,
      db: redisConfig.db,
      keyPrefix: redisConfig.keyPrefix,
      retryStrategy: (times: number) => {
        const delay = Math.min(times * 50, 2000);
        return delay;
      },
    });

    this.defaultTTL = redisConfig.ttl;
    this.keyPrefix = redisConfig.keyPrefix;

    this.client.on('connect', () => {
      this.logger.log('Redis 连接成功');
    });

    this.client.on('error', (err) => {
      this.logger.error('Redis 连接错误', err);
    });
  }

  async onModuleDestroy() {
    await this.client.quit();
    this.logger.log('Redis 连接已关闭');
  }

  getClient(): Redis {
    return this.client;
  }

  async get<T = any>(key: string): Promise<T | null> {
    const value = await this.client.get(key);
    if (!value) return null;
    try {
      return JSON.parse(value) as T;
    } catch {
      return value as T;
    }
  }

  async set(key: string, value: unknown, ttl?: number): Promise<void> {
    const serialized =
      typeof value === 'string' ? value : JSON.stringify(value);
    const expireTime = ttl ?? this.defaultTTL;

    if (expireTime > 0) {
      await this.client.setex(key, expireTime, serialized);
    } else {
      await this.client.set(key, serialized);
    }
  }

  async del(key: string | string[]): Promise<number> {
    const keys = Array.isArray(key) ? key : [key];
    return await this.client.del(...keys);
  }

  async exists(key: string): Promise<boolean> {
    const result = await this.client.exists(key);
    return result === 1;
  }

  async expire(key: string, seconds: number): Promise<boolean> {
    const result = await this.client.expire(key, seconds);
    return result === 1;
  }

  async ttl(key: string): Promise<number> {
    return await this.client.ttl(key);
  }

  async keys(pattern: string): Promise<string[]> {
    return await this.client.keys(pattern);
  }

  async flushdb(): Promise<void> {
    await this.client.flushdb();
  }

  async incr(key: string): Promise<number> {
    return await this.client.incr(key);
  }

  async decr(key: string): Promise<number> {
    return await this.client.decr(key);
  }

  async hget(key: string, field: string): Promise<string | null> {
    return await this.client.hget(key, field);
  }

  async hset(key: string, field: string, value: string): Promise<number> {
    return await this.client.hset(key, field, value);
  }

  async hgetall(key: string): Promise<Record<string, string>> {
    return await this.client.hgetall(key);
  }

  async hdel(key: string, ...fields: string[]): Promise<number> {
    return await this.client.hdel(key, ...fields);
  }

  async sadd(key: string, ...members: string[]): Promise<number> {
    return await this.client.sadd(key, ...members);
  }

  async smembers(key: string): Promise<string[]> {
    return await this.client.smembers(key);
  }

  async srem(key: string, ...members: string[]): Promise<number> {
    return await this.client.srem(key, ...members);
  }

  async zadd(
    key: string,
    score: number,
    member: string,
  ): Promise<number | string> {
    return await this.client.zadd(key, score, member);
  }

  async zrange(key: string, start: number, stop: number): Promise<string[]> {
    return await this.client.zrange(key, start, stop);
  }

  async zrem(key: string, ...members: string[]): Promise<number> {
    return await this.client.zrem(key, ...members);
  }

  async getOrSet<T = any>(
    key: string,
    factory: () => Promise<T>,
    ttl?: number,
  ): Promise<T> {
    const cached = await this.get<T>(key);
    if (cached !== null) {
      return cached;
    }

    const value = await factory();
    await this.set(key, value, ttl);
    return value;
  }

  async remember<T = any>(
    key: string,
    ttl: number,
    callback: () => Promise<T>,
  ): Promise<T> {
    return this.getOrSet(key, callback, ttl);
  }
}

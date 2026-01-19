import { Controller, Get, Param, UseInterceptors } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { Public } from '@/modules/auth/decorators/public.decorator';
import { RedisService } from '@/redis';
import { Cacheable } from '@/redis/decorators/cacheable.decorator';
import { CacheInterceptor } from '@/redis/interceptors/cache.interceptor';

@ApiTags('缓存示例')
@Controller('cache-example')
@Public()
export class CacheExampleController {
  constructor(private readonly redisService: RedisService) {}

  @Get('test')
  @ApiOperation({ summary: '测试 Redis 连接' })
  async testRedis() {
    await this.redisService.set('test-key', 'Hello Redis!', 10);
    const value = await this.redisService.get<string>('test-key');

    return {
      message: '✅ Redis 连接正常',
      value: value ?? '',
      timestamp: new Date().toISOString(),
    };
  }

  @Get('user/:id')
  @ApiOperation({ summary: '获取用户信息（带缓存）' })
  @UseInterceptors(CacheInterceptor)
  @Cacheable({ key: 'user:id', ttl: 300 })
  async getUserWithCache(@Param('id') id: string) {
    // 模拟数据库查询延迟
    await new Promise((resolve) => setTimeout(resolve, 1000));

    return {
      id,
      name: `用户${id}`,
      email: `user${id}@example.com`,
      createdAt: new Date().toISOString(),
    };
  }

  @Get('product/:id')
  @ApiOperation({ summary: '获取商品信息（手动缓存）' })
  async getProductManualCache(@Param('id') id: string) {
    const cacheKey = `product:${id}`;

    // 使用 getOrSet 自动处理缓存逻辑
    return await this.redisService.getOrSet(
      cacheKey,
      async () => {
        // 模拟数据库查询
        await new Promise((resolve) => setTimeout(resolve, 800));

        return {
          id,
          name: `商品${id}`,
          price: Math.floor(Math.random() * 10000) / 100,
          stock: Math.floor(Math.random() * 100),
          fetchedAt: new Date().toISOString(),
        };
      },
      600, // 缓存 10 分钟
    );
  }

  @Get('stats/views/:articleId')
  @ApiOperation({ summary: '增加文章浏览量' })
  async incrementViews(@Param('articleId') articleId: string) {
    const viewKey = `article:${articleId}:views`;
    const views = await this.redisService.incr(viewKey);

    // 设置过期时间（24 小时）
    await this.redisService.expire(viewKey, 86400);

    return {
      articleId,
      views,
      message: '浏览量已更新',
    };
  }

  @Get('cache/clear/:pattern')
  @ApiOperation({ summary: '清除缓存（支持通配符）' })
  async clearCache(@Param('pattern') pattern: string) {
    const keys = await this.redisService.keys(pattern);

    if (keys.length > 0) {
      await this.redisService.del(keys);
      return {
        message: '✅ 缓存已清除',
        deletedKeys: keys,
        count: keys.length,
      };
    }

    return {
      message: '⚠️ 未找到匹配的缓存',
      pattern,
    };
  }
}

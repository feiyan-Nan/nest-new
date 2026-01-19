import { Injectable } from '@nestjs/common';
import { RedisService } from '@/redis';

@Injectable()
export class CacheExampleService {
  constructor(private readonly redisService: RedisService) {}

  // 示例 1: 基础缓存操作
  async basicCacheExample() {
    // 设置缓存（使用默认过期时间）
    await this.redisService.set('user:1', { id: 1, name: '张三' });

    // 设置缓存（自定义过期时间 60 秒）
    await this.redisService.set('user:2', { id: 2, name: '李四' }, 60);

    // 获取缓存
    const user = await this.redisService.get<{
      id: number;
      name: string;
    }>('user:1');
    console.log('获取到的用户:', user);

    // 删除缓存
    await this.redisService.del('user:1');

    // 检查缓存是否存在
    const exists = await this.redisService.exists('user:2');
    console.log('user:2 是否存在:', exists);
  }

  // 示例 2: 使用 getOrSet 方法（缓存穿透保护）
  async getOrSetExample(userId: number): Promise<{
    id: number;
    name: string;
  }> {
    const cacheKey = `user:${userId}`;

    return await this.redisService.getOrSet(
      cacheKey,
      () => Promise.resolve({ id: userId, name: `用户${userId}` }),
      300, // 缓存 5 分钟
    );
  }

  // 示例 3: 使用 remember 方法（语义化缓存）
  async rememberExample(productId: number): Promise<{
    id: number;
    name: string;
    price: number;
  }> {
    const cacheKey = `product:${productId}`;

    return await this.redisService.remember(cacheKey, 600, () =>
      Promise.resolve({
        id: productId,
        name: `商品${productId}`,
        price: Math.random() * 1000,
      }),
    );
  }

  // 示例 4: Hash 操作（用户信息存储）
  async hashExample() {
    const userId = '1001';
    const userKey = `user:${userId}`;

    // 设置 Hash 字段
    await this.redisService.hset(userKey, 'name', '王五');
    await this.redisService.hset(userKey, 'age', '25');
    await this.redisService.hset(userKey, 'email', 'wangwu@example.com');

    // 获取单个字段
    const name = await this.redisService.hget(userKey, 'name');
    console.log('用户名:', name);

    // 获取所有字段
    const userInfo = await this.redisService.hgetall(userKey);
    console.log('完整用户信息:', userInfo);

    // 删除字段
    await this.redisService.hdel(userKey, 'email');
  }

  // 示例 5: Set 操作（标签系统）
  async setExample() {
    const articleId = '2001';
    const tagsKey = `article:${articleId}:tags`;

    // 添加标签
    await this.redisService.sadd(tagsKey, 'Node.js', 'Redis', 'NestJS');

    // 获取所有标签
    const tags = await this.redisService.smembers(tagsKey);
    console.log('文章标签:', tags);

    // 删除标签
    await this.redisService.srem(tagsKey, 'Redis');
  }

  // 示例 6: Sorted Set 操作（排行榜）
  async sortedSetExample() {
    const leaderboardKey = 'game:leaderboard';

    // 添加分数
    await this.redisService.zadd(leaderboardKey, 100, 'player1');
    await this.redisService.zadd(leaderboardKey, 200, 'player2');
    await this.redisService.zadd(leaderboardKey, 150, 'player3');

    // 获取排名前 3 的玩家（从高到低）
    const topPlayers = await this.redisService.zrange(leaderboardKey, 0, 2);
    console.log('排行榜前3:', topPlayers);
  }

  // 示例 7: 计数器（文章浏览量）
  async counterExample(articleId: number) {
    const viewKey = `article:${articleId}:views`;

    // 增加浏览量
    const views = await this.redisService.incr(viewKey);
    console.log('当前浏览量:', views);

    // 设置过期时间（24 小时后重置）
    await this.redisService.expire(viewKey, 86400);

    return views;
  }

  // 示例 8: 批量删除（清除用户相关缓存）
  async batchDeleteExample(userId: number) {
    // 查找所有相关的键
    const pattern = `user:${userId}:*`;
    const keys = await this.redisService.keys(pattern);

    if (keys.length > 0) {
      // 批量删除
      await this.redisService.del(keys);
      console.log(`已删除 ${keys.length} 个缓存键`);
    }
  }
}

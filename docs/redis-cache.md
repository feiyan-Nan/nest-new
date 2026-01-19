# Redis 缓存集成文档

## 概述

项目已成功集成 Redis 缓存系统，基于 `ioredis` 客户端，提供灵活的缓存配置和多种使用方式。

## 功能特性

- ✅ 可配置的 Redis 连接参数
- ✅ 支持自定义缓存过期时间（TTL）
- ✅ 全局模块，可在任意位置注入使用
- ✅ 提供装饰器方式的自动缓存
- ✅ 丰富的 Redis 数据结构操作方法
- ✅ 连接状态监控和日志记录
- ✅ 优雅的断开连接处理

## 配置说明

### 配置文件

在 `config.development.yml` 或其他环境配置文件中添加：

```yaml
redis:
  host: localhost       # Redis 主机地址
  port: 6379           # Redis 端口
  password: ''         # Redis 密码（可选）
  db: 0                # 数据库索引
  keyPrefix: 'nest:dev:'  # Key 前缀
  ttl: 3600            # 默认过期时间（秒）
```

### 配置项说明

| 配置项 | 类型 | 默认值 | 说明 |
|--------|------|--------|------|
| `host` | string | localhost | Redis 服务器地址 |
| `port` | number | 6379 | Redis 端口 |
| `password` | string | '' | Redis 密码（可选） |
| `db` | number | 0 | Redis 数据库索引（0-15） |
| `keyPrefix` | string | 'nest:' | 所有 Key 的前缀 |
| `ttl` | number | 3600 | 默认缓存过期时间（秒） |

## 使用方式

### 1. 基础使用（注入 RedisService）

```typescript
import { Injectable } from '@nestjs/common';
import { RedisService } from '@/redis';

@Injectable()
export class UserService {
  constructor(private readonly redisService: RedisService) {}

  async getUserById(id: number) {
    const cacheKey = `user:${id}`;

    // 尝试从缓存获取
    const cached = await this.redisService.get(cacheKey);
    if (cached) {
      return cached;
    }

    // 从数据库查询
    const user = await this.userRepository.findOne({ where: { id } });

    // 写入缓存（缓存 10 分钟）
    await this.redisService.set(cacheKey, user, 600);

    return user;
  }
}
```

### 2. 使用 getOrSet 方法（推荐）

自动处理缓存逻辑，代码更简洁：

```typescript
async getUserById(id: number) {
  return await this.redisService.getOrSet(
    `user:${id}`,
    async () => {
      // 缓存未命中时执行的逻辑
      return await this.userRepository.findOne({ where: { id } });
    },
    600, // 缓存 10 分钟
  );
}
```

### 3. 使用装饰器方式（自动缓存）

**第一步：在 Controller 方法上使用装饰器**

```typescript
import { Controller, Get, Param, UseInterceptors } from '@nestjs/common';
import { Cacheable, CacheInterceptor } from '@/redis';

@Controller('users')
export class UserController {
  @Get(':id')
  @UseInterceptors(CacheInterceptor)  // 启用缓存拦截器
  @Cacheable({ key: 'user::id', ttl: 300 })  // 配置缓存
  async getUser(@Param('id') id: string) {
    // 自动缓存返回值
    return { id, name: `用户${id}` };
  }
}
```

**装饰器参数说明：**

- `key`: 缓存键模板，支持路径参数替换（如 `:id`）
- `ttl`: 缓存过期时间（秒），可选，不传则使用默认值

### 4. 计数器场景

```typescript
// 增加文章浏览量
async incrementArticleViews(articleId: number): Promise<number> {
  const viewKey = `article:${articleId}:views`;
  const views = await this.redisService.incr(viewKey);

  // 设置过期时间（24 小时后重置）
  await this.redisService.expire(viewKey, 86400);

  return views;
}
```

### 5. Hash 操作（用户信息）

```typescript
// 存储用户信息
async saveUserInfo(userId: string, userInfo: any) {
  const key = `user:${userId}:info`;
  await this.redisService.hset(key, 'name', userInfo.name);
  await this.redisService.hset(key, 'email', userInfo.email);
  await this.redisService.hset(key, 'age', userInfo.age.toString());
}

// 获取用户信息
async getUserInfo(userId: string) {
  const key = `user:${userId}:info`;
  return await this.redisService.hgetall(key);
}
```

### 6. Set 操作（标签系统）

```typescript
// 添加文章标签
async addArticleTags(articleId: string, tags: string[]) {
  const key = `article:${articleId}:tags`;
  await this.redisService.sadd(key, ...tags);
}

// 获取文章标签
async getArticleTags(articleId: string) {
  const key = `article:${articleId}:tags`;
  return await this.redisService.smembers(key);
}

// 删除标签
async removeArticleTag(articleId: string, tag: string) {
  const key = `article:${articleId}:tags`;
  await this.redisService.srem(key, tag);
}
```

### 7. Sorted Set 操作（排行榜）

```typescript
// 更新用户积分
async updateUserScore(userId: string, score: number) {
  await this.redisService.zadd('leaderboard', score, userId);
}

// 获取排行榜前 N 名
async getTopUsers(limit: number = 10) {
  return await this.redisService.zrange('leaderboard', 0, limit - 1);
}
```

### 8. 批量删除缓存

```typescript
// 清除用户相关的所有缓存
async clearUserCache(userId: number) {
  const pattern = `user:${userId}:*`;
  const keys = await this.redisService.keys(pattern);

  if (keys.length > 0) {
    await this.redisService.del(keys);
    console.log(`已清除 ${keys.length} 个缓存`);
  }
}
```

## RedisService API 参考

### 基础操作

| 方法 | 参数 | 返回值 | 说明 |
|------|------|--------|------|
| `get<T>(key)` | key: string | Promise<T \| null> | 获取缓存值 |
| `set(key, value, ttl?)` | key: string, value: any, ttl?: number | Promise<void> | 设置缓存 |
| `del(key)` | key: string \| string[] | Promise<number> | 删除缓存 |
| `exists(key)` | key: string | Promise<boolean> | 检查键是否存在 |
| `expire(key, seconds)` | key: string, seconds: number | Promise<boolean> | 设置过期时间 |
| `ttl(key)` | key: string | Promise<number> | 获取剩余过期时间 |
| `keys(pattern)` | pattern: string | Promise<string[]> | 查找匹配的键 |

### 高级方法

| 方法 | 参数 | 返回值 | 说明 |
|------|------|--------|------|
| `getOrSet<T>(key, factory, ttl?)` | key, factory, ttl? | Promise<T> | 缓存未命中时自动调用工厂函数 |
| `remember<T>(key, ttl, callback)` | key, ttl, callback | Promise<T> | 语义化的 getOrSet |
| `incr(key)` | key: string | Promise<number> | 自增计数器 |
| `decr(key)` | key: string | Promise<number> | 自减计数器 |

### Hash 操作

| 方法 | 参数 | 说明 |
|------|------|------|
| `hset(key, field, value)` | - | 设置 Hash 字段 |
| `hget(key, field)` | - | 获取 Hash 字段 |
| `hgetall(key)` | - | 获取所有字段 |
| `hdel(key, ...fields)` | - | 删除 Hash 字段 |

### Set 操作

| 方法 | 参数 | 说明 |
|------|------|------|
| `sadd(key, ...members)` | - | 添加集合成员 |
| `smembers(key)` | - | 获取所有成员 |
| `srem(key, ...members)` | - | 删除集合成员 |

### Sorted Set 操作

| 方法 | 参数 | 说明 |
|------|------|------|
| `zadd(key, score, member)` | - | 添加有序集合成员 |
| `zrange(key, start, stop)` | - | 获取指定范围成员 |
| `zrem(key, ...members)` | - | 删除有序集合成员 |

## 测试示例

项目内置了完整的测试接口，启动项目后访问：

```bash
# 测试 Redis 连接
GET http://localhost:3000/api/v1/cache-example/test

# 测试带装饰器的缓存（首次慢，后续快）
GET http://localhost:3000/api/v1/cache-example/user/123

# 测试手动缓存逻辑
GET http://localhost:3000/api/v1/cache-example/product/456

# 增加文章浏览量
GET http://localhost:3000/api/v1/cache-example/stats/views/1001

# 清除缓存（支持通配符）
GET http://localhost:3000/api/v1/cache-example/cache/clear/user:*
```

## 最佳实践

### 1. 缓存命名规范

```typescript
// 推荐格式：资源类型:资源ID[:子资源]
const userKey = `user:${userId}`;
const userProfileKey = `user:${userId}:profile`;
const articleViewsKey = `article:${articleId}:views`;
```

### 2. 合理设置过期时间

```typescript
// 热点数据：较短的过期时间
await this.redisService.set('hot:product', data, 60);  // 1 分钟

// 用户信息：中等过期时间
await this.redisService.set('user:info', data, 1800);  // 30 分钟

// 静态配置：较长过期时间
await this.redisService.set('config:system', data, 3600);  // 1 小时
```

### 3. 缓存更新策略

**主动更新（推荐）：**

```typescript
async updateUser(id: number, data: UpdateUserDto) {
  // 更新数据库
  const user = await this.userRepository.update(id, data);

  // 主动更新缓存
  await this.redisService.set(`user:${id}`, user, 600);

  return user;
}
```

**被动失效：**

```typescript
async updateUser(id: number, data: UpdateUserDto) {
  // 更新数据库
  const user = await this.userRepository.update(id, data);

  // 删除旧缓存，等待下次查询时重建
  await this.redisService.del(`user:${id}`);

  return user;
}
```

### 4. 防止缓存穿透

```typescript
async getUser(id: number) {
  return await this.redisService.getOrSet(
    `user:${id}`,
    async () => {
      const user = await this.userRepository.findOne({ where: { id } });

      // 即使为 null 也缓存，防止频繁查询数据库
      return user || { id, notFound: true };
    },
    300,
  );
}
```

## 故障排查

### 1. 连接失败

检查 Redis 是否启动：

```bash
# macOS/Linux
redis-cli ping

# 如果返回 PONG 表示正常

# 查看 Redis 日志
tail -f /var/log/redis/redis-server.log
```

### 2. 密码验证失败

确保配置文件中的密码正确：

```yaml
redis:
  password: 'your-redis-password'
```

### 3. 缓存未生效

检查 TTL 是否设置正确：

```typescript
// 查看某个键的剩余时间
const ttl = await this.redisService.ttl('your-key');
console.log('剩余时间（秒）:', ttl);
// -1: 永不过期
// -2: 键不存在
```

## 注意事项

1. **生产环境务必设置密码**，修改 `config.production.yml`
2. **不要缓存敏感信息**（如密码、Token），或使用更短的过期时间
3. **避免使用 `keys` 命令**在生产环境中查找大量键，会阻塞 Redis
4. **合理设置 keyPrefix**，避免不同环境的缓存冲突
5. **定期监控 Redis 内存使用**，防止 OOM

## 相关文件

```
src/redis/
├── redis.module.ts                    # Redis 模块
├── redis.service.ts                   # Redis 服务（核心）
├── decorators/
│   └── cacheable.decorator.ts         # 缓存装饰器
├── interceptors/
│   └── cache.interceptor.ts           # 缓存拦截器
└── examples/
    ├── cache-example.module.ts        # 示例模块
    ├── cache-example.controller.ts    # 示例接口
    └── cache-example.service.ts       # 示例服务
```

## 更多参考

- [ioredis 官方文档](https://github.com/redis/ioredis)
- [Redis 命令参考](https://redis.io/commands/)
- [NestJS 缓存最佳实践](https://docs.nestjs.com/techniques/caching)

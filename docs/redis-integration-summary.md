# Redis 集成说明

## ✅ 已完成

Redis 缓存系统已成功集成到项目中，所有功能已经可以使用。

## 📁 新增文件

```
src/redis/
├── redis.module.ts                    # Redis 模块（@Global）
├── redis.service.ts                   # Redis 服务（核心 API）
├── index.ts                           # 导出文件
├── decorators/
│   └── cacheable.decorator.ts         # @Cacheable 装饰器
├── interceptors/
│   └── cache.interceptor.ts           # 缓存拦截器
└── examples/
    ├── cache-example.module.ts        # 示例模块
    ├── cache-example.controller.ts    # 测试接口
    └── cache-example.service.ts       # 示例代码

src/config/configs/
└── redis.config.ts                    # Redis 配置

docs/
└── redis-cache.md                     # 完整使用文档
```

## 🔧 配置

已在 `config.example.yml` 和 `config.development.yml` 中添加 Redis 配置：

```yaml
redis:
  host: localhost
  port: 6379
  password: ''
  db: 0
  keyPrefix: 'nest:dev:'
  ttl: 3600
```

## 🚀 使用方式

### 1. 基础使用

```typescript
import { Injectable } from '@nestjs/common';
import { RedisService } from '@/redis';

@Injectable()
export class YourService {
  constructor(private readonly redisService: RedisService) {}

  async example() {
    // 设置缓存
    await this.redisService.set('key', { data: 'value' }, 300);

    // 获取缓存
    const data = await this.redisService.get('key');

    // 删除缓存
    await this.redisService.del('key');
  }
}
```

### 2. 自动缓存（推荐）

```typescript
async getUserById(id: number) {
  return await this.redisService.getOrSet(
    `user:${id}`,
    async () => {
      // 缓存未命中时执行
      return await this.userRepository.findOne({ where: { id } });
    },
    600, // 缓存 10 分钟
  );
}
```

### 3. 装饰器方式

```typescript
import { Controller, Get, UseInterceptors } from '@nestjs/common';
import { Cacheable, CacheInterceptor } from '@/redis';

@Controller('users')
export class UserController {
  @Get(':id')
  @UseInterceptors(CacheInterceptor)
  @Cacheable({ key: 'user::id', ttl: 300 })
  async getUser(@Param('id') id: string) {
    // 自动缓存返回值
    return { id, name: `用户${id}` };
  }
}
```

## 🧪 测试接口

启动项目后，可以访问以下测试接口：

```bash
# 1. 测试 Redis 连接
GET http://localhost:3000/api/v1/cache-example/test

# 2. 测试装饰器缓存（首次慢，后续快）
GET http://localhost:3000/api/v1/cache-example/user/123

# 3. 测试手动缓存
GET http://localhost:3000/api/v1/cache-example/product/456

# 4. 增加浏览量计数
GET http://localhost:3000/api/v1/cache-example/stats/views/1001

# 5. 清除缓存（支持通配符）
GET http://localhost:3000/api/v1/cache-example/cache/clear/user:*
```

## 📚 完整文档

详细使用说明、API 参考、最佳实践，请查看：[docs/redis-cache.md](./redis-cache.md)

## ⚠️ 注意事项

1. **启动前确保 Redis 已运行**：
   ```bash
   # macOS/Linux
   redis-server

   # 或使用 Docker
   docker run -d -p 6379:6379 redis:latest
   ```

2. **生产环境配置**：
   - 务必在 `config.production.yml` 中设置 Redis 密码
   - 修改 `keyPrefix` 避免不同环境冲突
   - 根据实际情况调整 `ttl` 过期时间

3. **已集成到应用**：
   - `RedisModule` 已注册为全局模块
   - 可在任意 Service/Controller 中直接注入 `RedisService`
   - 无需额外配置即可使用

## 🎯 核心特性

- ✅ 多种缓存方式（注入、装饰器、拦截器）
- ✅ 支持自定义 TTL
- ✅ 支持 String、Hash、Set、Sorted Set 等数据结构
- ✅ 计数器、排行榜、标签系统等场景
- ✅ 批量操作、模式匹配
- ✅ 连接池、自动重连
- ✅ 日志监控

开始使用吧！ 🚀

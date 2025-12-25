# Request Tracking Guide

## 概述

本项目使用 `nestjs-cls` + `winston` 实现请求追踪和日志记录的最佳实践。

## 核心特性

- ✅ **自动请求 ID 生成** - 每个请求自动分配唯一 ID
- ✅ **跨服务自动传播** - 无需手动传递，自动在整个异步调用链中可用
- ✅ **性能优化** - 使用单例 + CLS，避免 REQUEST-scoped providers 的性能问题
- ✅ **结构化日志** - JSON 格式，包含 context、requestId、timestamp 等
- ✅ **请求上下文存储** - 自动存储 IP、User Agent 等信息

## 架构说明

### 1. ClsModule 配置 (AppModule)

```typescript
ClsModule.forRoot({
  global: true,
  middleware: {
    mount: true,
    generateId: true,
    idGenerator: (req) => {
      // 优先使用客户端传递的 x-request-id
      return req.headers['x-request-id'] ||
             `${Date.now()}-${Math.random().toString(36).substring(2, 15)}`;
    },
    setup: (cls, req) => {
      // 自动存储请求上下文信息
      cls.set('ip', req.ip || req.connection.remoteAddress);
      cls.set('userAgent', req.headers['user-agent']);
    },
  },
})
```

### 2. WinstonLoggerService

- 单例模式（性能优化）
- 集成 ClsService 自动注入 Request ID
- 提供统一的日志接口

### 3. Winston Config

- 控制台输出包含 Request ID 前缀：`[requestId] message`
- 文件日志 JSON 格式包含完整元数据

## 使用方式

### 基本使用

```typescript
@Injectable()
export class UserService {
  private readonly context = UserService.name;

  constructor(private readonly logger: WinstonLoggerService) {}

  async createUser(data: CreateUserDto) {
    // 日志自动包含 requestId 和 context
    this.logger.log('Creating user', this.context, {
      email: data.email
    });

    try {
      const user = await this.userRepository.save(data);

      this.logger.log('User created successfully', this.context, {
        userId: user.id,
      });

      return user;
    } catch (error) {
      this.logger.error('Failed to create user', this.context, {
        error: error.message,
        data,
      });
      throw error;
    }
  }
}
```

### 获取 Request ID

```typescript
const requestId = this.logger.getRequestId();
console.log('Current request ID:', requestId);
```

### 获取请求上下文

```typescript
const ip = this.logger.getRequestContext('ip');
const userAgent = this.logger.getRequestContext('userAgent');

this.logger.log('User action', this.context, {
  ip,
  userAgent,
  action: 'download',
});
```

### 自定义上下文数据

在 AppModule 的 ClsModule 配置中添加：

```typescript
setup: (cls, req) => {
  cls.set('userId', req.user?.id);
  cls.set('tenantId', req.headers['x-tenant-id']);
  cls.set('ip', req.ip);
}
```

在 Service 中读取：

```typescript
const userId = this.logger.getRequestContext('userId');
const tenantId = this.logger.getRequestContext('tenantId');
```

## 日志输出格式

### 控制台输出

```
[2025-12-25 10:30:45.123] [NestApp] INFO [AutoContextDemoService] [1735095045123-abc123def456] Processing user - {"userId":123}
```

### 文件输出 (combined.log)

```json
{
  "level": "info",
  "message": "Processing user",
  "context": "AutoContextDemoService",
  "requestId": "1735095045123-abc123def456",
  "userId": 123,
  "timestamp": "2025-12-25 10:30:45"
}
```

## 跨服务传播

### HTTP 调用

客户端发送请求时传递 `x-request-id` header：

```typescript
const response = await axios.get('/api/users', {
  headers: {
    'x-request-id': requestId, // 传递给下游服务
  },
});
```

### 内部服务调用

在同一请求生命周期内，所有服务自动共享同一个 Request ID：

```typescript
@Injectable()
export class OrderService {
  constructor(
    private readonly userService: UserService,
    private readonly logger: WinstonLoggerService,
  ) {}

  async createOrder(data: CreateOrderDto) {
    // 这里的 requestId 和 userService 中的相同
    this.logger.log('Creating order', 'OrderService', data);

    // 调用其他服务，requestId 自动传播
    const user = await this.userService.findById(data.userId);
  }
}
```

## 最佳实践

### 1. Context 命名

```typescript
private readonly context = UserService.name; // ✅ 推荐
private readonly context = 'UserService';    // ❌ 不推荐（硬编码）
```

### 2. 结构化日志

```typescript
// ✅ 推荐 - 使用结构化数据
this.logger.log('User login', this.context, {
  userId: user.id,
  ip: user.ip,
  timestamp: new Date(),
});

// ❌ 不推荐 - 字符串拼接
this.logger.log(`User ${user.id} logged in from ${user.ip}`, this.context);
```

### 3. 错误日志

```typescript
try {
  // ...
} catch (error) {
  this.logger.error('Operation failed', this.context, {
    errorMessage: error.message,
    errorStack: error.stack,
    operationData: data, // 包含上下文信息
  });
  throw error;
}
```

### 4. 敏感信息过滤

```typescript
// ❌ 不要记录敏感信息
this.logger.log('User login', this.context, {
  password: user.password, // 危险！
  token: user.token,
});

// ✅ 过滤敏感字段
const { password, token, ...safeData } = user;
this.logger.log('User login', this.context, safeData);
```

## 性能对比

| 方案 | Scope | 性能 | 内存 | Request ID |
|-----|-------|------|------|-----------|
| 旧方案 | TRANSIENT | ❌ 每次创建实例 | ❌ 高 | ❌ 无 |
| 新方案 | Singleton + CLS | ✅ 单例 | ✅ 低 | ✅ 自动 |

## 常见问题

### Q: Request ID 在非 HTTP 上下文中可用吗？

A: 默认只在 HTTP 请求中可用。对于 CRON、Queue、WebSocket 等场景，需要手动设置：

```typescript
import { ClsService } from 'nestjs-cls';

@Injectable()
export class CronService {
  constructor(
    private readonly cls: ClsService,
    private readonly logger: WinstonLoggerService,
  ) {}

  @Cron('0 0 * * *')
  async handleCron() {
    // 手动创建 CLS 上下文
    await this.cls.run(async () => {
      this.cls.setId(`cron-${Date.now()}`);
      this.logger.log('Cron job started', 'CronService');
    });
  }
}
```

### Q: 如何在日志中添加用户信息？

A: 在 AppModule 的 ClsModule setup 中添加：

```typescript
setup: (cls, req) => {
  if (req.user) {
    cls.set('userId', req.user.id);
    cls.set('username', req.user.username);
  }
}
```

## 参考资料

- [NestJS Async Local Storage 文档](https://docs.nestjs.com/recipes/async-local-storage)
- [nestjs-cls GitHub](https://github.com/papooch/nestjs-cls)
- [Winston 文档](https://github.com/winstonjs/winston)

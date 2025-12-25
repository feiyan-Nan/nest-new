# Winston 日志库使用指南

本项目已成功集成 Winston 日志库，提供强大的日志记录功能。

## 已安装的依赖

```json
{
  "winston": "^3.19.0",
  "nest-winston": "^1.10.2"
}
```

## 项目结构

```
src/
├── logger/
│   ├── winston.config.ts         # Winston 配置
│   ├── logger.module.ts           # Logger 模块
│   ├── logger-demo.service.ts     # 使用示例 Service
│   ├── logger-demo.controller.ts  # 使用示例 Controller
│   ├── logger-demo.module.ts      # Demo 模块
│   └── index.ts                   # 导出
└── main.ts                         # 应用入口（已集成 Winston）
```

## 配置说明

### 日志级别
- **开发环境**: `debug` 级别
- **生产环境**: `info` 级别

### 日志输出位置

1. **控制台输出** - 所有级别的日志，带颜色和格式化
2. **combined.log** - info 及以上级别的日志（JSON 格式）
3. **error.log** - 仅 error 级别的日志（JSON 格式，包含堆栈）
4. **exceptions.log** - 未捕获的异常
5. **rejections.log** - 未处理的 Promise 拒绝

所有日志文件保存在项目根目录的 `logs/` 文件夹中。

## 使用方法

### 方式一：在 Controller 中使用（推荐）

```typescript
import { Controller, Get, Inject } from '@nestjs/common';
import type { LoggerService } from '@nestjs/common';
import { WINSTON_MODULE_NEST_PROVIDER } from 'nest-winston';

@Controller('users')
export class UsersController {
  constructor(
    @Inject(WINSTON_MODULE_NEST_PROVIDER)
    private readonly logger: LoggerService,
  ) {}

  @Get()
  findAll() {
    this.logger.log('Finding all users', 'UsersController');
    this.logger.warn('Warning message', 'UsersController');
    this.logger.error('Error message', '', 'UsersController');
    return { message: 'Success' };
  }
}
```

### 方式二：在 Service 中使用 Winston Logger

```typescript
import { Injectable, Inject } from '@nestjs/common';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';
import { Logger } from 'winston';

@Injectable()
export class UsersService {
  constructor(
    @Inject(WINSTON_MODULE_PROVIDER)
    private readonly logger: Logger,
  ) {}

  createUser(userData: any) {
    // 基础日志
    this.logger.info('Creating user', {
      context: 'UsersService',
      userId: 123,
    });

    // 结构化日志
    this.logger.info('User created successfully', {
      context: 'UsersService',
      userId: 123,
      userName: userData.name,
      timestamp: new Date().toISOString(),
    });

    // 错误日志
    try {
      // 业务逻辑
    } catch (error) {
      this.logger.error('Failed to create user', {
        context: 'UsersService',
        error: error.message,
        stack: error.stack,
      });
    }
  }
}
```

### 方式三：使用 Child Logger（推荐用于追踪请求）

```typescript
import { Injectable, Inject } from '@nestjs/common';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';
import { Logger } from 'winston';

@Injectable()
export class OrderService {
  constructor(
    @Inject(WINSTON_MODULE_PROVIDER)
    private readonly logger: Logger,
  ) {}

  processOrder(orderId: string, userId: string) {
    // 创建带有上下文的子日志器
    const orderLogger = this.logger.child({
      orderId,
      userId,
      context: 'OrderService',
    });

    // 所有后续日志都会自动包含 orderId 和 userId
    orderLogger.info('Processing order');
    orderLogger.info('Payment validated');
    orderLogger.info('Order completed');
  }
}
```

## 测试日志功能

项目中包含了 Logger Demo 端点，用于测试各种日志功能：

```bash
# 启动服务
pnpm start:dev

# 测试各种日志级别
curl http://localhost:3000/logger-demo/levels

# 测试结构化日志
curl http://localhost:3000/logger-demo/structured

# 测试错误日志
curl http://localhost:3000/logger-demo/error

# 测试 Child Logger
curl http://localhost:3000/logger-demo/child

# 快速测试
curl http://localhost:3000/logger-demo/test
```

## 日志输出示例

### 控制台输出（开发环境）
```
[Nest] 12345  - 2025-12-25 14:30:00  LOG [UsersController] Finding all users +2ms
[Nest] 12345  - 2025-12-25 14:30:00  WARN [UsersController] Warning message +1ms
[Nest] 12345  - 2025-12-25 14:30:00  ERROR [UsersController] Error message +0ms
```

### JSON 日志（生产环境 - combined.log）
```json
{
  "level": "info",
  "timestamp": "2025-12-25 14:30:00",
  "context": "UsersService",
  "message": "User created successfully",
  "userId": 123,
  "userName": "John Doe"
}
```

## 最佳实践

### 1. 使用结构化日志
```typescript
// ✅ 好的做法
this.logger.info('Order processed', {
  context: 'OrderService',
  orderId: '12345',
  userId: 1001,
  amount: 99.99,
});

// ❌ 不推荐
this.logger.info(`Order 12345 processed for user 1001 with amount 99.99`);
```

### 2. 错误日志包含堆栈信息
```typescript
try {
  // 业务逻辑
} catch (error) {
  this.logger.error('Operation failed', {
    context: 'ServiceName',
    error: error.message,
    stack: error.stack,
    additionalContext: { userId, orderId },
  });
}
```

### 3. 使用 Child Logger 追踪请求
```typescript
const requestLogger = this.logger.child({
  requestId: req.id,
  userId: req.user.id,
});

// 该请求的所有日志都会包含 requestId 和 userId
requestLogger.info('Request started');
requestLogger.info('Processing data');
requestLogger.info('Request completed');
```

### 4. 合理使用日志级别
- **debug**: 详细的调试信息（仅开发环境）
- **info**: 常规信息（如用户操作、系统事件）
- **warn**: 警告信息（不影响功能但需要注意）
- **error**: 错误信息（需要立即处理）

## 配置自定义

如需修改 Winston 配置，请编辑 `src/logger/winston.config.ts`:

```typescript
export const winstonConfig: WinstonModuleOptions = {
  transports: [
    // 添加或修改 transports
    new winston.transports.Console({ /* 配置 */ }),
    new winston.transports.File({ /* 配置 */ }),
    // 可以添加更多 transports（如发送到远程日志服务器）
  ],
};
```

## 常见问题

### Q: 如何更改日志级别？
A: 修改 `winston.config.ts` 中的 `level` 配置，或通过环境变量控制。

### Q: 如何发送日志到远程服务器？
A: 在 `winston.config.ts` 中添加相应的 transport（如 HTTP transport）。

### Q: 日志文件在哪里？
A: 所有日志文件保存在项目根目录的 `logs/` 文件夹中。

### Q: 如何禁用控制台日志？
A: 在 `winston.config.ts` 的 transports 数组中移除或注释掉 Console transport。

## 相关文件

- [winston.config.ts](/Users/mac/work/nest-new/src/logger/winston.config.ts) - Winston 配置
- [logger.module.ts](/Users/mac/work/nest-new/src/logger/logger.module.ts) - Logger 模块定义
- [main.ts](/Users/mac/work/nest-new/src/main.ts) - 应用入口集成
- [logger-demo.controller.ts](/Users/mac/work/nest-new/src/logger/logger-demo.controller.ts) - 使用示例

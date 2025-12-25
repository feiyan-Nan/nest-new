# Winston Logger 自动 Context 功能使用指南

## 🎯 问题解决

### 之前的问题
每次记录日志都需要手动传递 `context` 参数：

```typescript
// ❌ 繁琐的方式
this.logger.info('User created', {
  context: 'UserService',  // 每次都要写
  userId: 123,
});

this.logger.error('Failed to create user', {
  context: 'UserService',  // 重复写 context
  error: 'Database error',
});
```

### 现在的解决方案
使用 `WinstonLoggerService`，在构造函数中**一次性设置** context，之后所有日志自动包含类名！

```typescript
// ✅ 优雅的方式
constructor(private readonly logger: WinstonLoggerService) {
  this.logger.setContext(UserService.name);  // 只需设置一次
}

// 之后所有日志自动包含 context: 'UserService'
this.logger.log('User created', { userId: 123 });
this.logger.error('Failed to create user', { error: 'Database error' });
```

---

## 📦 实现原理

### 1. WinstonLoggerService

创建了一个 **TRANSIENT** 作用域的服务，每个注入点都会获得独立实例：

```typescript
@Injectable({ scope: Scope.TRANSIENT })
export class WinstonLoggerService {
  private contextLogger: Logger;
  private context: string = 'Application';

  setContext(context: string) {
    this.context = context;
    this.contextLogger = this.logger.child({ context });
  }
}
```

**关键点**：
- `Scope.TRANSIENT` 确保每个 Service/Controller 都有独立的 logger 实例
- `setContext()` 创建一个 child logger，自动为所有日志添加 context
- 使用 `ClassName.name` 自动获取类名

---

## 🚀 使用方法

### 在 Service 中使用

```typescript
import { Injectable } from '@nestjs/common';
import { WinstonLoggerService } from '@/logger';

@Injectable()
export class UserService {
  constructor(private readonly logger: WinstonLoggerService) {
    // 在构造函数中设置 context（只需一次）
    this.logger.setContext(UserService.name);
  }

  async createUser(userData: any) {
    // 所有日志自动包含 context: 'UserService'
    this.logger.log('Creating user', { userData });

    try {
      // 业务逻辑...
      this.logger.debug('Validating user data', { userData });

      this.logger.log('User created successfully', {
        userId: 123,
        username: userData.username,
      });
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';

      this.logger.error('Failed to create user', {
        error: errorMessage,
        userData,
      });

      throw error;
    }
  }

  async findUser(userId: number) {
    this.logger.log('Finding user', { userId });

    // 所有方法的日志都会自动带上 'UserService' context
    this.logger.debug('Querying database', { userId });

    return { id: userId, name: 'John Doe' };
  }
}
```

### 在 Controller 中使用

```typescript
import { Controller, Get, Post, Body } from '@nestjs/common';
import { WinstonLoggerService } from '@/logger';
import { UserService } from './user.service';

@Controller('users')
export class UserController {
  constructor(
    private readonly logger: WinstonLoggerService,
    private readonly userService: UserService,
  ) {
    // 设置 Controller 的 context
    this.logger.setContext(UserController.name);
  }

  @Get()
  findAll() {
    // 自动包含 context: 'UserController'
    this.logger.log('Finding all users');

    return this.userService.findAll();
  }

  @Post()
  create(@Body() userData: any) {
    this.logger.log('Creating new user', { username: userData.username });

    return this.userService.createUser(userData);
  }

  @Get(':id')
  findOne(id: string) {
    this.logger.log('Finding user by ID', { userId: id });

    return this.userService.findUser(Number(id));
  }
}
```

---

## 📊 日志输出示例

### 控制台输出（开发环境）

```bash
[NestApp] 7603 2025-12-25 15:43:31   LOG [AutoContextDemoController] Testing auto context in controller
[NestApp] 7603 2025-12-25 15:43:31  WARN [AutoContextDemoController] This is a warning message
[NestApp] 7603 2025-12-25 15:43:42   LOG [AutoContextDemoService] This log automatically includes context
[NestApp] 7603 2025-12-25 15:43:42  WARN [AutoContextDemoService] Warning with auto context
[NestApp] 7603 2025-12-25 15:43:42 ERROR [AutoContextDemoService] Error with auto context
```

### JSON 日志文件（combined.log）

```json
{
  "context": "AutoContextDemoController",
  "level": "info",
  "message": "Testing auto context in controller",
  "timestamp": "2025-12-25 15:43:31"
}
{
  "context": "AutoContextDemoService",
  "level": "info",
  "message": "This log automatically includes context",
  "timestamp": "2025-12-25 15:43:42"
}
{
  "context": "AutoContextDemoService",
  "level": "info",
  "message": "Processing user",
  "timestamp": "2025-12-25 15:43:43",
  "userId": 1001
}
```

**注意**：所有日志都自动包含了 `context` 字段！

---

## 🎨 API 方法

`WinstonLoggerService` 提供的所有日志方法：

| 方法 | 级别 | 说明 |
|------|------|------|
| `log(message, meta?)` | info | 常规信息 |
| `error(message, meta?)` | error | 错误信息 |
| `warn(message, meta?)` | warn | 警告信息 |
| `debug(message, meta?)` | debug | 调试信息 |
| `verbose(message, meta?)` | verbose | 详细信息 |
| `http(message, meta?)` | http | HTTP 请求 |
| `silly(message, meta?)` | silly | 极详细信息 |

**使用示例**：

```typescript
// 所有方法自动包含 context
this.logger.log('Info message', { userId: 123 });
this.logger.error('Error message', { error: 'Something failed' });
this.logger.warn('Warning message', { type: 'deprecation' });
this.logger.debug('Debug message', { variable: 'value' });
this.logger.verbose('Verbose message', { step: 1, total: 10 });
this.logger.http('HTTP request', { method: 'GET', url: '/api/users' });
```

---

## 🔄 与旧方式对比

### 旧方式（需要手动传 context）

```typescript
import { Inject } from '@nestjs/common';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';
import { Logger } from 'winston';

@Injectable()
export class UserService {
  constructor(
    @Inject(WINSTON_MODULE_PROVIDER)
    private readonly logger: Logger,
  ) {}

  createUser(userData: any) {
    // ❌ 每次都要写 context
    this.logger.info('Creating user', {
      context: 'UserService',
      userData,
    });

    this.logger.error('Failed', {
      context: 'UserService',  // 重复、繁琐
      error: 'Error',
    });
  }
}
```

### 新方式（自动 context）

```typescript
import { Injectable } from '@nestjs/common';
import { WinstonLoggerService } from '@/logger';

@Injectable()
export class UserService {
  constructor(private readonly logger: WinstonLoggerService) {
    // ✅ 只需设置一次
    this.logger.setContext(UserService.name);
  }

  createUser(userData: any) {
    // ✅ 自动包含 context: 'UserService'
    this.logger.log('Creating user', { userData });

    this.logger.error('Failed', { error: 'Error' });
  }
}
```

**对比结果**：
- ✅ 代码更简洁
- ✅ 减少重复代码
- ✅ 不容易遗漏 context
- ✅ 更易维护

---

## 📝 完整示例

查看项目中的示例文件：

1. **[winston-logger.service.ts](/Users/mac/work/nest-new/src/logger/winston-logger.service.ts)** - Logger 服务实现
2. **[auto-context-demo.service.ts](/Users/mac/work/nest-new/src/logger/auto-context-demo.service.ts)** - Service 使用示例
3. **[auto-context-demo.controller.ts](/Users/mac/work/nest-new/src/logger/auto-context-demo.controller.ts)** - Controller 使用示例

---

## 🧪 测试端点

启动应用后，访问以下端点查看效果：

```bash
# 启动应用
pnpm start:dev

# 测试 Controller 自动 context
curl http://localhost:8080/auto-context-demo/test

# 测试 Service 自动 context
curl http://localhost:8080/auto-context-demo/service

# 测试用户处理（多个日志）
curl http://localhost:8080/auto-context-demo/user/1001
```

查看日志：

```bash
# 查看实时控制台输出
# 控制台会显示带颜色的日志

# 查看 JSON 日志文件
tail -f logs/combined.log

# 搜索特定 context 的日志
cat logs/combined.log | grep "AutoContextDemoService"
```

---

## 💡 最佳实践

### 1. 始终在构造函数中设置 context

```typescript
constructor(private readonly logger: WinstonLoggerService) {
  this.logger.setContext(YourClassName.name);
}
```

### 2. 使用 TypeScript 的 `ClassName.name`

```typescript
// ✅ 推荐：使用 .name 自动获取类名
this.logger.setContext(UserService.name);

// ❌ 不推荐：硬编码字符串（容易出错）
this.logger.setContext('UserService');
```

### 3. 传递结构化数据

```typescript
// ✅ 推荐：传递对象
this.logger.log('User created', {
  userId: 123,
  username: 'john',
  email: 'john@example.com',
});

// ❌ 不推荐：字符串拼接
this.logger.log(`User ${userId} created with name ${username}`);
```

### 4. 错误处理时记录详细信息

```typescript
try {
  // 业务逻辑
} catch (error) {
  const errorMessage =
    error instanceof Error ? error.message : 'Unknown error';
  const errorStack = error instanceof Error ? error.stack : undefined;

  this.logger.error('Operation failed', {
    error: errorMessage,
    stack: errorStack,
    userId,
    operation: 'createUser',
  });

  throw error;
}
```

---

## 🎯 总结

### 优势

1. **更简洁**：不需要每次都写 `context`
2. **更安全**：使用 `ClassName.name` 不会出现拼写错误
3. **更一致**：所有日志自动包含统一的 context
4. **易维护**：如果类名改变，自动更新 context

### 使用步骤

1. 注入 `WinstonLoggerService`
2. 在构造函数中调用 `setContext(ClassName.name)`
3. 使用 logger 方法记录日志（自动包含 context）

### 关键文件

- [winston-logger.service.ts](/Users/mac/work/nest-new/src/logger/winston-logger.service.ts) - 核心服务
- [logger.module.ts](/Users/mac/work/nest-new/src/logger/logger.module.ts) - 模块配置
- [auto-context-demo.service.ts](/Users/mac/work/nest-new/src/logger/auto-context-demo.service.ts) - 使用示例

享受更优雅的日志记录体验！ 🚀

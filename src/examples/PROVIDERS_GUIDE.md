# NestJS Providers 完整教程

## 📖 什么是 Providers？

Providers 是 NestJS 依赖注入系统的核心。任何带有 `@Injectable()` 装饰器的类都可以成为 provider。

## 🎯 核心概念

### 1️⃣ 依赖注入的优势

**传统方式（不推荐）：**
```typescript
class UserController {
  private userService = new UserService(); // ❌ 紧耦合
}
```

**使用依赖注入（推荐）：**
```typescript
class UserController {
  constructor(private userService: UserService) {} // ✅ 松耦合
}
```

**好处：**
- 易于测试（可以注入 mock 对象）
- 代码解耦
- 生命周期由 NestJS 管理
- 支持单例模式（默认）

## 📚 Providers 的 5 种注册方式

### 方式 1: 标准类 Provider（最常用）

```typescript
@Module({
  providers: [UserService], // 简写
})
```

等价于：
```typescript
@Module({
  providers: [
    {
      provide: UserService,
      useClass: UserService,
    },
  ],
})
```

**使用：**
```typescript
constructor(private userService: UserService) {}
```

---

### 方式 2: useClass - 自定义实现类

```typescript
@Module({
  providers: [
    {
      provide: 'CUSTOM_SERVICE',
      useClass: BasicService,
    },
  ],
})
```

**使用场景：**
- 根据环境使用不同的实现
- 提供接口的不同实现

**使用：**
```typescript
constructor(
  @Inject('CUSTOM_SERVICE')
  private service: BasicService
) {}
```

---

### 方式 3: useValue - 注入常量/配置对象

```typescript
const APP_CONSTANTS = {
  maxRetries: 3,
  timeout: 5000,
};

@Module({
  providers: [
    {
      provide: 'APP_CONFIG',
      useValue: APP_CONSTANTS,
    },
  ],
})
```

**使用场景：**
- 注入配置对象
- 注入常量
- 注入 mock 对象（测试时）

**使用：**
```typescript
constructor(
  @Inject('APP_CONFIG')
  private config: { maxRetries: number; timeout: number }
) {}
```

---

### 方式 4: useFactory - 工厂函数

```typescript
@Module({
  providers: [
    {
      provide: 'DATABASE_CONFIG',
      useFactory: () => {
        const host = process.env.DB_HOST || 'localhost';
        const port = parseInt(process.env.DB_PORT) || 5432;
        return new DatabaseConfig(host, port);
      },
    },
  ],
})
```

**使用场景：**
- 需要动态创建对象
- 需要执行异步操作
- 依赖其他 provider

**带依赖的工厂函数：**
```typescript
{
  provide: 'ASYNC_SERVICE',
  useFactory: async (configService: ConfigService) => {
    const config = await configService.getConfig();
    return new AsyncService(config);
  },
  inject: [ConfigService], // 注入依赖
}
```

---

### 方式 5: useExisting - 别名

```typescript
@Module({
  providers: [
    BasicService,
    {
      provide: 'BASIC_SERVICE_ALIAS',
      useExisting: BasicService, // 指向同一个实例
    },
  ],
})
```

**使用场景：**
- 为已有的 provider 创建别名
- 重命名 provider

---

## 💉 注入方式

### 1. 构造函数注入（推荐）

```typescript
@Injectable()
export class UserService {
  constructor(
    private readonly dbService: DatabaseService,
  ) {}
}
```

### 2. 使用 @Inject 装饰器

```typescript
constructor(
  @Inject('APP_CONFIG')
  private config: ConfigType,
) {}
```

---

## 🔄 Provider 的作用域

### DEFAULT（默认 - 单例）
```typescript
@Injectable()
export class AppService {}
```
- 整个应用共享一个实例
- 性能最好

### REQUEST（请求作用域）
```typescript
@Injectable({ scope: Scope.REQUEST })
export class RequestService {}
```
- 每个请求创建新实例
- 可以访问请求对象

### TRANSIENT（瞬态）
```typescript
@Injectable({ scope: Scope.TRANSIENT })
export class TransientService {}
```
- 每次注入都创建新实例

---

## 🌐 跨模块使用 Providers

### 导出 Provider

```typescript
@Module({
  providers: [SharedService],
  exports: [SharedService], // 导出供其他模块使用
})
export class SharedModule {}
```

### 导入模块

```typescript
@Module({
  imports: [SharedModule], // 导入后可以使用 SharedService
  providers: [UserService],
})
export class UserModule {}
```

---

## 🎓 实战示例

查看项目中的示例：

- `/providers-demo/basic` - 基础 Service 注入
- `/providers-demo/users` - Service 间的依赖注入
- `/providers-demo/config` - 使用 useValue 和 useFactory
- `/providers-demo/custom` - 使用自定义 token

---

## 📝 最佳实践

1. **优先使用构造函数注入**
2. **使用 `private readonly` 修饰符**
3. **接口作为 token 时使用字符串**
4. **避免循环依赖**
5. **单一职责原则** - 一个 Service 只做一件事
6. **合理使用作用域** - 默认使用单例模式

---

## ⚠️ 常见错误

### 1. 忘记添加 @Injectable()
```typescript
// ❌ 错误
export class UserService {}

// ✅ 正确
@Injectable()
export class UserService {}
```

### 2. 忘记在 Module 中注册
```typescript
@Module({
  providers: [UserService], // 必须注册
})
```

### 3. 循环依赖
```typescript
// ❌ 避免
// UserService 依赖 PostService
// PostService 依赖 UserService

// ✅ 解决方案：使用 forwardRef() 或重构代码
```

---

## 🔗 相关文件

- [providers-demo.service.ts](./providers-demo.service.ts)
- [providers-demo.controller.ts](./providers-demo.controller.ts)
- [providers-demo.module.ts](./providers-demo.module.ts)

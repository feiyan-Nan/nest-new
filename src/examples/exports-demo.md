# Module Exports 示例

## 示例 1: 基础用法

```typescript
// user.service.ts
@Injectable()
export class UserService {
  getUser() { return 'user data'; }
}

// user.module.ts
@Module({
  providers: [UserService],
  exports: [UserService],  // 导出，让其他模块可以使用
})
export class UserModule {}

// order.module.ts
@Module({
  imports: [UserModule],  // 导入 UserModule 后，就能使用 UserService
  controllers: [OrderController],
})
export class OrderModule {}

// order.controller.ts
@Controller('orders')
export class OrderController {
  constructor(
    private userService: UserService,  // ✅ 可以注入，因为 UserModule 导出了它
  ) {}
}
```

## 示例 2: 不导出的情况

```typescript
// log.service.ts
@Injectable()
export class LogService {
  log() { console.log('log'); }
}

// user.module.ts
@Module({
  providers: [UserService, LogService],
  exports: [UserService],  // 只导出 UserService，不导出 LogService
})
export class UserModule {}

// order.controller.ts
@Controller('orders')
export class OrderController {
  constructor(
    private userService: UserService,  // ✅ 可以使用
    private logService: LogService,    // ❌ 报错！LogService 未被导出
  ) {}
}
```

## 示例 3: 导出整个模块（转发）

```typescript
// database.module.ts
@Module({
  providers: [DatabaseService],
  exports: [DatabaseService],
})
export class DatabaseModule {}

// core.module.ts
@Module({
  imports: [DatabaseModule],
  exports: [DatabaseModule],  // 转发整个模块，让导入 CoreModule 的模块也能使用 DatabaseService
})
export class CoreModule {}

// app.module.ts
@Module({
  imports: [CoreModule],  // 导入 CoreModule，也能使用 DatabaseService
})
export class AppModule {}
```

## 示例 4: @Global() 模块

```typescript
// config.module.ts
@Global()  // 全局模块
@Module({
  providers: [AppConfigService],
  exports: [AppConfigService],  // 即使是全局模块，也要 export 才能被其他模块使用
})
export class AppConfigModule {}

// app.module.ts
@Module({
  imports: [AppConfigModule],  // 只需要导入一次
})
export class AppModule {}

// 任何模块都可以直接使用，无需导入
@Controller('users')
export class UserController {
  constructor(
    private configService: AppConfigService,  // ✅ 直接使用，因为是全局模块
  ) {}
}
```

## 总结

| 场景 | imports | providers | exports | 结果 |
|------|---------|-----------|---------|------|
| 内部使用 | - | ✅ | - | 只能在当前模块使用 |
| 对外提供 | - | ✅ | ✅ | 其他模块导入后可使用 |
| 全局服务 | ✅ | ✅ | ✅ + @Global() | 所有模块都可直接使用 |
| 转发模块 | ✅ | - | ✅ module | 转发给其他模块 |

**关键点：**
- `exports` 是模块化的关键，控制哪些服务可以被外部访问
- 没有导出的 provider 是模块的私有服务
- 即使是 `@Global()` 模块，也需要 `exports` 才能让其他模块使用

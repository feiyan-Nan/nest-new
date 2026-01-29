# 命名空间配置器使用指南

## 概述

项目中新增了 `createNamespaceConfig` 工具函数，优雅地解决了配置文件中重复前缀的问题。

## 核心函数

### `createNamespaceConfig(namespace: string)`

创建一个配置获取器，自动添加命名空间前缀。

**位置**: `src/config/yaml-loader.ts`

**参数**:
- `namespace`: 命名空间名称，如 `'api'`, `'database'`, `'app'` 等

**返回值**:
- 配置获取函数：`<T>(key: string, defaultValue?: T) => T`

## 使用示例

### 之前（重复前缀）
```typescript
import { getConfig } from '../yaml-loader';

export default registerAs('api', (): IApiConfig => ({
  prefix: getConfig<string>('api.prefix', 'api'),      // ❌ 重复 'api.'
  version: getConfig<string>('api.version', 'v1'),     // ❌ 重复 'api.'
}));
```

### 现在（使用命名空间配置器）
```typescript
import { createNamespaceConfig } from '../yaml-loader';

export default registerAs('api', (): IApiConfig => {
  const getApiConfig = createNamespaceConfig('api');

  return {
    prefix: getApiConfig<string>('prefix', 'api'),     // ✅ 无重复
    version: getApiConfig<string>('version', 'v1'),    // ✅ 无重复
  };
});
```

## 完整示例

### 数据库配置
```typescript
import { registerAs } from '@nestjs/config';
import { createNamespaceConfig } from '../yaml-loader';

export default registerAs('database', (): IDatabaseConfig => {
  const getDbConfig = createNamespaceConfig('database');

  return {
    type: getDbConfig<DatabaseType>('type', 'mysql'),
    host: getDbConfig<string>('host', 'localhost'),
    port: getDbConfig<number>('port', 3306),
    username: getDbConfig<string>('username', 'root'),
    password: getDbConfig<string>('password', ''),
    database: getDbConfig<string>('name', 'nest_db'),
    synchronize: getDbConfig<boolean>('sync', false),
    logging: getDbConfig<boolean>('logging', false),
  };
});
```

### 嵌套配置
```typescript
// YAML 配置
schedule:
  cleanup:
    enabled: true
    cron: '0 0 * * *'
    retention: 30

// TypeScript 配置
export default registerAs('schedule', (): IScheduleConfig => {
  const getScheduleConfig = createNamespaceConfig('schedule');

  return {
    enabled: getScheduleConfig<boolean>('enabled', true),
    cleanupLogs: {
      enabled: getScheduleConfig<boolean>('cleanup.enabled', true),
      cron: getScheduleConfig<string>('cleanup.cron', '0 0 * * *'),
      retentionDays: getScheduleConfig<number>('cleanup.retention', 30),
    },
    healthCheck: {
      enabled: getScheduleConfig<boolean>('health.enabled', true),
      cron: getScheduleConfig<string>('health.cron', '0 * * * *'),
    },
  };
});
```

## 优势

### 1. **消除重复**
- ❌ 之前: `getConfig<string>('api.prefix', 'api')`
- ✅ 现在: `getApiConfig<string>('prefix', 'api')`

### 2. **提高可读性**
- 代码更简洁，意图更明确
- 减少视觉噪音

### 3. **易于维护**
- 只需要在一个地方修改命名空间
- 类型安全，保持完整 TypeScript 支持

### 4. **灵活扩展**
- 任何新的配置文件都可以使用
- 支持嵌套配置

## 适用场景

- ✅ 大量配置项的模块（如数据库配置）
- ✅ 需要嵌套配置的模块（如定时任务配置）
- ❌ 少量配置项的模块（可能过于复杂）

## 最佳实践

1. **函数命名**: 使用 `get${Namespace}Config` 格式
   - `getApiConfig` - API 配置
   - `getDbConfig` - 数据库配置
   - `getAppConfig` - 应用配置

2. **一致性**: 所有配置文件都应该使用相同模式

3. **注释**: 在函数上方添加简短注释
   ```typescript
   // 创建带 'database.' 前缀的配置函数，避免重复书写前缀
   const getDbConfig = createNamespaceConfig('database');
   ```

## 工作原理

```typescript
// createNamespaceConfig 实现
export function createNamespaceConfig(namespace: string) {
  return <T>(key: string, defaultValue?: T): T =>
    getConfig<T>(`${namespace}.${key}`, defaultValue);
}

// 调用时
const getApiConfig = createNamespaceConfig('api');
getApiConfig<string>('prefix', 'api');

// 实际执行
getConfig<string>('api.prefix', 'api');
```

## 总结

这个命名空间配置器是**函数式编程**中**柯里化**和**函数组合**的经典应用，优雅地解决了配置重复问题，提升了代码质量和可维护性。

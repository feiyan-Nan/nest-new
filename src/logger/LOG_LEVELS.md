# Winston 日志级别详解

## 一、这行代码的含义

```typescript
level: process.env.NODE_ENV === 'production' ? 'info' : 'debug',
```

### 代码解析：

这是一个**环境感知的日志级别配置**：

```
如果 NODE_ENV === 'production' (生产环境)
    则 level = 'info'
否则 (开发/测试环境)
    则 level = 'debug'
```

### 为什么这样设计？

| 环境 | 日志级别 | 原因 |
|------|----------|------|
| **生产环境** | `info` | • 减少日志量，节省存储空间<br>• 提高性能，减少 I/O 操作<br>• 只记录重要信息 |
| **开发环境** | `debug` | • 输出详细调试信息<br>• 方便定位问题<br>• 了解代码执行流程 |

---

## 二、Winston 日志级别完整列表

### NPM 标准日志级别（Winston 默认）

```typescript
const levels = {
  error: 0,    // 最高优先级
  warn: 1,
  info: 2,
  http: 3,
  verbose: 4,
  debug: 5,
  silly: 6     // 最低优先级
};
```

### 详细说明：

#### 0️⃣ **error** - 错误（优先级最高）

**使用场景**：
- 系统错误、崩溃
- 数据库连接失败
- 第三方 API 调用失败
- 未捕获的异常

**示例**：
```typescript
this.logger.error('Database connection failed', {
  error: 'ECONNREFUSED',
  host: 'localhost:3306',
  attemptCount: 3,
});
```

**输出示例**：
```
[NestApp] 2025-12-25 15:00:00 ERROR Database connection failed
  error: ECONNREFUSED
  host: localhost:3306
  attemptCount: 3
```

---

#### 1️⃣ **warn** - 警告

**使用场景**：
- 即将弃用的功能
- 配置缺失但有默认值
- API 速率限制接近
- 磁盘空间不足但未满

**示例**：
```typescript
this.logger.warn('API rate limit approaching', {
  current: 950,
  limit: 1000,
  percentage: 95,
});
```

---

#### 2️⃣ **info** - 信息（推荐生产环境级别）

**使用场景**：
- 用户登录/登出
- 订单创建/支付
- 服务启动/停止
- 定时任务执行

**示例**：
```typescript
this.logger.info('User logged in successfully', {
  userId: 1001,
  username: 'john_doe',
  ip: '192.168.1.100',
  loginTime: new Date().toISOString(),
});
```

---

#### 3️⃣ **http** - HTTP 请求

**使用场景**：
- HTTP 请求日志
- API 调用记录
- 响应状态码
- 请求耗时

**示例**：
```typescript
this.logger.http('GET /api/users/1001', {
  method: 'GET',
  url: '/api/users/1001',
  status: 200,
  duration: 45,
  userAgent: 'Mozilla/5.0...',
});
```

---

#### 4️⃣ **verbose** - 详细信息

**使用场景**：
- 详细的业务流程
- 中间步骤信息
- 数据处理过程

**示例**：
```typescript
this.logger.verbose('Processing payment workflow', {
  step: 'validate_payment',
  orderId: 'ORD-12345',
  amount: 99.99,
  currency: 'USD',
});
```

---

#### 5️⃣ **debug** - 调试（推荐开发环境级别）

**使用场景**：
- 变量值
- 函数调用
- 条件判断结果
- 中间状态

**示例**：
```typescript
this.logger.debug('Checking user permissions', {
  userId: 1001,
  requiredRole: 'admin',
  userRoles: ['user', 'moderator'],
  hasPermission: false,
});
```

---

#### 6️⃣ **silly** - 极详细调试

**使用场景**：
- 循环内部信息
- 每次迭代的状态
- 算法执行细节

**示例**：
```typescript
this.logger.silly('Loop iteration', {
  iteration: 15,
  totalIterations: 100,
  currentValue: 'processing...',
  memoryUsage: process.memoryUsage().heapUsed,
});
```

---

## 三、日志级别过滤规则

### 规则：设置某个级别后，会记录该级别及更高优先级的日志

#### 示例 1：设置 level = 'info'

```typescript
level: 'info'  // 优先级 = 2
```

**会记录的级别**：
- ✅ error (0)
- ✅ warn (1)
- ✅ info (2)

**不会记录的级别**：
- ❌ http (3)
- ❌ verbose (4)
- ❌ debug (5)
- ❌ silly (6)

#### 示例 2：设置 level = 'debug'

```typescript
level: 'debug'  // 优先级 = 5
```

**会记录的级别**：
- ✅ error (0)
- ✅ warn (1)
- ✅ info (2)
- ✅ http (3)
- ✅ verbose (4)
- ✅ debug (5)

**不会记录的级别**：
- ❌ silly (6)

---

## 四、不同环境的日志输出对比

### 开发环境 (level = 'debug')

```typescript
// 所有这些日志都会输出
this.logger.error('Error message');    // ✅ 输出
this.logger.warn('Warning message');   // ✅ 输出
this.logger.info('Info message');      // ✅ 输出
this.logger.http('HTTP message');      // ✅ 输出
this.logger.verbose('Verbose message');// ✅ 输出
this.logger.debug('Debug message');    // ✅ 输出
this.logger.silly('Silly message');    // ❌ 不输出
```

### 生产环境 (level = 'info')

```typescript
// 只有重要日志会输出
this.logger.error('Error message');    // ✅ 输出
this.logger.warn('Warning message');   // ✅ 输出
this.logger.info('Info message');      // ✅ 输出
this.logger.http('HTTP message');      // ❌ 不输出
this.logger.verbose('Verbose message');// ❌ 不输出
this.logger.debug('Debug message');    // ❌ 不输出
this.logger.silly('Silly message');    // ❌ 不输出
```

---

## 五、最佳实践建议

### 1. 根据重要性选择级别

```typescript
// ❌ 错误示例
this.logger.info('Variable x = 123');  // 过于详细，应该用 debug

// ✅ 正确示例
this.logger.debug('Variable x = 123'); // 调试信息用 debug
this.logger.info('User created successfully'); // 业务操作用 info
```

### 2. 避免在循环中使用高级别日志

```typescript
// ❌ 错误示例
for (let i = 0; i < 10000; i++) {
  this.logger.info(`Processing item ${i}`); // 会产生大量日志
}

// ✅ 正确示例
for (let i = 0; i < 10000; i++) {
  this.logger.silly(`Processing item ${i}`); // 使用最低级别
}
this.logger.info(`Processed ${10000} items`); // 只记录汇总信息
```

### 3. 生产环境建议配置

```typescript
// 控制台输出：只记录警告和错误
new winston.transports.Console({
  level: 'warn',  // 生产环境只在控制台显示 warn 和 error
}),

// 文件输出：记录完整信息
new winston.transports.File({
  filename: 'combined.log',
  level: 'info',  // 文件中记录 info 及以上
}),
```

---

## 六、RFC5424 日志级别（可选）

Winston 还支持 **Syslog 标准**的日志级别：

```typescript
{
  emerg: 0,    // 紧急：系统不可用
  alert: 1,    // 警报：必须立即采取行动
  crit: 2,     // 严重：关键状况
  error: 3,    // 错误
  warning: 4,  // 警告
  notice: 5,   // 通知：正常但重要的事件
  info: 6,     // 信息
  debug: 7     // 调试
}
```

### 使用 RFC5424 级别

```typescript
const logger = winston.createLogger({
  levels: winston.config.syslog.levels,
  transports: [
    new winston.transports.Console({ level: 'info' })
  ]
});

logger.emerg('System is unusable');
logger.alert('Action must be taken immediately');
logger.crit('Critical conditions');
```

---

## 七、自定义日志级别

你也可以定义自己的日志级别：

```typescript
const customLevels = {
  levels: {
    critical: 0,
    error: 1,
    warning: 2,
    success: 3,
    info: 4,
    debug: 5,
  },
  colors: {
    critical: 'red',
    error: 'red',
    warning: 'yellow',
    success: 'green',
    info: 'blue',
    debug: 'gray',
  }
};

const logger = winston.createLogger({
  levels: customLevels.levels,
  transports: [
    new winston.transports.Console()
  ]
});

winston.addColors(customLevels.colors);

logger.critical('Critical error!');
logger.success('Operation successful!');
```

---

## 八、总结

| 级别 | 数字 | 使用场景 | 生产环境 | 开发环境 |
|------|------|----------|----------|----------|
| error | 0 | 系统错误 | ✅ | ✅ |
| warn | 1 | 警告信息 | ✅ | ✅ |
| info | 2 | 业务操作 | ✅ | ✅ |
| http | 3 | HTTP请求 | ❌ | ✅ |
| verbose | 4 | 详细信息 | ❌ | ✅ |
| debug | 5 | 调试信息 | ❌ | ✅ |
| silly | 6 | 极详细 | ❌ | ❌ |

**推荐配置**：
- 🏭 **生产环境**: `level: 'info'` 或 `level: 'warn'`
- 💻 **开发环境**: `level: 'debug'` 或 `level: 'verbose'`
- 🧪 **测试环境**: `level: 'debug'`

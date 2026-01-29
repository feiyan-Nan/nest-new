# CLAUDE.md

此文件为 Claude Code (claude.ai/code) 在此仓库中工作提供指导。

## 常用命令

```bash
pnpm install          # 安装依赖
pnpm build            # 构建项目
pnpm start            # 启动应用
pnpm start:dev        # 启动开发模式（热重载）
pnpm start:docker     # 使用 Docker 配置启动
pnpm start:prod       # 启动生产构建
pnpm lint             # 运行 ESLint
pnpm format           # 使用 Prettier 格式化
pnpm test             # 运行单元测试
pnpm test:watch       # 监听模式运行测试
pnpm test:cov         # 运行测试并生成覆盖率报告

# Docker Compose 命令
pnpm docker:up        # 启动所有服务（MySQL、Redis、MongoDB）
pnpm docker:down      # 停止所有服务
pnpm docker:ps        # 查看服务状态
pnpm docker:logs      # 查看服务日志
pnpm docker:restart   # 重启服务
pnpm docker:clean     # 清理所有数据（⚠️ 会删除数据）
```

## 项目架构

这是一个 NestJS 应用，目录结构如下：

```
src/
├── app.module.ts           # 根模块
├── main.ts                 # 应用入口
├── config/                 # 配置模块
│   ├── config.module.ts    # 配置模块定义
│   ├── app-config.service.ts  # 配置服务
│   └── configs/            # 各个独立配置文件
│       ├── app.config.ts        # 应用基础配置
│       ├── database.config.ts   # 数据库配置
│       ├── jwt.config.ts        # JWT 配置
│       ├── api.config.ts        # API 配置
│       ├── cors.config.ts       # CORS 配置
│       ├── compression.config.ts # 压缩配置
│       ├── schedule.config.ts   # 定时任务配置
│       ├── redis.config.ts      # Redis 配置
│       └── index.ts            # 配置导出文件
├── database/               # TypeORM 数据库层
│   ├── database.module.ts  # 全局数据库模块
│   ├── database-config.service.ts  # 数据库配置服务
│   ├── entities/           # TypeORM 实体
│   └── repositories/       # 仓储模式实现
├── mongodb/                # MongoDB 数据库层
│   ├── mongodb.module.ts   # 全局 MongoDB 模块
│   ├── mongodb-config.service.ts  # MongoDB 配置服务
│   ├── schemas/            # Mongoose Schema
│   └── log.service.ts      # 日志服务示例
├── redis/                  # Redis 缓存层
│   ├── redis.module.ts     # 全局 Redis 模块
│   ├── redis.service.ts    # Redis 服务
│   ├── decorators/         # 缓存装饰器
│   ├── interceptors/       # 缓存拦截器
│   └── examples/           # 使用示例
└── common/                 # 共享中间件
```

## 配置说明

项目采用 YAML 配置文件，支持公共配置和环境特定配置的合并机制：

### 配置文件
- **公共配置**: `config.common.yml` - 所有环境共享的配置（提交到 git）
- **示例配置**: `config.example.yml` - 配置文件模板，带完整注释（提交到 git）
- **环境配置**（不提交到 git，包含敏感信息）:
  - `config.development.yml` - 开发环境配置
  - `config.production.yml` - 生产环境配置
  - `config.test.yml` - 测试环境配置

### 配置合并机制

**配置加载优先级**（后者覆盖前者）：
1. 首先加载 `config.common.yml`（公共配置）
2. 然后加载环境特定配置并合并（如 `config.development.yml`）
3. 环境配置中的值会覆盖公共配置中的同名配置

**示例**：
```yaml
# config.common.yml（公共配置）
api:
  prefix: api
  version: v1

database:
  type: mysql
  port: 3306

# config.development.yml（开发环境配置）
database:
  host: localhost
  username: root
  password: dev123

# 最终合并结果
database:
  type: mysql          # 来自 common
  port: 3306          # 来自 common
  host: localhost     # 来自 development
  username: root      # 来自 development
  password: dev123    # 来自 development
```

### 多环境配置

**默认环境**：如果未设置 `NODE_ENV` 环境变量，系统默认使用 `development` 环境。

**环境变量**：通过 `NODE_ENV` 指定运行环境（development/production/test）

**配置文件加载顺序**:
1. 首先加载 `config.common.yml`（公共配置，如果存在）
2. 然后加载 `config.${NODE_ENV}.yml`（环境配置）并与公共配置合并
3. 如果对应的环境配置文件不存在，系统会抛出错误并提示创建

**package.json 命令已自动配置**:
- `pnpm start:dev` - 使用 `NODE_ENV=development`
- `pnpm start:prod` - 使用 `NODE_ENV=production`
- `pnpm test` - 使用 `NODE_ENV=test`

**首次使用**:
```bash
# 1. 复制示例配置创建开发环境配置
cp config.example.yml config.development.yml

# 2. 修改 config.development.yml 中的配置项（如数据库密码等）

# 3. 启动应用（会自动使用 development 环境）
pnpm start:dev
```

**生产环境部署**:
```bash
# 1. 创建生产环境配置（或通过 CI/CD 自动生成）
cp config.example.yml config.production.yml

# 2. 修改生产环境的敏感配置
vim config.production.yml

# 3. 部署时设置环境变量
NODE_ENV=production pnpm start:prod
```

### Docker Compose 环境

**快速启动**（推荐用于开发环境）:
```bash
# 1. 启动所有服务（MySQL、Redis、MongoDB）
pnpm docker:up

# 2. 启动应用（使用 Docker 配置）
pnpm start:docker
```

**Docker 环境说明**:
- 配置文件: `config.docker.yml`
- 包含服务: MySQL (3306)、Redis (6379)、MongoDB (27017)
- 详细文档: [DOCKER.md](DOCKER.md) 和 [docs/docker-compose.md](docs/docker-compose.md)

**Docker 服务管理**:
```bash
pnpm docker:up        # 启动服务
pnpm docker:down      # 停止服务
pnpm docker:ps        # 查看状态
pnpm docker:logs      # 查看日志
pnpm docker:restart   # 重启服务
pnpm docker:clean     # 清理数据（⚠️ 会删除所有数据）
```


### 配置结构（简化的 key 名称）
```yaml
app:
  env: development          # 应用环境
  port: 3000               # 端口号

database:
  type: mysql              # 数据库类型
  host: localhost          # 主机
  port: 3306              # 端口
  username: root          # 用户名
  password: ''            # 密码
  name: nest_db           # 数据库名
  sync: false             # 同步表结构
  logging: false          # SQL 日志
  pool:                   # 连接池配置
    connectionLimit: 10           # 最大连接数
    queueLimit: 0                 # 队列限制
    waitForConnections: true      # 连接池满时是否等待
    connectionTimeoutMillis: 2000 # 连接超时（毫秒）
    acquireTimeout: 30000         # 获取连接超时（毫秒）
    idleTimeoutMillis: 60000      # 空闲连接超时（毫秒）
    maxQueryExecutionTime: 60000  # 最大查询执行时间（毫秒）

jwt:
  secret: xxx             # JWT 密钥
  expires: 7d             # 过期时间

api:
  prefix: api             # API 前缀
  version: v1             # API 版本

cors:
  enabled: true           # 启用 CORS
  origin: [...]           # 允许的源
  methods: GET,POST,...   # 允许的方法
  headers: '*'            # 允许的请求头
  credentials: true       # 携带凭证
  maxAge: 3600           # 缓存时间

compression:
  enabled: false          # 启用压缩
  threshold: 1024         # 压缩阈值
  quality: 4              # 压缩质量

schedule:
  enabled: true           # 启用定时任务
  cleanup:                # 日志清理
    enabled: true
    cron: '0 0 * * *'
    retention: 30
  health:                 # 健康检查
    enabled: true
    cron: '0 * * * *'

redis:
  host: localhost         # Redis 主机
  port: 6379             # Redis 端口
  password: ''           # Redis 密码
  db: 0                  # 数据库索引
  keyPrefix: 'nest:'     # Key 前缀
  ttl: 3600              # 默认过期时间（秒）

mongodb:
  uri: mongodb://localhost:27017  # MongoDB 连接 URI
  dbName: nest_db                 # 数据库名称
  maxPoolSize: 10                 # 最大连接池大小
  minPoolSize: 2                  # 最小连接池大小
  serverSelectionTimeoutMS: 5000  # 服务器选择超时（毫秒）
  socketTimeoutMS: 45000          # Socket 超时（毫秒）
  connectTimeoutMS: 10000         # 连接超时（毫秒）
  retryWrites: true               # 重试写入
  retryReads: true                # 重试读取
```

### 配置取值规范

**重要规则**：在项目中获取配置时，必须使用 `AppConfigService`，而不是直接使用 `ConfigService`。

**推荐用法**（使用 `AppConfigService`）：
```typescript
// ✅ 正确 - 使用 AppConfigService
constructor(private configService: AppConfigService) {}

const appName = this.configService.app.name;
const port = this.configService.app.port;
const dbConfig = this.configService.database;
```

**禁止用法**（直接使用 `ConfigService`）：
```typescript
// ❌ 错误 - 直接使用 ConfigService
constructor(private configService: ConfigService) {}

const appName = this.configService.get<string>('app.name', 'NestApp');
const port = this.configService.get<number>('app.port', 3000);
```

**为什么使用 AppConfigService**：
- **类型安全**：完整的 TypeScript 类型定义和 IDE 提示
- **统一管理**：所有配置访问都通过统一的入口
- **更简洁**：使用 getter 方法访问，无需每次指定 key 和默认值
- **易于维护**：配置结构变更时只需修改 `AppConfigService`

**在模块中使用配置**（如 `forRootAsync`）：
```typescript
// ✅ 正确 - 注入 AppConfigService
WinstonModule.forRootAsync({
  inject: [AppConfigService],
  useFactory: (configService: AppConfigService) => {
    const appName = configService.app.name;
    return createWinstonConfig(appName);
  },
})
```

### Redis 缓存

项目已集成 Redis 缓存系统，详细使用说明请查看：[Redis 缓存文档](docs/redis-cache.md)

**快速使用**：

```typescript
// 注入 RedisService
constructor(private readonly redisService: RedisService) {}

// 基础操作
await this.redisService.set('key', value, 300);  // 缓存 5 分钟
const data = await this.redisService.get('key');

// 自动缓存（推荐）
return await this.redisService.getOrSet('user:1', async () => {
  return await this.userRepository.findOne({ where: { id: 1 } });
}, 600);
```

### MongoDB 数据库

项目已集成 MongoDB 数据库，使用 Mongoose 作为 ODM，详细使用说明请查看：[MongoDB 文档](docs/mongodb.md)

**快速使用**：

```typescript
// 注入 LogService（示例）
constructor(private readonly logService: LogService) {}

// 创建日志
await this.logService.create({
  level: 'info',
  message: '操作日志',
  metadata: { action: 'create' },
  userId: 'user123',
});

// 查询日志
const logs = await this.logService.findByLevel('error');
```

**数据库选择**：
- **MySQL (TypeORM)**: 关系型数据、事务密集型操作
- **MongoDB (Mongoose)**: 文档型数据、日志记录、缓存等场景


### 添加新配置
1. 在 `config.common.yml` 或环境配置文件中添加新的配置项
2. 在 `src/config/configs/` 下创建对应的配置文件
3. 使用 `getConfig('path.to.config', defaultValue)` 读取配置
4. 在 `src/config/configs/index.ts` 中导出
5. 在 `src/config/config.module.ts` 中添加到 `load` 数组
6. 在 `AppConfigService` 中添加 getter 方法

## 关键模式

- 全局模块使用 `@Global()` 装饰器
- 数据库访问使用仓储模式（见 `src/database/repositories/`）
- 缓存访问使用 `RedisService`（见 `src/redis/redis.service.ts`）
- 配置通过 `AppConfigService` 注入
- 每次运行完pnpm start:dev, 请确保查看终端输出以确认没有错误，并且测试结束关闭端口服务,以免端口被占用导致下次启动失败。
- 数据库不要创建外键约束，以免影响性能。逻辑由应用层控制。
- 所有的接口都不返回201状态码

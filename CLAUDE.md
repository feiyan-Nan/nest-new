# CLAUDE.md

此文件为 Claude Code (claude.ai/code) 在此仓库中工作提供指导。

## 常用命令

```bash
pnpm install          # 安装依赖
pnpm build            # 构建项目
pnpm start            # 启动应用
pnpm start:dev        # 启动开发模式（热重载）
pnpm start:prod       # 启动生产构建
pnpm lint             # 运行 ESLint
pnpm format           # 使用 Prettier 格式化
pnpm test             # 运行单元测试
pnpm test:watch       # 监听模式运行测试
pnpm test:cov         # 运行测试并生成覆盖率报告
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
│       └── index.ts            # 配置导出文件
├── database/               # TypeORM 数据库层
│   ├── database.module.ts  # 全局数据库模块
│   ├── database-config.service.ts  # 数据库配置服务
│   ├── entities/           # TypeORM 实体
│   └── repositories/       # 仓储模式实现
└── common/                 # 共享中间件
```

## 配置说明

项目采用 YAML 配置文件，每个配置类型都有独立的配置模块：

### 配置文件
- **主配置文件**: `config.yml` - 项目实际使用的配置（不提交到 git）
- **示例配置**: `config.example.yml` - 配置文件模板，带完整注释
- **多环境配置**:
  - `config.development.yml` - 开发环境配置
  - `config.production.yml` - 生产环境配置
  - `config.test.yml` - 测试环境配置

### 多环境配置
项目支持根据 `RUNNING_ENV` 环境变量加载不同的配置文件：

1. **环境变量**: 通过 `RUNNING_ENV` 指定运行环境（development/production/test）
2. **配置文件优先级**:
   - 如果设置了 `RUNNING_ENV`，优先加载 `config.{RUNNING_ENV}.yml`
   - 如果对应环境配置文件不存在，回退到 `config.yml`
   - 如果未设置 `RUNNING_ENV`，使用默认的 `config.yml`

3. **package.json 命令已自动配置**:
   - `pnpm start:dev` - 使用 `RUNNING_ENV=development`
   - `pnpm start:prod` - 使用 `RUNNING_ENV=production`
   - `pnpm test` - 使用 `RUNNING_ENV=test`

4. **创建环境配置文件**:
   ```bash
   # 复制示例配置文件创建不同环境的配置
   cp config.example.yml config.development.yml
   cp config.example.yml config.production.yml
   cp config.example.yml config.test.yml
   # 然后根据不同环境修改对应配置文件
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
```

### 使用配置
通过 `AppConfigService` 注入配置：
```typescript
constructor(private configService: AppConfigService) {}

// 使用配置
const port = this.configService.app.port;
const dbConfig = this.configService.database;
```

### 首次使用
1. 复制 `config.example.yml` 为 `config.yml`
2. 修改 `config.yml` 中的配置项
3. 启动应用

### 添加新配置
1. 在 `config.yml` 中添加新的配置项
2. 在 `src/config/configs/` 下创建对应的配置文件
3. 使用 `getConfig('path.to.config', defaultValue)` 读取配置
4. 在 `src/config/configs/index.ts` 中导出
5. 在 `src/config/config.module.ts` 中添加到 `load` 数组
6. 在 `AppConfigService` 中添加 getter 方法

## 关键模式

- 全局模块使用 `@Global()` 装饰器
- 数据库访问使用仓储模式（见 `src/database/repositories/`）
- 配置通过 `AppConfigService` 注入
- 每次运行完pnpm start:dev, 请确保查看终端输出以确认没有错误，并且测试结束关闭端口服务,以免端口被占用导致下次启动失败。

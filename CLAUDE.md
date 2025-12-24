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
│   ├── configuration.ts    # 环境配置工厂函数
│   └── configuration.interface.ts  # 配置接口定义
├── database/               # TypeORM 数据库层
│   ├── database.module.ts  # 全局数据库模块
│   ├── database-config.service.ts  # 数据库配置服务
│   ├── entities/           # TypeORM 实体
│   └── repositories/       # 仓储模式实现
└── common/                 # 共享中间件
```

## 配置说明

- 数据库：MySQL，通过 TypeORM 连接，配置在 `.env` 文件中
- 路径别名：`@/*` 映射到 `src/*`（在 tsconfig.json 中配置）
- 环境变量：通过 `src/config/configuration.ts` 加载

## 关键模式

- 全局模块使用 `@Global()` 装饰器
- 数据库访问使用仓储模式（见 `src/database/repositories/`）
- 配置通过 `AppConfigService` 注入
- 每次运行完pnpm start:dev, 请确保查看终端输出以确认没有错误，并且测试结束关闭端口服务,以免端口被占用导致下次启动失败。

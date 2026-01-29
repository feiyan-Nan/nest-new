# NestJS 项目

一个功能完整的 NestJS 应用，集成了 MySQL、Redis 和 MongoDB。

## 快速开始

### 方式一：使用 Docker Compose（推荐）

```bash
# 1. 启动所有服务
pnpm docker:up

# 2. 启动应用
pnpm start:docker
```

访问: http://localhost:3000

### 方式二：本地开发

```bash
# 1. 安装依赖
pnpm install

# 2. 配置环境
cp config.example.yml config.development.yml
# 编辑 config.development.yml 配置数据库连接信息

# 3. 启动本地服务（MySQL、Redis、MongoDB）

# 4. 启动应用
pnpm start:dev
```

## 技术栈

- **框架**: NestJS 11
- **数据库**: MySQL 8.0 (TypeORM) + MongoDB 7 (Mongoose)
- **缓存**: Redis 7
- **日志**: Winston
- **API 文档**: Swagger
- **认证**: JWT
- **构建工具**: SWC

## 项目特性

- ✅ TypeScript 严格模式
- ✅ 多数据库支持（MySQL + MongoDB）
- ✅ Redis 缓存系统
- ✅ JWT 认证和授权
- ✅ 全局异常处理
- ✅ 请求日志记录
- ✅ 健康检查
- ✅ API 文档（Swagger）
- ✅ Docker Compose 支持
- ✅ 配置文件管理（YAML）

## 目录结构

```
src/
├── config/          # 配置模块
├── database/        # MySQL/TypeORM
├── mongodb/         # MongoDB/Mongoose
├── redis/           # Redis 缓存
├── logger/          # Winston 日志
├── modules/         # 业务模块
│   ├── auth/        # 认证模块
│   └── users/       # 用户模块
└── common/          # 公共模块
```

## 可用命令

```bash
# 开发
pnpm start:dev       # 开发模式（热重载）
pnpm start:docker    # Docker 环境
pnpm build           # 构建项目
pnpm start:prod      # 生产模式

# Docker
pnpm docker:up       # 启动服务
pnpm docker:down     # 停止服务
pnpm docker:ps       # 查看状态
pnpm docker:logs     # 查看日志

# 代码质量
pnpm lint            # 代码检查
pnpm format          # 代码格式化
pnpm test            # 运行测试
```

## 服务端口

| 服务 | 端口 | 说明 |
|------|------|------|
| 应用 | 3000 | NestJS 应用 |
| MySQL | 3306 | 关系型数据库 |
| Redis | 6379 | 缓存服务 |
| MongoDB | 27017 | 文档数据库 |

## API 文档

启动应用后访问: http://localhost:3000/docs

## 文档

- [Docker Compose 使用指南](DOCKER.md)
- [MongoDB 集成文档](docs/mongodb.md)
- [Redis 缓存文档](docs/redis-cache.md)
- [项目开发指南](CLAUDE.md)

## 环境要求

- Node.js >= 18
- pnpm >= 8
- Docker & Docker Compose（可选）

## 资源

- [NestJS 文档](https://docs.nestjs.com)
- [NestJS Discord](https://discord.gg/G7Qnnhy)
- [NestJS 官方课程](https://courses.nestjs.com/)

## 许可证

UNLICENSED

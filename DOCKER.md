# Docker Compose 快速启动

## 一键启动所有服务

```bash
# 1. 启动 MySQL、Redis、MongoDB
pnpm docker:up

# 2. 启动应用（使用 Docker 配置）
pnpm start:docker
```

## 常用命令

```bash
# 启动服务
pnpm docker:up

# 停止服务
pnpm docker:down

# 查看服务状态
pnpm docker:ps

# 查看日志
pnpm docker:logs

# 重启服务
pnpm docker:restart

# 清理所有数据（⚠️ 会删除数据）
pnpm docker:clean
```

## 服务访问

### 数据库服务

- **MySQL**: `localhost:3306`
  - 用户: `root`
  - 密码: `admin123`
  - 数据库: `nest_db`

- **Redis**: `localhost:6379`
  - 无密码

- **MongoDB**: `localhost:27017`
  - 用户: `admin`
  - 密码: `admin123`
  - 数据库: `nest_db`

## 详细文档

查看完整文档：[docs/docker-compose.md](docs/docker-compose.md)

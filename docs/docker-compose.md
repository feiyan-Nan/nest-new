# Docker Compose 使用指南

本项目使用 Docker Compose 管理开发环境的所有依赖服务，包括 MySQL、Redis 和 MongoDB。

## 服务列表

| 服务 | 端口 | 说明 |
|------|------|------|
| MySQL | 3306 | 关系型数据库 |
| Redis | 6379 | 缓存服务 |
| MongoDB | 27017 | 文档数据库 |

## 快速开始

### 1. 启动所有服务

```bash
# 启动 MySQL、Redis、MongoDB
docker-compose up -d

# 查看服务状态
docker-compose ps

# 查看日志
docker-compose logs -f
```

### 2. 停止服务

```bash
# 停止所有服务
docker-compose down

# 停止并删除数据卷（⚠️ 会删除所有数据）
docker-compose down -v
```

## 服务配置

### MySQL

- **Root 密码**: `admin123`
- **数据库名**: `nest_db`
- **用户名**: `nest_user`
- **用户密码**: `nest_password`
- **字符集**: `utf8mb4`
- **端口**: `3306`

**连接字符串**:
```
mysql://root:admin123@localhost:3306/nest_db
```

### Redis

- **端口**: `6379`
- **密码**: 无（开发环境）
- **持久化**: AOF 模式

**连接字符串**:
```
redis://localhost:6379
```

### MongoDB

- **Root 用户**: `admin`
- **Root 密码**: `admin123`
- **数据库名**: `nest_db`
- **端口**: `27017`

**连接字符串**:
```
mongodb://admin:admin123@localhost:27017/nest_db?authSource=admin
```

**无认证连接**（如果不需要认证）:
```
mongodb://localhost:27017/nest_db
```

## 应用配置

### 使用 Docker 服务

创建 `config.docker.yml` 配置文件：

```yaml
# 数据库配置
database:
  host: localhost  # 或 nest-mysql（如果应用也在 Docker 中）
  username: root
  password: admin123
  name: nest_db

# Redis 配置
redis:
  host: localhost  # 或 nest-redis（如果应用也在 Docker 中）
  port: 6379
  password: ''

# MongoDB 配置
mongodb:
  uri: mongodb://admin:admin123@localhost:27017/nest_db?authSource=admin
```

### 启动应用

```bash
# 使用 Docker 配置启动
NODE_ENV=docker pnpm start:dev
```

## 常用命令

### 服务管理

```bash
# 启动服务
docker-compose up -d

# 停止服务
docker-compose stop

# 重启服务
docker-compose restart

# 查看服务状态
docker-compose ps

# 查看服务日志
docker-compose logs -f [service_name]

# 进入容器
docker-compose exec mysql bash
docker-compose exec redis redis-cli
docker-compose exec mongodb mongosh
```

### 数据管理

```bash
# 备份 MySQL
docker-compose exec mysql mysqldump -uroot -padmin123 nest_db > backup.sql

# 恢复 MySQL
docker-compose exec -T mysql mysql -uroot -padmin123 nest_db < backup.sql

# 备份 MongoDB
docker-compose exec mongodb mongodump --username admin --password admin123 --authenticationDatabase admin --out /data/backup

# 清理所有数据（⚠️ 危险操作）
docker-compose down -v
```

### 健康检查

```bash
# 检查所有服务健康状态
docker-compose ps

# 查看特定服务健康状态
docker inspect --format='{{.State.Health.Status}}' nest-mysql
docker inspect --format='{{.State.Health.Status}}' nest-redis
docker inspect --format='{{.State.Health.Status}}' nest-mongodb
```

## 初始化脚本

### MySQL 初始化

在 `docker/mysql/init/` 目录下创建 `.sql` 文件，容器首次启动时会自动执行：

```sql
-- docker/mysql/init/01-init.sql
CREATE TABLE IF NOT EXISTS users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  username VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### MongoDB 初始化

在 `docker/mongodb/init/` 目录下创建 `.js` 文件：

```javascript
// docker/mongodb/init/01-init.js
db = db.getSiblingDB('nest_db');

db.createCollection('logs');
db.logs.createIndex({ level: 1, createdAt: -1 });
db.logs.createIndex({ userId: 1 });
```

## 故障排查

### 端口冲突

如果端口被占用，修改 `docker-compose.yml` 中的端口映射：

```yaml
ports:
  - "3307:3306"  # 将 MySQL 映射到 3307
```

### 容器无法启动

```bash
# 查看详细日志
docker-compose logs [service_name]

# 重新构建并启动
docker-compose up -d --force-recreate

# 清理并重新启动
docker-compose down -v
docker-compose up -d
```

### 数据持久化

数据存储在 Docker 卷中，即使删除容器也不会丢失数据。

查看数据卷：
```bash
docker volume ls | grep nest
```

删除数据卷（⚠️ 会删除所有数据）：
```bash
docker-compose down -v
```

### 连接问题

如果应用无法连接到服务：

1. 确认服务已启动: `docker-compose ps`
2. 检查健康状态: `docker-compose ps`
3. 查看服务日志: `docker-compose logs [service_name]`
4. 测试连接:
   ```bash
   # MySQL
   docker-compose exec mysql mysql -uroot -padmin123 -e "SELECT 1"

   # Redis
   docker-compose exec redis redis-cli ping

   # MongoDB
   docker-compose exec mongodb mongosh --eval "db.adminCommand('ping')"
   ```

## 生产环境注意事项

⚠️ **此配置仅用于开发环境，生产环境需要：**

1. **修改所有默认密码**
2. **配置数据卷备份策略**
3. **启用 SSL/TLS 加密**
4. **配置防火墙规则**
5. **限制容器资源使用**
6. **使用 secrets 管理敏感信息**
7. **配置日志轮转**
8. **定期更新镜像版本**

## 性能优化

### MySQL 优化

```yaml
command:
  - --innodb_buffer_pool_size=1G  # 根据可用内存调整
  - --max_connections=500
  - --query_cache_size=64M
```

### MongoDB 优化

```yaml
command:
  - --wiredTigerCacheSizeGB=1  # 根据可用内存调整
```

### Redis 优化

```yaml
command: redis-server --maxmemory 512mb --maxmemory-policy allkeys-lru
```

## 资源限制

添加资源限制防止容器占用过多资源：

```yaml
services:
  mysql:
    deploy:
      resources:
        limits:
          cpus: '2'
          memory: 2G
        reservations:
          cpus: '1'
          memory: 1G
```

## 参考资料

- [Docker Compose 文档](https://docs.docker.com/compose/)
- [MySQL Docker 镜像](https://hub.docker.com/_/mysql)
- [Redis Docker 镜像](https://hub.docker.com/_/redis)
- [MongoDB Docker 镜像](https://hub.docker.com/_/mongo)

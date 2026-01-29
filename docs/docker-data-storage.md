# Docker Compose 数据存储说明

## 当前配置（命名卷）

MySQL 数据使用 Docker 命名卷存储：

```yaml
volumes:
  - mysql_data:/var/lib/mysql
```

**优点**：
- Docker 自动管理
- 性能优化
- 跨平台兼容

**查看数据位置**：
```bash
docker volume inspect nest-new_mysql_data
```

---

## 可选配置（本地目录）

如果需要将数据存储在项目目录中，可以修改为：

```yaml
# docker-compose.yml
mysql:
  volumes:
    - ./docker/mysql/data:/var/lib/mysql  # 本地目录
```

**优点**：
- 数据位置明确
- 便于直接访问
- 便于版本控制（不推荐）

**缺点**：
- 需要手动管理权限
- 跨平台可能有问题
- 性能可能较差（macOS）

**注意**：
- 需要创建目录：`mkdir -p docker/mysql/data`
- 需要设置权限：`chmod 777 docker/mysql/data`（开发环境）
- 已添加到 `.gitignore`

---

## 数据管理

### 备份数据

```bash
# 方式一：使用 mysqldump
docker-compose exec mysql mysqldump -uroot -padmin123 nest_db > backup.sql

# 方式二：备份整个数据卷
docker run --rm -v nest-new_mysql_data:/data -v $(pwd):/backup alpine tar czf /backup/mysql-backup.tar.gz -C /data .
```

### 恢复数据

```bash
# 方式一：从 SQL 文件恢复
docker-compose exec -T mysql mysql -uroot -padmin123 nest_db < backup.sql

# 方式二：从数据卷备份恢复
docker run --rm -v nest-new_mysql_data:/data -v $(pwd):/backup alpine tar xzf /backup/mysql-backup.tar.gz -C /data
```

### 清理数据

```bash
# 停止服务并删除数据卷
docker-compose down -v

# 或单独删除 MySQL 数据卷
docker volume rm nest-new_mysql_data
```

---

## 推荐配置

**开发环境**：使用命名卷（当前配置）
- 简单方便
- 性能好
- Docker 自动管理

**生产环境**：
- 使用云存储卷（AWS EBS、Azure Disk 等）
- 配置定期备份
- 使用数据库托管服务（RDS、Cloud SQL 等）

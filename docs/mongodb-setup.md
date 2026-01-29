# MongoDB 安装和启动指南

## macOS 安装

### 使用 Homebrew 安装

```bash
# 安装 MongoDB Community Edition
brew tap mongodb/brew
brew install mongodb-community

# 启动 MongoDB 服务
brew services start mongodb-community

# 停止 MongoDB 服务
brew services stop mongodb-community

# 重启 MongoDB 服务
brew services restart mongodb-community

# 查看服务状态
brew services list | grep mongodb
```

### 手动启动

```bash
# 创建数据目录
mkdir -p ~/data/db

# 启动 MongoDB（前台运行）
mongod --dbpath ~/data/db

# 或者后台运行
mongod --dbpath ~/data/db --fork --logpath ~/data/mongodb.log
```

## Linux 安装

### Ubuntu/Debian

```bash
# 导入 MongoDB 公钥
wget -qO - https://www.mongodb.org/static/pgp/server-7.0.asc | sudo apt-key add -

# 添加 MongoDB 源
echo "deb [ arch=amd64,arm64 ] https://repo.mongodb.org/apt/ubuntu $(lsb_release -cs)/mongodb-org/7.0 multiverse" | sudo tee /etc/apt/sources.list.d/mongodb-org-7.0.list

# 更新包列表
sudo apt-get update

# 安装 MongoDB
sudo apt-get install -y mongodb-org

# 启动服务
sudo systemctl start mongod

# 设置开机自启
sudo systemctl enable mongod

# 查看状态
sudo systemctl status mongod
```

### CentOS/RHEL

```bash
# 创建 MongoDB 源文件
sudo tee /etc/yum.repos.d/mongodb-org-7.0.repo << EOF
[mongodb-org-7.0]
name=MongoDB Repository
baseurl=https://repo.mongodb.org/yum/redhat/\$releasever/mongodb-org/7.0/x86_64/
gpgcheck=1
enabled=1
gpgkey=https://www.mongodb.org/static/pgp/server-7.0.asc
EOF

# 安装 MongoDB
sudo yum install -y mongodb-org

# 启动服务
sudo systemctl start mongod

# 设置开机自启
sudo systemctl enable mongod

# 查看状态
sudo systemctl status mongod
```

## Windows 安装

1. 下载 MongoDB Community Server：https://www.mongodb.com/try/download/community
2. 运行安装程序，选择 "Complete" 安装
3. 勾选 "Install MongoDB as a Service"
4. 完成安装后，MongoDB 会自动作为 Windows 服务运行

### 手动启动（如果未安装为服务）

```cmd
# 创建数据目录
mkdir C:\data\db

# 启动 MongoDB
"C:\Program Files\MongoDB\Server\7.0\bin\mongod.exe" --dbpath="C:\data\db"
```

## Docker 安装（推荐用于开发环境）

```bash
# 拉取 MongoDB 镜像
docker pull mongo:latest

# 启动 MongoDB 容器
docker run -d \
  --name mongodb \
  -p 27017:27017 \
  -v ~/data/mongodb:/data/db \
  mongo:latest

# 停止容器
docker stop mongodb

# 启动容器
docker start mongodb

# 查看日志
docker logs mongodb

# 进入 MongoDB Shell
docker exec -it mongodb mongosh
```

### 使用 Docker Compose

创建 `docker-compose.yml`:

```yaml
version: '3.8'

services:
  mongodb:
    image: mongo:latest
    container_name: mongodb
    restart: always
    ports:
      - "27017:27017"
    volumes:
      - mongodb_data:/data/db
    environment:
      MONGO_INITDB_ROOT_USERNAME: admin
      MONGO_INITDB_ROOT_PASSWORD: password

volumes:
  mongodb_data:
```

启动：

```bash
docker-compose up -d
```

## 验证安装

### 检查服务状态

```bash
# macOS/Linux
pgrep -fl mongod

# 或使用 MongoDB Shell 连接
mongosh

# Docker
docker ps | grep mongodb
```

### 测试连接

```bash
# 使用 MongoDB Shell
mongosh

# 或指定连接字符串
mongosh "mongodb://localhost:27017"
```

## 配置认证（生产环境推荐）

### 创建管理员用户

```javascript
// 连接到 MongoDB
mongosh

// 切换到 admin 数据库
use admin

// 创建管理员用户
db.createUser({
  user: "admin",
  pwd: "your_secure_password",
  roles: [ { role: "userAdminAnyDatabase", db: "admin" }, "readWriteAnyDatabase" ]
})

// 退出
exit
```

### 启用认证

编辑 MongoDB 配置文件（通常在 `/etc/mongod.conf` 或 `/usr/local/etc/mongod.conf`）:

```yaml
security:
  authorization: enabled
```

重启 MongoDB 服务。

### 更新应用配置

在 `config.development.yml` 中更新连接字符串：

```yaml
mongodb:
  uri: mongodb://admin:your_secure_password@localhost:27017/nest_db?authSource=admin
```

## 常用命令

### MongoDB Shell 命令

```javascript
// 显示所有数据库
show dbs

// 切换数据库
use nest_db

// 显示当前数据库的集合
show collections

// 查询文档
db.logs.find()

// 查询并格式化
db.logs.find().pretty()

// 统计文档数量
db.logs.countDocuments()

// 删除集合
db.logs.drop()

// 删除数据库
db.dropDatabase()
```

### 服务管理命令

```bash
# macOS (Homebrew)
brew services start mongodb-community
brew services stop mongodb-community
brew services restart mongodb-community

# Linux (systemd)
sudo systemctl start mongod
sudo systemctl stop mongod
sudo systemctl restart mongod
sudo systemctl status mongod

# Docker
docker start mongodb
docker stop mongodb
docker restart mongodb
```

## 故障排查

### 端口被占用

```bash
# 查看 27017 端口占用
lsof -i :27017

# 或
netstat -an | grep 27017
```

### 数据目录权限问题

```bash
# 修改数据目录权限
sudo chown -R $(whoami) ~/data/db

# 或
sudo chown -R mongodb:mongodb /var/lib/mongodb
```

### 查看日志

```bash
# macOS (Homebrew)
tail -f /usr/local/var/log/mongodb/mongo.log

# Linux
sudo tail -f /var/log/mongodb/mongod.log

# Docker
docker logs -f mongodb
```

## 性能优化

### 配置文件优化

编辑 `/etc/mongod.conf`:

```yaml
# 网络配置
net:
  port: 27017
  bindIp: 127.0.0.1

# 存储配置
storage:
  dbPath: /var/lib/mongodb
  journal:
    enabled: true
  wiredTiger:
    engineConfig:
      cacheSizeGB: 1  # 根据可用内存调整

# 操作分析
operationProfiling:
  mode: slowOp
  slowOpThresholdMs: 100
```

### 监控

```bash
# 查看数据库统计
mongosh --eval "db.stats()"

# 查看服务器状态
mongosh --eval "db.serverStatus()"

# 实时监控
mongostat

# 查看当前操作
mongotop
```

## 备份和恢复

### 备份

```bash
# 备份所有数据库
mongodump --out /path/to/backup

# 备份特定数据库
mongodump --db nest_db --out /path/to/backup

# 备份到压缩文件
mongodump --archive=backup.gz --gzip
```

### 恢复

```bash
# 恢复所有数据库
mongorestore /path/to/backup

# 恢复特定数据库
mongorestore --db nest_db /path/to/backup/nest_db

# 从压缩文件恢复
mongorestore --archive=backup.gz --gzip
```

## 开发环境快速启动

```bash
# 使用 Docker（推荐）
docker run -d --name mongodb -p 27017:27017 mongo:latest

# 或使用 Homebrew（macOS）
brew services start mongodb-community

# 验证
mongosh
```

## 参考资料

- [MongoDB 官方文档](https://docs.mongodb.com/)
- [MongoDB 安装指南](https://docs.mongodb.com/manual/installation/)
- [MongoDB Shell 文档](https://docs.mongodb.com/mongodb-shell/)

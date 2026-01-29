# MongoDB 集成文档

## 概述

项目已集成 MongoDB 数据库，使用 Mongoose 作为 ODM（Object Document Mapper）。MongoDB 与现有的 MySQL/TypeORM 可以共存，适用于不同的数据存储场景。

## 配置说明

### 配置文件

MongoDB 配置位于 `config.common.yml` 和环境特定配置文件中（如 `config.development.yml`）。

**公共配置** (`config.common.yml`):
```yaml
mongodb:
  dbName: nest_db       # 数据库名称
  maxPoolSize: 10       # 最大连接池大小
  minPoolSize: 2        # 最小连接池大小
  serverSelectionTimeoutMS: 5000   # 服务器选择超时（毫秒）
  socketTimeoutMS: 45000           # Socket 超时（毫秒）
  connectTimeoutMS: 10000          # 连接超时（毫秒）
  retryWrites: true                # 重试写入
  retryReads: true                 # 重试读取
```

**环境配置** (`config.development.yml`):
```yaml
mongodb:
  uri: mongodb://localhost:27017  # MongoDB 连接 URI
```

### 配置参数说明

- **uri**: MongoDB 连接字符串
  - 本地开发: `mongodb://localhost:27017`
  - 带认证: `mongodb://username:password@localhost:27017`
  - 副本集: `mongodb://host1:27017,host2:27017,host3:27017/?replicaSet=myReplicaSet`

- **dbName**: 数据库名称

- **连接池配置**:
  - `maxPoolSize`: 最大连接数（开发环境：5-10，生产环境：10-50）
  - `minPoolSize`: 最小连接数（建议 2-5）
  - `serverSelectionTimeoutMS`: 服务器选择超时时间
  - `socketTimeoutMS`: Socket 超时时间
  - `connectTimeoutMS`: 连接超时时间

## 使用示例

### 1. 定义 Schema

在 `src/mongodb/schemas/` 目录下创建 Schema 文件：

```typescript
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type UserDocument = User & Document;

@Schema({
  timestamps: true, // 自动添加 createdAt 和 updatedAt
  collection: 'users', // 集合名称
})
export class User {
  @Prop({ required: true })
  username: string;

  @Prop({ required: true })
  email: string;

  @Prop()
  age?: number;

  @Prop({ type: Object })
  profile?: Record<string, any>;
}

export const UserSchema = SchemaFactory.createForClass(User);

// 添加索引
UserSchema.index({ email: 1 }, { unique: true });
UserSchema.index({ username: 1 });
```

### 2. 创建 Service

```typescript
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User, UserDocument } from './schemas/user.schema';

@Injectable()
export class UserService {
  constructor(
    @InjectModel(User.name) private userModel: Model<UserDocument>,
  ) {}

  async create(userData: Partial<User>): Promise<User> {
    const user = new this.userModel(userData);
    return user.save();
  }

  async findAll(): Promise<User[]> {
    return this.userModel.find().exec();
  }

  async findOne(id: string): Promise<User | null> {
    return this.userModel.findById(id).exec();
  }

  async update(id: string, userData: Partial<User>): Promise<User | null> {
    return this.userModel
      .findByIdAndUpdate(id, userData, { new: true })
      .exec();
  }

  async delete(id: string): Promise<User | null> {
    return this.userModel.findByIdAndDelete(id).exec();
  }
}
```

### 3. 在模块中注册

```typescript
import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { User, UserSchema } from './schemas/user.schema';
import { UserService } from './user.service';
import { UserController } from './user.controller';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]),
  ],
  controllers: [UserController],
  providers: [UserService],
  exports: [UserService],
})
export class UserModule {}
```

### 4. 在 Controller 中使用

```typescript
import { Controller, Get, Post, Body, Param } from '@nestjs/common';
import { UserService } from './user.service';

@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post()
  async create(@Body() userData: any) {
    return this.userService.create(userData);
  }

  @Get()
  async findAll() {
    return this.userService.findAll();
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.userService.findOne(id);
  }
}
```

## 内置示例

项目已包含一个日志记录的示例实现：

- **Schema**: `src/mongodb/schemas/log.schema.ts`
- **Service**: `src/mongodb/log.service.ts`

### 使用日志服务

```typescript
import { Injectable } from '@nestjs/common';
import { LogService } from '@/mongodb/log.service';

@Injectable()
export class SomeService {
  constructor(private readonly logService: LogService) {}

  async doSomething() {
    // 记录日志
    await this.logService.create({
      level: 'info',
      message: '执行了某个操作',
      metadata: { action: 'doSomething' },
      userId: 'user123',
    });
  }
}
```

## 常用操作

### 查询操作

```typescript
// 基础查询
await this.model.find({ status: 'active' }).exec();

// 条件查询
await this.model.find({ age: { $gte: 18 } }).exec();

// 排序
await this.model.find().sort({ createdAt: -1 }).exec();

// 分页
await this.model
  .find()
  .skip((page - 1) * limit)
  .limit(limit)
  .exec();

// 投影（选择字段）
await this.model.find().select('username email').exec();

// 聚合查询
await this.model.aggregate([
  { $match: { status: 'active' } },
  { $group: { _id: '$category', count: { $sum: 1 } } },
]).exec();
```

### 更新操作

```typescript
// 更新单个文档
await this.model.findByIdAndUpdate(id, { status: 'inactive' }, { new: true });

// 更新多个文档
await this.model.updateMany({ status: 'pending' }, { status: 'processed' });

// 原子操作
await this.model.findByIdAndUpdate(id, { $inc: { views: 1 } });
```

### 删除操作

```typescript
// 删除单个文档
await this.model.findByIdAndDelete(id);

// 删除多个文档
await this.model.deleteMany({ status: 'expired' });
```

## 索引管理

### 定义索引

```typescript
// 在 Schema 中定义索引
UserSchema.index({ email: 1 }, { unique: true }); // 唯一索引
UserSchema.index({ username: 1 }); // 普通索引
UserSchema.index({ createdAt: -1 }); // 降序索引
UserSchema.index({ location: '2dsphere' }); // 地理空间索引
UserSchema.index({ title: 'text', content: 'text' }); // 文本索引
```

### 复合索引

```typescript
// 复合索引
UserSchema.index({ category: 1, createdAt: -1 });
```

## 事务支持

```typescript
import { InjectConnection } from '@nestjs/mongoose';
import { Connection } from 'mongoose';

@Injectable()
export class TransactionService {
  constructor(@InjectConnection() private connection: Connection) {}

  async transferMoney(fromId: string, toId: string, amount: number) {
    const session = await this.connection.startSession();
    session.startTransaction();

    try {
      await this.accountModel.findByIdAndUpdate(
        fromId,
        { $inc: { balance: -amount } },
        { session },
      );

      await this.accountModel.findByIdAndUpdate(
        toId,
        { $inc: { balance: amount } },
        { session },
      );

      await session.commitTransaction();
    } catch (error) {
      await session.abortTransaction();
      throw error;
    } finally {
      session.endSession();
    }
  }
}
```

## 最佳实践

1. **使用 timestamps**: 在 Schema 中启用 `timestamps: true` 自动管理创建和更新时间

2. **合理使用索引**: 为常用查询字段添加索引，但避免过多索引影响写入性能

3. **使用投影**: 查询时只选择需要的字段，减少数据传输

4. **分页查询**: 大数据量查询时使用 `skip()` 和 `limit()` 进行分页

5. **使用 lean()**: 对于只读操作，使用 `.lean()` 返回普通 JavaScript 对象而非 Mongoose 文档

6. **错误处理**: 始终处理数据库操作的错误

7. **连接池配置**: 根据应用负载合理配置连接池大小

## 与 MySQL 共存

项目同时支持 MySQL（TypeORM）和 MongoDB（Mongoose）：

- **MySQL**: 适用于关系型数据、事务密集型操作
- **MongoDB**: 适用于文档型数据、日志记录、缓存等场景

根据数据特性选择合适的数据库：

```typescript
@Injectable()
export class HybridService {
  constructor(
    // MySQL 仓储
    private readonly userRepository: UserRepository,
    // MongoDB 服务
    private readonly logService: LogService,
  ) {}

  async createUser(userData: any) {
    // 在 MySQL 中创建用户
    const user = await this.userRepository.create(userData);

    // 在 MongoDB 中记录日志
    await this.logService.create({
      level: 'info',
      message: '创建用户',
      metadata: { userId: user.id },
    });

    return user;
  }
}
```

## 故障排查

### 连接失败

1. 确认 MongoDB 服务已启动
2. 检查配置文件中的连接 URI
3. 验证网络连接和防火墙设置

### 性能问题

1. 检查是否添加了必要的索引
2. 使用 `.explain()` 分析查询计划
3. 考虑使用 `.lean()` 优化查询
4. 调整连接池大小

### 内存占用

1. 使用流式查询处理大数据集
2. 限制查询结果数量
3. 及时关闭游标和会话

## 参考资料

- [NestJS Mongoose 文档](https://docs.nestjs.com/techniques/mongodb)
- [Mongoose 官方文档](https://mongoosejs.com/docs/guide.html)
- [MongoDB 官方文档](https://docs.mongodb.com/)

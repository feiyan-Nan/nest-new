# NestJS 数据库集成指南

## 📚 概述

NestJS 是一个数据库无关的框架，可以轻松集成任何 SQL 或 NoSQL 数据库。你有多种选择：

- **直接使用数据库驱动**：像 Express/Fastify 一样直接使用 Node.js 数据库驱动
- **使用 ORM/ODM**：使用对象关系映射工具，提供更高级的抽象和类型安全

NestJS 官方为以下工具提供了开箱即用的集成：

| 集成包 | 适用场景 | 支持数据库 |
|--------|----------|-----------|
| `@nestjs/typeorm` | SQL + NoSQL | PostgreSQL, MySQL, Oracle, SQL Server, SQLite, MongoDB |
| `@nestjs/sequelize` | SQL | PostgreSQL, MySQL, SQL Server, SQLite, MariaDB |
| `@nestjs/mongoose` | NoSQL | MongoDB |
| Prisma | 现代 ORM | PostgreSQL, MySQL, SQL Server, SQLite, MongoDB, CockroachDB |

---

## 🔷 TypeORM 集成（推荐用于 SQL 数据库）

TypeORM 是 TypeScript 生态中最成熟的 ORM，原生支持 TypeScript。

### 1. 安装依赖

```bash
pnpm add @nestjs/typeorm typeorm mysql2
# 根据数据库选择：pg (PostgreSQL), sqlite3 (SQLite), mssql (SQL Server)
```

### 2. 配置连接

在 `app.module.ts` 中导入 TypeORM 模块：

```typescript
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './users/user.entity';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'mysql',           // 数据库类型
      host: 'localhost',       // 主机地址
      port: 3306,             // 端口
      username: 'root',       // 用户名
      password: 'root',       // 密码
      database: 'test',       // 数据库名
      entities: [User],       // 实体列表
      synchronize: true,      // ⚠️ 生产环境务必设为 false
    }),
  ],
})
export class AppModule {}
```

**⚠️ 重要提示**：`synchronize: true` 会在每次启动时自动同步数据库结构，生产环境中请使用 migration！

### 3. 定义实体（Entity）

实体就是数据库表的映射类：

```typescript
import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity()  // 标记为实体
export class User {
  @PrimaryGeneratedColumn()  // 自增主键
  id: number;

  @Column()  // 普通列
  firstName: string;

  @Column()
  lastName: string;

  @Column({ default: true })  // 带默认值的列
  isActive: boolean;
}
```

### 4. 使用 Repository 模式

#### 4.1 在模块中注册实体

```typescript
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { User } from './user.entity';

@Module({
  imports: [TypeOrmModule.forFeature([User])],  // 注册实体
  providers: [UsersService],
  controllers: [UsersController],
})
export class UsersModule {}
```

#### 4.2 在服务中注入 Repository

```typescript
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/repository';
import { Repository } from 'typeorm';
import { User } from './user.entity';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
  ) {}

  findAll(): Promise<User[]> {
    return this.usersRepository.find();
  }

  findOne(id: number): Promise<User | null> {
    return this.usersRepository.findOneBy({ id });
  }

  async create(user: Partial<User>): Promise<User> {
    const newUser = this.usersRepository.create(user);
    return this.usersRepository.save(newUser);
  }

  async remove(id: number): Promise<void> {
    await this.usersRepository.delete(id);
  }
}
```

### 5. 使用事件订阅器（Subscriber）

监听实体生命周期事件：

```typescript
import {
  DataSource,
  EntitySubscriberInterface,
  EventSubscriber,
  InsertEvent,
} from 'typeorm';
import { User } from './user.entity';

@EventSubscriber()
export class UserSubscriber implements EntitySubscriberInterface<User> {
  constructor(dataSource: DataSource) {
    dataSource.subscribers.push(this);
  }

  listenTo() {
    return User;
  }

  beforeInsert(event: InsertEvent<User>) {
    console.log('插入用户前:', event.entity);
  }
}
```

### 6. 单元测试中的 Mock

```typescript
@Module({
  providers: [
    UsersService,
    {
      provide: getRepositoryToken(User),
      useValue: mockRepository,  // 使用 mock 对象
    },
  ],
})
export class UsersModule {}
```

---

## 🔶 Sequelize 集成（SQL 数据库的另一选择）

Sequelize 是另一个流行的 SQL ORM，支持多种关系型数据库。

### 1. 安装依赖

```bash
pnpm add @nestjs/sequelize sequelize sequelize-typescript mysql2
pnpm add -D @types/sequelize
```

### 2. 配置连接

```typescript
import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { User } from './users/user.model';

@Module({
  imports: [
    SequelizeModule.forRoot({
      dialect: 'mysql',
      host: 'localhost',
      port: 3306,
      username: 'root',
      password: 'root',
      database: 'test',
      models: [User],  // 注册模型
    }),
  ],
})
export class AppModule {}
```

### 3. 定义模型（Model）

```typescript
import { Column, Model, Table } from 'sequelize-typescript';

@Table  // 标记为表模型
export class User extends Model {
  @Column
  firstName: string;

  @Column
  lastName: string;

  @Column({ defaultValue: true })  // 带默认值
  isActive: boolean;
}
```

### 4. 在服务中使用模型

```typescript
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { User } from './user.model';

@Injectable()
export class UsersService {
  constructor(
    @InjectModel(User)
    private userModel: typeof User,
  ) {}

  async findAll(): Promise<User[]> {
    return this.userModel.findAll();
  }

  findOne(id: string): Promise<User> {
    return this.userModel.findOne({
      where: { id },
    });
  }

  async remove(id: string): Promise<void> {
    const user = await this.findOne(id);
    await user.destroy();
  }
}
```

### 5. 多数据库连接

```typescript
const defaultOptions = {
  dialect: 'postgres',
  port: 5432,
  username: 'user',
  password: 'password',
  database: 'db',
  synchronize: true,
};

@Module({
  imports: [
    SequelizeModule.forRoot({
      ...defaultOptions,
      host: 'user_db_host',
      models: [User],
    }),
    SequelizeModule.forRoot({
      ...defaultOptions,
      name: 'albumsConnection',  // 命名连接
      host: 'album_db_host',
      models: [Album],
    }),
  ],
})
export class AppModule {}
```

使用命名连接：

```typescript
@Module({
  imports: [
    SequelizeModule.forFeature([User]),  // 默认连接
    SequelizeModule.forFeature([Album], 'albumsConnection'),  // 指定连接
  ],
})
export class AppModule {}
```

---

## 🍃 Mongoose 集成（MongoDB）

Mongoose 是 MongoDB 最流行的 ODM（对象文档映射）工具。

### 1. 安装依赖

```bash
pnpm add @nestjs/mongoose mongoose
```

### 2. 配置连接

```typescript
import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

@Module({
  imports: [
    MongooseModule.forRoot('mongodb://localhost/test'),
  ],
})
export class AppModule {}
```

### 3. 定义 Schema

```typescript
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type CatDocument = HydratedDocument<Cat>;

@Schema()  // 标记为 Schema
export class Cat {
  @Prop()  // 定义属性
  name: string;

  @Prop()
  age: number;

  @Prop()
  breed: string;
}

export const CatSchema = SchemaFactory.createForClass(Cat);
```

**高级用法：**

```typescript
@Schema()
export class Cat {
  @Prop({ required: true })  // 必填
  name: string;

  @Prop({ default: 0 })  // 默认值
  age: number;

  @Prop([String])  // 数组类型
  tags: string[];
}
```

### 4. 注册模型

```typescript
import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { CatsController } from './cats.controller';
import { CatsService } from './cats.service';
import { Cat, CatSchema } from './schemas/cat.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Cat.name, schema: CatSchema }
    ])
  ],
  controllers: [CatsController],
  providers: [CatsService],
})
export class CatsModule {}
```

### 5. 在服务中使用模型

```typescript
import { Model } from 'mongoose';
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Cat } from './schemas/cat.schema';

@Injectable()
export class CatsService {
  constructor(
    @InjectModel(Cat.name)
    private catModel: Model<Cat>,
  ) {}

  async create(createCatDto: any): Promise<Cat> {
    const createdCat = new this.catModel(createCatDto);
    return createdCat.save();
  }

  async findAll(): Promise<Cat[]> {
    return this.catModel.find().exec();
  }
}
```

### 6. 插件支持

#### 全局插件（应用于所有 Schema）

```typescript
MongooseModule.forRoot('mongodb://localhost/test', {
  connectionFactory: (connection) => {
    connection.plugin(require('mongoose-autopopulate'));
    return connection;
  }
})
```

#### 单个 Schema 插件

```typescript
MongooseModule.forFeatureAsync([
  {
    name: Cat.name,
    useFactory: () => {
      const schema = CatSchema;
      schema.plugin(require('mongoose-autopopulate'));
      return schema;
    },
  },
])
```

---

## 💎 Prisma（现代化 ORM）

Prisma 是新一代 ORM，提供超越其他 ORM 的类型安全性。

### 特点

- ✅ 类型安全的查询构建器
- ✅ 自动生成的类型定义
- ✅ 数据库迁移工具
- ✅ 强大的开发者体验
- ✅ 支持多种数据库：PostgreSQL, MySQL, SQL Server, SQLite, MongoDB, CockroachDB

### 基本用法

1. 安装 Prisma CLI

```bash
pnpm add -D prisma
pnpm add @prisma/client
```

2. 初始化 Prisma

```bash
npx prisma init
```

3. 定义数据模型（`prisma/schema.prisma`）

```prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

generator client {
  provider = "prisma-client-js"
}

model User {
  id        Int      @id @default(autoincrement())
  email     String   @unique
  name      String?
  posts     Post[]
  createdAt DateTime @default(now())
}

model Post {
  id        Int      @id @default(autoincrement())
  title     String
  content   String?
  published Boolean  @default(false)
  author    User     @relation(fields: [authorId], references: [id])
  authorId  Int
}
```

4. 运行迁移

```bash
npx prisma migrate dev --name init
```

5. 在 NestJS 中使用

```typescript
import { Injectable, OnModuleInit } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit {
  async onModuleInit() {
    await this.$connect();
  }
}
```

---

## 🔧 异步配置

所有数据库模块都支持异步配置，用于从配置服务获取数据库凭证：

### TypeORM 异步配置

```typescript
TypeOrmModule.forRootAsync({
  imports: [ConfigModule],
  useFactory: (configService: ConfigService) => ({
    type: 'mysql',
    host: configService.get('DB_HOST'),
    port: configService.get('DB_PORT'),
    username: configService.get('DB_USER'),
    password: configService.get('DB_PASSWORD'),
    database: configService.get('DB_NAME'),
    entities: [__dirname + '/**/*.entity{.ts,.js}'],
    synchronize: false,
  }),
  inject: [ConfigService],
})
```

### Sequelize 异步配置

```typescript
SequelizeModule.forRootAsync({
  imports: [ConfigModule],
  useFactory: (configService: ConfigService) => ({
    dialect: 'mysql',
    host: configService.get('DB_HOST'),
    port: configService.get('DB_PORT'),
    username: configService.get('DB_USER'),
    password: configService.get('DB_PASSWORD'),
    database: configService.get('DB_NAME'),
    models: [],
  }),
  inject: [ConfigService],
})
```

### Mongoose 异步配置

```typescript
MongooseModule.forRootAsync({
  imports: [ConfigModule],
  useFactory: async (configService: ConfigService) => ({
    uri: configService.get<string>('MONGODB_URI'),
  }),
  inject: [ConfigService],
})
```

---

## 📊 如何选择数据库方案

| 需求 | 推荐方案 | 理由 |
|------|----------|------|
| 新项目 + SQL | **Prisma** | 最佳开发体验，类型安全，现代化工具链 |
| 已有 TypeORM 项目 | **TypeORM** | 生态成熟，功能完整，社区庞大 |
| 需要多数据库支持 | **TypeORM** | 支持 SQL 和 NoSQL |
| 偏好传统 ORM | **Sequelize** | 类似 ActiveRecord 的 API 风格 |
| MongoDB | **Mongoose** | MongoDB 官方推荐，功能完整 |
| 企业级项目 | **TypeORM / Prisma** | 成熟稳定，适合大型应用 |

---

## 🎯 最佳实践

### 1. 环境配置

```typescript
// 永远不要在代码中硬编码数据库凭证
// ❌ 错误
TypeOrmModule.forRoot({
  password: 'my-secret-password',
})

// ✅ 正确
TypeOrmModule.forRootAsync({
  useFactory: (config: ConfigService) => ({
    password: config.get('DB_PASSWORD'),
  }),
  inject: [ConfigService],
})
```

### 2. 生产环境设置

```typescript
{
  synchronize: false,  // ❗ 生产环境必须关闭自动同步
  logging: false,      // 关闭 SQL 日志（或使用结构化日志）
  migrations: [/*...*/],  // 使用 migration 管理数据库变更
}
```

### 3. 连接池配置

```typescript
{
  extra: {
    max: 10,           // 最大连接数
    min: 2,            // 最小连接数
    idle: 10000,       // 连接空闲超时
  }
}
```

### 4. 事务处理

```typescript
// TypeORM
await this.dataSource.transaction(async (manager) => {
  await manager.save(user);
  await manager.save(profile);
});

// Sequelize
await this.sequelize.transaction(async (t) => {
  await this.userModel.create(userData, { transaction: t });
  await this.profileModel.create(profileData, { transaction: t });
});
```

### 5. 模块解耦

```typescript
// 导出 Repository 供其他模块使用
@Module({
  imports: [TypeOrmModule.forFeature([User])],
  exports: [TypeOrmModule],  // 导出以便其他模块使用
})
export class UsersModule {}
```

---

## 🔗 相关资源

- [TypeORM 官方文档](https://typeorm.io)
- [Sequelize 官方文档](https://sequelize.org)
- [Mongoose 官方文档](https://mongoosejs.com)
- [Prisma 官方文档](https://www.prisma.io/docs)
- [NestJS Database 官方文档](https://docs.nestjs.com/techniques/database)

---

## 📝 总结

NestJS 提供了灵活而强大的数据库集成方案：

- 🎯 **TypeORM**：功能全面，适合复杂企业应用
- 🔄 **Sequelize**：传统 ORM，熟悉的 API 风格
- 🍃 **Mongoose**：MongoDB 的最佳选择
- 💎 **Prisma**：现代化 ORM，最佳开发体验

选择适合你项目的方案，遵循最佳实践，就能构建出高效、可维护的数据库层！

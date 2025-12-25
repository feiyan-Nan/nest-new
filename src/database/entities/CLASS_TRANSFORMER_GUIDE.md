# class-transformer 装饰器完整指南

> 用于在 TypeORM 实体上控制序列化/反序列化行为

## 📦 安装

```bash
pnpm add class-transformer class-validator
```

## 📋 目录

1. [暴露/排除装饰器](#暴露排除装饰器)
2. [转换装饰器](#转换装饰器)
3. [类型转换](#类型转换)
4. [分组和版本控制](#分组和版本控制)
5. [实际应用场景](#实际应用场景)

---

## 暴露/排除装饰器

### 1. `@Exclude()`

**作用**：序列化时排除此属性

```typescript
import { Exclude } from 'class-transformer';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  email: string;

  @Column({ select: false })
  @Exclude()  // 序列化时永不返回
  password: string;

  @Column()
  @Exclude()  // 敏感信息
  ssn: string;
}
```

**使用**：
```typescript
import { instanceToPlain } from 'class-transformer';

const user = await userRepository.findOne({ where: { id: 1 } });
const response = instanceToPlain(user);
// { id: 1, email: 'test@example.com' }
// password 和 ssn 被排除
```

---

### 2. `@Expose()`

**作用**：仅暴露标记的属性（配合 `excludeExtraneousValues: true`）

```typescript
import { Expose } from 'class-transformer';

@Entity('users')
export class User {
  @Expose()  // 明确暴露
  @PrimaryGeneratedColumn()
  id: number;

  @Expose()
  @Column()
  username: string;

  @Expose()
  @Column()
  email: string;

  @Column()
  // 没有 @Expose()，在严格模式下会被排除
  internalNote: string;
}
```

**使用**：
```typescript
const plain = instanceToPlain(user, {
  excludeExtraneousValues: true  // 只暴露有 @Expose() 的属性
});
// { id: 1, username: 'john', email: 'john@example.com' }
```

---

### 3. `@Expose()` 重命名属性

**作用**：序列化时使用不同的名称

```typescript
@Entity('users')
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  @Expose({ name: 'fullName' })  // 序列化为 fullName
  name: string;

  @Column()
  @Expose({ name: 'user_email' })  // 序列化为 user_email
  email: string;
}
```

**使用**：
```typescript
const plain = instanceToPlain(user);
// { id: 1, fullName: 'John Doe', user_email: 'john@example.com' }
```

---

## 转换装饰器

### 4. `@Transform()`

**作用**：自定义属性的转换逻辑

```typescript
import { Transform } from 'class-transformer';

@Entity('products')
export class Product {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  @Transform(({ value }) => parseFloat(value), { toClassOnly: true })
  @Transform(({ value }) => value.toFixed(2), { toPlainOnly: true })
  price: number;

  @Column()
  @Transform(({ value }) => value.toUpperCase(), { toPlainOnly: true })
  sku: string;

  @CreateDateColumn()
  @Transform(({ value }) => value.toISOString(), { toPlainOnly: true })
  createdAt: Date;

  @Column({ type: 'simple-array' })
  @Transform(({ value }) => value.join(', '), { toPlainOnly: true })
  tags: string[];
}
```

**选项**：
- `toClassOnly: true` - 仅在反序列化时应用（plain to class）
- `toPlainOnly: true` - 仅在序列化时应用（class to plain）

**使用**：
```typescript
const product = await productRepository.findOne({ where: { id: 1 } });
const plain = instanceToPlain(product);
// {
//   id: 1,
//   name: 'Product',
//   price: '99.99',
//   sku: 'PRD-123',  // 转为大写
//   createdAt: '2024-12-24T08:00:00.000Z',
//   tags: 'tag1, tag2, tag3'  // 数组转为字符串
// }
```

---

### 5. `@Type()`

**作用**：指定属性的类型（用于嵌套对象）

```typescript
import { Type } from 'class-transformer';

@Entity('products')
export class Product {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'json' })
  @Type(() => ProductMetadata)  // 嵌套类型
  metadata: ProductMetadata;

  @CreateDateColumn()
  @Type(() => Date)  // 确保转为 Date 对象
  createdAt: Date;

  @Column({ type: 'simple-json' })
  @Type(() => Dimensions)
  dimensions: Dimensions;
}

class ProductMetadata {
  @Expose()
  manufacturer: string;

  @Expose()
  @Transform(({ value }) => value.toUpperCase())
  countryCode: string;
}

class Dimensions {
  width: number;
  height: number;
  depth: number;

  @Expose()
  get volume(): number {
    return this.width * this.height * this.depth;
  }
}
```

---

## 类型转换

### 6. 常用类型转换示例

```typescript
import { Transform, Type } from 'class-transformer';

@Entity('users')
export class User {
  // 布尔值转换
  @Column({ type: 'boolean' })
  @Transform(({ value }) => Boolean(value))
  isActive: boolean;

  // 数字转换
  @Column({ type: 'int' })
  @Transform(({ value }) => parseInt(value, 10), { toClassOnly: true })
  age: number;

  // 日期格式化
  @CreateDateColumn()
  @Transform(({ value }) => {
    const date = new Date(value);
    return date.toLocaleDateString('zh-CN');
  }, { toPlainOnly: true })
  createdAt: Date;

  // JSON 字符串解析
  @Column({ type: 'text' })
  @Transform(({ value }) => {
    try {
      return JSON.parse(value);
    } catch {
      return null;
    }
  }, { toClassOnly: true })
  settings: Record<string, any>;

  // 数组过滤
  @Column({ type: 'simple-array' })
  @Transform(({ value }) => value.filter(Boolean), { toPlainOnly: true })
  tags: string[];

  // 敏感信息脱敏
  @Column()
  @Transform(({ value }) => {
    if (!value) return null;
    return value.replace(/(\d{3})\d{4}(\d{4})/, '$1****$2');
  }, { toPlainOnly: true })
  phone: string;

  // 空值处理
  @Column({ nullable: true })
  @Transform(({ value }) => value ?? 'N/A', { toPlainOnly: true })
  description: string | null;
}
```

---

## 分组和版本控制

### 7. `@Expose()` 分组

**作用**：根据不同场景暴露不同属性

```typescript
import { Expose } from 'class-transformer';

@Entity('users')
export class User {
  @Expose({ groups: ['public', 'admin', 'owner'] })
  @PrimaryGeneratedColumn()
  id: number;

  @Expose({ groups: ['public', 'admin', 'owner'] })
  @Column()
  username: string;

  @Expose({ groups: ['owner'] })  // 仅所有者可见
  @Column()
  email: string;

  @Expose({ groups: ['admin', 'owner'] })  // 管理员和所有者可见
  @Column()
  phone: string;

  @Expose({ groups: ['admin'] })  // 仅管理员可见
  @Column({ type: 'boolean' })
  isVerified: boolean;

  @Column()
  @Exclude()  // 永不暴露
  password: string;

  @Expose({ groups: ['admin'] })
  @CreateDateColumn()
  createdAt: Date;
}
```

**使用**：
```typescript
const user = await userRepository.findOne({ where: { id: 1 } });

// 公开视图
const publicView = instanceToPlain(user, { groups: ['public'] });
// { id: 1, username: 'john' }

// 所有者视图
const ownerView = instanceToPlain(user, { groups: ['owner'] });
// { id: 1, username: 'john', email: 'john@example.com', phone: '1234567890' }

// 管理员视图
const adminView = instanceToPlain(user, { groups: ['admin'] });
// { id: 1, username: 'john', phone: '1234567890', isVerified: true, createdAt: '...' }
```

---

### 8. `@Expose()` 版本控制

**作用**：API 版本控制

```typescript
@Entity('products')
export class Product {
  @Expose({ since: 1.0 })  // v1.0+
  @PrimaryGeneratedColumn()
  id: number;

  @Expose({ since: 1.0 })
  @Column()
  name: string;

  @Expose({ since: 2.0 })  // v2.0+ 新增
  @Column()
  slug: string;

  @Expose({ since: 1.0, until: 2.0 })  // v1.0 - v2.0（已废弃）
  @Column()
  oldPrice: number;

  @Expose({ since: 2.0 })  // v2.0+ 替代 oldPrice
  @Column()
  price: number;
}
```

**使用**：
```typescript
// API v1.0
const v1 = instanceToPlain(product, { version: 1.0 });
// { id: 1, name: 'Product', oldPrice: 99.99 }

// API v2.0
const v2 = instanceToPlain(product, { version: 2.0 });
// { id: 1, name: 'Product', slug: 'product', price: 99.99 }
```

---

## 实际应用场景

### 场景 1: API 响应格式化

```typescript
import { Exclude, Expose, Transform } from 'class-transformer';

@Entity('users')
export class User {
  @Expose()
  @PrimaryGeneratedColumn()
  id: number;

  @Expose()
  @Column()
  username: string;

  @Expose({ name: 'displayName' })
  @Column()
  name: string;

  @Expose()
  @Column()
  email: string;

  @Exclude()  // 永不返回密码
  @Column({ select: false })
  password: string;

  @Expose()
  @Column({ type: 'boolean' })
  isActive: boolean;

  @Expose()
  @Transform(({ value }) => value.toISOString())
  @CreateDateColumn()
  createdAt: Date;

  @Exclude()  // 内部字段
  @Column()
  internalNotes: string;

  // 虚拟属性（不在数据库中）
  @Expose()
  get fullInfo(): string {
    return `${this.username} (${this.email})`;
  }
}
```

**在 Controller 中使用**：
```typescript
import { instanceToPlain, plainToInstance } from 'class-transformer';

@Controller('users')
export class UserController {
  @Get(':id')
  async getUser(@Param('id') id: number) {
    const user = await this.userRepository.findOne({ where: { id } });

    // 自动排除 @Exclude() 的字段
    return instanceToPlain(user, {
      excludeExtraneousValues: true  // 只返回 @Expose() 的字段
    });
  }

  @Post()
  async createUser(@Body() dto: CreateUserDto) {
    // DTO 转实体
    const user = plainToInstance(User, dto);
    return await this.userRepository.save(user);
  }
}
```

---

### 场景 2: 嵌套对象转换

```typescript
import { Type, Transform } from 'class-transformer';

class Address {
  street: string;
  city: string;
  zipCode: string;

  @Expose()
  get fullAddress(): string {
    return `${this.street}, ${this.city} ${this.zipCode}`;
  }
}

@Entity('orders')
export class Order {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'json' })
  @Type(() => Address)  // 嵌套类型转换
  shippingAddress: Address;

  @Column({ type: 'json' })
  @Transform(({ value }) => {
    return value.map(item => ({
      ...item,
      total: item.price * item.quantity
    }));
  }, { toPlainOnly: true })
  items: Array<{ name: string; price: number; quantity: number }>;
}
```

---

### 场景 3: 条件暴露

```typescript
import { Expose, Transform } from 'class-transformer';

@Entity('products')
export class Product {
  @Expose()
  @PrimaryGeneratedColumn()
  id: number;

  @Expose()
  @Column()
  name: string;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  price: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  cost: number | null;

  // 根据条件决定是否暴露
  @Expose()
  @Transform(({ obj }) => {
    // 仅当有成本时计算利润
    if (obj.cost !== null && obj.cost !== undefined) {
      return ((obj.price - obj.cost) / obj.price * 100).toFixed(2) + '%';
    }
    return null;
  })
  profitMargin: string | null;

  // 折扣价（如果有促销）
  @Expose()
  @Transform(({ obj }) => {
    return obj.discountPercent
      ? obj.price * (1 - obj.discountPercent / 100)
      : null;
  })
  discountedPrice: number | null;

  @Column({ type: 'int', nullable: true })
  discountPercent: number | null;
}
```

---

## 配置选项

### NestJS 全局配置

```typescript
// main.ts
import { ClassSerializerInterceptor, ValidationPipe } from '@nestjs/common';
import { Reflector } from '@nestjs/core';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // 全局启用 class-transformer
  app.useGlobalInterceptors(
    new ClassSerializerInterceptor(app.get(Reflector), {
      excludeExtraneousValues: true,  // 仅暴露 @Expose()
      enableImplicitConversion: true,  // 启用隐式类型转换
      exposeDefaultValues: true,       // 暴露默认值
    })
  );

  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,  // 自动转换类型
      whitelist: true,  // 移除未定义的属性
    })
  );

  await app.listen(3000);
}
```

---

## 常用转换选项

```typescript
import { instanceToPlain, plainToInstance } from 'class-transformer';

// class to plain (实体 -> JSON)
const json = instanceToPlain(user, {
  excludeExtraneousValues: true,  // 只包含 @Expose()
  excludePrefixes: ['_'],         // 排除以 _ 开头的属性
  groups: ['public'],             // 指定分组
  version: 1.0,                   // 指定版本
  enableCircularCheck: true,      // 检测循环引用
});

// plain to class (JSON -> 实体)
const user = plainToInstance(User, jsonData, {
  excludeExtraneousValues: true,  // 只包含 @Expose()
  enableImplicitConversion: true, // 启用隐式转换
  exposeDefaultValues: true,      // 使用默认值
});
```

---

## 最佳实践

### ✅ 推荐

1. **敏感信息使用 @Exclude()**
   ```typescript
   @Exclude()
   @Column({ select: false })
   password: string;
   ```

2. **使用分组控制不同场景**
   ```typescript
   @Expose({ groups: ['admin'] })
   internalData: string;
   ```

3. **嵌套对象使用 @Type()**
   ```typescript
   @Type(() => Address)
   address: Address;
   ```

4. **日期统一格式化**
   ```typescript
   @Transform(({ value }) => value.toISOString())
   createdAt: Date;
   ```

---

### ❌ 避免

1. **不要在 @Transform 中执行异步操作**
   ```typescript
   // ❌ 错误
   @Transform(async ({ value }) => await fetchData(value))

   // ✅ 正确：在保存前处理
   ```

2. **不要过度使用转换**
   ```typescript
   // ❌ 复杂逻辑应该在 Service 层
   @Transform(({ obj }) => {
     // 100行复杂逻辑...
   })
   ```

---

## 相关资源

- [class-transformer GitHub](https://github.com/typestack/class-transformer)
- [NestJS Serialization](https://docs.nestjs.com/techniques/serialization)
- [class-validator](https://github.com/typestack/class-validator)

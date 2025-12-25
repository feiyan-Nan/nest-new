# TypeORM 实体装饰器完整指南

> 本指南通过 `example-product.entity.ts` 示例实体展示所有常用 TypeORM 装饰器

## 📋 目录

1. [实体装饰器](#实体装饰器)
2. [列装饰器](#列装饰器)
3. [索引和约束](#索引和约束)
4. [特殊列](#特殊列)
5. [生命周期钩子](#生命周期钩子)
6. [最佳实践](#最佳实践)

---

## 实体装饰器

### `@Entity(tableName?: string)`

**作用**: 标记类为数据库实体

**示例**:
```typescript
@Entity('example_products')  // 表名: example_products
export class ExampleProduct {}
```

**注意**: 如果不指定表名，默认使用类名的小写形式

---

## 列装饰器

### 1. `@PrimaryGeneratedColumn(options?)`

**作用**: 自增主键

**选项**:
```typescript
@PrimaryGeneratedColumn({
  type: 'int',          // 数据类型: int, bigint
  unsigned: true,       // 无符号数（只允许正数）
  comment: '主键ID',    // 字段注释
  name: 'custom_id',    // 自定义列名（可选）
})
id: number;
```

**变体**:
- `@PrimaryGeneratedColumn('uuid')` - UUID 主键
- `@PrimaryColumn()` - 非自增主键

---

### 2. `@Column(options?)`

**作用**: 普通列定义

**常用选项**:

| 选项 | 类型 | 说明 | 示例 |
|------|------|------|------|
| `type` | string | 数据类型 | `'varchar'`, `'int'`, `'text'` |
| `length` | number | 字符串长度 | `100` |
| `nullable` | boolean | 是否允许 NULL | `true` |
| `unique` | boolean | 是否唯一 | `true` |
| `default` | any | 默认值 | `0`, `true`, `'draft'` |
| `select` | boolean | 查询时是否默认选择 | `false` |
| `comment` | string | 字段注释 | `'用户名'` |
| `unsigned` | boolean | 无符号（仅数字） | `true` |
| `precision` | number | 数字总位数 | `10` |
| `scale` | number | 小数位数 | `2` |
| `enum` | enum/array | 枚举值 | `ProductStatus` |

**示例**:

#### 字符串类型
```typescript
@Column({
  type: 'varchar',
  length: 200,
  nullable: false,
  comment: 'product_name',
})
name: string;

@Column({
  type: 'text',        // 长文本
  nullable: true,
})
description: string | null;
```

#### 数字类型
```typescript
// 整数
@Column({
  type: 'int',
  unsigned: true,      // 无符号整数
  default: 0,
})
stock: number;

// 精确小数（价格、金额）
@Column({
  type: 'decimal',
  precision: 10,       // 总位数
  scale: 2,           // 小数位数 (最大 99999999.99)
  unsigned: true,
})
price: number;
```

#### 布尔类型
```typescript
@Column({
  type: 'boolean',
  default: true,
})
isActive: boolean;
```

#### 枚举类型
```typescript
enum Status {
  DRAFT = 'draft',
  PUBLISHED = 'published',
}

@Column({
  type: 'enum',
  enum: Status,
  default: Status.DRAFT,
})
status: Status;
```

#### 数组类型
```typescript
// simple-array: 存储为 'a,b,c'
@Column({
  type: 'simple-array',
  nullable: true,
})
colors: string[] | null;
```

#### JSON 类型
```typescript
// json: 原生 JSON 类型
@Column({
  type: 'json',
  nullable: true,
})
metadata: Record<string, any> | null;

// simple-json: 字符串存储（兼容性更好）
@Column({
  type: 'simple-json',
  nullable: true,
})
config: { key: string } | null;
```

#### 隐藏字段
```typescript
@Column({
  type: 'varchar',
  length: 255,
  select: false,       // 查询时默认不返回
})
password: string;

// 需要时显式选择:
// repository.createQueryBuilder('user')
//   .addSelect('user.password')
//   .getOne()
```

---

### 3. `@Generated(strategy)`

**作用**: 自动生成值

**示例**:
```typescript
@Generated('uuid')
@Column()
uuid: string;

@Generated('increment')
@Column()
orderNumber: number;
```

---

## 特殊列

### 1. `@CreateDateColumn()`

**作用**: 自动记录创建时间

```typescript
@CreateDateColumn({
  type: 'timestamp',
  comment: 'created_time',
})
createdAt: Date;
```

---

### 2. `@UpdateDateColumn()`

**作用**: 自动更新时间（每次修改记录）

```typescript
@UpdateDateColumn({
  type: 'timestamp',
  comment: 'updated_time',
})
updatedAt: Date;
```

---

### 3. `@DeleteDateColumn()`

**作用**: 软删除标记（不真正删除记录）

```typescript
@DeleteDateColumn({
  type: 'timestamp',
  nullable: true,
})
deletedAt: Date | null;
```

**查询行为**:
- 正常查询自动排除已删除的记录
- 使用 `withDeleted()` 包含已删除记录
- 使用 `restore()` 恢复已删除记录

```typescript
// 排除已删除
await repository.find();

// 包含已删除
await repository.find({ withDeleted: true });

// 仅查询已删除
await repository
  .createQueryBuilder()
  .withDeleted()
  .where('deletedAt IS NOT NULL')
  .getMany();

// 恢复已删除
await repository.restore(id);
```

---

### 4. `@VersionColumn()`

**作用**: 乐观锁版本号（处理并发更新）

```typescript
@VersionColumn()
version: number;
```

**工作原理**:
```typescript
// 用户 A 读取: { id: 1, name: 'test', version: 1 }
// 用户 B 读取: { id: 1, name: 'test', version: 1 }

// 用户 A 更新成功: version 变为 2
await repository.save({ id: 1, name: 'A', version: 1 });

// 用户 B 更新失败: 抛出 OptimisticLockVersionMismatchError
await repository.save({ id: 1, name: 'B', version: 1 });
```

---

## 索引和约束

### 1. `@Index()`

**单列索引**:
```typescript
@Column()
@Index()  // 方式1: 装饰器
name: string;

@Entity()
@Index('idx_email', ['email'])  // 方式2: 类装饰器
export class User {}
```

**复合索引**:
```typescript
@Entity()
@Index(['name', 'status'])  // 复合索引
@Index('idx_category_date', ['categoryId', 'createdAt'])
export class Product {}
```

**何时使用索引**:
- ✅ 频繁作为查询条件的字段
- ✅ 经常用于排序的字段
- ✅ 外键字段（categoryId, userId 等）
- ❌ 很少查询的字段
- ❌ 频繁更新的字段

---

### 2. `@Unique()`

**唯一约束**:
```typescript
// 方式1: Column 选项
@Column({ unique: true })
email: string;

// 方式2: 类装饰器（支持复合唯一约束）
@Entity()
@Unique('uq_product_sku', ['sku'])
@Unique(['userId', 'productId'])  // 复合唯一
export class Product {}
```

---

## 生命周期钩子

### `@BeforeInsert()`

**插入前执行**:
```typescript
@BeforeInsert()
beforeInsertActions() {
  // 生成 slug
  this.slug = this.name.toLowerCase().replace(/\s+/g, '-');

  // 设置默认值
  if (!this.sku) {
    this.sku = `PRD-${Date.now()}`;
  }

  // 数据规范化
  if (this.name) {
    this.name = this.name.trim();
  }
}
```

---

### `@BeforeUpdate()`

**更新前执行**:
```typescript
@BeforeUpdate()
beforeUpdateActions() {
  // 数据验证
  if (this.price < 0) {
    this.price = 0;
  }

  // 业务逻辑
  if (this.stock === 0) {
    this.status = 'out_of_stock';
  }
}
```

---

### `@AfterLoad()`

**从数据库加载后执行**:
```typescript
discountPrice?: number;  // 计算属性（不存储）

@AfterLoad()
afterLoadActions() {
  // 计算派生属性
  this.discountPrice = this.price * 0.9;

  // 数据转换
  this.displayName = `${this.name} (${this.sku})`;
}
```

---

### 其他钩子

| 钩子 | 触发时机 |
|------|---------|
| `@AfterInsert()` | 插入后 |
| `@AfterUpdate()` | 更新后 |
| `@BeforeRemove()` | 删除前 |
| `@AfterRemove()` | 删除后 |
| `@BeforeSoftRemove()` | 软删除前 |
| `@AfterSoftRemove()` | 软删除后 |
| `@BeforeRecover()` | 恢复前 |
| `@AfterRecover()` | 恢复后 |

---

## 关联字段（不使用外键）

如果不希望使用数据库外键约束，只需存储 ID：

```typescript
/**
 * 分类 ID（不使用外键关系，仅存储 ID）
 */
@Column({
  type: 'int',
  unsigned: true,
  nullable: true,
  comment: 'category_id',
})
@Index()  // 添加索引提高查询性能
categoryId: number | null;

/**
 * 创建人 ID
 */
@Column({
  type: 'int',
  unsigned: true,
  nullable: true,
  comment: 'creator_id',
})
creatorId: number | null;
```

**优点**:
- ✅ 灵活性高，可以跨数据库关联
- ✅ 删除操作简单，不会被外键约束阻止
- ✅ 迁移和测试更容易

**缺点**:
- ❌ 没有数据库级别的完整性保证
- ❌ 需要在应用层处理关联逻辑

**查询关联数据**:
```typescript
// 手动关联查询
const product = await productRepository.findOne({ where: { id: 1 } });
if (product.categoryId) {
  const category = await categoryRepository.findOne({
    where: { id: product.categoryId }
  });
}

// 或使用 QueryBuilder
const products = await productRepository
  .createQueryBuilder('product')
  .leftJoinAndSelect(
    'category',
    'category',
    'category.id = product.categoryId'
  )
  .getMany();
```

---

## 最佳实践

### ✅ 推荐

1. **明确类型定义**
   ```typescript
   @Column({ nullable: true })
   description: string | null;  // 明确可为 null

   @Column({ nullable: false })
   name: string;  // 明确不可为 null
   ```

2. **合理使用索引**
   ```typescript
   // 频繁查询的字段
   @Column()
   @Index()
   email: string;

   // 联合查询的字段
   @Index(['userId', 'createdAt'])
   ```

3. **使用枚举而非魔术字符串**
   ```typescript
   // ✅ 推荐
   enum Status {
     DRAFT = 'draft',
     PUBLISHED = 'published',
   }
   @Column({ type: 'enum', enum: Status })
   status: Status;

   // ❌ 避免
   @Column()
   status: string;  // 'draft', 'published', 'archived'...
   ```

4. **金额使用 decimal**
   ```typescript
   // ✅ 推荐 - 精确
   @Column({ type: 'decimal', precision: 10, scale: 2 })
   price: number;

   // ❌ 避免 - 浮点数有精度问题
   @Column({ type: 'float' })
   price: number;
   ```

5. **添加字段注释**
   ```typescript
   @Column({ comment: 'product_name' })
   name: string;
   ```

6. **合理使用软删除**
   ```typescript
   // 需要保留历史记录的数据使用软删除
   @DeleteDateColumn()
   deletedAt: Date | null;
   ```

---

### ❌ 避免

1. **不要在钩子中执行异步操作**
   ```typescript
   // ❌ 钩子不支持 async
   @BeforeInsert()
   async beforeInsert() {
     this.data = await fetchData();
   }

   // ✅ 在保存前手动处理
   product.data = await fetchData();
   await repository.save(product);
   ```

2. **不要过度使用 JSON 列**
   ```typescript
   // ❌ 难以查询和索引
   @Column({ type: 'json' })
   allData: any;

   // ✅ 结构化存储
   @Column()
   name: string;

   @Column()
   price: number;
   ```

3. **不要忘记 unsigned**
   ```typescript
   // ✅ ID、数量、金额等永远为正
   @Column({ type: 'int', unsigned: true })
   stock: number;
   ```

---

## 常用数据类型对比

| TypeORM 类型 | MySQL 类型 | 使用场景 |
|-------------|-----------|---------|
| `varchar` | VARCHAR | 短文本（姓名、标题） |
| `text` | TEXT | 长文本（描述、内容） |
| `int` | INT | 整数（ID、数量） |
| `bigint` | BIGINT | 大整数（订单号） |
| `decimal` | DECIMAL | 精确小数（价格、金额） |
| `float` | FLOAT | 浮点数（评分） |
| `boolean` | TINYINT(1) | 布尔值 |
| `date` | DATE | 日期 |
| `time` | TIME | 时间 |
| `datetime` | DATETIME | 日期时间 |
| `timestamp` | TIMESTAMP | 时间戳 |
| `enum` | ENUM | 枚举值 |
| `json` | JSON | JSON 对象 |
| `simple-array` | VARCHAR | 简单数组 |

---

## 示例文件

- [example-product.entity.ts](./example-product.entity.ts) - 完整装饰器演示

---

## 相关资源

- [TypeORM 官方文档](https://typeorm.io/)
- [实体文档](https://typeorm.io/entities)
- [装饰器参考](https://typeorm.io/decorator-reference)

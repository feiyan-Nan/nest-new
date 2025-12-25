import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
  Index,
  Unique,
  VersionColumn,
  Generated,
  BeforeInsert,
  BeforeUpdate,
  AfterLoad,
} from 'typeorm';

/**
 * 产品状态枚举
 */
export enum ProductStatus {
  DRAFT = 'draft',
  PUBLISHED = 'published',
  ARCHIVED = 'archived',
}

/**
 * @Entity() - 标记为数据库实体
 * 参数: 表名（可选，默认使用类名小写）
 */
@Entity('example_products')
/**
 * @Index() - 创建数据库索引（类级别）
 * 提高查询性能，可以创建单列或复合索引
 */
@Index(['name', 'status']) // 复合索引
@Index('idx_sku', ['sku']) // 命名索引
/**
 * @Unique() - 唯一约束（类级别）
 * 确保指定列的值组合在表中唯一
 */
@Unique('uq_product_sku', ['sku'])
export class ExampleProduct {
  /**
   * @PrimaryGeneratedColumn() - 自增主键
   * type: 数据类型（int, bigint 等）
   * unsigned: 无符号数（只能为正数）
   * comment: 字段注释
   */
  @PrimaryGeneratedColumn({
    type: 'int',
    unsigned: true,
    comment: 'primary_key_id',
  })
  id: number;

  /**
   * @Generated('uuid') - 自动生成 UUID
   * 用于需要全局唯一标识符的场景
   */
  @Generated('uuid')
  @Column({ comment: 'uuid' })
  uuid: string;

  /**
   * @Column() - 普通列
   * length: 字符串长度限制
   * nullable: 是否允许为空（默认 false）
   * unique: 是否唯一（默认 false）
   * comment: 字段注释
   */
  @Column({
    type: 'varchar',
    length: 200,
    nullable: false,
    comment: 'product_name',
  })
  @Index() // 单列索引
  name: string;

  /**
   * type: 'text' - 长文本类型
   * nullable: true - 允许为空
   */
  @Column({
    type: 'text',
    nullable: true,
    comment: 'product_description',
  })
  description: string | null;

  /**
   * unique: true - 唯一约束
   * 商品 SKU 必须唯一
   */
  @Column({
    type: 'varchar',
    length: 50,
    unique: true,
    comment: 'product_sku',
  })
  sku: string;

  /**
   * type: 'decimal' - 精确小数类型
   * precision: 总位数
   * scale: 小数位数
   * 示例: precision=10, scale=2 表示最大 99999999.99
   */
  @Column({
    type: 'decimal',
    precision: 10,
    scale: 2,
    unsigned: true,
    default: 0,
    comment: 'product_price',
  })
  price: number;

  /**
   * type: 'int' - 整数类型
   * default: 默认值
   */
  @Column({
    type: 'int',
    unsigned: true,
    default: 0,
    comment: 'stock_quantity',
  })
  stock: number;

  /**
   * type: 'enum' - 枚举类型
   * enum: 枚举对象或数组
   * default: 默认值
   */
  @Column({
    type: 'enum',
    enum: ProductStatus,
    default: ProductStatus.DRAFT,
    comment: 'product_status',
  })
  status: ProductStatus;

  /**
   * type: 'boolean' - 布尔类型
   * 在 MySQL 中存储为 TINYINT(1)
   */
  @Column({
    type: 'boolean',
    default: true,
    comment: 'is_featured',
  })
  isFeatured: boolean;

  /**
   * type: 'simple-array' - 简单数组
   * 存储为逗号分隔的字符串，如: 'red,blue,green'
   */
  @Column({
    type: 'simple-array',
    nullable: true,
    comment: 'product_colors',
  })
  colors: string[] | null;

  /**
   * type: 'json' - JSON 类型
   * 存储复杂对象数据
   */
  @Column({
    type: 'json',
    nullable: true,
    comment: 'product_metadata',
  })
  metadata: Record<string, any> | null;

  /**
   * select: false - 查询时默认不返回此字段
   * 用于敏感信息或不常用的大字段
   * 需要时使用 .addSelect('product.internalNotes') 显式选择
   */
  @Column({
    type: 'text',
    nullable: true,
    select: false,
    comment: 'internal_notes',
  })
  internalNotes: string | null;

  /**
   * 分类 ID（不使用外键关系，仅存储 ID）
   */
  @Column({
    type: 'int',
    unsigned: true,
    nullable: true,
    comment: 'category_id',
  })
  @Index()
  categoryId: number | null;

  /**
   * 创建人 ID（不使用外键关系）
   */
  @Column({
    type: 'int',
    unsigned: true,
    nullable: true,
    comment: 'creator_id',
  })
  creatorId: number | null;

  /**
   * @CreateDateColumn() - 创建时间
   * 插入记录时自动设置为当前时间
   */
  @CreateDateColumn({
    type: 'timestamp',
    comment: 'created_time',
  })
  createdAt: Date;

  /**
   * @UpdateDateColumn() - 更新时间
   * 每次更新记录时自动设置为当前时间
   */
  @UpdateDateColumn({
    type: 'timestamp',
    comment: 'updated_time',
  })
  updatedAt: Date;

  /**
   * @DeleteDateColumn() - 软删除时间
   * 启用软删除功能，删除时只标记此字段而不真正删除记录
   * 查询时会自动排除已软删除的记录
   */
  @DeleteDateColumn({
    type: 'timestamp',
    nullable: true,
    comment: 'deleted_time',
  })
  deletedAt: Date | null;

  /**
   * @VersionColumn() - 乐观锁版本号
   * 每次更新时自动递增，用于处理并发更新冲突
   * 当保存时版本号不匹配，TypeORM 会抛出 OptimisticLockVersionMismatchError
   */
  @VersionColumn({
    comment: 'version_for_optimistic_lock',
  })
  version: number;

  /**
   * 计算属性（不存储在数据库中）
   * 通过 @AfterLoad 钩子计算
   */
  discountPrice?: number;
  displayName?: string;

  /**
   * @BeforeInsert() - 插入前钩子
   * 在实体插入数据库之前执行
   * 常用于设置默认值、生成 slug 等
   */
  @BeforeInsert()
  beforeInsertActions() {
    // 自动生成 SKU（如果未提供）
    if (!this.sku) {
      this.sku = `PRD-${Date.now()}-${Math.random().toString(36).substring(7)}`;
    }
    // 名称首字母大写
    if (this.name) {
      this.name = this.name.charAt(0).toUpperCase() + this.name.slice(1);
    }
  }

  /**
   * @BeforeUpdate() - 更新前钩子
   * 在实体更新数据库之前执行
   */
  @BeforeUpdate()
  beforeUpdateActions() {
    // 确保价格不为负数
    if (this.price < 0) {
      this.price = 0;
    }
    // 库存不足时自动下架
    if (this.stock === 0 && this.status === ProductStatus.PUBLISHED) {
      this.status = ProductStatus.DRAFT;
    }
  }

  /**
   * @AfterLoad() - 加载后钩子
   * 从数据库加载实体后执行
   * 可用于计算派生属性
   */
  @AfterLoad()
  afterLoadActions() {
    // 计算折扣价（打9折）
    if (this.price) {
      this.discountPrice = Number((this.price * 0.9).toFixed(2));
    }
    // 生成显示名称
    if (this.name && this.sku) {
      this.displayName = `${this.name} (${this.sku})`;
    }
  }

  /**
   * 自定义方法：判断是否有库存
   */
  hasStock(): boolean {
    return this.stock > 0;
  }

  /**
   * 自定义方法：判断是否已发布
   */
  isPublished(): boolean {
    return this.status === ProductStatus.PUBLISHED;
  }
}

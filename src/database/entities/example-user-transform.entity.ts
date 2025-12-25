import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Exclude, Expose, Transform, Type } from 'class-transformer';

/**
 * 地址类（嵌套对象示例）
 */
class Address {
  street: string;
  city: string;
  zipCode: string;

  @Expose()
  get fullAddress(): string {
    return `${this.street}, ${this.city} ${this.zipCode}`;
  }
}

/**
 * 用户实体 - 演示 class-transformer 装饰器
 */
@Entity('example_users')
export class ExampleUser {
  // ===== 基础字段 =====

  @Expose({ groups: ['public', 'admin', 'owner'] })
  @PrimaryGeneratedColumn({
    type: 'int',
    unsigned: true,
  })
  id: number;

  @Expose({ groups: ['public', 'admin', 'owner'] })
  @Column({
    type: 'varchar',
    length: 50,
    unique: true,
  })
  username: string;

  // ===== @Expose() 重命名示例 =====

  @Expose({
    name: 'displayName', // 序列化时使用 displayName
    groups: ['public', 'admin', 'owner'],
  })
  @Column({
    type: 'varchar',
    length: 100,
  })
  name: string;

  // ===== @Exclude() 排除敏感信息 =====

  @Exclude() // 序列化时永不返回
  @Column({
    type: 'varchar',
    length: 255,
    select: false,
  })
  password: string;

  // ===== 分组控制示例 =====

  @Expose({ groups: ['owner', 'admin'] }) // 仅所有者和管理员可见
  @Column({
    type: 'varchar',
    length: 100,
    unique: true,
  })
  email: string;

  @Expose({ groups: ['owner'] }) // 仅所有者可见
  @Transform(
    ({ value }) => {
      // 手机号脱敏
      if (!value) return null;
      return value.replace(/(\d{3})\d{4}(\d{4})/, '$1****$2');
    },
    { groups: ['admin'], toPlainOnly: true },
  )
  @Column({
    type: 'varchar',
    length: 20,
    nullable: true,
  })
  phone: string | null;

  // ===== @Transform() 转换示例 =====

  @Expose({ groups: ['public', 'admin', 'owner'] })
  @Transform(
    ({ value }) => {
      // 年龄计算（从生日）
      if (!value) return null;
      const today = new Date();
      const birthDate = new Date(value);
      let age = today.getFullYear() - birthDate.getFullYear();
      const m = today.getMonth() - birthDate.getMonth();
      if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
        age--;
      }
      return age;
    },
    { toPlainOnly: true },
  )
  @Column({
    type: 'date',
    nullable: true,
  })
  birthDate: Date | null;

  // ===== 枚举字段转换 =====

  @Expose({ groups: ['public', 'admin', 'owner'] })
  @Transform(
    ({ value }) => {
      // 状态中文化
      const statusMap = {
        active: '活跃',
        inactive: '未激活',
        banned: '已封禁',
      };
      return statusMap[value] || value;
    },
    { groups: ['public'], toPlainOnly: true },
  )
  @Column({
    type: 'enum',
    enum: ['active', 'inactive', 'banned'],
    default: 'inactive',
  })
  status: string;

  // ===== 布尔值转换 =====

  @Expose({ groups: ['admin'] })
  @Column({
    type: 'boolean',
    default: false,
  })
  isVerified: boolean;

  // ===== JSON 字段 + @Type() 示例 =====

  @Expose({ groups: ['owner'] })
  @Type(() => Address)
  @Column({
    type: 'json',
    nullable: true,
  })
  address: Address | null;

  // ===== 数组字段转换 =====

  @Expose({ groups: ['public', 'admin', 'owner'] })
  @Transform(
    ({ value }) => {
      // 序列化时转为逗号分隔的字符串
      return value ? value.join(', ') : '';
    },
    { toPlainOnly: true },
  )
  @Column({
    type: 'simple-array',
    nullable: true,
  })
  interests: string[] | null;

  // ===== 数字格式化 =====

  @Expose({ groups: ['owner', 'admin'] })
  @Transform(
    ({ value }) => {
      // 格式化为货币
      return value !== null && value !== undefined
        ? `$${value.toFixed(2)}`
        : '$0.00';
    },
    { toPlainOnly: true },
  )
  @Column({
    type: 'decimal',
    precision: 10,
    scale: 2,
    default: 0,
  })
  balance: number;

  // ===== 日期格式化 =====

  @Expose({ groups: ['public', 'admin', 'owner'] })
  @Transform(({ value }) => value?.toISOString(), { toPlainOnly: true })
  @CreateDateColumn({
    type: 'timestamp',
  })
  createdAt: Date;

  @Expose({ groups: ['admin', 'owner'] })
  @Transform(
    ({ value }) => {
      // 相对时间
      const now = new Date();
      const diff = now.getTime() - value.getTime();
      const minutes = Math.floor(diff / 60000);
      const hours = Math.floor(minutes / 60);
      const days = Math.floor(hours / 24);

      if (days > 0) return `${days}天前`;
      if (hours > 0) return `${hours}小时前`;
      if (minutes > 0) return `${minutes}分钟前`;
      return '刚刚';
    },
    { groups: ['public'], toPlainOnly: true },
  )
  @UpdateDateColumn({
    type: 'timestamp',
  })
  updatedAt: Date;

  // ===== 管理员专属字段 =====

  @Expose({ groups: ['admin'] })
  @Column({
    type: 'text',
    nullable: true,
  })
  adminNotes: string | null;

  @Expose({ groups: ['admin'] })
  @Column({
    type: 'varchar',
    length: 45,
    nullable: true,
  })
  lastLoginIp: string | null;

  @Expose({ groups: ['admin'] })
  @Transform(({ value }) => value?.toISOString(), { toPlainOnly: true })
  @Column({
    type: 'timestamp',
    nullable: true,
  })
  lastLoginAt: Date | null;

  // ===== 内部字段（永不暴露）=====

  @Exclude()
  @Column({
    type: 'text',
    nullable: true,
  })
  internalNotes: string | null;

  @Exclude()
  @Column({
    type: 'varchar',
    length: 255,
    nullable: true,
  })
  resetPasswordToken: string | null;

  // ===== 计算属性（虚拟字段）=====

  /**
   * 虚拟属性：完整信息
   * 不存储在数据库，仅序列化时返回
   */
  @Expose({ groups: ['admin'] })
  get fullInfo(): string {
    return `${this.username} (${this.email})`;
  }

  /**
   * 虚拟属性：账户状态描述
   */
  @Expose({ groups: ['owner'] })
  get accountStatus(): string {
    if (this.status === 'banned') return '账户已封禁';
    if (!this.isVerified) return '待验证';
    return '正常';
  }

  /**
   * 虚拟属性：是否成年
   */
  @Expose({ groups: ['admin'] })
  get isAdult(): boolean {
    if (!this.birthDate) return false;
    const age =
      new Date().getFullYear() - new Date(this.birthDate).getFullYear();
    return age >= 18;
  }
}

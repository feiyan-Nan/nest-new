/**
 * class-transformer 使用示例
 *
 * 展示如何在不同场景下使用 class-transformer 装饰器
 */

import { instanceToPlain, plainToInstance } from 'class-transformer';
import { ExampleUser } from './example-user-transform.entity';

// ===== 示例数据 =====
const mockUser = {
  id: 1,
  username: 'johndoe',
  name: 'John Doe',
  email: 'john@example.com',
  password: 'hashed_password_123',
  phone: '13812345678',
  birthDate: new Date('1990-05-15'),
  status: 'active',
  isVerified: true,
  address: {
    street: '123 Main St',
    city: 'Beijing',
    zipCode: '100000',
  },
  interests: ['coding', 'reading', 'gaming'],
  balance: 1234.56,
  createdAt: new Date('2024-01-01'),
  updatedAt: new Date('2024-12-20'),
  adminNotes: 'VIP user',
  lastLoginIp: '192.168.1.1',
  lastLoginAt: new Date('2024-12-24'),
  internalNotes: 'Internal note - should never be exposed',
  resetPasswordToken: 'secret_token_xyz',
} as any;

// ===== 场景 1: 公开 API（游客/普通用户）=====
console.log('=== 场景 1: 公开 API ===');
// 先将普通对象转换为类实例，需要指定 groups
const userInstance1 = plainToInstance(ExampleUser, mockUser, {
  groups: ['public', 'owner', 'admin'], // 包含所有 groups 以确保字段被正确复制
  excludeExtraneousValues: false,
});
const publicView = instanceToPlain(userInstance1, {
  groups: ['public'],
});
console.log(JSON.stringify(publicView, null, 2));
/**
 * 输出：
 * {
 *   "id": 1,
 *   "username": "johndoe",
 *   "displayName": "John Doe",  // 重命名
 *   "birthDate": 32,  // 转换为年龄
 *   "status": "活跃",  // 中文化
 *   "interests": "coding, reading, gaming",  // 数组转字符串
 *   "createdAt": "2024-01-01T00:00:00.000Z",
 *   "updatedAt": "4天前"  // 相对时间
 * }
 *
 * 注意：password, email, phone, adminNotes 等都被排除
 */

// ===== 场景 2: 用户自己的资料（所有者）=====
console.log('\n=== 场景 2: 所有者视图 ===');
const userInstance2 = plainToInstance(ExampleUser, mockUser, {
  groups: ['public', 'owner', 'admin'],
  excludeExtraneousValues: false,
});
const ownerView = instanceToPlain(userInstance2, {
  groups: ['owner'],
});
console.log(JSON.stringify(ownerView, null, 2));
/**
 * 输出：
 * {
 *   "id": 1,
 *   "username": "johndoe",
 *   "displayName": "John Doe",
 *   "email": "john@example.com",  // ✅ 可见
 *   "phone": "13812345678",  // ✅ 完整手机号（所有者可见）
 *   "birthDate": 32,
 *   "status": "活跃",
 *   "address": {
 *     "street": "123 Main St",
 *     "city": "Beijing",
 *     "zipCode": "100000",
 *     "fullAddress": "123 Main St, Beijing 100000"  // 计算属性
 *   },
 *   "interests": "coding, reading, gaming",
 *   "balance": "$1234.56",  // ✅ 格式化为货币
 *   "createdAt": "2024-01-01T00:00:00.000Z",
 *   "updatedAt": "2024-12-20T00:00:00.000Z",
 *   "accountStatus": "正常"  // 虚拟属性
 * }
 *
 * 注意：password, adminNotes, internalNotes 仍被排除
 */

// ===== 场景 3: 管理员后台 =====
console.log('\n=== 场景 3: 管理员视图 ===');
const userInstance3 = plainToInstance(ExampleUser, mockUser, {
  groups: ['public', 'owner', 'admin'],
  excludeExtraneousValues: false,
});
const adminView = instanceToPlain(userInstance3, {
  groups: ['admin'],
});
console.log(JSON.stringify(adminView, null, 2));
/**
 * 输出：
 * {
 *   "id": 1,
 *   "username": "johndoe",
 *   "displayName": "John Doe",
 *   "email": "john@example.com",
 *   "phone": "138****5678",  // ❗ 脱敏（管理员看到脱敏版）
 *   "birthDate": 32,
 *   "status": "active",  // 原始值（不中文化）
 *   "isVerified": true,  // ✅ 管理员可见
 *   "balance": "$1234.56",
 *   "createdAt": "2024-01-01T00:00:00.000Z",
 *   "updatedAt": "2024-12-20T00:00:00.000Z",
 *   "adminNotes": "VIP user",  // ✅ 管理员备注
 *   "lastLoginIp": "192.168.1.1",  // ✅ 登录信息
 *   "lastLoginAt": "2024-12-24T00:00:00.000Z",
 *   "fullInfo": "johndoe (john@example.com)",  // 虚拟属性
 *   "isAdult": true  // 虚拟属性
 * }
 *
 * 注意：password, internalNotes, resetPasswordToken 仍被排除
 */

// ===== 场景 4: 严格模式（仅暴露 @Expose()）=====
console.log('\n=== 场景 4: 严格模式 ===');
const userInstance4 = plainToInstance(ExampleUser, mockUser, {
  groups: ['public', 'owner', 'admin'],
  excludeExtraneousValues: false,
});
const strictView = instanceToPlain(userInstance4, {
  excludeExtraneousValues: true, // 只包含 @Expose() 的字段
  groups: ['public'],
});
console.log(JSON.stringify(strictView, null, 2));
/**
 * 输出：只包含明确标记 @Expose() 的字段
 */

// ===== 场景 5: 反序列化（JSON -> 类实例）=====
console.log('\n=== 场景 5: 反序列化 ===');
const jsonData = {
  username: 'newuser',
  name: 'New User',
  email: 'new@example.com',
  password: 'plaintext_password', // 应该在保存前哈希
  birthDate: '1995-03-20',
  status: 'inactive',
  address: {
    street: '456 Oak Ave',
    city: 'Shanghai',
    zipCode: '200000',
  },
};

const userInstance = plainToInstance(ExampleUser, jsonData, {
  groups: ['public', 'owner', 'admin'], // 添加 groups 以正确反序列化
  excludeExtraneousValues: false,
});

console.log('User instance created:', {
  username: userInstance.username,
  name: userInstance.name,
  email: userInstance.email,
  birthDate: userInstance.birthDate, // 自动转为 Date 对象
  address: userInstance.address, // 自动转为 Address 类实例
});

// ===== 场景 6: 批量转换 =====
console.log('\n=== 场景 6: 批量转换 ===');
const users = [mockUser, mockUser, mockUser];
const publicList = users.map((user) =>
  instanceToPlain(
    plainToInstance(ExampleUser, user, {
      groups: ['public', 'owner', 'admin'],
      excludeExtraneousValues: false,
    }),
    { groups: ['public'] },
  ),
);
console.log(`Converted ${publicList.length} users`);

// ===== 场景 7: 在 NestJS Controller 中使用 =====
console.log('\n=== 场景 7: NestJS Controller 示例 ===');
/**
 * // user.controller.ts
 * import { Controller, Get, Param, UseInterceptors, ClassSerializerInterceptor } from '@nestjs/common';
 * import { instanceToPlain } from 'class-transformer';
 *
 * @Controller('users')
 * export class UserController {
 *   constructor(private userRepository: Repository<ExampleUser>) {}
 *
 *   // 方式 1: 手动转换
 *   @Get(':id/public')
 *   async getPublicProfile(@Param('id') id: number) {
 *     const user = await this.userRepository.findOne({ where: { id } });
 *     return instanceToPlain(user, { groups: ['public'] });
 *   }
 *
 *   // 方式 2: 使用拦截器（推荐）
 *   @Get(':id')
 *   @UseInterceptors(ClassSerializerInterceptor)
 *   @SerializeOptions({ groups: ['public'] })  // 需要安装 @nestjs/common
 *   async getUser(@Param('id') id: number) {
 *     return await this.userRepository.findOne({ where: { id } });
 *     // 拦截器会自动应用 class-transformer
 *   }
 *
 *   // 方式 3: 根据用户角色动态选择分组
 *   @Get(':id/profile')
 *   async getUserProfile(@Param('id') id: number, @CurrentUser() currentUser: User) {
 *     const user = await this.userRepository.findOne({ where: { id } });
 *
 *     let groups: string[];
 *     if (currentUser.id === user.id) {
 *       groups = ['owner'];  // 用户本人
 *     } else if (currentUser.isAdmin) {
 *       groups = ['admin'];  // 管理员
 *     } else {
 *       groups = ['public'];  // 其他用户
 *     }
 *
 *     return instanceToPlain(user, { groups });
 *   }
 * }
 */

// ===== 场景 8: 嵌套对象和计算属性 =====
console.log('\n=== 场景 8: 嵌套对象 ===');
const userInstance8 = plainToInstance(ExampleUser, mockUser, {
  groups: ['public', 'owner', 'admin'],
  excludeExtraneousValues: false,
});
const userWithAddress = instanceToPlain(userInstance8, { groups: ['owner'] });
console.log('Address:', userWithAddress.address);
/**
 * 输出：
 * {
 *   "street": "123 Main St",
 *   "city": "Beijing",
 *   "zipCode": "100000",
 *   "fullAddress": "123 Main St, Beijing 100000"  // 计算属性
 * }
 */

// ===== 使用提示 =====
console.log('\n=== 使用提示 ===');
console.log(`
1. @Exclude() - 永不暴露的字段（密码、令牌等）
2. @Expose({ groups: [...] }) - 根据角色/场景控制可见性
3. @Transform() - 自定义字段转换逻辑
4. @Type(() => Class) - 嵌套对象类型转换
5. 虚拟属性（get accessor）- 计算属性，不存储在数据库

最佳实践：
- 敏感信息必须 @Exclude()
- 使用分组而非多个实体类
- 转换逻辑尽量简单，复杂逻辑放 Service
- 在 Controller 层统一应用转换
- 使用 ClassSerializerInterceptor 自动化
`);

export {};

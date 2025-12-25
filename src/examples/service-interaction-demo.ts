/**
 * 同一模块内 Service 相互调用示例
 */
import { Injectable, Module } from '@nestjs/common';

// ===== 场景 1: 单向依赖（A → B）=====
@Injectable()
export class LoggerService {
  log(message: string) {
    console.log(`[LOG] ${new Date().toISOString()}: ${message}`);
  }
}

@Injectable()
export class AuthService {
  constructor(private logger: LoggerService) {} // ✅ 注入 LoggerService

  login(username: string) {
    this.logger.log(`User ${username} logged in`); // ✅ 调用
    return { token: 'abc123', username };
  }
}

// ===== 场景 2: 链式依赖（A → B → C）=====
@Injectable()
export class CacheService {
  private cache = new Map<string, any>();

  set(key: string, value: any) {
    this.cache.set(key, value);
  }

  get(key: string) {
    return this.cache.get(key);
  }
}

@Injectable()
export class DatabaseService {
  constructor(
    private cache: CacheService,
    private logger: LoggerService,
  ) {} // ✅ 注入多个 service

  async findUser(id: number) {
    const cacheKey = `user:${id}`;
    const cached = this.cache.get(cacheKey);

    if (cached) {
      this.logger.log(`Cache hit for user ${id}`);
      return cached;
    }

    this.logger.log(`Fetching user ${id} from database`);
    const user = { id, name: 'John Doe' };
    this.cache.set(cacheKey, user);
    return user;
  }
}

@Injectable()
export class UserBusinessService {
  constructor(
    private db: DatabaseService,
    private auth: AuthService,
    private logger: LoggerService,
  ) {} // ✅ 可以注入所有同模块的 service

  async getUserProfile(id: number, username: string) {
    this.logger.log(`Getting profile for user ${id}`);

    // 调用 AuthService
    const authResult = this.auth.login(username);

    // 调用 DatabaseService（内部会调用 CacheService 和 LoggerService）
    const user = await this.db.findUser(id);

    return { ...user, ...authResult };
  }
}

// ===== 场景 3: 多个 Service 互相协作 =====
@Injectable()
export class ValidationService {
  validateEmail(email: string): boolean {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  }
}

@Injectable()
export class NotificationService {
  constructor(private logger: LoggerService) {}

  sendEmail(email: string, subject: string) {
    this.logger.log(`Sending email to ${email}: ${subject}`);
    return { sent: true, email, subject };
  }
}

@Injectable()
export class RegistrationService {
  constructor(
    private validation: ValidationService,
    private notification: NotificationService,
    private logger: LoggerService,
  ) {}

  async register(email: string, password: string) {
    this.logger.log(`Registration attempt for ${email}`);

    // 验证邮箱
    if (!this.validation.validateEmail(email)) {
      throw new Error('Invalid email');
    }

    // 注册逻辑...
    const user = { id: Date.now(), email };

    // 发送通知
    await this.notification.sendEmail(email, 'Welcome!');

    return user;
  }
}

// ===== Module 配置 =====
@Module({
  providers: [
    // ✅ 所有 service 都在同一个 providers 数组中
    LoggerService,
    CacheService,
    DatabaseService,
    AuthService,
    UserBusinessService,
    ValidationService,
    NotificationService,
    RegistrationService,
  ],
})
export class ServiceInteractionModule {}

// ===== 使用示例 =====
export async function demonstrateServiceInteraction() {
  // 在实际应用中，NestJS 会自动注入
  // 这里手动创建实例来演示
  const logger = new LoggerService();
  const cache = new CacheService();
  const validation = new ValidationService();
  const notification = new NotificationService(logger);
  const auth = new AuthService(logger);
  const db = new DatabaseService(cache, logger);
  const userBusiness = new UserBusinessService(db, auth, logger);
  const registration = new RegistrationService(
    validation,
    notification,
    logger,
  );

  console.log('=== 场景 1: UserBusinessService 调用多个 service ===');
  const profile = await userBusiness.getUserProfile(1, 'johndoe');
  console.log('Profile:', profile);

  console.log('\n=== 场景 2: RegistrationService 调用多个 service ===');
  const newUser = await registration.register('new@example.com', 'password123');
  console.log('New user:', newUser);
}

// 如果直接运行此文件
if (require.main === module) {
  demonstrateServiceInteraction().catch(console.error);
}

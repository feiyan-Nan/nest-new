import { Module } from '@nestjs/common';
import {
  BasicService,
  UserService,
  DatabaseConfig,
  APP_CONSTANTS,
} from './providers-demo.service';
import { ProvidersController } from './providers-demo.controller';

@Module({
  controllers: [ProvidersController],
  providers: [
    // ✅ 方式1: 标准类 Provider (最常用)
    BasicService,
    UserService,

    // ✅ 方式2: 使用 useClass (完整语法)
    {
      provide: 'CUSTOM_SERVICE',
      useClass: BasicService,
    },

    // ✅ 方式3: 使用 useValue (注入常量/配置对象)
    {
      provide: 'APP_CONFIG',
      useValue: APP_CONSTANTS,
    },

    // ✅ 方式4: 使用 useFactory (工厂函数)
    {
      provide: 'DATABASE_CONFIG',
      useFactory: () => {
        // 工厂函数可以执行复杂逻辑
        const host = process.env.DB_HOST || 'localhost';
        const port = process.env.DB_PORT
          ? parseInt(process.env.DB_PORT, 10)
          : 54324;
        return { host, port };
      },
    },

    // ✅ 方式5: 使用 useExisting (别名)
    {
      provide: 'BASIC_SERVICE_ALIAS',
      useExisting: BasicService,
    },
  ],
})
export class ProvidersModule {}

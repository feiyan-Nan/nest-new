import { Controller, Get, Inject } from '@nestjs/common';
import { BasicService, UserService } from './providers-demo.service';
import { AppConfigService } from '../config/app-config.service';

@Controller('providers-demo')
export class ProvidersController {
  constructor(
    // 方式1: 直接注入类 (最常用)
    private readonly basicService: BasicService,
    private readonly userService: UserService,
    private readonly appConfigService: AppConfigService,

    // 方式2: 使用 @Inject 注入自定义 token
    @Inject('APP_CONFIG')
    private readonly appConfig: {
      maxRetries: number;
      timeout: number;
      apiVersion: string;
    },

    @Inject('DATABASE_CONFIG')
    private readonly dbConfig: { host: string; port: number },

    @Inject('CUSTOM_SERVICE')
    private readonly customService: BasicService,
  ) {}

  @Get('basic')
  getBasic() {
    return {
      message: this.basicService.getMessage(),
      config: this.appConfigService.jwt,
    };
  }

  @Get('users')
  getUsers() {
    return this.userService.getUsers();
  }

  @Get('config')
  getConfig() {
    return {
      appConfig: this.appConfig,
      dbConfig: {
        host: this.dbConfig.host,
        port: this.dbConfig.port,
      },
    };
  }

  @Get('custom')
  getCustom() {
    return {
      message: this.customService.getMessage(),
      note: 'This uses CUSTOM_SERVICE token',
    };
  }
}

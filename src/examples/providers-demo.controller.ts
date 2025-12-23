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
      Level: {
        Two: {
          Birthday: '生日礼',
          Abandonedcart: '弃单召回',
          All: '全部',
          Anniversary: '周年庆',
          B2B: 'B2B',
          Black: {
            Friday: '黑色星期五',
          },
          Christmas: '圣诞节',
          Clothing: '服饰美妆',
          Confirmation: '确认邮件',
          Electronics: '3C数码',
          Home: '家居用品',
          Hot: '热销产品',
          Lost: '流失客户',
          Loyal: '忠诚客户',
          Member: '会员日',
          New: '产品上新',
          Other: '其他',
          Popular: '热门主题',
          Review: '邀请评价',
          Seasonal: {
            promotions: '季节促销',
          },
          Thanksgiving: '感恩节',
          Valentine: '情人节',
          Weekend: '周末促销',
          Welcome: '欢迎邮件',
          conversion: '促进转化',
          countdown: '活动倒计时',
          newYear: '新年',
          repeat: '促进复购',
          review: '邀请评价',
          shopping: {
            festival: '电商购物节',
          },
        },
        One: {
          Automationtemplate: '自动化模板',
          Automationtemplates: '自动化邮件',
          Blank: '基础排版',
          Category: '经营品类',
          Daily: '日常主题',
          Holiday: '节日',
          Lifecycleemail: '生命周期邮件',
          Promotion: '促销',
          Recommend: '推荐',
        },
      },
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

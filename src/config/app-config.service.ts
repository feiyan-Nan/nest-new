import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  IAppConfig,
  IDatabaseConfig,
  IJwtConfig,
  IApiConfig,
  ICorsConfig,
  ICompressionConfig,
  IScheduleConfig,
  ISwaggerConfig,
  IRedisConfig,
  IMongoDBConfig,
} from './configs';

@Injectable()
export class AppConfigService {
  constructor(private configService: ConfigService) {}

  get app(): IAppConfig {
    return this.configService.get<IAppConfig>('app')!;
  }

  get database(): IDatabaseConfig {
    return this.configService.get<IDatabaseConfig>('database')!;
  }

  get jwt(): IJwtConfig {
    return this.configService.get<IJwtConfig>('jwt')!;
  }

  get api(): IApiConfig {
    return this.configService.get<IApiConfig>('api')!;
  }

  get cors(): ICorsConfig {
    return this.configService.get<ICorsConfig>('cors')!;
  }

  get compression(): ICompressionConfig {
    return this.configService.get<ICompressionConfig>('compression')!;
  }

  get schedule(): IScheduleConfig {
    return this.configService.get<IScheduleConfig>('schedule')!;
  }

  get swagger(): ISwaggerConfig {
    return this.configService.get<ISwaggerConfig>('swagger')!;
  }

  get redis(): IRedisConfig {
    return this.configService.get<IRedisConfig>('redis')!;
  }

  get mongodb(): IMongoDBConfig {
    return this.configService.get<IMongoDBConfig>('mongodb')!;
  }
}

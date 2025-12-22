import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { IConfiguration } from './configuration.interface';

@Injectable()
export class AppConfigService {
  constructor(private configService: ConfigService<IConfiguration>) {}

  get app() {
    return {
      nodeEnv: this.configService.get('app.nodeEnv', { infer: true })!,
      port: this.configService.get('app.port', { infer: true })!,
    };
  }

  get database() {
    return {
      host: this.configService.get('database.host', { infer: true })!,
      port: this.configService.get('database.port', { infer: true })!,
      username: this.configService.get('database.username', { infer: true })!,
      password: this.configService.get('database.password', { infer: true })!,
      database: this.configService.get('database.database', { infer: true })!,
    };
  }

  get jwt() {
    return {
      secret: this.configService.get('jwt.secret', { infer: true })!,
      expiresIn: this.configService.get('jwt.expiresIn', { infer: true })!,
    };
  }

  get api() {
    return {
      prefix: this.configService.get('api.prefix', { infer: true })!,
      version: this.configService.get('api.version', { infer: true })!,
    };
  }
}

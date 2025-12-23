import { Injectable } from '@nestjs/common';

// 1. 基础 Service Provider
@Injectable()
export class BasicService {
  getMessage(): string {
    return 'Hello from BasicService';
  }
}

// 2. 带依赖的 Service
@Injectable()
export class UserService {
  constructor(private basicService: BasicService) {}

  getUsers() {
    return [
      { id: 1, name: 'Alice', message: this.basicService.getMessage() },
      { id: 2, name: 'Bob', message: this.basicService.getMessage() },
    ];
  }
}

// 3. 工厂类
export class DatabaseConfig {
  constructor(
    public host: string,
    public port: number,
  ) {}
}

// 4. 常量 Provider
export const APP_CONSTANTS = {
  maxRetries: 3,
  timeout: 5000,
  apiVersion: 'v1',
};

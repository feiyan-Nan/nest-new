# Swagger API 文档使用指南

## 概述

项目已集成 Swagger (OpenAPI 3.0) API 文档，提供可视化的 API 文档界面和交互式 API 测试功能。

## 访问地址

- **Swagger UI**: http://localhost:3000/docs
- **Swagger JSON**: http://localhost:3000/docs-json

## 配置

### 配置文件

Swagger 配置通过 YAML 文件管理，支持以下配置项：

```yaml
# config/common.yml 或 config.development.yml
swagger:
  enabled: true         # 是否启用 Swagger
  title: NestJS API     # API 标题
  description: API Documentation  # API 描述
  version: '1.0'        # API 版本
  path: docs            # Swagger 访问路径
```

### 生产环境建议

生产环境中建议禁用 Swagger 以避免暴露接口细节：

```yaml
# config.production.yml
swagger:
  enabled: false        # 生产环境关闭
```

## 使用方法

### 1. 基本装饰器

在控制器和路由方法上使用装饰器：

```typescript
import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';

@ApiTags('App')  // 为控制器分组
@Controller()
export class AppController {
  @Get()
  @ApiOperation({ summary: '获取Hello信息' })
  @ApiResponse({ status: 200, description: '返回Hello消息' })
  @ApiResponse({ status: 500, description: '服务器错误' })
  getHello(): string {
    return 'Hello World';
  }
}
```

### 2. DTO 文档

使用 `@ApiProperty` 装饰器为 DTO 属性添加文档：

```typescript
import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsEmail, IsNumber } from 'class-validator';

export class CreateUserDto {
  @ApiProperty({
    description: '用户姓名',
    example: '张三',
  })
  @IsString()
  name: string;

  @ApiProperty({
    description: '用户邮箱',
    example: 'zhangsan@example.com',
  })
  @IsEmail()
  email: string;

  @ApiProperty({
    description: '用户年龄',
    example: 25,
    minimum: 0,
    maximum: 120,
  })
  @IsNumber()
  age: number;
}
```

### 3. 常用装饰器

| 装饰器 | 用途 | 示例 |
|--------|------|------|
| `@ApiTags()` | 为控制器分组 | `@ApiTags('Users')` |
| `@ApiOperation()` | 接口描述 | `@ApiOperation({ summary: '创建用户' })` |
| `@ApiResponse()` | 响应描述 | `@ApiResponse({ status: 201, description: '创建成功' })` |
| `@ApiProperty()` | DTO 属性文档 | `@ApiProperty({ description: '用户名' })` |
| `@ApiBody()` | 请求体文档 | `@ApiBody({ type: CreateUserDto })` |
| `@ApiParam()` | 路径参数文档 | `@ApiParam({ name: 'id', description: '用户ID' })` |
| `@ApiQuery()` | 查询参数文档 | `@ApiQuery({ name: 'page', description: '页码' })` |
| `@ApiBearerAuth()` | JWT 认证 | `@ApiBearerAuth()` |
| `@ApiSecurity()` | 其他安全方案 | `@ApiSecurity('basic')` |

### 4. 完整示例

```typescript
import { Controller, Get, Post, Body, Param } from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiBody,
} from '@nestjs/swagger';
import { CreateUserDto, UserResponseDto } from './dto/user.dto';

@ApiTags('Users')
@Controller('users')
export class UsersController {
  @Post()
  @ApiOperation({ summary: '创建用户' })
  @ApiBody({ type: CreateUserDto })
  @ApiResponse({
    status: 201,
    description: '用户创建成功',
    type: UserResponseDto,
  })
  create(@Body() createUserDto: CreateUserDto): UserResponseDto {
    // 实现代码
  }

  @Get(':id')
  @ApiOperation({ summary: '获取用户信息' })
  @ApiParam({ name: 'id', description: '用户ID' })
  @ApiResponse({
    status: 200,
    description: '返回用户信息',
    type: UserResponseDto,
  })
  @ApiResponse({ status: 404, description: '用户不存在' })
  findOne(@Param('id') id: string): UserResponseDto {
    // 实现代码
  }
}
```

## 功能特性

### 1. API 测试

Swagger UI 提供交互式 API 测试功能：
- 点击任意接口
- 点击 "Try it out"
- 输入参数或认证信息
- 点击 "Execute" 执行请求
- 查看响应结果

### 2. 认证支持

项目已配置 Bearer Token 认证：
- 点击右上角 "Authorize" 按钮
- 输入 `Bearer <your-token>`
- 所有需要认证的接口将自动携带 Token

### 3. 响应模型

使用 `type` 属性定义响应模型：

```typescript
@ApiResponse({
  status: 200,
  description: '用户信息',
  type: UserResponseDto,
})
```

### 4. 错误响应

为接口添加错误响应文档：

```typescript
@ApiResponse({ status: 400, description: '参数错误' })
@ApiResponse({ status: 401, description: '未授权' })
@ApiResponse({ status: 403, description: '禁止访问' })
@ApiResponse({ status: 404, description: '资源不存在' })
@ApiResponse({ status: 500, description: '服务器错误' })
```

## 示例 DTO

项目中提供了完整的 DTO 示例：`src/common/dto/example.dto.ts`

包含：
- `CreateUserDto` - 创建用户 DTO
- `UpdateUserDto` - 更新用户 DTO
- `UserResponseDto` - 用户响应 DTO

每个 DTO 都包含完整的 Swagger 文档和验证装饰器。

## 最佳实践

1. **保持文档更新**：修改接口时同步更新 Swagger 文档
2. **使用中文注释**：接口描述尽量使用中文，提高可读性
3. **提供示例值**：为每个属性提供 `example` 值
4. **分类管理**：使用 `@ApiTags` 为接口合理分组
5. **完整响应**：为每个接口文档化可能的响应状态
6. **生产环境关闭**：生产环境应禁用 Swagger

## 常见问题

### Q: 如何隐藏敏感接口？

```typescript
@ApiExcludeEndpoint()
@Get('secret')
secretEndpoint() {
  // 此接口不会出现在 Swagger 文档中
}
```

### Q: 如何自定义 Swagger 配置？

修改 `src/main.ts` 中的 `DocumentBuilder` 配置：

```typescript
const documentConfig = new DocumentBuilder()
  .setTitle('我的API')
  .setDescription('API描述')
  .setVersion('1.0')
  .setContact('联系人', 'url', 'email')
  .setLicense('许可证', 'url')
  .addTag('标签')
  .addServer('http://localhost:3000', '开发环境')
  .addServer('https://api.example.com', '生产环境')
  .build();
```

## 参考资料

- [NestJS Swagger 官方文档](https://docs.nestjs.com/openapi/introduction)
- [OpenAPI 3.0 规范](https://swagger.io/specification/)
- [Swagger UI 文档](https://swagger.io/tools/swagger-ui/)

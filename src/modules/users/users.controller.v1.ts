import { Controller, Get, Param, Version } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { Public } from '@/modules/auth/decorators/public.decorator';

export interface UserV1 {
  id: number;
  name: string;
  email: string;
}

@ApiTags('Users V1')
@Controller({
  path: 'users',
  version: '1',
})
export class UsersV1Controller {
  @Public()
  @Get()
  @Version('v1')
  @ApiOperation({ summary: 'Get users (V1)' })
  @ApiResponse({
    status: 200,
    description: 'Returns users with ID, name and email',
    type: 'object',
  })
  findAll(): UserV1[] {
    return [
      { id: 1, name: '张三', email: 'zhangsan@example.com' },
      { id: 2, name: '李四', email: 'lisi@example.com' },
    ];
  }

  @Public()
  @Get(':id')
  @Version('1')
  @ApiOperation({ summary: 'Get user by ID (V1)' })
  @ApiResponse({
    status: 200,
    description: 'Returns a single user with ID, name and email',
  })
  findOne(@Param('id') id: string): UserV1 {
    console.log(`🚀 ~ findOne ~ id: `, id);
    return { id: Number(id), name: '张三', email: 'zhangsan@example.com' };
  }
}

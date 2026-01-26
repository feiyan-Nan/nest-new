import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { Public } from '@/modules/auth/decorators/public.decorator';

export interface UserV2 {
  id: number;
  fullName: string;
  email: string;
  avatar?: string;
  phone?: string;
}

@ApiTags('Users V2')
@Controller('v2/users')
export class UsersV2Controller {
  @Public()
  @Get()
  @ApiOperation({ summary: 'Get users (V2)' })
  @ApiResponse({
    status: 200,
    description: 'Returns users with extended fields (fullName, avatar, phone)',
    type: 'object',
  })
  findAll(): UserV2[] {
    return [
      {
        id: 1,
        fullName: '张三',
        email: 'zhangsan@example.com',
        avatar: 'https://example.com/avatar1.jpg',
        phone: '13800138000',
      },
      {
        id: 2,
        fullName: '李四',
        email: 'lisi@example.com',
        avatar: 'https://example.com/avatar2.jpg',
        phone: '13800138001',
      },
    ];
  }

  @Public()
  @Get(':id')
  @ApiOperation({ summary: 'Get user by ID (V2)' })
  @ApiResponse({
    status: 200,
    description: 'Returns a single user with extended fields',
  })
  findOne(id: string): UserV2 {
    return {
      id: Number(id),
      fullName: '张三',
      email: 'zhangsan@example.com',
      avatar: 'https://example.com/avatar1.jpg',
      phone: '13800138000',
    };
  }
}
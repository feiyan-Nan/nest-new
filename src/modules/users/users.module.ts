import { Module } from '@nestjs/common';
import { UsersV1Controller } from './users.controller.v1';
import { UsersV2Controller } from './users.controller.v2';

@Module({
  controllers: [UsersV1Controller, UsersV2Controller],
})
export class UsersModule {}
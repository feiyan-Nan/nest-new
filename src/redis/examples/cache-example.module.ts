import { Module } from '@nestjs/common';
import { CacheExampleController } from './cache-example.controller';
import { CacheExampleService } from './cache-example.service';

@Module({
  controllers: [CacheExampleController],
  providers: [CacheExampleService],
})
export class CacheExampleModule {}

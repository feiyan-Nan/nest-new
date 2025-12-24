import { Global, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DatabaseConfigService } from './database-config.service';
import { UserRepository } from './repositories/user.repository';
import { User } from './entities';

@Global()
@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      useClass: DatabaseConfigService,
    }),
    TypeOrmModule.forFeature([User]),
  ],
  providers: [DatabaseConfigService, UserRepository],
  exports: [DatabaseConfigService, UserRepository],
})
export class DatabaseModule {}

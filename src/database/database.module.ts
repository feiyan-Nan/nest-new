import { Global, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DatabaseConfigService } from './database-config.service';
import { UserRepository } from './repositories/user.repository';
import { RefreshTokenRepository } from './repositories/refresh-token.repository';
import { User, RefreshToken } from './entities';

@Global()
@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      useClass: DatabaseConfigService,
    }),
    TypeOrmModule.forFeature([User, RefreshToken]),
  ],
  providers: [DatabaseConfigService, UserRepository, RefreshTokenRepository],
  exports: [DatabaseConfigService, UserRepository, RefreshTokenRepository],
})
export class DatabaseModule {}

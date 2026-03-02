import { Global, Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { MongoDBConfigService } from './mongodb-config.service';
import { Log, LogSchema } from './schemas/log.schema';
import { LogService } from './log.service';

@Global()
@Module({
  imports: [
    MongooseModule.forRootAsync({
      useClass: MongoDBConfigService,
    }),
    MongooseModule.forFeature([{ name: Log.name, schema: LogSchema }]),
  ],
  providers: [LogService],
  exports: [LogService],
})
export class MongoDBModule {}

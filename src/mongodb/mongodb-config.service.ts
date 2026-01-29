import { Injectable } from '@nestjs/common';
import {
  MongooseModuleOptions,
  MongooseOptionsFactory,
} from '@nestjs/mongoose';
import { AppConfigService } from '../config/app-config.service';

@Injectable()
export class MongoDBConfigService implements MongooseOptionsFactory {
  constructor(private configService: AppConfigService) {}

  createMongooseOptions(): MongooseModuleOptions {
    const mongoConfig = this.configService.mongodb;

    return {
      uri: mongoConfig.uri,
      dbName: mongoConfig.dbName,
      maxPoolSize: mongoConfig.maxPoolSize,
      minPoolSize: mongoConfig.minPoolSize,
      serverSelectionTimeoutMS: mongoConfig.serverSelectionTimeoutMS,
      socketTimeoutMS: mongoConfig.socketTimeoutMS,
      connectTimeoutMS: mongoConfig.connectTimeoutMS,
      retryWrites: mongoConfig.retryWrites,
      retryReads: mongoConfig.retryReads,
    };
  }
}

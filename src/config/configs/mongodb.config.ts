import { registerAs } from '@nestjs/config';
import { createNamespaceConfig } from '../yaml-loader';

export interface IMongoDBConfig {
  uri: string;
  dbName: string;
  useNewUrlParser: boolean;
  useUnifiedTopology: boolean;
  maxPoolSize: number;
  minPoolSize: number;
  serverSelectionTimeoutMS: number;
  socketTimeoutMS: number;
  connectTimeoutMS: number;
  retryWrites: boolean;
  retryReads: boolean;
}

export default registerAs('mongodb', (): IMongoDBConfig => {
  const getMongoConfig = createNamespaceConfig('mongodb');

  return {
    uri: getMongoConfig<string>('uri', 'mongodb://localhost:27017'),
    dbName: getMongoConfig<string>('dbName', 'nest_db'),
    useNewUrlParser: getMongoConfig<boolean>('useNewUrlParser', true),
    useUnifiedTopology: getMongoConfig<boolean>('useUnifiedTopology', true),
    maxPoolSize: getMongoConfig<number>('maxPoolSize', 10),
    minPoolSize: getMongoConfig<number>('minPoolSize', 2),
    serverSelectionTimeoutMS: getMongoConfig<number>('serverSelectionTimeoutMS', 5000),
    socketTimeoutMS: getMongoConfig<number>('socketTimeoutMS', 45000),
    connectTimeoutMS: getMongoConfig<number>('connectTimeoutMS', 10000),
    retryWrites: getMongoConfig<boolean>('retryWrites', true),
    retryReads: getMongoConfig<boolean>('retryReads', true),
  };
});

import { IConfiguration } from './configuration.interface';

export default (): IConfiguration => ({
  app: {
    nodeEnv: process.env.NODE_ENV || 'development',
    port: process.env.PORT ? parseInt(process.env.PORT, 10) : 3000,
  },
  database: {
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT ? parseInt(process.env.DB_PORT, 10) : 5432,
    username: process.env.DB_USERNAME || 'postgres',
    password: process.env.DB_PASSWORD || 'postgres',
    database: process.env.DB_DATABASE || 'nest_db',
  },
  jwt: {
    secret: process.env.JWT_SECRET || 'default-secret-key-change-in-production',
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  },
  api: {
    prefix: process.env.API_PREFIX || 'api',
    version: process.env.API_VERSION || 'v1',
  },
  cors: {
    enabled: process.env.CORS_ENABLED === 'true',
    origin: process.env.CORS_ORIGIN ? process.env.CORS_ORIGIN.split(',') : '*',
    methods: process.env.CORS_METHODS || 'GET,HEAD,PUT,PATCH,POST,DELETE',
    allowedHeaders: process.env.CORS_ALLOWED_HEADERS || '*',
    exposedHeaders: process.env.CORS_EXPOSED_HEADERS,
    credentials: process.env.CORS_CREDENTIALS === 'true',
    maxAge: process.env.CORS_MAX_AGE
      ? parseInt(process.env.CORS_MAX_AGE, 10)
      : 3600,
    includePaths: process.env.CORS_INCLUDE_PATHS
      ? process.env.CORS_INCLUDE_PATHS.split(',')
      : undefined,
    excludePaths: process.env.CORS_EXCLUDE_PATHS
      ? process.env.CORS_EXCLUDE_PATHS.split(',')
      : undefined,
  },
});

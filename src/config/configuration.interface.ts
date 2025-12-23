export interface IAppConfig {
  nodeEnv: string;
  port: number;
}

export interface IDatabaseConfig {
  host: string;
  port: number;
  username: string;
  password: string;
  database: string;
}

export interface IJwtConfig {
  secret: string;
  expiresIn: string;
}

export interface IApiConfig {
  prefix: string;
  version: string;
}

export interface ICorsConfig {
  enabled: boolean;
  origin: string | string[] | RegExp | RegExp[];
  methods?: string | string[];
  allowedHeaders?: string | string[];
  exposedHeaders?: string | string[];
  credentials?: boolean;
  /**
   * 浏览器可以缓存预检请求（OPTIONS）的结果多长时间
   * 单位：秒
   */
  maxAge?: number;
  includePaths?: string[];
  excludePaths?: string[];
}

export interface IConfiguration {
  app: IAppConfig;
  database: IDatabaseConfig;
  jwt: IJwtConfig;
  api: IApiConfig;
  cors: ICorsConfig;
}

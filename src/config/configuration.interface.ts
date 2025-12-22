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

export interface IConfiguration {
  app: IAppConfig;
  database: IDatabaseConfig;
  jwt: IJwtConfig;
  api: IApiConfig;
}

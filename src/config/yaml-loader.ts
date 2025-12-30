import { readFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import * as yaml from 'js-yaml';
import merge from 'lodash.merge';

type ConfigValue = Record<string, unknown>;

let config: ConfigValue | null = null;

/**
 * 加载单个 YAML 配置文件
 * @param filePath 文件路径
 * @returns 配置对象，如果文件不存在则返回 null
 */
function loadYamlFile(filePath: string): ConfigValue | null {
  if (!existsSync(filePath)) {
    return null;
  }

  const fileContents = readFileSync(filePath, 'utf8');
  return yaml.load(fileContents) as ConfigValue;
}

/**
 * 获取配置文件路径
 * 默认使用 development 环境，可通过 NODE_ENV 环境变量指定
 */
function getConfigPath(): string {
  const env = process.env.NODE_ENV || 'development';
  const cwd = process.cwd();
  const envConfigPath = join(cwd, `config.${env}.yml`);

  if (existsSync(envConfigPath)) {
    console.log(`Loading config from: config.${env}.yml`);
    return envConfigPath;
  }

  throw new Error(
    `Configuration file 'config.${env}.yml' not found.\n` +
      `Please create it or check your NODE_ENV environment variable.\n` +
      `Available environments: development, production, test`,
  );
}

/**
 * 加载 YAML 配置文件（支持公共配置合并）
 * 使用 lodash.merge 进行深度合并，支持数组深度合并
 */
export function loadYaml(): ConfigValue {
  if (config) return config;

  const cwd = process.cwd();
  const commonConfigPath = join(cwd, 'config.common.yml');

  // 加载公共配置
  const commonConfig = loadYamlFile(commonConfigPath);
  if (commonConfig) {
    console.log('Loading common config from: config.common.yml');
  }

  // 加载环境配置
  const configPath = getConfigPath();
  const envConfig = loadYamlFile(configPath);

  // 使用 lodash.merge 合并配置：环境配置会覆盖公共配置
  if (commonConfig && envConfig) {
    config = merge({}, commonConfig, envConfig);
    console.log('Merged common config with environment config');
  } else if (envConfig) {
    config = envConfig;
  } else if (commonConfig) {
    config = commonConfig;
  } else {
    throw new Error('No configuration file found');
  }

  return config;
}

/**
 * 获取配置值
 * @param path 配置路径，如 'app.port' 或 'database.host'
 * @param defaultValue 默认值
 */
export function getConfig<T = unknown>(path: string, defaultValue?: T): T {
  const cfg = loadYaml();
  const keys = path.split('.');
  let value: unknown = cfg;

  for (const key of keys) {
    if (value && typeof value === 'object' && key in value) {
      value = (value as Record<string, unknown>)[key];
    } else {
      return defaultValue as T;
    }
  }

  if (value === undefined || value === null) {
    return defaultValue as T;
  }

  return value as T;
}

/**
 * 创建命名空间配置获取器
 * @param namespace 命名空间，如 'api', 'database', 'app' 等
 * @returns 配置获取函数
 *
 * @example
 * ```typescript
 * const getApiConfig = createNamespaceConfig('api');
 * const prefix = getApiConfig<string>('prefix', 'api');
 * ```
 */
export function createNamespaceConfig(namespace: string) {
  return <T>(key: string, defaultValue?: T): T =>
    getConfig<T>(`${namespace}.${key}`, defaultValue);
}

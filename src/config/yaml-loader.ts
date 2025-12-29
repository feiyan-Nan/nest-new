import { readFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import * as yaml from 'js-yaml';

type ConfigValue = Record<string, unknown>;

let config: ConfigValue | null = null;

/**
 * 获取配置文件路径
 */
function getConfigPath(): string {
  const env = process.env.RUNNING_ENV;
  const cwd = process.cwd();

  // 如果设置了 RUNNING_ENV，尝试加载对应的配置文件
  if (env) {
    const envConfigPath = join(cwd, `config.${env}.yml`);
    if (existsSync(envConfigPath)) {
      console.log(`Loading config from: config.${env}.yml`);
      return envConfigPath;
    }
    console.warn(
      `Config file config.${env}.yml not found, falling back to config.yml`,
    );
  }

  // 默认配置文件
  const defaultPath = join(cwd, 'config.yml');
  console.log('Loading config from: config.yml');
  return defaultPath;
}

/**
 * 加载 YAML 配置文件
 */
export function loadYaml(): ConfigValue {
  if (config) return config;

  const configPath = getConfigPath();
  const fileContents = readFileSync(configPath, 'utf8');
  config = yaml.load(fileContents) as ConfigValue;
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

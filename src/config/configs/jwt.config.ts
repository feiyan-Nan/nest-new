import { registerAs } from '@nestjs/config';
import { createNamespaceConfig } from '../yaml-loader';

export interface IJwtConfig {
  accessSecret: string;
  accessExpiresIn: string;
  refreshSecret: string;
  refreshExpiresIn: string;
}

export default registerAs('jwt', (): IJwtConfig => {
  const getJwtConfig = createNamespaceConfig('jwt');

  return {
    accessSecret: getJwtConfig<string>(
      'accessSecret',
      'default-access-secret-change-in-production',
    ),
    accessExpiresIn: getJwtConfig<string>('accessExpires', '15m'),
    refreshSecret: getJwtConfig<string>(
      'refreshSecret',
      'default-refresh-secret-change-in-production',
    ),
    refreshExpiresIn: getJwtConfig<string>('refreshExpires', '7d'),
  };
});

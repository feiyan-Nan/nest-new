import { registerAs } from '@nestjs/config';
import { createNamespaceConfig } from '../yaml-loader';

export interface IJwtConfig {
  secret: string;
  expiresIn: string;
}

export default registerAs('jwt', (): IJwtConfig => {
  const getJwtConfig = createNamespaceConfig('jwt');

  return {
    secret: getJwtConfig<string>(
      'secret',
      'default-secret-key-change-in-production',
    ),
    expiresIn: getJwtConfig<string>('expires', '7d'),
  };
});

import { registerAs } from '@nestjs/config';
import { getConfig } from '../yaml-loader';

export interface IJwtConfig {
  secret: string;
  expiresIn: string;
}

export default registerAs(
  'jwt',
  (): IJwtConfig => ({
    secret: getConfig<string>(
      'jwt.secret',
      'default-secret-key-change-in-production',
    ),
    expiresIn: getConfig<string>('jwt.expires', '7d'),
  }),
);

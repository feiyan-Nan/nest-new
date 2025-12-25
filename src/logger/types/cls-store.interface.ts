import { ClsStore } from 'nestjs-cls';

export interface RequestClsStore extends ClsStore {
  ip?: string;
  userAgent?: string;
  userId?: number;
  tenantId?: string;
}

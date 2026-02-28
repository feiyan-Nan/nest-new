import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type LogDocument = HydratedDocument<Log>;

@Schema({
  timestamps: true, // 自动添加 createdAt 和 updatedAt
  collection: 'logs', // 集合名称
})
export class Log {
  @Prop({ required: true, enum: ['info', 'warn', 'error'] })
  level: string; // 日志级别：info, warn, error

  @Prop({ required: true })
  message: string; // 日志消息

  @Prop({ type: Object })
  metadata?: Record<string, any>; // 额外的元数据

  @Prop()
  userId?: string; // 用户 ID（可选）

  @Prop()
  ip?: string; // IP 地址（可选）

  @Prop()
  userAgent?: string; // User Agent（可选）
}

export const LogSchema = SchemaFactory.createForClass(Log);

// 添加索引
LogSchema.index({ level: 1, createdAt: -1 });
LogSchema.index({ userId: 1 });

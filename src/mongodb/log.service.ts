import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Log, LogDocument } from './schemas/log.schema';

export interface CreateLogDto {
  level: string;
  message: string;
  metadata?: Record<string, any>;
  userId?: string;
  ip?: string;
  userAgent?: string;
}

@Injectable()
export class LogService {
  constructor(
    @InjectModel(Log.name) private logModel: Model<LogDocument>,
  ) {}

  /**
   * 创建日志
   */
  async create(createLogDto: CreateLogDto): Promise<Log> {
    const createdLog = new this.logModel(createLogDto);
    return createdLog.save();
  }

  /**
   * 查询所有日志（分页）
   */
  async findAll(page = 1, limit = 10): Promise<Log[]> {
    return this.logModel
      .find()
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .exec();
  }

  /**
   * 根据级别查询日志
   */
  async findByLevel(level: string): Promise<Log[]> {
    return this.logModel.find({ level }).sort({ createdAt: -1 }).exec();
  }

  /**
   * 根据用户 ID 查询日志
   */
  async findByUserId(userId: string): Promise<Log[]> {
    return this.logModel.find({ userId }).sort({ createdAt: -1 }).exec();
  }

  /**
   * 根据 ID 查询单条日志
   */
  async findOne(id: string): Promise<Log | null> {
    return this.logModel.findById(id).exec();
  }

  /**
   * 删除指定时间之前的日志
   */
  async deleteOldLogs(beforeDate: Date): Promise<number> {
    const result = await this.logModel
      .deleteMany({ createdAt: { $lt: beforeDate } })
      .exec();
    return result.deletedCount || 0;
  }

  /**
   * 统计日志数量
   */
  async count(filter: any = {}): Promise<number> {
    return this.logModel.countDocuments(filter).exec();
  }
}

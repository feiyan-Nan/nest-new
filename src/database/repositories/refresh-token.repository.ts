import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, LessThan } from 'typeorm';
import { RefreshToken } from '@/database/entities';

@Injectable()
export class RefreshTokenRepository {
  constructor(
    @InjectRepository(RefreshToken)
    private readonly repository: Repository<RefreshToken>,
  ) {}

  async findByToken(token: string): Promise<RefreshToken | null> {
    return this.repository.findOne({
      where: { token, isRevoked: false },
    });
  }

  async findByUserId(userId: number): Promise<RefreshToken[]> {
    return this.repository.find({
      where: { userId, isRevoked: false },
    });
  }

  async create(data: {
    token: string;
    userId: number;
    expiresAt: Date;
  }): Promise<RefreshToken> {
    const refreshToken = this.repository.create(data);
    return this.repository.save(refreshToken);
  }

  async revokeByToken(token: string): Promise<boolean> {
    const result = await this.repository.update({ token }, { isRevoked: true });
    return (result.affected ?? 0) > 0;
  }

  async revokeAllByUserId(userId: number): Promise<boolean> {
    const result = await this.repository.update(
      { userId, isRevoked: false },
      { isRevoked: true },
    );
    return (result.affected ?? 0) > 0;
  }

  async deleteExpired(): Promise<number> {
    const result = await this.repository.delete({
      expiresAt: LessThan(new Date()),
    });
    return result.affected ?? 0;
  }
}

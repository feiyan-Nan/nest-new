import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  Index,
} from 'typeorm';

@Entity('refresh_tokens')
@Index('idx_user_id', ['userId'])
@Index('idx_token', ['token'])
@Index('idx_expires_at', ['expiresAt'])
export class RefreshToken {
  @PrimaryGeneratedColumn({
    type: 'int',
    comment: 'Primary Key',
    unsigned: true,
  })
  id: number;

  @Column({ type: 'varchar', length: 500, unique: true })
  token: string;

  @Column({ type: 'int', unsigned: true, comment: 'User ID (no FK)' })
  userId: number;

  @Column({ type: 'timestamp' })
  expiresAt: Date;

  @Column({ type: 'boolean', default: false })
  isRevoked: boolean;

  @CreateDateColumn()
  createdAt: Date;
}

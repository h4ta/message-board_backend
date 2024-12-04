import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity()
export class TemporaryUser {
  @PrimaryGeneratedColumn()
  readonly id: number;

  @Column('varchar')
  name: string;

  @Column('varchar')
  hash: string;

  @Column('varchar')
  email: string;

  @Column('varchar')
  uuid: string;

  @CreateDateColumn()
  readonly created_at?: Date;

  @UpdateDateColumn()
  readonly updated_at?: Date;
}

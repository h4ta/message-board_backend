import { Module } from '@nestjs/common';
import { UserController } from './user.controller';
import { UserService } from './user.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from 'src/entities/user.entity';
import { Auth } from 'src/entities/auth';

@Module({
  imports: [TypeOrmModule.forFeature([User, Auth])],
  controllers: [UserController],
  providers: [UserService],
})
export class UserModule {}

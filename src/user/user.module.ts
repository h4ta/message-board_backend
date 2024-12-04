import { Module } from '@nestjs/common';
import { UserController } from './user.controller';
import { UserService } from './user.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from 'src/entities/user.entity';
import { Auth } from 'src/entities/auth';
import { TemporaryUser } from 'src/entities/temporaryUser.entity';
import { ScheduleModule } from '@nestjs/schedule';

@Module({
  imports: [
    TypeOrmModule.forFeature([User, Auth, TemporaryUser]),
    ScheduleModule.forRoot(),
  ],
  controllers: [UserController],
  providers: [UserService],
})
export class UserModule {}

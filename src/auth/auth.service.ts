import { Injectable, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Auth } from 'src/entities/auth';
import { User } from 'src/entities/user.entity';
import { Equal, Repository } from 'typeorm';
import * as crypto from 'crypto';
import exp from 'constants';
import e from 'express';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(Auth)
    private authRepository: Repository<Auth>,
  ) {}

  async getAuth(name: string, password: string) {
    if (!password) {
      throw new UnauthorizedException();
    }

    // ユーザーのソルトを取得
    const user = await this.userRepository.findOne({
      where: {
        name: Equal(name),
      },
    });
    const storedSalt = user.hash.split('.')[1];
    const storedHash = user.hash.split('.')[0];

    const hash = crypto
      .createHash('md5')
      .update(password + storedSalt)
      .digest('hex');

    if (storedHash !== hash) {
      throw new UnauthorizedException();
    }

    const ret = {
      token: '',
      user_id: user.id,
    };

    // 認証レコード作成
    var expire = new Date();
    expire.setDate(expire.getDate() + 1);
    const auth = await this.authRepository.findOne({
      where: {
        user_id: Equal(user.id),
      },
    });

    if (auth) {
      // 更新
      auth.expire_at = expire;
      await this.authRepository.save(auth);
      ret.token = auth.token;
    } else {
      // 挿入
      const token = crypto.randomUUID();
      const record = {
        user_id: user.id,
        token: token,
        expire_at: expire.toISOString(),
      };
      await this.authRepository.save(record);
      ret.token = token;
    }

    return ret;
  }
}

import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { randomBytes, createHash } from 'crypto';
import { Auth } from 'src/entities/auth';
import { TemporaryUser } from 'src/entities/temporaryUser.entity';
import { User } from 'src/entities/user.entity';
import { ErrorMessages } from 'src/types/Type';
import { Equal, LessThan, MoreThan, Repository } from 'typeorm';
import { createTransport } from 'nodemailer';
import { v4 as uuidv4 } from 'uuid';
import { Cron } from '@nestjs/schedule';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(Auth)
    private authRepository: Repository<Auth>,
    @InjectRepository(TemporaryUser)
    private tempUserRepository: Repository<TemporaryUser>,
  ) {}

  // メール送信元アドレス、サーバーはmailslurpを利用
  transporter = createTransport({
    host: 'mxslurp.click',
    port: 2525,
    secure: false,
    requireTLS: false,
    tls: {
      rejectUnauthorized: false,
    },
    auth: {
      user: 'hVy1WugJjdhjH5czbidxP7wqSyAy4xOf',
      pass: 'vk13tmfJIUjZEMTeGSPHfc5IAafys0xn',
    },
  });

  async getUser(token: string, id: number) {
    const now = new Date();
    const auth = await this.authRepository.findOne({
      where: {
        token: Equal(token),
        expire_at: MoreThan(now),
      },
    });
    if (!auth) {
      throw new ForbiddenException();
    }

    const user = await this.userRepository.findOne({
      where: {
        id: Equal(id),
      },
    });
    if (!user) {
      throw new NotFoundException();
    }

    return user;
  }

  // ユーザー仮登録
  async createTemporaryUser(
    name: string,
    email: string,
    password: string,
  ): Promise<Array<ErrorMessages>> {
    const errorMessages: Array<ErrorMessages> = [];

    // name(id), emailの重複は許可しない
    if (await this.userRepository.findOneBy({ name })) {
      errorMessages.push('userId_duplicated');
    }
    if (await this.userRepository.findOneBy({ email })) {
      errorMessages.push('email_duplicated');
    }
    if (errorMessages.length !== 0) {
      return errorMessages;
    }

    const uuid = uuidv4(); // このUUIDを仮登録DB、登録案内メールに加えることでリンクさせる
    // 登録メールアドレスに本登録リンクが記載されたメールを送信
    try {
      await this.transporter.sendMail({
        from: 'user-ff661516-d01a-4b10-8c8e-6e5cee5fb56a@mailslurp.biz',
        to: email,
        subject: '本登録のお知らせ',
        html: `
        <p>${name}様</p>

        <div>以下のリンクをクリックして、本登録を完了してください。</div>
        <div>30分を過ぎるとリンクが無効となるため注意してください。</div>
        <a href='http://localhost:3001/registercomplete/?id=${uuid}'>http://localhost:3001/registercomplete/?id=${uuid}</a> `,
      });
    } catch (error) {
      console.log(error.message);

      errorMessages.push(error.message);
      return errorMessages;
    }

    // 仮登録DBに登録
    const salt = randomBytes(16).toString('hex');
    const hash = createHash('md5')
      .update(password + salt)
      .digest('hex'); // ソルトを加えハッシュ化
    const record = {
      name: name,
      email: email,
      hash: hash + '.' + salt, // saltもここに保存
      uuid: uuid,
    };
    this.tempUserRepository.save(record);

    return errorMessages; // 空配列が返される
  }

  // uuidを受け取り、それに紐づくuserが仮登録DBに存在するか確認する。存在した場合、そのユーザーを返す
  async checkExistTempUser(uuid: string): Promise<TemporaryUser> {
    const user = await this.tempUserRepository.findOne({
      where: {
        uuid: Equal(uuid),
      },
    });

    if (!user) {
      throw new NotFoundException();
    }

    return user;
  }

  // ユーザー本登録
  //仮登録DBからユーザーを探し、UserDBに移す
  async createUser(uuid: string) {
    const registerUser = await this.checkExistTempUser(uuid);

    // 本登録のUserDBに登録
    const record = {
      name: registerUser.name,
      email: registerUser.email,
      hash: registerUser.hash,
    };
    this.userRepository.save(record);

    //仮登録DBからは削除
    const qb = await this.tempUserRepository
      .createQueryBuilder('temporary_user')
      .delete()
      .where('temporary_user.uuid = :uuid', { uuid: uuid })
      .execute();

    return registerUser.name;
  }

  // パスワード再設定のメールを送信する
  async sendPassResetMail(email: string) {
    const user = await this.userRepository.findOne({
      where: {
        email: Equal(email),
      },
    });

    if (!user) {
      return; // メールアドレスが登録されているかはユーザー側には分からないようにする
    }

    const uuid = uuidv4(); // このUUIDを仮登録DB、再設定案内メールに加えることでリンクさせる
    // 登録メールアドレスに再設定リンクが記載されたメールを送信
    try {
      await this.transporter.sendMail({
        from: 'user-ff661516-d01a-4b10-8c8e-6e5cee5fb56a@mailslurp.biz',
        to: email,
        subject: 'パスワード再設定の案内',
        html: `
        <p>${user.name}様</p>

        <div>以下のリンクからパスワード再設定を行ってください。</div>
        <div>30分を過ぎるとリンクが無効となるため注意してください。</div>
        <a href='http://localhost:3001/reset/password/?id=${uuid}'>http://localhost:3001/reset/password/?id=${uuid}</a> `,
      });
    } catch (error) {
      console.log('メール送れませんでした');
      console.log(error.message);
      return;
    }

    // 再設定リンクのuuidと紐づけるため仮登録DBに登録
    const record = {
      name: user.name,
      email: email,
      hash: user.hash,
      uuid: uuid,
    };
    this.tempUserRepository.save(record);
  }

  // パスワードを再設定する
  async passReset(uuid: string, newPassword: string) {
    console.log(uuid);

    const user = await this.checkExistTempUser(uuid);
    console.log(user);

    // UserDBに登録されているパスワードを変更
    const salt = randomBytes(16).toString('hex');
    const newHash = createHash('md5')
      .update(newPassword + salt)
      .digest('hex');

    const qb = await this.userRepository
      .createQueryBuilder('user')
      .update()
      .set({ hash: newHash + '.' + salt })
      .where({ name: user.name })
      .execute();

    //仮登録DBからは削除
    await this.tempUserRepository
      .createQueryBuilder('temporary_user')
      .delete()
      .where('temporary_user.uuid = :uuid', { uuid: uuid })
      .execute();

    return user.name;
  }

  // 30分ごとに期限切れの仮登録ユーザーを削除する
  @Cron('0 */30 * * * * ')
  async deleteTempUser() {
    const stragePeriod = 30; // 仮登録ユーザー情報が残る時間を設定
    const deleteDate = new Date();
    deleteDate.setMinutes(deleteDate.getMinutes() - stragePeriod);

    const qb = await this.tempUserRepository
      .createQueryBuilder('temporary_user')
      .delete()
      .where({
        created_at: LessThan(deleteDate), // 実行時から、設定した保管期間以前のデータを削除
      })
      .execute();

    console.log(`仮登録DBの定期削除を行いました。${deleteDate}`);
  }
}

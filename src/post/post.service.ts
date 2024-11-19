import { ForbiddenException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Auth } from 'src/entities/auth';
import { MicroPost } from 'src/entities/microposts';
import { Equal, MoreThan, Repository } from 'typeorm';

@Injectable()
export class PostService {
  constructor(
    @InjectRepository(MicroPost)
    private microPostsRepository: Repository<MicroPost>,
    @InjectRepository(Auth)
    private authRepository: Repository<Auth>,
  ) {}

  async checkAuth(token: string): Promise<boolean> {
    const now = new Date();
    const auth = await this.authRepository.findOne({
      where: {
        token: Equal(token),
        expire_at: MoreThan(now),
      },
    });
    if (!auth) {
      return false;
    }

    return true;
  }

  async createPost(message: string, token: string) {
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

    const record = {
      user_id: auth.user_id,
      content: message,
    };
    await this.microPostsRepository.save(record);
  }

  async getList(token: string, start: number = 0, nr_records: number = 1) {
    // const now = new Date();
    // const auth = await this.authRepository.findOne({
    //   where: {
    //     token: Equal(token),
    //     expire_at: MoreThan(now),
    //   },
    // });
    // if (!auth) {
    //   throw new ForbiddenException();
    // }

    if (!this.checkAuth(token)) {
      throw new ForbiddenException();
    }

    const qb = await this.microPostsRepository
      .createQueryBuilder('micro_post')
      .leftJoinAndSelect('user', 'user', 'user.id=micro_post.user_id')
      .select([
        'micro_post.id as id',
        'user.id as user_id',
        'user.name as user_name',
        'micro_post.content as content',
        'micro_post.created_at as created_at',
      ])
      .orderBy('micro_post.created_at', 'DESC')
      .offset(start)
      .limit(nr_records);

    type ResultType = {
      id: number;
      user_id: number;
      content: string;
      user_name: string;
      created_at: Date;
    };
    const records = await qb.getRawMany<ResultType>();
    console.log(records);

    return records;
  }

  async deletePost(token: string, id: number) {
    if (!this.checkAuth(token)) {
      throw new ForbiddenException();
    }

    const qb = await this.microPostsRepository
      .createQueryBuilder('micro_post')
      .delete()
      .where('micro_post.id = :id', { id: id })
      .execute();
  }
}

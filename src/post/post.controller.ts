import { Body, Controller, Get, Post, Query } from '@nestjs/common';
import { PostService } from './post.service';

@Controller('post')
export class PostController {
  constructor(private readonly postService: PostService) {}

  @Post()
  async createPost(
    @Body('message') message: string,
    @Query('token') token: string,
  ) {
    return await this.postService.createPost(message, token);
  }

  @Get()
  async getList(
    @Query('token') token: string,
    @Query('start') start: number,
    @Query('records') records: number,
  ) {
    return await this.postService.getList(token, start, records);
  }
}

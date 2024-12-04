import { Body, Controller, Get, Param, Post, Query } from '@nestjs/common';
import { UserService } from './user.service';
import { ErrorMessages } from 'src/types/Type';

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post()
  async createTemporaryUser(
    @Body('name') name: string,
    @Body('email') email: string,
    @Body('password') password: string,
  ): Promise<Array<ErrorMessages>> {
    return await this.userService.createTemporaryUser(name, email, password);
  }

  @Get('')
  async createUser(@Query('id') id: string) {
    return await this.userService.createUser(id);
  }

  @Get('tempUser')
  async checkTempUserExist(@Query('id') id: string) {
    return await this.userService.checkExistTempUser(id);
  }

  @Get(':id')
  async getUser(@Param('id') id: number, @Query('token') token: string) {
    return await this.userService.getUser(token, id);
  }

  @Post('reset')
  async sendPassResetMail(@Body('email') email: string) {
    return await this.userService.sendPassResetMail(email);
  }

  @Post('reset/password/')
  async passReset(@Query('id') id: string, @Body('password') password: string) {
    return await this.userService.passReset(id, password);
  }
}
